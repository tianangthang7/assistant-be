import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI, UploadFileParameters, type File } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '@libs/supabase';
import { FileDto } from './dto/file.dto';
import { InvoiceSchema, InvoiceDto } from './invoice.type';

@Injectable()
export class LlmParserService {
  private readonly genAI: GoogleGenAI;
  constructor(
    private readonly configService: ConfigService,
    private readonly supabase: SupabaseService
  ) {
    this.genAI = new GoogleGenAI({
      apiKey: this.configService.get('GOOGLE_API_KEY'),
    });
  }

  async uploadToGoogleAI(file: any): Promise<File> {
    try {
      const uploadParams: UploadFileParameters = {
        file: file,
        config: {
          mimeType: file.mimetype,
          displayName: file.originalname,
        },
      };
      const uploadedFile = await this.genAI.files.upload(uploadParams);
      return uploadedFile;
    } catch (error: any) {
      Logger.error(
        `Google AI Upload Error: ${error.message}`,
        error.stack,
        'LlmParserService'
      );
      throw error;
    } finally {
      if (file.path) {
        try {
          Logger.log(
            `Temporary file ${file.path} deleted.`,
            'LlmParserService'
          );
        } catch (cleanupError: any) {
          Logger.error(
            `Error deleting temporary file ${file.path}: ${cleanupError.message}`,
            cleanupError.stack,
            'LlmParserService'
          );
        }
      }
    }
  }

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
    }));
    const { data, error } = await this.supabase.client
      .from('invoices')
      .insert(mappedInvoices)
      .select();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async parse(file: FileDto) {
    // download file from supabase
    const { data, error } = await this.supabase.client.storage
      .from('files')
      .download(file.path);
    if (error) {
      Logger.error(
        `Error downloading file from supabase: ${error.message}`,
        error.stack,
        'LlmParserService'
      );
    }
    const uploadedFile = await this.uploadToGoogleAI(data);

    // parse file with google genai
    const contents = [
      {
        role: 'user',
        parts: [
          {
            fileData: {
              fileUri: uploadedFile.uri,
              mimeType: uploadedFile.mimeType,
            },
          },
          {
            text: `The attached file maybe contain multiple invoice. 
        Extract the invoice details and return only a valid JSON object,
        ${JSON.stringify(InvoiceSchema)}`,
          },
        ],
      },
    ];

    const config = {
      responseMimeType: 'application/json',
      responseSchema: InvoiceSchema,
    };
    const response = await this.genAI.models.generateContent({
      model: 'gemini-2.5-flash-preview-05-20',
      contents,
      config,
    });

    // save to supabase
    const invoice = JSON.parse(response.text || '[]') as InvoiceDto[];
    const savedInvoices = await this.saveToSupabase(file, invoice);
    return savedInvoices;
  }
}
