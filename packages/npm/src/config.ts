import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { MCP_URL, SERVER_NAME } from "./constants.js";

export type Client = "cursor" | "vscode";

/** Cursor keeps servers under "mcpServers"; VS Code under "servers" with a "type". */
export function serverKey(client: Client): "mcpServers" | "servers" {
  return client === "cursor" ? "mcpServers" : "servers";
}

export function serverEntry(client: Client): Record<string, string> {
  return client === "cursor" ? { url: MCP_URL } : { type: "http", url: MCP_URL };
}

/** ~/.cursor/mcp.json, or <cwd>/.vscode/mcp.json */
export function defaultConfigPath(client: Client, cwd: string = process.cwd(), home: string = homedir()): string {
  return client === "cursor" ? join(home, ".cursor", "mcp.json") : join(cwd, ".vscode", "mcp.json");
}

export type MergeAction = "added" | "updated" | "unchanged";

export interface MergeResult {
  action: MergeAction;
  config: Record<string, unknown>;
  previous: unknown;
}

/** Puts the server into a parsed config, keeping every other server and key. Pure. */
export function mergeServer(existing: unknown, client: Client): MergeResult {
  if (existing !== undefined && (typeof existing !== "object" || existing === null || Array.isArray(existing))) {
    throw new Error("The config file is not a JSON object.");
  }
  const config: Record<string, unknown> = { ...((existing as Record<string, unknown>) ?? {}) };
  const key = serverKey(client);
  const current = config[key];
  if (current !== undefined && (typeof current !== "object" || current === null || Array.isArray(current))) {
    throw new Error(`"${key}" in the config file is not an object.`);
  }
  const servers: Record<string, unknown> = { ...((current as Record<string, unknown>) ?? {}) };
  const previous = servers[SERVER_NAME];
  // Keep any extra fields the person set on our entry (for example headers), and set type and url.
  const next = previous && typeof previous === "object" && !Array.isArray(previous) ? { ...(previous as object), ...serverEntry(client) } : serverEntry(client);
  servers[SERVER_NAME] = next;
  const action: MergeAction = previous === undefined ? "added" : JSON.stringify(next) === JSON.stringify(previous) ? "unchanged" : "updated";
  return { action, config: { ...config, [key]: servers }, previous };
}

export interface AddResult extends MergeResult {
  path: string;
  created: boolean;
  written: boolean;
}

/** Reads the file (if any), merges the server and writes it back unless dryRun. */
export function addToConfigFile(client: Client, path: string, dryRun = false): AddResult {
  const exists = existsSync(path);
  let parsed: unknown;
  if (exists) {
    const raw = readFileSync(path, "utf8");
    if (raw.trim() !== "") {
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error(`${path} is not plain JSON (it may have comments). Nothing was changed; add the server by hand.`);
      }
    }
  }
  const result = mergeServer(parsed, client);
  const write = !dryRun && result.action !== "unchanged";
  if (write) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(result.config, null, 2) + "\n", "utf8");
  }
  return { ...result, path, created: !exists, written: write };
}
