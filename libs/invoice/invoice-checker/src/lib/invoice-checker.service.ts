import { Injectable } from '@nestjs/common';
import { InvoiceDto } from '@libs/llm-parser';
import { CaptchaEntity, CaptchaService } from '@libs/captcha';
import axios from 'axios';
import * as https from 'https';
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
@Injectable()
export class InvoiceCheckerService {
  constructor(private readonly captchaService: CaptchaService) {}

  async check(invoice: InvoiceDto) {
    const captcha = await this.captchaService.parseCaptcha();
    if (!captcha) {
      return {
        ...invoice,
        is_valid: false,
        validity_message: 'Error',
        validity_checked_at: new Date(),
      };
    }
    return this.checkInvoice(invoice, captcha);
  }

  async checkInvoice(
    invoiceData: InvoiceDto,
    captcha: CaptchaEntity
  ): Promise<InvoiceDto> {
    const agent = new https.Agent({
      rejectUnauthorized: false, // This disables certificate validation
    });
    const { key, captchaText } = captcha;
    const url = `https://hoadondientu.gdt.gov.vn:30000/query/guest-invoices?`;
    const firstInvoiceSymbol = invoiceData.invoice_symbol.charAt(0);
    const restInvoiceSymbol = invoiceData.invoice_symbol.slice(1);
    const params = {
      khmshdon: firstInvoiceSymbol,
      hdon: '0' + firstInvoiceSymbol,
      nbmst: invoiceData.tax_code,
      khhdon: restInvoiceSymbol,
      shdon: invoiceData.invoice_number,
      tgtttbso: invoiceData.total_bill,
      cvalue: captchaText,
      ckey: key,
    };

    const response = await axios.get(url, { params, httpAgent: agent });
    if (response.data && 'hdon' in response.data && response.status === 200) {
      return {
        ...invoiceData,
        is_valid: true,
        validity_message: 'Invoice is valid',
        validity_checked_at: new Date(),
      };
    } else if (response.status === 200) {
      return {
        ...invoiceData,
        is_valid: false,
        validity_message: 'Invoice is invalid',
        validity_checked_at: new Date(),
      };
    }
    return {
      ...invoiceData,
      is_valid: false,
      validity_message: 'Error',
      validity_checked_at: new Date(),
    };
  }
}
