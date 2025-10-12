import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ProductoEntity } from '../producto/producto.entity';
import { PedidoEntity } from '../pedido/pedido.entity';

@Entity('lineas_pedido')
export class LineaPedidoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number; // cantidad * precioUnitario

  // ESLint a veces tiene problemas para inferir tipos en lambdas de relación con configuraciones estrictas.
  // Desactivamos la regla no-unsafe-return para esta línea si es necesario.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => ProductoEntity, (producto) => producto.lineasPedido, {
    eager: true,
  })
  producto!: ProductoEntity;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => PedidoEntity, (pedido) => pedido.lineasPedido)
  pedido: PedidoEntity;
}
