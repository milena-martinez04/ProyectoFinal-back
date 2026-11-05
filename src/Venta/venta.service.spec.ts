import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VentaService } from './venta.service';
import { Venta } from './entities/venta.entity';
import { Producto } from 'src/Producto/entities/producto.entity';
import { Compra } from 'src/Compra/entities/compra.entity';
import { Usuario } from 'src/Auth/entities/usuario.entity';
import { CreateVentaDTO } from './Dto/createVenta.DTO';
import { UpdateVentaDTO } from './Dto/updateVenta.DTO';

describe('VentaService - Aislamiento por usuario', () => {
  let service: VentaService;
  let repoVenta: any;
  let repoProducto: any;
  let repoCompra: any;
  let repoUsuario: any;

  const usuarioA = { id: 1, email: 'a@gmail.com', googleId: 'google-a' } as Usuario;
  const usuarioB = { id: 2, email: 'b@gmail.com', googleId: 'google-b' } as Usuario;

  const productoA: Producto = {
    id_producto: 10,
    id_usuario: 1,
    modelo: 'iPhone 13',
    memoria: '128GB',
    color: 'Negro',
    estado_detalle: 'Nuevo',
    imei_serie: 'IMEI-A',
    precio_compra: 500,
  } as any;

  const compraA: Compra = {
    id_compra: 100,
    id_producto: 10,
    id_usuario: 1,
    precio_compra: 500,
    producto: productoA,
  } as any;

  // Otro producto del usuario A (id_producto 20)
  const productoB: Producto = {
    id_producto: 20,
    id_usuario: 1,
    modelo: 'iPhone 14',
    memoria: '256GB',
    color: 'Blanco',
    estado_detalle: 'Nuevo',
    imei_serie: 'IMEI-B',
    precio_compra: 600,
  } as any;

  // Compra asociada al producto B
  const compraDeProductoB: Compra = {
    id_compra: 200,
    id_producto: 20,
    id_usuario: 1,
    precio_compra: 600,
    producto: productoB,
  } as any;

  const ventaA: Venta = {
    id_venta: 1000,
    id_usuario: 1,
    id_producto: 10,
    id_compra: 100,
    precio_venta: 700,
    monto: 700,
    fecha_venta: new Date(),
    medio_de_pago: 'efectivo',
    pago_celular: false,
    seña: 0,
    valor_celular_recibido: 0,
    producto: productoA,
    compra: compraA,
  } as any;

  const ventaB: Venta = {
    id_venta: 2000,
    id_usuario: 2,
    id_producto: 20,
    id_compra: 200,
    precio_venta: 800,
    monto: 800,
    fecha_venta: new Date(),
    medio_de_pago: 'efectivo',
    pago_celular: false,
    seña: 0,
    valor_celular_recibido: 0,
  } as any;

  beforeEach(async () => {
    repoVenta = {
      create: jest.fn((dto: any) => dto),
      save: jest.fn((dto: any) => Promise.resolve({ ...dto, id_venta: 9999 })),
      find: jest.fn(),
      findOne: jest.fn(),
      findBy: jest.fn(),
      softDelete: jest.fn(),
    };
    repoProducto = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn(),
    };
    repoCompra = {
      findOneBy: jest.fn(),
      save: jest.fn(),
    };
    repoUsuario = {
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VentaService,
        { provide: getRepositoryToken(Venta), useValue: repoVenta },
        { provide: getRepositoryToken(Producto), useValue: repoProducto },
        { provide: getRepositoryToken(Compra), useValue: repoCompra },
        { provide: getRepositoryToken(Usuario), useValue: repoUsuario },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(async (cb: any) => {
              const manager = {
                getRepository: jest.fn((entity: any) => {
                  if (entity === Venta) return repoVenta;
                  if (entity === Producto) return repoProducto;
                  if (entity === Compra) return repoCompra;
                  if (entity === Usuario) return repoUsuario;
                }),
              };
              return cb(manager);
            }),
          },
        },
      ],
    }).compile();

    service = module.get(VentaService);
  });

  it('findAll debe filtrar solo ventas del usuario autenticado', async () => {
    repoVenta.find.mockResolvedValue([ventaA]);

    const resultado = await service.findAll(usuarioA.id);

    expect(repoVenta.find).toHaveBeenCalledWith({
      where: {
        id_usuario: usuarioA.id,
        fecha_venta: expect.anything(),
      },
      relations: { producto: true },
      order: { fecha_venta: 'DESC' },
    });
    expect(resultado).toEqual([ventaA]);
    expect(resultado).not.toContain(ventaB);
  });

  it('findById debe rechazar venta de otro usuario', async () => {
    repoVenta.findBy.mockResolvedValue([]);

    const resultado = await service.findById(ventaB.id_venta, usuarioA.id);

    expect(repoVenta.findBy).toHaveBeenCalledWith({
      id_venta: ventaB.id_venta,
      id_usuario: usuarioA.id,
    });
    expect(resultado).toEqual([]);
  });

  it('update debe rechazar modificar venta de otro usuario', async () => {
    repoVenta.findOne.mockResolvedValue(null);

    const dto: UpdateVentaDTO = { precio_venta: 999 };

    await expect(
      service.update(ventaB.id_venta, dto, usuarioA.id),
    ).rejects.toThrow(NotFoundException);

    expect(repoVenta.findOne).toHaveBeenCalledWith({
      where: { id_venta: ventaB.id_venta, id_usuario: usuarioA.id },
    });
  });

  it('delete debe rechazar eliminar venta de otro usuario', async () => {
    repoVenta.softDelete.mockResolvedValue({ raw: [], affected: 0 });

    await expect(
      service.delete(ventaB.id_venta, usuarioA.id),
    ).rejects.toThrow(NotFoundException);

    expect(repoVenta.softDelete).toHaveBeenCalledWith({
      id_venta: ventaB.id_venta,
      id_usuario: usuarioA.id,
    });
  });

  it('create debe rechazar si el producto no pertenece al usuario autenticado', async () => {
    repoUsuario.findOneBy.mockResolvedValue(usuarioA);
    repoProducto.findOneBy.mockResolvedValue(null);

    const dto: CreateVentaDTO = {
      id_producto: 999,
      precio_venta: 700,
      medio_de_pago: 'efectivo',
      pago_celular: false,
    } as any;

    await expect(service.create(dto, usuarioA.id)).rejects.toThrow(
      NotFoundException,
    );

    expect(repoProducto.findOneBy).toHaveBeenCalledWith({
      id_producto: 999,
      id_usuario: usuarioA.id,
    });
  });

  it('create con pago_celular debe asociar el nuevo producto y la compra derivada al usuario vendedor', async () => {
    repoUsuario.findOneBy.mockResolvedValue(usuarioA);
    repoProducto.findOneBy.mockResolvedValue(productoA);
    repoCompra.findOneBy.mockResolvedValue(compraA);
    repoVenta.create.mockImplementation((dto: any) => dto);
    repoVenta.save.mockResolvedValue({ ...ventaA, id_venta: 9999, id_usuario: usuarioA.id });

    const nuevoProducto = {
      id_producto: 50,
      id_usuario: usuarioA.id,
      modelo: 'iPhone 12',
      memoria: '128GB',
      color: 'Azul',
      estado_detalle: 'Nuevo',
      imei_serie: 'IMEI-NUEVO',
      fecha_ingreso: new Date(),
      precio_compra: 500,
    } as any;
    repoProducto.create.mockImplementation((dto: any) => dto);
    repoProducto.save.mockResolvedValue(nuevoProducto);

    repoCompra.save.mockResolvedValue({ id_compra: 300, id_usuario: usuarioA.id });

    const dto: CreateVentaDTO = {
      id_producto: 10,
      precio_venta: 700,
      medio_de_pago: 'efectivo',
      pago_celular: true,
      valor_celular_recibido: 500,
      monto: 200,
      seña: 0,
      celular_recibido: {
        modelo: 'iPhone 12',
        memoria: '128GB',
        color: 'Azul',
        estado_detalle: 'Nuevo',
        imei_serie: 'IMEI-NUEVO',
        precio_compra: 500,
      },
    } as any;

    const resultado = await service.create(dto, usuarioA.id);

    expect(resultado.id_usuario).toBe(usuarioA.id);
    expect(repoProducto.create).toHaveBeenCalledWith(
      expect.objectContaining({ id_usuario: usuarioA.id }),
    );
    expect(repoCompra.save).toHaveBeenCalledWith(
      expect.objectContaining({ id_usuario: usuarioA.id }),
    );
    expect(repoVenta.save).toHaveBeenCalledWith(
      expect.objectContaining({ id_usuario: usuarioA.id }),
    );
  });

  it('update debe rechazar cambiar el producto cuando la compra existente no corresponde a ese producto', async () => {
    repoVenta.findOne.mockResolvedValue(ventaA);
    repoProducto.findOneBy.mockResolvedValue(productoB);
    repoCompra.findOneBy.mockResolvedValue(compraA); // compraA.id_producto = 10, productoB.id_producto = 20

    const dto: UpdateVentaDTO = { id_producto: productoB.id_producto } as any;

    await expect(service.update(ventaA.id_venta, dto, usuarioA.id)).rejects.toThrow(
      BadRequestException,
    );

    expect(repoProducto.findOneBy).toHaveBeenCalledWith({
      id_producto: productoB.id_producto,
      id_usuario: usuarioA.id,
    });
    expect(repoCompra.findOneBy).toHaveBeenCalledWith({
      id_compra: ventaA.id_compra,
      id_usuario: usuarioA.id,
    });
  });

  it('update debe rechazar cambiar la compra cuando esta pertenece a otro producto', async () => {
    repoVenta.findOne.mockResolvedValue(ventaA);
    repoCompra.findOneBy.mockResolvedValue(compraDeProductoB); // compraDeProductoB.id_producto = 20, venta.id_producto = 10

    const dto: UpdateVentaDTO = { id_compra: compraDeProductoB.id_compra } as any;

    await expect(service.update(ventaA.id_venta, dto, usuarioA.id)).rejects.toThrow(
      BadRequestException,
    );

    expect(repoCompra.findOneBy).toHaveBeenCalledWith({
      id_compra: compraDeProductoB.id_compra,
      id_usuario: usuarioA.id,
    });
  });

  it('update debe permitir cambiar ambos cuando la compra corresponde al producto nuevo', async () => {
    repoVenta.findOne.mockResolvedValue(ventaA);
    repoProducto.findOneBy.mockResolvedValue(productoB);
    repoCompra.findOneBy.mockResolvedValue(compraDeProductoB); // compraDeProductoB.id_producto = 20 = productoB.id_producto
    repoVenta.save.mockResolvedValue({ ...ventaA, id_venta: ventaA.id_venta });

    const dto: UpdateVentaDTO = {
      id_producto: productoB.id_producto,
      id_compra: compraDeProductoB.id_compra,
    } as any;

    const resultado = await service.update(ventaA.id_venta, dto, usuarioA.id);

    expect(resultado).toBeDefined();
    expect(repoProducto.findOneBy).toHaveBeenCalledWith({
      id_producto: productoB.id_producto,
      id_usuario: usuarioA.id,
    });
    expect(repoCompra.findOneBy).toHaveBeenCalledWith({
      id_compra: compraDeProductoB.id_compra,
      id_usuario: usuarioA.id,
    });
    expect(repoVenta.save).toHaveBeenCalled();
  });

  it('update debe rechazar cambiar ambos cuando la compra no corresponde al producto nuevo', async () => {
    repoVenta.findOne.mockResolvedValue(ventaA);
    repoProducto.findOneBy.mockResolvedValue(productoB); // productoB.id_producto = 20
    repoCompra.findOneBy.mockResolvedValue(compraA); // compraA.id_producto = 10 !== 20

    const dto: UpdateVentaDTO = {
      id_producto: productoB.id_producto,
      id_compra: compraA.id_compra,
    } as any;

    await expect(service.update(ventaA.id_venta, dto, usuarioA.id)).rejects.toThrow(
      BadRequestException,
    );

    expect(repoProducto.findOneBy).toHaveBeenCalledWith({
      id_producto: productoB.id_producto,
      id_usuario: usuarioA.id,
    });
    expect(repoCompra.findOneBy).toHaveBeenCalledWith({
      id_compra: compraA.id_compra,
      id_usuario: usuarioA.id,
    });
  });

  it('update debe mantener el comportamiento actual cuando no se modifica producto ni compra', async () => {
    repoVenta.findOne.mockResolvedValue(ventaA);
    repoVenta.save.mockResolvedValue({ ...ventaA, precio_venta: 999 });

    const dto: UpdateVentaDTO = { precio_venta: 999 };

    const resultado = await service.update(ventaA.id_venta, dto, usuarioA.id);

    expect(repoProducto.findOneBy).not.toHaveBeenCalled();
    expect(repoCompra.findOneBy).not.toHaveBeenCalled();
    expect(repoVenta.save).toHaveBeenCalledWith(
      expect.objectContaining({ precio_venta: 999 }),
    );
    expect(resultado.precio_venta).toBe(999);
  });
});
