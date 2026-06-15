"use client";

import { useEffect } from "react";
import { TopicExplorerState } from "@/components/topics/TopicExplorerState";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Topics list page error", error);
  }, [error]);

  return (
    <TopicExplorerState
      action={
        <button
          className="bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          onClick={() => unstable_retry()}
          type="button"
        >
          다시 시도
        </button>
      }
      description="잠시 후 다시 시도해 주세요."
      title="주요 이슈 목록을 불러오지 못했습니다."
    />
  );
}
