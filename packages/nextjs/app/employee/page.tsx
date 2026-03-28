"use client";

import { useState } from "react";
import { useAccount, useConfig } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import toast from "react-hot-toast";
import { useVaultRegistry } from "~~/hooks/useVaultRegistry";
import { usePayrollVault, useEmployee, useCanWithdraw, useWithdraw } from "~~/hooks/usePayrollVault";
import { formatRBTC } from "~~/contracts/abis";
import { GlassCard, NeonButton, StatCard, PageHeader, Badge } from "~~/components/ui/CosmicBackground";

function EmployeeProfile({ vaultAddress, employeeAddress }: { vaultAddress: string; employeeAddress: string }) {
  const { employee, canWithdraw, isLoading, refetch } = useEmployee(vaultAddress, employeeAddress);
  const { vaultBalance, withdrawalDay, frozen } = usePayrollVault(vaultAddress);
  const { withdraw, isWritePending: isWritePendingWithdraw } = useWithdraw(vaultAddress);
  const config = useConfig();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleWithdraw = async () => {
    try {
      const hash = await withdraw();
      if (!hash) {
        toast.error("Failed to send transaction");
        return;
      }
      setIsConfirming(true);
      const receipt = await waitForTransactionReceipt(config, { hash });
      setIsConfirming(false);
      if (receipt.status === "success") {
        toast.success("Withdrawal successful!");
        await refetch();
      } else {
        toast.error("Withdrawal failed");
      }
    } catch (error) {
      toast.error("Failed to withdraw");
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="w-12 h-12 border-4 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!employee) {
    return (
      <GlassCard className="p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(255,159,28,0.15)] flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[var(--neon-orange)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Not Registered</h3>
        <p className="text-[var(--text-muted)]">You are not an employee in this vault.</p>
      </GlassCard>
    );
  }

  const withdrawableAmount = employee.hasWithdrawnFirstSalary ? employee.salaryAmount : employee.firstSalaryAmount;
  const canWithdrawNow = canWithdraw && !frozen;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Salary" value={`${formatRBTC(withdrawableAmount)} RBTC`} />
        <StatCard label="Withdrawal Day" value={`${withdrawalDay || 25}th`} />
        <StatCard label="Status" value={frozen ? "Frozen" : "Active"} />
      </div>

      {/* Withdraw Card */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Withdraw Salary</h3>
            <p className="text-[var(--text-muted)]">
              Available: {formatRBTC(withdrawableAmount)} RBTC
            </p>
          </div>
          <Badge variant={canWithdrawNow ? "active" : "inactive"}>
            {canWithdrawNow ? "Available" : "Not Available"}
          </Badge>
        </div>

        <NeonButton
          onClick={handleWithdraw}
          disabled={!canWithdrawNow || isWritePendingWithdraw || isConfirming}
          variant={canWithdrawNow ? "primary" : "ghost"}
          className="w-full justify-center py-4"
        >
          {isWritePendingWithdraw || isConfirming ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            "Withdraw Now"
          )}
        </NeonButton>

        {!canWithdrawNow && (
          <p className="text-center text-[var(--text-muted)] mt-4 text-sm">
            Withdrawals are available from the {withdrawalDay || 25}th of each month.
          </p>
        )}
      </GlassCard>

      {/* Employee Details */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Employee Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-[var(--border-subtle)]">
            <span className="text-[var(--text-muted)]">Monthly Salary</span>
            <span className="text-[var(--text-primary)] font-medium">{formatRBTC(employee.salaryAmount)} RBTC</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border-subtle)]">
            <span className="text-[var(--text-muted)]">First Month Bonus</span>
            <span className="text-[var(--text-primary)] font-medium">{formatRBTC(employee.firstSalaryAmount)} RBTC</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border-subtle)]">
            <span className="text-[var(--text-muted)]">First Salary</span>
            <span className="text-[var(--text-primary)]">{employee.hasWithdrawnFirstSalary ? "Paid" : "Pending"}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border-subtle)]">
            <span className="text-[var(--text-muted)]">Status</span>
            <Badge variant={employee.isActive ? "active" : "inactive"}>
              {employee.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function NoVaultEmployee() {
  return (
    <GlassCard className="p-8 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(100,116,139,0.15)] flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Vault Found</h3>
      <p className="text-[var(--text-muted)]">Your company doesn't have a payroll vault yet.</p>
    </GlassCard>
  );
}

function NotConnectedEmployee() {
  return (
    <GlassCard className="p-8 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(255,159,28,0.15)] flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-[var(--neon-orange)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Connect Wallet</h3>
      <p className="text-[var(--text-muted)]">Please connect your wallet to view your salary.</p>
    </GlassCard>
  );
}

export default function EmployeePage() {
  const { address: userAddress, isConnected } = useAccount();
  const { userVaultAddress, hasVault } = useVaultRegistry();

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <PageHeader title="Employee Portal" description="View and withdraw your salary" />
        <NotConnectedEmployee />
      </div>
    );
  }

  if (!hasVault || !userVaultAddress) {
    return (
      <div className="max-w-2xl mx-auto">
        <PageHeader title="Employee Portal" description="View and withdraw your salary" />
        <NoVaultEmployee />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader 
        title="Employee Portal" 
        description={`Connected as ${userAddress?.slice(0, 6)}...${userAddress?.slice(-4)}`} 
      />
      <EmployeeProfile vaultAddress={userVaultAddress} employeeAddress={userAddress || ""} />
    </div>
  );
}
