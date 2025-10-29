import getMarketplaceClient from "@/clients/MarketplaceClient";
import { Token } from "@/types/token";
import { PREVIEW_CONTEXT_ID } from "./contextService";
import { GetTokensQuery } from "@/queries/getTokens";

/**********************************************************/
export async function SearchTokens(
  itemId: string,
  language: string
): Promise<Token[]> {
  const client = await getMarketplaceClient();
  if (client != null && PREVIEW_CONTEXT_ID != "") {
    const { data } = await client.mutate("xmc.authoring.graphql", {
      params: {
        query: {
          sitecoreContextId: PREVIEW_CONTEXT_ID,
        },
        body: {
          query: GetTokensQuery,
          variables: {
            itemId: itemId,
            language: language,
            template: "Content Token"
          },
        },
      },
    });
    const mappedTokens = await mapToTokens(data?.data?.search);

    return mappedTokens;
  }

  return [];
}
/**********************************************************/

//Private
/**********************************************************/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToTokens(search: any): Token[] {
  const tokens: Token[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  search?.results?.map((item: any) => {
    const mappedToken = mapToToken(item);
    if (mappedToken) {
      tokens.push(mappedToken);
    }
  });

  return tokens;
}
/**********************************************************/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToToken(rawItem: any): Token {
  const token = {
    key: rawItem?.innerItem?.key?.value,
    value: rawItem?.innerItem?.phrase?.value,
    description: rawItem?.path
  } as Token;

  return token;
}
/**********************************************************/
