import { API_BASE_URL } from "./constants.js";

/** The error body of the REST API: every error has a code, a message and the next step. */
export interface ApiErrorBody {
  error: string;
  message: string;
  next_step?: string;
  [key: string]: unknown;
}

/** Thrown for any answer that is not 2xx. `code` is the API's machine-readable `error` field. */
export class BuzzDealerApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly nextStep: string | undefined;
  readonly body: ApiErrorBody | undefined;

  constructor(status: number, body: ApiErrorBody | undefined, fallbackMessage?: string) {
    super(body?.message ?? fallbackMessage ?? `Request failed with status ${status}`);
    this.name = "BuzzDealerApiError";
    this.status = status;
    this.code = body?.error ?? "http_error";
    this.nextStep = body?.next_step;
    this.body = body;
  }
}

export type Goal = "reputation" | "seo" | "ai_visibility" | "mentions";
export type ProductType = "site" | "pr_package" | "bundle" | "program" | "service";

/** Query of GET /v1/publications. */
export interface FindPublicationsParams {
  product_type?: ProductType;
  category?: string;
  region?: string;
  /** ISO 639-1 code (en, es) or English name (English). */
  language?: string;
  /** Highest price per item, in US cents. */
  max_price_cents?: number;
  dofollow?: boolean;
  /** Lowest DR (Ahrefs), 0 to 100. */
  min_dr?: number;
  query?: string;
  /** 1 to 50; the API's default is 10. */
  limit?: number;
  goal?: Goal;
  /** A goal mix, for example { ai_visibility: 60, seo: 40 }. Sent as ai_visibility:60,seo:40. */
  goal_weights?: Partial<Record<Goal, number>>;
}

/** A catalog item. Key fields only; the API may send more. */
export interface Publication {
  id: string;
  product_type: ProductType;
  name: string;
  domain?: string | null;
  category?: string | null;
  region?: string | null;
  languages?: string[];
  price_cents: number | null;
  price?: string | null;
  currency: "USD";
  ai_score?: number | null;
  tier?: string | null;
  dr?: number;
  dofollow?: boolean | null;
  min_word_count?: number | null;
  max_word_count?: number | null;
  max_links?: number | null;
  [key: string]: unknown;
}

export interface FindPublicationsResult {
  total: number;
  results: Publication[];
  [key: string]: unknown;
}

export interface PublicationResult {
  item: Publication;
  [key: string]: unknown;
}

export interface AiVisibilityScore {
  domain: string;
  rated: boolean;
  ai_score?: number | null;
  tier?: string | null;
  [key: string]: unknown;
}

export interface AiVisibilityScoresResult {
  results: AiVisibilityScore[];
  [key: string]: unknown;
}

/** GET /v1/account: balance, budget frame, pending approvals. The shape is open. */
export type Account = Record<string, unknown>;

export interface BuzzDealerClientOptions {
  /** A personal API key from the dashboard (Connections). */
  apiKey: string;
  /** Defaults to https://api.buzzdealer.ai */
  baseUrl?: string;
  /** Defaults to the global fetch (Node 18+). Pass your own for tests or proxies. */
  fetch?: typeof fetch;
}

export interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
}

/** A thin typed client for the read endpoints of the Buzz Dealer AI REST API. */
export class BuzzDealerClient {
  readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: BuzzDealerClientOptions) {
    if (!options || typeof options.apiKey !== "string" || options.apiKey.trim() === "") {
      throw new TypeError("BuzzDealerClient needs an apiKey (create one in the dashboard under Connections).");
    }
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? API_BASE_URL).replace(/\/+$/, "");
    const f = options.fetch ?? (globalThis as { fetch?: typeof fetch }).fetch;
    if (!f) throw new TypeError("No fetch available: use Node 18 or later, or pass options.fetch.");
    this.fetchImpl = f;
  }

  /** Any endpoint. `path` starts with /v1. Throws BuzzDealerApiError on a non-2xx answer. */
  async request<T = unknown>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(this.baseUrl + (path.startsWith("/") ? path : `/${path}`));
    for (const [k, v] of Object.entries(options.query ?? {})) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
    const headers: Record<string, string> = { accept: "application/json", authorization: `Bearer ${this.apiKey}`, ...options.headers };
    let body: string | undefined;
    if (options.body !== undefined) {
      headers["content-type"] = "application/json";
      body = JSON.stringify(options.body);
    }
    const res = await this.fetchImpl(url.toString(), { method, headers, body });
    const text = await res.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch {
      data = undefined;
    }
    if (!res.ok) {
      const b = data as Partial<ApiErrorBody> | undefined;
      const errBody = b && typeof b === "object" && typeof b.error === "string" ? (b as ApiErrorBody) : undefined;
      throw new BuzzDealerApiError(res.status, errBody, text ? text.slice(0, 200) : undefined);
    }
    return data as T;
  }

  /** GET /v1/account */
  getAccount(params: { brand_id?: string } = {}): Promise<Account> {
    return this.request<Account>("GET", "/v1/account", { query: { brand_id: params.brand_id } });
  }

  /** GET /v1/publications */
  findPublications(params: FindPublicationsParams = {}): Promise<FindPublicationsResult> {
    const { goal_weights, ...rest } = params;
    const query: Record<string, string | number | boolean | undefined> = { ...rest };
    if (goal_weights) {
      query.goal_weights = Object.entries(goal_weights)
        .filter(([, w]) => w !== undefined)
        .map(([g, w]) => `${g}:${w}`)
        .join(",");
    }
    return this.request<FindPublicationsResult>("GET", "/v1/publications", { query });
  }

  /** GET /v1/publications/{item_id} */
  getPublication(itemId: string): Promise<PublicationResult> {
    return this.request<PublicationResult>("GET", `/v1/publications/${encodeURIComponent(itemId)}`);
  }

  /** POST /v1/ai-visibility-scores: reads only (a POST because it takes a list of domains). */
  getAiVisibilityScores(domains: string[]): Promise<AiVisibilityScoresResult> {
    return this.request<AiVisibilityScoresResult>("POST", "/v1/ai-visibility-scores", { body: { domains } });
  }
}
