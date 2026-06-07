export const ORDER_STATUS = {
  ORDERED: '주문',
  SERVED: '서빙완료',
}

export const ORDER_CATEGORIES = ['메인', '사이드', '음료']

/** 카테고리별 메뉴 배열을 순서대로 돌려 UI에서 구분 표시에 사용 */
export function getCategoriesWithItems(order) {
  return ORDER_CATEGORIES.map((category) => ({
    category,
    menus: order.items[category]?.length ? [...order.items[category]] : [],
  })).filter((row) => row.menus.length > 0)
}

const MENU_CHIP_WHITE = {
  slip: 'rounded-md bg-white px-1.5 py-0.5 font-medium text-slate-900 ring-1 ring-slate-200/90',
  table: 'rounded-md bg-white px-2 py-1 font-medium text-slate-900 ring-1 ring-slate-200/90 shadow-sm',
  grid: 'rounded-md bg-white px-2 py-1.5 text-base font-medium text-slate-900 ring-1 ring-slate-200/90',
}

const PALETTE_TO_SHAPE = {
  slipDark: 'slip',
  slipRose: 'slip',
  slipAmber: 'slip',
  slipEmerald: 'slip',
  slipServedLight: 'slip',
  table: 'table',
  grid: 'grid',
}

export function menuChipClass(_index, palette) {
  const shape = PALETTE_TO_SHAPE[palette] ?? 'slip'
  return MENU_CHIP_WHITE[shape]
}

export const orders = [
  { id: 1, orderTime: '17:42', tableNumber: '1', status: ORDER_STATUS.SERVED, items: { 메인: ['국물 떡볶이', '우동', '닭강정'], 사이드: ['치즈볼', '감자튀김', '모둠소시지'], 음료: ['콜라', '사이다', '레몬에이드'] } },
  { id: 2, orderTime: '17:45', tableNumber: '2', status: ORDER_STATUS.SERVED, items: { 메인: ['치즈 닭꼬치', '닭강정', '순살 후라이드'], 사이드: ['감자튀김', '치즈볼', '치킨 너겟'], 음료: ['사이다', '레몬에이드', '콜라'] } },
  { id: 3, orderTime: '17:48', tableNumber: '3', status: ORDER_STATUS.SERVED, items: { 메인: ['순살 후라이드', '닭강정', '오징어 버터구이'], 사이드: ['치킨 너겟', '치즈볼', '감자튀김'], 음료: ['생맥주 500cc', '하이볼', '유자 하이볼'] } },
  { id: 4, orderTime: '17:52', tableNumber: '4', status: ORDER_STATUS.SERVED, items: { 메인: ['오징어 버터구이', '모둠소시지', '국물 떡볶이'], 사이드: ['모둠소시지', '감자튀김', '치즈볼'], 음료: ['레몬에이드', '콜라', '사이다'] } },
  { id: 5, orderTime: '17:56', tableNumber: '5', status: ORDER_STATUS.SERVED, items: { 메인: ['매운 어묵탕', '국물 떡볶이', '우동'], 사이드: ['치즈볼', '치킨 너겟', '감자튀김'], 음료: ['하이볼', '유자 하이볼', '레몬에이드'] } },
  { id: 6, orderTime: '18:00', tableNumber: '6', status: ORDER_STATUS.SERVED, items: { 메인: ['닭강정', '순살 후라이드', '치즈 닭꼬치'], 사이드: ['감자튀김', '치즈볼', '모둠소시지'], 음료: ['콜라', '사이다', '생맥주 500cc'] } },
  { id: 7, orderTime: '18:03', tableNumber: '7', status: ORDER_STATUS.SERVED, items: { 메인: ['우동', '국물 떡볶이', '매운 어묵탕'], 사이드: ['치킨 너겟', '감자튀김', '치즈볼'], 음료: ['사이다', '레몬에이드', '하이볼'] } },
  { id: 8, orderTime: '18:06', tableNumber: '8', status: ORDER_STATUS.SERVED, items: { 메인: ['모둠소시지', '치즈 닭꼬치', '순살 후라이드'], 사이드: ['치즈볼', '모둠소시지', '치킨 너겟'], 음료: ['유자 하이볼', '레몬에이드', '콜라'] } },
  { id: 9, orderTime: '18:09', tableNumber: '9', status: ORDER_STATUS.SERVED, items: { 메인: ['국물 떡볶이', '우동', '오징어 버터구이'], 사이드: ['감자튀김', '치즈볼', '치킨 너겟'], 음료: ['생맥주 500cc', '콜라', '사이다'] } },
  { id: 10, orderTime: '18:11', tableNumber: '10', status: ORDER_STATUS.SERVED, items: { 메인: ['순살 후라이드', '치즈 닭꼬치', '닭강정'], 사이드: ['치킨 너겟', '감자튀김', '모둠소시지'], 음료: ['하이볼', '유자 하이볼', '레몬에이드'] } },
  { id: 11, orderTime: '18:13', tableNumber: '11', status: ORDER_STATUS.ORDERED, items: { 메인: ['치즈 닭꼬치', '오징어 버터구이', '국물 떡볶이'], 사이드: ['모둠소시지', '치즈볼', '감자튀김'], 음료: ['콜라', '사이다', '레몬에이드'] } },
  { id: 12, orderTime: '18:14', tableNumber: '12', status: ORDER_STATUS.ORDERED, items: { 메인: ['오징어 버터구이', '모둠소시지', '닭강정'], 사이드: ['치즈볼', '치킨 너겟', '모둠소시지'], 음료: ['레몬에이드', '콜라', '하이볼'] } },
  { id: 13, orderTime: '18:15', tableNumber: '13', status: ORDER_STATUS.ORDERED, items: { 메인: ['닭강정', '매운 어묵탕', '순살 후라이드'], 사이드: ['감자튀김', '치즈볼', '치킨 너겟'], 음료: ['생맥주 500cc', '콜라', '사이다'] } },
  { id: 14, orderTime: '18:16', tableNumber: '14', status: ORDER_STATUS.ORDERED, items: { 메인: ['우동', '국물 떡볶이', '치즈 닭꼬치'], 사이드: ['치킨 너겟', '치즈볼', '감자튀김'], 음료: ['사이다', '레몬에이드', '유자 하이볼'] } },
  { id: 15, orderTime: '18:18', tableNumber: '15', status: ORDER_STATUS.ORDERED, items: { 메인: ['매운 어묵탕', '국물 떡볶이', '우동'], 사이드: ['모둠소시지', '감자튀김', '치킨 너겟'], 음료: ['유자 하이볼', '레몬에이드', '하이볼'] } },
]
