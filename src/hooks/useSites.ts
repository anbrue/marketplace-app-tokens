import { useContext, useEffect, useState } from "react";
import useMarketplaceClient from "./useMarketplaceClient";
import { SettingsContext } from "@/context/SettingsContext";
/**********************************************************/
export default function useSites() {
  const client = useMarketplaceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sites, setSites] = useState<any | undefined>(undefined);
  const { previewContextId } = useContext(SettingsContext);

  useEffect(() => {
    async function fetchSiteData() {
      if (client != null && previewContextId != "") {
        const { data } = await client.query("xmc.xmapp.listSites", {
          params: {
            query: {
              sitecoreContextId: previewContextId,
            },
          },
        });
        setSites(data?.data);
      }
    }

    fetchSiteData();
  }, [client, previewContextId]);

  return sites;
}