import { Module } from "@nestjs/common";
import { GananciaService } from "./ganancia.service";
import { GananciaController } from "./ganancia.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Venta } from "../Venta/entities/venta.entity";
import { Usuario } from "../Auth/entities/usuario.entity";
import { AuthModule } from "../Auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Venta, Usuario]),
        AuthModule
    ],
  controllers: [GananciaController],
  providers: [GananciaService],
})
export class GananciaModule {}
