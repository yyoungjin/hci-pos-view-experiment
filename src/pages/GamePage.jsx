import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import OrderTableView from '../components/OrderTableView'
import OrderSlipView from '../components/OrderSlipView'

const STEPS_TABLE = [
  {
    title: '표 뷰에 오신 것을 환영합니다!',
    body: '이 화면은 주점의 모든 주문을 엑셀처럼 한눈에 볼 수 있는 표 형식입니다.\n각 행(row)은 하나의 메뉴 항목을 나타냅니다.\n\n다음 버튼을 눌러 각 열(column)을 알아보세요.',
    target: null,
  },
  {
    title: '① 주문 시간',
    body: '주문이 접수된 시간을 나타냅니다.\n최신 주문이 위쪽에, 오래된 주문이 아래쪽에 표시됩니다.',
    target: 'col-1',
  },
  {
    title: '② 테이블 번호',
    body: '주문이 들어온 테이블 번호입니다.\n같은 테이블 번호는 항상 같은 색상의 뱃지로 표시되어,\n한 테이블의 주문을 시각적으로 빠르게 묶어볼 수 있습니다.',
    target: 'col-2',
  },
  {
    title: '③ 카테고리',
    body: '메뉴의 종류를 나타냅니다.\n메인(파랑), 사이드(주황), 음료(보라)\n3가지 카테고리가 색상 뱃지로 구분됩니다.',
    target: 'col-3',
  },
  {
    title: '④ 메뉴',
    body: '실제 주문된 메뉴 이름입니다.\n하나의 주문에 여러 메뉴가 있으면\n각 메뉴가 별도의 행으로 표시됩니다.',
    target: 'col-4',
  },
  {
    title: '⑤ 상태',
    body: '주문의 현재 진행 상태를 나타냅니다.\n"주문" = 아직 준비 중인 대기 주문\n"서빙완료" = 이미 고객에게 전달된 주문',
    target: 'col-5',
  },
  {
    title: '정렬 방식',
    body: '표는 최신 주문이 맨 위에 오도록 시간 역순으로 정렬됩니다.\n같은 주문 안에서는 메인 → 사이드 → 음료 순서로\n묶여 있어 주문 단위로 쉽게 읽을 수 있습니다.',
    target: 'top-rows',
  },
]

const STEPS_SLIP = [
  {
    title: '주문서 뷰',
    body: '이제 주문서형 레이아웃입니다.\n왼쪽은 아직 처리할 주문(대기), 오른쪽은 서빙이 끝난 주문(완료)을\n가로 파이프라인처럼 나란히 보여 줍니다.',
    target: null,
  },
  {
    title: '주문 대기 (왼쪽)',
    body: '아직 주방·홀에서 처리 중인 주문이 모입니다.\n시간이 오래된 주문이 오른쪽 열에 가깝게 배치되고,\n가장 시급한 몇 건은 색이 더 진하게 강조됩니다.',
    target: 'slip-pending',
  },
  {
    title: '테이블 번호 줄',
    body: '맨 위 행은 각 열의 테이블 번호(예: 테이블 1)를 나타냅니다.\n아래 각 행의 카드와 세로로 맞춰\n어느 테이블 주문인지 한 줄로 읽을 수 있습니다.',
    target: 'slip-pending-header',
  },
  {
    title: '카테고리별 대기열',
    body: '메인·사이드·음료마다 한 줄씩 그리드가 이어집니다.\n각 칸에는 해당 카테고리 메뉴만 모여 있어\n한 종류씩 집중해서 볼 수 있습니다.',
    target: 'slip-first-lane',
  },
  {
    title: '처리 방향',
    body: '가운데 화살표는 대기에서 완료로 넘어가는 흐름을 상징합니다.\n왼쪽에서 오른쪽으로 시선을 옮기며\n주문이 진행되는 과정을 떠올릴 수 있습니다.',
    target: 'slip-pipeline',
  },
  {
    title: '서빙 완료 (오른쪽)',
    body: '이미 고객에게 전달된 주문이 모입니다.\n막 완료된 건은 색이 강조되어\n최근 처리 상황을 빠르게 확인할 수 있습니다.',
    target: 'slip-served',
  },
  {
    title: '완료 쪽 메인 줄',
    body: '왼쪽과 마찬가지로 카테고리별로 줄이 나뉩니다.\n여기는 "메인 · 서빙 완료" 첫 줄로,\n완료된 메인 메뉴가 어떻게 배치되는지 볼 수 있습니다.',
    target: 'slip-first-served-lane',
  },
  {
    title: '튜토리얼 완료!',
    body: '표 뷰와 주문서 뷰의 구성을 모두 살펴보았습니다.\n이제 실제 게임에서 주문 상황을 얼마나 빠르게 파악하는지\n측정해 볼 수 있습니다.',
    target: null,
  },
]

/** 하이라이트 대상의 bounding rect (뷰포트 좌표) */
function measureTarget(wrapEl, target, phase) {
  if (!wrapEl) return null
  const PAD = 6

  if (phase === 'slip') {
    if (!target) {
      const el = wrapEl.querySelector('[data-tutorial="slip-root"]')
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 }
    }
    const el = wrapEl.querySelector(`[data-tutorial="${target}"]`)
    if (!el) return null
    const r = el.getBoundingClientRect()
    if (r.width === 0 && r.height === 0) {
      const root = wrapEl.querySelector('[data-tutorial="slip-root"]')
      if (!root) return null
      const fr = root.getBoundingClientRect()
      return { x: fr.left - PAD, y: fr.top - PAD, w: fr.width + PAD * 2, h: fr.height + PAD * 2 }
    }
    return { x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 }
  }

  if (!target) {
    const section = wrapEl.querySelector('section')
    if (!section) return null
    const r = section.getBoundingClientRect()
    return { x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 }
  }

  if (target.startsWith('col-')) {
    const n = target.split('-')[1]
    const cells = wrapEl.querySelectorAll(
      `thead th:nth-child(${n}), tbody td:nth-child(${n})`,
    )
    if (!cells.length) return null
    let t = Infinity,
      l = Infinity,
      b = 0,
      r = 0
    cells.forEach((c) => {
      const rect = c.getBoundingClientRect()
      t = Math.min(t, rect.top)
      l = Math.min(l, rect.left)
      b = Math.max(b, rect.bottom)
      r = Math.max(r, rect.right)
    })
    return { x: l - PAD, y: t - PAD, w: r - l + PAD * 2, h: b - t + PAD * 2 }
  }

  if (target === 'top-rows') {
    const thead = wrapEl.querySelector('thead')
    const rows = wrapEl.querySelectorAll('tbody tr:nth-child(-n+6)')
    if (!thead) return null
    const hRect = thead.getBoundingClientRect()
    let maxB = hRect.bottom
    rows.forEach((row) => {
      maxB = Math.max(maxB, row.getBoundingClientRect().bottom)
    })
    return {
      x: hRect.left - PAD,
      y: hRect.top - PAD,
      w: hRect.width + PAD * 2,
      h: maxB - hRect.top + PAD * 2,
    }
  }

  return null
}

const SPOT_MASK_ID = 'game-tutorial-spot-mask'

function GamePage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('table')
  const [step, setStep] = useState(0)
  const wrapRef = useRef(null)
  const [spot, setSpot] = useState(null)

  const steps = phase === 'table' ? STEPS_TABLE : STEPS_SLIP
  const current = steps[step]
  const isFirst = phase === 'table' && step === 0
  const isLastTableStep = phase === 'table' && step === STEPS_TABLE.length - 1
  const isLastSlipStep = phase === 'slip' && step === STEPS_SLIP.length - 1
  const atSlipStart = phase === 'slip' && step === 0

  const next = useCallback(() => {
    if (phase === 'table') {
      if (step < STEPS_TABLE.length - 1) {
        setStep((s) => s + 1)
      } else {
        setPhase('slip')
        setStep(0)
      }
      return
    }
    if (step < STEPS_SLIP.length - 1) {
      setStep((s) => s + 1)
    }
  }, [phase, step])

  const prev = useCallback(() => {
    if (phase === 'slip') {
      if (step > 0) {
        setStep((s) => s - 1)
      } else {
        setPhase('table')
        setStep(STEPS_TABLE.length - 1)
      }
      return
    }
    if (step > 0) {
      setStep((s) => s - 1)
    }
  }, [phase, step])

  useEffect(() => {
    function measure() {
      setSpot(measureTarget(wrapRef.current, current.target, phase))
    }
    const raf = requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [step, current.target, phase])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (isLastSlipStep) navigate('/game')
        else next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [next, prev, isLastSlipStep, navigate])

  const progress = ((step + 1) / steps.length) * 100
  const phaseLabel = phase === 'table' ? '표 뷰' : '주문서 뷰'

  const nextLabel =
    isLastTableStep ? '다음: 주문서 뷰 →' : isLastSlipStep ? '게임 시작 →' : '다음 →'

  return (
    <main className="relative min-h-screen w-full bg-slate-100 px-3 py-3 text-slate-900 sm:px-4 sm:py-4">
      <section className="mb-2 flex w-full items-center justify-between gap-2">
        <h1 className="text-lg font-bold sm:text-xl">POS UI 튜토리얼</h1>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
          {phaseLabel}
        </span>
      </section>

      <div ref={wrapRef} className={phase === 'table' ? 'game-table-wrap' : 'game-slip-wrap'}>
        {phase === 'table' ? <OrderTableView /> : <OrderSlipView />}
      </div>

      <svg
        className="pointer-events-auto fixed inset-0 z-40 h-full w-full"
        onClick={() => {
          if (isLastSlipStep) navigate('/game')
          else next()
        }}
        style={{ cursor: 'pointer' }}
      >
        <defs>
          <mask id={SPOT_MASK_ID}>
            <rect width="100%" height="100%" fill="white" />
            {spot && (
              <rect
                x={spot.x}
                y={spot.y}
                width={spot.w}
                height={spot.h}
                rx="12"
                fill="black"
                style={{ transition: 'all 0.4s cubic-bezier(.4, 0, 0.2, 1)' }}
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(15,23,42,0.45)"
          mask={`url(#${SPOT_MASK_ID})`}
        />
        {spot && (
          <rect
            x={spot.x}
            y={spot.y}
            width={spot.w}
            height={spot.h}
            rx="12"
            fill="none"
            stroke="rgb(250 204 21)"
            strokeWidth="2.5"
            strokeDasharray="6 3"
            style={{ transition: 'all 0.4s cubic-bezier(.4, 0, 0.2, 1)' }}
          />
        )}
      </svg>

      <div
        className="pointer-events-none fixed inset-x-0 bottom-[100px] z-50 flex justify-center px-3"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-step-title"
      >
        <div
          className="pointer-events-auto w-full max-w-2xl rounded-2xl border border-slate-200/90 bg-white/95 shadow-2xl ring-1 ring-slate-900/5 backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-1.5 overflow-hidden rounded-t-2xl bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="px-5 pt-4 pb-2">
            <div className="mb-2 flex items-center justify-between">
              <h3 id="tutorial-step-title" className="text-lg font-bold text-slate-900">
                {current.title}
              </h3>
              <span className="text-xs tabular-nums text-slate-400">
                {step + 1} / {steps.length}
              </span>
            </div>
            {atSlipStart && (
              <p className="mb-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-900 ring-1 ring-emerald-200/80">
                표 뷰 튜토리얼을 마쳤습니다. 이어서 주문서 뷰를 안내합니다.
              </p>
            )}
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {current.body}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <button
              type="button"
              onClick={prev}
              disabled={isFirst}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← 이전
            </button>
            <button
              type="button"
              onClick={() => {
                if (isLastSlipStep) navigate('/game')
                else next()
              }}
              className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              {nextLabel}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default GamePage
