import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the PayrollVault implementation contract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployPayrollVault: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying PayrollVault implementation...");

  await deploy("PayrollVault", {
    from: deployer,
    log: true,
    autoMine: true,
  });

  console.log("PayrollVault implementation deployed successfully!");
};

export default deployPayrollVault;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags PayrollVault
deployPayrollVault.tags = ["PayrollVault"];