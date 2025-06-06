import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPartFromBase64, GoogleGenAI } from '@google/genai';
import axios from 'axios';
import * as https from 'https';
import { removeStrokeFromSVG, svgToBase64 } from './utils';

export interface CaptchaEntity {
  key: string;
  captchaText: string;
}

@Injectable()
export class CaptchaService {
  private readonly genAI: GoogleGenAI;
  constructor(private readonly configService: ConfigService) {
    this.genAI = new GoogleGenAI({
      apiKey: this.configService.get('GOOGLE_API_KEY'),
    });
  }

  getCaptcha = async (): Promise<{ key: string; content: string }> => {
    const agent = new https.Agent({
      rejectUnauthorized: false, // This disables certificate validation
    });
    const response = await axios.get(
      `https://hoadondientu.gdt.gov.vn:30000/captcha`,
      { httpAgent: agent }
    );
    const { key, content } = response.data;
    return {
      key,
      content: removeStrokeFromSVG(content),
    };
  };

  parseCaptcha = async (): Promise<CaptchaEntity> => {
    const { key, content } = await this.getCaptcha();
    const pngBase64 = await svgToBase64(content);
    const contents = [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              data: pngBase64.split(',')[1],
              mimeType: 'image/png',
            },
          },
          {
            text: `Extract the text from this captcha image.
            Remember this captcha is 6 characters long.
            Remember this captcha is case sensitive.
            IMPORTANT: Return only the 6 characters text, no other text or explanation, no "".
            Example output: ABCDEF`,
          },
        ],
      },
    ];
    const config = {
      responseMimeType: 'application/json',
      thinkingConfig: {
        thinkingBudget: 0,
      },
    };
    const response = await this.genAI.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents,
      config,
    });
    return {
      key,
      captchaText: response.text?.replace(/^"|"$/g, '') || '',
    };
  };
}
