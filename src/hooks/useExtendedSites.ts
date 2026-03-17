import { useEffect, useState } from "react";
import { GetItemByPath } from "@/services/itemService";
import { ResolveContentTokensFolderId } from "@/services/tokenService";
import useSites from "./useSites";
/**********************************************************/
export interface Site {
  id: string;
  displayName: string;
  properties: {
    rootPath: string;
    sharedSite: boolean;
  };
  permissions?: {
    canCreate?: boolean;
  };
  name: string;
}
/**********************************************************/
export interface ExtendedSite {
  site: Site;
  rootItemId: string;
  globalDataItemId: string;
  contentTokensFolderId: string;
  isShared: boolean;
  canCreateTokens: boolean;
}
/**********************************************************/
export default function useExtendedSites() {
  const sites = useSites();
  const [extendedSites, setExtendedSites] = useState<ExtendedSite[]>();

  useEffect(() => {
    async function getCustomSites() {
      const customSites = [] as ExtendedSite[];
      if (sites && sites.length > 0) {
        await Promise.all(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sites?.map(async (site: any) => {
            const rootPath = site.properties.rootPath + "/Home";
            const item = await GetItemByPath(rootPath, "en", []);
            const globalItemRootPath = site.properties.rootPath + "/Data";
            const globalItemRootItem = await GetItemByPath(
              globalItemRootPath,
              "en",
              []
            );
            const resolvedContentTokensFolderId = await ResolveContentTokensFolderId(
              site.properties.rootPath,
              "en"
            );
            const fallbackContentTokensFolder = await GetItemByPath(
              globalItemRootPath + "/Content Tokens",
              "en",
              []
            );
            customSites.push({
              site,
              rootItemId: item?.id ?? "",
              globalDataItemId: globalItemRootItem?.id ?? "",
              contentTokensFolderId:
                resolvedContentTokensFolderId || fallbackContentTokensFolder?.id || "",
              isShared:
                site?.properties?.sharedSite === true ||
                site?.properties?.sharedSite === "true",
              canCreateTokens: Boolean(site?.permissions?.canCreate)
            });
          })
        );
        setExtendedSites(customSites);
      }
    }

    getCustomSites();
  }, [sites]);

  return extendedSites;
}
