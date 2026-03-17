import getMarketplaceClient from "@/clients/MarketplaceClient";
import {
  GETITEMBYID_QUERY,
  GETITEMBYPATH_QUERY,
} from "@/consts/Queries";
import { decodeString, formatDate, toSmallId } from "@/lib/stringHelper";
import {
  Field,
  Item,
} from "@/types/item";
import { PREVIEW_CONTEXT_ID } from "./contextService";
/**********************************************************/
export async function GetItemById(
  id: string,
  language: string,
  items: Item[],
  version?: number
): Promise<Item | undefined> {
  const item = await getItem(language, id, undefined, version);

  return item;
}

export async function GetItemByPath(
  path: string,
  language: string,
  items: Item[],
  version?: number
): Promise<Item | undefined> {
  const item = await getItem(language, undefined, path, version);

  return item;
}

/**********************************************************/
async function getItem(
  language: string,
  id?: string,
  path?: string,
  version?: number
): Promise<Item | undefined> {
  const client = await getMarketplaceClient();
  if (client != null && PREVIEW_CONTEXT_ID != "") {
    const { data } = await client.mutate("xmc.authoring.graphql", {
      params: {
        query: {
          sitecoreContextId: PREVIEW_CONTEXT_ID,
        },
        body: {
          query: id ? GETITEMBYID_QUERY : GETITEMBYPATH_QUERY,
          variables: {
            itemId: id,
            path: path,
            language: language,
            version: version,
          },
        },
      },
    });
    return data?.data?.item ? mapToItem(data?.data?.item) : undefined;
  }

  return undefined;
}
/**********************************************************/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToItem(rawItem: any): Item {
  const item = {
    rawValue: rawItem,
    displayName: rawItem?.displayName,
    name: rawItem?.name,
    id: rawItem?.itemId,
    path: rawItem?.path,
    langauge: rawItem?.language?.name,
    version: rawItem?.version,
    finalRenderings: decodeString(rawItem?.finalRenderings?.value),
    sharedrenderings: decodeString(rawItem?.renderings?.value),
    template: {
      name: rawItem?.template?.name,
      id: rawItem?.template?.templateId,
    },
    updated: formatDate(rawItem?.updated?.value),
    workflow: {
      workflowState: {
        final: rawItem?.workflow?.workflowState?.final,
        id: toSmallId(rawItem?.workflow?.workflowState?.stateId),
        displayName: rawItem?.workflow?.workflowState?.displayName,
      },
      workflow: {
        workflowId: toSmallId(rawItem?.workflow?.workflow?.workflowId),
        displayName: rawItem?.workflow?.workflow?.displayName,
      },
    },
    dependencies: {
      healthy: rawItem?.dependencies?.healthy,
      allDependencies: rawItem?.dependencies?.allDependencies,
      hasDependencies: rawItem?.dependencies?.hasDependencies,
    },
    fields:
      rawItem?.customFields?.nodes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((field: any) => {
            return {
              name: field.name,
              value: field.value,
              resolvedItems: [],
              templateField: {
                name: field.templateField.name,
                type: field.templateField.type,
                templateFieldId: field.templateField.templateFieldId,
                templateSectionId:
                  field.templateField.section.itemTemplateSectionId,
                typekey: field.templateField.typeKey,
              },
            } as Field;
          
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((field: any) => field !== undefined) ?? [], // Filter out undefined fields
  } as Item;

  return item;
}
