"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { useVaultRegistry } from "~~/hooks/useVaultRegistry";
import { usePayrollVault } from "~~/hooks/usePayrollVault";
import { formatRBTC } from "~~/contracts/abis";
import { 
  GlassCard, 
  NeonButton, 
  StatCard, 
  PageHeader, 
  Badge,
  SectionTitle 
} from "~~/components/ui/CosmicBackground";

function VaultStats({ vaultAddress }: { vaultAddress: string }) {
  const vault = usePayrollVault(vaultAddress);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard 
        label="Vault Balance" 
        value={`${formatRBTC(vault.vaultBalance)} RBTC`}
      />
      <StatCard 
        label="Employees" 
        value={vault.employeeCount}
      />
      <StatCard 
        label="Withdrawal Day" 
        value={vault.withdrawalDay || 25}
      />
      <StatCard 
        label="Status" 
        value={vault.frozen ? "Frozen" : "Active"}
      />
    </div>
  );
}

function VaultCard({ vaultAddress }: { vaultAddress: string }) {
  const vault = usePayrollVault(vaultAddress);

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Vault Details</h3>
        <Badge variant={vault.frozen ? "frozen" : "active"}>
          {vault.frozen ? "Frozen" : "Active"}
        </Badge>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center py-2 border-b border-[var(--border-subtle)]">
          <span className="text-[var(--text-muted)]">Company</span>
          <span className="text-[var(--text-primary)] font-medium">
            {vault.companyName || "Loading..."}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-[var(--border-subtle)]">
          <span className="text-[var(--text-muted)]">Balance</span>
          <span className="text-[var(--neon-cyan)] font-semibold">
            {formatRBTC(vault.vaultBalance)} RBTC
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-[var(--border-subtle)]">
          <span className="text-[var(--text-muted)]">Employees</span>
          <span className="text-[var(--text-primary)] font-semibold">{vault.employeeCount}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-[var(--border-subtle)]">
          <span className="text-[var(--text-muted)]">Withdrawal Day</span>
          <span className="text-[var(--text-primary)] font-semibold">
            {vault.withdrawalDay || 25}th of month
          </span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-[var(--text-muted)]">Vault Address</span>
          <span className="text-[var(--text-primary)] text-sm font-mono">
            {vaultAddress.slice(0, 6)}...{vaultAddress.slice(-4)}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}

function AdminSection({ vaultAddress }: { vaultAddress: string }) {
  return (
    <div className="space-y-6">
      <VaultStats vaultAddress={vaultAddress} />
      
      <SectionTitle neonColor="cyan">Your Company Vault</SectionTitle>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VaultCard vaultAddress={vaultAddress} />
        
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/admin" className="block">
              <NeonButton variant="primary" className="w-full justify-center">
                Open Admin Dashboard →
              </NeonButton>
            </Link>
            <Link href="/employee" className="block">
              <NeonButton variant="secondary" className="w-full justify-center">
                Employee Portal →
              </NeonButton>
            </Link>
          </div>
          
          <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
            <h4 className="text-sm font-semibold text-[var(--text-muted)] mb-3 uppercase tracking-wider">
              Getting Started
            </h4>
            <ol className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li className="flex gap-2">
                <span className="text-[var(--neon-cyan)]">1.</span>
                Deposit funds to the vault
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--neon-cyan)]">2.</span>
                Add employees with salary settings
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--neon-cyan)]">3.</span>
                Employees withdraw on 25th
              </li>
            </ol>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function NoVaultSection() {
  return (
    <GlassCard className="text-center p-12 max-w-2xl mx-auto">
      <div className="w-20 h-20 mx-auto rounded-full bg-[rgba(0,245,255,0.1)] flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-[var(--neon-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
        Create Your Vault
      </h2>
      <p className="text-[var(--text-muted)] mb-8 max-w-md mx-auto">
        You don't have a payroll vault yet. Create one to start managing your company payroll on Rootstock.
      </p>
      <Link href="/admin">
        <NeonButton variant="primary">
          Create Vault →
        </NeonButton>
      </Link>
    </GlassCard>
  );
}

function NotConnectedSection() {
  return (
    <GlassCard className="text-center p-12 max-w-md mx-auto">
      <div className="w-20 h-20 mx-auto rounded-full bg-[rgba(255,159,28,0.1)] flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-[var(--neon-orange)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
        Connect Your Wallet
      </h2>
      <p className="text-[var(--text-muted)]">
        Please connect your wallet to view your payroll dashboard.
      </p>
    </GlassCard>
  );
}

export default function DashboardPage() {
  const { address: userAddress, isConnected } = useAccount();
  const { userVaultAddress, hasVault, isLoading: isLoadingRegistry } = useVaultRegistry();

  if (!isConnected) {
    return <NotConnectedSection />;
  }

  if (isLoadingRegistry) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">Loading vault data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader 
        title="Dashboard" 
        description={`Welcome to Rootstock Payroll Vault${userAddress ? ` • ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : ""}`}
      />

      {!hasVault || !userVaultAddress || userVaultAddress === "0x" ? (
        <NoVaultSection />
      ) : (
        <AdminSection vaultAddress={userVaultAddress} />
      )}
    </div>
  );
}
