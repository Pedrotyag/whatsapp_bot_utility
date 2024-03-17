require('dotenv').config();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const backupDir = path.join(__dirname, 'dumps');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = Date.now();
const dumpFileName = `${timestamp}_dump.sql`;
const dumpFilePath = path.join(backupDir, dumpFileName);

const user = process.env.PGUSER;
const database = process.env.PGDATABASE;
const password = process.env.PGPASSWORD;
const host = process.env.PGHOST;
const port = process.env.PGPORT;

const command = `PGPASSWORD=${password} pg_dump -U ${user} -h ${host} -p ${port} -d ${database} -F c -b -v -f "${dumpFilePath}"`;

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`Erro ao criar o dump do banco de dados: ${error.message}`);
        return;
    }
    console.log(`Dump do banco de dados criado com sucesso: ${dumpFilePath}`);
    console.log(`Stdout: ${stdout}`);
    console.error(`Stderr: ${stderr}`);
});
