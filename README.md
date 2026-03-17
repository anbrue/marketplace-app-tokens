<p>
  <strong style="font-size: 1.5em;">Content Tokens Custom App</strong>
</p>
 
This app runs as a **Pages Context (Page Builder)** extension and helps editors discover, search, copy, and create content tokens directly in context.

It aggregates tokens from the current site and shared sites, groups them by site, and provides a focused editor workflow with validation, permission checks, and in-context creation.

**Editor features:** Site-grouped token listing, search across key/value/path, copy token expression to clipboard, token creation modal, duplicate-key validation across categories, required-field validation with inline feedback, permission-aware Add button and immediate refresh after successful creation.

| | |
| --- | --- |
| **Version** | 1.0.0 |
| **Extension points** | Pages Context |
| **Built with** | Next.js 15, React 19, Sitecore Marketplace SDK (`@sitecore-marketplace-sdk/client`, `@sitecore-marketplace-sdk/xmc`), Tailwind CSS, shadcn/ui, Lucide |

## 🧩 Content Tokens Concept

Content Tokens are CMS items that store a **Key** and **Phrase** value and can be used in text fields via:

```text
{{token-key}}
```

They are stored in each site's data area under a dedicated **Content Tokens** folder.

## ⚠️ Token Template Requirements

- The token template is currently expected to be named **`Content Token`**.
- If your template has a different name, update the search logic in `SearchTokens` at `src/services/tokenService.ts`.
- The token template must provide one of these field combinations:
  - `Key` + `Phrase` (current default for create flow), or
  - `Key` + `Value` (supported through runtime fallback handling).
- The **folder that contains token items** should use a dedicated folder template named either:
  - **`Content Tokens Folder`** (preferred), or
  - **`Content Token Folder`**.
- The app resolves the token folder by template under the current site root first.  
  For backward compatibility, it then falls back to path lookup at:
  - `$siteRootPath/Data/Content Tokens`
- Recommended structure per site:
  - `$siteRootPath/Data/Content Tokens` (folder item)
  - token items as children of that folder.

## 💡 Why this app exists

This app follows the same editor-driven rationale:

- editors work directly in Page Builder and need quick token discovery
- tokens should be usable across text fields, not only rich text
- editors need confidence they are using valid token keys

The panel solves this by showing token categories per site in the current page context and language.

## 📦 Running the Application Locally

You can run the application locally; full SDK-backed behavior requires loading inside the Sitecore Marketplace host frame.

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd marketplace-app-tokens
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Build and lint checks (optional but recommended)**

   ```bash
   npm run lint
   npm run build
   ```

## 🔗 Sitecore Integration

This application is designed as a **Pages Context** extension in the Sitecore Marketplace.

- It initializes through the Marketplace SDK client and subscribes to page context (`pages.context`).
- It resolves current site/language from the Page Builder context.
- It resolves sites via `xmc.xmapp.listSites`, enriches them with Content Tokens folder IDs, and queries tokens via `xmc.authoring.graphql`.
- It creates tokens in the target site's **Content Tokens** folder, in user context.

### Token Creation Flow

On **Add Token** submit:

- Item is created in the selected site's Content Tokens folder.
- Item name = entered token key.
- Field `Key` = entered token key.
- Field value field = `Phrase` (with fallback handling for schema variants).
- Token list is refreshed for the active category after creation.

### Permission Handling

The Add button is rendered only when the site permissions indicate create access (`permissions.canCreate`).

## 🧠 Runtime Behavior

- Page context changes (site/language) trigger token refresh.
- Search filters token key and phrase values while keeping the search box visible.
- Create flow uses mutation-shape fallbacks to account for tenant-specific Authoring GraphQL schema differences.
- Duplicate token keys are prevented at UI level before submit.

## 🌐 Head application integration

This app is an **editor tool** in Marketplace/Page Builder.  
Token replacement in the head/frontend application is handled separately by your frontend token-resolution logic.

## ⚠️ Notes

- The app behavior depends on being loaded from a valid Marketplace origin.
- Different XM Cloud tenants can expose slightly different Authoring GraphQL `createItem` input contracts. The implementation includes fallback mutation shapes and error extraction to improve compatibility and diagnostics.
- Template resolution can vary by context visibility; the app uses cached/template-hint strategies to reduce failures.

## 📚 References

- Marketplace App Docs: [https://doc.sitecore.com/mp/en/developers/marketplace/custom-marketplace-apps.html](https://doc.sitecore.com/mp/en/developers/marketplace/custom-marketplace-apps.html)
- Blog background and concept walkthrough: [https://www.scadvent.com/2025/marketplace-app-content-tokens/](https://www.scadvent.com/2025/marketplace-app-content-tokens/)

## 📝 License

This project is licensed under the terms specified in the LICENSE file.

## 🐛 Issues

If you encounter issues or have suggestions, please open an issue in the repository.
