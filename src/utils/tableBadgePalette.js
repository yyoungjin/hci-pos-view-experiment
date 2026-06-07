/** 같은 테이블 번호 → 표 뷰 테이블 뱃지 색 (순환) */
export const TABLE_BADGE_CLASSES = [
  'bg-violet-100 text-violet-900 ring-1 ring-inset ring-violet-200',
  'bg-sky-100 text-sky-900 ring-1 ring-inset ring-sky-200',
  'bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-200',
  'bg-rose-100 text-rose-900 ring-1 ring-inset ring-rose-200',
  'bg-teal-100 text-teal-900 ring-1 ring-inset ring-teal-200',
  'bg-indigo-100 text-indigo-900 ring-1 ring-inset ring-indigo-200',
  'bg-cyan-100 text-cyan-900 ring-1 ring-inset ring-cyan-200',
  'bg-lime-100 text-lime-900 ring-1 ring-inset ring-lime-200',
  'bg-pink-100 text-pink-900 ring-1 ring-inset ring-pink-200',
  'bg-stone-200 text-stone-900 ring-1 ring-inset ring-stone-300',
]

export function tableBadgePaletteIndex(tableNumber) {
  const s = String(tableNumber).trim()
  const asNum = Number.parseInt(s, 10)
  if (Number.isFinite(asNum) && String(asNum) === s) {
    return Math.abs(asNum) % TABLE_BADGE_CLASSES.length
  }
  let h = 0
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0
  }
  return h % TABLE_BADGE_CLASSES.length
}
