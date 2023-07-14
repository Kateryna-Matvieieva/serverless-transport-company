import { Model, DataTypes } from 'sequelize';
import sequelize from '@db/sequelize';
import Transports from './Transports';

class Routes extends Model {
  public id!: number;
  public start_city!: string;
  public end_city!: string;
  public distance!: number;
  public departure_date!: Date;
  public completion_date!: Date;
  public transport_type!: string;
  public expected_revenue!: number;
  public transport_id?: number;
  public status!: string;
  public Transports?: Transports;
}

Routes.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    start_city: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    end_city: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    distance: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    departure_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    completion_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    transport_type: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    expected_revenue: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    transport_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
  },
  {
    tableName: 'Routes',
    sequelize,
  }
);

export default Routes;
