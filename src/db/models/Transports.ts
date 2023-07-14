import { Model, DataTypes } from 'sequelize';
import sequelize from '@db/sequelize';
import Routes from './Routes';

class Transports extends Model {
  public id!: number;
  public plate_number!: string;
  public status!: string;
  public model!: string;
  public purchase_date!: Date;
  public mileage!: number;
  public transport_type!: string;
  public Routes!: Routes[];
}

Transports.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    plate_number: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    status: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    model: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    purchase_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    mileage: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    transport_type: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
  },
  {
    tableName: 'Transports',
    sequelize,
  }
);

export default Transports;
