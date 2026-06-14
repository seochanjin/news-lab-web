import { notFound } from "next/navigation";
import { TopicDetail } from "@/components/topics/TopicDetail";
import {
  getTopicDetail,
  TopicNotFoundError,
  type TopicDetail as TopicDetailData,
} from "@/lib/api/topics";

function parseTopicId(value: string) {
  if (!/^[1-9]\d*$/.test(value)) {
    return undefined;
  }

  const id = Number(value);

  return Number.isSafeInteger(id) ? id : undefined;
}

async function loadTopic(id: number): Promise<TopicDetailData> {
  try {
    return await getTopicDetail(id);
  } catch (error) {
    if (error instanceof TopicNotFoundError) {
      notFound();
    }

    throw error;
  }
}

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = parseTopicId(rawId);

  if (!id) {
    notFound();
  }

  const topic = await loadTopic(id);

  return <TopicDetail topic={topic} />;
}
