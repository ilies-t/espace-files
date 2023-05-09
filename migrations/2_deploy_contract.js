const File = artifacts.require("../contracts/File.sol");

module.exports = async (deployer) => {
  deployer.deploy(File);
};
