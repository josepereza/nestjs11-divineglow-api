import { IsNumber, Min } from 'class-validator';

export class CreateLineaPedidoDto {
  @IsNumber()
  @Min(1)
  productoId: number;

  @IsNumber()
  @Min(1)
  cantidad: number;
}
