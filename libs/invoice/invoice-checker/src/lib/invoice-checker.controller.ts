import { Controller, Post, Body } from '@nestjs/common';
import { InvoiceDto } from '@libs/llm-parser';
import { InvoiceCheckerService } from './invoice-checker.service';

@Controller('invoice')
export class InvoiceCheckerController {
  constructor(private readonly invoiceCheckerService: InvoiceCheckerService) {}

  @Post('check')
  async check(@Body() invoice: InvoiceDto) {
    const result = await this.invoiceCheckerService.check(invoice);
    return {
      message: 'Success',
      data: result,
    };
  }
}
