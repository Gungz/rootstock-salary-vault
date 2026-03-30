"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount, useConfig } from "wagmi";
import toast from "react-hot-toast";
import { useVaultRegistry, useCreateVault } from "~~/hooks/useVaultRegistry";
import {
  usePayrollVault,
  useDeposit,
  useAddEmployee,
  useRemoveEmployee,
  useFreezeVault,
  useSetWithdrawalDay,
} from "~~/hooks/usePayrollVault";
import { parseRBTC, formatRBTC } from "~~/contracts/abis";
import {
  GlassCard,
  NeonButton,
  StatCard,
  PageHeader,
  SectionTitle,
  Badge,
  GlassInput,
} from "~~/components/ui/CosmicBackground";
import { waitForTransactionReceipt } from "wagmi/actions";

function CreateVaultForm({ onSuccess }: { onSuccess?: () => void }) {
  const [companyName, setCompanyName] = useState("");
  const { createVault, isWritePending, isConfirming, isConfirmed } = useCreateVault();
  const config = useConfig();

  // Wagmi's useWaitForTransactionReceipt provides isConfirmed
  // After confirmation, refetch vault data
  // useEffect(() => {
  //  if (isConfirmed) {
  //    onSuccess?.();
  //  }
  //}, [isConfirmed, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast.error("Please enter a company name");
      return;
    }
    try {
      const hash = await createVault(companyName);
      const receipt = await waitForTransactionReceipt(config, { hash })
      console.log(receipt)
      if (receipt.status === 'success') {
        toast.success("Vault created successfully!");
        setCompanyName("");
        await onSuccess?.();
      } else {
        console.log('Transaction reverted on-chain', receipt)
      }
    } catch (error) {
      toast.error("Failed to create vault");
    }
  };

  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
        Create Payroll Vault
      </h2>
      {isConfirming && (
        <div className="mt-4 flex items-center gap-2 text-[var(--neon-cyan)]">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Creating vault...
        </div>
      )}
      <p className="text-[var(--text-muted)] mb-6">
        Create a new payroll vault for your company.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm text-[var(--text-muted)] mb-2">
            Company Name
          </label>
          <GlassInput
            type="text"
            placeholder="My Company"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={isWritePending}
          />
        </div>
        <NeonButton
          type="submit"
          disabled={isWritePending}
          variant="primary"
          className="w-full justify-center"
        >
          {isWritePending || isConfirming ? "Creating..." : "Create Vault"}
        </NeonButton>
      </form>
    </GlassCard>
  );
}

function DepositForm({ vaultAddress, onSuccess }: { vaultAddress: string; onSuccess?: () => void }) {
  const [amount, setAmount] = useState("");
  const { deposit, isWritePending: isWritePendingDeposit } = useDeposit(vaultAddress);
  const config = useConfig();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseRBTC(amount);
    if (!parsedAmount || parsedAmount <= 0n) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      const hash = await deposit(parsedAmount);
      if (!hash) {
        toast.error("Failed to send transaction");
        return;
      }
      setIsConfirming(true);
      const receipt = await waitForTransactionReceipt(config, { hash });
      setIsConfirming(false);
      if (receipt.status === "success") {
        toast.success("Deposit successful!");
        setAmount("");
        await onSuccess?.();
      } else {
        toast.error("Deposit failed");
      }
    } catch (error) {
      toast.error("Failed to deposit");
      setIsConfirming(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
        Deposit Funds
      </h2>
      <p className="text-[var(--text-muted)] mb-6">
        Add funds to your payroll vault.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm text-[var(--text-muted)] mb-2">
            Amount (RBTC)
          </label>
          <GlassInput
            type="text"
            placeholder="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isWritePendingDeposit}
          />
        </div>
        <NeonButton
          type="submit"
          disabled={isWritePendingDeposit || isConfirming}
          variant="primary"
          className="w-full justify-center"
        >
          {isWritePendingDeposit || isConfirming ? "Depositing..." : "Deposit"}
        </NeonButton>
      </form>
    </GlassCard>
  );
}

function AddEmployeeForm({ vaultAddress, onSuccess }: { vaultAddress: string; onSuccess?: () => void }) {
  const [employeeAddress, setEmployeeAddress] = useState("");
  const [salaryAmount, setSalaryAmount] = useState("");
  const [firstSalaryAmount, setFirstSalaryAmount] = useState("");
  const { addEmployee, isWritePending: isWritePendingAdd } = useAddEmployee(vaultAddress);
  const config = useConfig();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeAddress) {
      toast.error("Please enter employee address");
      return;
    }
    const salary = parseRBTC(salaryAmount);
    if (!salary || salary <= 0n) {
      toast.error("Please enter valid salary amount");
      return;
    }
    const firstBonus = firstSalaryAmount ? parseRBTC(firstSalaryAmount) : 0n;
    try {
      const hash = await addEmployee(employeeAddress, salary, firstBonus);
      if (!hash) {
        toast.error("Failed to send transaction");
        return;
      }
      setIsConfirming(true);
      const receipt = await waitForTransactionReceipt(config, { hash });
      setIsConfirming(false);
      if (receipt.status === "success") {
        toast.success("Employee added!");
        setEmployeeAddress("");
        setSalaryAmount("");
        setFirstSalaryAmount("");
        await onSuccess?.();
      } else {
        toast.error("Failed to add employee");
      }
    } catch (error) {
      toast.error("Failed to add employee");
      setIsConfirming(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
        Add Employee
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-2">
              Employee Address
            </label>
            <GlassInput
              type="text"
              placeholder="0x..."
              value={employeeAddress}
              onChange={(e) => setEmployeeAddress(e.target.value)}
              disabled={isWritePendingAdd}
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-2">
              Monthly Salary (RBTC)
            </label>
            <GlassInput
              type="text"
              placeholder="0.01"
              value={salaryAmount}
              onChange={(e) => setSalaryAmount(e.target.value)}
              disabled={isWritePendingAdd}
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-2">
              First Month Salary (Optional)
            </label>
            <GlassInput
              type="text"
              placeholder="0.00"
              value={firstSalaryAmount}
              onChange={(e) => setFirstSalaryAmount(e.target.value)}
              disabled={isWritePendingAdd}
            />
          </div>
        </div>
        <NeonButton
          type="submit"
          disabled={isWritePendingAdd || isConfirming}
          variant="secondary"
          className="w-full justify-center mt-4"
        >
          {isWritePendingAdd || isConfirming ? "Adding..." : "Add Employee"}
        </NeonButton>
      </form>
    </GlassCard>
  );
}

function VaultControls({ vaultAddress, onSuccess }: { vaultAddress: string; onSuccess?: () => void }) {
  const { vaultBalance, withdrawalDay, frozen, refetch } = usePayrollVault(vaultAddress);
  const { freezeVault, isWritePending: isWritePendingFreeze } = useFreezeVault(vaultAddress);
  const { setWithdrawalDay, isWritePending: isWritePendingSetDay } = useSetWithdrawalDay(vaultAddress);
  const config = useConfig();
  const [newDay, setNewDay] = useState(withdrawalDay?.toString() || "25");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmingDay, setIsConfirmingDay] = useState(false);

  const handleFreeze = async () => {
    try {
      const hash = await freezeVault(!frozen);
      if (!hash) {
        toast.error("Failed to send transaction");
        return;
      }
      setIsConfirming(true);
      const receipt = await waitForTransactionReceipt(config, { hash });
      setIsConfirming(false);
      if (receipt.status === "success") {
        toast.success(frozen ? "Vault unfrozen" : "Vault frozen");
        await onSuccess?.();
      } else {
        toast.error("Failed to update vault");
      }
    } catch (error) {
      toast.error("Failed to update vault");
      setIsConfirming(false);
    }
  };

  const handleSetDay = async (e: React.FormEvent) => {
    e.preventDefault();
    const day = Number(newDay);
    if (Number.isNaN(day)) {
      toast.error("Invalid day");
      return;
    }
    try {
      const hash = await setWithdrawalDay(day);
      if (!hash) {
        toast.error("Failed to send transaction");
        return;
      }
      setIsConfirmingDay(true);
      const receipt = await waitForTransactionReceipt(config, { hash });
      setIsConfirmingDay(false);
      if (receipt.status === "success") {
        toast.success("Withdrawal day updated");
        await onSuccess?.();
      } else {
        toast.error("Failed to update day");
      }
    } catch (error) {
      toast.error("Failed to update day");
      setIsConfirmingDay(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
        Vault Settings
      </h2>

      <div className="space-y-6">
        <div className="flex justify-between items-center py-3 border-b border-[var(--border-subtle)]">
          <div>
            <span className="text-[var(--text-muted)]">Vault Balance</span>
            <p className="text-xl font-bold text-[var(--neon-cyan)]">
              {formatRBTC(vaultBalance)} RBTC
            </p>
          </div>
          <Badge variant={frozen ? "frozen" : "active"}>
            {frozen ? "Frozen" : "Active"}
          </Badge>
        </div>

        <div className="py-3 border-b border-[var(--border-subtle)]">
          <span className="text-[var(--text-muted)] block mb-2">
            Withdrawal Day (1-28)
          </span>
          <form onSubmit={handleSetDay} className="flex gap-2">
            <GlassInput
              type="number"
              min="1"
              max="28"
              value={newDay}
              onChange={(e) => setNewDay(e.target.value)}
              className="w-20"
            />
            <NeonButton type="submit" disabled={isWritePendingSetDay || isConfirmingDay} variant="secondary">
              {isWritePendingSetDay || isConfirmingDay ? "..." : "Update"}
            </NeonButton>
          </form>
        </div>

        <NeonButton
          onClick={handleFreeze}
          disabled={isWritePendingFreeze || isConfirming}
          variant={frozen ? "primary" : "danger"}
          className="w-full justify-center"
        >
          {isWritePendingFreeze || isConfirming ? "..." : frozen ? "Unfreeze Vault" : "Freeze Vault"}
        </NeonButton>
      </div>
    </GlassCard>
  );
}

function AdminDashboard({ vaultAddress, onSuccess }: { vaultAddress: string; onSuccess?: () => void }) {
  const { vaultBalance, employeeCount, withdrawalDay, frozen, totalPendingSalaries, refetch, companyName } = usePayrollVault(vaultAddress);

  // Calculate coverage: how many months the vault can pay
  const coverageMonths = useMemo(() => {
    if (!totalPendingSalaries || totalPendingSalaries === 0n) return 0;
    return Number(vaultBalance) / Number(totalPendingSalaries);
  }, [vaultBalance, totalPendingSalaries]);

  const handleSuccess = useCallback(() => {
    refetch.balance();
    refetch.totalSalaries();
    refetch.count();
    refetch.withdrawalDay();
  }, [refetch]);

  return (
    <div className="space-y-8">
      {/* Vault Info */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-[var(--text-muted)] text-sm">Vault Address</span>
            <p className="text-[var(--text-primary)] font-mono text-sm break-all">{vaultAddress}</p>
          </div>
          {companyName && (
            <div>
              <span className="text-[var(--text-muted)] text-sm">Company</span>
              <p className="text-[var(--text-primary)] font-medium">{companyName}</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard label="Balance" value={`${formatRBTC(vaultBalance)} RBTC`} />
        <StatCard label="Total Monthly" value={`${formatRBTC(totalPendingSalaries)} RBTC`} />
        <StatCard label="Coverage" value={`${coverageMonths} months`} />
        <StatCard label="Employees" value={employeeCount} />
        <StatCard label="Withdrawal Day" value={`${withdrawalDay || 25}th`} />
      </div>

      {/* Status Banner */}
      {coverageMonths < 1 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-red-400 font-medium">Insufficient Funds</p>
            <p className="text-red-300/70 text-sm">Vault balance is less than one month of salaries. Add funds to continue payroll.</p>
          </div>
        </div>
      )}

      {coverageMonths >= 1 && coverageMonths < 3 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-yellow-400 font-medium">Low Funds</p>
            <p className="text-yellow-300/70 text-sm">Vault has less than 3 months of coverage. Consider adding more funds.</p>
          </div>
        </div>
      )}

      <SectionTitle neonColor="cyan">Manage Vault</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DepositForm vaultAddress={vaultAddress} onSuccess={handleSuccess} />
        <AddEmployeeForm vaultAddress={vaultAddress} onSuccess={handleSuccess} />
        <VaultControls vaultAddress={vaultAddress} onSuccess={handleSuccess} />
      </div>
    </div>
  );
}

function NoVaultAdmin({ onSuccess }: { onSuccess?: () => void }) {
  return (
    <GlassCard className="p-8 text-center max-w-md mx-auto">
      <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(0,245,255,0.1)] flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-[var(--neon-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
        Create Your Vault
      </h2>
      <p className="text-[var(--text-muted)] mb-6">
        You don't have a payroll vault yet. Create one to start managing your company payroll.
      </p>
      <CreateVaultForm onSuccess={onSuccess} />
    </GlassCard>
  );
}

function NotConnectedAdmin() {
  return (
    <GlassCard className="p-8 text-center max-w-md mx-auto">
      <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(255,159,28,0.1)] flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-[var(--neon-orange)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
        Connect Wallet
      </h2>
      <p className="text-[var(--text-muted)]">
        Please connect your wallet to access the admin dashboard.
      </p>
    </GlassCard>
  );
}

export default function AdminPage() {
  const { address: userAddress, isConnected } = useAccount();
  const { userVaultAddress, hasVault, isLoading, refetch } = useVaultRegistry();


  // Callback to refetch all vault data after any state change
  const handleSuccess = useCallback(() => {
    refetch.hasVault();
    refetch.vaultAddress();
    refetch.count();
  }, [refetch]);

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <PageHeader title="Admin Dashboard" description="Manage your company payroll vault" />
        <NotConnectedAdmin />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Admin Dashboard"
        description={`Connected: ${userAddress?.slice(0, 6)}...${userAddress?.slice(-4)}`}
      />

      {!hasVault || !userVaultAddress ? (
        <NoVaultAdmin onSuccess={handleSuccess} />
      ) : (
        <AdminDashboard vaultAddress={userVaultAddress} />
      )}
    </div>
  );
}
