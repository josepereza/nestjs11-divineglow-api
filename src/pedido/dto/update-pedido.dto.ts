import { PartialType } from '@nestjs/mapped-types';
import { CreatePedidoDto } from './create-pedido.dto';

// PartialType<CreatePedidoDto> toma todas las propiedades de CreatePedidoDto
// y las hace opcionales (por ejemplo, customerName?: string;).
export class UpdatePedidoDto extends PartialType(CreatePedidoDto) {
  // Puedes añadir o sobrescribir propiedades aquí si el DTO de actualización
  // necesita ser diferente al de creación (aparte de ser parcial).
}
