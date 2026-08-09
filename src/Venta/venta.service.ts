import { Injectable, NotFoundException } from '@nestjs/common';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { Venta } from './entities/venta.entity';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { CreateVentaDTO } from './Dto/createVenta.DTO';
import { UpdateVentaDTO } from './Dto/updateVenta.DTO';
import { Producto } from 'src/Producto/entities/producto.entity';
import { Compra } from 'src/Compra/entities/compra.entity';

@Injectable()
export class VentaService {
  constructor(
    @InjectRepository(Venta)
    private readonly repoVenta: Repository<Venta>,

    @InjectRepository(Producto)
    private readonly repoProducto: Repository<Producto>,

    @InjectRepository(Compra)
    private readonly repoCompra: Repository<Compra>,
  ) {}

  async create(createVentaDto: CreateVentaDTO): Promise<Venta> {
    const producto = await this.repoProducto.findOneBy({
      id_producto: createVentaDto.id_producto,
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    const compra = await this.repoCompra.findOneBy({
      id_producto: producto.id_producto,
    });

    if (!compra) {
      throw new NotFoundException('Compra del producto no encontrada');
    }

    const venta = this.repoVenta.create({
      fecha_venta: createVentaDto.fecha_venta,

      precio_venta: createVentaDto.precio_venta,

      medio_de_pago: createVentaDto.medio_de_pago,

      monto: createVentaDto.monto,

      pago_celular: createVentaDto.pago_celular,

      seña: createVentaDto.seña,

      id_producto: producto.id_producto,

      modelo: producto.modelo,

      memoria: producto.memoria,

      color: producto.color,

      estado_detalle: producto.estado_detalle,

      imei_serie: producto.imei_serie,

      // datos de compra
      precio_compra: compra.precio_compra,

      id_compra: compra.id_compra,
    });

    const ventaGuardada = await this.repoVenta.save(venta);

    await this.repoProducto.softDelete({
      id_producto: producto.id_producto,
    });

    return ventaGuardada;
  }
  
  async update(id: number, updateVentaDto: UpdateVentaDTO): Promise<Venta> {
    const venta = await this.repoVenta.findOne({ where: { id_venta: id } });
    if (!venta) {
      throw new NotFoundException('Venta no encontrada');
    }
    Object.assign(venta, updateVentaDto);
    return this.repoVenta.save(venta);
  }

  async findAll() {
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);

    return this.repoVenta.find({
      where: {
        fecha_venta: MoreThanOrEqual(haceUnMes),
      },
      relations: {
        producto: true,
      },
      order: {
        fecha_venta: 'DESC',
      },
    });
  }

  async findById(id: number) {
    return await this.repoVenta.findBy({ id_venta: id });
  }

  async findByDate(date: Date) {
    return await this.repoVenta.findBy({ fecha_venta: date });
  }

  async delete(id: number) {
    const venta = await this.repoVenta.softDelete({ id_venta: id });
    if (!venta) {
      throw new NotFoundException('Venta no encontrada');
    }

    return { message: 'Venta eliminada exitosamente' };
  }
}
