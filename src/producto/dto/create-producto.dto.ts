import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  IsPositive,
} from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  // --- CAMBIOS CLAVE AQUÍ ---
  // Quitamos @IsDecimal
  // Añadimos @IsNumber y @Type(() => Number) para una validación robusta de decimales
  @IsNumber({}, { message: 'El precio debe ser un número válido.' })
  @IsPositive({ message: 'El precio debe ser un valor positivo.' }) // Esto es similar a @Min(0), pero más semántico para precios.
  @Type(() => Number) // ¡IMPORTANTE! Convierte el string de la petición a number.
  price: number;
  // --- FIN DE CAMBIOS ---

  @IsNotEmpty()
  imageUrl: string;

  @IsNumber()
  @Min(0)
  stock: number; // Nuevo campo para el stock
}
