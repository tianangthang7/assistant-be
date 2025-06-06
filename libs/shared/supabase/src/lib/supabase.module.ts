import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
