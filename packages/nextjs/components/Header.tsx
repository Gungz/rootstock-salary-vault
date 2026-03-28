"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  neonColor?: string;
};

const menuLinks: HeaderMenuLink[] = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Admin", href: "/admin", neonColor: "var(--neon-cyan)" },
  { label: "Employee", href: "/employee", neonColor: "var(--neon-purple)" },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();
  const { isConnected } = useAccount();

  return (
    <>
      {menuLinks.map(({ label, href, neonColor }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`
                relative py-2 px-4 text-sm rounded-lg transition-all duration-300
                ${isActive 
                  ? "text-[var(--neon-cyan)] font-semibold" 
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }
              `}
              style={isActive && neonColor ? { 
                textShadow: `0 0 10px ${neonColor}, 0 0 20px ${neonColor}` 
              } : undefined}
            >
              <span>{label}</span>
              {isActive && (
                <span 
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: neonColor }}
                />
              )}
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header - Futuristic design
 */
export const Header = () => {
  const { isConnected } = useAccount();

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-subtle backdrop-blur-lg border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" passHref className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center">
                <span className="text-black font-bold text-sm">RV</span>
              </div>
              <span className="text-lg font-bold hidden sm:block">
                <span className="text-[var(--neon-cyan)]">Payroll</span>
                <span className="text-[var(--text-secondary)]">Vault</span>
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex">
              <ul className="flex items-center gap-1">
                <HeaderMenuLinks />
              </ul>
            </nav>

            {/* Wallet Connection */}
            <div className="flex items-center gap-4">
              {/* Network Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full glass text-xs">
                <div className="w-2 h-2 rounded-full bg-[var(--neon-green)] animate-pulse" />
                <span className="text-[var(--text-muted)]">Rootstock</span>
              </div>
              
              {/* Connect Button */}
              <RainbowKitCustomConnectButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
