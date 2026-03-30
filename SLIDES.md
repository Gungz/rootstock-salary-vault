---

# Rootstock Payroll Vault

## Problem & Solution

---

**Problem:**
- Companies struggle to manage employee salary payments on Rootstock
- Manual processes are error-prone and lack transparency
- Employees have no visibility into their payment schedule

**Solution:**
- Smart contract-based payroll management on Rootstock Testnet
- Automated salary scheduling with designated withdrawal days
- Real-time vault tracking for administrators

---

# Smart Contract Architecture

---

```
┌─────────────────────────────────────────────────────┐
│              VaultRegistry Contract                 │
│  - Maps company → vault address                    │
│  - One vault per company                            │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│             PayrollVault Contract                  │
│  - deposit()        : Add funds to vault           │
│  - addEmployee()   : Register employee + salary   │
│  - removeEmployee(): Remove employee              │
│  - withdraw()       : Employee salary withdrawal  │
│  - freezeVault()   : Lock all withdrawals         │
│  - unfreezeVault() : Unlock withdrawals           │
│  - setWithdrawalDay() : Configure pay day (1-28) │
└─────────────────────────────────────────────────────┘
```

**Key Features:**
- RBTC native currency
- Monthly salary + optional first-month bonus
- Configurable withdrawal day per month

---

# Web Application Features

---

**Admin Dashboard:**
- Create payroll vault
- Add/remove employees with salary terms
- Deposit funds to vault
- View total monthly obligations
- Coverage indicator (months of runway)
- Freeze/unfreeze vault

**Employee Portal:**
- Enter company vault address
- View withdrawable amount
- Withdraw on designated day
- Track payment history (via events)

**Tech Stack:**
- Next.js 14 + React
- Wagmi + RainbowKit for wallet
- Para Wallet integration
- MongoDB for event indexing (off-chain)

---

# Demo & Summary

---

**Try It Now:**
1. Connect wallet (Para/RainbowKit)
2. Admin: Create vault at `/admin`
3. Add employees with salary
4. Employee: Check salary at `/employee`

**Contract Addresses (Rootstock Testnet):**
- VaultRegistry: `0xBE7369fe53032EB7B52aB3b384f7136E0f42153b`
- Implementation: `0x1F1C0Dbb78C10F51fca4cA112e3D72C59a2D8633`

**Key Differentiators:**
- On-chain payroll logic
- Configurable payment schedules
- Real-time fund coverage tracking
- Employee self-service withdrawals

---
