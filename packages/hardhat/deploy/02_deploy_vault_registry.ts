import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the VaultRegistry contract
 * The VaultRegistry requires the PayrollVault implementation address as constructor argument
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployVaultRegistry: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying VaultRegistry...");

  // Get the PayrollVault implementation address
  const payrollVault = await hre.deployments.get("PayrollVault");
  const payrollVaultAddress = payrollVault.address;

  await deploy("VaultRegistry", {
    from: deployer,
    // Contract constructor arguments: PayrollVault implementation address
    args: [payrollVaultAddress],
    log: true,
    autoMine: true,
  });

  console.log("VaultRegistry deployed successfully!");
};

export default deployVaultRegistry;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags VaultRegistry
deployVaultRegistry.tags = ["VaultRegistry"];

// Dependencies: VaultRegistry depends on PayrollVault being deployed first
deployVaultRegistry.dependencies = ["PayrollVault"];