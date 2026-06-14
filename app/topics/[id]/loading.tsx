import { TopicDetailState } from "@/components/topics/TopicDetailState";

export default function Loading() {
  return (
    <TopicDetailState
      description="요약과 연결 기사 데이터를 가져오고 있습니다."
      title="주요 이슈 상세를 불러오는 중입니다."
    />
  );
}
