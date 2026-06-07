import { menuChipClass, orders, ORDER_CATEGORIES, ORDER_STATUS } from '../data/orders'

/** 주문(열) 사이 간격 — 테이블 열이 눈으로 구분되도록 */
const SLIP_COLUMN_GAP = 'gap-2.5'

function sortByOldestOrder(a, b) {
  return a.orderTime.localeCompare(b.orderTime)
}

function sortByRecentOrder(a, b) {
  return b.orderTime.localeCompare(a.orderTime)
}

const PRIORITY_RANK = { FIRST: 1, SECOND: 2, THIRD: 3 }

/** 테이블(주문) 열 — 주문(테이블)마다 세로로 묶고 테두리로 구분 */
const PENDING_TABLE_COLUMN_WRAP =
  'rounded-xl border border-slate-300/80 bg-slate-50/90 px-2.5 py-3 shadow-sm'
const SERVED_TABLE_COLUMN_WRAP =
  'rounded-xl border border-emerald-300/80 bg-emerald-50/80 px-2.5 py-3 shadow-sm'

function emptyPlaceholderClassPending(category) {
  if (category === '메인') return 'border-blue-300/50 bg-blue-100/20'
  if (category === '사이드') return 'border-orange-300/50 bg-orange-100/20'
  if (category === '음료') return 'border-pink-300/50 bg-pink-100/20'
  return 'border-amber-300/50 bg-amber-100/25'
}

function pendingShellClass(category, priorityRank) {
  const r = priorityRank
  if (category === '메인') {
    if (r === PRIORITY_RANK.FIRST) {
      return 'border-t-[3px] border-blue-500 bg-gradient-to-b from-blue-200/95 via-sky-100 to-blue-50 ring-blue-300/35 shadow-sm'
    }
    if (r === PRIORITY_RANK.SECOND) {
      return 'border-t-[3px] border-blue-400/90 bg-gradient-to-b from-blue-100 via-sky-50 to-white ring-blue-200/45'
    }
    if (r === PRIORITY_RANK.THIRD) {
      return 'border-t-[3px] border-blue-200/70 bg-gradient-to-b from-white via-blue-50/85 to-sky-50/35 ring-blue-200/35'
    }
    return 'border-t-[3px] border-transparent bg-white ring-blue-200/80'
  }
  if (category === '사이드') {
    if (r === PRIORITY_RANK.FIRST) {
      return 'border-t-[3px] border-orange-500 bg-gradient-to-b from-orange-200/95 via-amber-100 to-orange-50 ring-orange-300/35 shadow-sm'
    }
    if (r === PRIORITY_RANK.SECOND) {
      return 'border-t-[3px] border-orange-400/90 bg-gradient-to-b from-orange-100 via-amber-50 to-white ring-orange-200/45'
    }
    if (r === PRIORITY_RANK.THIRD) {
      return 'border-t-[3px] border-orange-200/75 bg-gradient-to-b from-white via-orange-50/85 to-amber-50/35 ring-orange-200/35'
    }
    return 'border-t-[3px] border-transparent bg-white ring-orange-200/80'
  }
  if (category === '음료') {
    if (r === PRIORITY_RANK.FIRST) {
      return 'border-t-[3px] border-fuchsia-500 bg-gradient-to-b from-pink-200/95 via-fuchsia-100 to-pink-50 ring-fuchsia-300/35 shadow-sm'
    }
    if (r === PRIORITY_RANK.SECOND) {
      return 'border-t-[3px] border-pink-400/90 bg-gradient-to-b from-pink-100 via-fuchsia-50 to-white ring-pink-200/45'
    }
    if (r === PRIORITY_RANK.THIRD) {
      return 'border-t-[3px] border-pink-200/75 bg-gradient-to-b from-white via-pink-50/85 to-fuchsia-50/35 ring-pink-200/35'
    }
    return 'border-t-[3px] border-transparent bg-white ring-pink-200/80'
  }
  return 'border-t-[3px] border-transparent bg-white ring-amber-200/80'
}

function pendingMetaClass(category, priorityRank) {
  const r = priorityRank
  if (category === '메인') {
    if (r === PRIORITY_RANK.FIRST) return 'text-blue-900/85'
    if (r === PRIORITY_RANK.SECOND) return 'text-blue-900/90'
    if (r === PRIORITY_RANK.THIRD) return 'text-slate-600'
    return 'text-slate-600'
  }
  if (category === '사이드') {
    if (r === PRIORITY_RANK.FIRST) return 'text-orange-900/85'
    if (r === PRIORITY_RANK.SECOND) return 'text-orange-900/90'
    if (r === PRIORITY_RANK.THIRD) return 'text-slate-600'
    return 'text-slate-600'
  }
  if (category === '음료') {
    if (r === PRIORITY_RANK.FIRST) return 'text-fuchsia-900/85'
    if (r === PRIORITY_RANK.SECOND) return 'text-fuchsia-900/90'
    if (r === PRIORITY_RANK.THIRD) return 'text-slate-600'
    return 'text-slate-600'
  }
  return 'text-slate-600'
}

function pendingHoverRingClass(category) {
  if (category === '메인') return 'hover:ring-blue-400/90'
  if (category === '사이드') return 'hover:ring-orange-400/90'
  if (category === '음료') return 'hover:ring-pink-400/90'
  return 'hover:ring-amber-400/90'
}

function pendingPulseRingClass(category) {
  if (category === '메인') return 'ring-blue-500'
  if (category === '사이드') return 'ring-orange-500'
  if (category === '음료') return 'ring-fuchsia-500'
  return 'ring-rose-500'
}

/** 주문 대기 / 서빙 완료 셀 높이·패딩 공통 (동일 border-top 두께와 함께 픽셀 단위로 통일) */
const SLIP_CELL_HEIGHT =
  'h-[clamp(7.25rem,17svh,13.5rem)] min-h-[clamp(7.25rem,17svh,13.5rem)] max-h-[clamp(7.25rem,17svh,13.5rem)]'
const SLIP_CELL_FRAME = `${SLIP_CELL_HEIGHT} box-border shrink-0 px-2.5 py-2`

function QueueCard({
  order,
  menus,
  priorityRank,
  category,
  interactive = false,
  onMenuClick,
  selectedKeys = [],
  pulseKey = null,
}) {
  const isPriority = priorityRank >= PRIORITY_RANK.FIRST && priorityRank <= PRIORITY_RANK.THIRD

  const shellClass = pendingShellClass(category, priorityRank)

  const bodyTextClass =
    priorityRank === PRIORITY_RANK.FIRST
      ? 'text-sm leading-snug'
      : priorityRank === PRIORITY_RANK.SECOND
        ? 'text-sm leading-snug'
        : priorityRank === PRIORITY_RANK.THIRD
          ? 'text-sm leading-snug'
          : 'text-[13px] leading-snug'

  const menuPalette =
    priorityRank === PRIORITY_RANK.FIRST
      ? 'slipRose'
      : priorityRank === PRIORITY_RANK.SECOND || priorityRank === PRIORITY_RANK.THIRD
        ? 'slipRose'
        : 'slipAmber'

  const metaClass = pendingMetaClass(category, priorityRank)

  const lineClamp = isPriority ? '' : 'truncate'

  return (
    <article
      className={`flex min-h-0 min-w-0 flex-col rounded-lg ring-1 ${SLIP_CELL_FRAME} ${bodyTextClass} ${shellClass}`}
    >
      <ul className="list-none space-y-1 min-h-0 flex-1 overflow-y-auto">
        {menus.map((name, idx) => {
          const menuKey = `${order.id}-${category}-${idx}`
          const done = selectedKeys.includes(menuKey)
          const pulse = pulseKey === menuKey
          return (
            <li
              key={`${name}-${idx}`}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : undefined}
              onClick={(e) => {
                e.stopPropagation()
                if (interactive) onMenuClick?.(menuKey)
              }}
              onKeyDown={
                interactive
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onMenuClick?.(menuKey)
                      }
                    }
                  : undefined
              }
              className={`${menuChipClass(idx, menuPalette)} ${lineClamp} ${interactive ? `cursor-pointer touch-manipulation transition hover:ring-2 ${pendingHoverRingClass(category)}` : ''} ${done ? 'ring-2 ring-emerald-500/90' : ''} ${pulse ? `animate-pulse ring-2 ${pendingPulseRingClass(category)}` : ''}`}
              title={name}
            >
              {name}
            </li>
          )
        })}
      </ul>
      <div className={`mt-auto shrink-0 pt-1 text-right text-xs tabular-nums ${metaClass}`}>
        {order.orderTime}
      </div>
    </article>
  )
}

/** 대기 우선순위와 대칭: 가장 최근 처리 3건을 강조 (파이프라인 왼쪽 = 막 도착) */
function ServedCard({
  order,
  menus,
  freshRank,
  category,
  interactive = false,
  onMenuClick,
  selectedKeys = [],
  pulseKey = null,
}) {
  const isFresh = freshRank >= PRIORITY_RANK.FIRST && freshRank <= PRIORITY_RANK.THIRD

  const shellClass =
    freshRank === PRIORITY_RANK.FIRST
      ? 'border-t-[3px] border-emerald-500 bg-gradient-to-b from-emerald-200/95 via-emerald-100 to-emerald-50 ring-emerald-300/35 shadow-sm'
      : freshRank === PRIORITY_RANK.SECOND
        ? 'border-t-[3px] border-emerald-400/90 bg-gradient-to-b from-emerald-100 via-emerald-50 to-white ring-emerald-200/45'
        : freshRank === PRIORITY_RANK.THIRD
          ? 'border-t-[3px] border-emerald-200/80 bg-gradient-to-b from-white via-emerald-50/85 to-emerald-50/35 ring-emerald-200/35'
          : 'border-t-[3px] border-transparent bg-white ring-emerald-200/80'

  const bodyTextClass =
    freshRank === PRIORITY_RANK.FIRST
      ? 'text-sm leading-snug'
      : freshRank === PRIORITY_RANK.SECOND
        ? 'text-sm leading-snug'
        : freshRank === PRIORITY_RANK.THIRD
          ? 'text-sm leading-snug'
          : 'text-[13px] leading-snug'

  const menuPalette =
    freshRank === PRIORITY_RANK.FIRST
      ? 'slipEmerald'
      : freshRank === PRIORITY_RANK.SECOND || freshRank === PRIORITY_RANK.THIRD
        ? 'slipEmerald'
        : 'slipServedLight'

  const metaClass =
    freshRank === PRIORITY_RANK.FIRST
      ? 'text-emerald-900/80'
      : freshRank === PRIORITY_RANK.SECOND
        ? 'text-emerald-900/90'
        : freshRank === PRIORITY_RANK.THIRD
          ? 'text-slate-600'
          : 'text-slate-600'

  const lineClamp = isFresh ? '' : 'truncate'

  return (
    <article
      className={`flex min-h-0 min-w-0 flex-col rounded-lg ring-1 ${SLIP_CELL_FRAME} ${bodyTextClass} ${shellClass}`}
    >
      <ul className="list-none space-y-1 min-h-0 flex-1 overflow-y-auto">
        {menus.map((name, idx) => {
          const menuKey = `${order.id}-${category}-${idx}`
          const done = selectedKeys.includes(menuKey)
          const pulse = pulseKey === menuKey
          return (
            <li
              key={`${name}-${idx}`}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : undefined}
              onClick={(e) => {
                e.stopPropagation()
                if (interactive) onMenuClick?.(menuKey)
              }}
              onKeyDown={
                interactive
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onMenuClick?.(menuKey)
                      }
                    }
                  : undefined
              }
              className={`${menuChipClass(idx, menuPalette)} ${lineClamp} ${interactive ? 'cursor-pointer touch-manipulation transition hover:ring-2 hover:ring-emerald-400/90' : ''} ${done ? 'ring-2 ring-emerald-500/90' : ''} ${pulse ? 'animate-pulse ring-2 ring-rose-500' : ''}`}
              title={name}
            >
              {name}
            </li>
          )
        })}
      </ul>
      <div className={`mt-auto shrink-0 pt-1 text-right text-xs tabular-nums ${metaClass}`}>
        {order.orderTime}
      </div>
    </article>
  )
}

/** 오래된 대기(우선) → 오른쪽: 오른쪽 3열 넓게 */
function buildPendingColumnTemplate(columnCount) {
  if (columnCount <= 0) return '1fr'
  return Array.from({ length: columnCount }, (_, colIndex) => {
    const fromRight = columnCount - 1 - colIndex
    if (fromRight === 0) return 'minmax(7.25rem, 1.55fr)'
    if (fromRight === 1) return 'minmax(6.5rem, 1.32fr)'
    if (fromRight === 2) return 'minmax(5.75rem, 1.12fr)'
    return 'minmax(3.85rem, 0.82fr)'
  }).join(' ')
}

/** 서빙 완료 — 패널 너비는 대기와 동일 비율 유지, 내부 열만 대기보다 넓게(가로 스크롤) */
function buildServedColumnTemplate(columnCount) {
  if (columnCount <= 0) return '1fr'
  return Array.from({ length: columnCount }, (_, colIndex) => {
    if (colIndex === 0) return 'minmax(8.75rem, 1.85fr)'
    if (colIndex === 1) return 'minmax(7.75rem, 1.58fr)'
    if (colIndex === 2) return 'minmax(6.75rem, 1.35fr)'
    return 'minmax(4.75rem, 1.05fr)'
  }).join(' ')
}

function PendingTableHeaderRow({ displayPending, gridTemplateColumns, priorityRankByOrderId }) {
  if (displayPending.length === 0) return null

  return (
    <div className={`grid ${SLIP_COLUMN_GAP}`} style={{ gridTemplateColumns }} role="presentation">
      {displayPending.map((order) => {
        const rank = priorityRankByOrderId.get(order.id)
        const cellTone =
          rank === PRIORITY_RANK.FIRST
            ? 'bg-slate-200/90 text-slate-900 ring-slate-400/40'
            : rank === PRIORITY_RANK.SECOND
              ? 'bg-slate-100 text-slate-800 ring-slate-300/40'
              : rank === PRIORITY_RANK.THIRD
                ? 'bg-slate-50/95 text-slate-700 ring-slate-200/40'
                : 'bg-amber-200/50 text-amber-950 ring-amber-300/40'

        return (
          <div
            key={order.id}
            className={`flex min-h-8 min-w-0 items-center justify-center whitespace-nowrap rounded-md px-1 text-center text-[11px] font-extrabold leading-tight ring-1 sm:text-xs ${cellTone}`}
          >
            테이블 {order.tableNumber}
          </div>
        )
      })}
    </div>
  )
}

function ServedTableHeaderRow({ displayCompleted, gridTemplateColumns, freshRankByOrderId }) {
  if (displayCompleted.length === 0) return null

  return (
    <div className={`grid ${SLIP_COLUMN_GAP}`} style={{ gridTemplateColumns }} role="presentation">
      {displayCompleted.map((order) => {
        const rank = freshRankByOrderId.get(order.id)
        const cellTone =
          rank === PRIORITY_RANK.FIRST
            ? 'bg-emerald-100 text-emerald-900 ring-emerald-400/35'
            : rank === PRIORITY_RANK.SECOND
              ? 'bg-emerald-50 text-emerald-900 ring-emerald-300/40'
              : rank === PRIORITY_RANK.THIRD
                ? 'bg-emerald-50/90 text-emerald-800 ring-emerald-200/40'
                : 'bg-emerald-200/45 text-emerald-950 ring-emerald-300/45'

        return (
          <div
            key={order.id}
            className={`flex min-h-8 min-w-0 items-center justify-center whitespace-nowrap rounded-md px-1 text-center text-[11px] font-extrabold leading-tight ring-1 sm:text-xs ${cellTone}`}
          >
            테이블 {order.tableNumber}
          </div>
        )
      })}
    </div>
  )
}

/** 주문(테이블)마다 메인→사이드→음료를 세로로 묶음 */
function PendingTableColumns({
  displayPending,
  priorityRankByOrderId,
  gridTemplateColumns,
  interactive,
  onMenuClick,
  selectedKeys,
  pulseKey,
}) {
  if (displayPending.length === 0) return null

  return (
    <div
      className={`grid min-h-0 auto-rows-min items-stretch ${SLIP_COLUMN_GAP}`}
      style={{ gridTemplateColumns }}
    >
      {displayPending.map((order, colIndex) => (
        <div
          key={order.id}
          data-tutorial={colIndex === 0 ? 'slip-first-lane' : undefined}
          className={`flex min-h-0 min-w-0 flex-col gap-2 ${PENDING_TABLE_COLUMN_WRAP}`}
        >
          {ORDER_CATEGORIES.map((category) => {
            const menus = order.items[category]
            const ph = emptyPlaceholderClassPending(category)
            return (
              <div key={category} className="flex min-h-0 min-w-0 flex-col gap-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{category}</p>
                {!menus?.length ? (
                  <div
                    className={`${SLIP_CELL_FRAME} rounded-lg border border-dashed ${ph}`}
                    aria-hidden
                  />
                ) : (
                  <QueueCard
                    order={order}
                    menus={menus}
                    category={category}
                    priorityRank={priorityRankByOrderId.get(order.id)}
                    interactive={interactive}
                    onMenuClick={onMenuClick}
                    selectedKeys={selectedKeys}
                    pulseKey={pulseKey}
                  />
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function ServedTableColumns({
  displayCompleted,
  freshRankByOrderId,
  gridTemplateColumns,
  interactive,
  onMenuClick,
  selectedKeys,
  pulseKey,
}) {
  if (displayCompleted.length === 0) return null

  return (
    <div
      className={`grid min-h-0 auto-rows-min items-stretch ${SLIP_COLUMN_GAP}`}
      style={{ gridTemplateColumns }}
    >
      {displayCompleted.map((order, colIndex) => (
        <div
          key={order.id}
          data-tutorial={colIndex === 0 ? 'slip-first-served-lane' : undefined}
          className={`flex min-h-0 min-w-0 flex-col gap-2 ${SERVED_TABLE_COLUMN_WRAP}`}
        >
          {ORDER_CATEGORIES.map((category) => {
            const menus = order.items[category]
            return (
              <div key={category} className="flex min-h-0 min-w-0 flex-col gap-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800/80">
                  {category}
                </p>
                {!menus?.length ? (
                  <div
                    className={`${SLIP_CELL_FRAME} rounded-lg border border-dashed border-emerald-300/50 bg-emerald-100/25`}
                    aria-hidden
                  />
                ) : (
                  <ServedCard
                    order={order}
                    menus={menus}
                    category={category}
                    freshRank={freshRankByOrderId.get(order.id)}
                    interactive={interactive}
                    onMenuClick={onMenuClick}
                    selectedKeys={selectedKeys}
                    pulseKey={pulseKey}
                  />
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function OrderSlipView({
  orders: ordersProp,
  interactive = false,
  onMenuClick,
  selectedKeys = [],
  pulseKey = null,
}) {
  const source = ordersProp ?? orders
  const pendingOrders = source.filter((order) => order.status === ORDER_STATUS.ORDERED)
  const completedOrders = source.filter((order) => order.status === ORDER_STATUS.SERVED)

  const orderedPending = [...pendingOrders].sort(sortByOldestOrder)
  const displayPending = [...orderedPending].reverse()
  const priorityRankByOrderId = new Map(
    orderedPending.slice(0, 3).map((order, index) => [order.id, index + 1]),
  )
  const pendingGridTemplateColumns = buildPendingColumnTemplate(displayPending.length)

  const orderedCompleted = [...completedOrders].sort(sortByRecentOrder)
  const displayCompleted = orderedCompleted
  const freshRankByOrderId = new Map(
    orderedCompleted.slice(0, 3).map((order, index) => [order.id, index + 1]),
  )
  const servedGridTemplateColumns = buildServedColumnTemplate(displayCompleted.length)

  return (
    <section
      data-tutorial="slip-root"
      className={`flex min-h-0 w-full max-w-none flex-col rounded-xl bg-white px-2 py-2 shadow-sm ring-1 ring-slate-200 sm:px-3 md:h-[min(880px,calc(100svh-8.5rem))] md:overflow-hidden ${interactive ? 'relative z-10' : ''}`}
    >
      <header className="mb-1.5 flex shrink-0 flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">주점 주문 관리 POS</h2>
        <p className="text-xs text-slate-500">
          대기 {pendingOrders.length} · 완료 {completedOrders.length}
        </p>
      </header>

      <div className="relative grid min-h-0 flex-1 grid-cols-1 gap-0 overflow-hidden rounded-xl ring-1 ring-slate-200/90 md:grid-cols-[minmax(0,2.1fr)_auto_minmax(0,1fr)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-gradient-to-r from-slate-50/90 via-white to-emerald-50/40 md:from-slate-100/50 md:via-white md:to-emerald-100/35"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-3 left-1/2 z-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-slate-300/60 to-transparent md:block"
        />

        <div
          data-tutorial="slip-pending"
          className="relative z-10 flex h-full min-h-0 min-w-0 flex-col gap-1.5 overflow-hidden px-2 py-2 md:px-3 md:py-2.5"
        >
          <p className="shrink-0 text-xs font-bold uppercase tracking-wider text-amber-900/70">
            주문 대기
          </p>
          <div data-tutorial="slip-pending-header">
            <PendingTableHeaderRow
              displayPending={displayPending}
              gridTemplateColumns={pendingGridTemplateColumns}
              priorityRankByOrderId={priorityRankByOrderId}
            />
          </div>
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-auto">
            <PendingTableColumns
              displayPending={displayPending}
              priorityRankByOrderId={priorityRankByOrderId}
              gridTemplateColumns={pendingGridTemplateColumns}
              interactive={interactive}
              onMenuClick={onMenuClick}
              selectedKeys={selectedKeys}
              pulseKey={pulseKey}
            />
          </div>
        </div>

        <div
          data-tutorial="slip-pipeline"
          className="relative z-10 hidden w-9 shrink-0 flex-col items-center justify-center gap-0.5 self-stretch md:flex"
          aria-hidden
        >
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">처리</span>
          <div className="flex flex-col gap-0.5 text-emerald-600/80">
            <span className="text-xs" aria-hidden>
              →
            </span>
            <span className="text-xs" aria-hidden>
              →
            </span>
          </div>
        </div>

        <div
          data-tutorial="slip-served"
          className="relative z-10 flex h-full min-h-0 min-w-0 flex-col gap-1.5 overflow-hidden border-t border-emerald-200/60 px-2 py-2 md:border-t-0 md:border-l md:border-emerald-200/50 md:px-3 md:py-2.5"
        >
          <p className="shrink-0 text-xs font-bold uppercase tracking-wider text-emerald-900/75">
            서빙 완료
          </p>
          <ServedTableHeaderRow
            displayCompleted={displayCompleted}
            gridTemplateColumns={servedGridTemplateColumns}
            freshRankByOrderId={freshRankByOrderId}
          />
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-auto">
            <ServedTableColumns
              displayCompleted={displayCompleted}
              freshRankByOrderId={freshRankByOrderId}
              gridTemplateColumns={servedGridTemplateColumns}
              interactive={interactive}
              onMenuClick={onMenuClick}
              selectedKeys={selectedKeys}
              pulseKey={pulseKey}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default OrderSlipView
