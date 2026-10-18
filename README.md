# Buzz Dealer AI MCP server

Publish and protect your reputation from ChatGPT, Claude and other AI assistants. Buzz Dealer AI gives your assistant two things: a **Press Room** to place articles and press releases on real news sites, and a **Reputation Agent** that scans what Google, AI engines and the web say about you or your company, asks what it cannot know, and helps you fix the gaps.

**Connector address:** https://mcp.buzzdealer.ai/mcp (remote MCP server, streamable HTTP)
**Sign-in:** OAuth 2.1. Agents that cannot do OAuth can use a personal API key as a Bearer token.
**Setup guide:** https://buzzdealer.ai/connect
**Pricing:** https://buzzdealer.ai/pricing
**Support:** support@buzzdealer.ai

**Private beta:** Buzz Dealer AI is in private beta. To join, request an invite at https://buzzdealer.ai or write to support@buzzdealer.ai.

This repository is the public listing for the hosted server. It has no server code.

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

## Example prompts

- Run the reputation radar on my own name
- What should I fix first?
- Send this press release to a UK finance newswire
- Plan a $3,000 PR campaign around our funding round
- Alert me on new reviews and mentions

## Tools

### Read only

| Tool | What it does |
| --- | --- |
| find_publications | Finds news sites and press release packages in the Press Room |
| get_publication | Shows one publication: price, audience, rules and turnaround |
| plan_campaign | Plans a campaign within a budget |
| get_ai_visibility_score | Shows how visible a site is to AI engines (beta) |
| check_originality_and_fit | Checks a text before it is ordered |
| quote_order | Quotes an order; nothing is reserved |
| get_order_status | Shows where an order is |
| get_report | Shows a report |
| get_account_status | Shows the account, balance and limits |
| get_radar_status | Reads a reputation scan as it runs |
| get_questions | Gets the next question the agent cannot answer alone |
| get_gaps | Lists the gaps found and the fixes for each |
| plan_fixes | Same as get_gaps |
| start_fix | Shows the steps of a fix |
| get_progress | Shows progress against the first scan |
| what_changed | Shows what changed since the last scan |
| get_playbook | Gets the Reputation Agent playbook |
| check_request | Checks whether a request is one we can help with |
| get_reputation_profile | Shows the saved profile |

### Change data

| Tool | What it does |
| --- | --- |
| start_radar | Starts a reputation scan |
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

## Pricing

The Reputation Agent is free, with a monthly rescan. Pro costs €69 a month and includes 10 research reports a month. The Press Room is pay per order from prepaid credits (1 credit = $1). Every order is quoted first, and an item is charged only when it is published; if it is not published, the credits come back. Credits are added by a person on buzzdealer.ai, never in the chat. Details: https://buzzdealer.ai/pricing

## Privacy and terms

Buzz Dealer AI receives only what your assistant sends to its tools, never your other chats. No account ever sees another account's data.

- Privacy: https://buzzdealer.ai/privacy
- Terms: https://buzzdealer.ai/terms
- Refund policy: https://buzzdealer.ai/refund-policy
- Help and contact: https://buzzdealer.ai/contact

## Support

support@buzzdealer.ai

## Licence

The files in this repository are under the MIT licence (see LICENSE). The Buzz Dealer AI service has its own terms: https://buzzdealer.ai/terms
