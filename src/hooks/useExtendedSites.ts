import { useEffect, useState } from "react";
import { GetItemByPath } from "@/services/itemService";
import useSites from "./useSites";
/**********************************************************/
export interface Site {
  id: string;
  displayName: string;
  properties: {
    rootPath: string;
    sharedSite: boolean;
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
            const contentTokensFolder = await GetItemByPath(globalItemRootPath + "/Content Tokens", "en", []);
            customSites.push({
              site,
              rootItemId: item?.id ?? "",
              globalDataItemId: globalItemRootItem?.id ?? "",
              contentTokensFolderId: contentTokensFolder?.id ?? "",
              isShared : site?.properties?.sharedSite == "true"
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
