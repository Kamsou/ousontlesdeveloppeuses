# 🚀 SEO Improvements for Google Search

Comprehensive SEO enhancements with centralized composables to eliminate code repetition.

## ✨ What's Changed

### SEO Features
- Enhanced meta tags (Open Graph, Twitter Cards, Google-specific directives)
- Added canonical URLs to all pages (automatic via composable)
- Implemented JSON-LD structured data (Organization, WebSite, Person, Breadcrumb, CollectionPage schemas)
- Dynamic sitemap generation with all routes
- Improved image SEO with descriptive alt texts
- Runtime configuration for site URL management

### Code Quality Improvements
- **Created `usePageSEO` composable**: Centralizes meta tags and canonical URLs (reduces ~40 lines to ~8 lines per page)
- **Created `useSchemaOrgSEO` composable**: Type-safe structured data with automatic fallback
- **Eliminated code repetition**: No more copy-paste pattern across pages
- **Type-safe**: Full TypeScript support for Schema.org schemas

## 📁 Files

### New Files
- `app/composables/usePageSEO.ts` - Centralized SEO meta tags and canonical URLs
- `app/composables/useSchemaOrgSEO.ts` - Type-safe structured data composable
- `server/api/sitemap-dynamic-routes.get.ts` - API endpoint for dynamic sitemap routes
- `public/.well-known/security.txt` - Security contact information

### Modified Files
- All page components refactored to use new composables (index, annuaire, speakers, entreprises, profil/[id])
- `nuxt.config.ts` - Enhanced SEO configuration

### Removed Files
- `app/composables/useStructuredData.ts` - Replaced by `useSchemaOrgSEO`

## 🔧 Technical Details

### Before (repetitive pattern)
```ts
const route = useRoute()
const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl || 'https://...'
const canonicalUrl = `${siteUrl}/path`
useSeoMeta({ ... })
useHead({ link: [{ rel: 'canonical', href: canonicalUrl }] })
// + 20 lines of structured data
```

### After (centralized)
```ts
const { siteUrl } = usePageSEO({
  title: 'Page Title',
  description: 'Description',
  path: '/path'
})
const schema = useSchemaOrgSEO()
schema.setCollectionPage('...', '...', canonicalUrl)
```

**Result**: ~40 lines → ~8 lines per page 🎉

## 🔗 Next Steps

After merge:

1. **Submit sitemap to Google Search Console**
   - URL: `https://ousontlesdeveloppeuses.fr/sitemap.xml`
   - [Google Search Console](https://search.google.com/search-console)

2. **Test structured data**
   - [Google Rich Results Test](https://search.google.com/test/rich-results)

3. **Verify social sharing**
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)

4. **Check mobile-friendliness**
   - [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
