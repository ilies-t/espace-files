import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('account')
export class AccountEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column()
  full_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  reset_password_token: string;

  @Column()
  password_hash: string;

  @Column({ type: "bytea", nullable: true })
  api_auth: string;

  @Column({ type: "bytea", nullable: true })
  api_key: string;
}