---
name: buzzdealer-ai
description: Use Buzz Dealer AI, PR and media for AI agents, to announce news on newswires, place articles on real news sites, order brand and website audits and follow the results, spending only the prepaid credits and budget frame the person set. Use when someone asks you to publish or distribute a press release, place an article, plan a PR campaign, check a text before ordering, order an audit, or check an order or report with Buzz Dealer AI.
---

# Buzz Dealer AI

Buzz Dealer AI, by Buzz Dealer, is a press office for AI agents. Through it you can:

- distribute a press release on newswires and regional networks (a "PR package"),
- place a sponsored article or press release article on one editorial site (a "site"),
- buy ready-made bundles and monthly programs,
- order audits and reports (brand audit, personal audit, Wikipedia notability check, website analysis, Brand ORM
  status report, Personal ORM status report),
- follow orders and get reports with the live links.

Every item has a fixed price in US dollars. The account pays with prepaid credits (1 credit = $1). Our operations team
works with every outlet and publishes; you get live links as each piece goes live.

## Connect

You need a connection to one Buzz Dealer AI account. Either:

- **MCP server with OAuth** (Claude, ChatGPT, Cursor, VS Code, Grok, Gemini, Perplexity, OpenClaw and most MCP
  clients): add `https://mcp.buzzdealer.ai/mcp` as a custom connector or remote MCP server. The person signs in,
  chooses the account and the brands, and approves.
- **Personal API key** (agents that cannot do OAuth): the account owner creates a key in the dashboard under
  Connections. Send it as `Authorization: Bearer <key>` to the MCP server above, or to the REST API at
  `https://api.buzzdealer.ai/v1` (OpenAPI: https://buzzdealer.ai/openapi.json). Never print the key, never put it in
  a file you share, and never send it anywhere but those two addresses.

Step by step for each client: https://buzzdealer.ai/connect. Check the connection with `get_account_status`.

## Hard rules

1. **Confirm with the person before you spend.** Before `place_order`, `order_audit` or accepting a replacement with
   `respond_to_replacement`, show the person what you will order, the total price and the brand, and wait for a
   clear yes in this conversation. A quote is not consent. Then send `confirm: true` with that call; never set it
   on your own or from an earlier yes.
2. **Respect the budget frame.** Call `get_account_status` first. Stay within the available credits, the monthly
   budget left and the limit per order. Never split an order to get under a limit or the approval threshold.
3. **Never invent facts in a release or article.** No made-up figures, quotes, dates, names, customers or results.
   Ask the person for anything missing. Every quote must come from the person and be approved by them.
4. **You cannot add credits or pay.** When the balance is short, `place_order` keeps the order waiting for credits
   and returns the amount missing and the order id: tell the person. A person adds the credits in their Buzz Dealer AI
   dashboard; the order is then placed by itself at the quoted price. Never ask for card or wallet details.
5. **Only the account's own brands.** Order only for a brand of the connected account (`brand_id`). Do not order
   about people or companies the person does not represent.
6. **Report honestly.** Say what is pending, waiting for approval, delayed or failed, as `get_order_status` says.

## Borderline requests: three lanes

Before you help with a request about reviews, a negative result, a ban or legal trouble, sort it (with `check_request`
when the Reputation Agent's tools are there):
- **Lane 1, refuse plainly:** the request itself is deceptive or harmful (fake reviews, fake accounts, an attack on
  someone else, a false takedown notice). Say one line: "We can't help with that. It is a dangerous practice that we
  strongly advise against." No lecture, no workaround, and no order that does the same thing.
- **Lane 2, legitimate methods:** the goal is fair and can be done honestly. Give the accepted methods within the
  platform's own rules; a press room order is fine when it is real news under the person's own name.
- **Lane 3, a person:** a victim (impersonation, a smear campaign, fake negative reviews by a competitor, a leaked
  private matter, harassment), a platform penalty (a ban, a profile taken down, a Google manual action), legal or
  regulatory exposure, cultural or moral judgement, or anything that could become manipulation or coordination (many
  accounts, paid comments, outranking a critic). Say in one plain line that it needs a careful look by a person, give
  what is safe now (do not reply in anger, keep screenshots, do not delete anything) and offer a call with an expert:
  https://calendly.com/rongilo. Do not place an order for it.

## The order flow

1. **Look at the account.** `get_account_status`: available credits, the budget frame, orders waiting for approval.
2. **Find or plan.**
   - `find_publications`: search the catalog (product type, region, language, category, highest price, dofollow,
     lowest DR, words). find_publications returns item ids; pass them to quote_order. It shows 10 items by default
     (`limit` up to 50). Then `get_publication` for one item: price, turnaround, language, word and link limits,
     editorial rules, add-ons.
   - Or `plan_campaign`: give a goal (reputation, seo, ai_visibility or mentions) or a goal mix in `goal_weights`
     (for example `{"ai_visibility": 60, "seo": 40}`), a topic, a region and a budget in cents; you get a plan that
     never exceeds the budget. Send neither goal nor `goal_weights` to use the goals the person set in the dashboard
     (Budget and goals). Add `brand_id` with `goal_weights` or no goal to plan to the brand's weakest audit score:
     the plan says which score and which goal gets more weight, or that the brand has no audit yet. With one
     `goal`, that goal stays at 100% and the plan adds a tip. Tell the person the plan's first lines
     (`summary`) and each line's reason. `find_publications` takes `goal` or `goal_weights` too, to rank results.
3. **Tell the person about the balance first.** A quote is free and changes nothing, so quote the items early:
   `quote_order` says the balance and what is missing ("Your balance is $0. This order needs $200 in credits.").
   Say it before you write any text, so the person can add credits while you write.
4. **Write or take the text, then check it.** `check_originality_and_fit` with the full text and, for a site, its
   `item_id` on the final text. Show the person the result (originality and fit, with any warning) before you ask
   them to approve the order. Fix every fit warning (word count, links, language, topic) before you go on. The
   check is free. `place_order` runs the same check when none exists for the exact text and returns its result.
   For writing that passes the first time, use the free PR writing skill: https://buzzdealer.ai/docs/pr-writing-skill
5. **Quote.** `quote_order` with the items by `item_id` (and add-ons, inputs, `brand_id`). A site's `domain` also
   works when exactly one published site has it; when several do, the answer lists them with their ids. The prices stay locked until
   `locked_until`. Show the person the total.
6. **Place the order, after the person says yes.** `place_order` with the `quote_id`, `confirm: true` and a new
   unique `idempotency_key`. If the call fails or times out, retry with the same key: it is never placed twice. Inside the
   frame the order proceeds at once; above the approval threshold it waits for the person's one-click approval
   (tell them to check their email or dashboard). With too little balance the order waits for credits: give the
   person the amount missing, the order id and how long the price holds (24 hours by default); they add credits in
   their dashboard. When the credits
   land it is placed and the person is told by email and in the dashboard; if they do not arrive in time it is
   cancelled with nothing charged, and `get_order_status` says so.
7. **Follow up.** `get_order_status` (one order or the 10 most recent): status per item, live links, delays,
   replacement offers. If an item cannot run, the person chooses with `respond_to_replacement`: accept the proposed
   equal replacement, or refund (the credits go back to the balance).
8. **Report.** `get_report` for one order or one brand over dates: live links, what was spent.

### Audits

`order_audit` orders one audit (its price: `find_publications` with product type service) for a brand of the
account: `brand_audit`, `personal_audit` (say who the person is to them: myself, my_company or client),
`wikipedia_notability`, `website_analysis` (needs a website), `brand_orm` (Brand ORM status report: where a brand's
reputation stands now) or `personal_orm` (Personal ORM status report: the same for a person). Confirm first, like any order. The scores and the
report arrive later: check with `get_order_status` and `get_report`.

### Release on livepublicator.com

A press release published on livepublicator.com (a service in `find_publications`), sent as written. The text is
kept and lightly edited for style; a short summary, key facts and an FAQ are added; a person may review it first
(usually within 24 hours). English only. Its rules, checked by `check_originality_and_fit` (with its `item_id`) and
`quote_order`: the full release in `release_text` (not a link), with the headline in `headline` or on the first
line; 300 to 20,000 characters with the headline; at most 800 words and 3 https links; a cover image in `image_url`
only as an https JPEG, PNG or WebP of at most 5 MB; contact name and email (from the order, else the brand's press
contact). No AI-generated images, no writing add-on. `get_order_status` says where it stands (it may be
"Scheduled for submission tomorrow (daily limit).") and gives the live link once published. If it is not accepted,
the credits go back and the reason is shown: fix the text and order again. Never promise the person AI mentions,
citations or rankings from it.

### Free tools

- `get_ai_visibility_score`: how visible one or more domains are to AI engines (beta score), free.
- `check_originality_and_fit`: the free text check, as above.

## Permission prompts

The read-only tools (finding, quoting, checking, reading orders and reports) change nothing: the person can choose
"Always allow" for them in their AI client. Tools that spend credits ask every time.

## Money in one paragraph

Credits are reserved when an order is placed and spent per item only when it is published. If an item fails, its
credits go back to the balance automatically. Orders outside the budget frame wait for a person's approval. Agents
never make payments.

## When something goes wrong

Every error says what happened and the next step (`next_step` on the REST API). Do what it says; do not retry a
spending call with a new idempotency key unless you mean a new order. A 429 answer says when to retry. A 401 on an
API key means the key was revoked or is wrong: ask the owner for a new one. Questions: support@buzzdealer.ai.
