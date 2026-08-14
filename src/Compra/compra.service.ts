import { Injectable, NotFoundException } from '@nestjs/common';
import { Compra } from './entities/compra.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { CreateCompraDTO } from './Dto/createCompra.DTO';
import { UpdateCompraDTO } from './Dto/updateCompra.DTO';
import { Producto } from 'src/Producto/entities/producto.entity';

@Injectable()
export class CompraService {
  constructor(
    @InjectRepository(Compra)
    private readonly repoCompra: Repository<Compra>,
    @InjectRepository(Producto)
    private readonly repoProducto: Repository<Producto>,
  ) {}

  async create(createCompraDto: CreateCompraDTO): Promise<Compra> {
    const producto = await this.repoProducto.findOneBy({
      id_producto: createCompraDto.id_producto,
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    const compra = this.repoCompra.create({
      fecha_compra: createCompraDto.fecha_compra,

      precio_compra: createCompraDto.precio_compra,

      id_producto: producto.id_producto,

      modelo: producto.modelo,
      memoria: producto.memoria,
      color: producto.color,
      estado_detalle: producto.estado_detalle,
      imei_serie: producto.imei_serie,

      producto: producto,
    });

    return this.repoCompra.save(compra);
  }

  async update(id: number, updateCompraDto: UpdateCompraDTO): Promise<Compra> {
    const compra = await this.repoCompra.findOne({ where: { id_compra: id } });
    if (!compra) {
      throw new NotFoundException('Compra no encontrada');
    }
    Object.assign(compra, updateCompraDto);
    return this.repoCompra.save(compra);
  }

  async findAll() {
    return this.repoCompra.find({
      relations: {
        producto: true,
      },
      order: {
        fecha_compra: 'DESC',
      },
    });
  }

  async findById(id: number) {
    return await this.repoCompra.findBy({ id_compra: id });
  }

  async findByDate(date: Date) {
    return await this.repoCompra.findBy({ fecha_compra: date });
  }

  async delete(id: number) {
    const compra = await this.repoCompra.findOne({
      where: { id_compra: id },
    });

    if (!compra) {
      throw new NotFoundException('Compra no encontrada');
    }

    await this.repoCompra.softDelete({
      id_compra: id,
    });

    return {
      message: 'Compra eliminada exitosamente',
    };
  }
}
