import Link from "next/link";
import { HeaderArticleSearch } from "@/components/layout/HeaderArticleSearch";

const categories = [
  { label: "전체", value: "all" },
  { label: "정치", value: "politics" },
  { label: "경제", value: "economy" },
  { label: "기술", value: "tech" },
  { label: "세계", value: "world" },
  { label: "사회", value: "society" },
  { label: "AI", value: "ai" },
];

export function SiteHeader({
  activeCategory,
  initialQuery,
}: {
  activeCategory?: string;
  initialQuery?: string;
}) {
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

        <HeaderArticleSearch
          initialCategory={activeCategory}
          initialQuery={initialQuery}
        />
      </div>

      <nav aria-label="뉴스 카테고리" className="border-t border-slate-100">
        <div className="mx-auto grid w-full max-w-7xl px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,760px)_minmax(0,1fr)]">
          <ul className="flex gap-1 overflow-x-auto lg:col-start-2">
            {categories.map((category) => {
              const isActive = category.value === activeCategory;

              return (
                <li key={category.value}>
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={`block whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${
                      isActive
                        ? "border-teal-700 text-teal-700"
                        : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-950"
                    }`}
                    href={
                      category.value === "all"
                        ? "/articles"
                        : `/articles?category=${category.value}`
                    }
                  >
                    {category.label}
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
