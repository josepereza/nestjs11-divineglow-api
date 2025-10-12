import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Habilita la validación global de DTOs usando class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades que no están definidas en el DTO
      forbidNonWhitelisted: true, // Lanza un error si hay propiedades no permitidas
      transform: true, // Transforma los objetos de entrada a instancias del DTO
      transformOptions: {
        enableImplicitConversion: true, // Permite la conversión implícita de tipos (ej: string a number para @Param)
      },
    }),
  );
  await app.listen(3000);
}
void bootstrap();
