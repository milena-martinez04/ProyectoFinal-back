import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { VentaService } from './venta.service';
import  { CreateVentaDTO } from './Dto/createVenta.DTO';
import  { UpdateVentaDTO } from "./Dto/updateVenta.DTO";

@Controller('venta')
export class VentaController {
  constructor(private readonly ventaService: VentaService) {}

  @Post()
  create(@Body() createVentaDto: CreateVentaDTO) {
    return this.ventaService.create(createVentaDto);
  }

  @Get()
  findAll() {
    return this.ventaService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.ventaService.findById(Number(id));
  }

  @Get('fecha/:date')
  findByDate(@Param('date') date: string) {
    return this.ventaService.findByDate(new Date(date));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateVentaDTO) {
    return this.ventaService.update(Number(id), body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.ventaService.delete(Number(id));
  }
}
