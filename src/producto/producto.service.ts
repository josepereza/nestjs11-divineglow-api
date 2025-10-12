import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductoEntity } from './producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(ProductoEntity)
    private readonly productoRepository: Repository<ProductoEntity>,
  ) {
    void this.seedProducts();
  }

  async seedProducts() {
    const count = await this.productoRepository.count();
    if (count === 0) {
      const initialProducts = [
        {
          id: 1,
          name: 'Rosa Perlen Tasche L',
          description:
            'Ein lebhaftes und feminines Design, handgefertigt aus hunderten schillernden Perlen. Die goldene Kette verleiht einen Hauch von Eleganc, perfekt, um bei jedem besonderen Anlass aufzufallen. Inklusive eines einzigartigen Kirschen-Anhängers.',
          price: 89.0,
          imageUrl: '/rosa.jpeg',
          stock: 10,
        },
        {
          id: 2,
          name: 'Weisse Perlen Tasche M',
          description:
            'Zeitlose Eleganz verkörpert in dieser Tasche aus weissen Perlen. Ihre solide Struktur und das klassische Design machen sie zum idealen Begleiter für formelle Anlässe oder um Ihrem Alltagslook eine anspruchsvolle Note zu verleihen.',
          price: 69.0,
          imageUrl: '/weiss.jpeg',
          stock: 15,
        },
        {
          id: 3,
          name: "Mini-Tasche 'AirPods Schutzülle rosa'",
          description:
            'Klein, aber oho! Dieser Mini-Beutel ist dein strahlender Begleiter für die schönsten Momente. Ideal für deine AirPods oder kleine Schätze, mit einem eleganten Perlen-Armband.',
          price: 39.0,
          imageUrl: '/AirPods.jpeg',
          stock: 20,
        },
      ];

      for (const productData of initialProducts) {
        const product = this.productoRepository.create(productData);
        await this.productoRepository.save(product);
      }
      console.log('Productos iniciales insertados con stock.');
    }
  }

  async findAll(): Promise<ProductoEntity[]> {
    return await this.productoRepository.find();
  }

  async findOne(id: number): Promise<ProductoEntity> {
    const producto = await this.productoRepository.findOne({ where: { id } });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado.`);
    }
    return producto;
  }

  async create(createProductoDto: CreateProductoDto): Promise<ProductoEntity> {
    const newProducto = this.productoRepository.create(createProductoDto);
    return await this.productoRepository.save(newProducto);
  }

  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
  ): Promise<ProductoEntity> {
    // 1. Verificar si existe (ya hecho por this.findOne)
    //    Esto lanzará NotFoundException si no existe.
    //    Si llega aquí, 'producto' existe y es de tipo ProductoEntity.
    //  const productoExistente = await this.findOne(id); // Guarda el resultado para futuras referencias si fuera necesario
    // Solo esperamos la llamada a findOne para su efecto secundario (validación de existencia)
    // No necesitamos asignar su valor a una variable si no vamos a usar 'productoExistente'.
    await this.findOne(id);

    // 2. Realizar la actualización
    await this.productoRepository.update(id, updateProductoDto);

    // 3. Recuperar y retornar el producto actualizado.
    //    Sabemos que existe porque `findOne(id)` no lanzó un error.
    //    Usamos la aserción de no nulidad `!` para indicárselo a TypeScript.
    const updatedProducto = await this.productoRepository.findOne({
      where: { id },
    });
    if (!updatedProducto) {
      // Esta situación es lógicamente imposible si findOne(id) antes no falló
      // y si la actualización no borró el registro.
      // Pero es buena práctica manejarla si el contexto fuera más complejo.
      throw new NotFoundException(
        `Producto con ID ${id} no encontrado después de la actualización.`,
      );
    }
    return updatedProducto;
  }

  async remove(id: number): Promise<void> {
    const result = await this.productoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado.`);
    }
  }
}
