import { QueryInterface, Sequelize } from 'sequelize';
import { Routes } from '@db/models';
import routes from './routes';

export async function up(queryInterface: QueryInterface, sequelize: Sequelize) {

  await Routes.bulkCreate(routes);

  // Assuming routes.length gives you the number of routes created
  await queryInterface.sequelize.query(`SELECT setval(pg_get_serial_sequence('"Routes"', 'id'), ${routes.length}, true)`);
};

export async function down(queryInterface: QueryInterface, sequelize: Sequelize) {
  return queryInterface.bulkDelete('Routes', {}, {});
}
