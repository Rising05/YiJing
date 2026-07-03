import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './modules/auth/auth.module'
import { GenerationModule } from './modules/generation/generation.module'
import { HealthModule } from './modules/health/health.module'
import { HistoryModule } from './modules/history/history.module'
import { PrismaModule } from './modules/prisma/prisma.module'
import { UserModule } from './modules/user/user.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    HealthModule,
    GenerationModule,
    HistoryModule,
    UserModule,
  ],
})
export class AppModule {}
