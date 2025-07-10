const sql = require('mssql');

console.log("Username:", process.env.MSSQL_USERNAME);
console.log("Password:", process.env.MSSQL_PASSWORD);
console.log("Server:", process.env.SERVER_1);
console.log("Port:", process.env.MSSQL_PORT);
console.log("Database:", process.env.MSSQL_DATABASE);
if (
  !process.env.MSSQL_USERNAME ||
  !process.env.MSSQL_PASSWORD ||
  !process.env.SERVER_1 ||
  !process.env.MSSQL_PORT ||
  !process.env.MSSQL_DATABASE
) {
  console.error('[!] .env variables missing. Fix your environment file you potato.');
  return
}

const configWithoutDB = {
    user: process.env.MSSQL_USERNAME,
    password: process.env.MSSQL_PASSWORD,
    server: process.env.SERVER_1,
    port: parseInt(process.env.MSSQL_PORT),
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const targetDatabase = process.env.MSSQL_DATABASE;

async function ensureDatabaseExists() {
    try {
        const pool = await sql.connect(configWithoutDB);
        const result = await pool.request()
            .query(`SELECT name FROM sys.databases WHERE name = '${targetDatabase}'`);

        if (result.recordset.length === 0) {
            console.log(`[!] Database "${targetDatabase}" does not exist. Creating it...`);
            await pool.request().query(`CREATE DATABASE [${targetDatabase}]`);
            console.log(`[+] Database "${targetDatabase}" created successfully.`);
        } else {
            console.log(`[+] Database "${targetDatabase}" already exists.`);
        }

        await pool.close();
    } catch (err) {
        console.error('[X] Failed while checking or creating database:', err);
        process.exit(1); // Hard exit if even the check fails
    }
}

const configWithDB = {
    ...configWithoutDB,
    database: targetDatabase
};

const poolPromise = ensureDatabaseExists()
    .then(() => {
        return new sql.ConnectionPool(configWithDB).connect();
    })
    .then(pool => {
        console.log('[*] Connected to MSSQL Database');
        return pool;
    })
    .catch(err => {
        console.error('[*] Final MSSQL connection failed:', err);
    });

module.exports = {
    sql,
    poolPromise
};
