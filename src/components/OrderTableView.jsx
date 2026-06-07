import { orders as defaultOrders } from '../data/orders'
import OrderStatusBadge from './OrderStatusBadge'
import { buildMenuRows } from '../utils/menuRows'
import { TABLE_BADGE_CLASSES, tableBadgePaletteIndex } from '../utils/tableBadgePalette'

/** 상태 뱃지와 동일한 pill 스타일로 카테고리 구분 */
const categoryBadgeClass = {
  메인: 'bg-blue-100 text-blue-900 ring-1 ring-inset ring-blue-200',
  사이드: 'bg-orange-100 text-orange-900 ring-1 ring-inset ring-orange-200',
  음료: 'bg-fuchsia-100 text-fuchsia-900 ring-1 ring-inset ring-fuchsia-200',
}

function CategoryBadge({ category }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${categoryBadgeClass[category] ?? 'bg-slate-100 text-slate-800 ring-1 ring-inset ring-slate-200'}`}
    >
      {category}
    </span>
  )
}

function TableNumberBadge({ tableNumber }) {
  const cls = TABLE_BADGE_CLASSES[tableBadgePaletteIndex(tableNumber)]
  return (
    <span className={`inline-flex min-w-[2.25rem] justify-center rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${cls}`}>
      {tableNumber}
    </span>
  )
}

function OrderTableView({
  orders = defaultOrders,
  interactive = false,
  /** 게임 등: 처리 순서(오래된 주문이 위)와 정답 로직을 맞춤 */
  menuNewestFirst = true,
  onMenuRowClick,
  selectedKeys = [],
  pulseKey = null,
}) {
  const rows = buildMenuRows(orders, menuNewestFirst)

  return (
    <section className="w-full max-w-none rounded-2xl bg-white px-3 py-3 shadow-sm ring-1 ring-slate-200 sm:px-4 sm:py-4">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">주점 주문 관리 POS</h2>
          <p className="mt-1 text-sm text-slate-600">
            {menuNewestFirst
              ? '엑셀형 표 뷰 - 메뉴 한 줄이 한 행 · 주문은 시간·테이블·상태가 행마다 반복 · 최신 주문이 위쪽'
              : '엑셀형 표 뷰 - 처리 우선순위(오래된 주문이 위쪽) · 메뉴 한 줄이 한 행'}
          </p>
        </div>
        <div className="text-right text-sm text-slate-500">
          <div>메뉴 행 {rows.length}줄</div>
          <div className="text-xs text-slate-400">주문 {orders.length}건</div>
        </div>
      </header>

      <div
        className={`overflow-x-auto rounded-xl ring-1 ring-slate-200 ${interactive ? 'relative z-10' : ''}`}
      >
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-slate-800">
            <tr>
              <th className="border border-slate-300 px-3 py-2 font-semibold">주문 시간</th>
              <th className="border border-slate-300 px-3 py-2 font-semibold">테이블</th>
              <th className="border border-slate-300 px-3 py-2 text-center font-semibold">카테고리</th>
              <th className="border border-slate-300 px-3 py-2 font-semibold">메뉴</th>
              <th className="border border-slate-300 px-3 py-2 font-semibold">상태</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {rows.map(({ key, order, category, menuName }) => {
              const done = selectedKeys.includes(key)
              const pulse = pulseKey === key
              return (
                <tr
                  key={key}
                  role={interactive ? 'button' : undefined}
                  tabIndex={interactive ? 0 : undefined}
                  onClick={
                    interactive
                      ? () => {
                          onMenuRowClick?.(key)
                        }
                      : undefined
                  }
                  onKeyDown={
                    interactive
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onMenuRowClick?.(key)
                          }
                        }
                      : undefined
                  }
                  className={`${interactive ? 'cursor-pointer touch-manipulation select-none hover:bg-amber-50/40 active:bg-amber-100/70' : 'hover:bg-slate-50/80'} ${done ? 'bg-emerald-50/80 ring-1 ring-inset ring-emerald-200/60' : ''} ${pulse ? 'animate-pulse bg-rose-100/70' : ''}`}
                >
                  <td className="whitespace-nowrap border border-slate-200 px-3 py-2 tabular-nums text-slate-700">
                    {order.orderTime}
                  </td>
                  <td className="whitespace-nowrap border border-slate-200 px-3 py-2 text-center">
                    <TableNumberBadge tableNumber={order.tableNumber} />
                  </td>
                  <td className="whitespace-nowrap border border-slate-200 px-3 py-2 text-center">
                    <CategoryBadge category={category} />
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-slate-900">{menuName}</td>
                  <td className="border border-slate-200 px-3 py-2">
                    <OrderStatusBadge status={order.status} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default OrderTableView
