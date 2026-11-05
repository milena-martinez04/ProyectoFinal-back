import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { VentaService } from './venta.service';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { GetUser } from '../Auth/get-user.decorator';
import  { CreateVentaDTO } from './Dto/createVenta.DTO';
import  { UpdateVentaDTO } from "./Dto/updateVenta.DTO";

@Controller('venta')
@UseGuards(JwtAuthGuard)
export class VentaController {
  constructor(private readonly ventaService: VentaService) {}

  @Post()
  create(@Body() createVentaDto: CreateVentaDTO, @GetUser() user: any) {
    return this.ventaService.create(createVentaDto, user.id);
  }

  @Get()
  findAll(@GetUser() user: any) {
    return this.ventaService.findAll(user.id);
  }

  @Get(':id')
  findById(@Param('id') id: string, @GetUser() user: any) {
    return this.ventaService.findById(Number(id), user.id);
  }

  @Get('fecha/:date')
  findByDate(@Param('date') date: string, @GetUser() user: any) {
    return this.ventaService.findByDate(new Date(date), user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateVentaDTO, @GetUser() user: any) {
    return this.ventaService.update(Number(id), body, user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @GetUser() user: any) {
    return this.ventaService.delete(Number(id), user.id);
  }
}
