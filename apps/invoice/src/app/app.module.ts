import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { InvoiceCheckerModule } from '@libs/invoice-checker';
import { UploadModule } from '@libs/upload';
@Module({
  imports: [UploadModule, ConfigModule.forRoot(), InvoiceCheckerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
