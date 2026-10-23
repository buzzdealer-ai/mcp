# Buzz Dealer AI MCP server

PR and press release distribution, and reputation, from ChatGPT, Claude and other AI assistants. Buzz Dealer AI gives your assistant two things: a **Press Room** for press release distribution through newswires (including PR Newswire packages), PR distribution packages and news sites that publish your article or press release, and a **Reputation Agent** that scans what Google, AI assistants and the web say about you or your company, asks what it cannot know, and shows the gaps and the steps that help.

**Connector address:** https://mcp.buzzdealer.ai/mcp (remote MCP server, streamable HTTP)
**Sign-in:** OAuth 2.1. Agents that cannot do OAuth can use a personal API key as a Bearer token.
**Setup guide:** https://buzzdealer.ai/connect
**Pricing:** https://buzzdealer.ai/pricing
**Support:** support@buzzdealer.ai

**Access:** the Reputation Agent is open to everyone. The Press Room is in private beta: request an invite at https://buzzdealer.ai/beta.
**Before signing in:** two read-only tools work without an account, `check_company_presence` (a light check of a company's own home page and Wikidata) and `get_ai_visibility_score`. Everything else asks you to sign in.

This repository is the public listing for the hosted server. It has no server code.

**Directories:** listed in the [official MCP Registry](https://registry.modelcontextprotocol.io/) as `io.github.buzzdealer-ai/mcp`. Maintainer of this listing: [@uri-bd](https://github.com/uri-bd) (see `glama.json`).

## Add it to your assistant

### Claude (web, desktop and mobile)

1. Open Customize, then Connectors. Click +, then Add custom connector.
2. Name it Buzz Dealer AI and paste `https://mcp.buzzdealer.ai/mcp`.
3. Keep the sign-in settings Claude suggests, click Add, then Connect.
4. Sign in and approve.

On Team and Enterprise, an owner adds the connector first under Organization settings, Connectors; members then click Connect.

### Claude Code

```
claude mcp add --transport http buzzdealer-ai https://mcp.buzzdealer.ai/mcp
```

Then type `/mcp` and sign in.

### ChatGPT

1. On Business, Enterprise or Edu, a workspace admin first turns on developer mode under Workspace settings, Permissions and roles.
2. In ChatGPT on the web, open Settings, Apps, Advanced settings and turn on developer mode.
3. Click Create, name it Buzz Dealer AI and paste `https://mcp.buzzdealer.ai/mcp`.
4. Choose OAuth, confirm you trust the app, then Create.
5. Sign in and approve. In a chat, choose developer mode and turn on Buzz Dealer AI.

### Gemini

- **Gemini app:** Settings, Connected Apps, Add a custom app, paste the address, then sign in.
- **Gemini CLI:** `gemini mcp add --transport http buzzdealer-ai https://mcp.buzzdealer.ai/mcp`

### Cursor, VS Code and other MCP clients

Add a server named `buzzdealer-ai` with the address `https://mcp.buzzdealer.ai/mcp`, then sign in when asked. For a `mcp.json` file:

```json
{
  "mcpServers": {
    "buzzdealer-ai": { "url": "https://mcp.buzzdealer.ai/mcp" }
  }
}
```

Guides for Grok, Perplexity, OpenClaw, Hermes, Manus, Lindy, Genspark, Devin and Meta Muse are on https://buzzdealer.ai/connect.

## For coding agents, plugins and packages

- **AGENTS.md:** [AGENTS.md](AGENTS.md) tells coding agents how to connect, which tools there are and the safe order for anything that spends. Example configs: [.cursor/mcp.json](.cursor/mcp.json) and [.vscode/mcp.json](.vscode/mcp.json).
- **Claude Code plugin:** this repository is also a plugin ([.claude-plugin/plugin.json](.claude-plugin/plugin.json), with the server in [.mcp.json](.mcp.json) and the agent skill). Install it with:
  ```
  /plugin install buzzdealer-ai --marketplace buzzdealer-ai/mcp
  ```
  On an older Claude Code: `/plugin marketplace add buzzdealer-ai/mcp`, then `/plugin install buzzdealer-ai@buzzdealer-ai`.
- **Agent Plugins:** [plugin.json](plugin.json) at the root follows the Agent Plugins manifest (`$schema` https://agent-plugins.org/schemas/1.0.0/plugin.schema.json), with the skill in [skills/](skills) and the server in [.mcp.json](.mcp.json).
- **Agent skill:** [skills/buzzdealer-ai/SKILL.md](skills/buzzdealer-ai/SKILL.md), the order flow and the rules. On skills.sh, once this repository is public, the expected command is `npx skills add buzzdealer-ai/mcp`.
- **npm package (not yet published):** [packages/npm](packages/npm), `npx buzzdealer-ai add cursor`, `add vscode` or `add claude-code`, plus a small typed client for the REST API.
- **MCP Registry:** `io.github.buzzdealer-ai/mcp`, see https://registry.modelcontextprotocol.io/v0/servers?search=io.github.buzzdealer-ai/mcp
- **Developers:** every link (MCP server, REST API, OpenAPI spec, sign-in and scopes, API keys) on one page: https://buzzdealer.ai/developers

### Two Registry entries

`server.json` is published as `io.github.buzzdealer-ai/mcp` (GitHub sign-in, automatic on a change). `server.domain.json` is the same server under our own domain, `ai.buzzdealer/mcp`, verified over HTTP: the public key is served at https://buzzdealer.ai/.well-known/mcp-registry-auth and the private key is only the `MCP_REGISTRY_PRIVATE_KEY` Actions secret. It is published by hand (Actions, "Publish to the MCP Registry", tick "domain entry"). The Registry allows one server name per remote URL, so the domain entry can be published only once the address is not held by the other entry.

## Example prompts

- Run the reputation radar on my own name
- What should I fix first?
- Send this press release to a UK finance newswire
- Find a PR distribution package for my product announcement
- Plan a PR campaign within a budget around our funding round
- Which Buzz Dealer AI account is this connection using?
- Alert me on new reviews and mentions

## Tools

### Read only

| Tool | What it does |
| --- | --- |
| find_publications | Finds newswire packages, PR distribution packages and news sites in the Press Room |
| get_publication | Shows one publication: price, audience, rules and turnaround |
| plan_campaign | Plans a campaign within a budget |
| get_ai_visibility_score | Shows how visible a news site in the catalog is to AI assistants (beta; works before signing in) |
| check_originality_and_fit | Checks a text before it is ordered |
| get_order_status | Shows where an order is |
| get_report | Shows a report |
| get_account_status | Shows the account, balance and limits |
| get_linked_account | Shows which account this connection uses: name, plan and balance |
| check_company_presence | A light check of a company's own home page and Wikidata (works before signing in) |
| get_radar_status | Reads a reputation scan as it runs |
| get_questions | Gets the next question the agent cannot answer alone |
| get_gaps | Lists the gaps found and the fixes for each |
| plan_fixes | Same as get_gaps |
| get_progress | Shows progress against the first scan |
| what_changed | Shows what changed since the last scan |
| get_playbook | Gets the Reputation Agent playbook |
| check_request | Checks whether a request is one we can help with |
| get_reputation_profile | Shows the saved profile |

### Change data

| Tool | What it does |
| --- | --- |
| start_radar | Starts a reputation scan |
| quote_order | Quotes an order and holds the price; nothing is charged |
| start_fix | Starts a fix and shows its steps |
| radar_scan | Same as start_radar |
| answer_question | Answers a question ("this is mine", "this is about me", "not me") |
| confirm_statement | Same as answer_question |
| set_preferences | Saves preferences |
| update_reputation_profile | Updates the saved profile |
| mark_fix_done | Marks a fix done and checks it on the next scan |
| rate_fix | Records whether a fix worked |

### Spend credits (the assistant confirms with you first)

| Tool | What it does |
| --- | --- |
| place_order | Places a quoted order; credits are reserved and charged only when published |
| respond_to_replacement | Accepts or declines a replacement site |
| order_audit | Orders a research report with a PDF |

## Prompts

The server also offers five prompts: send a press release to a newswire, find a PR distribution package, how AI assistants describe my company, what changed since the last scan, and plan a PR campaign within a budget. Each one quotes first and orders nothing without your yes.

## Pricing

Every order is quoted first, and the assistant asks you before anything that spends credits. An item is charged only when it is published; if it is not published, the credits come back. Credits are added by a person in the Buzz Dealer AI dashboard, never in the chat. Plans and prices: https://buzzdealer.ai/pricing

## Privacy and terms

Buzz Dealer AI receives only what your assistant sends to its tools, never your other chats. No account ever sees another account's data.

- Privacy: https://buzzdealer.ai/privacy
- Terms: https://buzzdealer.ai/terms
- Refund policy: https://buzzdealer.ai/refund-policy
- Security: https://buzzdealer.ai/security
- Help and contact: https://buzzdealer.ai/contact

## Support

support@buzzdealer.ai

## Licence

The files in this repository are under the MIT licence (see LICENSE). The Buzz Dealer AI service has its own terms: https://buzzdealer.ai/terms
