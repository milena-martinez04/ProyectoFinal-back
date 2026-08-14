import { IsDateString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateCompraDTO {
  @IsDateString()
  fecha_compra!: Date;

  @IsNumber()
  precio_compra!: number;

  @IsNumber()
  @IsNotEmpty()
  id_producto!: number;
}
