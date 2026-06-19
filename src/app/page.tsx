import { CsvUploadPreview } from "@/components/csv-upload-preview";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f3f5e9] px-6 py-12 text-[#18221b] md:px-10 lg:px-16">
      <div className="mx-auto max-w-[1600px]">
        <header className="grid gap-8 border-b border-[#d7d4c8] pb-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#2f6f43]">
              GSC SEO Opportunity Finder
            </p>
            <h1 className="mt-8 max-w-5xl text-5xl font-black leading-[0.98] tracking-tight md:text-7xl">
              Preview your Search Console CSV before the scoring engine exists.
            </h1>
          </div>
          <p className="max-w-xl text-lg leading-8 text-[#18221b]">
            Upload a Google Search Console Performance export and inspect detected columns plus the first rows. This local-first workflow keeps your SEO data in the browser.
          </p>
        </header>

        <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(380px,0.95fr)]">
          <div className="min-w-0">
            <CsvUploadPreview />
          </div>

          <aside className="grid content-start gap-5">
            <section className="rounded-sm border border-[#18221b]/15 bg-white/65 p-6 shadow-sm">
              <h2 className="flex items-center gap-3 text-2xl font-black text-[#18221b]">
                <span aria-hidden="true">Lock</span>
                Privacy promise
              </h2>
              <p className="mt-5 text-base leading-8 text-[#3f463f]">
                Your file is read in this browser session only. This MVP does not
                upload files, call an API, create an account, store data, or use AI.
              </p>
            </section>

            <a
              href="/sample-report.md"
              className="block rounded-sm bg-[#162219] p-6 text-[#fffdf6] shadow-sm transition hover:-translate-y-0.5"
            >
              <p className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.28em] text-[#c6a15b]">
                <span aria-hidden="true">Report</span>
                Example report
              </p>
              <h2 className="mt-5 text-2xl font-black leading-snug">
                See the consultant-style output this upload flow will power.
              </h2>
              <p className="mt-6 text-sm font-black text-[#ffe6b0]">
                Open sample report -&gt;
              </p>
            </a>

            <section className="rounded-sm border border-[#18221b]/15 bg-white/65 p-6 shadow-sm">
              <h2 className="flex items-center gap-3 text-2xl font-black text-[#18221b]">
                <span aria-hidden="true">Fields</span>
                Expected GSC fields
              </h2>
              <div className="mt-5 grid grid-cols-2 gap-3 text-base font-bold text-[#18221b]">
                <span>query</span>
                <span>page</span>
                <span>clicks</span>
                <span>impressions</span>
                <span>ctr</span>
                <span>position</span>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
