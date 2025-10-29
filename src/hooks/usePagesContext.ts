import { useEffect, useState } from "react";
import useMarketplaceClient from "./useMarketplaceClient";
import { PagesContext } from "@sitecore-marketplace-sdk/client";
/**********************************************************/
export default function usePagesContext() {
  const client = useMarketplaceClient();
  const [isLoading, setIsLoading] = useState(true);
  const [context, setContext] = useState<PagesContext | undefined>(undefined);

  useEffect(() => {
    async function fetchPagesContext() {
      if (client != null) {
        setIsLoading(true);
        const { data } = await client.query("pages.context", {
          subscribe: true,
          onSuccess: (data) => {
            setContext(data);
            setIsLoading(false);
          },
        });
        if (data) {
          setContext(data);
          setIsLoading(false);
        }
      }
    }

    fetchPagesContext();
  }, [client]);
  /**********************************************************/
  async function navigate(id: string, version: number, language: string) {
    if (client != null) {
      await client.mutate("pages.context", {
        params: {
          itemId: id,
          language: language,
          itemVersion: version,
        },
      });
    }
  }
  /**********************************************************/
  return { context, isLoading, navigate };
}
