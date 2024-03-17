const pool = require('../db/db');

async function all(count = null) {

  if(count){
    const { rows } = await pool.query(
      'SELECT * FROM phone_numbers'
    );
    return parseInt(rows[0].count, 10);
    
  } else {
    const { rows } = await pool.query(
      'SELECT COUNT(*) FROM phone_numbers'
    );
    rows;
    }
}

async function updateValidatedByBot(numbers, validatedByBot) {
  const query = `
    UPDATE phone_numbers 
    SET validated_by_bot = $1 
    WHERE number = ANY($2::varchar[])
  `;
  await pool.query(query, [validatedByBot, numbers]);
}

async function insertPhoneNumber(number, isValid, validatedByBot) {
  await pool.query(
    'INSERT INTO phone_numbers (number, is_valid, validated_by_system, validated_by_bot) VALUES ($1, $2, TRUE, $3)',
    [number, isValid, validatedByBot]
  );
}

async function updatePhoneNumber(number, isValid, validatedByBot) {
  await pool.query(
    'UPDATE phone_numbers SET is_valid = $2, validated_by_system = TRUE, validated_by_bot = $3 WHERE number = $1',
    [number, isValid, validatedByBot]
  );
}

async function fetchPhoneNumbers(validatedByBot) {
  const { rows } = await pool.query(
    'SELECT * FROM phone_numbers WHERE validated_by_bot = $1',
    [validatedByBot]
  );
  return rows;
}

async function deletePhoneNumber(number) {
  await pool.query(
    'DELETE FROM phone_numbers WHERE number = $1',
    [number]
  );
}

async function fetchUnvalidatedPhoneNumbers() {
  const { rows } = await pool.query(`
    SELECT * FROM phone_numbers 
    WHERE is_valid IS NULL`);
  return rows;
}

module.exports = { all, insertPhoneNumber, updatePhoneNumber, updateValidatedByBot, fetchPhoneNumbers, deletePhoneNumber, fetchUnvalidatedPhoneNumbers}
