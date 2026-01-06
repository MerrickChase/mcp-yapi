// 类型声明：为通配符导出路径提供类型支持
declare module "@modelcontextprotocol/sdk/server/mcp.js" {
  // 使用相对路径从 node_modules 导入类型
  export {
    McpServer,
    ResourceTemplate,
    type RegisteredTool,
    type RegisteredResource,
    type RegisteredPrompt,
    type ToolCallback,
    type PromptCallback,
    type ReadResourceCallback,
    type ReadResourceTemplateCallback,
    type ListResourcesCallback,
    type CompleteResourceTemplateCallback,
    type ResourceMetadata
  } from "../node_modules/@modelcontextprotocol/sdk/dist/esm/server/mcp.js";
}

declare module "@modelcontextprotocol/sdk/server/stdio.js" {
  export {
    StdioServerTransport
  } from "../node_modules/@modelcontextprotocol/sdk/dist/esm/server/stdio.js";
}

