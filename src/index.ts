interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Traject Data ecommerce MCP — Amazon (Rainforest API) + Walmart (BlueCart API)
 *
 * Provides product, review, and search data for two major retail marketplaces:
 * - Amazon via Rainforest API (api.rainforestapi.com)
 * - Walmart via BlueCart API (api.bluecartapi.com)
 *
 * Both are Traject Data products and share the same `/request?type=...` shape.
 *
 * Auth: BYO-key only, per tool call via `_apiKey`, passed as the `api_key`
 * query param. The two services use SEPARATE keys:
 *   - Amazon tools (amazon_*)  → your Rainforest API key
 *   - Walmart tools (walmart_*) → your BlueCart API key
 * Because `_apiKey` is per-call, you simply pass the key that matches the tool.
 * Get keys at trajectdata.com.
 */


const RAINFOREST_BASE = 'https://api.rainforestapi.com/request';
const BLUECART_BASE = 'https://api.bluecartapi.com/request';

const tools: McpToolExport['tools'] = [
  {
    name: 'amazon_product',
    description:
      'Get Amazon product details by ASIN — title, brand, price, rating, ratings total, bestsellers rank, and image. Uses your Rainforest API key. Example: amazon_product({ asin: "B08N5WRWNW", amazon_domain: "amazon.com", _apiKey: "your-rainforest-key" })',
    inputSchema: {
      type: 'object',
      properties: {
        asin: {
          type: 'string',
          description: 'Amazon Standard Identification Number, e.g. "B08N5WRWNW"',
        },
        amazon_domain: {
          type: 'string',
          description: 'Amazon marketplace domain (default "amazon.com"), e.g. "amazon.co.uk"',
        },
        _apiKey: {
          type: 'string',
          description: 'Your Rainforest API key (get one at trajectdata.com) — passed as the api_key query param',
        },
      },
      required: ['asin', '_apiKey'],
    },
  },
  {
    name: 'amazon_reviews',
    description:
      'Get customer reviews for an Amazon product by ASIN — title, body, rating, date, verified-purchase flag, and helpful votes. Uses your Rainforest API key. Example: amazon_reviews({ asin: "B08N5WRWNW", amazon_domain: "amazon.com", _apiKey: "your-rainforest-key" })',
    inputSchema: {
      type: 'object',
      properties: {
        asin: {
          type: 'string',
          description: 'Amazon Standard Identification Number, e.g. "B08N5WRWNW"',
        },
        amazon_domain: {
          type: 'string',
          description: 'Amazon marketplace domain (default "amazon.com")',
        },
        _apiKey: {
          type: 'string',
          description: 'Your Rainforest API key (get one at trajectdata.com)',
        },
      },
      required: ['asin', '_apiKey'],
    },
  },
  {
    name: 'amazon_search',
    description:
      'Search Amazon products by keyword — returns position, title, ASIN, price, rating, and ratings total. Uses your Rainforest API key. Example: amazon_search({ search_term: "wireless earbuds", amazon_domain: "amazon.com", _apiKey: "your-rainforest-key" })',
    inputSchema: {
      type: 'object',
      properties: {
        search_term: {
          type: 'string',
          description: 'Search query, e.g. "wireless earbuds"',
        },
        amazon_domain: {
          type: 'string',
          description: 'Amazon marketplace domain (default "amazon.com")',
        },
        _apiKey: {
          type: 'string',
          description: 'Your Rainforest API key (get one at trajectdata.com)',
        },
      },
      required: ['search_term', '_apiKey'],
    },
  },
  {
    name: 'walmart_product',
    description:
      'Get Walmart product details by item ID — title, brand, price, rating, ratings total, and image. Uses your BlueCart API key. Example: walmart_product({ item_id: "967006046", _apiKey: "your-bluecart-key" })',
    inputSchema: {
      type: 'object',
      properties: {
        item_id: {
          type: 'string',
          description: 'Walmart item ID, e.g. "967006046"',
        },
        _apiKey: {
          type: 'string',
          description: 'Your BlueCart API key (get one at trajectdata.com) — passed as the api_key query param',
        },
      },
      required: ['item_id', '_apiKey'],
    },
  },
  {
    name: 'walmart_reviews',
    description:
      'Get customer reviews for a Walmart product by item ID — title, body, rating, date, and verified-purchase flag. Uses your BlueCart API key. Example: walmart_reviews({ item_id: "967006046", _apiKey: "your-bluecart-key" })',
    inputSchema: {
      type: 'object',
      properties: {
        item_id: {
          type: 'string',
          description: 'Walmart item ID, e.g. "967006046"',
        },
        _apiKey: {
          type: 'string',
          description: 'Your BlueCart API key (get one at trajectdata.com)',
        },
      },
      required: ['item_id', '_apiKey'],
    },
  },
  {
    name: 'walmart_search',
    description:
      'Search Walmart products by keyword — returns position, title, item ID, price, rating, and ratings total. Uses your BlueCart API key. Example: walmart_search({ search_term: "coffee maker", _apiKey: "your-bluecart-key" })',
    inputSchema: {
      type: 'object',
      properties: {
        search_term: {
          type: 'string',
          description: 'Search query, e.g. "coffee maker"',
        },
        _apiKey: {
          type: 'string',
          description: 'Your BlueCart API key (get one at trajectdata.com)',
        },
      },
      required: ['search_term', '_apiKey'],
    },
  },
];

interface TrajectResponse {
  request_info?: {
    success?: boolean;
    message?: string;
  };
  product?: Record<string, unknown>;
  reviews?: Array<Record<string, unknown>>;
  search_results?: Array<Record<string, unknown>>;
  ratings_total?: number;
}

// Shared GET helper. Builds `${base}?api_key=...&type=...&...`, throws actionable
// errors on HTTP failures and on Traject's `request_info.success === false`.
async function trajectGet(
  base: string,
  params: Record<string, string>,
  apiKey: string,
  tool: string,
): Promise<TrajectResponse> {
  const search = new URLSearchParams({ ...params, api_key: apiKey });
  const res = await fetch(`${base}?${search}`);
  if (!res.ok) {
    throw new Error(`${tool} error: HTTP ${res.status}`);
  }
  const data = (await res.json()) as TrajectResponse;
  if (data.request_info?.success === false) {
    throw new Error(`Traject ${tool}: ${data.request_info?.message ?? 'request failed'}`);
  }
  return data;
}

function truncate(text: unknown, max = 400): string | null {
  if (typeof text !== 'string') return null;
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function requireAmazonKey(apiKey: string, tool: string): void {
  if (!apiKey) {
    throw new Error(
      `${tool} requires an Amazon (Rainforest) API key. Pass your Rainforest API key via _apiKey, get one at trajectdata.com.`,
    );
  }
}

function requireWalmartKey(apiKey: string, tool: string): void {
  if (!apiKey) {
    throw new Error(
      `${tool} requires a Walmart (BlueCart) API key. Pass your BlueCart API key via _apiKey, get one at trajectdata.com.`,
    );
  }
}

// ---- Amazon (Rainforest) -------------------------------------------------

async function amazonProduct(args: Record<string, unknown>, apiKey: string) {
  requireAmazonKey(apiKey, 'amazon_product');
  const asin = args.asin as string;
  if (!asin) throw new Error('amazon_product requires an `asin` (e.g. "B08N5WRWNW").');
  const amazon_domain = (args.amazon_domain as string) ?? 'amazon.com';

  const data = await trajectGet(
    RAINFOREST_BASE,
    { type: 'product', asin, amazon_domain },
    apiKey,
    'amazon_product',
  );

  const product = asRecord(data.product);
  const buybox = asRecord(product.buybox_winner);
  const buyboxPrice = asRecord(buybox.price);
  const productPrice = asRecord(product.price);
  const mainImage = asRecord(product.main_image);

  return {
    title: (product.title as string) ?? null,
    asin: (product.asin as string) ?? asin,
    brand: (product.brand as string) ?? null,
    price: (buyboxPrice.value as number) ?? (productPrice.value as number) ?? null,
    currency: (buyboxPrice.currency as string) ?? (productPrice.currency as string) ?? null,
    rating: (product.rating as number) ?? null,
    ratings_total: (product.ratings_total as number) ?? null,
    link: (product.link as string) ?? null,
    bestsellers_rank: product.bestsellers_rank ?? null,
    main_image: (mainImage.link as string) ?? null,
  };
}

async function amazonReviews(args: Record<string, unknown>, apiKey: string) {
  requireAmazonKey(apiKey, 'amazon_reviews');
  const asin = args.asin as string;
  if (!asin) throw new Error('amazon_reviews requires an `asin` (e.g. "B08N5WRWNW").');
  const amazon_domain = (args.amazon_domain as string) ?? 'amazon.com';

  const data = await trajectGet(
    RAINFOREST_BASE,
    { type: 'reviews', asin, amazon_domain },
    apiKey,
    'amazon_reviews',
  );

  const reviews = (data.reviews ?? []).map((r) => {
    const rev = asRecord(r);
    const date = asRecord(rev.date);
    return {
      title: (rev.title as string) ?? null,
      body: truncate(rev.body),
      rating: (rev.rating as number) ?? null,
      date: (date.utc as string) ?? (date.raw as string) ?? null,
      verified_purchase: (rev.verified_purchase as boolean) ?? null,
      helpful_votes: (rev.helpful_votes as number) ?? null,
    };
  });

  return {
    asin,
    ratings_total: data.ratings_total ?? null,
    count: reviews.length,
    reviews,
  };
}

async function amazonSearch(args: Record<string, unknown>, apiKey: string) {
  requireAmazonKey(apiKey, 'amazon_search');
  const search_term = args.search_term as string;
  if (!search_term) throw new Error('amazon_search requires a `search_term` (e.g. "wireless earbuds").');
  const amazon_domain = (args.amazon_domain as string) ?? 'amazon.com';

  const data = await trajectGet(
    RAINFOREST_BASE,
    { type: 'search', search_term, amazon_domain },
    apiKey,
    'amazon_search',
  );

  const results = (data.search_results ?? []).map((s) => {
    const item = asRecord(s);
    const price = asRecord(item.price);
    return {
      position: (item.position as number) ?? null,
      title: (item.title as string) ?? null,
      asin: (item.asin as string) ?? null,
      price: (price.value as number) ?? null,
      rating: (item.rating as number) ?? null,
      ratings_total: (item.ratings_total as number) ?? null,
      link: (item.link as string) ?? null,
    };
  });

  return { search_term, count: results.length, results };
}

// ---- Walmart (BlueCart) --------------------------------------------------

async function walmartProduct(args: Record<string, unknown>, apiKey: string) {
  requireWalmartKey(apiKey, 'walmart_product');
  const item_id = args.item_id as string;
  if (!item_id) throw new Error('walmart_product requires an `item_id` (e.g. "967006046").');

  const data = await trajectGet(
    BLUECART_BASE,
    { type: 'product', item_id },
    apiKey,
    'walmart_product',
  );

  const product = asRecord(data.product);
  const price = asRecord(product.buybox_winner ? asRecord(product.buybox_winner).price : product.price);
  const mainImage = asRecord(product.main_image);

  return {
    title: (product.title as string) ?? null,
    item_id: (product.item_id as string) ?? item_id,
    brand: (product.brand as string) ?? null,
    price: (price.value as number) ?? (product.price as number) ?? null,
    rating: (product.rating as number) ?? null,
    ratings_total: (product.ratings_total as number) ?? null,
    link: (product.link as string) ?? null,
    main_image: (mainImage.link as string) ?? (product.main_image as string) ?? null,
  };
}

async function walmartReviews(args: Record<string, unknown>, apiKey: string) {
  requireWalmartKey(apiKey, 'walmart_reviews');
  const item_id = args.item_id as string;
  if (!item_id) throw new Error('walmart_reviews requires an `item_id` (e.g. "967006046").');

  const data = await trajectGet(
    BLUECART_BASE,
    { type: 'reviews', item_id },
    apiKey,
    'walmart_reviews',
  );

  const reviews = (data.reviews ?? []).map((r) => {
    const rev = asRecord(r);
    const date = asRecord(rev.date);
    return {
      title: (rev.title as string) ?? null,
      body: truncate(rev.body),
      rating: (rev.rating as number) ?? null,
      date: (date.utc as string) ?? (date.raw as string) ?? (rev.date as string) ?? null,
      verified_purchase: (rev.verified_purchase as boolean) ?? null,
    };
  });

  return {
    item_id,
    ratings_total: data.ratings_total ?? null,
    count: reviews.length,
    reviews,
  };
}

async function walmartSearch(args: Record<string, unknown>, apiKey: string) {
  requireWalmartKey(apiKey, 'walmart_search');
  const search_term = args.search_term as string;
  if (!search_term) throw new Error('walmart_search requires a `search_term` (e.g. "coffee maker").');

  const data = await trajectGet(
    BLUECART_BASE,
    { type: 'search', search_term },
    apiKey,
    'walmart_search',
  );

  const results = (data.search_results ?? []).map((s) => {
    const item = asRecord(s);
    const price = asRecord(item.price);
    return {
      position: (item.position as number) ?? null,
      title: (item.title as string) ?? null,
      item_id: (item.item_id as string) ?? null,
      price: (price.value as number) ?? (item.price as number) ?? null,
      rating: (item.rating as number) ?? null,
      ratings_total: (item.ratings_total as number) ?? null,
      link: (item.link as string) ?? null,
    };
  });

  return { search_term, count: results.length, results };
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = (args._apiKey as string) ?? '';
  delete args._apiKey;

  switch (name) {
    case 'amazon_product':
      return amazonProduct(args, apiKey);
    case 'amazon_reviews':
      return amazonReviews(args, apiKey);
    case 'amazon_search':
      return amazonSearch(args, apiKey);
    case 'walmart_product':
      return walmartProduct(args, apiKey);
    case 'walmart_reviews':
      return walmartReviews(args, apiKey);
    case 'walmart_search':
      return walmartSearch(args, apiKey);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// BYO-key only — the user's own Rainforest/BlueCart key bears Traject COGS.
export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
