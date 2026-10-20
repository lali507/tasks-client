import { useCallback, useEffect, useState } from 'react'
import { labelsApi, messageFor } from '../api/resources'
import type { LabelResponse } from '../api/types'
import { Field } from '../components/Field'
import { Page } from '../components/Layout'
import { Modal } from '../components/Modal'
import { useNotice } from '../components/Notice'
import { useFormSubmit } from '../components/useFormSubmit'

const notFound = 'התווית כבר לא קיימת'

// SC-06: every label, no pages (FN-MB-05-R1)
export function LabelsPage() {
  const [labels, setLabels] = useState<LabelResponse[] | null>(null)
  const [editing, setEditing] = useState<LabelResponse | 'new' | null>(null)
  const notice = useNotice()

  const load = useCallback(async () => {
    try {
      setLabels(await labelsApi.list())
    } catch (error) {
      notice.show(messageFor(error), 'error')
    }
  }, [notice.show])

  useEffect(() => { void load() }, [load])

  const saved = async (text: string) => {
    setEditing(null)
    notice.show(text)
    await load()
  }

  // SC-00-R6, SC-06: warn that the label leaves every task
  const remove = async (label: LabelResponse) => {
    if (!window.confirm(`התווית "${label.name}" תוסר מכל המשימות.\nהאם למחוק?`)) return
    try {
      await labelsApi.remove(label.id)
      notice.show('התווית נמחקה')
    } catch (error) {
      notice.show(messageFor(error, { 404: notFound }), 'error')
    }
    await load()
  }

  return (
    <Page title="ניהול תוויות" subtitle="תוויות לסימון משימות – שינוי שם מופיע בכל המשימות"
      action={<button type="button" onClick={() => setEditing('new')}>+ תווית חדשה</button>}>
      {notice.element}
      <div className="label-grid">
        {labels?.map((label) => (
          <div key={label.id} className="card label-card">
            <span className="label big">{label.name}</span>
            <div className="actions">
              <button type="button" className="secondary small" onClick={() => setEditing(label)}>עריכה</button>
              <button type="button" className="danger small" onClick={() => void remove(label)}>מחיקה</button>
            </div>
          </div>
        ))}
        {labels && labels.length === 0 && <div className="empty"><strong>אין תוויות</strong>אפשר ליצור תווית חדשה</div>}
      </div>

      {editing && (
        <LabelForm label={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)}
          onSaved={() => saved(editing === 'new' ? 'התווית נוצרה' : 'התווית עודכנה')} />
      )}
    </Page>
  )
}

function LabelForm({ label, onClose, onSaved }: { label?: LabelResponse; onClose: () => void; onSaved: () => Promise<void> }) {
  const [name, setName] = useState(label?.name ?? '')
  // 409 "שם התווית כבר קיים" is the server's title
  const { errors, busy, submit } = useFormSubmit(['name'], { 404: notFound })

  const onSubmit = submit(
    () => ({ name: !name.trim() ? 'שדה חובה' : undefined }),
    async () => {
      await (label ? labelsApi.update(label.id, name) : labelsApi.create(name))
      await onSaved()
    })

  return (
    <Modal title={label ? 'עריכת תווית' : 'תווית חדשה'} onClose={onClose}>
      <form className="form" onSubmit={onSubmit} noValidate>
        <Field label="שם" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} hint="2–30 תווים" autoFocus />
        {errors.form && <div className="form-error" role="alert">{errors.form}</div>}
        <div className="actions">
          <button type="submit" disabled={busy}>{busy ? 'שומרים…' : 'שמירה'}</button>
          <button type="button" className="secondary" onClick={onClose}>ביטול</button>
        </div>
      </form>
    </Modal>
  )
}
