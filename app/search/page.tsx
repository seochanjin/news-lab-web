import { ArticleList, ArticleListState } from "@/components/articles/ArticleList";
import { PageShell } from "@/components/layout/PageShell";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TopicCard } from "@/components/topics/TopicCard";
import { getArticles, type Article } from "@/lib/api/articles";
import {
  getTopicDetail,
  getTopics,
  type Topic,
  type TopicArticle,
} from "@/lib/api/topics";

function getSearchParam(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function matchesTopicSearch(topic: Topic, normalizedQuery: string) {
  return [
    topic.title_ko,
    topic.summary_ko,
    topic.topic_date,
    ...topic.keywords,
  ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
}

function toArticle(topicArticle: TopicArticle): Article {
  return {
    id: topicArticle.article_id,
    source_id: 0,
    source: topicArticle.source,
    title: topicArticle.title,
    url: topicArticle.url,
    category: "관련 원문",
    summary: null,
    published_at: topicArticle.published_at,
    tags: [],
    created_at: topicArticle.published_at ?? "",
  };
}

function mergeUniqueArticles(
  linkedArticles: Article[],
  directArticles: Article[],
) {
  const articleIds = new Set<number>();
  const articleUrls = new Set<string>();
  const mergedArticles: Article[] = [];

  for (const article of [...linkedArticles, ...directArticles]) {
    const normalizedUrl = article.url.trim();

    if (
      articleIds.has(article.id) ||
      (normalizedUrl && articleUrls.has(normalizedUrl))
    ) {
      continue;
    }

    articleIds.add(article.id);

    if (normalizedUrl) {
      articleUrls.add(normalizedUrl);
    }

    mergedArticles.push(article);
  }

  return mergedArticles;
}

async function getLinkedTopicArticles(topics: Topic[]) {
  const detailResults = await Promise.allSettled(
    topics.slice(0, 3).map((topic) => getTopicDetail(topic.id)),
  );

  return detailResults.flatMap((result) =>
    result.status === "fulfilled"
      ? result.value.articles.slice(0, 3).map(toArticle)
      : [],
  );
}

async function getSearchResults(query: string) {
  const [topicsResult, articlesResult] = await Promise.allSettled([
    getTopics(1, 50),
    getArticles(1, 10, { query }),
  ]);

  const topics =
    topicsResult.status === "fulfilled"
      ? topicsResult.value.items.filter((topic) =>
          matchesTopicSearch(topic, query.toLocaleLowerCase()),
        )
      : null;
  const linkedArticles = topics ? await getLinkedTopicArticles(topics) : [];
  const directArticles =
    articlesResult.status === "fulfilled" ? articlesResult.value.articles : null;

  return {
    topics,
    articles:
      directArticles === null && linkedArticles.length === 0
        ? null
        : mergeUniqueArticles(linkedArticles, directArticles ?? []),
  };
}

function SearchSectionHeader({
  headingId,
  eyebrow,
  title,
  count,
}: {
  headingId: string;
  eyebrow: string;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 px-5 py-4">
      <div>
        <p className="text-xs font-semibold text-teal-700">{eyebrow}</p>
        <h2
          className="mt-1 text-lg font-bold text-slate-950"
          id={headingId}
        >
          {title}
        </h2>
      </div>
      {typeof count === "number" ? (
        <p className="text-xs text-slate-500">{count}건 표시</p>
      ) : null}
    </div>
  );
}

function TopicSearchResults({ topics }: { topics: Topic[] | null }) {
  return (
    <section
      aria-labelledby="topic-search-results-heading"
      className="border border-slate-200 bg-white"
    >
      <SearchSectionHeader
        count={topics?.length}
        eyebrow="TOPIC RESULTS"
        headingId="topic-search-results-heading"
        title="주요 이슈"
      />
      {topics === null ? (
        <ArticleListState
          description="잠시 후 다시 검색해 주세요."
          title="주요 이슈 검색 결과를 불러오지 못했습니다."
        />
      ) : topics.length > 0 ? (
        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      ) : (
        <ArticleListState
          description="다른 검색어로 다시 시도해 보세요."
          title="조건에 맞는 주요 이슈가 없습니다."
        />
      )}
    </section>
  );
}

function ArticleSearchResults({
  articles,
}: {
  articles: Article[] | null;
}) {
  return (
    <section
      aria-labelledby="article-search-results-heading"
      className="border border-slate-200 bg-white"
    >
      <SearchSectionHeader
        count={articles?.length}
        eyebrow="ARTICLE RESULTS"
        headingId="article-search-results-heading"
        title="원문 모음"
      />
      <p className="border-b border-slate-100 px-5 py-3 text-xs leading-5 text-slate-500">
        검색된 주요 이슈에 연결된 원문 기사와 직접 검색 결과를 함께
        보여줍니다.
      </p>
      {articles === null ? (
        <ArticleListState
          description="잠시 후 다시 검색해 주세요."
          title="원문 기사 검색 결과를 불러오지 못했습니다."
        />
      ) : articles.length > 0 ? (
        <ArticleList articles={articles} />
      ) : (
        <ArticleListState
          description="다른 검색어로 다시 시도해 보세요."
          title="조건에 맞는 원문 기사가 없습니다."
        />
      )}
    </section>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string | string[] }>;
}) {
  const query = getSearchParam((await searchParams).query);
  const results = query ? await getSearchResults(query) : null;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <SiteHeader initialQuery={query} />

      <PageShell>
        <section className="border border-slate-200 bg-white px-5 py-6 sm:px-7 sm:py-7">
          <p className="text-xs font-semibold text-teal-700">
            INTEGRATED SEARCH
          </p>
          <h1 className="mt-2 break-words text-2xl font-bold text-slate-950 sm:text-3xl">
            {query ? `검색 결과: ${query}` : "통합 검색"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            {query
              ? "주요 이슈를 먼저 확인하고, 아래에서 관련 원문 기사를 살펴보세요."
              : "Header 검색창에서 주요 이슈와 원문 기사에 사용할 검색어를 입력하세요."}
          </p>
        </section>

        {results ? (
          <>
            <TopicSearchResults topics={results.topics} />
            <ArticleSearchResults articles={results.articles} />
          </>
        ) : null}
      </PageShell>
    </div>
  );
}
