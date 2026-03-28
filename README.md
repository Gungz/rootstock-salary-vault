# Rootstock Payroll Vault - Full Stack DApp

A complete decentralized application for managing employee payroll on Rootstock. Companies can create salary vaults, deposit funds, add employees, and employees can withdraw their salaries on designated dates.

## Architecture

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        UI[React UI]
        WH[Wagmi + RainbowKit]
    end
    
    subgraph "Rootstock Testnet"
        VR[VaultRegistry]
        PV[PayrollVault]
    end
    
    subgraph "Backend"
        AI[Alchemy Indexer]
        MongoDB
    end
    
    UI --> WH
    WH --> VR
    WH --> PV
    VR -->|Emits Events| AI
    PV -->|Emits Events| AI
    AI -->|Index Events| MongoDB
```

## Contracts (Deployed on Rootstock Testnet)

| Contract | Address |
|----------|---------|
| VaultRegistry | `0xBE7369fe53032EB7B52aB3b384f7136E0f42153b` |
| PayrollVault (Implementation) | `0x1F1C0Dbb78C10F51fca4cA112e3D72C59a2D8633` |

## Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | Create Payroll Vault | Companies can create their own payroll vault |
| 2 | Employee Management | Add/remove employees with salary settings |
| 3 | Deposit Funds | Company deposits RBTC for salaries |
| 4 | Freeze Vault | Emergency pause on withdrawals |
| 5 | Employee Withdrawal | Employees withdraw on designated dates |
| 6 | Event Indexing | Historical data stored in MongoDB |

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | TailwindCSS, DaisyUI |
| Web3 | viem, wagmi, RainbowKit, Para Wallet |
| Blockchain | Rootstock Testnet |
| Events | Alchemy SDK |
| Database | MongoDB |

## Quick Start

### Prerequisites

- Node.js 18+
- Yarn or npm
- MetaMask or Para Wallet
- MongoDB Atlas account (optional, for event indexing)
- Alchemy account (optional, for event indexing)

### Installation

```bash
# Clone the repository
cd rootstock-salary-vault

# Install dependencies
yarn install
```

### Environment Setup

1. Copy the example environment file:

```bash
cp packages/nextjs/.env.example packages/nextjs/.env.local
```

2. Update `.env.local` with your values:

```bash
# Get from https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id

# Get from https://dashboard.alchemyapi.io/
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
ALCHEMY_API_KEY=your_alchemy_key

# MongoDB (optional for event indexing)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/payroll_vault
MONGODB_DATABASE=payroll_vault
```

### Running the App

```bash
cd packages/nextjs
yarn dev
```

Open http://localhost:3000 in your browser.

### Testing the App

#### 1. Connect Wallet

1. Open the app at http://localhost:3000
2. Click "Connect Wallet"
3. Select Para Wallet, MetaMask, or another wallet
4. Approve the connection request

#### 2. Test as Company Admin

1. Navigate to `/admin`
2. If you don't have a vault, create one:
   - Enter company name
   - Click "Create Vault"
3. To manage employees:
   - Add employee with address and salary
   - Set withdrawal day (1-28)
4. To deposit funds:
   - Enter RBTC amount
   - Click "Deposit"

#### 3. Test as Employee

1. Connect with an employee wallet address
2. Navigate to `/employee`
3. Check if withdrawal is available
4. If on withdrawal day, click "Withdraw Salary"

## Project Structure

```
rootstock-salary-vault/
├── packages/
│   ├── nextjs/                  # Frontend DApp
│   │   ├── app/
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── dashboard/        # Main dashboard
│   │   │   ├── admin/            # Admin portal
│   │   │   ├── employee/         # Employee portal
│   │   │   └── api/              # API routes
│   │   ├── components/          # UI components
│   │   ├── contracts/           # Contract ABIs
│   │   ├── hooks/              # Web3 hooks
│   │   ├── services/           # Services
│   │   │   └── indexer/         # Alchemy indexer
│   │   └── utils/              # Utilities
│   │
│   └── hardhat/                # Smart Contracts
│       ├── contracts/          # Solidity contracts
│       ├── deploy/             # Deployment scripts
│       └── test/               # Test files
```

## Key Files

| File | Description |
|------|-------------|
| `app/admin/page.tsx` | Admin dashboard for vault management |
| `app/employee/page.tsx` | Employee portal for withdrawals |
| `hooks/useVaultRegistry.ts` | Hook for vault creation |
| `hooks/usePayrollVault.ts` | Hook for vault operations |
| `services/indexer/AlchemyIndexer.ts` | Event indexing service |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/events` | GET/POST | Get or store vault events |
| `/api/vault/[address]` | GET | Get events for a specific vault |
| `/api/indexer/run` | GET | Trigger event indexing |

## Troubleshooting

### Connection Issues

- **RPC Error**: Make sure `NEXT_PUBLIC_ROOTSTOCK_RPC_URL` is correct
- **Wallet Not Connecting**: Try refreshing or using a different wallet

### Contract Errors

- **Vault Not Found**: Make sure your wallet is the company admin
- **Transaction Failed**: Check if vault is frozen or insufficient balance

### Event Indexing Issues

- **No Events**: Make sure `ALCHEMY_API_KEY` is set in `.env.local`
- **MongoDB Error**: Verify `MONGODB_URI` is correct

## Resources

- [Rootstock Documentation](https://dev.rootstock.io/)
- [Alchemy Dashboard](https://dashboard.alchemyapi.io/)
- [WalletConnect Cloud](https://cloud.walletconnect.com/)
- [Para Wallet](https://para.social/)

## License

MIT