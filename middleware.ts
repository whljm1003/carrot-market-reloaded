import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  console.log("hello");
}

// matcher를 사용하면 matcher에 지정한 특정 경로들에서만 미들웨어가 실행되도록 할 수 있습니다.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
