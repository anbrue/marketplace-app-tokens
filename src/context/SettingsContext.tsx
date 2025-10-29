"use client";
import useApplicationContext from "@/hooks/useApplicationContext";
import { createContext} from "react";
/**********************************************************/
export interface SettingsProps {
  previewContextId?: string;
  liveContextId?: string;
}
export const SettingsContext = createContext<SettingsProps>({});
/**********************************************************/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CustomSettingsContext({ children }: any) {
  const appContext = useApplicationContext();

  /**********************************************************/
  return (
    <SettingsContext.Provider
      value={{
        previewContextId: appContext?.resourceAccess?.[0]?.context?.preview ?? "",
        liveContextId: appContext?.resourceAccess?.[0]?.context?.live ?? "",
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
/**********************************************************/
