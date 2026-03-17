import getMarketplaceClient from "@/clients/MarketplaceClient";
import { Token } from "@/types/token";
import { PREVIEW_CONTEXT_ID } from "./contextService";
import { GetTokensQuery } from "@/queries/getTokens";
import { GetTokenFoldersByTemplateQuery } from "@/queries/getTokenFolders";
import {
  CreateTokenMutation,
  CreateTokenMutationInput,
  CreateTokenMutationInputParentAndTemplateObjects,
  CreateTokenMutationInputParentObject,
  CreateTokenMutationInputTemplateObject,
  ResolveContentTokenTemplateQuery,
} from "@/queries/tokenMutations";

let cachedContentTokenTemplateId: string | undefined;

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
export async function CreateToken(
  parentFolderId: string,
  key: string,
  value: string,
  language: string,
  templateIdHint?: string,
  valueFieldNameHint?: string
): Promise<boolean> {
  const client = await getMarketplaceClient();
  if (client == null || PREVIEW_CONTEXT_ID === "") {
    return false;
  }

  const templateId = templateIdHint ?? (await resolveContentTokenTemplateId());
  if (!templateId) {
    throw new Error("Unable to resolve Content Token template id.");
  }

  const valueFieldName = valueFieldNameHint ?? "Phrase";
  const mutationVariables = {
    parent: parentFolderId,
    name: key,
    template: templateId,
    language,
    key,
    value,
    valueFieldName,
  };

  const mutationCandidates = [
    CreateTokenMutationInput,
    CreateTokenMutationInputParentObject,
    CreateTokenMutationInputTemplateObject,
    CreateTokenMutationInputParentAndTemplateObjects,
    CreateTokenMutation,
  ];
  const errorMessages: string[] = [];

  for (const mutation of mutationCandidates) {
    const { data } = await client.mutate("xmc.authoring.graphql", {
      params: {
        query: {
          sitecoreContextId: PREVIEW_CONTEXT_ID,
        },
        body: {
          query: mutation,
          variables: mutationVariables,
        },
      },
    });

    // SDK response typing for custom GraphQL payload is untyped.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = data as any;
    const createdItemId = extractCreatedItemId(payload);
    if (createdItemId) {
      return true;
    }

    const createItemNode = payload?.data?.createItem;
    if (createItemNode && !payload?.errors?.length) {
      return true;
    }

    const mutationErrors = extractErrorMessages(payload);
    if (mutationErrors.length > 0) {
      errorMessages.push(...mutationErrors);
    }
  }

  if (errorMessages.length > 0) {
    throw new Error(errorMessages.join(" | "));
  }

  return false;
}
/**********************************************************/
export async function ResolveContentTokensFolderId(
  siteRootPath: string,
  language: string
): Promise<string> {
  const client = await getMarketplaceClient();
  if (client == null || PREVIEW_CONTEXT_ID === "") {
    return "";
  }

  const templateCandidates = [
    "Content Tokens Folder",
    "Content Token Folder",
  ];

  for (const templateName of templateCandidates) {
    const { data } = await client.mutate("xmc.authoring.graphql", {
      params: {
        query: {
          sitecoreContextId: PREVIEW_CONTEXT_ID,
        },
        body: {
          query: GetTokenFoldersByTemplateQuery,
          variables: {
            siteRootPath,
            language,
            template: templateName,
          },
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = data as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = payload?.data?.search?.results as any[] | undefined;
    if (!results || results.length === 0) {
      continue;
    }

    const preferredResult =
      results.find((result) => result?.path?.toLowerCase?.().includes("/data/")) ??
      results[0];
    if (preferredResult?.itemId) {
      return preferredResult.itemId;
    }
  }

  return "";
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
function mapToToken(rawItem: any): Token | undefined {
  const rawKey = rawItem?.innerItem?.key?.value;
  const key = typeof rawKey === "string" ? rawKey.trim() : "";
  if (!key) {
    return undefined;
  }

  const token = {
    id: rawItem?.itemId ?? "",
    key,
    value: rawItem?.innerItem?.value?.value ?? rawItem?.innerItem?.phrase?.value ?? "",
    templateId: rawItem?.innerItem?.template?.templateId,
    valueFieldName: rawItem?.innerItem?.value?.value != null ? "Value" : "Phrase",
    description: rawItem?.path
  } as Token;

  return token;
}
/**********************************************************/
async function resolveContentTokenTemplateId(): Promise<string | undefined> {
  if (cachedContentTokenTemplateId) {
    return cachedContentTokenTemplateId;
  }

  const client = await getMarketplaceClient();
  if (client == null || PREVIEW_CONTEXT_ID === "") {
    return undefined;
  }

  const lookupWithContext = await client.mutate("xmc.authoring.graphql", {
    params: {
      query: {
        sitecoreContextId: PREVIEW_CONTEXT_ID,
      },
      body: {
        query: ResolveContentTokenTemplateQuery,
        variables: {
          templateName: "Content Token",
        },
      },
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payload = lookupWithContext.data as any;
  let templateId = payload?.data?.search?.results?.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result: any) => result?.path?.toLowerCase?.().includes("/sitecore/templates/")
  )?.itemId;

  if (!templateId) {
    const lookupWithoutContext = await client.mutate("xmc.authoring.graphql", {
      params: {
        body: {
          query: ResolveContentTokenTemplateQuery,
          variables: {
            templateName: "Content Token",
          },
        },
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload = lookupWithoutContext.data as any;
    templateId = payload?.data?.search?.results?.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result: any) => result?.path?.toLowerCase?.().includes("/sitecore/templates/")
    )?.itemId;
  }

  if (templateId) {
    cachedContentTokenTemplateId = templateId;
  }

  return templateId;
}
/**********************************************************/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractCreatedItemId(payload: any): string | undefined {
  return (
    payload?.data?.createItem?.item?.itemId ??
    payload?.data?.createItem?.itemId ??
    payload?.data?.createItem?.item?.id ??
    payload?.data?.createItem?.id
  );
}
/**********************************************************/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractErrorMessages(payload: any): string[] {
  const messages: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?.errors?.forEach((error: any) => {
    if (error?.message) {
      messages.push(String(error.message));
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?.data?.createItem?.errors?.forEach((error: any) => {
    if (error?.message) {
      messages.push(String(error.message));
    }
  });

  return messages;
}
/**********************************************************/
