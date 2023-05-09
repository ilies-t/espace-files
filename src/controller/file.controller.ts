import { Body, Controller, Get, Headers, Param, Post, Put, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileService } from '../service/file.service';
import { MyFileInterceptor } from '../interceptors/file.interceptor';
import { Response } from 'express';
import { Readable } from 'stream';
import { MyResourceDto } from '../dto/file/my-resource.dto';
import { NewFolderDto } from '../dto/file/new-folder.dto';
import { GenericResponseDto } from '../dto/generic-response.dto';
import { FilePublicStateDto } from '../dto/file/file-public-state.dto';
import { DisableAuth } from '../decorator/disable-auth.decorator';
import { ResourceDto } from '../dto/file/resource.dto';

@Controller('/file')
export class FileController {

  constructor(private readonly fileService: FileService) {}

  @Post('new-file/:parentId')
  @UseInterceptors(MyFileInterceptor())
  public async newFile(@Headers() headers: Headers, @UploadedFile() file: Express.Multer.File, @Param('parentId') parentId: string): Promise<GenericResponseDto> {
    return new GenericResponseDto(
      await this.fileService.newFile(headers, file, parentId)
    );
  }

  @Post('new-folder')
  public async newFolder(@Headers() headers: Headers, @Body() body: NewFolderDto): Promise<GenericResponseDto> {
    return new GenericResponseDto(
      await this.fileService.newFolder(headers, body)
    );
  }

  @Get('/download/:id')
  public async getById(@Headers() headers: Headers, @Param('id') id: string, @Res() res: Response): Promise<void> {
    const fileBuffer = await this.fileService.getFileById(headers, id, false, false);

    // set content type and send image
    res.set({
      'Content-Type': fileBuffer.mime
    });
    Readable.from(fileBuffer.file).pipe(res);
  }

  @Get('/:parentId')
  public async myResources(@Headers() headers: Headers, @Param('parentId') parentId: string): Promise<MyResourceDto> {
    return this.fileService.myResources(headers, parentId);
  }

  @Put('change-file-public-state')
  public async changeFilePublicState(@Headers() headers: Headers, @Body() body: FilePublicStateDto): Promise<ResourceDto> {
    return this.fileService.changeFilePublicState(headers, body)
      .then((updatedResource: ResourceDto) => updatedResource);
  }

  @Get('/public/:id')
  @DisableAuth()
  public async getPublicById(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const fileBuffer = await this.fileService.getFileById(null, id, true, false);

    // set content type and send image
    res.set({
      'Content-Type': fileBuffer.mime
    });
    Readable.from(fileBuffer.file).pipe(res);
  }

}