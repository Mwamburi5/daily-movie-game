interface ResultMeaningProps {
  direction: string
  detail: string
}

// A shared semantic key for every terminal screen. The headline says what
// happened; this line says how to read the number so golf and race modes cannot
// accidentally imply the same direction.
export default function ResultMeaning({ direction, detail }: ResultMeaningProps) {
  return (
    <div className="app-result-meaning" data-result-meaning role="text">
      <span>{direction}</span>
      <strong>{detail}</strong>
    </div>
  )
}
