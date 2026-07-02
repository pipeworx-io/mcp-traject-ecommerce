# mcp-traject-ecommerce

Traject Data ecommerce MCP — Amazon (Rainforest API) + Walmart (BlueCart API)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1209+ live data sources.

## Tools

| Tool | Description |
|------|-------------|

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

Or connect to the full Pipeworx gateway for access to all 1209+ data sources:

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

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
