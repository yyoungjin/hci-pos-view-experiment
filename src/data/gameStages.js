import { ORDER_STATUS } from './orders'

/** 주문 시간 오름차순 = 대기에서 먼저 처리할 순서 */
function sortByOldest(a, b) {
  return a.orderTime.localeCompare(b.orderTime)
}

/** 메뉴 키(`201-메인-0` 형태)에서 주문 id만 뽑음 */
export function orderIdFromMenuKey(key) {
  const s = String(key)
  const dash = s.indexOf('-')
  if (dash === -1) return NaN
  return Number.parseInt(s.slice(0, dash), 10)
}

/** 메뉴 키에서 주문 id와 카테고리(메인·사이드·음료) 추출 */
export function orderIdAndCategoryFromMenuKey(key) {
  const parts = String(key).split('-')
  if (parts.length < 3) return { orderId: NaN, category: null }
  return {
    orderId: Number.parseInt(parts[0], 10),
    category: parts[1],
  }
}

function assertCategoryPresent(order, category) {
  const list = order.items?.[category]
  if (!list?.length) {
    throw new Error(`스테이지 데이터: 주문 ${order.id}에 ${category} 항목이 없습니다.`)
  }
}

const ORDER_RANK_TITLES = ['첫 번째 주문서', '두 번째 주문서', '세 번째 주문서', '네 번째 주문서']

function rankDetailPhrase(orderRank) {
  const phrases = [
    '첫 번째로 처리해야 할 주문서',
    '두 번째로 처리해야 할 주문서',
    '세 번째로 처리해야 할 주문서',
    '네 번째로 처리해야 할 주문서',
  ]
  return phrases[orderRank] ?? phrases[0]
}

/** 과제 패널용: 처리 순서상 n번째 주문서 + 카테고리 */
function buildBullet(orderRank, category) {
  const title = ORDER_RANK_TITLES[orderRank] ?? ORDER_RANK_TITLES[0]
  const base = rankDetailPhrase(orderRank)
  const detail =
    category === '메인'
      ? `${base}에서 메인 메뉴를 하나 선택합니다.`
      : category === '사이드'
        ? `${base}에서 사이드 메뉴를 하나 선택합니다.`
        : `${base}에서 음료를 하나 선택합니다.`
  return { title, detail, categoryLabel: category }
}

const DEFAULT_INSTRUCTION_NOTE =
  '각 단계마다 주문서와 카테고리가 맞아야 합니다. 같은 카테고리 안에서는 어떤 메뉴를 눌러도 됩니다.'

/**
 * 과제 종류(4종)마다 다른 클릭 순서.
 * orderRank: 시간 오름차순 정렬된 대기 주문에서의 인덱스 (0=가장 먼저 처리할 주문서)
 */
const STAGE_MISSION_PATTERNS = [
  [
    { orderRank: 0, category: '메인' },
    { orderRank: 0, category: '음료' },
    { orderRank: 1, category: '메인' },
  ],
  [
    { orderRank: 0, category: '메인' },
    { orderRank: 1, category: '음료' },
    { orderRank: 2, category: '메인' },
  ],
  [
    { orderRank: 0, category: '메인' },
    { orderRank: 1, category: '사이드' },
    { orderRank: 2, category: '음료' },
  ],
  [
    { orderRank: 0, category: '사이드' },
    { orderRank: 0, category: '메인' },
    { orderRank: 1, category: '음료' },
  ],
]

const STAGE_INTROS = [
  '대기 주문을 시간 순으로 처리한다고 가정할 때, 아래 순서대로 메뉴를 클릭하세요.',
  '처리 우선순위는 주문 시간이 오래된 순입니다. 단계에 맞는 주문서와 카테고리를 찾아 클릭하세요.',
  '주문 대기 목록을 시간 순으로 읽을 때, 안내하는 순서대로 메뉴를 선택하세요.',
  'POS에 표시된 대기 순서를 따른다고 가정하고, 각 단계의 주문서·카테고리에 맞게 클릭하세요.',
]

const STAGE_NOTES = [
  DEFAULT_INSTRUCTION_NOTE,
  DEFAULT_INSTRUCTION_NOTE,
  DEFAULT_INSTRUCTION_NOTE,
  DEFAULT_INSTRUCTION_NOTE,
]

/**
 * 대기 주문을 시간 오름차순(먼저 처리할 순)으로 볼 때
 * 각 단계마다 **어느 주문서의 어느 카테고리**인지 구분해 클릭.
 * 같은 주문서가 연속해도 **카테고리가 다르면** 다른 단계로 취급.
 * 같은 (주문서, 카테고리) 안에서는 어떤 메뉴 행을 눌러도 됨.
 *
 * @param {number} missionIndex - `GAME_STAGE_ORDERS`·패턴 인덱스 (0 … `GAME_MISSION_COUNT`-1)
 */
export function buildClickMission(orders, missionIndex) {
  const pending = orders.filter((o) => o.status === ORDER_STATUS.ORDERED)
  const sorted = [...pending].sort(sortByOldest)
  const pattern = STAGE_MISSION_PATTERNS[missionIndex]
  if (!pattern) {
    throw new Error(`과제 ${missionIndex}에 대한 패턴이 없습니다.`)
  }
  const maxRank = Math.max(...pattern.map((p) => p.orderRank))
  if (sorted.length <= maxRank) {
    throw new Error(`스테이지 데이터: 대기 주문이 ${maxRank + 1}개 이상 필요합니다.`)
  }

  const steps = pattern.map(({ orderRank, category }) => {
    const order = sorted[orderRank]
    assertCategoryPresent(order, category)
    return { orderId: order.id, category }
  })

  const instruction = {
    intro: STAGE_INTROS[missionIndex] ?? STAGE_INTROS[0],
    bullets: pattern.map(({ orderRank, category }) => buildBullet(orderRank, category)),
    note: STAGE_NOTES[missionIndex] ?? DEFAULT_INSTRUCTION_NOTE,
  }

  return {
    instruction,
    steps,
  }
}

function O(id, time, table, items) {
  return {
    id,
    orderTime: time,
    tableNumber: String(table),
    status: ORDER_STATUS.ORDERED,
    items,
  }
}

/** 과제 4종 — 각각 주문 4건 (라운드 8회 중 과제 종류마다 2회씩 등장) */
export const GAME_STAGE_ORDERS = [
  [
    O(201, '18:05', 1, {
      메인: ['치즈 닭꼬치', '순살 후라이드'],
      사이드: ['감자튀김'],
      음료: ['콜라', '사이다', '레몬에이드'],
    }),
    O(202, '18:08', 2, {
      메인: ['국물 떡볶이'],
      사이드: ['치즈볼', '치킨 너겟'],
      음료: ['하이볼', '유자 하이볼'],
    }),
    O(203, '18:11', 3, {
      메인: ['오징어 버터구이', '모둠소시지'],
      사이드: ['모둠소시지'],
      음료: ['생맥주 500cc', '콜라', '사이다'],
    }),
    O(204, '18:14', 4, {
      메인: ['우동'],
      사이드: ['치즈볼'],
      음료: ['레몬에이드', '사이다'],
    }),
  ],
  [
    O(211, '17:50', 5, {
      메인: ['매운 어묵탕', '국물 떡볶이'],
      사이드: ['감자튀김'],
      음료: ['콜라', '사이다', '레몬에이드'],
    }),
    O(212, '17:55', 6, {
      메인: ['닭강정'],
      사이드: ['치킨 너겟', '치즈볼'],
      음료: ['하이볼', '유자 하이볼'],
    }),
    O(213, '18:02', 7, {
      메인: ['순살 후라이드', '치즈 닭꼬치'],
      사이드: ['모둠소시지'],
      음료: ['생맥주 500cc', '콜라'],
    }),
    O(214, '18:09', 8, {
      메인: ['모둠소시지'],
      사이드: ['감자튀김'],
      음료: ['사이다', '레몬에이드'],
    }),
  ],
  [
    O(221, '18:00', 9, {
      메인: ['국물 떡볶이', '우동', '닭강정'],
      사이드: ['치즈볼'],
      음료: ['콜라', '사이다', '하이볼'],
    }),
    O(222, '18:03', 10, {
      메인: ['오징어 버터구이'],
      사이드: ['치킨 너겟', '감자튀김'],
      음료: ['레몬에이드', '유자 하이볼'],
    }),
    O(223, '18:07', 11, {
      메인: ['매운 어묵탕'],
      사이드: ['모둠소시지', '치즈볼'],
      음료: ['생맥주 500cc', '콜라', '사이다'],
    }),
    O(224, '18:12', 12, {
      메인: ['치즈 닭꼬치'],
      사이드: ['감자튀김'],
      음료: ['사이다', '레몬에이드'],
    }),
  ],
  [
    O(231, '17:58', 13, {
      메인: ['순살 후라이드'],
      사이드: ['치즈볼', '치킨 너겟'],
      음료: ['콜라', '레몬에이드', '하이볼'],
    }),
    O(232, '18:01', 14, {
      메인: ['우동', '국물 떡볶이'],
      사이드: ['모둠소시지'],
      음료: ['사이다', '유자 하이볼'],
    }),
    O(233, '18:06', 15, {
      메인: ['닭강정', '오징어 버터구이'],
      사이드: ['감자튀김'],
      음료: ['생맥주 500cc', '콜라', '사이다'],
    }),
    O(234, '18:10', 1, {
      메인: ['모둠소시지'],
      사이드: ['치킨 너겟'],
      음료: ['레몬에이드', '하이볼'],
    }),
  ],
]

/** 서로 다른 과제(주문 세트·클릭 패턴) 개수 */
export const GAME_MISSION_COUNT = GAME_STAGE_ORDERS.length

/** 한 판에서 진행하는 총 라운드 수 — 표 뷰 4회 + 주문서 뷰 4회 */
export const GAME_ROUND_COUNT = 8

if (
  STAGE_MISSION_PATTERNS.length !== GAME_MISSION_COUNT ||
  STAGE_INTROS.length !== GAME_MISSION_COUNT ||
  STAGE_NOTES.length !== GAME_MISSION_COUNT
) {
  throw new Error(
    'gameStages: 과제 패턴(STAGE_MISSION_PATTERNS·STAGE_INTROS·STAGE_NOTES) 개수가 GAME_STAGE_ORDERS와 일치해야 합니다.',
  )
}
