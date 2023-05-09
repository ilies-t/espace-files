import {
  BadRequestException,
  ImATeapotException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { EthereumService } from './ethereum.service';
import { FileRepository } from '../repository/file.repository';
import { JwtUtil } from '../util/jwt.util';
import crypto from 'crypto';
import { FileEntity } from '../entity/file.entity';
import { SavedFileInterface } from '../interface/saved-file.interface';
import { IpfsEventInterface } from '../dto/file/ipfs-event.interface';
import { MyResourceDto } from '../dto/file/my-resource.dto';
import { NewFolderDto } from '../dto/file/new-folder.dto';
import { FilePublicStateDto } from '../dto/file/file-public-state.dto';
import { ResourceDto } from '../dto/file/resource.dto';
import { TreeDto } from '../dto/file/tree.dto';

@Injectable()
export class FileService {

  constructor(
    private fileRepo: FileRepository,
    private jwtUtil: JwtUtil,
    private ethService: EthereumService
  ) {}

  /**
   * Upload new file.
   * @param headers Request headers.
   * @param file File to upload.
   * @param parentId Parent folder ID (can be null).
   * @param userIdFromStorageService (optional) User ID retrieved from storage service.
   */
  public async newFile(headers: Headers, file: Express.Multer.File, parentId: string, userIdFromStorageService?: string): Promise<string> {

    // if there are not file to upload
    if(!file) {
      throw new BadRequestException();
    }

    const userId = !userIdFromStorageService ? this.jwtUtil.fromHeaders(headers).sub : userIdFromStorageService;

    // check parent ID
    if(FileService.isNull(parentId)) {
      parentId = null;
    }

    // verify if parent exists (only if not null)
    if (parentId && !await this.fileRepo.isFolderExistsById(parentId)) {
      throw new ImATeapotException();
    }

    // verify that file with same name doesn't exists (except for storage service)
    if (!userIdFromStorageService && await this.fileRepo.isFileExists(userId, file.originalname)) {
      throw new ImATeapotException();
    }

    // encrypt file
    // source: https://stackoverflow.com/a/60947180
    const salt = crypto.randomBytes(16),
      key = crypto.randomBytes(32),
      cipher = crypto.createCipheriv('aes-256-gcm', key, salt),
      output = Buffer.concat([cipher.update(file.buffer) , cipher.final()]);

    // save file to database
    return this.fileRepo.saveNewFile(
      userId,
      cipher.getAuthTag().toString('hex'),
      salt.toString('hex'),
      key.toString('hex'),
      file,
      parentId,
      !!userIdFromStorageService
    ).then((databaseFileId: string) => {

        // then, save to ethereum blockchain + ipfs
        return this.ethService.post(databaseFileId, output)
          .then(async (result: IpfsEventInterface) => {

            // save into database
            await this.fileRepo.setIpfsHashAndEth(databaseFileId, result.tx, result.blockHash);
            return databaseFileId;
          })
          .catch(async (e) => {
            console.error(e);

            // case when upload failed, delete file info in database
            await this.fileRepo.deleteOneFile(databaseFileId, userId);
            Logger.error(`Error when uploading file into Etherum/IPFS, id=${databaseFileId}, error=${e}`);
            throw new ServiceUnavailableException();
          });
    });
  }

  /**
   * Create new folder
   * @param headers Request headers.
   * @param body Request body contains folder name and parent.
   */
  public async newFolder(headers: Headers, body: NewFolderDto): Promise<string> {

    const user = this.jwtUtil.fromHeaders(headers);

    // prepare parent id param
    if(FileService.isNull(body.parent_id)) {
      body.parent_id = null;
    }

    // verify if folder not already exists
    if (await this.fileRepo.isFolderExists(user.sub, body.name, body.parent_id)) {
      throw new ImATeapotException();
    }

    return this.fileRepo.newFolder(user.sub, body.name, body.parent_id);
  }

  /**
   * Get one public file by ID (UUID).
   * @param headers Request headers.
   * @param id File ID (UUID).
   * @param isPublic Is file should be public.
   * @param fromStorageService Is file should come from storage service upload.
   */
  public async getFileById(headers: Headers, id: string, isPublic: boolean, fromStorageService: boolean): Promise<SavedFileInterface> {

    let userId = null;
    // non public file
    if(headers) {
      userId = this.jwtUtil.fromHeaders(headers).sub;
    }

    // look for file data into database
    return this.fileRepo.getOnePublic(id, isPublic, fromStorageService, userId).then( async (fileData: FileEntity) => {

      // file does not exist
      if (!fileData || !fileData.ipfs_id) {
        throw new NotFoundException();
      } else {

        // retrieve file from Ethereum & IPFS
        const ipfsResponse = await this.ethService.getById(id);

        if (!ipfsResponse || ipfsResponse.length < 0) {
          throw new NotFoundException();
        }

        // decrypt file
        const encryptedFileFromIpfs = ipfsResponse[0].content;
        const key = Buffer.from(fileData.encryption_key_hex, 'hex');
        const salt = Buffer.from(fileData.encryption_salt_hex, 'hex');
        const deCipher = crypto.createDecipheriv('aes-256-gcm', key, salt);
        deCipher.setAuthTag(Buffer.from(fileData.encryption_auth_tag_hex, 'hex'));

        return {
          file: Buffer.concat([deCipher.update(encryptedFileFromIpfs), deCipher.final()]),
          mime: fileData.mime
        };
      }
    });
  }

  /**
   * Get user resources.
   * @param headers Request headers.
   * @param parentId ID of a parent folder (UUID).
   */
  public async myResources(headers: Headers, parentId: string): Promise<MyResourceDto> {

    const user = this.jwtUtil.fromHeaders(headers);

    // prepare parent id param
    if(FileService.isNull(parentId)) {
      parentId = null;
    }

    const resources = await this.fileRepo.myResources(user.sub, parentId);
    const tree = await this.computeTree(parentId);
    return new MyResourceDto(tree, resources);
  }

  /**
   * Get an array of objects who represent folder tree (grandparent -> parent -> child -> etc...).
   * @param parentId Original file ID.
   */
  private async computeTree(parentId: string): Promise<TreeDto[]> {
    const tree = [];
    let currentParentId = parentId;

    // if a parent exists, continue loop to find the grandparent
    while(currentParentId) {
      const currentBranch = await this.fileRepo.getOneOnlyIdAndName(currentParentId);
      currentParentId = !currentBranch ? null : currentBranch.parent_id;
      tree.unshift(currentBranch);
    }

    return tree as TreeDto[];
  }

  /**
   * Change file public state to make it public or private.
   * @param headers Request headers.
   * @param body Request body (FilePublicStateDto).
   * @see FilePublicStateDto
   */
  public async changeFilePublicState(headers: Headers, body: FilePublicStateDto): Promise<ResourceDto> {
    const user = this.jwtUtil.fromHeaders(headers);

    return this.fileRepo.changeFilePublicState(user.sub, body.id, body.is_public);
  }

  /**
   * Check if a param is null.
   * @param param Param to test if is null or not.
   */
  private static isNull(param: string): boolean {
    return !param || ['null', 'undefined', ''].includes(param.trim());
  }
}