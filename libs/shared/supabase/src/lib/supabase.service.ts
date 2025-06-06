import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabaseClient!: SupabaseClient;
  private readonly configService: ConfigService;

  constructor(configService: ConfigService) {
    this.configService = configService;
  }

  onModuleInit() {
    this.supabaseClient = createClient(
      this.configService.get('SUPABASE_URL')!,
      this.configService.get('SUPABASE_ANON_KEY')!
    );
  }

  get client(): SupabaseClient {
    return this.supabaseClient;
  }
}
