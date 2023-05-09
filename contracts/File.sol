pragma solidity >=0.4.22 <0.9.0;

contract File {

    mapping (string=>string) public ipfsInbox;
    event ipfsSent(string _ipfsHash, string _address);

    constructor() public {}

    // _ipfsHash = the file hash
    function saveIpfsTransaction(string memory _address, string memory _ipfsHash) public{
        ipfsInbox[_address] = _ipfsHash;
        emit ipfsSent(_ipfsHash, _address);
    }

    // retrieve IPFS hash from address (UUID)
    function getHashFromID(string memory _address) public view returns(string memory) {
        string memory ipfs_hash = ipfsInbox[_address];
        return ipfs_hash;
    }

}
