import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, Sequelize: any) => {
    await queryInterface.createTable('Routes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      start_city: {
        type: DataTypes.STRING
      },
      end_city: {
        type: DataTypes.STRING
      },
      distance: {
        type: DataTypes.INTEGER
      },
      departure_date: {
        type: DataTypes.DATE
      },
      completion_date: {
        type: DataTypes.DATE
      },
      transport_type: {
        type: DataTypes.STRING
      },
      expected_revenue: {
        type: DataTypes.FLOAT
      },
      transport_id: {
        type: DataTypes.INTEGER
      },
      status: {
        type: DataTypes.STRING
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });
  },
  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    await queryInterface.dropTable('Routes');
  }
};
