import Link from "next/link";
import { TopicDetailState } from "@/components/topics/TopicDetailState";

export default function NotFound() {
  return (
    <TopicDetailState
      action={
        <Link
          className="inline-flex bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          href="/"
        >
          주요 이슈 목록으로 돌아가기
        </Link>
      }
      description="주소를 확인하거나 주요 이슈 목록에서 다시 선택해 주세요."
      title="해당 주요 이슈를 찾을 수 없습니다."
    />
  );
}
