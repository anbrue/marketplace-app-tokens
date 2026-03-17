"use client";

import { TokenContextPanel } from "@/components/token-panel";
import { Card, CardContent } from "@/components/ui/card";
import useMarketplaceClient from "@/hooks/useMarketplaceClient";
import usePagesContext from "@/hooks/usePagesContext";


function PagesContextPanel() {
  const client = useMarketplaceClient();
  const pagesContext = usePagesContext();




  return (
    <div className="mx-auto mt-8 max-w-[760px] p-6">
      {client && pagesContext ? (
        <Card className="shadow-sm">
          <CardContent>
            <TokenContextPanel />
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardContent>
            <p className="text-muted-foreground">No page context available yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PagesContextPanel;
