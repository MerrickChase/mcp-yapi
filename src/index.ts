import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { tools } from "./tools.js";

const server = new McpServer(
  {
    name: "yapi-mcp",
    version: "0.1.0"
  }
);

// 注册工具
for (const tool of tools) {
  server.registerTool(tool.name, {
    description: tool.description,
    inputSchema: tool.inputSchema
  }, tool.handler);
}

const transport = new StdioServerTransport();
await server.connect(transport);
