import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type DetailRoute = {
  prefix: string;
  apiPath: (id: string) => string;
  title: string;
  description: string;
  backLabel: string;
  backHref: string;
};

const DETAIL_ROUTES: DetailRoute[] = [
  {
    prefix: "/topics/",
    apiPath: (id) => `/topics/${id}`,
    title: "해당 주요 이슈를 찾을 수 없습니다",
    description: "주소를 확인하거나 주요 이슈 목록에서 다시 선택해 주세요.",
    backLabel: "주요 이슈 목록으로 돌아가기",
    backHref: "/",
  },
  {
    prefix: "/three-day-topics/",
    apiPath: (id) => `/three-day-topics/${id}`,
    title: "해당 최근 3일 흐름을 찾을 수 없습니다",
    description: "주소를 확인하거나 홈 화면에서 다시 선택해 주세요.",
    backLabel: "홈으로 돌아가기",
    backHref: "/",
  },
  {
    prefix: "/weekly-topics/",
    apiPath: (id) => `/weekly-topics/${id}`,
    title: "해당 지난주 흐름을 찾을 수 없습니다",
    description: "주소를 확인하거나 홈 화면에서 다시 선택해 주세요.",
    backLabel: "홈으로 돌아가기",
    backHref: "/",
  },
];

export const config = {
  matcher: ["/topics/:id", "/three-day-topics/:id", "/weekly-topics/:id"],
};

function renderNotFoundHtml(route: DetailRoute) {
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>NewsLab Web</title>
<style>
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#f1f5f9; color:#0f172a; font-family:"Apple SD Gothic Neo","Noto Sans KR",Arial,sans-serif; }
  main { max-width:32rem; margin:1.5rem; padding:4rem 1.75rem; text-align:center; background:#ffffff; border:1px solid #e2e8f0; }
  h1 { font-size:1.125rem; font-weight:700; color:#0f172a; margin:0; }
  p { margin-top:0.5rem; font-size:0.875rem; line-height:1.5rem; color:#64748b; }
  a { margin-top:1.5rem; display:inline-flex; background:#0f766e; color:#ffffff; padding:0.625rem 1rem; font-size:0.875rem; font-weight:600; text-decoration:none; }
  a:hover { background:#115e59; }
</style>
</head>
<body>
  <main>
    <h1>${route.title}</h1>
    <p>${route.description}</p>
    <a href="${route.backHref}">${route.backLabel}</a>
  </main>
</body>
</html>`;
}

function matchDetailRoute(pathname: string) {
  return DETAIL_ROUTES.find((route) => pathname.startsWith(route.prefix));
}

function notFoundResponse(route: DetailRoute) {
  return new NextResponse(renderNotFoundHtml(route), {
    status: 404,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const route = matchDetailRoute(pathname);

  if (!route) {
    return NextResponse.next();
  }

  const id = pathname.slice(route.prefix.length);

  if (!/^[1-9]\d*$/.test(id)) {
    return notFoundResponse(route);
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_NEWSLAB_API_BASE_URL;

  if (!apiBaseUrl) {
    return NextResponse.next();
  }

  try {
    const response = await fetch(new URL(route.apiPath(id), apiBaseUrl), {
      cache: "no-store",
    });

    void response.body?.cancel().catch(() => {});

    if (response.status !== 404) {
      return NextResponse.next();
    }
  } catch {
    return NextResponse.next();
  }

  return notFoundResponse(route);
}
