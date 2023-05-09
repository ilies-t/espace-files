export class NewFileDto {
  id: string;
  ipfs_hash: string;

  constructor(id: string, block_hash: string) {
    this.id = id;
    this.ipfs_hash = block_hash;
  }

}