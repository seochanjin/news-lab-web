"use client";

import { useRouter } from "next/navigation";

export function HeaderArticleSearch({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const router = useRouter();

  function submitSearch(formData: FormData) {
    const query = String(formData.get("query") ?? "").trim();
    const searchParams = new URLSearchParams();

    if (query) {
      searchParams.set("query", query);
    }

    const suffix = searchParams.toString();
    router.push(suffix ? `/search?${suffix}` : "/search");
  }

  return (
    <form
      action={submitSearch}
      className="flex w-full"
      role="search"
    >
      <label className="sr-only" htmlFor="news-search">
        주요 이슈와 원문 기사 통합 검색
      </label>
      <input
        aria-label="주요 이슈와 원문 기사 검색"
        className="min-w-0 flex-1 border border-r-0 border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-teal-600"
        defaultValue={initialQuery}
        id="news-search"
        key={initialQuery}
        name="query"
        placeholder="주요 이슈와 원문 기사를 검색하세요"
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
