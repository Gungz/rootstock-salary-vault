//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "./PayrollVault.sol";

/**
 * @title VaultRegistry
 * @dev Registry contract that manages company-to-vault mappings.
 * Acts as a factory and directory for all payroll vaults.
 * 
 * This contract enables:
 * - Company registration and vault creation
 * - Mapping of company address to vault contract address
 * - Registry of all deployed vaults
 * 
 * @author Rootstock Payroll Vault
 */
contract VaultRegistry is Ownable(msg.sender) {
    // State Variables
    mapping(address => address) public companyVaults;  // company -> vault address
    address[] public vaultList;                        // list of all vault addresses
    
    PayrollVault public vaultImplementation;           // implementation contract for cloning
    
    // Events for off-chain indexing
    event VaultCreated(
        address indexed company, 
        address vaultAddress, 
        string companyName,
        uint256 timestamp
    );
    event VaultRemoved(
        address indexed company,
        address vaultAddress
    );
    event ImplementationUpdated(
        address oldImplementation,
        address newImplementation
    );

    /**
     * @dev Constructor sets the deployer as the initial admin
     * @param _implementation Address of the PayrollVault implementation
     */
    constructor(address _implementation) {
        require(_implementation != address(0), "Invalid implementation address");
        vaultImplementation = PayrollVault(payable(_implementation));
    }

    /**
     * @dev Create a new payroll vault for a company
     * @param _companyName Name of the company (for display purposes)
     * @return Address of the newly created vault
     */
    function createVault(string memory _companyName) external returns (address) {
        require(companyVaults[msg.sender] == address(0), "Vault already exists for this company");
        
        // Clone the implementation contract
        address newVault = Clones.clone(address(vaultImplementation));
        
        // Initialize the vault
        PayrollVault(payable(newVault)).initialize(
            msg.sender,
            _companyName,
            address(this)
        );
        
        // Store the mapping
        companyVaults[msg.sender] = newVault;
        vaultList.push(newVault);
        
        emit VaultCreated(msg.sender, newVault, _companyName, block.timestamp);
        
        return newVault;
    }

    /**
     * @dev Get the vault address for a specific company
     * @param _company Company address
     * @return Vault address or address(0) if not found
     */
    function getVaultAddress(address _company) external view returns (address) {
        return companyVaults[_company];
    }

    /**
     * @dev Get the total number of vaults created
     * @return Number of vaults
     */
    function getVaultCount() external view returns (uint256) {
        return vaultList.length;
    }

    /**
     * @dev Get all vault addresses
     * @return Array of vault addresses
     */
    function getAllVaults() external view returns (address[] memory) {
        return vaultList;
    }

    /**
     * @dev Get paginated vault addresses
     * @param _start Starting index
     * @param _count Number of vaults to retrieve
     * @return Array of vault addresses
     */
    function getVaults(uint256 _start, uint256 _count) external view returns (address[] memory) {
        require(_start < vaultList.length, "Start index out of bounds");
        
        uint256 end = _start + _count;
        if (end > vaultList.length) {
            end = vaultList.length;
        }
        
        address[] memory result = new address[](end - _start);
        for (uint256 i = _start; i < end; i++) {
            result[i - _start] = vaultList[i];
        }
        
        return result;
    }

    /**
     * @dev Check if a company has a vault
     * @param _company Company address
     * @return True if vault exists
     */
    function hasVault(address _company) external view returns (bool) {
        return companyVaults[_company] != address(0);
    }

    /**
     * @dev Update the vault implementation (for proxy upgrades)
     * @param _newImplementation New implementation address
     */
    function updateImplementation(address _newImplementation) external onlyOwner {
        require(_newImplementation != address(0), "Invalid implementation address");
        address oldImplementation = address(vaultImplementation);
        vaultImplementation = PayrollVault(payable(_newImplementation));
        emit ImplementationUpdated(oldImplementation, _newImplementation);
    }

    /**
     * @dev Get the vault implementation address
     * @return Implementation address
     */
    function getImplementation() external view returns (address) {
        return address(vaultImplementation);
    }
}
