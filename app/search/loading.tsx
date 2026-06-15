import { ArticleListState } from "@/components/articles/ArticleList";
import { PageShell } from "@/components/layout/PageShell";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <SiteHeader />
      <PageShell className="">
        <section className="border border-slate-200 bg-white">
          <ArticleListState
            description="주요 이슈와 원문 기사 결과를 가져오는 중입니다."
            title="검색 결과를 불러오고 있습니다."
          />
        </section>
      </PageShell>
    </div>
  );
}
