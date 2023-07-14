import { QueryInterface } from 'sequelize';
import fs from 'fs';
import path from 'path';
import sequelize from '@db/sequelize';

async function executeMigrationsAndSeeders() {
  const queryInterface: QueryInterface = sequelize.getQueryInterface();

  const migrationFiles = fs.readdirSync(path.resolve(__dirname, './migrations'));
  const seederFiles = fs.readdirSync(path.resolve(__dirname, './seeders'));

  const initMigrationFiles = migrationFiles.filter(file => file.startsWith('init')).sort();
  const initSeederFiles = seederFiles.filter(file => file.startsWith('init')).sort();

  const otherMigrationFiles = migrationFiles.filter(file => !file.startsWith('init')).sort();
  const otherSeederFiles = seederFiles.filter(file => !file.startsWith('init')).sort();

  //   Run init migrations and seeders
  for (const file of initMigrationFiles) {
    const migration = await import(`./migrations/${file}`);
    await migration.up(queryInterface);
  }

  for (const file of initSeederFiles) {
    const seeder = await import(`./seeders/${file}`);
    await seeder.up(queryInterface);
  }

  // Run other migrations and seeders in pairs
  for (const file of otherMigrationFiles) {
    const migration = await import(`./migrations/${file}`);
    await migration.up(queryInterface);

    const regex = /(\d{12})-/; // Regular expression pattern to match the YYYYMMDDHHMM portion before the hyphen
    const match = file.match(regex);

    if (match && otherSeederFiles.includes(match[1])) {
      const seeder = await import(`./seeders/${file}`);
      await seeder.up(queryInterface);
    }
  }
}

executeMigrationsAndSeeders();
