import {
  IsString,
  IsDateString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class UpdateProductoDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  modelo?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  memoria?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  color?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  estado_detalle?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  imei_serie?: string;

  @IsOptional()
  @IsDateString()
  fecha_ingreso?: Date;

  @IsOptional()
  @IsNumber()
  precio_compra?: number;
}
