import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CelularRecibidoDTO {
  @IsString()
  @IsNotEmpty()
  modelo: string;

  @IsString()
  @IsNotEmpty()
  memoria: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsNotEmpty()
  estado_detalle: string;

  @IsString()
  @IsNotEmpty()
  imei_serie: string;

  @IsNumber()
  precio_compra: number;
}