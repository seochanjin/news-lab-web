import type { Article } from "@/lib/api/articles";

const categoryLabels: Record<string, string> = {
  ai: "AI",
  business: "경제",
  economy: "경제",
  politics: "정치",
  society: "사회",
  tech: "기술",
  technology: "기술",
  world: "세계",
};

function formatCategory(category: string) {
  const normalizedCategory = category.trim().toLowerCase();

  return categoryLabels[normalizedCategory] || category.trim() || "기타";
}

function formatPublishedAt(publishedAt: string | null) {
  if (!publishedAt) {
    return "발행 시간 미상";
  }

  const date = new Date(publishedAt);

  if (Number.isNaN(date.getTime())) {
    return "발행 시간 미상";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(date);
}

function getSafeArticleUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    return ["http:", "https:"].includes(parsedUrl.protocol)
      ? parsedUrl.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function getArticleMetadata(article: Article) {
  const summary = article.summary?.trim();

  if (summary) {
    return summary;
  }

  if (article.tags.length > 0) {
    return article.tags
      .slice(0, 3)
      .map((tag) => `#${tag}`)
      .join(" ");
  }

  return undefined;
}

export function ArticleList({ articles }: { articles: Article[] }) {
  return (
    <ol className="divide-y divide-slate-100">
      {articles.map((article) => {
        const articleUrl = getSafeArticleUrl(article.url);
        const metadata = getArticleMetadata(article);

        return (
          <li
            className="group px-4 py-4 hover:bg-slate-50 sm:px-5"
            key={article.id}
          >
            <article className="grid gap-2 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
              <div>
                <span className="inline-flex border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600">
                  {formatCategory(article.category)}
                </span>
              </div>
              <div className="min-w-0">
                <h2 className="break-words text-sm font-semibold leading-6 text-slate-900 group-hover:text-teal-800 sm:text-[15px]">
                  {articleUrl ? (
                    <a
                      aria-label={`${article.title} 원문 기사 새 탭에서 열기`}
                      className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
                      href={articleUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {article.title}
                    </a>
                  ) : (
                    article.title
                  )}
                </h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                  <span className="font-medium text-slate-500">
                    {article.source}
                  </span>
                  <time dateTime={article.published_at ?? undefined}>
                    {formatPublishedAt(article.published_at)}
                  </time>
                </div>
                {metadata ? (
                  <p className="mt-2 line-clamp-2 break-words text-xs leading-5 text-slate-500">
                    {metadata}
                  </p>
                ) : null}
              </div>
              <span
                aria-hidden="true"
                className="hidden text-lg text-slate-300 group-hover:text-teal-700 sm:block"
              >
                ›
              </span>
            </article>
          </li>
        );
      })}
    </ol>
  );
}

export function ArticleListState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-5 py-16 text-center">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}
