-- CreateEnum
CREATE TYPE "CartStatus" AS ENUM ('OPEN', 'MERGED', 'CHECKED_OUT', 'EXPIRED');

-- CreateTable
CREATE TABLE "customer_profile" (
    "auth_user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "customer_profile_pkey" PRIMARY KEY ("auth_user_id")
);

-- CreateTable
CREATE TABLE "cart" (
    "id" UUID NOT NULL,
    "user_id" TEXT,
    "guest_token_hash" TEXT,
    "status" "CartStatus" NOT NULL DEFAULT 'OPEN',
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "version" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_item" (
    "id" UUID NOT NULL,
    "cart_id" UUID NOT NULL,
    "offer_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cart_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cart_guest_token_hash_key" ON "cart"("guest_token_hash");

-- CreateIndex
CREATE INDEX "cart_user_id_idx" ON "cart"("user_id");

-- CreateIndex
CREATE INDEX "cart_guest_token_hash_idx" ON "cart"("guest_token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "cart_item_cart_id_offer_id_key" ON "cart_item"("cart_id", "offer_id");

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
