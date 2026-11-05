import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Venta } from '../Venta/entities/venta.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Raw } from 'typeorm';
import { Usuario } from '../Auth/entities/usuario.entity';

@Injectable()
export class GananciaService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepo: Repository<Venta>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async gananciaMensual(mes: number, anio: number, idUsuario: number) {
    const usuario = await this.usuarioRepo.findOneBy({ id: idUsuario });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
      throw new BadRequestException('El mes debe ser un número entero entre 1 y 12');
    }

    const anioActual = new Date().getFullYear();
    if (!Number.isInteger(anio) || anio < 1900 || anio > anioActual + 1) {
      throw new BadRequestException(
        `El año debe ser un número entero entre 1900 y ${anioActual + 1}`,
      );
    }

    const ventas = await this.ventaRepo.find({
      where: {
        id_usuario: idUsuario,
        fecha_venta: Raw(
          (fecha) => `MONTH(${fecha}) = ${mes} AND YEAR(${fecha}) = ${anio}`,
        ),
      },
    });

    let totalVentas = 0;
    let totalCompras = 0;

    for (const venta of ventas) {
      totalVentas += Number(venta.precio_venta);
      totalCompras += Number(venta.precio_compra);
    }

    return {
      totalVentas,
      totalCompras,
      ganancia: totalVentas - totalCompras,
    };
  }

  async gananciaSemanal(fecha: string, idUsuario: number) {
    const usuario = await this.usuarioRepo.findOneBy({ id: idUsuario });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const fechaBase = new Date(fecha);
    const inicioSemana = new Date(fechaBase);
    inicioSemana.setDate(fechaBase.getDate() - fechaBase.getDay() + 1);
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);

    const ventas = await this.ventaRepo.find({
      where: {
        id_usuario: idUsuario,
        fecha_venta: Between(inicioSemana, finSemana),
      },
    });

    let totalVentas = 0;
    let totalCompras = 0;

    for (const venta of ventas) {
      totalVentas += Number(venta.precio_venta);
      totalCompras += Number(venta.precio_compra);
    }

    return {
      inicioSemana,
      finSemana,
      totalVentas,
      totalCompras,
      ganancia: totalVentas - totalCompras,
    };
  }

  async resumenGanancias(idUsuario: number) {
    const usuario = await this.usuarioRepo.findOneBy({ id: idUsuario });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const ventas = await this.ventaRepo.find({
      where: {
        id_usuario: idUsuario,
      },
      order: {
        fecha_venta: 'ASC',
      },
    });

    const resumen = new Map<
      string,
      {
        mes: number;
        anio: number;
        totalVentas: number;
        totalCompras: number;
        ganancia: number;
      }
    >();

    for (const venta of ventas) {
      const fecha = new Date(venta.fecha_venta);
      const mes = fecha.getMonth() + 1;
      const anio = fecha.getFullYear();
      const key = `${anio}-${mes}`;

      if (!resumen.has(key)) {
        resumen.set(key, {
          mes,
          anio,
          totalVentas: 0,
          totalCompras: 0,
          ganancia: 0,
        });
      }

      const item = resumen.get(key)!;
      item.totalVentas += Number(venta.precio_venta);
      item.totalCompras += Number(venta.precio_compra);
      item.ganancia += Number(venta.precio_venta) - Number(venta.precio_compra);
    }

    return Array.from(resumen.values());
  }
}
