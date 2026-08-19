import {
  IsOptional,
  IsDateString,
  IsNumber,
  IsString,
  IsBoolean,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { CelularRecibidoDTO } from '../../Celular/TomarCelularDto';

export class CreateVentaDTO {
  @IsOptional()
  @IsDateString()
  fecha_venta?: string;

  @IsOptional()
  @IsNumber()
  precio_venta?: number;

  @IsOptional()
  @IsString()
  medio_de_pago?: string;

  @IsOptional()
  @IsNumber()
  monto?: number;

  @IsOptional()
  @IsBoolean()
  pago_celular?: boolean;

  @IsOptional()
  @IsNumber()
  seña?: number;

  @IsOptional()
  @IsNumber()
  valor_celular_recibido?: number;

  @IsOptional()
  @IsNumber()
  id_producto?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CelularRecibidoDTO)
  celular_recibido?: CelularRecibidoDTO;
}