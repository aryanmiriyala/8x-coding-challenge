# Visual Discovery & Reference Matrix

Status: Captured for Slice 0 / Slice 1 Planning
Date: 2026-09-29

This document serves as the visual and workflow reference matrix for Aster Market, ensuring our implementation aligns with real Amazon.com patterns rather than generic e-commerce templates.

## 1. Homepage & Navigation
**Reference:** [Amazon Homepage Redesign Features](https://www.aboutamazon.com/news/retail/amazon-homepage-redesign-features)

*   **Primary Header (Dark `#131921`)**: Logo, Delivery Context ("Deliver to..."), Dominant Search Bar with category dropdown, Account & Lists hover menu, Returns & Orders, and Cart with item count.
*   **Secondary Navigation (Lighter Dark `#232f3e`)**: "All" hamburger menu, text links for Today's Deals, Customer Service, Registry, Gift Cards, Sell.
*   **Content Strategy**: 
    *   Personalized recommendations.
    *   "Window Display" hero sections.
    *   Product groupings (4-grid tiles).
    *   Horizontal browsing carousels (Buy-again/reordering modules).
    *   Dense information layout, preferring distinct visual blocks over infinite whitespace.

## 2. Search & Category Browsing
*   **Layout**: Left-sidebar filtering (Category, Delivery Day, Customer Reviews, Brands, Price range).
*   **Results**: List or grid view depending on category. Each item includes:
    *   Primary image (white background).
    *   Product title (blue link, multi-line).
    *   Review stars and count.
    *   Price with fractional cents superscript.
    *   Prime/Delivery estimates ("Delivery by tomorrow").
    *   "Add to cart" or variations button directly in search results.

## 3. Product Detail Page (PDP)
**Reference:** [Amazon Product Listings](https://sell.amazon.com/blog/amazon-product-listings)

*   **Left Column**: Image gallery with thumbnails on the far left or bottom, hover-to-zoom on the main image.
*   **Center Column**:
    *   Product Title and Brand link.
    *   Review summary.
    *   Price block (prominent).
    *   Product variations/swatches (Color, Size, Style).
    *   Bullet points (5-6 key features).
*   **Right Column (The Buy Box)**:
    *   Price.
    *   Delivery location and date estimate.
    *   In Stock / Out of Stock status.
    *   Quantity dropdown.
    *   Add to Cart / Buy Now buttons.
    *   Fulfillment details (Ships from, Sold by, Returns).
*   **Below the Fold**: Detailed Product Description, A+ Content, Technical Details, Customer Reviews.

## 4. Shopping Cart
**Reference:** [Amazon Business Cart API Model](https://docs.business.amazon.com/docs/cart-api-v1-reference)

*   **Cart View**:
    *   Item list with thumbnail, title, "In Stock" status, Gift options, and inline Quantity dropdown.
    *   Actions per item: Delete, Save for later, Compare.
*   **Data Model Constraints**:
    *   Item IDs, Buying options (Offer IDs), Quantity, Availability.
    *   Subtotal and charges calculations.
*   **Right Sidebar**: Subtotal (X items), "Proceed to checkout" button, potential cross-sells.

## 5. Checkout Flow
**Reference:** [Amazon Pay Checkout Experience](https://pay.amazon.com/help/201828840)

*   **Isolated Header**: The checkout header removes search and navigation to prevent distraction. Only the logo (linking to home) and secure checkout padlock are shown.
*   **Step 1: Shipping Address**: Select from saved addresses or add a new one.
*   **Step 2: Payment Method**: Select saved cards/wallets (simulated for Aster Market P0).
*   **Step 3: Review items and shipping**: Review the order, select shipping speeds per item/shipment.
*   **Order Summary (Right Sidebar)**: Items subtotal, Shipping & handling, Pre-tax total, Tax, Final Order Total. Prominent "Place your order" button.
*   **Confirmation**: "Thank you, your order has been placed." Order number, delivery estimate, and link to review order details.

## 6. Account Dashboard
*   **Layout**: Grid of tiles (Your Orders, Login & security, Prime, Your Addresses, Payment options).
*   **Your Orders**: Tabbed list (Orders, Buy Again, Not Yet Shipped, Cancelled). Each order block shows Order Placed date, Total, Ship To, Order #, Status (e.g., "Delivered yesterday"), and action buttons (Track package, Return items, Write a product review).
