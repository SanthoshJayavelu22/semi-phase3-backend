import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import dotenv from 'dotenv';

dotenv.config();

const localRequire = createRequire(__filename);

const runMigrations = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/my_database');

  const migrationsDir = path.join(__dirname, '../migrations');
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (!file.endsWith('.ts')) continue;
    console.log(`📊 Running migration: ${file}`);

    try {
      const migration = localRequire(path.join(migrationsDir, file));
      await migration.up();
      console.log(`✅ Migration ${file} completed`);
    } catch (error) {
      console.error(`❌ Migration ${file} failed:`, error);
      process.exit(1);
    }
  }

  await mongoose.disconnect();
  console.log('✅ All migrations completed');
};

runMigrations();
