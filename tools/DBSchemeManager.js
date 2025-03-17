const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./storage/data.db');
const fs = require('fs').promises;
const cmd = (txt) => { require('../core/consoleLogger')(txt, [{ txt: 'DB', txtc: 'red', txtb: 'white' }]) };

async function dbRun(sql) {
    return new Promise((resolve, reject) => {
        db.run(sql, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function generateCreateTableSQL(tableName, tableDef) {
    const columns = [];
    for (const [colName, colDef] of Object.entries(tableDef.columns)) {
        const parts = [`"${colName}"`, colDef.type];
        if (colDef.primaryKey) parts.push('PRIMARY KEY');
        if (colDef.autoIncrement) parts.push('AUTOINCREMENT');
        if (colDef.notNull) parts.push('NOT NULL');
        if (colDef.unique) parts.push('UNIQUE');
        if (colDef.default !== undefined) parts.push(`DEFAULT "${colDef.default}"`);
        columns.push(parts.join(' '));
    }
    const options = [];
    if (tableDef.withoutRowID) options.push('WITHOUT ROWID');
    if (tableDef.strict) options.push('STRICT');
    return `CREATE TABLE ${tableName} (${columns.join(', ')}) ${options.join(', ')}`.trim();
}

function generateInsertSQL(newTableName, tempTableName, newColumns, oldColumns) {
    const insertColumns = [];
    const selectColumns = [];
    for (const colName in newColumns) {
        insertColumns.push(`"${colName}"`);
        if (oldColumns[colName]) {
            selectColumns.push(`"${colName}"`);
        } else {
            selectColumns.push(newColumns[colName].default !== undefined ? newColumns[colName].default : 'NULL');
        }
    }
    return `INSERT INTO ${newTableName} (${insertColumns.join(', ')}) SELECT ${selectColumns.join(', ')} FROM ${tempTableName};`;
}

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
                if (table.sql && new RegExp(`\\b${column.name}\\b[^,]*?\\bAUTOINCREMENT\\b[^,]*?,`, 'i').test(table.sql)) {
                    params.autoIncrement = true;
                }
            }

            if (table.sql && new RegExp(`\\b${column.name}\\b[^,]*?\\bUNIQUE\\b[^,]*?,`, 'i').test(table.sql)) {
                params.unique = true;
            }
            
            columns[column.name] = params;
        }

        currentSchema.tables[table.name] = {
            withoutRowID: table.sql?.includes('WITHOUT ROWID') || false,
            strict: table.sql?.includes('STRICT') || false,
            columns: columns
        };
    }

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

    for (const trigger of triggers) {
        currentSchema.triggers[trigger.name] = {
            sql: trigger.sql,
            table: trigger.tableName
        };
        cmd(`i/Trigger [${trigger.name}] for table [${trigger.tableName}]`);
    }

    return currentSchema;
}

async function updateSchema() {
    const currentSchema = await getCurrentSchema();
    const jsonData = JSON.stringify(currentSchema, null, 4);
    await fs.writeFile('./DBSCHEMA.json', jsonData);
    cmd('s/Schema saved to DBSCHEMA.json file!');
}

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

    for (const tableName of Object.keys(currentSchema.tables)) {
        if (!newSchema.tables[tableName]) {
            cmd(`w/TABLE ${tableName} is extra!`);
            if (!isSameVersion) {
                cmd(`i/Dropping table ${tableName}...`);
                await dbRun(`DROP TABLE IF EXISTS ${tableName};`);
            }
        }
    }

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