import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { LlmParserModule } from '@libs/llm-parser';
import { InvoiceCheckerModule } from '@libs/invoice-checker';
import { UploadService } from './upload.service';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from '@libs/supabase';

@Module({
  imports: [
    LlmParserModule,
    InvoiceCheckerModule,
    ConfigModule,
    SupabaseModule,
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
