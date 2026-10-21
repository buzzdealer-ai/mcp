/** The name every config uses for the server. */
export const SERVER_NAME = "buzzdealer-ai";

/** The remote MCP server (streamable HTTP; OAuth, or a personal API key as a Bearer token). */
export const MCP_URL = "https://mcp.buzzdealer.ai/mcp";

/** The REST API host. Paths start with /v1. */
export const API_BASE_URL = "https://api.buzzdealer.ai";

export const CONNECT_URL = "https://buzzdealer.ai/connect";
export const AGENTS_URL = "https://buzzdealer.ai/agents";
export const DOCS_URL = "https://buzzdealer.ai/docs";
export const OPENAPI_URL = "https://buzzdealer.ai/openapi.json";

/** The Claude Code command, as an argument list (no shell). */
export const CLAUDE_CODE_ARGS = ["mcp", "add", "--transport", "http", SERVER_NAME, MCP_URL] as const;
export const CLAUDE_CODE_COMMAND = `claude ${CLAUDE_CODE_ARGS.join(" ")}`;
