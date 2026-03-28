import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DATABASE || "payroll_vault";
const collectionName = "vault_events";

let client: MongoClient | null = null;

async function getCollection() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db(dbName).collection(collectionName);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      vaultAddress,
      eventType,
      txHash,
      blockNumber,
      timestamp,
      ...eventData
    } = body;

    if (!vaultAddress || !eventType || !txHash) {
      return NextResponse.json(
        { error: "Missing required fields: vaultAddress, eventType, txHash" },
        { status: 400 }
      );
    }

    const event = {
      vaultAddress: vaultAddress.toLowerCase(),
      eventType,
      txHash,
      blockNumber: Number(blockNumber) || 0,
      timestamp: timestamp
        ? new Date(Number(timestamp) * 1000)
        : new Date(),
      ...eventData,
      createdAt: new Date(),
    };

    const collection = await getCollection();
    const result = await collection.insertOne(event);

    return NextResponse.json({
      success: true,
      eventId: result.insertedId,
    });
  } catch (error) {
    console.error("Error indexing event:", error);
    return NextResponse.json(
      { error: "Failed to index event" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vaultAddress = searchParams.get("vaultAddress");
    const eventType = searchParams.get("eventType");
    const limit = parseInt(searchParams.get("limit") || "100");

    const collection = await getCollection();

    const query: Record<string, any> = {};
    if (vaultAddress) {
      query.vaultAddress = vaultAddress.toLowerCase();
    }
    if (eventType) {
      query.eventType = eventType;
    }

    const events = await collection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
