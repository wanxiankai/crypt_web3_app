require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    Sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/hV6FR6aTSNdcyh87PCD9oo0T2PKQdCvv",
      accounts:['6f4a8c331ab13fedfee38ccd83efba77558beab1e39dc8dc6f4945e9bd6ef7fa']
    }
  }
};
