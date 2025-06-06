import { Body, Controller, Post } from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileDto } from '@libs/llm-parser';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  async parse(@Body() file: FileDto) {
    const result = await this.uploadService.upload(file);
    return result;
  }
}
