"use client";

import { useRouter } from "next/navigation";

export function HeaderArticleSearch({
  initialCategory,
  initialQuery = "",
}: {
  initialCategory?: string;
  initialQuery?: string;
}) {
  const router = useRouter();

  function submitSearch(formData: FormData) {
    const query = String(formData.get("query") ?? "").trim();
    const searchParams = new URLSearchParams();

    if (query) {
      searchParams.set("query", query);
    }

    if (initialCategory && initialCategory !== "all") {
      searchParams.set("category", initialCategory);
    }

    const suffix = searchParams.toString();
    router.push(suffix ? `/articles?${suffix}` : "/articles");
  }

  return (
    <form
      action={submitSearch}
      className="flex w-full lg:col-start-2"
      role="search"
    >
      <label className="sr-only" htmlFor="news-search">
        기사 검색
      </label>
      <input
        aria-label="기사 제목이나 키워드 검색"
        className="min-w-0 flex-1 border border-r-0 border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-teal-600"
        defaultValue={initialQuery}
        id="news-search"
        key={initialQuery}
        name="query"
        placeholder="기사 제목이나 키워드를 검색하세요"
        type="search"
      />
      <button
        className="border border-teal-700 bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
        type="submit"
      >
        검색
      </button>
    </form>
  );
}
