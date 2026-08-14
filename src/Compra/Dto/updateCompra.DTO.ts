import {
  IsDateString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class UpdateCompraDTO {
  @IsOptional()
  @IsDateString()
  fecha_compra?: Date;

  @IsOptional()
  @IsNumber()
  precio_compra?: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  id_producto?: number;
}
