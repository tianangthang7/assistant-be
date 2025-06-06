import { Injectable, Logger } from '@nestjs/common';
import { FileDto, LlmParserService } from '@libs/llm-parser';
import { InvoiceCheckerService } from '@libs/invoice-checker';
import { SupabaseService } from '@libs/supabase';

@Injectable()
export class UploadService {
  constructor(
    private readonly llmParserService: LlmParserService,
    private readonly invoiceCheckerService: InvoiceCheckerService,
    private readonly supabaseService: SupabaseService
  ) {}

  async upload(file: FileDto) {
    console.time('parse');
    const invoices = await this.llmParserService.parse(file);
    console.timeEnd('parse');

    // for (const invoice of invoices) {
    //   const checkedInvoice = await this.invoiceCheckerService.check(invoice);
    //   const { data, error } = await this.supabaseService.client
    //     .from('invoices')
    //     .update(checkedInvoice)
    //     .eq('id', invoice.id);
    //   if (error) {
    //     throw new Error(error.message);
    //   }
    // }
  }
}
