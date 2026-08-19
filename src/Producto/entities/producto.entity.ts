import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('producto')
export class Producto {
  @PrimaryGeneratedColumn('increment')
  id_producto: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  modelo: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  memoria: string;

  @Column({ type: 'varchar', length: 30, nullable: false })
  color: string;

  @Column({ type: 'text' })
  estado_detalle: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  imei_serie: string;

  @Column({ type: 'date', nullable: false })
  fecha_ingreso: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precio_compra: number | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true, select: false })
  deleted_at: Date;
}
