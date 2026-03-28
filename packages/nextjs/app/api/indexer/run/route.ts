import { NextResponse } from "next/server";

/**
 * API endpoint to trigger event indexing
 * 
 * Call this endpoint to index historical events from Alchemy to MongoDB.
 * You can set up a cron job to call this periodically.
 * 
 * GET /api/indexer/run?vaultAddress=0x...&fromBlock=123456
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vaultAddress = searchParams.get("vaultAddress");
    const fromBlock = searchParams.get("fromBlock")
      ? parseInt(searchParams.get("fromBlock")!)
      : undefined;

    // Dynamic import to avoid build errors when Alchemy is not configured
    const { indexVaultEvents } = await import("~~/services/indexer/AlchemyIndexer");

    let indexedCount = 0;

    if (vaultAddress) {
      indexedCount = await indexVaultEvents(vaultAddress, fromBlock);
    } else {
      // Index all events
      const { indexAllEvents } = await import("~~/services/indexer/AlchemyIndexer");
      await indexAllEvents();
      indexedCount = 1;
    }

    return NextResponse.json({
      success: true,
      indexedCount,
      message: `Indexed ${indexedCount} events`,
    });
  } catch (error) {
    console.error("Indexer error:", error);
    return NextResponse.json(
      { error: "Failed to index events. Make sure ALCHEMY_API_KEY is set." },
      { status: 500 }
    );
  }
}