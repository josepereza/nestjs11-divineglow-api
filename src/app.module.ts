import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Importa las entidades
import { ProductoEntity } from './producto/producto.entity';
import { LineaPedidoEntity } from './linea-pedido/linea-pedido.entity';
import { PedidoEntity } from './pedido/pedido.entity';

// Importa los servicios y controladores
import { ProductosService } from './producto/producto.service';
import { ProductosController } from './producto/producto.controller';
import { PedidosService } from './pedido/pedido.service';
import { PedidosController } from './pedido/pedido.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que el ConfigService esté disponible globalmente
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        entities: [ProductoEntity, LineaPedidoEntity, PedidoEntity],
        synchronize: true, // Esto sincroniza el esquema de la base de datos con tus entidades.
        // ¡Usar con precaución en producción, puede causar pérdida de datos!
        // Para producción, usa migraciones.
      }),
    }),
    TypeOrmModule.forFeature([ProductoEntity, LineaPedidoEntity, PedidoEntity]),
  ],
  controllers: [ProductosController, PedidosController],
  providers: [ProductosService, PedidosService],
})
export class AppModule {}
