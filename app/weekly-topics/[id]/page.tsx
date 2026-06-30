import { notFound } from "next/navigation";
import { PeriodTopicDetail } from "@/components/topics/PeriodTopicDetail";
import {
  getWeeklyTopicDetail,
  PeriodTopicNotFoundError,
  type PeriodTopicDetail as PeriodTopicDetailData,
} from "@/lib/api/topics";

function parseTopicId(value: string) {
  if (!/^[1-9]\d*$/.test(value)) {
    return undefined;
  }

  const id = Number(value);

  return Number.isSafeInteger(id) ? id : undefined;
}

async function loadTopic(id: number): Promise<PeriodTopicDetailData> {
  try {
    return await getWeeklyTopicDetail(id);
  } catch (error) {
    if (error instanceof PeriodTopicNotFoundError) {
      notFound();
    }

    throw error;
  }
}

export default async function WeeklyTopicDetailPage({
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

  return <PeriodTopicDetail eyebrow="지난주 흐름" topic={topic} />;
}

