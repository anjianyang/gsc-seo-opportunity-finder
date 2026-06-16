import Link from "next/link";

export default function SampleReportPage() {
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <Link className="text-sm font-bold text-moss hover:text-ink" href="/">
          &lt;- Back to CSV upload
        </Link>
        <section className="mt-8 border border-ink/15 bg-white/70 p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">
            Sample report entry
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-ink">
            Pet Grooming Equipment SEO Opportunity Report
          </h1>
          <p className="mt-5 text-lg leading-8 text-ink/72">
            The full Markdown sample report lives in the project root as
            <span className="font-bold text-ink"> sample-report.md</span>. This
            page exists as the homepage entry point for the MVP upload flow.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="border border-ink/10 bg-cream p-4">
              <p className="text-3xl font-black text-ink">17</p>
              <p className="mt-1 text-sm text-ink/70">Opportunities found</p>
            </div>
            <div className="border border-ink/10 bg-cream p-4">
              <p className="text-3xl font-black text-ink">430-760</p>
              <p className="mt-1 text-sm text-ink/70">Estimated clicks/month</p>
            </div>
            <div className="border border-ink/10 bg-cream p-4">
              <p className="text-3xl font-black text-ink">14 days</p>
              <p className="mt-1 text-sm text-ink/70">Action plan window</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
