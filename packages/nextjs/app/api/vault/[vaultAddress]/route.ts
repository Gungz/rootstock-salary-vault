import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vaultAddress: string }> }
) {
  try {
    const { vaultAddress } = await params;
    const collection = await getCollection();

    const events = await collection
      .find({ vaultAddress: { $regex: new RegExp(`^${vaultAddress}$`, "i") } })
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching vault events:", error);
    return NextResponse.json(
      { error: "Failed to fetch vault events" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ vaultAddress: string }> }
) {
  try {
    const { vaultAddress } = await params;
    const body = await request.json();

    const { eventType, txHash, blockNumber, timestamp, ...eventData } = body;

    const event = {
      vaultAddress: vaultAddress.toLowerCase(),
      eventType,
      txHash,
      blockNumber: Number(blockNumber),
      timestamp: new Date(Number(timestamp) * 1000),
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
    console.error("Error creating vault event:", error);
    return NextResponse.json(
      { error: "Failed to create vault event" },
      { status: 500 }
    );
  }
}
