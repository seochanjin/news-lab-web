import Link from "next/link";

function getVisiblePages(page: number, totalPages: number) {
  const windowSize = 2;
  const pages = new Set<number>();

  pages.add(1);
  pages.add(totalPages);

  for (let candidate = page - windowSize; candidate <= page + windowSize; candidate += 1) {
    if (candidate >= 1 && candidate <= totalPages) {
      pages.add(candidate);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

const buttonClassName =
  "inline-flex min-h-11 min-w-11 items-center justify-center border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:border-teal-600 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700";
const disabledClassName =
  "inline-flex min-h-11 min-w-11 cursor-not-allowed items-center justify-center border border-slate-200 bg-slate-100 px-3 text-sm font-semibold text-slate-400";
const activeClassName =
  "inline-flex min-h-11 min-w-11 items-center justify-center border border-teal-700 bg-teal-700 px-3 text-sm font-semibold text-white";

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages(page, totalPages);
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav
      aria-label="페이지 이동"
      className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-200 bg-white px-4 py-5 sm:px-5"
    >
      {hasPrevious ? (
        <Link aria-label="이전 페이지" className={buttonClassName} href={buildHref(page - 1)}>
          이전
        </Link>
      ) : (
        <span aria-hidden="true" className={disabledClassName}>
          이전
        </span>
      )}

      {visiblePages.map((visiblePage, index) => {
        const previousVisible = visiblePages[index - 1];
        const showEllipsis =
          previousVisible !== undefined && visiblePage - previousVisible > 1;

        return (
          <span className="flex items-center gap-2" key={visiblePage}>
            {showEllipsis ? (
              <span aria-hidden="true" className="px-1 text-sm text-slate-400">
                …
              </span>
            ) : null}
            {visiblePage === page ? (
              <span aria-current="page" className={activeClassName}>
                {visiblePage}
              </span>
            ) : (
              <Link
                aria-label={`${visiblePage}페이지로 이동`}
                className={buttonClassName}
                href={buildHref(visiblePage)}
              >
                {visiblePage}
              </Link>
            )}
          </span>
        );
      })}

      {hasNext ? (
        <Link aria-label="다음 페이지" className={buttonClassName} href={buildHref(page + 1)}>
          다음
        </Link>
      ) : (
        <span aria-hidden="true" className={disabledClassName}>
          다음
        </span>
      )}
    </nav>
  );
}
