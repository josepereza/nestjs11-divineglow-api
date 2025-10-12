import {
  IsString,
  IsEmail,
  IsArray,
  ValidateNested,
  IsInt,
  IsNotEmpty,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LineaPedidoDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  productoId: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  cantidad: number;
}

export class CreatePedidoDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @IsString()
  @IsNotEmpty()
  customerAddress: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineaPedidoDto)
  lineas: LineaPedidoDto[];
}
