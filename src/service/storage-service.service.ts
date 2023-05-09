import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { CredentialsDto } from '../dto/storage-service/credentials.dto';
import { JwtUtil } from '../util/jwt.util';
import { StorageServiceRepository } from '../repository/storage-service.repository';
import { FileService } from './file.service';
import { GeneralEnum } from '../config/general.enum';
import { RecentResourceDto } from '../dto/storage-service/recent-resource.dto';

@Injectable()
export class StorageServiceService {

  constructor(
    private readonly storageServiceRepo: StorageServiceRepository,
    private readonly jwt: JwtUtil,
    private readonly fileService: FileService
  ) {}

  /**
   * Get user credentials.
   * @param headers Request headers.
   */
  public async getCredentials(headers: Headers): Promise<CredentialsDto> {
    const user = this.jwt.fromHeaders(headers);
    return this.storageServiceRepo.getCredentials(user.sub);
  }

  /**
   * Generate new user credentials.
   * @param headers Request headers.
   */
  public async generateCredentials(headers: Headers): Promise<CredentialsDto> {
    const user = this.jwt.fromHeaders(headers);
    return this.storageServiceRepo.newCredentials(user.sub);
  }

  /**
   * Upload new file (from storage service).
   * @param headers Request headers.
   * @param file File to upload.
   */
  public async upload(headers: Headers, file: Express.Multer.File): Promise<string> {

    // retrieve api auth & key
    const apiAuth = headers[GeneralEnum.HEADER_API_AUTH],
          apiKey = headers[GeneralEnum.HEADER_API_KEY];

    // headers values
    if(apiAuth && apiKey) {
      const userId = await this.storageServiceRepo.verifyAuth(apiAuth, apiKey);

      // then, verify authentication
      if(userId) {
        return this.fileService.newFile(headers, file, null, userId);
      } else {
        Logger.error('Storage service: incorrect auth and key combination');
        throw new UnauthorizedException();
      }

    } else {
      Logger.error('Storage service: null auth/key');
      throw new UnauthorizedException();
    }
  }

  /**
   * Get recent uploaded resources.
   * @param headers Request headers.
   * @param page Pagination (starts from 0).
   */
  public async recentResources(headers: Headers, page: number): Promise<RecentResourceDto[]> {
    const user = this.jwt.fromHeaders(headers);
    return this.storageServiceRepo.recentResources(user.sub, page);
  }
}