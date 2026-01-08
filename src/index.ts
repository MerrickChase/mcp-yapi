#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { tools } from "./tools.js";

const server = new McpServer({
  name: "transn-yapi-mcp",
  version: "0.1.3"
});

// 注册工具
for (const tool of tools) {
  server.registerTool(tool.name, {
    description: tool.description,
    inputSchema: tool.inputSchema
  }, tool.handler);
}

const transport = new StdioServerTransport();
await server.connect(transport);
// 确保在无输入时进程不立即退出，便于被 MCP 客户端保持长连接
process.stdin.resume();
// 兜底保活，避免在某些环境下事件循环清空直接退出
setInterval(() => {}, 1 << 30);
