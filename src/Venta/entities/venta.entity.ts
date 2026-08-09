import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Producto } from '../../Producto/entities/producto.entity';
import { Compra } from 'src/Compra/entities/compra.entity';

@Entity('venta')
export class Venta {
  @PrimaryGeneratedColumn('increment')
  id_venta!: number;

  @Column({ type: 'date', nullable: false })
  fecha_venta!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  precio_venta!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  medio_de_pago!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  monto!: number;

  @Column({ type: 'boolean', nullable: false })
  pago_celular!: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  seña!: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true, select: false })
  deleted_at!: Date;

  @Column({ type: 'varchar', length: 50 })
  modelo: string;

  @Column({ type: 'varchar', length: 20 })
  memoria: string;

  @Column({ type: 'varchar', length: 30 })
  color: string;

  @Column({ type: 'text' })
  estado_detalle: string;

  @Column({ type: 'varchar', length: 50 })
  imei_serie: string;

  @Column()
  id_producto: number;

  @Column({ type: 'int', nullable: true })
  valor_celular_recibido: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_compra: number;

  @Column()
  id_compra: number;

  @ManyToOne(() => Compra)
  @JoinColumn({
    name: 'id_compra',
  })
  compra: Compra;

  @ManyToOne(() => Producto)
  @JoinColumn({
    name: 'id_producto',
  })
  producto: Producto;
}
