import type { TopicArticle } from "@/lib/api/topics";

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

function formatRole(role: string) {
  if (role === "representative") {
    return "대표 기사";
  }

  if (role === "supporting") {
    return "관련 기사";
  }

  return role;
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

export function TopicArticleList({ articles }: { articles: TopicArticle[] }) {
  return (
    <section
      aria-labelledby="related-articles-heading"
      className="border border-slate-200 bg-white"
    >
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <p className="text-xs font-semibold text-teal-700">RELATED ARTICLES</p>
          <h2
            className="mt-1 text-lg font-bold text-slate-950"
            id="related-articles-heading"
          >
            관련 기사
          </h2>
        </div>
        <p className="text-xs text-slate-500">총 {articles.length}건</p>
      </div>

      {articles.length > 0 ? (
        <ul className="divide-y divide-slate-100">
          {articles.map((article) => {
            const articleUrl = getSafeArticleUrl(article.url);

            return (
              <li className="px-5 py-5" key={article.article_id}>
                <article>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="bg-teal-700 px-2 py-1 font-semibold text-white">
                      {formatRole(article.role)}
                    </span>
                    <span className="font-medium text-slate-500">
                      {article.source}
                    </span>
                    <span className="text-slate-400">
                      유사도 {article.similarity_score.toFixed(2)}
                    </span>
                  </div>

                  <h3 className="mt-3 break-words text-base font-bold leading-7 text-slate-950">
                    {articleUrl ? (
                      <a
                        aria-label={`${article.title} 원문 기사 새 탭에서 열기`}
                        className="hover:text-teal-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
                        href={articleUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {article.title}
                      </a>
                    ) : (
                      article.title
                    )}
                  </h3>

                  <time
                    className="mt-2 block text-xs text-slate-400"
                    dateTime={article.published_at ?? undefined}
                  >
                    {formatPublishedAt(article.published_at)}
                  </time>
                </article>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="px-5 py-14 text-center">
          <p className="text-sm font-semibold text-slate-700">
            연결된 기사가 없습니다.
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            관련 기사가 연결되면 이곳에 표시됩니다.
          </p>
        </div>
      )}
    </section>
  );
}
