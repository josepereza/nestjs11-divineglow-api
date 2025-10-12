import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { LineaPedidoEntity } from '../linea-pedido/linea-pedido.entity';

@Entity('productos')
export class ProductoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column()
  imageUrl: string;

  @Column({ type: 'int', default: 0 }) // Nueva columna para el stock
  stock: number;
  @OneToMany(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    () => LineaPedidoEntity,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    (lineaPedido: LineaPedidoEntity) => lineaPedido.producto,
  )
  lineasPedido: LineaPedidoEntity[];
}
