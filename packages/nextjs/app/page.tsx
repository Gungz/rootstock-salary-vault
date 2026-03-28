"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import Link from "next/link";
import { CosmicBackground, GlassCard, NeonButton, SectionTitle } from "~~/components/ui/CosmicBackground";

const Home = () => {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  return (
    <CosmicBackground>
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        {/* Main Content */}
        <div className="text-center max-w-3xl animate-fade-in">
          {/* Logo / Title */}
          <div className="mb-8">
            <div className="inline-block px-4 py-2 rounded-full glass mb-6">
              <span className="text-sm text-[var(--neon-cyan)] uppercase tracking-widest">
                Rootstock Testnet
              </span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[var(--neon-cyan)] via-[var(--neon-purple)] to-[var(--neon-pink)] bg-clip-text text-transparent">
                Payroll Vault
              </span>
            </h1>
            
            <p className="text-xl text-[var(--text-secondary)] mb-4 max-w-2xl mx-auto">
              Decentralized employee payroll on Rootstock. 
              Secure, transparent, and automated.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <GlassCard hover={true} className="text-left p-8 group">
              <div className="w-12 h-12 rounded-xl bg-[rgba(0,245,255,0.15)] flex items-center justify-center mb-4 group-hover:animate-pulse-glow">
                <svg className="w-6 h-6 text-[var(--neon-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 4v-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">For Companies</h3>
              <p className="text-[var(--text-muted)] mb-6">
                Create a vault, add employees, deposit funds, and manage payroll
              </p>
              <Link href="/admin">
                <NeonButton variant="secondary" className="w-full justify-center">
                  Go to Admin
                </NeonButton>
              </Link>
            </GlassCard>

            <GlassCard hover={true} className="text-left p-8 group">
              <div className="w-12 h-12 rounded-xl bg-[rgba(176,38,255,0.15)] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[var(--neon-purple)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">For Employees</h3>
              <p className="text-[var(--text-muted)] mb-6">
                View salary, check withdrawal dates, and claim your earnings
              </p>
              <Link href="/employee">
                <NeonButton variant="secondary" className="w-full justify-center">
                  Employee Portal
                </NeonButton>
              </Link>
            </GlassCard>
          </div>

          {/* Connection Status */}
          <div className="glass rounded-2xl p-6 max-w-md mx-auto">
            {!isConnected ? (
              <div className="flex items-center gap-3 text-[var(--text-muted)]">
                <div className="w-3 h-3 rounded-full bg-[var(--neon-orange)] animate-pulse" />
                <span>Connect your wallet to access your personalized dashboard</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-[var(--neon-green)]">
                <div className="w-3 h-3 rounded-full bg-[var(--neon-green)]" />
                <span>Wallet connected! Redirecting...</span>
              </div>
            )}
          </div>

          {/* Protocol Info */}
          <div className="mt-12 text-sm text-[var(--text-muted)]">
            <p>Deployed on Rootstock Testnet</p>
            <p className="mt-1">
              VaultRegistry: <code className="text-[var(--neon-cyan)]">0xBE7369...</code>
            </p>
          </div>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default Home;
