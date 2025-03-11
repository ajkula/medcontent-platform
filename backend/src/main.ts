import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpAdapterHost } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Obtenir l'instance HttpAdapterHost
  const httpAdapter = app.get(HttpAdapterHost);
  
  // config CORS
  app.enableCors();

  await app.listen(3001);
}
bootstrap();
