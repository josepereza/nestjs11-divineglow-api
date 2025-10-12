import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { PedidoEntity } from './pedido.entity';
import { LineaPedidoEntity } from '../linea-pedido/linea-pedido.entity';
import { ProductoEntity } from '../producto/producto.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(PedidoEntity)
    private readonly pedidoRepository: Repository<PedidoEntity>,
    @InjectRepository(LineaPedidoEntity)
    private readonly lineaPedidoRepository: Repository<LineaPedidoEntity>,
    @InjectRepository(ProductoEntity)
    private readonly productoRepository: Repository<ProductoEntity>,
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<PedidoEntity[]> {
    return this.pedidoRepository.find({
      relations: ['lineasPedido', 'lineasPedido.producto'],
    });
  }

  async findOne(id: number): Promise<PedidoEntity> {
    const pedido = await this.pedidoRepository.findOne({
      where: { id },
      relations: ['lineasPedido', 'lineasPedido.producto'],
    });
    if (!pedido) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado.`);
    }
    return pedido;
  }

  async create(createPedidoDto: CreatePedidoDto): Promise<PedidoEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { lineas, ...pedidoData } = createPedidoDto;

      const productoIds = lineas.map((linea) => linea.productoId);
      const productos: ProductoEntity[] = await queryRunner.manager.find(
        ProductoEntity,
        {
          where: { id: In(productoIds) },
          lock: { mode: 'pessimistic_write' },
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (productos.length !== productoIds.length) {
        throw new BadRequestException(
          'Uno o más productos no fueron encontrados.',
        );
      }

      let totalAmount = 0;
      const lineasPedido: LineaPedidoEntity[] = [];
      const stockUpdates: Array<{ id: number; stock: number }> = [];

      // eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      for (const lineaDto of lineas) {
        const producto: ProductoEntity | undefined = productos.find(
          (p) => p.id === lineaDto.productoId,
        );
        if (!producto) {
          throw new BadRequestException(
            `Producto con ID ${lineaDto.productoId} no encontrado.`,
          );
        }

        if (producto.stock < lineaDto.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para el producto: ${producto.name}. Stock disponible: ${producto.stock}, solicitado: ${lineaDto.cantidad}`,
          );
        }

        const linea = new LineaPedidoEntity();
        linea.producto = producto!;
        linea.cantidad = lineaDto.cantidad;
        linea.precioUnitario = producto.price;
        linea.total = linea.cantidad * linea.precioUnitario;
        lineasPedido.push(linea);
        totalAmount += linea.total;

        stockUpdates.push({
          id: producto.id,
          stock: producto.stock - lineaDto.cantidad,
        });
      }
      // eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call

      const nuevoPedido = queryRunner.manager.create(PedidoEntity, {
        ...pedidoData,
        lineasPedido,
        totalAmount,
      });
      await queryRunner.manager.save(nuevoPedido); // eslint-disable-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument

      for (const update of stockUpdates) {
        await queryRunner.manager.update(ProductoEntity, update.id, {
          stock: update.stock,
        }); // eslint-disable-line @typescript-eslint/no-unsafe-argument
      }

      await queryRunner.commitTransaction();
      return nuevoPedido;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      console.error('Error al crear pedido y actualizar stock:', error);
      throw new InternalServerErrorException(
        'Error interno al procesar el pedido.',
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: number,
    updatePedidoDto: UpdatePedidoDto,
  ): Promise<PedidoEntity> {
    await this.findOne(id);
    // Realizamos un casting explícito a Partial<PedidoEntity>
    await this.pedidoRepository.update(
      id,
      updatePedidoDto as Partial<PedidoEntity>,
    );
    const updatedPedido = await this.pedidoRepository.findOne({
      where: { id },
      relations: ['lineasPedido', 'lineasPedido.producto'],
    });
    if (!updatedPedido) {
      throw new NotFoundException(
        `Pedido con ID ${id} no encontrado después de la actualización.`,
      );
    }
    return updatedPedido;
  }

  async remove(id: number): Promise<void> {
    const result = await this.pedidoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado.`);
    }
  }
}
