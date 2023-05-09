const Migrations = artifacts.require("../contracts/Migrations.sol");

module.exports = async (deployer) => {
  deployer.deploy(Migrations);
};