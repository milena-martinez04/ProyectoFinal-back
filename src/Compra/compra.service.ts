import { Injectable, NotFoundException } from '@nestjs/common';
import { Compra } from './entities/compra.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCompraDTO } from './Dto/createCompra.DTO';
import { UpdateCompraDTO } from './Dto/updateCompra.DTO';
import { Producto } from 'src/Producto/entities/producto.entity';
import { Usuario } from 'src/Auth/entities/usuario.entity';

@Injectable()
export class CompraService {
  constructor(
    @InjectRepository(Compra)
    private readonly repoCompra: Repository<Compra>,
    @InjectRepository(Producto)
    private readonly repoProducto: Repository<Producto>,
    @InjectRepository(Usuario)
    private readonly repoUsuario: Repository<Usuario>,
  ) {}

  async create(createCompraDto: CreateCompraDTO, idUsuario: number): Promise<Compra> {
    const usuario = await this.repoUsuario.findOneBy({ id: idUsuario });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const producto = await this.repoProducto.findOneBy({
      id_producto: createCompraDto.id_producto,
      id_usuario: idUsuario,
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado o no pertenece al usuario');
    }

    const compra = this.repoCompra.create({
      fecha_compra: createCompraDto.fecha_compra,
      precio_compra: createCompraDto.precio_compra,
      id_producto: producto.id_producto,
      id_usuario: idUsuario,
      usuario,

      modelo: producto.modelo,
      memoria: producto.memoria,
      color: producto.color,
      estado_detalle: producto.estado_detalle,
      imei_serie: producto.imei_serie,

      producto: producto,
    });

    return this.repoCompra.save(compra);
  }

  async update(id: number, updateCompraDto: UpdateCompraDTO, idUsuario: number): Promise<Compra> {
    const compra = await this.repoCompra.findOne({ where: { id_compra: id, id_usuario: idUsuario } });
    if (!compra) {
      throw new NotFoundException('Compra no encontrada o no pertenece al usuario');
    }
    if (updateCompraDto.fecha_compra !== undefined) {
      compra.fecha_compra = new Date(updateCompraDto.fecha_compra);
    }
    if (updateCompraDto.precio_compra !== undefined) {
      compra.precio_compra = updateCompraDto.precio_compra;
    }
    if (updateCompraDto.id_producto !== undefined) {
      compra.id_producto = updateCompraDto.id_producto;
    }
    return this.repoCompra.save(compra);
  }

  async findAll(idUsuario: number) {
    return this.repoCompra.find({
      where: { id_usuario: idUsuario },
      relations: {
        producto: true,
      },
      order: {
        fecha_compra: 'DESC',
      },
    });
  }

  async findById(id: number, idUsuario: number) {
    return await this.repoCompra.findBy({ id_compra: id, id_usuario: idUsuario });
  }

  async findByDate(date: Date, idUsuario: number) {
    return await this.repoCompra.findBy({ fecha_compra: date, id_usuario: idUsuario });
  }

  async delete(id: number, idUsuario: number) {
    const compra = await this.repoCompra.findOne({
      where: { id_compra: id, id_usuario: idUsuario },
    });

    if (!compra) {
      throw new NotFoundException('Compra no encontrada o no pertenece al usuario');
    }

    await this.repoCompra.softDelete({
      id_compra: id,
      id_usuario: idUsuario,
    });

    return {
      message: 'Compra eliminada exitosamente',
    };
  }
}
