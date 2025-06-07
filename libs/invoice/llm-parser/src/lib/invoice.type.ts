export const InvoiceSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'array',
  items: {
    type: 'object',
    properties: {
      tax_code: {
        type: 'string',
        description:
          'Tax code of the seller (usually first tax code found in the invoice)',
      },
      invoice_symbol: {
        type: 'string',
        pattern: '^[A-Z0-9]{6}$',
        description: 'Invoice symbol',
      },
      invoice_number: {
        type: 'string',
        pattern: '^[1-9][0-9]*$',
        description: 'Invoice number ',
      },
      total_tax: {
        type: 'string',
        description: 'Total tax amount , float number',
      },
      total_bill: {
        type: 'string',
        description: 'Total bill amount , float number',
      },
    },
    required: [
      'tax_code',
      'invoice_symbol',
      'invoice_number',
      'total_tax',
      'total_bill',
    ],
    additionalProperties: false,
  },
};

export type InvoiceDto = {
  id: string;
  tax_code: string;
  invoice_symbol: string;
  invoice_number: string;
  total_tax: string;
  total_bill: string;
  created_at: Date;
  is_valid: boolean;
  file_id: string;
  validity_checked_at: Date;
  validity_message: string;
  updated_at: Date;
};
