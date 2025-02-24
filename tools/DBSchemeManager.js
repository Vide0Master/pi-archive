const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./storage/data.db');
const fs = require('fs').promises;
const cmd = (txt) => { require('../core/consoleLogger')(txt, [{ txt: 'DB', txtc: 'red', txtb: 'white' }]) };

// Helper function to execute SQL queries and handle errors
async function dbRun(sql) {
    return new Promise((resolve, reject) => {
        db.run(sql, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// Generate CREATE TABLE SQL from schema definition
function generateCreateTableSQL(tableName, tableDef) {
    const columns = [];
    for (const [colName, colDef] of Object.entries(tableDef.columns)) {
        const parts = [colName, colDef.type];
        if (colDef.primaryKey) parts.push('PRIMARY KEY');
        if (colDef.autoIncrement) parts.push('AUTOINCREMENT');
        if (colDef.notNull) parts.push('NOT NULL');
        if (colDef.unique) parts.push('UNIQUE');
        if (colDef.default !== undefined) parts.push(`DEFAULT "${colDef.default}"`);
        columns.push(parts.join(' '));
    }
    const options = [];
    if (tableDef.strict) options.push('STRICT');
    if (tableDef.withoutRowID) options.push('WITHOUT ROWID');
    return `CREATE TABLE ${tableName} (${columns.join(', ')}) ${options.join(' ')}`.trim();
}

// Generate INSERT statement for migrating data during table alteration
function generateInsertSQL(newTableName, tempTableName, newColumns, oldColumns) {
    const insertColumns = [];
    const selectColumns = [];
    for (const colName in newColumns) {
        insertColumns.push(colName);
        if (oldColumns[colName]) {
            selectColumns.push(colName);
        } else {
            selectColumns.push(newColumns[colName].default !== undefined ? newColumns[colName].default : 'NULL');
        }
    }
    return `INSERT INTO ${newTableName} (${insertColumns.join(', ')}) SELECT ${selectColumns.join(', ')} FROM ${tempTableName};`;
}

// Alter table by recreating it with new schema and migrating data
async function alterTable(tableName, newTableDef, currentTableDef) {
    const tempTableName = `sqlitestudio_temp_${tableName}`;
    const statements = [
        'PRAGMA foreign_keys = 0;',
        `CREATE TABLE ${tempTableName} AS SELECT * FROM ${tableName};`,
        `DROP TABLE ${tableName};`,
        generateCreateTableSQL(tableName, newTableDef),
        generateInsertSQL(tableName, tempTableName, newTableDef.columns, currentTableDef.columns),
        `DROP TABLE ${tempTableName};`,
        'PRAGMA foreign_keys = 1;'
    ];
    for (const sql of statements) {
        await dbRun(sql);
    }
}

// Retrieve current schema from the database
async function getCurrentSchema() {
    const currentSchema = {
        DBversion: '',
        tables: {},
        triggers: {}
    };

    const ver = await new Promise(resolve => {
        db.get(`SELECT * FROM config WHERE key = "DBVER"`, (err, row) => {
            if (!err) resolve(row);
            else resolve(err);
        });
    });

    if (ver == undefined) {
        cmd('w/DBVER is not present')
        currentSchema.DBversion = ''
    } else {
        if (typeof ver !== 'object') {
            console.error(ver);
            return;
        } else {
            cmd('s/Got current version: ' + ver.value);
            currentSchema.DBversion = ver.value;
        }
    }

    // Retrieve tables
    const tables = await new Promise(resolve => {
        db.all(`SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`, (err, rows) => {
            if (!err) resolve(rows);
            else resolve(err);
        });
    });

    if (typeof tables !== 'object') {
        console.error(tables);
        return;
    } else {
        cmd(`s/Got data of ${tables.length} tables`);
    }

    // Process tables
    for (const table of tables) {
        cmd(`i/Processing table "${table.name}"`);
        const tableData = await new Promise(resolve => {
            db.all(`PRAGMA table_info(${table.name})`, (err, rows) => {
                if (!err) resolve(rows);
                else resolve(err);
            });
        });

        if (typeof tableData !== 'object') {
            console.error(tableData);
            return;
        } else {
            cmd(`s/Got "${table.name}" table PRAGMA info`);
        }

        const columns = {};
        for (const column of tableData) {
            const params = {
                type: column.type,
            };

            if (column.notnull) params.notNull = true;
            if (column.dflt_value) params.default = JSON.parse(column.dflt_value);

            if (column.pk) {
                params.primaryKey = true;
                if (table.sql && new RegExp(`\\b${column.name}\\b\\s+.*?\\bAUTOINCREMENT\\b`, 'i').test(table.sql)) {
                    params.autoIncrement = true;
                }
            }

            if (table.sql && new RegExp(`\\b${column.name}\\b\\s+[^,]+?\\s+UNIQUE`, 'i').test(table.sql)) {
                params.unique = true;
            }

            columns[column.name] = params;
        }

        currentSchema.tables[table.name] = {
            strict: table.sql?.includes('STRICT') || false,
            withoutRowID: table.sql?.includes('WITHOUT ROWID') || false,
            columns: columns
        };
    }

    // Retrieve triggers
    const triggers = await new Promise(resolve => {
        db.all(`SELECT name, sql, tbl_name as tableName FROM sqlite_master WHERE type = 'trigger'`, (err, rows) => {
            if (!err) resolve(rows);
            else resolve(err);
        });
    });

    if (typeof triggers !== 'object') {
        console.error(triggers);
        return;
    } else {
        cmd(`s/Got ${triggers.length} triggers`);
    }

    // Process triggers
    for (const trigger of triggers) {
        currentSchema.triggers[trigger.name] = {
            sql: trigger.sql,
            table: trigger.tableName
        };
        cmd(`i/Trigger [${trigger.name}] for table [${trigger.tableName}]`);
    }

    return currentSchema;
}

// Update DBSCHEMA.json with the current database schema
async function updateSchema() {
    const currentSchema = await getCurrentSchema();
    const jsonData = JSON.stringify(currentSchema, null, 4);
    await fs.writeFile('./DBSCHEMA.json', jsonData);
    cmd('s/Schema saved to DBSCHEMA.json file!');
}

// Set the database schema based on DBSCHEMA.json
async function setDBSchema() {
    const newSchema = JSON.parse(await fs.readFile('./DBSCHEMA.json', 'utf8'));
    const currentSchema = await getCurrentSchema();



    const isSameVersion = currentSchema.DBversion === newSchema.DBversion;
    if (isSameVersion) {
        cmd(`w/DB version matches [${currentSchema.DBversion}], only displaying differences.`);
    } else {
        cmd(`i/DB version differs [${currentSchema.DBversion}] -> [${newSchema.DBversion}], applying changes.`);
        cmd(`i/Making reserve copy of database...`)
        await fs.copyFile('./storage/data.db', `./storage/DBCOPY-VER[${currentSchema.DBversion}].db`)
    }

    // Process tables
    for (const [tableName, newTableDef] of Object.entries(newSchema.tables)) {
        if (!currentSchema.tables[tableName]) {
            cmd(`w/TABLE ${tableName} is missing!`);
            if (!isSameVersion) {
                cmd(`i/Creating table ${tableName}...`);
                await dbRun(generateCreateTableSQL(tableName, newTableDef));
            }
        } else {
            const currentTableDef = currentSchema.tables[tableName];
            let needsAlter = false;

            // Check columns
            for (const [colName, newColDef] of Object.entries(newTableDef.columns)) {
                if (!currentTableDef.columns[colName]) {
                    cmd(`w/COLUMN ${tableName}.${colName} is missing!`);
                    needsAlter = true;
                } else {
                    const currentColDef = currentTableDef.columns[colName];
                    for (const param of Object.keys(newColDef)) {
                        if (newColDef[param] !== currentColDef[param]) {
                            cmd(`w/COLUMN ${tableName}.${colName} parameter ${param} differs: ${newColDef[param]} vs ${currentColDef[param]}`);
                            needsAlter = true;
                        }
                    }
                }
            }

            // Check for extra parameters in the current schema
            for (const [colName, currentColDef] of Object.entries(currentTableDef.columns)) {
                if (!newTableDef.columns[colName]) {
                    cmd(`w/COLUMN ${tableName}.${colName} is extra!`);
                    needsAlter = true;
                } else {
                    const newColDef = newTableDef.columns[colName];
                    for (const param of Object.keys(currentColDef)) {
                        if (!newColDef[param]) {
                            cmd(`w/COLUMN ${tableName}.${colName} parameter ${param} is extra!`);
                            needsAlter = true;
                        }
                    }
                }
            }

            // Check table options
            if (newTableDef.strict !== currentTableDef.strict || newTableDef.withoutRowID !== currentTableDef.withoutRowID) {
                cmd(`w/TABLE ${tableName} options differ!`);
                needsAlter = true;
            }

            if (needsAlter && !isSameVersion) {
                cmd(`i/Altering table ${tableName}...`);
                await alterTable(tableName, newTableDef, currentTableDef);
            }
        }
    }

    // Drop extra tables
    for (const tableName of Object.keys(currentSchema.tables)) {
        if (!newSchema.tables[tableName]) {
            cmd(`w/TABLE ${tableName} is extra!`);
            if (!isSameVersion) {
                cmd(`i/Dropping table ${tableName}...`);
                await dbRun(`DROP TABLE IF EXISTS ${tableName};`);
            }
        }
    }

    // Handle triggers
    for (const [triggerName, newTrigger] of Object.entries(newSchema.triggers)) {
        if (!currentSchema.triggers[triggerName] || currentSchema.triggers[triggerName].sql !== newTrigger.sql) {
            cmd(`i/Updating trigger ${triggerName}...`);
            await dbRun(`DROP TRIGGER IF EXISTS ${triggerName};`);
            await dbRun(newTrigger.sql);
        }
    }

    for (const triggerName of Object.keys(currentSchema.triggers)) {
        if (!newSchema.triggers[triggerName]) {
            cmd(`w/TRIGGER ${triggerName} is extra!`);
            if (!isSameVersion) {
                cmd(`i/Dropping trigger ${triggerName}...`);
                await dbRun(`DROP TRIGGER IF EXISTS ${triggerName};`);
            }
        }
    }

    if (!isSameVersion) {
        if (currentSchema.DBversion == '') {
            cmd(`i/Setting DB version record to ${newSchema.DBversion}`)
            await dbRun(`INSERT INTO "config" ("key", "value") VALUES ("DBVER", "${newSchema.DBversion}")`)
        } else {
            cmd(`i/Updating DB version record ${currentSchema.DBversion} -> ${newSchema.DBversion}`)
            await dbRun(`UPDATE "config" SET "value" = "${newSchema.DBversion}" WHERE "key" = "DBVER"`)
        }
    }

    cmd('s/Database schema updated successfully!');
    db.close()
}


// Command-line execution
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.includes('-updateSchema')) {
        updateSchema();
    } else if (args.includes('-setDBSchema')) {
        setDBSchema();
    } else {
        console.log('Usage: node filename.js -updateSchema | -setDBSchema');
    }
}


module.exports = setDBSchema;