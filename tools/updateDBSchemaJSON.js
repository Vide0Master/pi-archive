const sqlite3 = require('sqlite3');
const fs = require('fs').promises;

// Fixed configuration
const DB_PATH = './storage/data.db';
const JSON_PATH = './DBSchema.json';
const INCLUDE_TRIGGERS = true;

async function exportSchema() {
    const db = new sqlite3.Database(DB_PATH);

    const runQuery = (query) => new Promise((resolve, reject) => {
        db.all(query, (err, rows) => err ? reject(err) : resolve(rows));
    });

    try {
        const result = { tables: [] };

        // Process tables
        const tables = await runQuery(
            "SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
        );

        for (const table of tables) {
            const columns = await runQuery(`PRAGMA table_info(${table.name})`);
            const sql = (table.sql || '').toUpperCase();

            result.tables.push({
                tableName: table.name,
                columns: columns.map(col => ({
                    columnName: col.name,
                    dataType: col.type,
                    isRequired: col.notnull === 1,
                    defaultValue: col.dflt_value ?
                        col.dflt_value.replace(/^["'](.*)["']$/, '$1') :
                        null,
                    isPrimaryKey: col.pk > 0
                })),
                strict: sql.includes('STRICT'),
                withoutRowid: sql.includes('WITHOUT ROWID')
            });
        }

        // Add DB version from config
        try {
            const [version] = await runQuery("SELECT value FROM config WHERE key = 'DBVER'");
            if (version) result.dbVersion = version.value;
        } catch { } // Ignore missing config table

        // Process triggers
        if (INCLUDE_TRIGGERS) {
            const triggers = await runQuery(
                "SELECT name, sql FROM sqlite_master WHERE type = 'trigger'"
            );
            result.triggers = triggers.map(t => ({
                triggerName: t.name,
                definition: t.sql.replace(/\s+/g, ' ')
            }));
        }

        // Custom JSON formatting with proper escaping
        const json = JSON.stringify(result, null, 4)

        await fs.writeFile(JSON_PATH, json);
        console.log(`Schema exported to ${JSON_PATH}`);
    } catch (err) {
        console.error('Export error:', err);
    } finally {
        db.close();
    }
}

exportSchema();