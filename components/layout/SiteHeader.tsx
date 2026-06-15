import Link from "next/link";
import { HeaderArticleSearch } from "@/components/layout/HeaderArticleSearch";

const navigation = [
  { label: "주요 이슈", href: "/topics", section: "topics" },
  { label: "원문 모음", href: "/articles", section: "articles" },
];

export function SiteHeader({
  activeSection,
  initialQuery,
}: {
  activeSection?: "topics" | "articles";
  initialQuery?: string;
}) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-7xl px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,960px)_minmax(0,1fr)] lg:py-5">
        <div className="grid min-w-0 gap-4 md:grid-cols-[auto_minmax(280px,1fr)] md:items-center lg:col-start-2">
          <div className="flex min-w-0 items-baseline gap-3">
            <Link
              className="text-2xl font-black text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
              href="/"
            >
              NewsLab
            </Link>
            <span className="hidden whitespace-nowrap text-xs font-medium text-slate-400 sm:inline">
              뉴스를 한눈에
            </span>
          </div>

          <HeaderArticleSearch initialQuery={initialQuery} />
        </div>
      </div>

      <nav aria-label="서비스 탐색" className="border-t border-slate-100">
        <div className="mx-auto grid w-full max-w-7xl px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,960px)_minmax(0,1fr)]">
          <ul className="flex gap-1 lg:col-start-2">
            {navigation.map((item) => {
              const isActive = item.section === activeSection;

              return (
                <li key={item.section}>
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={`block whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${
                      isActive
                        ? "border-teal-700 text-teal-700"
                        : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-950"
                    }`}
                    href={item.href}
                  >
                    {item.label}
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
