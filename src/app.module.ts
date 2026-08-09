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


@Module({
  imports:[
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
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,
  }),
    ProductoModule,
    CompraModule,
    VentaModule,
    GananciaModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}