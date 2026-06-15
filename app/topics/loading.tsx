import { TopicExplorerState } from "@/components/topics/TopicExplorerState";

export default function Loading() {
  return (
    <TopicExplorerState
      description="검색과 날짜 필터에 사용할 topic 데이터를 가져오고 있습니다."
      title="주요 이슈 목록을 불러오는 중입니다."
    />
  );
}
