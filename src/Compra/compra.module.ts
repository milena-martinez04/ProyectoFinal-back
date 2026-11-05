import { Module } from "@nestjs/common";
import { CompraService } from "./compra.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CompraController } from "./compra.controller";
import { Producto } from "../Producto/entities/producto.entity";
import { Compra } from "./entities/compra.entity";
import { Usuario } from "../Auth/entities/usuario.entity";
import { AuthModule } from "../Auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Compra, Producto, Usuario]),
        AuthModule
    ],
    controllers: [CompraController],
    providers: [CompraService],
})
export class CompraModule {}
