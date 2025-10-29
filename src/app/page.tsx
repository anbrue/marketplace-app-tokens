"use client";

import { TokenContextPanel } from "@/components/token-panel";
import useMarketplaceClient from "@/hooks/useMarketplaceClient";
import usePagesContext from "@/hooks/usePagesContext";


function PagesContextPanel() {
  const client = useMarketplaceClient();
  const pagesContext = usePagesContext();




  return (
    <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px", maxWidth: "600px", margin: "2rem auto" }}>
      {client && pagesContext ? (
        <>
          <div>
            <TokenContextPanel />
          </div>
        </>
      ) : (
        <p>No page context available yet.</p>
      )}
    </div>
  );
}

export default PagesContextPanel;
