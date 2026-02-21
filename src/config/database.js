import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const normalizeEnv = (value) =>
  typeof value === 'string' ? value.replace(/^['"]|['"]$/g, '') : value;

const isProd = normalizeEnv(process.env.NODE_ENV) === 'production';
const databaseUrl = normalizeEnv(process.env.DATABASE_URL);

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: normalizeEnv(process.env.NODE_ENV) === 'development' ? console.log : false,
      dialectOptions: isProd
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    })
  : new Sequelize(
      normalizeEnv(process.env.DB_NAME) || 'boatcheck_pro',
      normalizeEnv(process.env.DB_USER) || 'postgres',
      normalizeEnv(process.env.DB_PASSWORD) || 'postgres',
      {
        host: normalizeEnv(process.env.DB_HOST) || 'localhost',
        port: Number(normalizeEnv(process.env.DB_PORT)) || 5432,
        dialect: 'postgres',
        logging: normalizeEnv(process.env.NODE_ENV) === 'development' ? console.log : false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      }
    );

export default sequelize;
