# ADR-002: Separate product, variant, offer, and inventory

Status: accepted
Date: 2026-09-28
Decision needed by: Slice 1 schema

## Context and problem

Amazon is a marketplace: one catalog product can have variants and multiple seller offers with different commercial and fulfillment terms. The first demo may have one seller, but a single `Product` table containing price and stock would entangle identity, merchandising, and supply.

## Decision drivers

- Correct variant selection and cart lines.
- Future multi-seller growth without an order rewrite.
- Inventory and price belong to a purchasable offer, not descriptive content.
- Avoid unnecessary enterprise complexity in the initial schema.

## Options considered

### One product row with price and stock

Fastest initial CRUD, but cannot represent variants/offers cleanly and makes historical/order semantics ambiguous.

### Product → Variant → Offer → Inventory

More joins and seed work, but aligns with established commerce models and keeps responsibilities clear.

### Fully generic PIM/attribute/pricing engine

Extremely flexible, but excessive for the current use cases and time constraint.

## Decision outcome

Use the middle option with a deliberately small attribute model. Seed one platform seller initially. Avoid promotion/tax/location abstractions until a use case needs them.

## Consequences

- Cart lines reference offers; order lines snapshot product/variant/offer facts.
- Search/PDP queries require composed DTOs and appropriate indexes.
- Multiple sellers and fulfillment methods become additive.

## Validation and revisit triggers

- Validate query ergonomics and seed complexity in Slice 1.
- Simplify only if the separation creates cost without representing an active or near-term use case.
- Expand attribute/pricing models only when real category or regional examples demand it.

## Links

- UC-DISC-01, UC-CART-01, UC-CHECK-01
- [Amazon product details and offers](https://sell.amazon.com/blog/amazon-product-listings)
- [Shopify product variants](https://shopify.dev/docs/storefronts/themes/architecture/templates/product/overview)
- [Medusa product variant inventory](https://docs.medusajs.com/resources/commerce-modules/product/variant-inventory)
