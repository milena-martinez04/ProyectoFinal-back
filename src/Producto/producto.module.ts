import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoController } from './producto.controller';
import { ProductoServices } from './producto.service';
import { Producto } from './entities/producto.entity';
import { Compra } from '../Compra/entities/compra.entity';
import { Usuario } from '../Auth/entities/usuario.entity';
import { AuthModule } from '../Auth/auth.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      Producto,
      Compra,
      Usuario
    ]),
    AuthModule
  ],
  providers:[
    ProductoServices
  ],
  controllers:[
    ProductoController
  ]
})
export class ProductoModule {}
