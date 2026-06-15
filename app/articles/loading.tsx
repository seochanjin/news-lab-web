import { ArticlePageState } from "@/components/articles/ArticlePageState";

export default function Loading() {
  return (
    <ArticlePageState
      description="검색 조건에 맞는 article 데이터를 가져오고 있습니다."
      title="기사를 불러오는 중입니다."
    />
  );
}
