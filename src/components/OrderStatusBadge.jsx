import { ORDER_STATUS } from '../data/orders'

const statusClassMap = {
  [ORDER_STATUS.ORDERED]:
    'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200',
  [ORDER_STATUS.SERVED]:
    'bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200',
}

function OrderStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassMap[status] ?? 'bg-slate-100 text-slate-700'}`}
    >
      {status}
    </span>
  )
}

export default OrderStatusBadge
