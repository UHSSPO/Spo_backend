import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config({
  path: '.env.dev',
});

export default new DataSource({
  type: 'mysql',
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
