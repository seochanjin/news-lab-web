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

export type HomeTopic = {
  id: number;
  topic_date: string | null;
  title_ko: string;
  summary_ko: string;
  keywords: string[];
  source_count: number;
  article_count: number;
};

export type TopicsResponse = {
  items: Topic[];
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
};

export type HomeTopicsResponse = {
  generated_at: string;
  topic_date: string | null;
  items: HomeTopic[];
};

export type PeriodTopicHomeItem = {
  id: number;
  topic_date: string | null;
  period_start: string | null;
  period_end: string | null;
  title_ko: string;
  summary_ko: string;
};

export type PeriodTopicsHomeResponse = {
  generated_at: string | null;
  topic_date: string | null;
  period_start: string | null;
  period_end: string | null;
  items: PeriodTopicHomeItem[];
};

export type TopicArticle = {
  article_id: number;
  title: string;
  url: string;
  source: string;
  published_at: string | null;
  role: "representative" | "supporting" | string;
  similarity_score: number;
};

export type PeriodTopicArticleResponse = {
  article_id: number;
  title: string;
  url: string;
  published_at: string | null;
  source: string;
  rank: number;
  similarity: number;
  is_representative: boolean;
  is_summary_evidence: boolean;
};

export type ThreeDayTopicDetailResponse = {
  id: number;
  reference_date: string;
  window_start: string;
  window_end: string;
  title_ko: string;
  summary_ko: string;
  key_points: string[];
  keywords: string[];
  article_count: number;
  source_count: number;
  status: string;
  provider: string;
  model: string;
  prompt_version: string;
  created_at: string;
  updated_at: string;
  articles: PeriodTopicArticleResponse[];
};

export type WeeklyTopicDetailResponse = {
  id: number;
  week_start: string;
  week_end: string;
  window_start: string;
  window_end: string;
  title_ko: string;
  summary_ko: string;
  key_points: string[];
  keywords: string[];
  confidence: number | null;
  article_count: number;
  source_count: number;
  status: string;
  provider: string;
  model: string;
  prompt_version: string;
  created_at: string;
  updated_at: string;
  articles: PeriodTopicArticleResponse[];
};

export type TopicDetail = Topic & {
  topic_candidate_id: string;
  key_points: string[];
  confidence: number;
  summary_input_hash: string;
  articles: TopicArticle[];
};

export type PeriodTopicDetail = {
  id: number;
  topic_date: string | null;
  period_start: string | null;
  period_end: string | null;
  title_ko: string;
  summary_ko: string;
  keywords: string[];
  source_count: number;
  article_count: number;
  key_points: string[];
  articles: TopicArticle[];
};

export class TopicNotFoundError extends Error {
  constructor(id: number) {
    super(`Topic ${id} was not found.`);
    this.name = "TopicNotFoundError";
  }
}

export class PeriodTopicNotFoundError extends Error {
  constructor(
    readonly kind: "three-day" | "weekly",
    readonly id: number,
  ) {
    super(`${kind} topic ${id} was not found.`);
    this.name = "PeriodTopicNotFoundError";
  }
}

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

function getNullableStringProperty(
  value: Record<string, unknown>,
  keys: string[],
) {
  for (const key of keys) {
    const field = value[key];

    if (typeof field === "string" || field === null) {
      return field;
    }
  }

  return null;
}

function isHomeTopic(value: unknown): value is HomeTopic {
  if (!value || typeof value !== "object") {
    return false;
  }

  const topic = value as Partial<HomeTopic>;

  return (
    typeof topic.id === "number" &&
    (typeof topic.topic_date === "string" || topic.topic_date === null) &&
    typeof topic.title_ko === "string" &&
    typeof topic.summary_ko === "string" &&
    Array.isArray(topic.keywords) &&
    topic.keywords.every((keyword) => typeof keyword === "string") &&
    typeof topic.source_count === "number" &&
    typeof topic.article_count === "number"
  );
}

function toPeriodTopicHomeItem(value: unknown): PeriodTopicHomeItem | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const topic = value as Record<string, unknown>;

  if (
    typeof topic.id !== "number" ||
    typeof topic.title_ko !== "string" ||
    typeof topic.summary_ko !== "string"
  ) {
    return undefined;
  }

  return {
    id: topic.id,
    topic_date: getNullableStringProperty(topic, ["topic_date", "date"]),
    period_start: getNullableStringProperty(topic, [
      "period_start",
      "start_date",
      "from_date",
    ]),
    period_end: getNullableStringProperty(topic, [
      "period_end",
      "end_date",
      "to_date",
    ]),
    title_ko: topic.title_ko,
    summary_ko: topic.summary_ko,
  };
}

function isTopicArticle(value: unknown): value is TopicArticle {
  if (!value || typeof value !== "object") {
    return false;
  }

  const article = value as Partial<TopicArticle>;

  return (
    typeof article.article_id === "number" &&
    typeof article.title === "string" &&
    typeof article.url === "string" &&
    typeof article.source === "string" &&
    (typeof article.published_at === "string" ||
      article.published_at === null) &&
    typeof article.role === "string" &&
    typeof article.similarity_score === "number"
  );
}

function isPeriodTopicArticle(
  value: unknown,
): value is PeriodTopicArticleResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const article = value as Partial<PeriodTopicArticleResponse>;

  return (
    typeof article.article_id === "number" &&
    typeof article.title === "string" &&
    typeof article.url === "string" &&
    (typeof article.published_at === "string" ||
      article.published_at === null) &&
    typeof article.source === "string" &&
    typeof article.rank === "number" &&
    typeof article.similarity === "number" &&
    typeof article.is_representative === "boolean" &&
    typeof article.is_summary_evidence === "boolean"
  );
}

function toPeriodTopicArticle(article: PeriodTopicArticleResponse): TopicArticle {
  return {
    article_id: article.article_id,
    title: article.title,
    url: article.url,
    source: article.source,
    published_at: article.published_at,
    role: article.is_representative
      ? "representative"
      : article.is_summary_evidence
        ? "summary_evidence"
        : "supporting",
    similarity_score: article.similarity,
  };
}

function toPeriodTopicArticles(value: unknown) {
  return Array.isArray(value)
    ? value.filter(isPeriodTopicArticle).map(toPeriodTopicArticle)
    : [];
}

function toStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function isTopicDetail(value: unknown): value is TopicDetail {
  if (!isTopic(value)) {
    return false;
  }

  const topic = value as Partial<TopicDetail>;

  return (
    typeof topic.topic_candidate_id === "string" &&
    Array.isArray(topic.key_points) &&
    topic.key_points.every((point) => typeof point === "string") &&
    typeof topic.confidence === "number" &&
    typeof topic.summary_input_hash === "string" &&
    Array.isArray(topic.articles) &&
    topic.articles.every(isTopicArticle)
  );
}

function getPeriodDateFields(
  kind: "three-day" | "weekly",
  topic: Record<string, unknown>,
) {
  if (kind === "weekly") {
    return {
      topic_date: getNullableStringProperty(topic, ["week_start"]),
      period_start: getNullableStringProperty(topic, ["week_start"]),
      period_end: getNullableStringProperty(topic, ["week_end"]),
    };
  }

  return {
    topic_date: getNullableStringProperty(topic, ["reference_date"]),
    period_start: getNullableStringProperty(topic, ["window_start"]),
    period_end: getNullableStringProperty(topic, ["window_end"]),
  };
}

function toPeriodTopicDetail(
  kind: "three-day" | "weekly",
  value: unknown,
): PeriodTopicDetail | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const topic = value as Record<string, unknown>;
  const dateFields = getPeriodDateFields(kind, topic);

  if (
    typeof topic.id !== "number" ||
    typeof topic.title_ko !== "string" ||
    typeof topic.summary_ko !== "string"
  ) {
    return undefined;
  }

  return {
    id: topic.id,
    topic_date: dateFields.topic_date,
    period_start: dateFields.period_start,
    period_end: dateFields.period_end,
    title_ko: topic.title_ko,
    summary_ko: topic.summary_ko,
    keywords: toStringArray(topic.keywords),
    source_count:
      typeof topic.source_count === "number" ? topic.source_count : 0,
    article_count:
      typeof topic.article_count === "number" ? topic.article_count : 0,
    key_points: toStringArray(topic.key_points),
    articles: toPeriodTopicArticles(topic.articles),
  };
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

function isHomeTopicsResponse(value: unknown): value is HomeTopicsResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Partial<HomeTopicsResponse>;

  return (
    typeof response.generated_at === "string" &&
    (typeof response.topic_date === "string" || response.topic_date === null) &&
    Array.isArray(response.items) &&
    response.items.every(isHomeTopic)
  );
}

function toPeriodTopicsHomeResponse(
  value: unknown,
): PeriodTopicsHomeResponse | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const response = value as Record<string, unknown>;

  if (!Array.isArray(response.items)) {
    return undefined;
  }

  const items = response.items.flatMap((item) => {
    const topic = toPeriodTopicHomeItem(item);

    return topic ? [topic] : [];
  });

  if (items.length !== response.items.length) {
    return undefined;
  }

  return {
    generated_at:
      typeof response.generated_at === "string" ? response.generated_at : null,
    topic_date: getNullableStringProperty(response, ["topic_date", "date"]),
    period_start: getNullableStringProperty(response, [
      "period_start",
      "start_date",
      "from_date",
    ]),
    period_end: getNullableStringProperty(response, [
      "period_end",
      "end_date",
      "to_date",
    ]),
    items,
  };
}

function getTopicsApiBaseUrl() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_NEWSLAB_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("Topics API base URL is not configured.");
  }

  return apiBaseUrl;
}

export async function getHomeTopics(): Promise<HomeTopicsResponse> {
  const response = await fetch(new URL("/topics/home", getTopicsApiBaseUrl()), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Home topics API request failed with status ${response.status}.`,
    );
  }

  const data: unknown = await response.json();

  if (!isHomeTopicsResponse(data)) {
    throw new Error("Home topics API returned an unexpected response.");
  }

  return data;
}

async function getPeriodTopicsHome(
  pathname: "/three-day-topics/home" | "/weekly-topics/home",
): Promise<PeriodTopicsHomeResponse> {
  const response = await fetch(new URL(pathname, getTopicsApiBaseUrl()), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Period topics API request failed with status ${response.status}.`,
    );
  }

  const data: unknown = await response.json();
  const periodTopics = toPeriodTopicsHomeResponse(data);

  if (!periodTopics) {
    throw new Error("Period topics API returned an unexpected response.");
  }

  return periodTopics;
}

export function getThreeDayTopicsHome(): Promise<PeriodTopicsHomeResponse> {
  return getPeriodTopicsHome("/three-day-topics/home");
}

export function getWeeklyTopicsHome(): Promise<PeriodTopicsHomeResponse> {
  return getPeriodTopicsHome("/weekly-topics/home");
}

export async function getTopics(
  page = 1,
  pageSize = 10,
): Promise<TopicsResponse> {
  const endpoint = new URL("/topics", getTopicsApiBaseUrl());
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

export async function getTopicDetail(id: number): Promise<TopicDetail> {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new TopicNotFoundError(id);
  }

  const response = await fetch(new URL(`/topics/${id}`, getTopicsApiBaseUrl()), {
    cache: "no-store",
  });

  if (response.status === 404) {
    throw new TopicNotFoundError(id);
  }

  if (!response.ok) {
    throw new Error(`Topics API request failed with status ${response.status}.`);
  }

  const data: unknown = await response.json();

  if (!isTopicDetail(data)) {
    throw new Error("Topics API returned an unexpected detail response.");
  }

  return data;
}

async function getPeriodTopicDetail(
  kind: "three-day" | "weekly",
  id: number,
): Promise<PeriodTopicDetail> {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new PeriodTopicNotFoundError(kind, id);
  }

  const pathname =
    kind === "three-day" ? `/three-day-topics/${id}` : `/weekly-topics/${id}`;
  const response = await fetch(new URL(pathname, getTopicsApiBaseUrl()), {
    cache: "no-store",
  });

  if (response.status === 404) {
    throw new PeriodTopicNotFoundError(kind, id);
  }

  if (!response.ok) {
    throw new Error(
      `Period topic API request failed with status ${response.status}.`,
    );
  }

  const data: unknown = await response.json();
  const topic = toPeriodTopicDetail(kind, data);

  if (!topic) {
    throw new Error("Period topic API returned an unexpected detail response.");
  }

  return topic;
}

export function getThreeDayTopicDetail(id: number): Promise<PeriodTopicDetail> {
  return getPeriodTopicDetail("three-day", id);
}

export function getWeeklyTopicDetail(id: number): Promise<PeriodTopicDetail> {
  return getPeriodTopicDetail("weekly", id);
}
