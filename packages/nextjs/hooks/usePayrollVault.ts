import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { useCallback, useMemo } from "react";
import { PayrollVaultAbi, Employee } from "~~/contracts/abis";

export function usePayrollVault(vaultAddress?: string) {
  const { address: userAddress } = useAccount();

  const canRead = useMemo(() => !!vaultAddress, [vaultAddress]);

  const { data: company, isLoading: isLoadingCompany } = useReadContract({
    address: vaultAddress,
    abi: PayrollVaultAbi,
    functionName: "company",
    query: { enabled: canRead },
  });

  const { data: companyName, isLoading: isLoadingCompanyName } = useReadContract({
    address: vaultAddress,
    abi: PayrollVaultAbi,
    functionName: "companyName",
    query: { enabled: canRead },
  });

  const { data: frozen, isLoading: isLoadingFrozen } = useReadContract({
    address: vaultAddress,
    abi: PayrollVaultAbi,
    functionName: "frozen",
    query: { enabled: canRead },
  });

  const { data: withdrawalDay, isLoading: isLoadingWithdrawalDay, refetch: refetchWithdrawalDay } = useReadContract({
    address: vaultAddress,
    abi: PayrollVaultAbi,
    functionName: "withdrawalDay",
    query: { enabled: canRead },
  });

  const { data: vaultBalance, isLoading: isLoadingBalance, refetch: refetchBalance } = useReadContract({
    address: vaultAddress,
    abi: PayrollVaultAbi,
    functionName: "getVaultBalance",
    query: { enabled: canRead },
  });

  const { data: employeeCount, isLoading: isLoadingCount, refetch: refetchCount } = useReadContract({
    address: vaultAddress,
    abi: PayrollVaultAbi,
    functionName: "getEmployeeCount",
    query: { enabled: canRead },
  });

  const { data: totalPendingSalaries, isLoading: isLoadingTotalSalaries, refetch: refetchTotalSalaries } = useReadContract({
    address: vaultAddress,
    abi: PayrollVaultAbi,
    functionName: "getTotalPendingSalaries",
    query: { enabled: canRead },
  });

  const isAdmin = useMemo(() => {
    return company === userAddress;
  }, [company, userAddress]);

  return {
    company: company ?? "0x",
    companyName: companyName ?? "",
    frozen: frozen ?? false,
    withdrawalDay: Number(withdrawalDay ?? 25n),
    vaultBalance: vaultBalance ?? 0n,
    employeeCount: Number(employeeCount ?? 0n),
    totalPendingSalaries: totalPendingSalaries ?? 0n,
    isAdmin,
    isLoading:
      isLoadingCompany ||
      isLoadingCompanyName ||
      isLoadingFrozen ||
      isLoadingWithdrawalDay ||
      isLoadingBalance ||
      isLoadingCount ||
      isLoadingTotalSalaries,
    refetch: {
      balance: refetchBalance,
      count: refetchCount,
      totalSalaries: refetchTotalSalaries,
      withdrawalDay: refetchWithdrawalDay
    },
  };
}

export function useEmployee(vaultAddress?: string, employeeAddress?: string) {
  const canRead = useMemo(() => !!vaultAddress && !!employeeAddress, [vaultAddress, employeeAddress]);

  const { data: employeeData, isLoading, refetch } = useReadContract({
    address: vaultAddress,
    abi: PayrollVaultAbi,
    functionName: "employees",
    args: employeeAddress ? [employeeAddress] : undefined,
    query: { enabled: canRead },
  });

  const { data: canWithdraw, isLoading: isLoadingCanWithdraw } = useReadContract({
    address: vaultAddress,
    abi: PayrollVaultAbi,
    functionName: "canWithdraw",
    args: employeeAddress ? [employeeAddress] : undefined,
    query: { enabled: canRead },
  });

  const employee: Employee | null = useMemo(() => {
    if (!employeeData) return null;
    return {
      salaryAmount: employeeData[0],
      firstSalaryAmount: employeeData[1],
      lastWithdrawTime: employeeData[2],
      joinedAt: employeeData[3],
      hasWithdrawnFirstSalary: employeeData[4],
      isActive: employeeData[5],
    };
  }, [employeeData]);

  return {
    employee,
    canWithdraw: canWithdraw ?? false,
    isLoading: isLoading || isLoadingCanWithdraw,
    refetch,
  };
}

export function useEmployeeList(vaultAddress?: string) {
  const { data: employeeCount, isLoading: isLoadingCount } = useReadContract({
    address: vaultAddress,
    abi: PayrollVaultAbi,
    functionName: "getEmployeeCount",
    query: { enabled: !!vaultAddress },
  });

  const employees = useMemo(() => {
    if (!employeeCount) return [];
    return Array.from({ length: Number(employeeCount) }, (_, i) => i);
  }, [employeeCount]);

  return {
    employeeIndices: employees,
    isLoading: isLoadingCount,
  };
}

export function useEmployeeAtIndex(vaultAddress?: string, index?: number) {
  const { data, isLoading, refetch } = useReadContract({
    address: vaultAddress,
    abi: PayrollVaultAbi,
    functionName: "employeeList",
    args: index !== undefined ? [BigInt(index)] : undefined,
    query: { enabled: !!vaultAddress && index !== undefined },
  });

  return {
    employeeAddress: data ?? "0x",
    isLoading,
    refetch,
  };
}

export function useDeposit(vaultAddress?: string) {
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt();

  const deposit = useCallback(
    async (value: bigint) => {
      if (!vaultAddress) return;
      return writeContractAsync({
        address: vaultAddress,
        abi: PayrollVaultAbi,
        functionName: "deposit",
        value,
      });
    },
    [vaultAddress, writeContractAsync]
  );

  return {
    deposit,
    isWritePending,
    isConfirming,
    isConfirmed,
  };
}

export function useAddEmployee(vaultAddress?: string) {
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt();

  const addEmployee = useCallback(
    async (employee: string, salaryAmount: bigint, firstSalaryAmount: bigint) => {
      if (!vaultAddress) return;
      return writeContractAsync({
        address: vaultAddress,
        abi: PayrollVaultAbi,
        functionName: "addEmployee",
        args: [employee as `0x${string}`, salaryAmount, firstSalaryAmount],
      });
    },
    [vaultAddress, writeContractAsync]
  );

  return {
    addEmployee,
    isWritePending,
    isConfirming,
    isConfirmed,
  };
}

export function useRemoveEmployee(vaultAddress?: string) {
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt();

  const removeEmployee = useCallback(
    async (employee: string) => {
      if (!vaultAddress) return;
      return writeContractAsync({
        address: vaultAddress,
        abi: PayrollVaultAbi,
        functionName: "removeEmployee",
        args: [employee as `0x${string}`],
      });
    },
    [vaultAddress, writeContractAsync]
  );

  return {
    removeEmployee,
    isWritePending,
    isConfirming,
    isConfirmed,
  };
}

export function useUpdateEmployeeSalary(vaultAddress?: string) {
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt();

  const updateSalary = useCallback(
    async (employee: string, newSalary: bigint) => {
      if (!vaultAddress) return;
      return writeContractAsync({
        address: vaultAddress,
        abi: PayrollVaultAbi,
        functionName: "updateEmployeeSalary",
        args: [employee as `0x${string}`, newSalary],
      });
    },
    [vaultAddress, writeContractAsync]
  );

  return {
    updateSalary,
    isWritePending,
    isConfirming,
    isConfirmed,
  };
}

export function useFreezeVault(vaultAddress?: string) {
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt();

  const freezeVault = useCallback(
    async (status: boolean) => {
      if (!vaultAddress) return;
      return writeContractAsync({
        address: vaultAddress,
        abi: PayrollVaultAbi,
        functionName: "freezeVault",
        args: [status],
      });
    },
    [vaultAddress, writeContractAsync]
  );

  return {
    freezeVault,
    isWritePending,
    isConfirming,
    isConfirmed,
  };
}

export function useSetWithdrawalDay(vaultAddress?: string) {
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt();

  const setWithdrawalDay = useCallback(
    async (day: number) => {
      if (!vaultAddress) return;
      return writeContractAsync({
        address: vaultAddress,
        abi: PayrollVaultAbi,
        functionName: "setWithdrawalDay",
        args: [day] as never,
      });
    },
    [vaultAddress, writeContractAsync]
  );

  return {
    setWithdrawalDay,
    isWritePending,
    isConfirming,
    isConfirmed,
  };
}

export function useUpdateCompanyName(vaultAddress?: string) {
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt();

  const updateCompanyName = useCallback(
    async (newName: string) => {
      if (!vaultAddress) return;
      return writeContractAsync({
        address: vaultAddress,
        abi: PayrollVaultAbi,
        functionName: "updateCompanyName",
        args: [newName],
      });
    },
    [vaultAddress, writeContractAsync]
  );

  return {
    updateCompanyName,
    isWritePending,
    isConfirming,
    isConfirmed,
  };
}

export function useWithdraw(vaultAddress?: string) {
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt();

  const withdraw = useCallback(async () => {
    if (!vaultAddress) return;
    return writeContractAsync({
      address: vaultAddress,
      abi: PayrollVaultAbi,
      functionName: "withdraw",
    });
  }, [vaultAddress, writeContractAsync]);

  return {
    withdraw,
    isWritePending,
    isConfirming,
    isConfirmed,
  };
}

export function useCanWithdraw(vaultAddress?: string, employeeAddress?: string) {
  const { data, isLoading, refetch } = useReadContract({
    address: vaultAddress,
    abi: PayrollVaultAbi,
    functionName: "canWithdraw",
    args: employeeAddress ? [employeeAddress] : undefined,
    query: { enabled: !!vaultAddress && !!employeeAddress },
  });

  return {
    canWithdraw: data ?? false,
    isLoading,
    refetch,
  };
}
