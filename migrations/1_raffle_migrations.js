const Raffle = artifacts.require("Raffle");

module.exports = function (deployer) {
  deployer.deploy(Raffle);
};
