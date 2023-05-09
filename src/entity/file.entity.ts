import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AccountEntity } from './account.entity';

@Entity('file')
export class FileEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column()
  name: string;

  @OneToOne(() => FileEntity, { eager: true, cascade: true , nullable: true})
  @JoinColumn({ name: 'file_parent' })
  parent: FileEntity;

  @OneToOne(() => AccountEntity, { eager: true, cascade: true })
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;

  @Column()
  byte_size: number;

  @Column()
  mime: string;

  @Column({ default: false })
  is_folder: boolean;

  @Column({ default: false })
  is_public: boolean;

  @Column({ nullable: true })
  eth_transaction_id: string;

  @Column({ nullable: true })
  ipfs_id: string;

  @Column({ type: "bytea" })
  encryption_salt_hex: string;

  @Column({ type: "bytea" })
  encryption_auth_tag_hex: string;

  @Column({ type: "bytea" })
  encryption_key_hex: string;
}