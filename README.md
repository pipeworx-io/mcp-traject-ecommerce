# mcp-traject-ecommerce

Traject Data ecommerce MCP — Amazon (Rainforest API) + Walmart (BlueCart API)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `amazon_product` | Get Amazon product details by ASIN — title, brand, price, rating, ratings total, bestsellers rank, and image. Uses your Rainforest API key. Example: amazon_product({ asin: "B08N5WRWNW", amazon_domain: "amazon.com", _apiKey: "your-rainforest-key" }) |
| `amazon_reviews` | Get customer reviews for an Amazon product by ASIN — title, body, rating, date, verified-purchase flag, and helpful votes. Uses your Rainforest API key. Example: amazon_reviews({ asin: "B08N5WRWNW", amazon_domain: "amazon.com", _apiKey: "your-rainforest-key" }) |
| `amazon_search` | Search Amazon products by keyword — returns position, title, ASIN, price, rating, and ratings total. Uses your Rainforest API key. Example: amazon_search({ search_term: "wireless earbuds", amazon_domain: "amazon.com", _apiKey: "your-rainforest-key" }) |
| `walmart_product` | Get Walmart product details by item ID — title, brand, price, rating, ratings total, and image. Uses your BlueCart API key. Example: walmart_product({ item_id: "967006046", _apiKey: "your-bluecart-key" }) |
| `walmart_reviews` | Get customer reviews for a Walmart product by item ID — title, body, rating, date, and verified-purchase flag. Uses your BlueCart API key. Example: walmart_reviews({ item_id: "967006046", _apiKey: "your-bluecart-key" }) |
| `walmart_search` | Search Walmart products by keyword — returns position, title, item ID, price, rating, and ratings total. Uses your BlueCart API key. Example: walmart_search({ search_term: "coffee maker", _apiKey: "your-bluecart-key" }) |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "traject-ecommerce": {
      "url": "https://gateway.pipeworx.io/traject-ecommerce/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Traject Ecommerce data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
