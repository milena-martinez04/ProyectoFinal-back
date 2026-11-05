import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CompraService } from "./compra.service";
import { CreateCompraDTO } from "./Dto/createCompra.DTO";
import { JwtAuthGuard } from "../Auth/jwt-auth.guard";
import { GetUser } from "../Auth/get-user.decorator";

@Controller('compra')
@UseGuards(JwtAuthGuard)
export class CompraController{
    constructor(
        private readonly compraService: CompraService,
    ){}

    @Post()
    create(@Body() createCompraDto: CreateCompraDTO, @GetUser() user: any) {
        return this.compraService.create(createCompraDto, user.id);
    }

    @Get()
    findAll(@GetUser() user: any){
        return this.compraService.findAll(user.id);
    }

    @Get(':id')
    findById(@Param('id') id: string, @GetUser() user: any){
        return this.compraService.findById(Number(id), user.id);
    }

    @Get('fecha/:date')
    findByDate(@Param('date') date: string, @GetUser() user: any){
        return this.compraService.findByDate(new Date(date), user.id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: Partial<CreateCompraDTO>, @GetUser() user: any) {
        return this.compraService.update(Number(id), body as CreateCompraDTO, user.id);
    }

    @Delete(':id')
    delete(@Param('id') id: string, @GetUser() user: any) {
        return this.compraService.delete(Number(id), user.id);
    }
}
