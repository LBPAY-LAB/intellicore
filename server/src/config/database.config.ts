import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';

  return {
    type: 'postgres',
    url: configService.get<string>('DATABASE_URL'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
    synchronize: false, // Always use migrations in production
    logging: !isProduction ? ['query', 'error', 'warn'] : ['error'],
    // Production-optimized connection pooling
    extra: {
      // Connection pool settings
      min: isProduction ? 5 : 2,
      max: isProduction ? 20 : 10,
      idleTimeoutMillis: isProduction ? 10000 : 30000,
      connectionTimeoutMillis: 5000,
      // Statement timeout (30s max query time)
      statement_timeout: 30000,
      // Idle transaction timeout (10s)
      idle_in_transaction_session_timeout: 10000,
    },
    // Cache queries in development
    cache: !isProduction
      ? {
          duration: 30000, // 30 seconds
        }
      : undefined,
  };
};

// DataSource for CLI migrations
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://lbpay:lbpay_dev_password@localhost:5432/lbpay',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  extra: {
    min: 2,
    max: 10,
  },
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
