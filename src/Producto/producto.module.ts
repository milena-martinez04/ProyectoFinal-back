import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoController } from './producto.controller';
import { ProductoServices } from './producto.service';
import { Producto } from './entities/producto.entity';
import {Compra} from '../Compra/entities/compra.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      Producto,
      Compra
    ])
  ],
  providers:[
    ProductoServices
  ],
  controllers:[
    ProductoController
  ]
})
export class ProductoModule {}
