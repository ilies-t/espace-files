# Espace Files
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

Espace Files is a proof of concept for hybrid decentralization in file storage services, which utilizes the Ethereum blockchain and IPFS.

By combining the benefits of centralization (security and speed) with those of decentralization (non-deletable and incorruptible data), hybrid decentralization allows us to store a file in the IPFS network with the Ethereum blockchain for life, while also enabling fast and secure access.

![Scheme](./scheme.png)

### Decentralization
Decentralization involves:
- Using the InterPlanetary File System (IPFS) network to save file contents, which are encrypted using the AES 256 algorithm.
- Storing IPFS CID in an Ethereum blockchain as a smart contract ([File.sol](./contracts/File.sol)).

### Centralization
The (PostgreSQL database) is used solely to store file encryption data, such as authentication tags, keys, and salts.
Please note that the encryption data itself is encrypted in the database using PGP symmetric key.

## Authentication
Use JSON Web Token (HMACSHA512) with an expiration time of 10 hours.


## Storage Service
The Storage Service is an Espace Files SaaS API that uses an API Auth/Key combination.


## Required environments
| Name                          | Description                                                                           | Example                                               |
|-------------------------------|---------------------------------------------------------------------------------------|-------------------------------------------------------|
| `ETH_BLOCKCHAIN_ADDRESS`      | Ethereum Goerli testnet blockchain HTTP address                                       | `http://localhost:8545`                               |
| `ETH_ACCOUNT`                 | Ethereum Goerli testnet account address                                               | `0x12...`                                             |
| `ETH_ACCOUNT_MNEMOMIC`        | Ethereum Goerli testnet account mnemonic                                              | `planet sentence ...`                                 |
| `INFURA_IPFS_API_KEY`         | IPFS Infura project API key                                                           | `xxx`                                                 |
| `INFURA_IPFS_API_KEY_SECRET`  | IPFS Infura project API key secret                                                    | `xxx`                                                 |
| `DATABASE_URL`                | PostgreSQL Database URL                                                               | `postgres://postgres:root@localhost:5432/espacefiles` |
| `DATABASE_ENCRYPTION_KEY`     | PostgreSQL PGP symmetric key used to encrypt/decrypt data related to files encryption | `random12345`                                         |
| `DATABASE_ENCRYPTION_ALT_KEY` | PostgreSQL PGP symmetric key used to encrypt/decrypt data related to Storage Service  | `random12345`                                         |
| `JWT_KEY`                     | Key used for JSON Web Token signing                                                   | `random12345`                                         |
| `CORS_URL`                    | Cross-origin resource sharing allowed origin                                          | `https://example.com`                                 |
| `PORT`                        | HTTP Server port                                                                      | `8080`                                                |


## Database
To use the PostgreSQL database, please complete the DDL available in [database/ddl.sql](./database/ddl.sql)

## Get started (local)
1. Install dependencies
```shell
$ npm ci
```

2. Run Blockchain in local
   1. Download https://www.trufflesuite.com/ganache (recommended)
   2. Or using `ganache-cli`:
       ```shell
       $ npm install -g ganache-cli && ganache-cli
       ```

3. Compile and migrate Solidity smart contracts
```shell
$ truffle compile && truffle migrate
```

4. Set up DDL in your database, see [database/ddl.sql](./database/ddl.sql)

5. Launch server
```shell
$ npm run start:dev
```


## Get started (production-like using Goerli testnet)
1. Install dependencies
```shell
$ npm ci
```

2. Run tests
```shell
$ npm run test
```

3. Compile and migrate Solidity smart contracts
```shell
$ truffle compile && truffle migrate --network goerli
```

4. Set up DDL in your database, see [database/ddl.sql](./database/ddl.sql)

5. Launch server (using PM2)
```shell
$ pm2 start npm --name "api" -- run "build_and_start:prod"
```

6. Access to PM2
```shell
$ pm2 monit
```


## License
This project is licensed with GNU AGPL v3 License.</br>
See [LICENSE](./LICENSE) for more details.