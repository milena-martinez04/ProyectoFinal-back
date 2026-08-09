import { Controller, Get, Query } from '@nestjs/common';
import { GananciaService } from './ganancia.service';

@Controller('ganancia')
export class GananciaController {
  constructor(private readonly gananciaService: GananciaService) {}

  // 📅 mensual
  @Get('ganancia-mensual')
  gananciaMensual(@Query('mes') mes: string, @Query('anio') anio: string) {
    return this.gananciaService.gananciaMensual(Number(mes), Number(anio));
  }

  // 📅 semanal
  @Get('ganancia-semanal')
  gananciaSemanal(@Query('fecha') fecha: string) {
    return this.gananciaService.gananciaSemanal(fecha);
  }

  @Get('resumen')
  resumen() {
    return this.gananciaService.resumenGanancias();
  }
}
