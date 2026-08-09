import { Module } from "@nestjs/common";
import { CompraService } from "./compra.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CompraController } from "./compra.controller";
import { Producto } from "../Producto/entities/producto.entity";
import { Compra } from "./entities/compra.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Compra, Producto])],
    controllers: [CompraController],
    providers: [CompraService],
})
export class CompraModule {}