import { z } from "zod";
import { getInterface, getInterfaceByPath } from "./yapi.js";

export const tools = [
  {
    name: "yapi.get_api_context",
    description: "Get structured API context from YAPI",
    inputSchema: z.object({
      projectId: z.number().optional(),
      interfaceId: z.number()
    }),
    handler: async ({ projectId, interfaceId }: { projectId?: number; interfaceId: number }) => {
      const api = projectId
        ? await getInterface(projectId, interfaceId)
        : await getInterface(interfaceId);

      return {
        name: api.title,
        path: api.path,
        method: api.method,
        description: api.desc,
        request: {
          query: api.req_query,
          body: api.req_body_other
        },
        response: api.res_body
      };
    }
  },
  {
    name: "yapi.get_api_context_by_path",
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

      return {
        name: api.title,
        path: api.path,
        method: api.method,
        description: api.desc,
        request: {
          query: api.req_query,
          body: api.req_body_other
        },
        response: api.res_body
      };
    }
  }
];
