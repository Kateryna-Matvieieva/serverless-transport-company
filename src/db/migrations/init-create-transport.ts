import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, Sequelize: any) => {
    await queryInterface.createTable('Transports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      plate_number: {
        type: DataTypes.STRING
      },
      status: {
        type: DataTypes.STRING
      },
      model: {
        type: DataTypes.STRING
      },
      purchase_date: {
        type: DataTypes.DATE
      },
      mileage: {
        type: DataTypes.INTEGER
      },
      transport_type: {
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
    await queryInterface.dropTable('Transports');
  }
};
