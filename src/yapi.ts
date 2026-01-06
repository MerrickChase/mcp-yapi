import fetch from "node-fetch";

// YAPI 基础地址，末尾不要加斜杠，必填通过环境变量提供
const YAPI_BASE = process.env.YAPI_BASE!;
// YAPI 的 openapi token（从环境变量读取，放在查询参数 token），避免依赖登录态 Cookie
const YAPI_TOKEN = process.env.YAPI_TOKEN!;

interface YapiResponse<T = unknown> {
  errcode: number;
  errmsg: string;
  data: T;
}

interface YapiInterface {
  title: string;
  path: string;
  method: string;
  desc: string;
  req_query: unknown;
  req_body_other: unknown;
  res_body: unknown;
}

interface YapiInterfaceListItem {
  _id: number;
  path: string;
  method: string;
  title: string;
  catid: number;
  project_id: number;
}

interface YapiInterfaceList {
  count: number;
  list: YapiInterfaceListItem[];
}

export async function getInterface(
  projectId: number,
  interfaceId: number
): Promise<YapiInterface>;
export async function getInterface(
  interfaceId: number
): Promise<YapiInterface>;
export async function getInterface(
  projectIdOrInterfaceId: number,
  maybeInterfaceId?: number
): Promise<YapiInterface> {
  // 兼容两种调用：仅传接口 ID；或传 projectId + 接口 ID
  const interfaceId = maybeInterfaceId ?? projectIdOrInterfaceId;
  const projectId = maybeInterfaceId ? projectIdOrInterfaceId : undefined;

  const params = new URLSearchParams({
    id: String(interfaceId),
    token: YAPI_TOKEN
  });
  if (projectId !== undefined) {
    params.set("project_id", String(projectId));
  }

  const url = `${YAPI_BASE}/api/interface/get?${params.toString()}`;
  const res = await fetch(url);

  const json = await res.json() as YapiResponse<YapiInterface>;
  if (json.errcode !== 0) {
    throw new Error(json.errmsg);
  }

  return json.data;
}

async function listInterfaces(projectId: number): Promise<YapiInterfaceListItem[]> {
  const pageSize = 200;
  const result: YapiInterfaceListItem[] = [];
  let page = 1;

  // 分页拉取，直到达到总数或无更多数据
  while (true) {
    const url = `${YAPI_BASE}/api/interface/list?project_id=${projectId}&page=${page}&limit=${pageSize}&token=${YAPI_TOKEN}`;
    const res = await fetch(url);
    const json = await res.json() as YapiResponse<YapiInterfaceList>;
    if (json.errcode !== 0) {
      throw new Error(json.errmsg);
    }

    result.push(...json.data.list);
    if (result.length >= json.data.count || json.data.list.length === 0) {
      break;
    }

    page += 1;
  }

  return result;
}

export async function getInterfaceByPath(
  projectId: number,
  path: string,
  method?: string
): Promise<YapiInterface> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const interfaces = await listInterfaces(projectId);

  const matches = interfaces.filter((item) => item.path === normalizedPath);
  const filtered = method
    ? matches.filter((item) => item.method.toUpperCase() === method.toUpperCase())
    : matches;

  const target = filtered[0];
  if (!target) {
    const reason = matches.length === 0
      ? `未找到路径为 ${normalizedPath} 的接口`
      : `路径匹配到 ${matches.length} 条，但没有匹配到方法 ${method ?? "N/A"}`;
    throw new Error(reason);
  }

  return getInterface(projectId, target._id);
}
