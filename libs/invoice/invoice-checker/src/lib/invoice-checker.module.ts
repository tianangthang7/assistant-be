import { Module } from '@nestjs/common';
import { InvoiceCheckerService } from './invoice-checker.service';
import { CaptchaModule } from '@libs/captcha';
import { InvoiceCheckerController } from './invoice-checker.controller';
import { SupabaseModule } from '@libs/supabase';

@Module({
  imports: [CaptchaModule, SupabaseModule],
  controllers: [InvoiceCheckerController],
  providers: [InvoiceCheckerService],
  exports: [InvoiceCheckerService],
})
export class InvoiceCheckerModule {}
