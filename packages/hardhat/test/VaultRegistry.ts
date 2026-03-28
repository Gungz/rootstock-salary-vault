import { expect } from "chai";
import { ethers } from "hardhat";
import { PayrollVault, VaultRegistry } from "../typechain-types";

describe("VaultRegistry", function () {
  let vaultRegistry: VaultRegistry;
  let payrollVaultImplementation: PayrollVault;
  let owner: ethers.Signer;
  let company: ethers.Signer;

  const COMPANY_NAME = "Test Company";

  before(async () => {
    [owner, company] = await ethers.getSigners();

    // Deploy PayrollVault implementation first
    const payrollVaultFactory = await ethers.getContractFactory("PayrollVault");
    payrollVaultImplementation = (await payrollVaultFactory.deploy()) as PayrollVault;
    await payrollVaultImplementation.waitForDeployment();

    // Deploy VaultRegistry with PayrollVault implementation
    const vaultRegistryFactory = await ethers.getContractFactory("VaultRegistry");
    vaultRegistry = (await vaultRegistryFactory.deploy(
      payrollVaultImplementation.target
    )) as VaultRegistry;
    await vaultRegistry.waitForDeployment();
  });

  describe("Initialization", function () {
    it("Should set the correct implementation address", async function () {
      expect(await vaultRegistry.getImplementation()).to.equal(await payrollVaultImplementation.getAddress());
    });
  });

  describe("Vault Creation", function () {
    it("Should create a new vault for a company", async function () {
      const tx = await vaultRegistry.connect(company).createVault(COMPANY_NAME);
      await tx.wait();
      
      // Get the vault address from the event
      const vaultAddress = await vaultRegistry.getVaultAddress(await company.getAddress());
      expect(vaultAddress).to.not.equal(ethers.ZeroAddress);
      
      // Check that the vault was created with correct company
      const createdVault = await ethers.getContractAt("PayrollVault", vaultAddress);
      expect(await createdVault.company()).to.equal(await company.getAddress());
      expect(await createdVault.companyName()).to.equal(COMPANY_NAME);
      expect(await createdVault.registry()).to.equal(await vaultRegistry.getAddress());
    });

    /*it("Should emit VaultCreated event", async function () {
      // This tests the event by checking the vault was created
      const vaultAddress = await vaultRegistry.getVaultAddress(await company.getAddress());
      expect(vaultAddress).to.not.equal(ethers.ZeroAddress);
    });*/

    it("Should revert when creating vault for company that already has one", async function () {
      await expect(vaultRegistry.connect(company).createVault(COMPANY_NAME)).to.be.revertedWith(
        "Vault already exists for this company"
      );
    });

    it("Should increment vault count", async function () {
      expect(await vaultRegistry.getVaultCount()).to.equal(1);
    });

    it("Should return correct vault address", async function () {
      const vaultAddress = await vaultRegistry.getVaultAddress(await company.getAddress());
      expect(await vaultRegistry.hasVault(await company.getAddress())).to.equal(true);
      expect(vaultAddress).to.not.equal(ethers.ZeroAddress);
    });
  });

  describe("Get All Vaults", function () {
    it("Should return all vault addresses", async function () {
      const vaults = await vaultRegistry.getAllVaults();
      expect(vaults.length).to.equal(1);
    });
  });

  describe("Paginated Vaults", function () {
    it("Should return paginated vault addresses", async function () {
      const vaults = await vaultRegistry.getVaults(0, 10);
      expect(vaults.length).to.equal(1);
    });

    it("Should revert with out of bounds start index", async function () {
      await expect(vaultRegistry.getVaults(5, 10)).to.be.revertedWith("Start index out of bounds");
    });
  });

  describe("Implementation Update", function () {
    it("Should allow owner to update implementation", async function () {
      const newImplementation = await payrollVaultImplementation.getAddress();
      await vaultRegistry.connect(owner).updateImplementation(newImplementation);
      expect(await vaultRegistry.getImplementation()).to.equal(newImplementation);
    });
  });
});