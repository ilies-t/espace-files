import { EntityRepository, getManager, Repository } from 'typeorm';
import { AccountEntity } from '../entity/account.entity';
import { CredentialsDto } from '../dto/storage-service/credentials.dto';
import { RecentResourceDto } from '../dto/storage-service/recent-resource.dto';

@EntityRepository(AccountEntity)
export class StorageServiceRepository extends Repository<AccountEntity> {

  /**
   * Get user credentials.
   * @param accountId Related account ID.
   */
  public async getCredentials(accountId: string): Promise<CredentialsDto> {
    const result = await getManager().query(`
      SELECT
        pgp_sym_decrypt(api_auth, $2) AS auth,
        pgp_sym_decrypt(api_key, $2) AS key
      FROM account
      WHERE id = $1
    `, [accountId, process.env.DATABASE_ENCRYPTION_ALT_KEY]);
    return result && result.length === 1 ? result[0] as CredentialsDto : null;
  }

  /**
   * Update user credentials.
   * @param accountId Account to update ID.
   */
  public async newCredentials(accountId: string): Promise<CredentialsDto> {
    const result = await getManager().query(`
      UPDATE account SET
        api_auth = pgp_sym_encrypt(random_key(10), $2),
        api_key = pgp_sym_encrypt(random_key(50), $2)
      WHERE id = $1
      RETURNING
          pgp_sym_decrypt(api_auth, $2) AS auth,
          pgp_sym_decrypt(api_key, $2) AS key
    `, [accountId, process.env.DATABASE_ENCRYPTION_ALT_KEY]);
    return result[0][0] as CredentialsDto;
  }

  /**
   * Verify that user is correctly authenticated and return his ID.
   * @param apiAuth User API auth.
   * @param apiKey User API key.
   */
  public async verifyAuth(apiAuth: any, apiKey: any): Promise<string> {

    const result = await getManager().query(`
      SELECT id FROM account
      WHERE pgp_sym_decrypt(api_auth, $3) = $1
        AND pgp_sym_decrypt(api_key, $3) = $2;
    `, [apiAuth, apiKey, process.env.DATABASE_ENCRYPTION_ALT_KEY]);

    return result[0] ? result[0].id : null;
  }

  /**
   * Get recent uploaded resources.
   * @param accountId Related account ID.
   * @param page Pagination (starts from 0).
   */
  public async recentResources(accountId: string, page: number): Promise<RecentResourceDto[]> {
    return await getManager().query(`
      SELECT
        id,
        name,
        created_at,
        split_part(mime, '/', 1) AS type
      FROM file WHERE account_id = $1 AND storage_service IS TRUE
      ORDER BY created_at DESC
      LIMIT 100
      OFFSET $2 * 100
    `, [accountId, page]) as unknown as RecentResourceDto[];
  }
}