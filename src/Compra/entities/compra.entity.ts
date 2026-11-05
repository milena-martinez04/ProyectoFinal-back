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
import { Usuario } from '../../Auth/entities/usuario.entity';

@Entity('compra')
export class Compra {
  @PrimaryGeneratedColumn('increment')
  id_compra: number;

  @Column({ type: 'int' })
  id_usuario: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({
    name: 'id_usuario',
  })
  usuario: Usuario;

  @Column({ type: 'date' })
  fecha_compra: Date;

  @Column({ type: 'int' })
  precio_compra: number;

  @Column()
  id_producto: number;

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

  @ManyToOne(() => Producto)
  @JoinColumn({
    name: 'id_producto',
  })
  producto: Producto;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
