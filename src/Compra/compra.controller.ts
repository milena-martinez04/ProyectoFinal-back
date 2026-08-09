import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CompraService } from "./compra.service";
import { CreateCompraDTO } from "./Dto/createCompra.DTO";

@Controller('compra')
export class CompraController{
    constructor(
        private readonly compraService: CompraService,
    ){}

    @Post()
    create(@Body() createCompraDto: CreateCompraDTO) {
        return this.compraService.create(createCompraDto);
    }

    @Get()
    findAll(){
        return this.compraService.findAll();
    }

    @Get(':id')
    findById(@Param('id') id: string){
        return this.compraService.findById(Number(id));
    }

    @Get('fecha/:date')
    findByDate(@Param('date') date: string){
        return this.compraService.findByDate(new Date(date));
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: Partial<CreateCompraDTO>) {
        return this.compraService.update(Number(id), body as CreateCompraDTO);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.compraService.delete(Number(id));
    }
}