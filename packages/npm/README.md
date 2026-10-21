# buzzdealer-ai

Connect your AI assistant or coding agent to [Buzz Dealer AI](https://buzzdealer.ai): the **Press Room** for PR and press release distribution through newswires, PR distribution packages and news sites, and the **Reputation Agent** for how Google and AI assistants describe you and your company.

The server is remote: `https://mcp.buzzdealer.ai/mcp` (streamable HTTP, OAuth sign-in, or a personal API key as `Authorization: Bearer <key>`). This package only helps you add it, and gives you a small typed client for the read endpoints of the REST API. No runtime dependencies. Node 18 or later.

## CLI

```
npx buzzdealer-ai connect            # print the connect steps for every client
npx buzzdealer-ai add claude-code    # print, then run: claude mcp add --transport http buzzdealer-ai https://mcp.buzzdealer.ai/mcp
npx buzzdealer-ai add cursor         # add the server to ~/.cursor/mcp.json
npx buzzdealer-ai add vscode         # add the server to .vscode/mcp.json in this folder
npx buzzdealer-ai help
```

- `add cursor` and `add vscode` create the file if it is missing, keep every other server and setting, and print what they changed.
- `--dry-run` prints what would change or run, and changes nothing.
- `--file <path>` uses another config file.
- `add claude-code` always prints the command before it runs it, and runs it only when `claude` is on your PATH.

After adding the server, sign in when your client asks. Step by step for every client: https://buzzdealer.ai/connect

## Client

```ts
import { BuzzDealerClient, BuzzDealerApiError } from "buzzdealer-ai";

const bd = new BuzzDealerClient({ apiKey: process.env.BUZZDEALER_API_KEY! });

const account = await bd.getAccount();
const { results } = await bd.findPublications({ product_type: "pr_package", region: "UK", limit: 5 });
const one = await bd.getPublication(results[0].id);
const scores = await bd.getAiVisibilityScores(["northwind.example"]);

try {
  await bd.request("GET", "/v1/orders");
} catch (e) {
  if (e instanceof BuzzDealerApiError) console.error(e.status, e.code, e.message, e.nextStep);
}
```

| Method | Endpoint |
| --- | --- |
| `getAccount({ brand_id? })` | `GET /v1/account` |
| `findPublications(params)` | `GET /v1/publications` |
| `getPublication(itemId)` | `GET /v1/publications/{item_id}` |
| `getAiVisibilityScores(domains)` | `POST /v1/ai-visibility-scores` (reads only) |
| `request(method, path, { query, body })` | any endpoint |

Options: `apiKey` (required; the account owner creates keys in the dashboard under Connections), `baseUrl` (default `https://api.buzzdealer.ai`), `fetch` (default: the global fetch).

The typed methods only read. Orders go through `quote_order` and `place_order` (or `POST /v1/quotes` and `POST /v1/orders`): quote first, wait for the person's yes to the total, then order with `confirm: true`. Orders use the account's existing balance; agents cannot pay.

Full API: https://buzzdealer.ai/docs and https://buzzdealer.ai/openapi.json

## Licence

MIT. The Buzz Dealer AI service has its own terms: https://buzzdealer.ai/terms
