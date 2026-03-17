"use client";
import getMarketplaceClient from "@/clients/MarketplaceClient";
import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import { useEffect, useState } from "react";
/**********************************************************/
export default function useMarketplaceClient() {
  const [client, setClient] = useState<ClientSDK | null>(null);
  useEffect(() => {
    async function getClient() {
      const client = await getMarketplaceClient();
      setClient(client);
    }

    getClient();
  }, []);

  return client;
}
