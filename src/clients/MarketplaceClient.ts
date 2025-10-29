import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import { XMC } from "@sitecore-marketplace-sdk/xmc";

let client: ClientSDK | undefined = undefined;
export default async function getMarketplaceClient() {
  if (client) {
    return client;
  }

  // Create a configuration object.
  const config = {
    target: window.parent,
    modules: [XMC],
  };

  // Create a Client SDK instance using the configuration.
  // The returned SDK provides a type-safe API based on your resource schema.
  client = await ClientSDK.init(config);
  return client;
}
