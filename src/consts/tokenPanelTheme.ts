export type CategoryVariant = "primary" | "success" | "warning";

interface CategoryTheme {
  borderClassName: string;
  badgeClassName: string;
}

export const CATEGORY_THEME: Record<CategoryVariant, CategoryTheme> = {
  primary: {
    borderClassName: "border-l-blue-500",
    badgeClassName: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200",
  },
  success: {
    borderClassName: "border-l-green-500",
    badgeClassName: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-200",
  },
  warning: {
    borderClassName: "border-l-orange-500",
    badgeClassName: "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-200",
  },
};

export const DEFAULT_CATEGORY_THEME: CategoryTheme = {
  borderClassName: "border-l-blue-500",
  badgeClassName: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
};

export const PANEL_THEME = {
  languageBadgeClassName:
    "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-200",
  siteBadgeClassName: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-200",
  loadingSpinnerClassName: "text-blue-500",
};

export const PANEL_TEXT = {
  title: "Token Context Panel",
  subtitle: "Browse and copy available tokens organized by site",
  languageLabel: "Language",
  siteLabel: "Site",
  searchPlaceholder: "Search tokens...",
  loadingMessage: "Loading tokens...",
  tokensFromSitePrefix: "Tokens from site",
  tokensCountSuffix: "tokens",
  noSearchResultsPrefix: "No tokens found matching",
  noTokensForContext: "No tokens are available for the current site context.",
  addTokenTooltip: "Add token",
  addTokenDialogTitle: "Add token",
  tokenKeyLabel: "Token Key",
  tokenValueLabel: "Token Value",
  tokenKeyRequiredMessage: "Token Key is required.",
  tokenKeyDuplicateMessage: "A token with this key already exists.",
  tokenValueRequiredMessage: "Token Value is required.",
  addTokenSubmitLabel: "Add Token",
  addTokenCancelLabel: "Cancel",
};
