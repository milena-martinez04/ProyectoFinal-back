import { IsString, IsDateString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateProductoDTO {
  @IsString()
  @IsNotEmpty()
  modelo!: string;

  @IsString()
  @IsNotEmpty()
  memoria!: string;

  @IsString()
  @IsNotEmpty()
  color!: string;

  @IsString()
  @IsNotEmpty()
  estado_detalle!: string;

  @IsString()
  @IsNotEmpty()
  imei_serie!: string;

  @IsDateString()
  fecha_ingreso!: string;

  @IsNumber()
  precio_compra!: number;
}
