"use client"

import { FormEvent, useContext, useEffect, useState } from "react"
import { Copy, Loader2, Plus, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SettingsContext } from "@/context/SettingsContext"
import useExtendedSites, { ExtendedSite } from "@/hooks/useExtendedSites"
import useMarketplaceClient from "@/hooks/useMarketplaceClient"
import usePagesContext from "@/hooks/usePagesContext"
import { cn } from "@/lib/utils"
import { TokenCategory } from "@/types/token"
import { CreateToken, SearchTokens } from "@/services/tokenService"
import {
  CATEGORY_THEME,
  DEFAULT_CATEGORY_THEME,
  PANEL_THEME,
  PANEL_TEXT,
  type CategoryVariant,
} from "@/consts/tokenPanelTheme"


export function TokenContextPanel() {
  const client = useMarketplaceClient();
  const sites = useExtendedSites();
  const pagesContext = usePagesContext();
  const {previewContextId} = useContext(SettingsContext);
  const [language, setLanguage] = useState<string>("en");
  const [currentSiteId, setCurrentSiteId] = useState<string | undefined>();
  // commented due to no access to clipboard from the app
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tokens, setTokens] = useState<TokenCategory[]>();
  const [filteredTokens, setFilteredTokens] = useState<TokenCategory[]>();
  const [isAddTokenOpen, setIsAddTokenOpen] = useState(false);
  const [activeCategorySiteId, setActiveCategorySiteId] = useState<string | null>(null);
  const [newTokenKey, setNewTokenKey] = useState("");
  const [newTokenValue, setNewTokenValue] = useState("");
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [isTokenKeyTouched, setIsTokenKeyTouched] = useState(false);
  const [isTokenValueTouched, setIsTokenValueTouched] = useState(false);
  const [isSubmittingToken, setIsSubmittingToken] = useState(false);
  const [addTokenError, setAddTokenError] = useState<string | null>(null);
  const currentSiteDisplayName =
    sites?.find((site: ExtendedSite) => site.site.id === currentSiteId)?.site
      ?.displayName ?? "Unknown site";

  // commented due to no access to clipboard from the app
  const copyToClipboard = async (value: string, tokenId: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedToken(tokenId);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getCategoryTheme = (color: string) => {
    const mappedTheme = CATEGORY_THEME[color as CategoryVariant];
    return mappedTheme ?? DEFAULT_CATEGORY_THEME;
  };

  const openAddTokenModal = (siteId: string) => {
    setActiveCategorySiteId(siteId);
    setNewTokenKey("");
    setNewTokenValue("");
    setIsSubmitAttempted(false);
    setIsTokenKeyTouched(false);
    setIsTokenValueTouched(false);
    setAddTokenError(null);
    setIsAddTokenOpen(true);
  };

  const closeAddTokenModal = () => {
    setIsAddTokenOpen(false);
    setActiveCategorySiteId(null);
    setNewTokenKey("");
    setNewTokenValue("");
    setIsSubmitAttempted(false);
    setIsTokenKeyTouched(false);
    setIsTokenValueTouched(false);
    setIsSubmittingToken(false);
    setAddTokenError(null);
  };

  const submitAddToken = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedKey = newTokenKey.trim();
    const trimmedValue = newTokenValue.trim();
    setIsSubmitAttempted(true);

    if (!trimmedKey || !trimmedValue || !activeCategorySiteId || isTokenKeyDuplicate) {
      return;
    }
    setAddTokenError(null);
    setIsSubmittingToken(true);

    try {
      const activeCategory = tokens?.find((category) => category.siteId === activeCategorySiteId);
      if (!activeCategory?.contentTokensFolderId) {
        throw new Error("Unable to resolve Content Tokens folder for selected site.");
      }

      const created = await CreateToken(
        activeCategory.contentTokensFolderId,
        trimmedKey,
        trimmedValue,
        language,
        activeCategory.tokens[0]?.templateId,
        activeCategory.tokens[0]?.valueFieldName
      );
      if (!created) {
        throw new Error("Token could not be created in the current context.");
      }

      const refreshedTokens = await SearchTokens(activeCategory.contentTokensFolderId, language);
      setTokens((previousTokens) =>
        previousTokens?.map((category) =>
          category.siteId === activeCategorySiteId
            ? {
                ...category,
                tokens: refreshedTokens,
              }
            : category
        )
      );
      closeAddTokenModal();
    } catch (error) {
      setAddTokenError(error instanceof Error ? error.message : "Failed to create token.");
    } finally {
      setIsSubmittingToken(false);
    }
  };

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
    if (!(sites && sites.length > 0 && currentSiteId)) {
      setIsLoading(false);
      return;
    }

    const currentSite = sites.find((s: ExtendedSite) => s.site.id === currentSiteId);
    const sharedSites = sites.filter((site: ExtendedSite) => site.isShared);

    async function searchItems() {
      setIsLoading(true);
      try {
        const tokenCategories: TokenCategory[] = [];
        if (currentSite && language && sharedSites) {
          if (currentSite.contentTokensFolderId) {
            const currentSiteTokens = await SearchTokens(currentSite.contentTokensFolderId, language);
            if (currentSiteTokens && currentSiteTokens.length > 0) {
              tokenCategories.push(
                {
                  siteId: currentSite.site.id,
                  contentTokensFolderId: currentSite.contentTokensFolderId,
                  canCreateToken: currentSite.canCreateTokens,
                  title: currentSite.site.displayName,
                  description: currentSite.site.properties.rootPath,
                  tokens: currentSiteTokens,
                  color: "warning"
                } as TokenCategory
              );
            }
          }
        }

        for (let i = 0; i < sharedSites.length; i++) {
          const site = sharedSites[i];
          if (site.contentTokensFolderId && site.isShared) {
            const siteTokens = await SearchTokens(site.contentTokensFolderId, language);

            if (siteTokens && siteTokens.length > 0) {
              tokenCategories.push(
                {
                  siteId: site.site.id,
                  contentTokensFolderId: site.contentTokensFolderId,
                  canCreateToken: site.canCreateTokens,
                  title: site.site.displayName,
                  description: site.site.properties.rootPath,
                  tokens: siteTokens,
                  color: site.isShared ? "primary" : "success"
                } as TokenCategory
              );
            }
          }
        }

        setTokens(tokenCategories);
        setFilteredTokens(tokenCategories);
      } finally {
        setIsLoading(false);
      }
    }

    searchItems();
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

  const isTokenKeyInvalid = (isSubmitAttempted || isTokenKeyTouched) && !newTokenKey.trim();
  const normalizedNewTokenKey = newTokenKey.trim().toLowerCase();
  const isTokenKeyDuplicate =
    normalizedNewTokenKey.length > 0 &&
    Boolean(
      tokens?.some((category) =>
        category.tokens.some((token) => token.key.trim().toLowerCase() === normalizedNewTokenKey)
      )
    );
  const shouldShowDuplicateError = (isSubmitAttempted || isTokenKeyTouched) && isTokenKeyDuplicate;
  const isTokenValueInvalid =
    (isSubmitAttempted || isTokenValueTouched) && !newTokenValue.trim();

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{PANEL_TEXT.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{PANEL_TEXT.subtitle}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="secondary" className={PANEL_THEME.languageBadgeClassName}>
            {PANEL_TEXT.languageLabel}: {language}
          </Badge>
          <Badge variant="secondary" className={PANEL_THEME.siteBadgeClassName}>
            {PANEL_TEXT.siteLabel}: {currentSiteDisplayName}
          </Badge>
        </div>
      </div>

      {!isLoading && tokens && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={PANEL_TEXT.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-3 py-2">
          <Loader2 className={cn("h-4 w-4 animate-spin", PANEL_THEME.loadingSpinnerClassName)} />
          <p className="text-sm text-muted-foreground">{PANEL_TEXT.loadingMessage}</p>
        </div>
      )}

      {!isLoading && filteredTokens && filteredTokens.length > 0 && (
        <div className="space-y-4 pb-2">
          {filteredTokens.map((category) => (
            <Card
              key={category.siteId}
              className={cn("border-l-4 shadow-sm", getCategoryTheme(category.color).borderClassName)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="min-w-0 text-base leading-tight">
                      {PANEL_TEXT.tokensFromSitePrefix} {category.title}
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className={cn("shrink-0", getCategoryTheme(category.color).badgeClassName)}
                  >
                    {category.tokens.length} {PANEL_TEXT.tokensCountSuffix}
                  </Badge>
                </div>
                <p className="mt-1 break-all text-sm text-muted-foreground">
                  {category.description}
                </p>
                {category.canCreateToken && (
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title={PANEL_TEXT.addTokenTooltip}
                      aria-label={PANEL_TEXT.addTokenTooltip}
                      onClick={() => openAddTokenModal(category.siteId)}
                    >
                      <Plus />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-3 border-t pt-3">
                {category.tokens.map((token) => (
                  <div
                    key={`${category.siteId}_${token.id}`}
                    className="min-w-0 space-y-1 rounded-md border bg-muted/50 p-3 transition-colors hover:bg-muted/80"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <code className="block min-w-0 flex-1 break-all rounded-md border bg-background px-2 py-1 text-xs text-slate-700">
                        {"{{"}
                        {token.key}
                        {"}}"}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`{{${token.key}}}`, token.id)}
                        className={cn(
                          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                          copiedToken === token.id && "border-green-600 text-green-600"
                        )}
                        aria-label={`Copy value for token ${token.key}`}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <code className="block break-all px-2 py-1 text-xs text-slate-700">
                      {token.value}
                    </code>
                    {token.description && (
                      <p className="break-all text-xs text-muted-foreground">
                        {token.description}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredTokens && filteredTokens.length === 0 && searchQuery && (
        <p className="py-10 text-center text-muted-foreground">
          {PANEL_TEXT.noSearchResultsPrefix} {searchQuery}
        </p>
      )}

      {!isLoading && filteredTokens && filteredTokens.length === 0 && !searchQuery && (
        <p className="py-10 text-center text-muted-foreground">
          {PANEL_TEXT.noTokensForContext}
        </p>
      )}

      {isAddTokenOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border bg-background p-4 shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-semibold">{PANEL_TEXT.addTokenDialogTitle}</h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={closeAddTokenModal}
                aria-label="Close"
              >
                <X />
              </Button>
            </div>

            <form className="space-y-4" onSubmit={submitAddToken}>
              <div className="space-y-1">
                <label className="text-sm font-medium">{PANEL_TEXT.tokenKeyLabel}</label>
                <Input
                  value={newTokenKey}
                  onChange={(event) => setNewTokenKey(event.target.value)}
                  onBlur={() => setIsTokenKeyTouched(true)}
                  required
                  aria-invalid={isTokenKeyInvalid || shouldShowDuplicateError}
                  className={cn(
                    "transition-all duration-150",
                    (isTokenKeyInvalid || shouldShowDuplicateError) &&
                      "border-destructive ring-2 ring-destructive/25"
                  )}
                />
                {isTokenKeyInvalid && (
                  <p className="text-xs text-destructive">
                    {PANEL_TEXT.tokenKeyRequiredMessage}
                  </p>
                )}
                {!isTokenKeyInvalid && shouldShowDuplicateError && (
                  <p className="text-xs text-destructive">
                    {PANEL_TEXT.tokenKeyDuplicateMessage}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">{PANEL_TEXT.tokenValueLabel}</label>
                <Input
                  value={newTokenValue}
                  onChange={(event) => setNewTokenValue(event.target.value)}
                  onBlur={() => setIsTokenValueTouched(true)}
                  required
                  aria-invalid={isTokenValueInvalid}
                  className={cn(
                    "transition-all duration-150",
                    isTokenValueInvalid && "border-destructive ring-2 ring-destructive/25"
                  )}
                />
                {isTokenValueInvalid && (
                  <p className="text-xs text-destructive">
                    {PANEL_TEXT.tokenValueRequiredMessage}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeAddTokenModal}>
                  {PANEL_TEXT.addTokenCancelLabel}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingToken || isTokenKeyDuplicate || !newTokenKey.trim() || !newTokenValue.trim()}
                  className="bg-purple-600 text-white hover:bg-purple-700 focus-visible:ring-purple-400 disabled:bg-purple-300"
                >
                  {isSubmittingToken ? "Creating..." : PANEL_TEXT.addTokenSubmitLabel}
                </Button>
              </div>
              {addTokenError && <p className="text-sm text-destructive">{addTokenError}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
