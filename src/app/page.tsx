import { CsvUploadPreview } from "@/components/csv-upload-preview";

export default function Home() {
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-5 border-b border-ink/15 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-moss">
              GSC SEO Opportunity Finder
            </p>
            <h1 className="text-4xl font-black leading-tight text-ink sm:text-5xl lg:text-6xl">
              Upload your Search Console CSV and confirm the required fields.
            </h1>
          </div>
          <div className="max-w-xl text-base leading-7 text-ink/72">
            Upload a Google Search Console Performance CSV, auto-detect the six
            required fields, and fix any missing mappings before moving to the next
            step.
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
          <CsvUploadPreview />

          <aside className="flex flex-col gap-4">
            <div className="border border-ink/15 bg-white/65 p-5 shadow-sm backdrop-blur">
              <h2 className="text-lg font-bold text-ink">Privacy promise</h2>
              <p className="mt-3 text-sm leading-6 text-ink/72">
                Your CSV is read in this browser session only. This MVP does not
                upload files, call an API, create an account, store data, or use AI.
              </p>
            </div>

            <a
              className="group border border-ink/15 bg-ink p-5 text-cream shadow-sm transition hover:-translate-y-0.5 hover:bg-moss"
              href="/sample-report"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cream/70">
                Example report
              </p>
              <p className="mt-3 text-xl font-black">
                See the consultant-style output this field mapping flow will power.
              </p>
              <p className="mt-4 text-sm font-bold text-wheat">
                Open sample report <span aria-hidden="true">-&gt;</span>
              </p>
            </a>

            <div className="border border-ink/15 bg-white/50 p-5">
              <h2 className="text-lg font-bold text-ink">Expected GSC fields</h2>
              <ul className="mt-3 grid grid-cols-2 gap-2 text-sm font-semibold text-ink/72">
                <li>query</li>
                <li>page</li>
                <li>clicks</li>
                <li>impressions</li>
                <li>ctr</li>
                <li>position</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
