import { Module } from "@nestjs/common";
import { GananciaService } from "./ganancia.service";
import { GananciaController } from "./ganancia.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Compra } from "../Compra/entities/compra.entity";
import { Venta } from "../Venta/entities/venta.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Venta])],
  controllers: [GananciaController],
  providers: [GananciaService],
})
export class GananciaModule {}