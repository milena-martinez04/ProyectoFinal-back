import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoModule } from './Producto/producto.module';
import { ConfigModule } from '@nestjs/config';
import { CompraModule } from './Compra/compra.module';
import { VentaModule } from './Venta/venta.module';
import { GananciaModule } from './Ganancias/ganancia.module';
import { AuthModule } from './Auth/auth.module';
import * as fs from 'fs';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
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

      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
    }),

    ProductoModule,
    CompraModule,
    VentaModule,
    GananciaModule,
    AuthModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}