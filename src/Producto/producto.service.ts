import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { CreateProductoDTO } from './Dto/createProducto.DTO';
import { UpdateProductoDTO } from './Dto/updateProducto.DTO';
import { Compra } from 'src/Compra/entities/compra.entity';
import { Usuario } from 'src/Auth/entities/usuario.entity';

@Injectable()
export class ProductoServices {
  constructor(
    @InjectRepository(Producto)
    private readonly repoProducto: Repository<Producto>,

    @InjectRepository(Compra)
    private readonly repoCompra: Repository<Compra>,

    @InjectRepository(Usuario)
    private readonly repoUsuario: Repository<Usuario>,
  ) {}

  async create(
    createProductoDto: CreateProductoDTO,
    idUsuario: number,
  ): Promise<Producto> {
    const usuario = await this.repoUsuario.findOneBy({ id: idUsuario });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const producto = this.repoProducto.create({
      modelo: createProductoDto.modelo,
      memoria: createProductoDto.memoria,
      color: createProductoDto.color,
      estado_detalle: createProductoDto.estado_detalle,
      imei_serie: createProductoDto.imei_serie,
      fecha_ingreso: new Date(createProductoDto.fecha_ingreso),
      precio_compra: createProductoDto.precio_compra,
      id_usuario: idUsuario,
      usuario,
    });

    const productoGuardado = await this.repoProducto.save(producto);

    await this.repoCompra.save({
      fecha_compra: new Date(),
      precio_compra: createProductoDto.precio_compra,
      id_producto: productoGuardado.id_producto,
      id_usuario: idUsuario,

      modelo: productoGuardado.modelo,
      memoria: productoGuardado.memoria,
      color: productoGuardado.color,
      estado_detalle: productoGuardado.estado_detalle,
      imei_serie: productoGuardado.imei_serie,
    });

    return productoGuardado;
  }

  async update(
    id: number,
    updateProductoDto: UpdateProductoDTO,
    idUsuario: number,
  ): Promise<Producto> {
    const producto = await this.repoProducto.findOne({
      where: { id_producto: id, id_usuario: idUsuario },
    });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado o no pertenece al usuario');
    }
    if (updateProductoDto.modelo !== undefined) {
      producto.modelo = updateProductoDto.modelo;
    }
    if (updateProductoDto.memoria !== undefined) {
      producto.memoria = updateProductoDto.memoria;
    }
    if (updateProductoDto.color !== undefined) {
      producto.color = updateProductoDto.color;
    }
    if (updateProductoDto.estado_detalle !== undefined) {
      producto.estado_detalle = updateProductoDto.estado_detalle;
    }
    if (updateProductoDto.imei_serie !== undefined) {
      producto.imei_serie = updateProductoDto.imei_serie;
    }
    if (updateProductoDto.fecha_ingreso !== undefined) {
      producto.fecha_ingreso = new Date(updateProductoDto.fecha_ingreso);
    }
    if (updateProductoDto.precio_compra !== undefined) {
      producto.precio_compra = updateProductoDto.precio_compra;
    }
    return this.repoProducto.save(producto);
  }

  async findAll(idUsuario: number) {
    return await this.repoProducto.find({
      where: { id_usuario: idUsuario },
    });
  }

  async findById(id: number, idUsuario: number) {
    return await this.repoProducto.findBy({
      id_producto: id,
      id_usuario: idUsuario,
    });
  }

  async findByDate(date: Date, idUsuario: number) {
    return await this.repoProducto.findBy({
      fecha_ingreso: date,
      id_usuario: idUsuario,
    });
  }

  async findByModel(modelo: string, idUsuario: number) {
    return await this.repoProducto.findBy({
      modelo: modelo,
      id_usuario: idUsuario,
    });
  }

  async delete(id: number, idUsuario: number) {
    const producto = await this.repoProducto.findOne({
      where: { id_producto: id, id_usuario: idUsuario },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado o no pertenece al usuario');
    }

    await this.repoProducto.softDelete({ id_producto: id, id_usuario: idUsuario });

    return { message: 'Producto eliminado' };
  }
}
