import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from "@nestjs/common";
import { CreateProductoDTO } from "./Dto/createProducto.DTO";
import { UpdateProductoDTO } from "./Dto/updateProducto.DTO";
import { ProductoServices } from "./producto.service";
import { JwtAuthGuard } from "../Auth/jwt-auth.guard";
import { GetUser } from "../Auth/get-user.decorator";
import { Request } from 'express';

@Controller('producto')
@UseGuards(JwtAuthGuard)
export class ProductoController {

    constructor(
        private readonly productoServices: ProductoServices,
    ) {}

    @Post()
    create(@Body() dto: CreateProductoDTO, @GetUser() user: any) {
        return this.productoServices.create(dto, user.id);
    }

    @Get()
    findAll(@GetUser() user: any) {
        return this.productoServices.findAll(user.id);
    }

    @Get(':id')
    findById(@Param('id') id: string, @GetUser() user: any) {
        return this.productoServices.findById(Number(id), user.id);
    }

    @Get('fecha/:date')
    findByDate(@Param('date') date: string, @GetUser() user: any) {
        return this.productoServices.findByDate(new Date(date), user.id);
    }

    @Get('modelo/:modelo')
    findByModel(@Param('modelo') modelo: string, @GetUser() user: any) {
        return this.productoServices.findByModel(modelo, user.id);
    }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() body: Partial<UpdateProductoDTO>, @GetUser() user: any) {
        return this.productoServices.update(Number(id), body as UpdateProductoDTO, user.id);
    }

    @Delete(':id')
    delete(@Param('id') id: string, @GetUser() user: any) {
        return this.productoServices.delete(Number(id), user.id);
    }

}
