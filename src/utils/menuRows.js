import { ORDER_CATEGORIES } from '../data/orders'

/**
 * @param {boolean} [newestFirst=true] true면 최신 주문이 위(기본 POS 표), false면 처리 우선(오래된 순)이 위(게임 등)
 */
export function buildMenuRows(orders, newestFirst = true) {
  const sorted = [...orders].sort((a, b) =>
    newestFirst ? b.orderTime.localeCompare(a.orderTime) : a.orderTime.localeCompare(b.orderTime),
  )
  const rows = []
  for (const order of sorted) {
    for (const category of ORDER_CATEGORIES) {
      const menus = order.items[category] ?? []
      menus.forEach((menuName, idx) => {
        rows.push({
          key: `${order.id}-${category}-${idx}`,
          order,
          category,
          menuName,
        })
      })
    }
  }
  return rows
}
