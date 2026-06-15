export type Article = {
  id: number;
  source_id: number;
  source: string;
  title: string;
  url: string;
  category: string;
  summary: string | null;
  published_at: string | null;
  tags: string[];
  created_at: string;
};

export type ArticlesResponse = {
  page: number;
  page_size: number;
  count: number;
  total: number;
  has_next: boolean;
  articles: Article[];
};

export type ArticleFilters = {
  query?: string;
  category?: string;
};

function isArticle(value: unknown): value is Article {
  if (!value || typeof value !== "object") {
    return false;
  }

  const article = value as Partial<Article>;

  return (
    typeof article.id === "number" &&
    typeof article.source_id === "number" &&
    typeof article.source === "string" &&
    typeof article.title === "string" &&
    typeof article.url === "string" &&
    typeof article.category === "string" &&
    (typeof article.summary === "string" || article.summary === null) &&
    (typeof article.published_at === "string" ||
      article.published_at === null) &&
    Array.isArray(article.tags) &&
    article.tags.every((tag) => typeof tag === "string") &&
    typeof article.created_at === "string"
  );
}

function isArticlesResponse(value: unknown): value is ArticlesResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Partial<ArticlesResponse>;

  return (
    typeof response.page === "number" &&
    typeof response.page_size === "number" &&
    typeof response.count === "number" &&
    typeof response.total === "number" &&
    typeof response.has_next === "boolean" &&
    Array.isArray(response.articles) &&
    response.articles.every(isArticle)
  );
}

export async function getArticles(
  page = 1,
  pageSize = 10,
  filters: ArticleFilters = {},
): Promise<ArticlesResponse> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_NEWSLAB_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("Articles API base URL is not configured.");
  }

  const endpoint = new URL("/articles", apiBaseUrl);
  endpoint.searchParams.set("page", String(page));
  endpoint.searchParams.set("page_size", String(pageSize));

  const query = filters.query?.trim();
  const category = filters.category?.trim();

  if (query) {
    endpoint.searchParams.set("keyword", query);
  }

  if (category) {
    endpoint.searchParams.set("category", category);
  }

  const response = await fetch(endpoint, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      `Articles API request failed with status ${response.status}.`,
    );
  }

  const data: unknown = await response.json();

  if (!isArticlesResponse(data)) {
    throw new Error("Articles API returned an unexpected response.");
  }

  return data;
}
