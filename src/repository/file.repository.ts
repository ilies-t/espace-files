import { EntityRepository, getManager, Repository } from 'typeorm';
import { FileEntity } from '../entity/file.entity';
import { ResourceDto } from '../dto/file/resource.dto';
import { TreeDto } from '../dto/file/tree.dto';

@EntityRepository(FileEntity)
export class FileRepository extends Repository<FileEntity> {

  /**
   * Save one file with encrypted auth tage, salt and key.
   * @param userId User who made request ID (UUID).
   * @param authTagHex Cipher auth tag.
   * @param saltHex Cipher salt.
   * @param encryptionKeyHex Cipher encryption key.
   * @param file File to upload.
   * @param parentId (optional) Parent folder ID.
   * @param fromStorageService Is upload come from storage service.
   */
  public async saveNewFile(
    userId: string,
    authTagHex: string,
    saltHex: string,
    encryptionKeyHex: string,
    file: Express.Multer.File,
    parentId: string,
    fromStorageService: boolean
  ): Promise<string> {
    const result = await getManager().query(`
      INSERT INTO file(account_id, name, parent_id, byte_size, mime, encryption_auth_tag_hex, encryption_salt_hex, encryption_key_hex, storage_service)
      VALUES ($1,
              $2,
              $3,
              $4,
              $5,
              pgp_sym_encrypt($6, $10),
              pgp_sym_encrypt($7, $10),
              pgp_sym_encrypt($8, $10),
              $9
              )
      RETURNING file.id;
    `, [userId, file.originalname, parentId, file.size, file.mimetype, authTagHex, saltHex, encryptionKeyHex, fromStorageService, process.env.DATABASE_ENCRYPTION_KEY]);
    return result[0].id as string;
  }

  /**
   * Delete one file in case that IPFS/Etherum save failed.
   * @param id File ID (UUID).
   * @param userId File owner account ID (UUID).
   */
  public async deleteOneFile(id: string, userId: string): Promise<void> {
    await getManager().query(`
      DELETE FROM file
      WHERE id = $1 AND account_id = $2
    `, [id, userId]);
  }

  /**
   * Check if a folder with same name already exists.
   * @param userId User who made request ID (UUID).
   * @param name Folder name.
   * @param parentId Folder parent.
   */
  public async isFolderExists(userId: string, name: string, parentId: string): Promise<boolean> {

    const params = parentId ? [userId, name, parentId] : [userId, name];
    const result = await getManager().query(`
      SELECT exists(
        SELECT null
        FROM file
        WHERE account_id = $1 AND name = $2 AND is_folder IS TRUE AND parent_id ${parentId ? '= $3' : 'IS NULL'}
      ) AS exists
    `, params);

    return result[0].exists as boolean;
  }

  /**
   * Check if a folder exists by ID.
   * @param folderId Folder to test if exists ID (UUID).
   */
  public async isFolderExistsById(folderId: string): Promise<boolean> {

    const result = await getManager().query(`
      SELECT exists(
        SELECT null
        FROM file
        WHERE id = $1 AND is_folder IS TRUE
      ) AS exists
    `, [folderId]);

    return result[0].exists as boolean;
  }

  /**
   * Check if a file exists by name.
   * @param userId User who made request ID (UUID).
   * @param fileName File name.
   */
  public async isFileExists(userId: string, fileName: string): Promise<boolean> {

    const result = await getManager().query(`
      SELECT exists(
        SELECT null
        FROM file
        WHERE account_id = $1 AND name = $2 AND is_folder IS FALSE
      ) AS exists
    `, [userId, fileName]);

    return result[0].exists as boolean;
  }

  /**
   * Create new folder.
   * @param userId User who made request ID (UUID).
   * @param name Folder name.
   * @param parentId Folder parent.
   */
  public async newFolder(userId: string, name: string, parentId: string): Promise<string> {
    const result = await getManager().query(
      `
      INSERT INTO file (account_id, name, parent_id, is_folder)
      VALUES($1, $2, $3, true)
      RETURNING id;
    `, [userId, name, parentId]);

    return result[0].id as string;
  }

  /**
   * Retrieve id and name from one saved file.
   * @param fileId File ID (UUID).
   */
  async getOneOnlyIdAndName(fileId: string): Promise<TreeDto> {
    const result = await getManager().query(`
      SELECT id, name, parent_id FROM file
      WHERE file.id = $1 AND file.is_folder IS TRUE
    `, [ fileId ]);
    return result && result.length === 1 ? result[0] as TreeDto : null;
  }

  /**
   * Get one public file.
   * @param fileId File ID (UUID).
   * @param isPublic Is file should be public.
   * @param fromStorageService Is file should come from storage service upload.
   * @param privateUserId (Only for private file) User related ID.
   */
  public async getOnePublic(fileId: string, isPublic: boolean, fromStorageService: boolean, privateUserId: string): Promise<FileEntity> {

    const params = [fileId, process.env.DATABASE_ENCRYPTION_KEY, isPublic, fromStorageService];
    if(privateUserId) {
      params.push(privateUserId);
    }

    const result = await getManager().query(`
      SELECT
        id,
        created_at,
        name,
        NULL AS parent,
        NULL AS account,
        byte_size,
        mime,
        is_folder,
        is_public,
        eth_transaction_id,
        ipfs_id,
        pgp_sym_decrypt(encryption_salt_hex, $2) AS encryption_salt_hex,
        pgp_sym_decrypt(encryption_auth_tag_hex, $2) AS encryption_auth_tag_hex,
        pgp_sym_decrypt(encryption_key_hex, $2) AS encryption_key_hex
      FROM file
      WHERE file.id = $1
        AND file.is_folder IS FALSE
        AND file.is_public = $3
        AND file.storage_service = $4
        ${privateUserId ? 'AND file.account_id = $5': ' '}
    `, params);

    return result && result.length === 1 ? result[0] as FileEntity : null;
  }

  /**
   * Set IPFS block hash.
   * @param id Related file ID (UUID).
   * @param ethId Etherum transaction ID.
   * @param blockHash Block hash to save.
   */
  public async setIpfsHashAndEth(id: string, ethId: string, blockHash: string): Promise<void> {
    await getManager().query(`
       UPDATE file SET eth_transaction_id = $2, ipfs_id = $3
       WHERE id = $1
    `, [id, ethId, blockHash]);
  }

  /**
   * Get user resources.
   * @param userId User related ID (UUID).
   * @param parentId File parent ID (UUID.
   */
  public async myResources(userId: string, parentId: string): Promise<ResourceDto[]> {

    const params = parentId ? [userId, parentId] : [userId];

    return await getManager().query(`
      SELECT
        id,
        name,
        is_folder,
        split_part(mime, '/', 1) AS type,
        parent_id,
        is_public
      FROM file WHERE account_id = $1 AND storage_service IS FALSE AND parent_id ${parentId ? '= $2': 'IS NULL'}
    `, params) as unknown as ResourceDto[];
  }

  /**
   * Change file public state to make it public or private.
   * @param userId User related ID (UUID).
   * @param fileId Request body (FilePublicStateDto).
   * @param isPublic Is file public or not.
   * @see FilePublicStateDto
   */
  public async changeFilePublicState(userId: string, fileId: string, isPublic: boolean): Promise<ResourceDto> {
    const result = await getManager().query(`
      UPDATE file SET is_public = $3 WHERE id = $2 AND account_id = $1 AND is_folder IS FALSE AND storage_service IS FALSE
      RETURNING
        id,
        name,
        is_folder,
        split_part(mime, '/', 1) AS type,
        parent_id,
        is_public;
    `, [userId, fileId, isPublic]);
    return result[0][0];
  }
}