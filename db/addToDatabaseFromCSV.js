const fs = require('fs');
const csv = require('fast-csv');
const pool = require('../db/db');

const csvFilePath = './data/toImport.csv';

async function numberExists(number) {
  const { rowCount } = await pool.query('SELECT 1 FROM phone_numbers WHERE number = $1', [number]);
  return rowCount > 0;
}

async function insertNumber(number) {
  if (await numberExists(number)) {
    console.log(`Número ${number} já existe no banco de dados.`);
  } else {
    await pool.query(`
      INSERT INTO phone_numbers (
        number, 
        is_valid, 
        validated_by_system, 
        validated_by_bot, 
        created_at, 
        updated_at
      ) VALUES ($1, null, false, null, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [number]);
    console.log(`Número ${number} adicionado ao banco de dados.`);
  }
}

function processCsv() {
  const insertPromises = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv.parse({ headers: false }))
    .on('data', (row) => {
      // Armazena a promessa de inserção em um array
      insertPromises.push(insertNumber(row[0]));
    })
    .on('end', async () => {
      console.log('Processamento do arquivo CSV concluído. Aguardando inserções...');
      try {
        // Espera todas as inserções serem concluídas
        await Promise.all(insertPromises);
        console.log('Todas as inserções concluídas.');
      } catch (error) {
        console.error('Erro durante inserções:', error);
      } finally {
        // Encerra a pool de conexões apenas após todas as inserções
        await pool.end();
        console.log('Conexão com o banco de dados encerrada.');
      }
    });
}

processCsv();
