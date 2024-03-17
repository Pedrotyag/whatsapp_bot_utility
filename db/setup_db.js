require('dotenv').config();
const { Pool } = require('pg');

const connectionConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

async function setupDatabase() {
  const defaultDBPool = new Pool({
    ...connectionConfig,
    database: 'postgres',
  });

  try {
    const dbName = 'phone_validation';
    const tableName = 'phone_numbers';

    const dbExists = await defaultDBPool.query(
      `SELECT 1 FROM pg_database WHERE datname='${dbName}'`
    );

    if (dbExists.rowCount === 0) {
      await defaultDBPool.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Banco de dados ${dbName} criado.`);
    }

    const appDBPool = new Pool({
      ...connectionConfig,
      database: dbName,
    });

    const tableExists = await appDBPool.query(
      `SELECT to_regclass('${tableName}')`
    );

    if (!tableExists.rows[0].to_regclass) {
      await appDBPool.query(`
        CREATE TABLE ${tableName} (
          id SERIAL PRIMARY KEY,
          number VARCHAR(20) NOT NULL UNIQUE,
          is_valid BOOLEAN,
          validated_by_system BOOLEAN DEFAULT FALSE,
          validated_by_bot VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          exported_at TIMESTAMP WITH TIME ZONE
        );
      `);
      console.log(`Tabela ${tableName} criada.`);
    
      await appDBPool.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;   
        END;
        $$ LANGUAGE plpgsql;
      `);
      
      await appDBPool.query(`
        CREATE TRIGGER update_updated_at_before_update
        BEFORE UPDATE ON ${tableName}
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `);
      
      console.log(`Gatilho para atualizar 'updated_at' criado.`);
    }

    console.log('Configuração do banco de dados concluída.');
  } catch (error) {
    console.error('Erro durante a configuração do banco de dados:', error);
  } finally {
    await defaultDBPool.end();
  }
}

setupDatabase();
