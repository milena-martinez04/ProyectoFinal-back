import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VentaService } from "./venta.service";
import { VentaController } from "./venta.controller";
import { Producto } from "../Producto/entities/producto.entity";
import { Venta } from "./entities/venta.entity";
import { Compra } from "../Compra/entities/compra.entity";  
import { Usuario } from "../Auth/entities/usuario.entity";
import { AuthModule } from "../Auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Venta, Producto, Compra, Usuario]),
        AuthModule
    ],
    controllers: [VentaController],
    providers: [VentaService],
})
export class VentaModule {}
