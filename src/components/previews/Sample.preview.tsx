// Convention for forge agents (Wave 0, docs/orchestration-plan.md):
//   - file name = preview name, e.g. ScoreRace.preview.tsx -> ?preview=ScoreRace
//   - default export = the thing that renders; keep it self-contained (own
//     mock props/state in this file — don't import app state/reducers)
//   - this file is dev-only: the harness in main.tsx globs it lazily, so it
//     never enters the prod bundle
//
// This one exists only to prove the mechanism end to end.
export default function SamplePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="rounded-2xl border border-[#23211c]/10 bg-white px-6 py-5 shadow-sm">
        <p className="font-serif text-lg font-black italic">Sample Preview</p>
        <p className="mt-1 text-sm text-[#7d7563]">src/components/previews/Sample.preview.tsx</p>
      </div>
    </div>
  )
}
