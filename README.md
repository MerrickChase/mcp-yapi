# transn-yapi-mcp

An MCP (Model Context Protocol) server that connects to a YAPI instance and exposes
its API definitions as tools for AI agents or MCP-compatible clients.

## Features

- Query YAPI interface definitions by **interfaceId**.
- Query YAPI interface definitions by **path + projectId**.
- Return structured metadata that is easy to consume in tooling:
  - name, path, method, description
  - request query & body schema
  - response schema

## Installation

```bash
npm install transn-yapi-mcp
# or
pnpm add transn-yapi-mcp
```

## Usage

The package is designed to be run as an MCP server over **stdio**.
Typical MCP client configuration (example):

```jsonc
{
  "mcpServers": {
    "yapi-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["transn-yapi-mcp"],
      "env": {
        "YAPI_BASE": "https://your-yapi-domain.com",
        "YAPI_TOKEN": "your_yapi_openapi_token"
      }
    }
  }
}
```

### Required environment variables

- `YAPI_BASE`  
  Base URL of your YAPI instance, without a trailing slash.  
  Example: `https://yapi.example.com`

- `YAPI_TOKEN`  
  YAPI openapi token for the target project(s). It is passed as `token` query parameter.

## Exposed tools

### `yapi.get_api_context`

Get structured API context from a YAPI interface.

**Input**

```ts
{
  interfaceId: number;      // required
  projectId?: number;       // optional, for disambiguation
}
```

**Output (shape, simplified)**

```ts
{
  name: string;
  path: string;
  method: string;
  description: string;
  request: {
    query: unknown;
    body: unknown;
  };
  response: unknown;
}
```

### `yapi.get_api_context_by_path`

Get API context by path within a YAPI project.

**Input**

```ts
{
  projectId: number;        // required
  path: string;             // required, e.g. "/busi/patient/detail_by_openid"
  method?: string;          // optional, e.g. "GET"
}
```

**Output**

Same shape as `yapi.get_api_context`.

## License

MIT


