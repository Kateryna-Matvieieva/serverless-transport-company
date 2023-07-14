import Routes from './Routes';
import Transports from './Transports';

// Set up associations
Transports.hasMany(Routes, { foreignKey: 'transport_id' });
Routes.belongsTo(Transports, { foreignKey: 'transport_id' });

export { Routes, Transports };
