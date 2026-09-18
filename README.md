# mcp-traject-ecommerce

Traject Data ecommerce MCP — Amazon (Rainforest API) + Walmart (BlueCart API)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/traject-ecommerce/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Traject Ecommerce data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

## No MCP client? Call it over HTTP

This pack takes your own API key (`_apiKey`) — we don't front one for it, so there's no curl here that would run without it. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/amazon_product`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.
