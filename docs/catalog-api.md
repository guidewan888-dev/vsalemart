# V SALE Catalog API

The public catalog API reads active products from Supabase. It never exposes database credentials.

## List products

`GET /api/products`

Query parameters:

| Parameter | Default | Description |
| --- | ---: | --- |
| `page` | `1` | Page number |
| `limit` | `24` | Rows per page, maximum 100 |
| `q` | | Product name search |
| `category` | | V SALE category slug |

Example:

```text
GET https://vsalemart.com/api/products?q=ปากกา&category=stationery&page=1&limit=24
```

## Product detail

`GET /api/products/{id-or-slug}`

The response includes images, variants, SKU, prices, stock, size, weight, shipping flags, Shopee source ID, and the Shopee purchase URL.

```text
GET https://vsalemart.com/api/products/shopee-58157449407
```

## Refreshing the Shopee snapshot

1. Export the five batch-edit workbooks from Shopee Seller Centre: basic, sales, shipping, days-to-ship, and media.
2. Put them under `data/shopee-export/YYYY-MM-DD/`.
3. Run `python scripts/build-shopee-catalog.py --source data/shopee-export/YYYY-MM-DD --output supabase/migrations/TIMESTAMP_import_shopee_catalog.sql`.
4. Review the generated counts, then run `npx supabase db push`.

The import is idempotent by Shopee product ID. Products without price, stock, or a cover image remain stored for administration but are not returned by the public API.
