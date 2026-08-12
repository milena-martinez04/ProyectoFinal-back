import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { CreateProductoDTO } from './Dto/createProducto.DTO';
import { UpdateProductoDTO } from './Dto/updateProducto.DTO';
import { Compra } from 'src/Compra/entities/compra.entity';

@Injectable()
export class ProductoServices {
  constructor(
    @InjectRepository(Producto)
    private readonly repoProducto: Repository<Producto>,

    @InjectRepository(Compra)
    private readonly repoCompra: Repository<Compra>,
  ) {}

  async create(createProductoDto: CreateProductoDTO): Promise<Producto> {
    const producto = this.repoProducto.create({
      modelo: createProductoDto.modelo,
      memoria: createProductoDto.memoria,
      color: createProductoDto.color,
      estado_detalle: createProductoDto.estado_detalle,
      imei_serie: createProductoDto.imei_serie,
      fecha_ingreso: new Date(createProductoDto.fecha_ingreso),
    });

    const productoGuardado = await this.repoProducto.save(producto);

    await this.repoCompra.save({
      fecha_compra: new Date(),
      precio_compra: createProductoDto.precio_compra,
      id_producto: productoGuardado.id_producto,

      modelo: productoGuardado.modelo,
      memoria: productoGuardado.memoria,
      color: productoGuardado.color,
      estado_detalle: productoGuardado.estado_detalle,
      imei_serie: productoGuardado.imei_serie,
    });

    return productoGuardado;
  }

  async update(id: number, updateProductoDto: UpdateProductoDTO): Promise<Producto> {
    const producto = await this.repoProducto.findOne({
      where: { id_producto: id },
    });
    if (!producto) {
      throw new NotFoundException('Producto not found');
    }
    Object.assign(producto, updateProductoDto);
    return this.repoProducto.save(producto);
  }

  async findAll() {
    return await this.repoProducto.find();
  }

  async findById(id: number) {
    return await this.repoProducto.findBy({ id_producto: id });
  }

  async findByDate(date: Date) {
    return await this.repoProducto.findBy({ fecha_ingreso: date });
  }

  async findByModel(modelo: string) {
    return await this.repoProducto.findBy({ modelo: modelo });
  }

  async delete(id: number) {
    const producto = await this.repoProducto.softDelete({ id_producto: id });
    if (!producto) {
      throw new NotFoundException('Producto not found');
    }

    return { message: 'Producto eliminado' };
  }
}
