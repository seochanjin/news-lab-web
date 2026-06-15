export function PageShell({
  children,
  className = "space-y-6",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,960px)_minmax(0,1fr)]">
      <div
        aria-hidden="true"
        className="hidden min-w-0 lg:block"
        data-layout-slot="left"
      />
      <div className={`min-w-0 lg:col-start-2 ${className}`}>{children}</div>
      <div
        aria-hidden="true"
        className="hidden min-w-0 lg:block"
        data-layout-slot="right"
      />
    </main>
  );
}
