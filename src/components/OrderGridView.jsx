import { getCategoriesWithItems, menuChipClass, orders } from '../data/orders'
import OrderStatusBadge from './OrderStatusBadge'

function OrderGridView() {
  return (
    <section className="w-full max-w-none rounded-2xl bg-white px-3 py-3 shadow-sm ring-1 ring-slate-200 sm:px-4 sm:py-4">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">주점 주문 관리 POS</h2>
          <p className="mt-1 text-sm text-slate-600">
            카테고리별로 구역을 나눈 포스기 스타일 그리드
          </p>
        </div>
        <div className="text-sm text-slate-500">총 {orders.length}건</div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-xl bg-slate-50 p-4 shadow-sm ring-1 ring-slate-200"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">
                테이블 {order.tableNumber}
              </p>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="space-y-3">
              {getCategoriesWithItems(order).map(({ category, menus }) => (
                <div key={category}>
                  <p className="text-sm font-bold text-slate-700">{category}</p>
                  <ul className="mt-1 list-none space-y-1">
                    {menus.map((name, idx) => (
                      <li key={`${name}-${idx}`} className={menuChipClass(idx, 'grid')}>
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-600">주문 시간 {order.orderTime}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default OrderGridView
