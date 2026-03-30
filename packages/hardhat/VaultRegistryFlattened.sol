// Sources flattened with hardhat v2.22.10 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/utils/Context.sol@v5.6.1

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

pragma solidity ^0.8.20;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


// File @openzeppelin/contracts/access/Ownable.sol@v5.6.1

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File @openzeppelin/contracts/utils/Errors.sol@v5.6.1

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (utils/Errors.sol)

pragma solidity ^0.8.20;

/**
 * @dev Collection of common custom errors used in multiple contracts
 *
 * IMPORTANT: Backwards compatibility is not guaranteed in future versions of the library.
 * It is recommended to avoid relying on the error API for critical functionality.
 *
 * _Available since v5.1._
 */
library Errors {
    /**
     * @dev The ETH balance of the account is not enough to perform the operation.
     */
    error InsufficientBalance(uint256 balance, uint256 needed);

    /**
     * @dev A call to an address target failed. The target may have reverted.
     */
    error FailedCall();

    /**
     * @dev The deployment failed.
     */
    error FailedDeployment();

    /**
     * @dev A necessary precompile is missing.
     */
    error MissingPrecompile(address);
}


// File @openzeppelin/contracts/utils/LowLevelCall.sol@v5.6.1

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.6.0) (utils/LowLevelCall.sol)

pragma solidity ^0.8.20;

/**
 * @dev Library of low level call functions that implement different calling strategies to deal with the return data.
 *
 * WARNING: Using this library requires an advanced understanding of Solidity and how the EVM works. It is recommended
 * to use the {Address} library instead.
 */
library LowLevelCall {
    /// @dev Performs a Solidity function call using a low level `call` and ignoring the return data.
    function callNoReturn(address target, bytes memory data) internal returns (bool success) {
        return callNoReturn(target, 0, data);
    }

    /// @dev Same as {callNoReturn-address-bytes}, but allows specifying the value to be sent in the call.
    function callNoReturn(address target, uint256 value, bytes memory data) internal returns (bool success) {
        assembly ("memory-safe") {
            success := call(gas(), target, value, add(data, 0x20), mload(data), 0x00, 0x00)
        }
    }

    /// @dev Performs a Solidity function call using a low level `call` and returns the first 64 bytes of the result
    /// in the scratch space of memory. Useful for functions that return a tuple with two single-word values.
    ///
    /// WARNING: Do not assume that the results are zero if `success` is false. Memory can be already allocated
    /// and this function doesn't zero it out.
    function callReturn64Bytes(
        address target,
        bytes memory data
    ) internal returns (bool success, bytes32 result1, bytes32 result2) {
        return callReturn64Bytes(target, 0, data);
    }

    /// @dev Same as {callReturn64Bytes-address-bytes}, but allows specifying the value to be sent in the call.
    function callReturn64Bytes(
        address target,
        uint256 value,
        bytes memory data
    ) internal returns (bool success, bytes32 result1, bytes32 result2) {
        assembly ("memory-safe") {
            success := call(gas(), target, value, add(data, 0x20), mload(data), 0x00, 0x40)
            result1 := mload(0x00)
            result2 := mload(0x20)
        }
    }

    /// @dev Performs a Solidity function call using a low level `staticcall` and ignoring the return data.
    function staticcallNoReturn(address target, bytes memory data) internal view returns (bool success) {
        assembly ("memory-safe") {
            success := staticcall(gas(), target, add(data, 0x20), mload(data), 0x00, 0x00)
        }
    }

    /// @dev Performs a Solidity function call using a low level `staticcall` and returns the first 64 bytes of the result
    /// in the scratch space of memory. Useful for functions that return a tuple with two single-word values.
    ///
    /// WARNING: Do not assume that the results are zero if `success` is false. Memory can be already allocated
    /// and this function doesn't zero it out.
    function staticcallReturn64Bytes(
        address target,
        bytes memory data
    ) internal view returns (bool success, bytes32 result1, bytes32 result2) {
        assembly ("memory-safe") {
            success := staticcall(gas(), target, add(data, 0x20), mload(data), 0x00, 0x40)
            result1 := mload(0x00)
            result2 := mload(0x20)
        }
    }

    /// @dev Performs a Solidity function call using a low level `delegatecall` and ignoring the return data.
    function delegatecallNoReturn(address target, bytes memory data) internal returns (bool success) {
        assembly ("memory-safe") {
            success := delegatecall(gas(), target, add(data, 0x20), mload(data), 0x00, 0x00)
        }
    }

    /// @dev Performs a Solidity function call using a low level `delegatecall` and returns the first 64 bytes of the result
    /// in the scratch space of memory. Useful for functions that return a tuple with two single-word values.
    ///
    /// WARNING: Do not assume that the results are zero if `success` is false. Memory can be already allocated
    /// and this function doesn't zero it out.
    function delegatecallReturn64Bytes(
        address target,
        bytes memory data
    ) internal returns (bool success, bytes32 result1, bytes32 result2) {
        assembly ("memory-safe") {
            success := delegatecall(gas(), target, add(data, 0x20), mload(data), 0x00, 0x40)
            result1 := mload(0x00)
            result2 := mload(0x20)
        }
    }

    /// @dev Returns the size of the return data buffer.
    function returnDataSize() internal pure returns (uint256 size) {
        assembly ("memory-safe") {
            size := returndatasize()
        }
    }

    /// @dev Returns a buffer containing the return data from the last call.
    function returnData() internal pure returns (bytes memory result) {
        assembly ("memory-safe") {
            result := mload(0x40)
            mstore(result, returndatasize())
            returndatacopy(add(result, 0x20), 0x00, returndatasize())
            mstore(0x40, add(result, add(0x20, returndatasize())))
        }
    }

    /// @dev Revert with the return data from the last call.
    function bubbleRevert() internal pure {
        assembly ("memory-safe") {
            let fmp := mload(0x40)
            returndatacopy(fmp, 0x00, returndatasize())
            revert(fmp, returndatasize())
        }
    }

    function bubbleRevert(bytes memory returndata) internal pure {
        assembly ("memory-safe") {
            revert(add(returndata, 0x20), mload(returndata))
        }
    }
}


// File @openzeppelin/contracts/utils/Create2.sol@v5.6.1

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.5.0) (utils/Create2.sol)

pragma solidity ^0.8.20;


/**
 * @dev Helper to make usage of the `CREATE2` EVM opcode easier and safer.
 * `CREATE2` can be used to compute in advance the address where a smart
 * contract will be deployed, which allows for interesting new mechanisms known
 * as 'counterfactual interactions'.
 *
 * See the https://eips.ethereum.org/EIPS/eip-1014#motivation[EIP] for more
 * information.
 */
library Create2 {
    /**
     * @dev There's no code to deploy.
     */
    error Create2EmptyBytecode();

    /**
     * @dev Deploys a contract using `CREATE2`. The address where the contract
     * will be deployed can be known in advance via {computeAddress}.
     *
     * The bytecode for a contract can be obtained from Solidity with
     * `type(contractName).creationCode`.
     *
     * Requirements:
     *
     * - `bytecode` must not be empty.
     * - `salt` must have not been used for `bytecode` already.
     * - the factory must have a balance of at least `amount`.
     * - if `amount` is non-zero, `bytecode` must have a `payable` constructor.
     */
    function deploy(uint256 amount, bytes32 salt, bytes memory bytecode) internal returns (address addr) {
        if (address(this).balance < amount) {
            revert Errors.InsufficientBalance(address(this).balance, amount);
        }
        if (bytecode.length == 0) {
            revert Create2EmptyBytecode();
        }
        assembly ("memory-safe") {
            addr := create2(amount, add(bytecode, 0x20), mload(bytecode), salt)
        }
        if (addr == address(0)) {
            if (LowLevelCall.returnDataSize() == 0) {
                revert Errors.FailedDeployment();
            } else {
                LowLevelCall.bubbleRevert();
            }
        }
    }

    /**
     * @dev Returns the address where a contract will be stored if deployed via {deploy}. Any change in the
     * `bytecodeHash` or `salt` will result in a new destination address.
     */
    function computeAddress(bytes32 salt, bytes32 bytecodeHash) internal view returns (address) {
        return computeAddress(salt, bytecodeHash, address(this));
    }

    /**
     * @dev Returns the address where a contract will be stored if deployed via {deploy} from a contract located at
     * `deployer`. If `deployer` is this contract's address, returns the same value as {computeAddress}.
     */
    function computeAddress(bytes32 salt, bytes32 bytecodeHash, address deployer) internal pure returns (address addr) {
        assembly ("memory-safe") {
            let ptr := mload(0x40) // Get free memory pointer

            // |                     | ↓ ptr ...  ↓ ptr + 0x0B (start) ...  ↓ ptr + 0x20 ...  ↓ ptr + 0x40 ...   |
            // |---------------------|---------------------------------------------------------------------------|
            // | bytecodeHash        |                                                        CCCCCCCCCCCCC...CC |
            // | salt                |                                      BBBBBBBBBBBBB...BB                   |
            // | deployer            | 000000...0000AAAAAAAAAAAAAAAAAAA...AA                                     |
            // | 0xFF                |            FF                                                             |
            // |---------------------|---------------------------------------------------------------------------|
            // | memory              | 000000...00FFAAAAAAAAAAAAAAAAAAA...AABBBBBBBBBBBBB...BBCCCCCCCCCCCCC...CC |
            // | keccak(start, 0x55) |            ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑ |

            mstore(add(ptr, 0x40), bytecodeHash)
            mstore(add(ptr, 0x20), salt)
            mstore(ptr, deployer) // Right-aligned with 12 preceding garbage bytes
            let start := add(ptr, 0x0b) // The hashed data starts at the final garbage byte which we will set to 0xff
            mstore8(start, 0xff)
            addr := and(keccak256(start, 0x55), 0xffffffffffffffffffffffffffffffffffffffff)
        }
    }
}


// File @openzeppelin/contracts/proxy/Clones.sol@v5.6.1

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.5.0) (proxy/Clones.sol)

pragma solidity ^0.8.20;


/**
 * @dev https://eips.ethereum.org/EIPS/eip-1167[ERC-1167] is a standard for
 * deploying minimal proxy contracts, also known as "clones".
 *
 * > To simply and cheaply clone contract functionality in an immutable way, this standard specifies
 * > a minimal bytecode implementation that delegates all calls to a known, fixed address.
 *
 * The library includes functions to deploy a proxy using either `create` (traditional deployment) or `create2`
 * (salted deterministic deployment). It also includes functions to predict the addresses of clones deployed using the
 * deterministic method.
 */
library Clones {
    error CloneArgumentsTooLong();

    /**
     * @dev Deploys and returns the address of a clone that mimics the behavior of `implementation`.
     *
     * This function uses the create opcode, which should never revert.
     *
     * WARNING: This function does not check if `implementation` has code. A clone that points to an address
     * without code cannot be initialized. Initialization calls may appear to be successful when, in reality, they
     * have no effect and leave the clone uninitialized, allowing a third party to initialize it later.
     */
    function clone(address implementation) internal returns (address instance) {
        return clone(implementation, 0);
    }

    /**
     * @dev Same as {xref-Clones-clone-address-}[clone], but with a `value` parameter to send native currency
     * to the new contract.
     *
     * WARNING: This function does not check if `implementation` has code. A clone that points to an address
     * without code cannot be initialized. Initialization calls may appear to be successful when, in reality, they
     * have no effect and leave the clone uninitialized, allowing a third party to initialize it later.
     *
     * NOTE: Using a non-zero value at creation will require the contract using this function (e.g. a factory)
     * to always have enough balance for new deployments. Consider exposing this function under a payable method.
     */
    function clone(address implementation, uint256 value) internal returns (address instance) {
        if (address(this).balance < value) {
            revert Errors.InsufficientBalance(address(this).balance, value);
        }
        assembly ("memory-safe") {
            // Cleans the upper 96 bits of the `implementation` word, then packs the first 3 bytes
            // of the `implementation` address with the bytecode before the address.
            mstore(0x00, or(shr(232, shl(96, implementation)), 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000))
            // Packs the remaining 17 bytes of `implementation` with the bytecode after the address.
            mstore(0x20, or(shl(120, implementation), 0x5af43d82803e903d91602b57fd5bf3))
            instance := create(value, 0x09, 0x37)
        }
        if (instance == address(0)) {
            revert Errors.FailedDeployment();
        }
    }

    /**
     * @dev Deploys and returns the address of a clone that mimics the behavior of `implementation`.
     *
     * This function uses the create2 opcode and a `salt` to deterministically deploy
     * the clone. Using the same `implementation` and `salt` multiple times will revert, since
     * the clones cannot be deployed twice at the same address.
     *
     * WARNING: This function does not check if `implementation` has code. A clone that points to an address
     * without code cannot be initialized. Initialization calls may appear to be successful when, in reality, they
     * have no effect and leave the clone uninitialized, allowing a third party to initialize it later.
     */
    function cloneDeterministic(address implementation, bytes32 salt) internal returns (address instance) {
        return cloneDeterministic(implementation, salt, 0);
    }

    /**
     * @dev Same as {xref-Clones-cloneDeterministic-address-bytes32-}[cloneDeterministic], but with
     * a `value` parameter to send native currency to the new contract.
     *
     * WARNING: This function does not check if `implementation` has code. A clone that points to an address
     * without code cannot be initialized. Initialization calls may appear to be successful when, in reality, they
     * have no effect and leave the clone uninitialized, allowing a third party to initialize it later.
     *
     * NOTE: Using a non-zero value at creation will require the contract using this function (e.g. a factory)
     * to always have enough balance for new deployments. Consider exposing this function under a payable method.
     */
    function cloneDeterministic(
        address implementation,
        bytes32 salt,
        uint256 value
    ) internal returns (address instance) {
        if (address(this).balance < value) {
            revert Errors.InsufficientBalance(address(this).balance, value);
        }
        assembly ("memory-safe") {
            // Cleans the upper 96 bits of the `implementation` word, then packs the first 3 bytes
            // of the `implementation` address with the bytecode before the address.
            mstore(0x00, or(shr(232, shl(96, implementation)), 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000))
            // Packs the remaining 17 bytes of `implementation` with the bytecode after the address.
            mstore(0x20, or(shl(120, implementation), 0x5af43d82803e903d91602b57fd5bf3))
            instance := create2(value, 0x09, 0x37, salt)
        }
        if (instance == address(0)) {
            revert Errors.FailedDeployment();
        }
    }

    /**
     * @dev Computes the address of a clone deployed using {Clones-cloneDeterministic}.
     */
    function predictDeterministicAddress(
        address implementation,
        bytes32 salt,
        address deployer
    ) internal pure returns (address predicted) {
        assembly ("memory-safe") {
            let ptr := mload(0x40)
            mstore(add(ptr, 0x38), deployer)
            mstore(add(ptr, 0x24), 0x5af43d82803e903d91602b57fd5bf3ff)
            mstore(add(ptr, 0x14), implementation)
            mstore(ptr, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73)
            mstore(add(ptr, 0x58), salt)
            mstore(add(ptr, 0x78), keccak256(add(ptr, 0x0c), 0x37))
            predicted := and(keccak256(add(ptr, 0x43), 0x55), 0xffffffffffffffffffffffffffffffffffffffff)
        }
    }

    /**
     * @dev Computes the address of a clone deployed using {Clones-cloneDeterministic}.
     */
    function predictDeterministicAddress(
        address implementation,
        bytes32 salt
    ) internal view returns (address predicted) {
        return predictDeterministicAddress(implementation, salt, address(this));
    }

    /**
     * @dev Deploys and returns the address of a clone that mimics the behavior of `implementation` with custom
     * immutable arguments. These are provided through `args` and cannot be changed after deployment. To
     * access the arguments within the implementation, use {fetchCloneArgs}.
     *
     * This function uses the create opcode, which should never revert.
     *
     * WARNING: This function does not check if `implementation` has code. A clone that points to an address
     * without code cannot be initialized. Initialization calls may appear to be successful when, in reality, they
     * have no effect and leave the clone uninitialized, allowing a third party to initialize it later.
     */
    function cloneWithImmutableArgs(address implementation, bytes memory args) internal returns (address instance) {
        return cloneWithImmutableArgs(implementation, args, 0);
    }

    /**
     * @dev Same as {xref-Clones-cloneWithImmutableArgs-address-bytes-}[cloneWithImmutableArgs], but with a `value`
     * parameter to send native currency to the new contract.
     *
     * WARNING: This function does not check if `implementation` has code. A clone that points to an address
     * without code cannot be initialized. Initialization calls may appear to be successful when, in reality, they
     * have no effect and leave the clone uninitialized, allowing a third party to initialize it later.
     *
     * NOTE: Using a non-zero value at creation will require the contract using this function (e.g. a factory)
     * to always have enough balance for new deployments. Consider exposing this function under a payable method.
     */
    function cloneWithImmutableArgs(
        address implementation,
        bytes memory args,
        uint256 value
    ) internal returns (address instance) {
        if (address(this).balance < value) {
            revert Errors.InsufficientBalance(address(this).balance, value);
        }
        bytes memory bytecode = _cloneCodeWithImmutableArgs(implementation, args);
        assembly ("memory-safe") {
            instance := create(value, add(bytecode, 0x20), mload(bytecode))
        }
        if (instance == address(0)) {
            revert Errors.FailedDeployment();
        }
    }

    /**
     * @dev Deploys and returns the address of a clone that mimics the behavior of `implementation` with custom
     * immutable arguments. These are provided through `args` and cannot be changed after deployment. To
     * access the arguments within the implementation, use {fetchCloneArgs}.
     *
     * This function uses the create2 opcode and a `salt` to deterministically deploy the clone. Using the same
     * `implementation`, `args` and `salt` multiple times will revert, since the clones cannot be deployed twice
     * at the same address.
     *
     * WARNING: This function does not check if `implementation` has code. A clone that points to an address
     * without code cannot be initialized. Initialization calls may appear to be successful when, in reality, they
     * have no effect and leave the clone uninitialized, allowing a third party to initialize it later.
     */
    function cloneDeterministicWithImmutableArgs(
        address implementation,
        bytes memory args,
        bytes32 salt
    ) internal returns (address instance) {
        return cloneDeterministicWithImmutableArgs(implementation, args, salt, 0);
    }

    /**
     * @dev Same as {xref-Clones-cloneDeterministicWithImmutableArgs-address-bytes-bytes32-}[cloneDeterministicWithImmutableArgs],
     * but with a `value` parameter to send native currency to the new contract.
     *
     * WARNING: This function does not check if `implementation` has code. A clone that points to an address
     * without code cannot be initialized. Initialization calls may appear to be successful when, in reality, they
     * have no effect and leave the clone uninitialized, allowing a third party to initialize it later.
     *
     * NOTE: Using a non-zero value at creation will require the contract using this function (e.g. a factory)
     * to always have enough balance for new deployments. Consider exposing this function under a payable method.
     */
    function cloneDeterministicWithImmutableArgs(
        address implementation,
        bytes memory args,
        bytes32 salt,
        uint256 value
    ) internal returns (address instance) {
        bytes memory bytecode = _cloneCodeWithImmutableArgs(implementation, args);
        return Create2.deploy(value, salt, bytecode);
    }

    /**
     * @dev Computes the address of a clone deployed using {Clones-cloneDeterministicWithImmutableArgs}.
     */
    function predictDeterministicAddressWithImmutableArgs(
        address implementation,
        bytes memory args,
        bytes32 salt,
        address deployer
    ) internal pure returns (address predicted) {
        bytes memory bytecode = _cloneCodeWithImmutableArgs(implementation, args);
        return Create2.computeAddress(salt, keccak256(bytecode), deployer);
    }

    /**
     * @dev Computes the address of a clone deployed using {Clones-cloneDeterministicWithImmutableArgs}.
     */
    function predictDeterministicAddressWithImmutableArgs(
        address implementation,
        bytes memory args,
        bytes32 salt
    ) internal view returns (address predicted) {
        return predictDeterministicAddressWithImmutableArgs(implementation, args, salt, address(this));
    }

    /**
     * @dev Get the immutable args attached to a clone.
     *
     * - If `instance` is a clone that was deployed using `clone` or `cloneDeterministic`, this
     *   function will return an empty array.
     * - If `instance` is a clone that was deployed using `cloneWithImmutableArgs` or
     *   `cloneDeterministicWithImmutableArgs`, this function will return the args array used at
     *   creation.
     * - If `instance` is NOT a clone deployed using this library, the behavior is undefined. This
     *   function should only be used to check addresses that are known to be clones.
     */
    function fetchCloneArgs(address instance) internal view returns (bytes memory) {
        bytes memory result = new bytes(instance.code.length - 0x2d); // revert if length is too short
        assembly ("memory-safe") {
            extcodecopy(instance, add(result, 0x20), 0x2d, mload(result))
        }
        return result;
    }

    /**
     * @dev Helper that prepares the initcode of the proxy with immutable args.
     *
     * An assembly variant of this function requires copying the `args` array, which can be efficiently done using
     * `mcopy`. Unfortunately, that opcode is not available before cancun. A pure solidity implementation using
     * abi.encodePacked is more expensive but also more portable and easier to review.
     *
     * NOTE: https://eips.ethereum.org/EIPS/eip-170[EIP-170] limits the length of the contract code to 24576 bytes.
     * With the proxy code taking 45 bytes, that limits the length of the immutable args to 24531 bytes.
     */
    function _cloneCodeWithImmutableArgs(
        address implementation,
        bytes memory args
    ) private pure returns (bytes memory) {
        if (args.length > 0x5fd3) revert CloneArgumentsTooLong();
        return
            abi.encodePacked(
                hex"61",
                uint16(args.length + 0x2d),
                hex"3d81600a3d39f3363d3d373d3d3d363d73",
                implementation,
                hex"5af43d82803e903d91602b57fd5bf3",
                args
            );
    }
}


// File @openzeppelin/contracts/utils/StorageSlot.sol@v5.6.1

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (utils/StorageSlot.sol)
// This file was procedurally generated from scripts/generate/templates/StorageSlot.js.

pragma solidity ^0.8.20;

/**
 * @dev Library for reading and writing primitive types to specific storage slots.
 *
 * Storage slots are often used to avoid storage conflict when dealing with upgradeable contracts.
 * This library helps with reading and writing to such slots without the need for inline assembly.
 *
 * The functions in this library return Slot structs that contain a `value` member that can be used to read or write.
 *
 * Example usage to set ERC-1967 implementation slot:
 * ```solidity
 * contract ERC1967 {
 *     // Define the slot. Alternatively, use the SlotDerivation library to derive the slot.
 *     bytes32 internal constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
 *
 *     function _getImplementation() internal view returns (address) {
 *         return StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value;
 *     }
 *
 *     function _setImplementation(address newImplementation) internal {
 *         require(newImplementation.code.length > 0);
 *         StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value = newImplementation;
 *     }
 * }
 * ```
 *
 * TIP: Consider using this library along with {SlotDerivation}.
 */
library StorageSlot {
    struct AddressSlot {
        address value;
    }

    struct BooleanSlot {
        bool value;
    }

    struct Bytes32Slot {
        bytes32 value;
    }

    struct Uint256Slot {
        uint256 value;
    }

    struct Int256Slot {
        int256 value;
    }

    struct StringSlot {
        string value;
    }

    struct BytesSlot {
        bytes value;
    }

    /**
     * @dev Returns an `AddressSlot` with member `value` located at `slot`.
     */
    function getAddressSlot(bytes32 slot) internal pure returns (AddressSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `BooleanSlot` with member `value` located at `slot`.
     */
    function getBooleanSlot(bytes32 slot) internal pure returns (BooleanSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Bytes32Slot` with member `value` located at `slot`.
     */
    function getBytes32Slot(bytes32 slot) internal pure returns (Bytes32Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Uint256Slot` with member `value` located at `slot`.
     */
    function getUint256Slot(bytes32 slot) internal pure returns (Uint256Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Int256Slot` with member `value` located at `slot`.
     */
    function getInt256Slot(bytes32 slot) internal pure returns (Int256Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `StringSlot` with member `value` located at `slot`.
     */
    function getStringSlot(bytes32 slot) internal pure returns (StringSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `StringSlot` representation of the string storage pointer `store`.
     */
    function getStringSlot(string storage store) internal pure returns (StringSlot storage r) {
        assembly ("memory-safe") {
            r.slot := store.slot
        }
    }

    /**
     * @dev Returns a `BytesSlot` with member `value` located at `slot`.
     */
    function getBytesSlot(bytes32 slot) internal pure returns (BytesSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `BytesSlot` representation of the bytes storage pointer `store`.
     */
    function getBytesSlot(bytes storage store) internal pure returns (BytesSlot storage r) {
        assembly ("memory-safe") {
            r.slot := store.slot
        }
    }
}


// File @openzeppelin/contracts/utils/ReentrancyGuard.sol@v5.6.1

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.5.0) (utils/ReentrancyGuard.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 *
 * IMPORTANT: Deprecated. This storage-based reentrancy guard will be removed and replaced
 * by the {ReentrancyGuardTransient} variant in v6.0.
 *
 * @custom:stateless
 */
abstract contract ReentrancyGuard {
    using StorageSlot for bytes32;

    // keccak256(abi.encode(uint256(keccak256("openzeppelin.storage.ReentrancyGuard")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant REENTRANCY_GUARD_STORAGE =
        0x9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00;

    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _reentrancyGuardStorageSlot().getUint256Slot().value = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    /**
     * @dev A `view` only version of {nonReentrant}. Use to block view functions
     * from being called, preventing reading from inconsistent contract state.
     *
     * CAUTION: This is a "view" modifier and does not change the reentrancy
     * status. Use it only on view functions. For payable or non-payable functions,
     * use the standard {nonReentrant} modifier instead.
     */
    modifier nonReentrantView() {
        _nonReentrantBeforeView();
        _;
    }

    function _nonReentrantBeforeView() private view {
        if (_reentrancyGuardEntered()) {
            revert ReentrancyGuardReentrantCall();
        }
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        _nonReentrantBeforeView();

        // Any calls to nonReentrant after this point will fail
        _reentrancyGuardStorageSlot().getUint256Slot().value = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _reentrancyGuardStorageSlot().getUint256Slot().value = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _reentrancyGuardStorageSlot().getUint256Slot().value == ENTERED;
    }

    function _reentrancyGuardStorageSlot() internal pure virtual returns (bytes32) {
        return REENTRANCY_GUARD_STORAGE;
    }
}


// File contracts/PayrollVault.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;


/**
 * @title PayrollVault
 * @dev Individual vault for each company managing employee salaries and withdrawals.
 * 
 * Features:
 * - Employee management (add/remove with salary amount)
 * - Configurable payment schedule (withdrawal day of month)
 * - Time-based withdrawal locking
 * - Vault freezing capability
 * - Deposit functionality
 * 
 * @author Rootstock Payroll Vault
 */
contract PayrollVault is ReentrancyGuard {
    // State Variables
    address public registry;           // reference to VaultRegistry
    address public company;            // company/admin address
    string public companyName;         // company identifier
    bool public frozen;                // vault freeze status
    uint8 public withdrawalDay;        // day of month for withdrawals (1-28)
    uint256 public cycleStart;         // timestamp of current cycle start
    
    // Employee data
    struct Employee {
        uint256 salaryAmount;           // monthly salary in wei
        uint256 firstSalaryAmount;     // first month salary (can be different)
        uint256 lastWithdrawTime;       // timestamp of last withdrawal
        uint256 joinedAt;              // timestamp when employee was added
        bool hasWithdrawnFirstSalary;  // whether first salary has been withdrawn
        bool isActive;                 // employment status
    }
    mapping(address => Employee) public employees;
    address[] public employeeList;      // list of employee addresses
    
    // Events for off-chain indexing (MongoDB)
    event Deposit(
        address indexed from, 
        uint256 amount, 
        uint256 newBalance,
        uint256 timestamp
    );
    event EmployeeAdded(
        address indexed employee, 
        uint256 salaryAmount,
        address indexed addedBy,
        uint256 timestamp
    );
    event EmployeeRemoved(
        address indexed employee,
        address indexed removedBy,
        uint256 timestamp
    );
    event EmployeeUpdated(
        address indexed employee,
        uint256 oldSalary,
        uint256 newSalary,
        uint256 timestamp
    );
    event Withdrawal(
        address indexed employee, 
        uint256 amount,
        uint256 timestamp
    );
    event VaultFrozen(
        bool status,
        address indexed frozenBy,
        uint256 timestamp
    );
    event WithdrawalDayChanged(
        uint8 oldDay, 
        uint8 newDay,
        address indexed changedBy,
        uint256 timestamp
    );
    event CompanyUpdated(
        string oldName,
        string newName,
        uint256 timestamp
    );
    event VaultEmptied(
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    // Modifiers
    modifier onlyCompany() {
        require(msg.sender == company, "Caller is not the company admin");
        _;
    }

    modifier whenNotFrozen() {
        require(!frozen, "Vault is frozen");
        _;
    }

    /**
     * @dev Initialize the vault (called via proxy)
     * @param _company Company admin address
     * @param _companyName Name of the company
     * @param _registry Address of the VaultRegistry
     */
    function initialize(
        address _company,
        string memory _companyName,
        address _registry
    ) external {
        require(company == address(0), "Already initialized");
        require(_company != address(0), "Invalid company address");
        require(_registry != address(0), "Invalid registry address");
        
        company = _company;
        companyName = _companyName;
        registry = _registry;
        withdrawalDay = 25; // Default to 25th of month
        cycleStart = block.timestamp;
    }

    /**
     * @dev Deposit funds to the vault
     * @notice This function accepts native RBTC/ETH
     */
    function deposit() external payable whenNotFrozen {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        
        emit Deposit(
            msg.sender, 
            msg.value, 
            address(this).balance,
            block.timestamp
        );
    }

    /**
     * @dev Add a new employee to the vault
     * @param _employee Employee address
     * @param _salaryAmount Monthly salary in wei
     * @param _firstSalaryAmount First month salary in wei (can be different from regular salary)
     */
    function addEmployee(address _employee, uint256 _salaryAmount, uint256 _firstSalaryAmount) 
        external 
        onlyCompany 
    {
        require(_employee != address(0), "Invalid employee address");
        require(_salaryAmount > 0, "Salary must be greater than 0");
        // First salary is optional - if 0, use regular salary for first month
        require(!employees[_employee].isActive, "Employee already exists");
        
        employees[_employee] = Employee({
            salaryAmount: _salaryAmount,
            firstSalaryAmount: _firstSalaryAmount > 0 ? _firstSalaryAmount : _salaryAmount,
            lastWithdrawTime: 0,
            joinedAt: block.timestamp,
            hasWithdrawnFirstSalary: false,
            isActive: true
        });
        
        employeeList.push(_employee);
        
        emit EmployeeAdded(
            _employee, 
            _salaryAmount,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Remove an employee from the vault
     * @param _employee Employee address
     */
    function removeEmployee(address _employee) 
        external 
        onlyCompany 
    {
        require(employees[_employee].isActive, "Employee not found");
        
        employees[_employee].isActive = false;
        
        emit EmployeeRemoved(
            _employee,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Update an employee's salary
     * @param _employee Employee address
     * @param _newSalary New monthly salary in wei
     */
    function updateEmployeeSalary(address _employee, uint256 _newSalary)
        external
        onlyCompany
    {
        require(employees[_employee].isActive, "Employee not found");
        require(_newSalary > 0, "Salary must be greater than 0");
        
        uint256 oldSalary = employees[_employee].salaryAmount;
        employees[_employee].salaryAmount = _newSalary;
        
        emit EmployeeUpdated(
            _employee,
            oldSalary,
            _newSalary,
            block.timestamp
        );
    }

    /**
     * @dev Employee withdraw their salary
     * @notice Uses ReentrancyGuard for security
     * @notice Employees can only withdraw from 25th until end of month
     * @notice First salary has separate tracking from regular monthly salary
     */
    function withdraw() 
        external 
        nonReentrant 
        whenNotFrozen 
    {
        Employee storage employee = employees[msg.sender];
        
        require(employee.isActive, "Not an active employee");
        require(employee.salaryAmount > 0, "No salary configured");
        require(address(this).balance >= employee.salaryAmount, "Insufficient vault balance");
        
        // Check if withdrawal is allowed based on schedule
        require(canWithdraw(msg.sender), "Withdrawal not allowed yet");
        
        // Determine which salary to pay
        uint256 amount;
        if (!employee.hasWithdrawnFirstSalary) {
            // Pay first salary
            amount = employee.firstSalaryAmount;
            employee.hasWithdrawnFirstSalary = true;
        } else {
            // Pay regular salary
            amount = employee.salaryAmount;
        }
        
        // Update last withdrawal time
        employee.lastWithdrawTime = block.timestamp;
        
        // Transfer salary to employee
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(
            msg.sender, 
            amount,
            block.timestamp
        );
    }

    /**
     * @dev Check if an employee can withdraw
     * @param _employee Employee address
     * @return True if employee can withdraw
     */
    function canWithdraw(address _employee) public view returns (bool) {
        Employee memory employee = employees[_employee];
        
        if (!employee.isActive) return false;
        if (employee.salaryAmount == 0) return false;
        
        // Get current date info
        (uint256 currentYear, uint256 currentMonth, uint256 currentDay) = getCurrentDate();
        
        // Get employee's join date info
        (uint256 joinYear, uint256 joinMonth, uint256 joinDay) = getDateFromTimestamp(employee.joinedAt);
        
        // If employee joined after the withdrawal day in the same month, they must wait until next month
        if (joinYear == currentYear && joinMonth == currentMonth && joinDay > withdrawalDay) {
            return false;
        }
        
        // Check if we're in the withdrawal window (25th to end of month)
        if (currentDay < withdrawalDay) {
            return false;
        }
        
        // If first salary not yet withdrawn, they can withdraw now (if above conditions met)
        if (!employee.hasWithdrawnFirstSalary) {
            return true;
        }
        
        // For subsequent withdrawals, check if we're in a new month after last withdrawal
        // Get last withdrawal date info
        if (employee.lastWithdrawTime > 0) {
            (uint256 lastYear, uint256 lastMonth, ) = getDateFromTimestamp(employee.lastWithdrawTime);
            
            // Can only withdraw in a new month after the withdrawal day has passed
            if (currentYear == lastYear && currentMonth == lastMonth) {
                return false; // Already withdrawn this month
            }
        }
        
        return true;
    }
    
    /**
     * @dev Get date from timestamp (accurate calculation)
     * @param timestamp Unix timestamp
     * @return year The year
     * @return month The month (1-12)
     * @return day The day (1-31)
     */
    function getDateFromTimestamp(uint256 timestamp) public pure returns (uint256 year, uint256 month, uint256 day) {
        if (timestamp == 0) {
            return (0, 0, 0);
        }
        
        // Days since epoch (Jan 1, 1970)
        uint256 totalDays = timestamp / 86400;
        
        // Calculate year
        year = 1970;
        while (true) {
            uint256 daysInYear = _isLeapYear(year) ? 366 : 365;
            if (totalDays < daysInYear) {
                break;
            }
            totalDays -= daysInYear;
            year++;
        }
        
        // Calculate month and day
        uint256[12] memory daysInMonths = _getDaysInMonths(year);
        month = 1;
        for (uint256 i = 0; i < 12; i++) {
            if (totalDays < daysInMonths[i]) {
                day = totalDays + 1;
                break;
            }
            totalDays -= daysInMonths[i];
            month++;
        }
    }

    /**
     * @dev Check if year is a leap year
     */
    function _isLeapYear(uint256 year) internal pure returns (bool) {
        if (year % 4 != 0) return false;
        if (year % 100 != 0) return true;
        return year % 400 == 0;
    }

    /**
     * @dev Get days in each month for a given year
     */
    function _getDaysInMonths(uint256 year) internal pure returns (uint256[12] memory) {
        bool leap = _isLeapYear(year);
        uint256[12] memory monthDays;
        // January
        monthDays[0] = 31;
        // February (28 or 29)
        monthDays[1] = leap ? 29 : 28;
        // March - December
        monthDays[2] = 31;
        monthDays[3] = 30;
        monthDays[4] = 31;
        monthDays[5] = 30;
        monthDays[6] = 31;
        monthDays[7] = 31;
        monthDays[8] = 30;
        monthDays[9] = 31;
        monthDays[10] = 30;
        monthDays[11] = 31;
        return monthDays;
    }

    /**
     * @dev Check if current time is the withdrawal day
     * @return True if it's the withdrawal day or later in the month
     */
    function isWithdrawalDay() public view returns (bool) {
        (uint256 year, uint256 month, uint256 day) = getCurrentDate();
        
        // If we're past the withdrawal day in the current month
        if (day >= withdrawalDay) {
            return true;
        }
        
        // If we're in a new month after the withdrawal day
        uint256 lastMonthDay = getDaysInMonth(year, month);
        if (lastMonthDay < withdrawalDay && day >= lastMonthDay) {
            return true;
        }
        
        return false;
    }

    /**
     * @dev Get current date from block.timestamp (accurate calculation)
     * @return year The current year
     * @return month The current month (1-12)
     * @return day The current day (1-31)
     */
    function getCurrentDate() public view returns (uint256 year, uint256 month, uint256 day) {
        return getDateFromTimestamp(block.timestamp);
    }

    /**
     * @dev Get days in a month
     */
    function getDaysInMonth(uint256 year, uint256 month) public pure returns (uint256) {
        if (month == 2) {
            return _isLeapYear(year) ? 29 : 28;
        }
        if (month == 4 || month == 6 || month == 9 || month == 11) {
            return 30;
        }
        return 31;
    }

    /**
     * @dev Freeze or unfreeze the vault
     * @param _status Freeze status
     */
    function freezeVault(bool _status) external onlyCompany {
        require(frozen != _status, "Status already set");
        
        frozen = _status;
        
        emit VaultFrozen(
            _status,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Set the withdrawal day
     * @param _day Day of month (1-28)
     */
    function setWithdrawalDay(uint8 _day) external onlyCompany {
        require(_day >= 1 && _day <= 28, "Withdrawal day must be between 1 and 28");
        
        uint8 oldDay = withdrawalDay;
        withdrawalDay = _day;
        
        emit WithdrawalDayChanged(
            oldDay,
            _day,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Update company name
     * @param _newName New company name
     */
    function updateCompanyName(string memory _newName) external onlyCompany {
        string memory oldName = companyName;
        companyName = _newName;
        
        emit CompanyUpdated(
            oldName,
            _newName,
            block.timestamp
        );
    }

    /**
     * @dev Get employee information
     * @param _employee Employee address
     * @return salaryAmount The employee's monthly salary
     * @return lastWithdrawTime Timestamp of last withdrawal
     * @return isActive Whether employee is active
     * @return canWithdrawNow Whether employee can withdraw now
     */
    function getEmployeeInfo(address _employee) 
        external 
        view 
        returns (
            uint256 salaryAmount,
            uint256 lastWithdrawTime,
            bool isActive,
            bool canWithdrawNow
        ) 
    {
        Employee memory emp = employees[_employee];
        return (
            emp.salaryAmount,
            emp.lastWithdrawTime,
            emp.isActive,
            canWithdraw(_employee)
        );
    }

    /**
     * @dev Get the number of employees
     * @return Number of employees
     */
    function getEmployeeCount() external view returns (uint256) {
        return employeeList.length;
    }

    /**
     * @dev Get all active employee addresses
     * @return Array of employee addresses
     */
    function getActiveEmployees() external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < employeeList.length; i++) {
            if (employees[employeeList[i]].isActive) {
                count++;
            }
        }
        
        address[] memory result = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < employeeList.length; i++) {
            if (employees[employeeList[i]].isActive) {
                result[index] = employeeList[i];
                index++;
            }
        }
        
        return result;
    }

    /**
     * @dev Get vault balance
     * @return Current balance of the vault
     */
    function getVaultBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Allow company to withdraw excess funds (emergency)
     * @param _amount Amount to withdraw
     */
    function withdrawExcess(uint256 _amount) external onlyCompany {
        require(_amount <= address(this).balance, "Insufficient balance");
        
        // Ensure there's enough for pending salaries
        uint256 pendingSalaries = getTotalPendingSalaries();
        require(address(this).balance - _amount >= pendingSalaries, "Cannot withdraw funds needed for salaries");
        
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Transfer failed");
        
        emit VaultEmptied(msg.sender, _amount, block.timestamp);
    }

    /**
     * @dev Calculate total pending salaries for all active employees
     * @return Total salary amount needed
     */
    function getTotalPendingSalaries() public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < employeeList.length; i++) {
            if (employees[employeeList[i]].isActive) {
                total += employees[employeeList[i]].salaryAmount;
            }
        }
        return total;
    }

    /**
     * @dev Receive ETH/RBTC
     */
    receive() external payable {}
}


// File contracts/VaultRegistry.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;



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
