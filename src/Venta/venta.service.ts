import {Injectable, NotFoundException, BadRequestException} from '@nestjs/common';
import { DataSource, MoreThanOrEqual, Repository } from 'typeorm';
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

    private readonly dataSource: DataSource,
  ) {}

  async create(createVentaDto: CreateVentaDTO): Promise<Venta> {
    return await this.dataSource.transaction(async (manager) => {
      const ventaRepo = manager.getRepository(Venta);

      const productoRepo = manager.getRepository(Producto);

      const compraRepo = manager.getRepository(Compra);

      const producto = await productoRepo.findOneBy({
        id_producto: createVentaDto.id_producto,
      });

      if (!producto) {
        throw new NotFoundException('Producto no encontrado');
      }

      const compra = await compraRepo.findOneBy({
        id_producto: producto.id_producto,
      });

      if (!compra) {
        throw new NotFoundException('Compra del producto no encontrada');
      }


      const precioVenta = Number(createVentaDto.precio_venta) || 0;

      const pagoCelular = createVentaDto.pago_celular === true;

      const valorCelularRecibido = pagoCelular
        ? Number(createVentaDto.valor_celular_recibido) || 0
        : 0;

      const monto = pagoCelular
        ? Number(createVentaDto.monto) || 0
        : precioVenta;
      if (precioVenta <= 0) {
        throw new BadRequestException('El precio de venta debe ser mayor a 0');
      }

      if (!createVentaDto.medio_de_pago) {
        throw new BadRequestException('Debe seleccionar un medio de pago');
      }

      if (pagoCelular) {
        if (valorCelularRecibido <= 0) {
          throw new BadRequestException(
            'Debe ingresar el valor del celular recibido',
          );
        }

        if (monto < 0) {
          throw new BadRequestException(
            'El monto en efectivo/transferencia no puede ser negativo',
          );
        }

        if (!createVentaDto.celular_recibido) {
          throw new BadRequestException(
            'Debe ingresar los datos del celular recibido',
          );
        }

        const totalRecibido = valorCelularRecibido + monto;

        const diferencia = Math.abs(totalRecibido - precioVenta);

        if (diferencia > 0.01) {
          throw new BadRequestException(
            `Los valores no coinciden. ` +
              `Celular: ${valorCelularRecibido.toFixed(2)} + ` +
              `efectivo/transferencia: ${monto.toFixed(2)} = ` +
              `${totalRecibido.toFixed(
                2,
              )}, pero el precio total de venta es ${precioVenta.toFixed(2)}`,
          );
        }
      }

      const venta = ventaRepo.create({
        fecha_venta: createVentaDto.fecha_venta,
        precio_venta: precioVenta,
        medio_de_pago: createVentaDto.medio_de_pago,
        monto,
        pago_celular: pagoCelular,
        seña: Number(createVentaDto.seña) || 0,
        valor_celular_recibido: valorCelularRecibido,
        id_producto: producto.id_producto,
        modelo: producto.modelo,
        memoria: producto.memoria,
        color: producto.color,
        estado_detalle: producto.estado_detalle,
        imei_serie: producto.imei_serie,
        precio_compra: Number(compra.precio_compra),
        id_compra: compra.id_compra,
      });

      const ventaGuardada = await ventaRepo.save(venta);

      if (pagoCelular && createVentaDto.celular_recibido) {
        const celular = createVentaDto.celular_recibido;
        const nuevoProducto = productoRepo.create({
          modelo: celular.modelo,
          memoria: celular.memoria,
          color: celular.color,
          estado_detalle: celular.estado_detalle,
          imei_serie: celular.imei_serie,
          fecha_ingreso: new Date(),
          precio_compra: valorCelularRecibido,
        });

        const nuevoProductoGuardado = await productoRepo.save(nuevoProducto);

        await compraRepo.save({
          fecha_compra: new Date(),

          precio_compra: valorCelularRecibido,

          id_producto: nuevoProductoGuardado.id_producto,

          modelo: nuevoProductoGuardado.modelo,

          memoria: nuevoProductoGuardado.memoria,

          color: nuevoProductoGuardado.color,

          estado_detalle: nuevoProductoGuardado.estado_detalle,

          imei_serie: nuevoProductoGuardado.imei_serie,

          producto: nuevoProductoGuardado,
        });
      }

      await productoRepo.softDelete({
        id_producto: producto.id_producto,
      });

      return ventaGuardada;
    });
  }

  async update(id: number, updateVentaDto: UpdateVentaDTO): Promise<Venta> {
    const venta = await this.repoVenta.findOne({
      where: {
        id_venta: id,
      },
    });

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
    return await this.repoVenta.findBy({
      id_venta: id,
    });
  }

  async findByDate(date: Date) {
    return await this.repoVenta.findBy({
      fecha_venta: date,
    });
  }

  async delete(id: number) {
    const venta = await this.repoVenta.softDelete({
      id_venta: id,
    });

    if (!venta) {
      throw new NotFoundException('Venta no encontrada');
    }

    return {
      message: 'Venta eliminada exitosamente',
    };
  }
}