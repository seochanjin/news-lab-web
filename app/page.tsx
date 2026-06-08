export default function Home() {
  return (
    <main className="flex min-h-screen flex-1 items-center bg-slate-50 px-6 py-16 text-slate-950">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase text-teal-700">
            NewsLab Web
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            NewsLab 프론트엔드 MVP를 준비하고 있습니다.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            이 화면은 백엔드 API 연동 전 Next.js, TypeScript, Tailwind CSS
            기반 개발을 시작하기 위한 placeholder입니다.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">Frontend</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              App Router 기반 화면과 컴포넌트를 구성합니다.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">API</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              API base URL은 환경변수로 관리합니다.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">CI</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              lint, typecheck, build 검증을 기준으로 유지합니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
