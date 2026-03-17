import { useEffect, useState } from "react";
import { ApplicationContext } from "@sitecore-marketplace-sdk/core";
import { getApplicationContext } from "@/services/contextService";
/**********************************************************/
export default function useApplicationContext() {
  const [info, setInfo] = useState<ApplicationContext | undefined>(undefined);

  useEffect(() => {
    async function fetchInfo() {
      const data = await getApplicationContext();
      if (data) {
        setInfo(data);
      }
    }

    fetchInfo();
  }, []);

  return info;
}