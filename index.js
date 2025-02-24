const cmd = require('./core/consoleLogger.js');
const cfg = require('./config.json');
const fs = require('fs');
const path = require('path');

// Fixed version reporting
for (const [name, value] of Object.entries(cfg.version)) {
    cmd(value, [{ txt: `${name}-V`, txtc: 'cyan', txtb: 'magenta' }]);
}

const hlthPREP = { txt: 'HEALTH', txtb: 'white', txtc: 'brightGreen' };
let healthCheckErrors = 0;

// Path configuration
const PATHS = {
    STORAGE: 'storage',
    DB: path.join('storage', 'data.db'),
    FILE_STORAGE: path.join('storage', 'file_storage'),
    THUMBNAILS: path.join('storage', 'video_thumbnails'),
    UNLINKED: path.join('storage', 'UNLINKED')
};

// Health check configuration
const CHECKS = [
    { 
        path: PATHS.STORAGE, 
        type: 'ce', 
        message: 'Storage folder missing',
        fix: async () => await safeMkdir(PATHS.STORAGE)
    },
    { 
        path: PATHS.DB,
        type: 'ce',
        message: 'Database missing',
        fix: async () => await createDatabase()
    },
    {
        path: PATHS.FILE_STORAGE,
        type: 'ce',
        message: 'Posts folder missing',
        fix: async () => await safeMkdir(PATHS.FILE_STORAGE)
    },
    {
        path: PATHS.THUMBNAILS,
        type: 'e',
        message: 'Video thumbnails folder missing',
        fix: async () => await safeMkdir(PATHS.THUMBNAILS)
    },
    {
        path: PATHS.UNLINKED,
        type: 'e',
        message: 'Unlinked files folder missing',
        fix: async () => await safeMkdir(PATHS.UNLINKED)
    }
];

// --- Health Check Execution ---
(async () => {
    try {
        cmd('w/Starting health check!', [hlthPREP]);
        
        for (const check of CHECKS) {
            if (!await fileExists(check.path)) {
                cmd(`${check.type}/${check.message}`, [hlthPREP]);
                await check.fix();
                healthCheckErrors++;
                cmd(`i/Fixed: ${check.message}`, [hlthPREP]);
            }
            // Add delay between checks if needed
            // await new Promise(r => setTimeout(r, 100));
        }

        // --- Post-Check Operations ---
        cmd('i/End of health check!', [hlthPREP]);
        
        if (healthCheckErrors > 0) {
            cmd(`w/Fixed ${healthCheckErrors} issues`, [hlthPREP]);
        } else {
            cmd(`s/No issues detected`, [hlthPREP]);
        }

        // --- Database Schema Healing ---
        //cmd('i/Verifying database schema...', [hlthPREP]);
        //await require('./tools/DBSchemaHealer.js')();
        //cmd('s/Database schema verified', [hlthPREP]);

        // --- Service Initialization ---
        cmd('i/Starting services...', [hlthPREP]);
        await require('./core/languageVerify.js');
        await require('./webpage/index.js');
        await require('./tg_bot/index.js');
        
    } catch (e) {
        cmd(`ce/Process failed: ${e.message}`, [hlthPREP]);
        process.exit(1);
    }
})();

// --- Async Helper Functions ---
async function fileExists(filePath) {
    return fs.promises.access(path.join(__dirname, filePath), fs.constants.F_OK)
           .then(() => true)
           .catch(() => false);
}

async function safeMkdir(dirPath) {
    const fullPath = path.join(__dirname, dirPath);
    try {
        await fs.promises.mkdir(fullPath, { recursive: true });
    } catch (e) {
        if (e.code !== 'EEXIST') throw e;
    }
}

async function createDatabase() {
    const dbPath = path.join(__dirname, PATHS.DB);
    
    // Create parent directory first
    await safeMkdir(path.dirname(PATHS.DB));

    // Create empty database file
    try {
        await fs.promises.writeFile(dbPath, '');
        cmd('i/Created new database file', [hlthPREP]);
    } catch (e) {
        if (e.code !== 'EEXIST') throw e;
    }
}