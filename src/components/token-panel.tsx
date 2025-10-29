"use client"

import { useContext, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SettingsContext } from "@/context/SettingsContext"
import useExtendedSites, { ExtendedSite } from "@/hooks/useExtendedSites"
import useMarketplaceClient from "@/hooks/useMarketplaceClient"
import usePagesContext from "@/hooks/usePagesContext"
import { TokenCategory } from "@/types/token"
import { SearchTokens } from "@/services/tokenService"


export function TokenContextPanel() {
  const client = useMarketplaceClient();
  const sites = useExtendedSites();
  const pagesContext = usePagesContext();
  const {previewContextId} = useContext(SettingsContext);
  const [language, setLanguage] = useState<string>("en");
  const [currentSiteId, setCurrentSiteId] = useState<string | undefined>();
  // commented due to no access to clipboard from the app
  //const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tokens, setTokens] = useState<TokenCategory[]>();
  const [filteredTokens, setFilteredTokens] = useState<TokenCategory[]>();

  // commented due to no access to clipboard from the app
  // const copyToClipboard = async (value: string, tokenName: string) => {
  //   try {
  //     await navigator.clipboard.writeText(value)
  //     setCopiedToken(tokenName)
  //     setTimeout(() => setCopiedToken(null), 2000)
  //   } catch (err) {
  //     console.error("Failed to copy:", err)
  //   }
  // }

  const getCategoryColor = (color: string) => {
    switch (color) {
      case "primary":
        return "border-l-blue-500"
      case "success":
        return "border-l-green-500"
      case "warning":
        return "border-l-orange-500"
      default:
        return "border-l-blue-500"
    }
  }

  useEffect(() => {
    const pageContextLang = pagesContext?.context?.pageInfo?.language;
    if(pageContextLang && pageContextLang !== language){
      setLanguage(pageContextLang);
    }
    
    const contextSite = pagesContext?.context?.siteInfo?.id;
    if(contextSite && contextSite !== currentSiteId){
      setCurrentSiteId(contextSite);
    }
  }, [currentSiteId, language, pagesContext]);

    useEffect(() => {
    if(sites && sites?.length > 0 && currentSiteId) {
    const currentSite = sites?.find((s : ExtendedSite) => s.site.id === currentSiteId);
    let sharedSites = sites;
    sharedSites = sharedSites?.filter((site : ExtendedSite) => {
      return site.isShared;
    });

    async function searchItems() {
      const tokenCategories : TokenCategory[] = [];
      if (currentSite && language && sharedSites) {
        if(currentSite.contentTokensFolderId){
          const currentSiteTokens = await SearchTokens(currentSite.contentTokensFolderId, language);  
          if(currentSiteTokens && currentSiteTokens.length > 0){
            tokenCategories.push(
              {
                title: currentSite.site.displayName,
                description: currentSite.site.properties.rootPath,
                tokens: currentSiteTokens,
                color: "warning"
              } as TokenCategory
            );
          }    
        }
      }

      for(let i = 0; i < sharedSites.length; i++){
        const site = sharedSites[i];
        if(site.contentTokensFolderId && site.isShared){
          const siteTokens = await SearchTokens(site.contentTokensFolderId, language)

            if (siteTokens && siteTokens.length > 0) {
              tokenCategories.push(
                {
                  title: site.site.displayName,
                  description: site.site.properties.rootPath,
                  tokens: siteTokens,
                  color: site.isShared ? "primary" : "success"
                } as TokenCategory
              )
            }
        }
      }

      setTokens(tokenCategories);
      setFilteredTokens(tokenCategories);
      setIsLoading(false);
    }

    searchItems();
  }
  }, [client, currentSiteId, language, previewContextId, sites]);

  useEffect(() => {
    if(tokens){
      const filteredTokenData = tokens
    .map((category) => ({
      ...category,
      tokens: category.tokens.filter(
        (token) =>
          token.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.value.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.tokens.length > 0);
    setFilteredTokens(filteredTokenData);
  }
  }, [searchQuery, tokens]);

  return (
    
     <div className="w-full max-w-[600px] mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Token Context Panel</h1>
          <p className="text-muted-foreground">Browse and copy available tokens organized by site</p>
        </div>
      {!isLoading && filteredTokens && filteredTokens.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}
      </div>

      {!isLoading && filteredTokens && filteredTokens.length > 0 && (
      <div className="grid gap-6">
        {filteredTokens && filteredTokens.map((category) => (
          <Card key={category.title} className={`border-l-4 ${getCategoryColor(category.color)}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium">{"Tokens from site "}{category.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {category.tokens.length} tokens
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {category.tokens.map((token) => (
                <div
                  key={token.key}
                  className="flex items-start justify-between p-3 rounded-lg bg-muted/50 border hover:bg-muted/70 transition-colors gap-3"
                >
                  <div className="flex-1 min-w-0 space-y-1 overflow-hidden">
                    
                    {/* <code className="text-sm font-mono font-medium block">{"{{"}{token.key}{"}}"}</code> */}
                    <div className="w-full">
                      <code className="text-sm font-mono text-muted-foreground bg-background px-2 py-1 rounded border block w-full break-all">{"{{"}{token.key}{"}}"}</code>
                      <code className="text-xs font-mono block px-2 py-1 w-full break-all">
                        {token.value}
                      </code>
                    </div>
                    {token.description && <p className="text-xs text-muted-foreground">{token.description}</p>}
                  </div>
                  {/* Accessing the clipboard is currently blocked. Since the app is running in an iframe 
                      this must be allowed in Page Builder. Feature Request to Sitecore. */}
                  {/* <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(token.value, token.key)}
                    className="h-8 w-8 p-0 flex-shrink-0"
                  >
                    {copiedToken === token.key ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button> */}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {filteredTokens && filteredTokens.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tokens found matching {searchQuery}</p>
        </div>
      )}
    </div>
  )
}
