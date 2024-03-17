const fs = require('fs');
const csv = require('fast-csv').format;
const pool = require('../db/db');

const exportPath = './export/';
if (!fs.existsSync(exportPath)) {
  fs.mkdirSync(exportPath, { recursive: true });
}

async function exportUnexportedNumbers(rows) {
  const { rows } = await pool.query(`
    SELECT * FROM phone_numbers WHERE exported_at IS NULL LIMIT $1
  `, [rows]);

  if (rows.length === 0) {
    console.log("Nenhum número não exportado encontrado.");
    return;
  }

  const timestamp = Date.now();
  const filename = `${exportPath}${timestamp}_export_${rows.length}.csv`;
  const writableStream = fs.createWriteStream(filename);

  const csvStream = csv({ headers: false });
  csvStream.pipe(writableStream);

  rows.forEach((row) => {
    csvStream.write({ number: row.number });
  });

  csvStream.end();

  writableStream.on('finish', async () => {
    console.log(`Exportação concluída: ${filename}`);

    const updateQuery = `
      UPDATE phone_numbers 
      SET exported_at = NOW() 
      WHERE number = ANY($1::varchar[])
    `;
    const numbersToUpdate = rows.map(row => row.number);

    try {
      await pool.query(updateQuery, [numbersToUpdate]);
      console.log('Data de exportação atualizada para os números exportados.');
    } catch (error) {
      console.error('Erro ao atualizar a data de exportação:', error);
    } finally {
      await pool.end();
      console.log('Conexão com o banco de dados encerrada.');
    }
  });
}
