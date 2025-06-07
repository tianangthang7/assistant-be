import { Injectable, Logger } from '@nestjs/common';
import { FileDto, InvoiceDto, LlmParserService } from '@libs/llm-parser';
import { InvoiceCheckerService } from '@libs/invoice-checker';
import { SupabaseService } from '@libs/supabase';

@Injectable()
export class UploadService {
  constructor(
    private readonly llmParserService: LlmParserService,
    private readonly invoiceCheckerService: InvoiceCheckerService,
    private readonly supabaseService: SupabaseService
  ) {}

  async saveToSupabase(
    file: FileDto,
    invoice: InvoiceDto[]
  ): Promise<InvoiceDto[]> {
    const mappedInvoices = invoice.map((invoice) => ({
      invoice_number: invoice.invoice_number,
      invoice_symbol: invoice.invoice_symbol,
      tax_code: invoice.tax_code,
      total_tax: invoice.total_tax,
      total_bill: invoice.total_bill,
      is_valid: invoice.is_valid,
      status: 'pending',
      validity_message: invoice.validity_message,
      validity_checked_at: invoice.validity_checked_at,
      file_id: file.id,
      updated_at: new Date(),
    }));
    const { data, error } = await this.supabaseService.client
      .from('invoices')
      .insert(mappedInvoices)
      .select();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async upload(file: FileDto) {
    console.time('parse');
    const invoices = await this.llmParserService.parse(file);
    console.timeEnd('parse');

    // save to supabase
    const savedInvoices = await this.saveToSupabase(file, invoices);

    for (const invoice of savedInvoices) {
      try {
        const checkedInvoice = await this.invoiceCheckerService.check(invoice);
      } catch (error: any) {
        Logger.error(error.stack);
      }
    }
  }
}
