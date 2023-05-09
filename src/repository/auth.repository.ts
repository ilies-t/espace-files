import { EntityRepository, getManager, Repository } from 'typeorm';
import { AccountEntity } from '../entity/account.entity';
import { MeDto } from '../dto/account/me.dto';

@EntityRepository(AccountEntity)
export class AuthRepository extends Repository<AccountEntity> {

  /**
   * Save new account.
   * @param fullName Account full name.
   * @param email Account email.
   * @param password Account password.
   */
  public async addAccount(fullName: string, email: string, password: string): Promise<void> {
    await getManager().query(`
      INSERT INTO account(full_name, email, password_hash, api_auth, api_key)
      VALUES (
        $1,
        $2,
        $3,
        pgp_sym_encrypt(random_key(10), $4),
        pgp_sym_encrypt(random_key(50), $4)
      );
    `, [fullName, email, password, process.env.DATABASE_ENCRYPTION_ALT_KEY]);
  }

  /**
   * Get user basic information.
   * @param userId User who made request ID (UUID).
   */
  public async getBasicInformation(userId: string): Promise<MeDto> {
    const result = await getManager().query(`
      SELECT email, full_name FROM account WHERE id = $1;
    `, [userId]);

    return result[0] as MeDto;
  }

  /**
   * Update user basic infos.
   * @param userId User who made request ID (UUID).
   * @param email New email.
   * @param full_name New full name.
   */
  public async updateMyInfos(userId: string, email: string, full_name: string) {
    await getManager().query(`
      UPDATE account SET email = $2, full_name = $3 WHERE id = $1;
    `, [userId, email, full_name]);
  }
}