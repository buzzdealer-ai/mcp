import { test } from "node:test";
import assert from "node:assert/strict";
import { BuzzDealerApiError, BuzzDealerClient } from "../dist/index.js";

function fakeFetch(status, body) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, init });
    return new Response(body === undefined ? "" : JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  };
  return { fn, calls };
}

test("findPublications sends the key and the query, goal_weights as goal:weight pairs", async () => {
  const f = fakeFetch(200, { total: 1, results: [{ id: "00000000-0000-4000-8000-000000000001", product_type: "site", name: "Northwind Daily", price_cents: 100, currency: "USD" }] });
  const client = new BuzzDealerClient({ apiKey: "test-key", fetch: f.fn });
  const out = await client.findPublications({ region: "UK", dofollow: true, limit: 5, goal_weights: { ai_visibility: 60, seo: 40 } });
  assert.equal(out.results[0].name, "Northwind Daily");
  const { url, init } = f.calls[0];
  const u = new URL(url);
  assert.equal(u.origin + u.pathname, "https://api.buzzdealer.ai/v1/publications");
  assert.equal(u.searchParams.get("region"), "UK");
  assert.equal(u.searchParams.get("dofollow"), "true");
  assert.equal(u.searchParams.get("limit"), "5");
  assert.equal(u.searchParams.get("goal_weights"), "ai_visibility:60,seo:40");
  assert.equal(init.method, "GET");
  assert.equal(init.headers.authorization, "Bearer test-key");
  assert.equal(init.body, undefined);
});

test("getPublication, getAccount and getAiVisibilityScores hit the right paths", async () => {
  const f = fakeFetch(200, { ok: true });
  const client = new BuzzDealerClient({ apiKey: "k", baseUrl: "https://api.northwind.example/", fetch: f.fn });
  await client.getPublication("abc 1");
  await client.getAccount();
  await client.getAiVisibilityScores(["northwind.example"]);
  assert.equal(f.calls[0].url, "https://api.northwind.example/v1/publications/abc%201");
  assert.equal(f.calls[1].url, "https://api.northwind.example/v1/account");
  assert.equal(f.calls[2].url, "https://api.northwind.example/v1/ai-visibility-scores");
  assert.equal(f.calls[2].init.method, "POST");
  assert.deepEqual(JSON.parse(f.calls[2].init.body), { domains: ["northwind.example"] });
  assert.equal(f.calls[2].init.headers["content-type"], "application/json");
});

test("an error body becomes a typed BuzzDealerApiError", async () => {
  const f = fakeFetch(401, { error: "invalid_api_key", message: "The API key is wrong or revoked.", next_step: "Ask the account owner for a new key." });
  const client = new BuzzDealerClient({ apiKey: "bad", fetch: f.fn });
  await assert.rejects(client.getAccount(), (e) => {
    assert.ok(e instanceof BuzzDealerApiError);
    assert.equal(e.status, 401);
    assert.equal(e.code, "invalid_api_key");
    assert.equal(e.message, "The API key is wrong or revoked.");
    assert.equal(e.nextStep, "Ask the account owner for a new key.");
    return true;
  });
});

test("a non-JSON error still throws BuzzDealerApiError", async () => {
  const fn = async () => new Response("Bad gateway", { status: 502 });
  const client = new BuzzDealerClient({ apiKey: "k", fetch: fn });
  await assert.rejects(client.request("GET", "/v1/account"), (e) => e instanceof BuzzDealerApiError && e.status === 502 && e.code === "http_error");
});

test("the client needs an API key", () => {
  assert.throws(() => new BuzzDealerClient({ apiKey: "" }), TypeError);
});
