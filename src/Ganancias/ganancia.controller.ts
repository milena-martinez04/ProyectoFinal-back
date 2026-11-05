import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GananciaService } from './ganancia.service';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { GetUser } from '../Auth/get-user.decorator';

@Controller('ganancia')
@UseGuards(JwtAuthGuard)
export class GananciaController {
  constructor(private readonly gananciaService: GananciaService) {}

  // 📅 mensual
  @Get('ganancia-mensual')
  gananciaMensual(@Query('mes') mes: string, @Query('anio') anio: string, @GetUser() user: any) {
    return this.gananciaService.gananciaMensual(Number(mes), Number(anio), user.id);
  }

  // 📅 semanal
  @Get('ganancia-semanal')
  gananciaSemanal(@Query('fecha') fecha: string, @GetUser() user: any) {
    return this.gananciaService.gananciaSemanal(fecha, user.id);
  }

  @Get('resumen')
  resumen(@GetUser() user: any) {
    return this.gananciaService.resumenGanancias(user.id);
  }
}
