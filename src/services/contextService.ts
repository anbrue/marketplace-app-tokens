import getMarketplaceClient from "@/clients/MarketplaceClient";
import { ApplicationContext } from "@sitecore-marketplace-sdk/core";
/**********************************************************/
export let PREVIEW_CONTEXT_ID = "";
export let LIVE_CONTEXT_ID = "";
/**********************************************************/
export async function getApplicationContext(): Promise<
  ApplicationContext | undefined
> {
  const client = await getMarketplaceClient();
  const data = await client.query("application.context", {});
  PREVIEW_CONTEXT_ID = data?.data?.resourceAccess?.[0]?.context?.preview ?? "";
  LIVE_CONTEXT_ID = data?.data?.resourceAccess?.[0]?.context?.live ?? "";
  return data?.data;
}
