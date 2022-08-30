const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

//Module.exports
//Create deployer objects
//Deployment chains
//Get contracts
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    console.log("----------------DYNAMIC NFT TO BE DEPLOYED-------------------")
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const EthUsdAggregator = await ethers.getContract("MockV3Aggregator", deployer)
        ethUsdPriceFeedAddress = EthUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethToUsdPriceFeed
    }

    //get images
    const lowSVG = await fs.readFileSync("./images/dynamicNft/frown.svg", { encoding: "utf8" })
    const highSVG = await fs.readFileSync("./images/dynamicNft/happy.svg", { encoding: "utf8" })
    //create constructor arguments
    const args = [ethUsdPriceFeedAddress, lowSVG, highSVG]
    //deploy contract
    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(dynamicSvgNft.address, args)
    }
}

module.exports.tags = ["all", "dynamicsvg", "main"]
