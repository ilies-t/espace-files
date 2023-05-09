import {
  Controller,
  Get,
  Headers, Param,
  ParseIntPipe,
  Post,
  Put,
  Query, Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CredentialsDto } from '../dto/storage-service/credentials.dto';
import { StorageServiceService } from '../service/storage-service.service';
import { MyFileInterceptor } from '../interceptors/file.interceptor';
import { GenericResponseDto } from '../dto/generic-response.dto';
import { DisableAuth } from '../decorator/disable-auth.decorator';
import { RecentResourceDto } from '../dto/storage-service/recent-resource.dto';
import { Response } from 'express';
import { Readable } from 'stream';
import { FileService } from '../service/file.service';

@Controller('/storage-service')
export class StorageServiceController {

  constructor(
    private readonly storageServiceService: StorageServiceService,
    private readonly fileService: FileService,
  ) {}

  @Get('/credentials')
  public async getCredentials(@Headers() headers: Headers): Promise<CredentialsDto> {
    return this.storageServiceService.getCredentials(headers);
  }

  @Put('/new-credentials')
  public async newCredentials(@Headers() headers: Headers): Promise<CredentialsDto> {
    return this.storageServiceService.generateCredentials(headers);
  }

  @DisableAuth()
  @Post('new-file')
  @UseInterceptors(MyFileInterceptor())
  public async newFile(@Headers() headers: Headers, @UploadedFile() file: Express.Multer.File): Promise<GenericResponseDto> {
    return new GenericResponseDto(
      await this.storageServiceService.upload(headers, file)
    );
  }

  @Get('recent-resources')
  public async recentResources(@Headers() headers: Headers, @Query('page', ParseIntPipe) page: number): Promise<RecentResourceDto[]> {
    return this.storageServiceService.recentResources(headers, page);
  }

  @Get('/:id')
  @DisableAuth()
  public async getPublicById(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const fileBuffer = await this.fileService.getFileById(null, id, false, true);

    // set content type and send image
    res.set({
      'Content-Type': fileBuffer.mime
    });
    Readable.from(fileBuffer.file).pipe(res);
  }
}