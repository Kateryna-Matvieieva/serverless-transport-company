import sequelize from '@db/sequelize';

export default async function connect() {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL');
  } catch (error) {
    console.error('Error connecting to PostgreSQL:', error);
    throw error;
  }
}
