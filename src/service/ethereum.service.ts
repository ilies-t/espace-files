import Web3 from 'web3';
import { Injectable } from '@nestjs/common';
import contract from "@truffle/contract/index.js";
import artifacts from '../../build/contracts/File.json';
import IPFS from 'ipfs-api';
import { IpfsEventInterface } from '../dto/file/ipfs-event.interface';
import HDWalletProvider from '@truffle/hdwallet-provider';

@Injectable()
export class EthereumService {

  private web3: Web3;
  private instance: any;
  private ipfs;

  constructor() {
    const provider = new HDWalletProvider(process.env.ETH_ACCOUNT_MNEMOMIC.trim(), process.env.ETH_BLOCKCHAIN_ADDRESS)
    this.web3 = new Web3(provider);
    this.web3.eth.defaultAccount = process.env.ETH_ACCOUNT;
    const auth = 'Basic ' + Buffer.from(process.env.INFURA_IPFS_API_KEY + ':' + process.env.INFURA_IPFS_API_KEY_SECRET).toString('base64');
    this.ipfs = IPFS({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        authorization: auth
      },
    });
    const LMS = contract(artifacts);
    LMS.setProvider(this.web3.currentProvider);
    LMS.deployed().then(i => {
      this.instance = i;
    });
  }

  /**
   * Post to IPFS and save transaction into Ethereum.
   * @param id File Id (UUID).
   * @param file File to save (Buffer).
   */
  public async post(id: string, file: Buffer): Promise<IpfsEventInterface> {
    const ipfsHash = await this.ipfs.add(file);
    const hash = ipfsHash[0].hash;

    return this.instance.saveIpfsTransaction(id, hash, { from: this.web3.eth.defaultAccount })
      .then((x) => {
        return {
          tx: x.tx,
          blockHash: hash
        } as IpfsEventInterface;
      });
  }

  /**
   * Get file from IPFS.
   * @param id File ID (UUID).
   */
  public async getById(id: string): Promise<any> {
    return this.instance.getHashFromID(id, { from: this.web3.eth.defaultAccount })
      .then( async hash => {
        return this.ipfs.files.get(hash);
      });
  }
}