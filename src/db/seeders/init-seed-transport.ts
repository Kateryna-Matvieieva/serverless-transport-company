import { QueryInterface, Sequelize } from 'sequelize';
import { Transports } from '@db/models';
import transports from './transports';

export async function up(queryInterface: QueryInterface, sequelize: Sequelize) {

  await Transports.bulkCreate(transports);

  // Assuming transports.length gives you the number of transports created
  await queryInterface.sequelize.query(`SELECT setval(pg_get_serial_sequence('"Transports"', 'id'), ${transports.length}, true)`);
};

export async function down(queryInterface: QueryInterface, sequelize: Sequelize) {
  return queryInterface.bulkDelete('Transports', {}, {});
}