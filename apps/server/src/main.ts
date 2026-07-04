import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { HttpErrorFilter } from './common/filters/http-error.filter'
import { createValidationException } from './common/validation-error'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api')
  app.enableCors({
    origin: true,
    credentials: true,
  })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: createValidationException,
    }),
  )
  app.useGlobalFilters(new HttpErrorFilter())
  const port = Number(process.env.PORT ?? 3000)
  await app.listen(port)
}

void bootstrap()
