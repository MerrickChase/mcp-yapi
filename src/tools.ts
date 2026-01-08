// src/tools.ts
import { z } from "zod";
import { getInterface, getInterfaceByPath } from "./yapi.js";

/**
 * 安全解析 JSON 字符串：
 * - 如果是合法 JSON 字符串，则返回解析后的对象；
 * - 否则直接返回原始值（避免因单个接口配置问题导致工具整体不可用）。
 */
function parseJsonSafe(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export const tools = [
  {
    // 工具名用简单下划线，避免客户端再做转换
    name: "yapi_get_api_context",
    description: "Get structured API context from YAPI",
    inputSchema: z.object({
      projectId: z.number().optional(),
      interfaceId: z.number()
    }),
    handler: async ({ projectId, interfaceId }: { projectId?: number; interfaceId: number }) => {
      const api = projectId
        ? await getInterface(projectId, interfaceId)
        : await getInterface(interfaceId);

      const payload = {
        name: api.title,
        path: api.path,
        method: api.method,
        description: api.desc,
        request: {
          query: api.req_query,
          // 将 YAPI 返回的 JSON Schema 字符串解析为对象，便于 AI 工具直接理解字段结构
          bodySchema: parseJsonSafe(api.req_body_other)
        },
        // 同样对响应结构做解析
        responseSchema: parseJsonSafe(api.res_body)
      };

      // ★ 关键：返回 MCP 标准的 CallToolResult
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(payload)
          }
        ]
      };
    }
  },
  {
    name: "yapi_get_api_context_by_path",
    description: "Get API context by path within a YAPI project",
    inputSchema: z.object({
      projectId: z.number(),
      path: z.string(),
      method: z.string().optional()
    }),
    handler: async (
      { projectId, path, method }: { projectId: number; path: string; method?: string }
    ) => {
      const api = await getInterfaceByPath(projectId, path, method);

      const payload = {
        name: api.title,
        path: api.path,
        method: api.method,
        description: api.desc,
        request: {
          query: api.req_query,
          bodySchema: parseJsonSafe(api.req_body_other)
        },
        responseSchema: parseJsonSafe(api.res_body)
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(payload)
          }
        ]
      };
    }
  }
];