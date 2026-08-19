import 'reflect-metadata';
import 'dotenv/config';

import { DataSource } from 'typeorm';

import * as fs from 'fs';
import * as path from 'path';

export default new DataSource({
  type: 'mysql',

  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(path.resolve(process.env.DB_CA_CERT!), 'utf8'),
  },

  entities: [path.join(process.cwd(), 'dist/**/*.entity.js')],

  migrations: [path.join(process.cwd(), 'dist/migrations/*.js')],

  synchronize: false,
});