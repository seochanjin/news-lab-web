export type Topic = {
  id: number;
  topic_date: string;
  title_ko: string;
  summary_ko: string;
  keywords: string[];
  source_count: number;
  article_count: number;
  provider: string;
  model: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type TopicsResponse = {
  items: Topic[];
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
};

function isTopic(value: unknown): value is Topic {
  if (!value || typeof value !== "object") {
    return false;
  }

  const topic = value as Partial<Topic>;

  return (
    typeof topic.id === "number" &&
    typeof topic.topic_date === "string" &&
    typeof topic.title_ko === "string" &&
    typeof topic.summary_ko === "string" &&
    Array.isArray(topic.keywords) &&
    topic.keywords.every((keyword) => typeof keyword === "string") &&
    typeof topic.source_count === "number" &&
    typeof topic.article_count === "number" &&
    typeof topic.provider === "string" &&
    typeof topic.model === "string" &&
    typeof topic.status === "string" &&
    typeof topic.created_at === "string" &&
    typeof topic.updated_at === "string"
  );
}

function isTopicsResponse(value: unknown): value is TopicsResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Partial<TopicsResponse>;

  return (
    Array.isArray(response.items) &&
    response.items.every(isTopic) &&
    typeof response.page === "number" &&
    typeof response.page_size === "number" &&
    typeof response.total === "number" &&
    typeof response.has_next === "boolean"
  );
}

export async function getTopics(
  page = 1,
  pageSize = 10,
): Promise<TopicsResponse> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_NEWSLAB_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("Topics API base URL is not configured.");
  }

  const endpoint = new URL("/topics", apiBaseUrl);
  endpoint.searchParams.set("page", String(page));
  endpoint.searchParams.set("page_size", String(pageSize));

  const response = await fetch(endpoint, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Topics API request failed with status ${response.status}.`);
  }

  const data: unknown = await response.json();

  if (!isTopicsResponse(data)) {
    throw new Error("Topics API returned an unexpected response.");
  }

  return data;
}
