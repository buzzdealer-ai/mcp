import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { delimiter, join } from "node:path";
import { addToConfigFile, defaultConfigPath, type Client } from "./config.js";
import { AGENTS_URL, CLAUDE_CODE_ARGS, CLAUDE_CODE_COMMAND, CONNECT_URL, DOCS_URL, MCP_URL, SERVER_NAME } from "./constants.js";

export interface CliIO {
  log: (line: string) => void;
  error: (line: string) => void;
  cwd: string;
  home: string;
  /** Finds an executable on PATH; returns its path or undefined. */
  which: (cmd: string) => string | undefined;
  /** Runs a command and returns its exit code. */
  exec: (cmd: string, args: readonly string[]) => number;
}

function whichOnPath(cmd: string): string | undefined {
  const exts = process.platform === "win32" ? (process.env.PATHEXT ?? ".EXE;.CMD;.BAT").split(";") : [""];
  for (const dir of (process.env.PATH ?? "").split(delimiter)) {
    if (!dir) continue;
    for (const ext of exts) {
      const p = join(dir, cmd + ext);
      if (existsSync(p)) return p;
    }
  }
  return undefined;
}

const defaultIO: CliIO = {
  log: (l) => console.log(l),
  error: (l) => console.error(l),
  cwd: process.cwd(),
  home: homedir(),
  which: whichOnPath,
  exec: (cmd, args) => spawnSync(cmd, [...args], { stdio: "inherit", shell: process.platform === "win32" }).status ?? 1,
};

const HELP = `buzzdealer-ai: connect your AI assistant to Buzz Dealer AI (${MCP_URL})

Usage:
  npx buzzdealer-ai connect                 Print the connect steps
  npx buzzdealer-ai add claude-code         Print, then run: ${CLAUDE_CODE_COMMAND}
  npx buzzdealer-ai add cursor              Add the server to ~/.cursor/mcp.json
  npx buzzdealer-ai add vscode              Add the server to .vscode/mcp.json in this folder
  npx buzzdealer-ai help                    This help

Options:
  --dry-run        Print what would change or run, and change nothing
  --file <path>    For add cursor or add vscode: use this config file instead

Docs: ${CONNECT_URL}`;

function connectText(): string {
  return `Buzz Dealer AI: Press Room (PR and press release distribution) and Reputation Agent.

MCP server: ${MCP_URL} (streamable HTTP)
Sign-in:    OAuth in your client, or a personal API key as "Authorization: Bearer <key>"
            (the account owner creates keys in the Buzz Dealer AI dashboard under Connections)

Claude Code:
  ${CLAUDE_CODE_COMMAND}
  then type /mcp and sign in
Cursor:
  npx buzzdealer-ai add cursor
VS Code:
  npx buzzdealer-ai add vscode
Claude, ChatGPT, Gemini and others:
  add a custom connector with the address ${MCP_URL}

Step by step for every client: ${CONNECT_URL}
For AI agents: ${AGENTS_URL}
Docs: ${DOCS_URL}

Before anything that spends credits, your assistant quotes first and waits for your yes to the total.`;
}

function addConfig(client: Client, file: string | undefined, dryRun: boolean, io: CliIO): number {
  const path = file ?? defaultConfigPath(client, io.cwd, io.home);
  let r;
  try {
    r = addToConfigFile(client, path, dryRun);
  } catch (e) {
    io.error(`Error: ${(e as Error).message}`);
    return 1;
  }
  const entry = JSON.stringify((r.config[client === "cursor" ? "mcpServers" : "servers"] as Record<string, unknown>)[SERVER_NAME]);
  if (r.action === "unchanged") {
    io.log(`${path} already has "${SERVER_NAME}" set to ${MCP_URL}. Nothing changed.`);
    return 0;
  }
  io.log(
    r.action === "added"
      ? `${dryRun ? "Would add" : "Added"} "${SERVER_NAME}": ${entry}`
      : `${dryRun ? "Would update" : "Updated"} "${SERVER_NAME}" from ${JSON.stringify(r.previous)} to ${entry}`,
  );
  if (r.created) io.log(`${dryRun ? "Would create" : "Created"} ${path}`);
  else io.log(`${dryRun ? "Would change" : "Changed"} ${path}; other servers and settings were kept.`);
  if (!dryRun) io.log(client === "cursor" ? "Restart Cursor or reload its MCP settings, then sign in when asked." : "In VS Code, start the server from mcp.json and sign in when asked.");
  return 0;
}

/** The CLI. Returns the exit code. */
export function run(argv: readonly string[], io: CliIO = defaultIO): number {
  const args = [...argv];
  const dryRun = args.includes("--dry-run");
  const fileAt = args.indexOf("--file");
  const file = fileAt >= 0 ? args[fileAt + 1] : undefined;
  if (fileAt >= 0 && !file) {
    io.error("Error: --file needs a path.");
    return 1;
  }
  const words = args.filter((a, i) => !a.startsWith("--") && !(fileAt >= 0 && i === fileAt + 1));
  const [cmd, target] = words;

  if (!cmd || cmd === "help" || args.includes("--help") || args.includes("-h")) {
    io.log(HELP);
    return 0;
  }
  if (cmd === "connect") {
    io.log(connectText());
    return 0;
  }
  if (cmd === "add") {
    if (target === "claude-code" || target === "claude") {
      io.log(`Command: ${CLAUDE_CODE_COMMAND}`);
      if (dryRun) return 0;
      if (!io.which("claude")) {
        io.log("Claude Code (claude) was not found on PATH. Run the command above once it is installed.");
        return 0;
      }
      io.log("Running it now...");
      const code = io.exec("claude", CLAUDE_CODE_ARGS);
      if (code === 0) io.log("Done. In Claude Code, type /mcp and sign in.");
      return code;
    }
    if (target === "cursor" || target === "vscode") return addConfig(target, file, dryRun, io);
    io.error(`Unknown client "${target ?? ""}". Use claude-code, cursor or vscode.`);
    return 1;
  }
  io.error(`Unknown command "${cmd}".\n\n${HELP}`);
  return 1;
}
