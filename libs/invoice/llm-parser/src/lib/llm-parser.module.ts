import { Module } from '@nestjs/common';
import { LlmParserService } from './llm-parser.service';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from '@libs/supabase';
@Module({
  imports: [ConfigModule, SupabaseModule],
  providers: [LlmParserService],
  exports: [LlmParserService],
})
export class LlmParserModule {}
