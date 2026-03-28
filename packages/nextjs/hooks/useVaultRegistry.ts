import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { useCallback, useMemo } from "react";
import { VAULT_REGISTRY_ADDRESS, VaultRegistryAbi } from "~~/contracts/abis";

export function useVaultRegistry() {
  const { address: userAddress } = useAccount();
  const { data: vaultCount, isLoading: isLoadingCount, refetch: refetchCount } = useReadContract({
    address: VAULT_REGISTRY_ADDRESS,
    abi: VaultRegistryAbi,
    functionName: "getVaultCount",
  });

  const { data: hasVault, isLoading: isLoadingHasVault, refetch: refetchHasVault } = useReadContract({
    address: VAULT_REGISTRY_ADDRESS,
    abi: VaultRegistryAbi,
    functionName: "hasVault",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  const { data: userVaultAddress, isLoading: isLoadingVaultAddress, refetch: refetchVaultAddress } = useReadContract({
    address: VAULT_REGISTRY_ADDRESS,
    abi: VaultRegistryAbi,
    functionName: "getVaultAddress",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  return {
    vaultCount: vaultCount ?? 0n,
    hasVault: hasVault ?? false,
    userVaultAddress: userVaultAddress ?? "0x",
    isLoading: isLoadingCount || isLoadingHasVault || isLoadingVaultAddress,
    refetch: {
      count: refetchCount,
      hasVault: refetchHasVault,
      vaultAddress: refetchVaultAddress,
    },
  };
}

export function useCreateVault() {
  const { data: hash, writeContractAsync, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const createVault = useCallback(
    async (companyName: string) => {
      return writeContractAsync({
        address: VAULT_REGISTRY_ADDRESS,
        abi: VaultRegistryAbi,
        functionName: "createVault",
        args: [companyName],
      });
    },
    [writeContractAsync]
  );

  return {
    createVault,
    isWritePending,
    isConfirming,
    isConfirmed,
  };
}

export function useGetVaultAddress(companyAddress?: string) {
  const { data, isLoading, refetch } = useReadContract({
    address: VAULT_REGISTRY_ADDRESS,
    abi: VaultRegistryAbi,
    functionName: "getVaultAddress",
    args: companyAddress ? [companyAddress] : undefined,
    query: {
      enabled: !!companyAddress,
    },
  });

  return {
    vaultAddress: data ?? "0x",
    isLoading,
    refetch,
  };
}

export function useGetAllVaults() {
  const { data, isLoading, refetch } = useReadContract({
    address: VAULT_REGISTRY_ADDRESS,
    abi: VaultRegistryAbi,
    functionName: "getAllVaults",
    query: {},
  });

  return {
    vaultAddresses: data ?? [],
    isLoading,
    refetch,
  };
}
