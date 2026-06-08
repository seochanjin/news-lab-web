type Article = {
  id: number;
  category: string;
  title: string;
  source: string;
  publishedAt: string;
  metadata?: string;
  isBreaking?: boolean;
};

const categories = ["전체", "정치", "경제", "기술", "세계", "사회", "AI"];

const mockArticles: Article[] = [
  {
    id: 1,
    category: "정치",
    title: "국회, 주요 민생 법안 논의 일정 확정",
    source: "서울신문",
    publishedAt: "8분 전",
    metadata: "관련 기사 12",
    isBreaking: true,
  },
  {
    id: 2,
    category: "경제",
    title: "반도체 수출 회복세 이어져, 산업계 하반기 전망 주목",
    source: "경제일보",
    publishedAt: "16분 전",
    metadata: "관련 기사 8",
  },
  {
    id: 3,
    category: "AI",
    title: "국내 기업들, 업무용 생성형 AI 도입 범위 확대",
    source: "테크리포트",
    publishedAt: "24분 전",
    metadata: "주목",
  },
  {
    id: 4,
    category: "세계",
    title: "주요국 정상회의 개막, 공급망 협력 방안 논의",
    source: "월드뉴스",
    publishedAt: "38분 전",
    metadata: "관련 기사 15",
  },
  {
    id: 5,
    category: "사회",
    title: "전국 장마 대비 안전 점검, 지자체 비상 대응 체계 가동",
    source: "뉴스데일리",
    publishedAt: "45분 전",
  },
  {
    id: 6,
    category: "기술",
    title: "차세대 배터리 소재 연구 성과 공개, 상용화 가능성 검토",
    source: "사이언스온",
    publishedAt: "1시간 전",
    metadata: "관련 기사 6",
  },
  {
    id: 7,
    category: "경제",
    title: "소비자 물가 흐름 안정세, 생활 물가 부담은 지속",
    source: "마켓포커스",
    publishedAt: "1시간 전",
    metadata: "분석",
  },
  {
    id: 8,
    category: "사회",
    title: "대중교통 환승 체계 개편안 발표, 시민 의견 수렴 시작",
    source: "시민일보",
    publishedAt: "2시간 전",
  },
  {
    id: 9,
    category: "AI",
    title: "AI 안전성 평가 기준 마련 위한 민관 협의체 출범",
    source: "디지털타임스",
    publishedAt: "2시간 전",
    metadata: "관련 기사 9",
  },
  {
    id: 10,
    category: "세계",
    title: "글로벌 증시 혼조세, 주요 경제지표 발표 앞두고 관망",
    source: "글로벌경제",
    publishedAt: "3시간 전",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,760px)_minmax(0,1fr)] lg:items-center lg:py-6">
          <div className="flex items-baseline gap-3 lg:justify-self-start">
            <span className="text-2xl font-black text-teal-700">NewsLab</span>
            <span className="text-xs font-medium text-slate-400">
              뉴스를 한눈에
            </span>
          </div>

          <form className="flex w-full lg:col-start-2" role="search">
            <label className="sr-only" htmlFor="news-search">
              뉴스 검색
            </label>
            <input
              className="min-w-0 flex-1 border border-r-0 border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-teal-600"
              id="news-search"
              name="query"
              placeholder="뉴스 제목이나 키워드를 검색하세요"
              type="search"
            />
            <button
              className="border border-teal-700 bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
              type="submit"
            >
              검색
            </button>
          </form>
        </div>

        <nav aria-label="뉴스 카테고리" className="border-t border-slate-100">
          <div className="mx-auto grid w-full max-w-7xl px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,760px)_minmax(0,1fr)]">
            <ul className="flex gap-1 overflow-x-auto lg:col-start-2">
              {categories.map((category, index) => (
                <li key={category}>
                  <a
                    aria-current={index === 0 ? "page" : undefined}
                    className={`block whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${
                      index === 0
                        ? "border-teal-700 text-teal-700"
                        : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-950"
                    }`}
                    href={index === 0 ? "/" : `/?category=${category}`}
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,760px)_minmax(0,1fr)] lg:py-8">
        <div
          aria-hidden="true"
          className="hidden min-w-0 lg:block"
          data-layout-slot="left"
        />

        <section className="min-w-0 border border-slate-200 bg-white lg:col-start-2">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
            <div>
              <p className="text-xs font-semibold text-teal-700">LATEST NEWS</p>
              <h1 className="mt-1 text-lg font-bold text-slate-950">최신 기사</h1>
            </div>
            <p className="text-xs text-slate-500">
              총 <strong className="text-slate-700">{mockArticles.length}</strong>
              건의 mock 기사
            </p>
          </div>

          <ol className="divide-y divide-slate-100">
            {mockArticles.map((article) => (
              <li className="group px-4 py-4 hover:bg-slate-50 sm:px-5" key={article.id}>
                <article className="grid gap-2 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                  <div>
                    <span className="inline-flex border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600">
                      {article.category}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h2 className="flex min-w-0 items-center gap-2 text-sm font-semibold leading-6 text-slate-900 group-hover:text-teal-800 sm:text-[15px]">
                      {article.isBreaking ? (
                        <span className="shrink-0 bg-red-50 px-1.5 py-0.5 text-[11px] font-bold text-red-700">
                          속보
                        </span>
                      ) : null}
                      <span>{article.title}</span>
                    </h2>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <span className="font-medium text-slate-500">
                        {article.source}
                      </span>
                      <time>{article.publishedAt}</time>
                      {article.metadata ? <span>{article.metadata}</span> : null}
                    </div>
                  </div>
                  <span
                    aria-hidden="true"
                    className="hidden text-lg text-slate-300 group-hover:text-teal-700 sm:block"
                  >
                    ›
                  </span>
                </article>
              </li>
            ))}
          </ol>
        </section>

        <div
          aria-hidden="true"
          className="hidden min-w-0 lg:block"
          data-layout-slot="right"
        />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-7xl px-4 py-5 text-xs text-slate-400 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,760px)_minmax(0,1fr)]">
          <div className="flex flex-col gap-1 lg:col-start-2">
            <strong className="font-semibold text-slate-600">NewsLab Web</strong>
            <span>현재 화면의 기사는 UI 확인을 위한 mock data입니다.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
