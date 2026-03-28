# Rootstock Payroll Vault DApp Architecture

## Executive Summary

This document outlines the architecture for a React/Next.js application that interacts with the PayrollVault smart contract deployed on Rootstock Testnet. The application enables companies to manage employee payroll via a secure vault system with off-chain event indexing to MongoDB.

## Deployed Contracts

| Contract | Address (Rootstock Testnet) |
|----------|----------------------------|
| VaultRegistry | `0xBE7369fe53032EB7B52aB3b384f7136E0f42153b` |
| PayrollVault (Implementation) | `0x1F1C0Dbb78C10F51fca4cA112e3D72C59a2D8633` |

## Contract ABIs Summary

### VaultRegistry Functions
- `createVault(string _companyName)` - Create new payroll vault
- `getVaultAddress(address _company)` - Get company vault address
- `getVaultCount()` - Get total vaults count
- `getAllVaults()` - Get all vault addresses
- `hasVault(address _company)` - Check if vault exists

### PayrollVault Functions (Per Vault)
**Admin/Company Functions:**
- `initialize(address _company, string _companyName, address _registry)` - Initialize vault
- `deposit()` - Deposit funds (payable)
- `addEmployee(address _employee, uint256 _salaryAmount, uint256 _firstSalaryAmount)` - Add employee
- `removeEmployee(address _employee)` - Remove employee
- `updateEmployeeSalary(address _employee, uint256 _newSalary)` - Update salary
- `setWithdrawalDay(uint8 _day)` - Set withdrawal day
- `freezeVault(bool _status)` - Freeze/unfreeze vault
- `updateCompanyName(string _newName)` - Update company name

**Employee Functions:**
- `withdraw()` - Withdraw salary
- `canWithdraw(address _employee)` - Check if withdrawal allowed

**Read-Only Functions:**
- `employees(address)` - Get employee data
- `employeeList(uint256)` - Get employee by index
- `company()` - Get company address
- `companyName()` - Get company name
- `frozen()` - Get freeze status
- `withdrawalDay()` - Get withdrawal day
- `getVaultBalance()` - Get vault balance

### Events for Off-Chain Indexing
- `Deposit(address indexed from, uint256 amount, uint256 newBalance, uint256 timestamp)`
- `EmployeeAdded(address indexed employee, uint256 salaryAmount, address indexed addedBy, uint256 timestamp)`
- `EmployeeRemoved(address indexed employee, address indexed removedBy, uint256 timestamp)`
- `EmployeeUpdated(address indexed employee, uint256 oldSalary, uint256 newSalary, uint256 timestamp)`
- `Withdrawal(address indexed employee, uint256 amount, uint256 timestamp)`
- `VaultFrozen(bool status, address indexed frozenBy, uint256 timestamp)`
- `WithdrawalDayChanged(uint8 oldDay, uint8 newDay, address indexed changedBy, uint256 timestamp)`

## System Architecture

```mermaid
flowchart TB
    subgraph Client "Next.js Frontend"
        UI[React Components]
        WH[Wagmi Hooks]
        ST[State Management]
    end
    
    subgraph Blockchain
        RR[Rootstock Testnet]
        VR[VaultRegistry Contract]
        PV[PayrollVault Contract]
    end
    
    subgraph Backend "API Layer"
        API[Next.js API Routes]
        MB[MongoDB Client]
    end
    
    UI --> WH
    WH --> ST
    ST --> RR
    RR --> VR
    RR --> PV
    UI --> API
    API --> MB
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Blockchain | viem, wagmi, RainbowKit |
| Wallet | Para (via RainbowKit) |
| Styling | TailwindCSS, DaisyUI |
| State | Zustand |
| Query | TanStack Query |
| Backend | Next.js API Routes |
| Database | MongoDB |
| Notifications | react-hot-toast |

## Application Pages Structure

```
app/
├── page.tsx                    # Landing page
├── layout.tsx                 # Root layout with providers
├── providers.tsx             # Wagmi, Query, Theme providers
│
├── dashboard/
│   └── page.tsx              # Main dashboard (role-based redirect)
│
├── admin/
│   └── page.tsx              # Admin vault management
│
├── employee/
│   └── page.tsx             # Employee withdrawal
│
└── api/
    ├── vault/
    │   └── [address]/       # Vault data API
    ├── history/
    │   └── [vaultAddress]/ # Historical data API
    └── webhooks/
        └── events/           # Event indexing webhook
```

## Core Components

### 1. Web3 Providers
- `WagmiProvider` - Blockchain connection
- `RainbowKitProvider` - Wallet connection UI
- `QueryProvider` - Data fetching

### 2. Admin Components
| Component | Purpose |
|-----------|---------|
| `CreateVaultForm` | Create new payroll vault |
| `VaultDashboard` | View/manage vault details |
| `EmployeeManager` | Add/remove/update employees |
| `DepositForm` | Deposit funds to vault |
| `FreezeControl` | Freeze/unfreeze vault |
| `VaultStats` | Display vault balance, employees count |

### 3. Employee Components
| Component | Purpose |
|-----------|---------|
| `WithdrawalCard` | Display withdrawable amount |
| `WithdrawButton` | Trigger withdrawal |
| `WithdrawalHistory` | View past withdrawals |
| `EmployeeProfile` | View personal details |

### 4. Shared Components
| Component | Purpose |
|-----------|---------|
| `ConnectWallet` | Wallet connection button |
| `AddressBadge` | Display address with copy |
| `BalanceDisplay` | Show RBTC balance |
| `LoadingSpinner` | Loading state |
| `TransactionToast` | Transaction notifications |

## Database Schema (MongoDB)

### Collection: `vault_events`

A single flexible collection that stores all emitted events for historical audit trail. The schema adapts based on the event type:

```json
{
  "_id": "ObjectId",
  "vaultAddress": "address",
  "eventType": "string",
  "txHash": "string",
  "blockNumber": "number",
  "timestamp": "timestamp",
  
  // Optional fields based on event type:
  // Deposit:
  "from": "address",
  "amount": "bigint",
  "newBalance": "bigint",
  
  // EmployeeAdded:
  "employee": "address",
  "salaryAmount": "bigint",
  "addedBy": "address",
  
  // EmployeeRemoved / EmployeeUpdated:
  "oldSalary": "bigint",
  "newSalary": "bigint",
  
  // Withdrawal:
  "withdrawnBy": "address",
  
  // VaultFrozen:
  "frozen": "boolean",
  "frozenBy": "address",
  
  // WithdrawalDayChanged:
  "oldDay": "number",
  "newDay": "number"
}
```

**Event Types:** `Deposit`, `EmployeeAdded`, `EmployeeRemoved`, `EmployeeUpdated`, `Withdrawal`, `VaultFrozen`, `WithdrawalDayChanged`, `CompanyUpdated`, `VaultEmptied`

## Security Considerations

1. **Role-based Access Control**
   - Admin functions only accessible to company wallet
   - Employee withdrawal only from registered employee address

2. **Transaction Safety**
   - Use ReentrancyGuard in contract (already implemented)
   - Add loading states and confirmations in UI
   - Implement proper error handling

3. **Wallet Connection**
   - Use Para wallet via RainbowKit
   - Support MetaMask and WalletConnect as fallbacks

## Implementation Steps

### Phase 1: Setup (Step 1-3)
1. Configure project dependencies
2. Set up environment variables
3. Configure Wagmi/RainbowKit providers

### Phase 2: Blockchain Integration (Step 4-6)
4. Type definitions from ABIs
5. Custom hooks for contract interaction
6. Vault discovery/creation flow

### Phase 3: UI Components (Step 7-9)
7. Admin dashboard components
8. Employee portal components
9. Shared UI components

### Phase 4: Backend (Step 10-12)
10. MongoDB integration
11. API routes
12. Event indexing

### Phase 5: Polish (Step 13-15)
13. Apply React best practices
14. Testing
15. Deployment

## Vercel React Best Practices Applied

| Rule | Application |
|------|-------------|
| async-parallel | Parallel data fetching for vault + employees |
| async-defer-await | Defer non-critical awaits |
| bundle-dynamic-imports | Lazy load heavy components |
| client-swr-dedup | Use SWR for automatic dedup |
| rerender-memo | Memoize expensive computations |
| server-cache-react | Cache repeated contract reads |

## Environment Variables

```env
# Blockchain
NEXT_PUBLIC_ROOTSTOCK_RPC_URL=https://rpc.testnet.rootstock.io/YOUR_API_KEY
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=101b68cbfb188d57c1233a50150cd0fc

# Contracts
NEXT_PUBLIC_VAULT_REGISTRY_ADDRESS=0xBE7369fe53032EB7B52aB3b384f7136E0f42153b

# Database
MONGODB_URI=mongodb+srv://...
MONGODB_DATABASE=payroll_vault

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Success Criteria

1. ✅ Admin can create vault via VaultRegistry
2. ✅ Admin can add/remove employees with salary settings
3. ✅ Admin can deposit funds to vault
4. ✅ Admin can freeze/unfreeze vault
5. ✅ Employee can withdraw on designated date
6. ✅ Historical data indexed to MongoDB
7. ✅ Application follows React best practices