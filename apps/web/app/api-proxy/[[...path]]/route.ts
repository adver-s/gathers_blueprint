import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const upstreamBase =
  process.env.INTERNAL_API_ORIGIN?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

const hopByHop = new Set(
  [
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "host",
  ].map((s) => s.toLowerCase()),
);

function filterRequestHeaders(incoming: Headers): Headers {
  const out = new Headers();
  incoming.forEach((value, key) => {
    if (!hopByHop.has(key.toLowerCase())) {
      out.set(key, value);
    }
  });
  return out;
}

type RouteCtx = { params: Promise<{ path?: string[] }> };

async function forward(req: NextRequest, pathSegments: string[]) {
  const pathPart = pathSegments.length ? `/${pathSegments.join("/")}` : "";
  const url = `${upstreamBase}${pathPart}${req.nextUrl.search}`;

  const method = req.method;
  const headers = filterRequestHeaders(req.headers);
  const withBody = !["GET", "HEAD", "OPTIONS"].includes(method);
  const body = withBody ? await req.arrayBuffer() : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method,
      headers,
      body: withBody && body && body.byteLength > 0 ? body : undefined,
      redirect: "manual",
    });
  } catch {
    return NextResponse.json(
      { detail: "API に接続できません", upstream: upstreamBase },
      { status: 502 },
    );
  }

  const outHeaders = new Headers(upstream.headers);
  outHeaders.delete("transfer-encoding");
  outHeaders.delete("connection");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: outHeaders,
  });
}

async function segments(ctx: RouteCtx): Promise<string[]> {
  const p = await ctx.params;
  return p.path ?? [];
}

export async function GET(req: NextRequest, ctx: RouteCtx) {
  return forward(req, await segments(ctx));
}

export async function POST(req: NextRequest, ctx: RouteCtx) {
  return forward(req, await segments(ctx));
}

export async function PUT(req: NextRequest, ctx: RouteCtx) {
  return forward(req, await segments(ctx));
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  return forward(req, await segments(ctx));
}

export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  return forward(req, await segments(ctx));
}

export async function OPTIONS(req: NextRequest, ctx: RouteCtx) {
  return forward(req, await segments(ctx));
}
