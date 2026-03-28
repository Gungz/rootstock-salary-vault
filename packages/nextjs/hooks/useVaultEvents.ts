import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { VaultEvent } from "~~/contracts/abis";

async function fetchVaultEvents(vaultAddress: string): Promise<VaultEvent[]> {
  const response = await fetch(`/api/vault/${vaultAddress}`);
  if (!response.ok) {
    throw new Error("Failed to fetch vault events");
  }
  const data = await response.json();
  return data.events;
}

export function useVaultEvents(vaultAddress?: string) {
  const enabled = useMemo(() => !!vaultAddress, [vaultAddress]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["vaultEvents", vaultAddress],
    queryFn: () => fetchVaultEvents(vaultAddress!),
    enabled,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  return {
    events: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

async function fetchAllEvents(vaultAddress?: string, eventType?: string): Promise<VaultEvent[]> {
  const params = new URLSearchParams();
  if (vaultAddress) params.append("vaultAddress", vaultAddress);
  if (eventType) params.append("eventType", eventType);

  const response = await fetch(`/api/events?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }
  const data = await response.json();
  return data.events;
}

export function useAllEvents(vaultAddress?: string, eventType?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["allEvents", vaultAddress, eventType],
    queryFn: () => fetchAllEvents(vaultAddress, eventType),
    staleTime: 30000,
  });

  return {
    events: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

export async function indexEvent(event: Partial<VaultEvent>): Promise<void> {
  const response = await fetch("/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    throw new Error("Failed to index event");
  }
}
