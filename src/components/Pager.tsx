// SC-03: "עמוד 2 מתוך 3"
export function Pager({ page, pageSize, totalCount, onChange }: {
  page: number
  pageSize: number
  totalCount: number
  onChange: (page: number) => void
}) {
  const pages = Math.max(1, Math.ceil(totalCount / pageSize))
  if (pages <= 1) return null
  return (
    <div className="pager">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>הקודם</button>
      <span>עמוד {page} מתוך {pages}</span>
      <button type="button" disabled={page >= pages} onClick={() => onChange(page + 1)}>הבא</button>
    </div>
  )
}
