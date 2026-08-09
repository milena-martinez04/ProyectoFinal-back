import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm/repository/Repository.js';
import { Venta } from '../Venta/entities/venta.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Raw } from 'typeorm';

@Injectable()
export class GananciaService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepo: Repository<Venta>,
  ) {}

  async gananciaMensual(mes: number, anio: number) {
    const ventas = await this.ventaRepo.find({
      where: {
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

  async gananciaSemanal(fecha: string) {
    const fechaBase = new Date(fecha);

    const inicioSemana = new Date(fechaBase);
    inicioSemana.setDate(fechaBase.getDate() - fechaBase.getDay() + 1);

    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);

    const ventas = await this.ventaRepo.find({
      where: {
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

  async resumenGanancias() {
    const ventas = await this.ventaRepo.find({
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