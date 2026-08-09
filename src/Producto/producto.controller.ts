import { Body, Controller, Get, Post, Patch, Param, Delete } from "@nestjs/common";
import { CreateProductoDTO } from "./Dto/createProducto.DTO";
import { UpdateProductoDTO } from "./Dto/updateProducto.DTO";
import { ProductoServices } from "./producto.service";

@Controller('producto')
export class ProductoController {

    constructor(
        private readonly productoServices: ProductoServices,
    ) {}

    @Post()
    create(@Body() dto: CreateProductoDTO) {
        console.log(dto);
        return this.productoServices.create(dto);
    }

    @Get()
    findAll() {
        return this.productoServices.findAll();
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.productoServices.findById(Number(id));
    }

    @Get('fecha/:date')
    findByDate(@Param('date') date: string) {
        return this.productoServices.findByDate(new Date(date));
    }

    @Get('modelo/:modelo')
    findByModel(@Param('modelo') modelo: string) {
        return this.productoServices.findByModel(modelo);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: Partial<UpdateProductoDTO>) {
        return this.productoServices.update(Number(id), body as UpdateProductoDTO);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.productoServices.delete(Number(id));
    }

}