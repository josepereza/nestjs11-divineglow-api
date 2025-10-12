import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { LineaPedidoEntity } from '../linea-pedido/linea-pedido.entity';

@Entity('pedidos')
export class PedidoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerName: string;

  @Column()
  customerEmail: string;

  @Column()
  customerAddress: string;

  @CreateDateColumn({ type: 'timestamp' })
  orderDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @OneToMany(() => LineaPedidoEntity, (lineaPedido) => lineaPedido.pedido, {
    cascade: true,
  })
  lineasPedido: LineaPedidoEntity[];
}
