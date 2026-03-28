/**
 * Alchemy Event Indexer Service
 * 
 * This service listens to PayrollVault events from Alchemy WebSocket and indexes them to MongoDB.
 * Run this as a standalone service or via API endpoint for on-demand indexing.
 * 
 * Environment variables required:
 * - ALCHEMY_API_KEY: Your Alchemy API key
 * - MONGODB_URI: MongoDB connection string
 * - MONGODB_DATABASE: Database name (default: payroll_vault)
 */

import { Alchemy, Network, Wallet, Log } from "alchemy-sdk";
import { MongoClient } from "mongodb";

// Configuration
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || "payroll_vault";

// Contract addresses on Rootstock Testnet
const CONTRACTS = {
  VaultRegistry: "0xBE7369fe53032EB7B52aB3b384f7136E0f42153b",
  PayrollVault: "0x1F1C0Dbb78C10F51fca4cA112e3D72C59a2D8633",
} as const;

// Event signatures for PayrollVault
const EVENT_SIGNATURES = [
  "Deposit(address indexed from, uint256 amount, uint256 newBalance, uint256 timestamp)",
  "EmployeeAdded(address indexed employee, uint256 salaryAmount, address indexed addedBy, uint256 timestamp)",
  "EmployeeRemoved(address indexed employee, address indexed removedBy, uint256 timestamp)",
  "EmployeeUpdated(address indexed employee, uint256 oldSalary, uint256 newSalary, uint256 timestamp)",
  "Withdrawal(address indexed employee, uint256 amount, uint256 timestamp)",
  "VaultFrozen(bool status, address indexed frozenBy, uint256 timestamp)",
  "WithdrawalDayChanged(uint8 oldDay, uint8 newDay, address indexed changedBy, uint256 timestamp)",
  "CompanyUpdated(string oldName, string newName, uint256 timestamp)",
  "VaultEmptied(address indexed recipient, uint256 amount, uint256 timestamp)",
] as const;

// Initialize Alchemy
const alchemy = ALCHEMY_API_KEY
  ? new Alchemy({
      apiKey: ALCHEMY_API_KEY,
      network: Network.ROOTSTOCK_TESTNET,
    })
  : null;

// MongoDB client
let mongoClient: MongoClient | null = null;

async function getMongoCollection(collectionName: string) {
  if (!mongoClient) {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
  }
  return mongoClient.db(MONGODB_DATABASE).collection(collectionName);
}

/**
 * Parse a blockchain log into a structured event object
 */
function parseLog(log: Log) {
  const topics = log.topics || [];
  
  // Map topic[0] to event type
  const eventSignature = topics[0] || "";
  
  let eventType = "Unknown";
  let eventData: Record<string, string | number | boolean> = {};
  
  // Match event type based on signature
  if (eventSignature.includes("Deposit")) {
    eventType = "Deposit";
    eventData = {
      from: `0x${topics[1].slice(26)}`,
      amount: log.data ? `0x${log.data.slice(2, 66)}` : "0",
      newBalance: log.data ? `0x${log.data.slice(66, 130)}` : "0",
    };
  } else if (eventSignature.includes("EmployeeAdded")) {
    eventType = "EmployeeAdded";
    eventData = {
      employee: `0x${topics[1].slice(26)}`,
      salaryAmount: log.data ? `0x${log.data.slice(2, 66)}` : "0",
      addedBy: `0x${topics[2].slice(26)}`,
    };
  } else if (eventSignature.includes("EmployeeRemoved")) {
    eventType = "EmployeeRemoved";
    eventData = {
      employee: `0x${topics[1].slice(26)}`,
      removedBy: `0x${topics[2].slice(26)}`,
    };
  } else if (eventSignature.includes("EmployeeUpdated")) {
    eventType = "EmployeeUpdated";
    eventData = {
      employee: `0x${topics[1].slice(26)}`,
      oldSalary: log.data ? `0x${log.data.slice(2, 66)}` : "0",
      newSalary: log.data ? `0x${log.data.slice(66, 130)}` : "0",
    };
  } else if (eventSignature.includes("Withdrawal(address")) {
    eventType = "Withdrawal";
    eventData = {
      employee: `0x${topics[1].slice(26)}`,
      amount: log.data ? `0x${log.data.slice(2, 66)}` : "0",
    };
  } else if (eventSignature.includes("VaultFrozen")) {
    eventType = "VaultFrozen";
    eventData = {
      frozen: log.data?.slice(2) === "0000000000000000000000000000000000000000000000000000000000000001"
        ? "true"
        : "false",
      frozenBy: `0x${topics[1].slice(26)}`,
    };
  } else if (eventSignature.includes("WithdrawalDayChanged")) {
    eventType = "WithdrawalDayChanged";
    eventData = {
      oldDay: parseInt(log.data?.slice(2, 4) || "0", 16),
      newDay: parseInt(log.data?.slice(4, 6) || "0", 16),
    };
  }

  return {
    vaultAddress: log.address,
    eventType,
    txHash: log.transactionHash,
    blockNumber: Number(log.blockNumber),
    blockHash: log.blockHash,
    logIndex: log.logIndex,
    timestamp: new Date(),
    ...eventData,
    createdAt: new Date(),
  };
}

/**
 * Index events for a specific vault address
 */
export async function indexVaultEvents(vaultAddress: string, fromBlock?: number): Promise<number> {
  if (!alchemy) {
    console.error("Alchemy not configured. Set ALCHEMY_API_KEY");
    return 0;
  }

  try {
    // Get all logs for the vault
    // Alchemy SDK getLogs expects specific BlockTag type - use type assertion
    const logs = await (alchemy.core.getLogs as any)({
      address: vaultAddress,
      fromBlock: fromBlock ? BigInt(fromBlock) : "earliest",
      toBlock: "latest",
    });

    if (logs.length === 0) {
      console.log("No new events found");
      return 0;
    }

    // Parse and store events
    const collection = await getMongoCollection("vault_events");
    let indexedCount = 0;

    for (const log of logs) {
      const event = parseLog(log);
      
      // Check for existing event to avoid duplicates
      const exists = await collection.findOne({
        txHash: event.txHash,
        logIndex: event.logIndex,
      });

      if (!exists) {
        await collection.insertOne(event);
        indexedCount++;
      }
    }

    console.log(`Indexed ${indexedCount} new events for vault ${vaultAddress}`);
    return indexedCount;
  } catch (error) {
    console.error("Error indexing events:", error);
    return 0;
  }
}

/**
 * Index all events for all PayrollVaults
 */
export async function indexAllEvents(): Promise<void> {
  if (!alchemy) {
    console.error("Alchemy not configured. Set ALCHEMY_API_KEY");
    return;
  }

  // Index PayrollVault implementation events
  await indexVaultEvents(CONTRACTS.PayrollVault);
}

/**
 * Start listening to new events via WebSocket
 */
export function startEventListener(): void {
  if (!alchemy) {
    console.error("Alchemy not configured. Set ALchemy API key");
    return;
  }

  console.log("Starting Alchemy WebSocket event listener...");

  // Subscribe to new logs for PayrollVault
  alchemy.ws.on(
    {
      address: CONTRACTS.PayrollVault,
      topics: [],
    },
    async (log) => {
      const event = parseLog(log);
      
      // Store immediately to MongoDB
      const collection = await getMongoCollection("vault_events");
      await collection.insertOne(event);
      
      console.log(`New event indexed: ${event.eventType} in tx ${event.txHash}`);
    }
  );

  console.log("WebSocket listener started for PayrollVault events");
}

/**
 * Get event history for a vault
 */
export async function getVaultEvents(
  vaultAddress: string,
  options?: { eventType?: string; limit?: number; offset?: number }
) {
  const collection = await getMongoCollection("vault_events");
  
  const query: Record<string, unknown> = { vaultAddress: vaultAddress.toLowerCase() };
  
  if (options?.eventType) {
    query.eventType = options.eventType;
  }

  return collection
    .find(query)
    .sort({ timestamp: -1 })
    .limit(options?.limit || 100)
    .skip(options?.offset || 0)
    .toArray();
}

// API route handler for on-demand indexing
export async function POST() {
  return indexAllEvents();
}