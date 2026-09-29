# Amazon-Inspired Quality Reference

Status: Living design and implementation guardrail
Last updated: 2026-09-29

## Purpose

This file is the local reference pack for avoiding generic AI-generated product design. Aster Market should feel like a credible Amazon.com-style shopping application: dense, useful, transactional, and familiar. It should not feel like a SaaS landing page, a portfolio template, or a decorative demo with commerce text pasted on top.

This is not permission to copy Amazon trademarks, logos, proprietary images, customer content, or exact owned copy. We can mirror public interaction patterns and information hierarchy while using original branding, original or licensed product images, and our own wording.

## Reference Sources

- Observation: Amazon's own homepage write-up emphasizes personalized recommendations, product groupings, horizontal browsing, reordering, deals, and fast navigation as the homepage experience.
  Source: https://www.aboutamazon.com/news/retail/amazon-homepage-redesign-features
- Observation: Amazon describes product listings as a product detail page plus one or more seller offers. Detail pages include identity, images, description, bullets, product details, price, condition, quantity, and fulfillment information.
  Source: https://sell.amazon.com/blog/amazon-product-listings
- Observation: Ecommerce product pages need detailed images, consistent navigation/search, scannable details, and robust reviews that expose positive and negative evidence.
  Source: https://www.nngroup.com/articles/ecommerce-product-pages/
- Observation: Ecommerce search and listing pages need useful search, filtering, sorting, category browsing, and ways to reduce choice overload.
  Sources: https://www.nngroup.com/reports/ecommerce-ux-search-including-faceted-search/ and https://www.nngroup.com/articles/ecommerce-homepages-listing-pages/
- Requirement: Accessibility implementation should target WCAG 2.2 AA where practical, including visible focus, minimum target sizing, contrast, semantic relationships, keyboard operation, and error prevention.
  Source: https://www.w3.org/TR/WCAG22/
- Provider note: Neon Object Storage is branch-aware and S3-compatible; bucket visibility is configured through Neon rather than S3 ACL mutation.
  Source: https://neon.com/blog/building-neon-object-storage

## Anti-Slop Rules

- Do not build a marketing homepage as the first screen. The first screen is the store: header, location/delivery cue, search, category nav, merchandising modules, deal cards, and product recommendations.
- Do not use generic hero gradients, floating glass cards, decorative blobs, oversized inspirational copy, fake metrics, or "AI-powered shopping" banners unless a real feature needs them.
- Do not use Amazon branding, logos, "Prime" branding, proprietary screenshots, scraped customer reviews, or real Amazon product images in shipped UI.
- Do not ship lorem ipsum, generic product names, one-line descriptions, or AI-looking product grids with identical cards. Seed data must include realistic categories, variants, prices, ratings, inventory states, delivery estimates, and edge cases.
- Do not make everything rounded and spacious. Amazon-like retail UI is compact, information-heavy, and optimized for scanning.
- Do not bury commerce actions. Add to cart, buy-now-style simulated order actions, quantity, delivery, stock, and returns/support context should be close to the offer.
- Do not trust client state for visible totals, discounts, inventory, ownership, auth state, or checkout result. Visual polish must sit on top of server-authoritative behavior.

## Structure To Match Closely

Header:

- Dark primary header, dense secondary nav, dominant search input, category selector, delivery/location affordance, account/lists, returns/orders, and cart.
- Mobile keeps search first, with drawer navigation and tappable account/cart controls. Avoid hiding cart behind a generic hamburger.

Homepage:

- Merchandising-first layout with category cards, deal rows, recommendation rows, and "continue/buy again" style modules once signed in.
- Use horizontal product strips sparingly and make them keyboard-scrollable.
- Show a hint of the next section above the fold; avoid a full-viewport splash.

Search/results:

- Desktop: left filter rail, top result count/sort, list or grid product cards, sponsored/organic distinction if sponsored items exist.
- Mobile: sticky compact filter/sort controls, result count, scannable cards with image, title, rating count, price, delivery, availability, and add-to-cart where appropriate.
- Empty and low-result states should suggest category/query recovery, not just "no results."

Product detail page:

- Image gallery left, title/rating/brand and details center, offer/action box right on desktop.
- Variant selectors, price, discount explanation, stock, delivery estimate, quantity, add-to-cart, simulated-buy action, returns/support cue, and seller/fulfillment context must be visible without hunting.
- Bullets are concrete product attributes. Specifications are tabular. Reviews support sorting/filtering and show negative evidence as well as positive evidence.

Cart and checkout:

- Cart preserves item order and comparison context. Avoid surprising auto-reordering.
- Checkout is a step flow: sign-in, address, delivery, review, simulated placement. No card form in P0.
- Order summary is server-derived and sticky on desktop, with accessible disclosure on mobile.

Account:

- Account hub uses simple list/grid navigation for orders, addresses, lists, security, and customer-service-like flows. It should feel utilitarian rather than editorial.

## Style Tokens

Use semantic tokens so we can tune exact color later. Initial Amazon-inspired direction:

| Token | Initial value | Use |
| --- | --- | --- |
| `--surface-page` | `#eaeded` | Page background behind modules |
| `--surface-card` | `#ffffff` | Product cards, account panels, checkout sections |
| `--ink-header` | `#131921` | Primary header |
| `--ink-nav` | `#232f3e` | Secondary navigation |
| `--accent-search` | `#febd69` | Search submit and warm commerce accents |
| `--accent-action` | `#ffd814` | Primary commerce action |
| `--accent-action-strong` | `#ffa41c` | Buy-now-style simulated action, stars |
| `--link-commerce` | `#007185` | Product links and secondary commerce links |
| `--deal` | `#cc0c39` | Deal/discount emphasis |
| `--success` | `#007600` | In-stock and success states |
| `--border-subtle` | `#d5d9d9` | Dividers and card borders |
| `--focus-ring` | `#f90` | Keyboard focus where contrast passes |

Interaction and spacing:

- Card radius max: 8 px.
- Header/search controls should feel tight and high-utility, not pill-heavy.
- Product grid cards need stable image boxes, title line clamps, price baselines, and no layout shift on hover.
- Buttons should be obvious commerce controls. Use text buttons for commerce actions; use icons for header/search/cart/filter controls when the meaning is familiar.
- Use real loading, empty, error, disabled, and optimistic/pending states for every flow we demo.

## Implementation QA Gate

Every visual slice should include:

- Desktop and mobile Playwright screenshots at 360 px, 768 px, and 1280 px.
- Keyboard-only pass through header search, filters, product cards, cart, and checkout controls.
- Axe or equivalent accessibility scan when the scaffold exists.
- A manual comparison against the reference structure above, with notes when we deliberately diverge.
- Evidence that seeded images are original/licensed/generated for this project and loaded from the planned asset source.
- A check that product cards, buttons, and checkout summaries do not overflow or overlap at supported widths.

## Asset Storage Direction

- `catalog-assets` (`public_read`) holds generated/licensed product images, category art, and merchandising media that can be safely public.
- `private-uploads` (`private`) holds source images, generated originals, import files, admin uploads, and any future user-submitted content before moderation.
- Product image metadata belongs in PostgreSQL; object bodies belong in Neon Object Storage only when runtime storage is active.
