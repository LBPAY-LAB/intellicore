import { registerAs } from '@nestjs/config';

export interface NebulaConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  space: string;
  maxConnectionPoolSize: number;
  minConnectionPoolSize: number;
  idleTimeout: number;
}

export default registerAs(
  'nebula',
  (): NebulaConfig => ({
    host: process.env.NEBULA_HOST || 'localhost',
    port: parseInt(process.env.NEBULA_PORT || '9669', 10),
    username: process.env.NEBULA_USERNAME || 'root',
    password: process.env.NEBULA_PASSWORD || 'nebula',
    space: process.env.NEBULA_SPACE || 'intellicore',
    maxConnectionPoolSize: parseInt(
      process.env.NEBULA_MAX_POOL_SIZE || '10',
      10,
    ),
    minConnectionPoolSize: parseInt(
      process.env.NEBULA_MIN_POOL_SIZE || '2',
      10,
    ),
    idleTimeout: parseInt(process.env.NEBULA_IDLE_TIMEOUT || '60000', 10),
  }),
);
