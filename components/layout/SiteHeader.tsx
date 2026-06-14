import Link from "next/link";

const categories = ["전체", "정치", "경제", "기술", "세계", "사회", "AI"];

export function SiteHeader({ activeCategory }: { activeCategory?: string }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,760px)_minmax(0,1fr)] lg:items-center lg:py-6">
        <div className="flex items-baseline gap-3 lg:justify-self-start">
          <Link
            className="text-2xl font-black text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
            href="/"
          >
            NewsLab
          </Link>
          <span className="text-xs font-medium text-slate-400">
            뉴스를 한눈에
          </span>
        </div>

        <form action="/" className="flex w-full lg:col-start-2" role="search">
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
            {categories.map((category, index) => {
              const isActive = category === activeCategory;

              return (
                <li key={category}>
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={`block whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${
                      isActive
                        ? "border-teal-700 text-teal-700"
                        : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-950"
                    }`}
                    href={index === 0 ? "/" : `/?category=${category}`}
                  >
                    {category}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </header>
  );
}
