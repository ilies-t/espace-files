import { BadRequestException, NestInterceptor, Type } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import path from 'path';

const correctFileType: Record<string, RegExp> = {
  'image/png': /^(.png)$/,
  'image/jpeg': /^(.jpeg|.jpg|.jfif)$/,
  'image/gif': /^(.gif)$/,
  'application/pdf': /^(.pdf)$/
};

export const MyFileInterceptor = (): Type<NestInterceptor> => {

  return FileInterceptor('file',{

    limits: {
      fileSize: 1000000 // max: 10 MB
    },

    // verify file type
    fileFilter: async (req, file, callback) => {

      if(!file) {
        callback(new BadRequestException(), false);
      }

      // file integrity verification
      const fileExtension = path.extname(file.originalname.toLowerCase());

      if (correctFileType[file.mimetype].test(fileExtension)) {
        callback(null, true);
      } else {
        callback(new BadRequestException(), false);
      }
    }
  });
}