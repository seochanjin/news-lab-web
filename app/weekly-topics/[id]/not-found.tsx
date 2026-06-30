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
          홈으로 돌아가기
        </Link>
      }
      description="주소를 확인하거나 홈 화면에서 다시 선택해 주세요."
      title="해당 지난주 흐름을 찾을 수 없습니다."
    />
  );
}
