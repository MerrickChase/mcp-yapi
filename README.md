# transn-yapi-mcp

一个 MCP (Model Context Protocol) 服务器，用于从 YAPI 获取接口定义，并通过 MCP 工具暴露给 AI（如 Cursor、Claude），便于自动生成代码和文档。

## 功能概览

- 根据 **interfaceId** 查询单个接口定义
- 根据 **path + projectId** 查询指定项目下的接口定义
- 返回单一 JSON 对象形式的接口元数据（通过 MCP `CallToolResult.content[0].text` 返回），包含：
  - 基础信息：`name`、`path`、`method`、`description`
  - 请求参数定义：`request.query`、`request.bodySchema`（已解析的 JSON Schema 对象）
  - 响应结构定义：`responseSchema`（已解析的 JSON Schema 对象）

## 安装与配置

### 使用 npx 启动（推荐，无需预装）

在 MCP 客户端（例如 Cursor）的配置文件中添加：

```jsonc
{
  "mcpServers": {
    "yapi-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "--yes",
        "--package=transn-yapi-mcp@0.1.3",
        "transn-yapi-mcp"
      ],
      "env": {
        "YAPI_BASE": "https://your-yapi-domain.com",
        "YAPI_TOKEN": "your_yapi_openapi_token"
      }
    }
  }
}
```

> 说明：
> - 无需在本地单独安装 `transn-yapi-mcp`，npx 会在首次启动时自动下载对应版本
> - 之后会从本地缓存加载，提高启动速度

### 环境变量说明

- `YAPI_BASE`：YAPI 实例基础地址（不带尾部斜杠），如 `https://yapi.example.com`
- `YAPI_TOKEN`：对应项目的 openapi token，将作为 `token` 查询参数传递

## 暴露的工具

### `yapi_get_api_context`

- 功能：通过接口 ID 获取接口定义
- 输入：
  - `interfaceId: number`（必填）
  - `projectId?: number`（可选）
- 输出：
  - JSON 对象，字段示例：
    - `name` / `path` / `method` / `description`
    - `request.query`：查询参数定义（源自 YAPI `req_query`）
    - `request.bodySchema`：请求体 JSON Schema（解析自 YAPI `req_body_other`）
    - `responseSchema`：响应 JSON Schema（解析自 YAPI `res_body`）

### `yapi_get_api_context_by_path`

- 功能：通过 `projectId + path (+ method)` 获取接口定义
- 输入：
  - `projectId: number`
  - `path: string`
  - `method?: string`
- 输出：
  - 同 `yapi_get_api_context`，为同一结构的 JSON 对象

> 在 MCP 协议层面，这两个工具都会返回：
> - 一个 `CallToolResult` 对象，其中 `content[0].type = "text"`
> - `content[0].text` 为上述 JSON 对象的字符串表示，便于 AI 解析使用

## 开发简单说明

- Node.js >= 18
- 推荐使用 pnpm：

```bash
pnpm install
pnpm build
```

本地直接运行 MCP 服务器用于调试：

```bash
YAPI_BASE=https://your-yapi-domain.com YAPI_TOKEN=your_token node dist/index.js
```

## 许可证与作者

- 许可证：MIT
- 作者：merrick <1973231806@qq.com>
