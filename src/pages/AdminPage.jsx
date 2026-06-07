import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import userResponses from '../data/userResponses.json'

const MISSION_ORDER = ['M01', 'M02', 'M03', 'M04']
const VIEW_LABELS = {
  table: '표 뷰',
  slip: '주문서 뷰',
}

function averageMs(values) {
  const valid = values.filter((value) => Number.isFinite(value))
  if (!valid.length) return null
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length)
}

function formatMs(value) {
  return Number.isFinite(value) ? `${value}ms` : '-'
}

function clickAccuracy(correctClicks, totalClicks) {
  if (!totalClicks) return 0
  return Math.round((correctClicks / totalClicks) * 100)
}

function measuredViewForRound(round, view) {
  const measured = round.viewResults?.[view]
  if (measured) return measured
  if (round.view === view) {
    return {
      responseTimeMs: round.responseTimeMs,
      misclickCount: round.misclickCount,
      totalClickCount: round.totalClickCount,
      correctClickCount: round.correctClickCount ?? round.clickCount,
    }
  }
  return null
}

function normalizeRound(round) {
  const view = round.view ?? (round.excelView ? 'table' : 'slip')
  const tableResult = measuredViewForRound(round, 'table') ?? round.excelView ?? null
  const slipResult = measuredViewForRound(round, 'slip') ?? round.gridView ?? null
  const primaryResult = measuredViewForRound(round, view) ?? tableResult ?? slipResult
  return {
    ...round,
    round: round.round,
    missionId: round.missionId ?? round.taskId ?? `M${String(round.round).padStart(2, '0')}`,
    taskLabel: round.taskLabel,
    view,
    viewLabel: round.viewLabel ?? VIEW_LABELS[view] ?? view,
    responseTimeMs: round.responseTimeMs ?? primaryResult?.responseTimeMs ?? null,
    misclickCount: round.misclickCount ?? primaryResult?.misclickCount ?? 0,
    totalClickCount:
      round.totalClickCount ??
      primaryResult?.totalClickCount ??
      (round.correctClickCount ?? round.clickCount ?? 3) + (primaryResult?.misclickCount ?? 0),
    correctClickCount: round.correctClickCount ?? round.clickCount ?? 3,
    viewResults: {
      ...(tableResult ? { table: tableResult } : {}),
      ...(slipResult ? { slip: slipResult } : {}),
    },
  }
}

function normalizeUser(user) {
  const sourceRounds = user.rounds ?? user.quizSequence ?? []
  const rounds = sourceRounds.map(normalizeRound).sort((a, b) => a.round - b.round)
  const tableResults = rounds.map((round) => measuredViewForRound(round, 'table')).filter(Boolean)
  const slipResults = rounds.map((round) => measuredViewForRound(round, 'slip')).filter(Boolean)
  const allResults = rounds.flatMap((round) => [measuredViewForRound(round, 'table'), measuredViewForRound(round, 'slip')].filter(Boolean))
  const totalClicks = allResults.reduce((sum, result) => sum + (result.totalClickCount ?? 0), 0)
  const totalCorrectClicks = allResults.reduce((sum, result) => sum + (result.correctClickCount ?? 3), 0)
  const tableMisclickTotal = tableResults.reduce((sum, result) => sum + (result.misclickCount ?? 0), 0)
  const slipMisclickTotal = slipResults.reduce((sum, result) => sum + (result.misclickCount ?? 0), 0)
  return {
    ...user,
    participantId: user.participantId ?? user.userId,
    participantGroup: user.participantGroup ?? '-',
    rounds,
    tableAvg: averageMs(tableResults.map((result) => result.responseTimeMs)),
    slipAvg: averageMs(slipResults.map((result) => result.responseTimeMs)),
    tableMisclickTotal,
    slipMisclickTotal,
    totalClicks,
    totalMisclicks: tableMisclickTotal + slipMisclickTotal,
    accuracy: clickAccuracy(totalCorrectClicks, totalClicks),
  }
}

function buildLinePath(values, xAt, yAt) {
  if (!values.length) return ''
  let drawing = false
  return values
    .map((value, idx) => {
      if (!Number.isFinite(value)) {
        drawing = false
        return ''
      }
      const command = drawing ? 'L' : 'M'
      drawing = true
      return `${command} ${xAt(idx).toFixed(2)} ${yAt(value).toFixed(2)}`
    })
    .filter(Boolean)
    .join(' ')
}

function TrendChart({ points, xLabel }) {
  const width = 320
  const height = 150
  const padding = {
    top: 12,
    right: 24,
    bottom: 34,
    left: 24,
  }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const tableValues = points.map((point) => point.tableValue)
  const slipValues = points.map((point) => point.slipValue)
  const all = [...tableValues, ...slipValues].filter((value) => Number.isFinite(value))

  if (!all.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
        표시할 그래프 데이터가 없습니다.
      </div>
    )
  }

  const min = Math.min(...all)
  const max = Math.max(...all)
  const safeMax = max === min ? max + 1 : max
  const xAt = (idx) => padding.left + (idx / (points.length - 1 || 1)) * plotWidth
  const yAt = (value) => padding.top + plotHeight - ((value - min) / (safeMax - min)) * plotHeight
  const tablePath = buildLinePath(tableValues, xAt, yAt)
  const slipPath = buildLinePath(slipValues, xAt, yAt)

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-32 w-full overflow-visible">
        <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#cbd5e1" strokeWidth="1" />
        {points.map((point, idx) => {
          const x = xAt(idx)
          return (
            <g key={`axis-${point.key}`}>
              <line x1={x} y1={padding.top} x2={x} y2={height - padding.bottom} stroke="#e2e8f0" strokeWidth="1" />
              <text
                x={x}
                y={height - 12}
                textAnchor="middle"
                className="fill-slate-500 text-[11px] font-medium"
              >
                {point.label}
              </text>
            </g>
          )
        })}
        <path d={tablePath} fill="none" stroke="#dc2626" strokeWidth="2.5" />
        <path d={slipPath} fill="none" stroke="#2563eb" strokeWidth="2.5" />
        {points.map((point, idx) => {
          const x = xAt(idx)
          return (
            <g key={point.key}>
              {Number.isFinite(point.tableValue) && (
                <circle
                  cx={x}
                  cy={yAt(point.tableValue)}
                  r="3"
                  fill="#dc2626"
                />
              )}
              {Number.isFinite(point.slipValue) && (
                <circle
                  cx={x}
                  cy={yAt(point.slipValue)}
                  r="3"
                  fill="#2563eb"
                />
              )}
            </g>
          )
        })}
      </svg>
      <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-0.5 w-5 bg-red-600" />
          표 뷰
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-0.5 w-5 bg-blue-600" />
          주문서 뷰
        </span>
      </div>
      <div className="mt-1 text-xs text-slate-500">x축: {xLabel}, y축: 응답시간(ms)</div>
    </div>
  )
}

function resultsByView(rounds, view) {
  return rounds.map((round) => measuredViewForRound(round, view)).filter(Boolean)
}

function buildMissionOrderedSequence(rounds) {
  return MISSION_ORDER.map((missionId) => {
    const missionRounds = rounds.filter((round) => round.missionId === missionId)
    return {
      key: missionId,
      label: missionId,
      tableValue: averageMs(missionRounds.map((round) => measuredViewForRound(round, 'table')?.responseTimeMs)),
      slipValue: averageMs(missionRounds.map((round) => measuredViewForRound(round, 'slip')?.responseTimeMs)),
    }
  })
}

function ActualResultsSection({ results, status, onRefresh }) {
  const rows = useMemo(() => {
    return results
      .filter((result) => Array.isArray(result.rounds) || Array.isArray(result.quizSequence))
      .map(normalizeUser)
      .sort((a, b) => String(b.savedAt ?? b.completedAt ?? '').localeCompare(String(a.savedAt ?? a.completedAt ?? '')))
  }, [results])

  const summary = useMemo(() => {
    const measurements = rows.flatMap((row) => row.rounds.flatMap((round) => (
      [measuredViewForRound(round, 'table'), measuredViewForRound(round, 'slip')].filter(Boolean)
    )))
    return {
      participantCount: rows.length,
      measurementCount: measurements.length,
      averageResponseTime: averageMs(measurements.map((measurement) => measurement.responseTimeMs)),
      totalClicks: measurements.reduce((sum, measurement) => sum + (measurement.totalClickCount ?? 0), 0),
      totalMisclicks: measurements.reduce((sum, measurement) => sum + (measurement.misclickCount ?? 0), 0),
    }
  }, [rows])

  return (
    <section className="mb-3 rounded-xl bg-white p-3 ring-1 ring-slate-200 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900">실제 저장 결과</h2>
          <p className="text-sm text-slate-600">게임에서 수집된 유저 응답 데이터를 보여줍니다.</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          새로고침
        </button>
      </div>

      {status === 'error' && (
        <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
          저장 결과를 불러오지 못했습니다. `npm run dev`로 실행 중인지 확인해 주세요.
        </p>
      )}

      <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="참여자" value={`${summary.participantCount}명`} />
        <Metric label="총 측정" value={`${summary.measurementCount}건`} />
        <Metric label="평균 응답시간" value={formatMs(summary.averageResponseTime)} />
        <Metric label="총 클릭" value={summary.totalClicks} />
        <Metric label="총 오클릭" value={summary.totalMisclicks} />
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
          아직 저장된 게임 결과가 없습니다.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg ring-1 ring-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-600">
              <tr>
                <th className="px-3 py-2 font-semibold">참여자</th>
                <th className="px-3 py-2 font-semibold">정보</th>
                <th className="px-3 py-2 font-semibold">수행 결과</th>
                <th className="px-3 py-2 font-semibold">평균 / 오클릭</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((result) => {
                const tableResults = resultsByView(result.rounds, 'table')
                const slipResults = resultsByView(result.rounds, 'slip')
                return (
                  <tr key={result.participantId} className="border-t border-slate-100">
                    <td className="whitespace-nowrap px-3 py-2 font-semibold text-slate-900">
                      {result.participantId}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-600">
                      {result.savedAt || result.completedAt ? new Date(result.savedAt ?? result.completedAt).toLocaleString() : '-'}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      <div className="flex flex-wrap gap-1.5">
                        {result.rounds.map((round) => (
                          <span
                            key={`${result.participantId}-${round.round}`}
                            className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
                          >
                            R{round.round} {round.missionId} · 표 {formatMs(measuredViewForRound(round, 'table')?.responseTimeMs)} / 주문서 {formatMs(measuredViewForRound(round, 'slip')?.responseTimeMs)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                      표 {formatMs(averageMs(tableResults.map((result) => result.responseTimeMs)))} · 주문서{' '}
                      {formatMs(averageMs(slipResults.map((result) => result.responseTimeMs)))} · 오클릭 {result.totalMisclicks}회
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  )
}

function AdminPage() {
  const [viewMode, setViewMode] = useState('table')
  const [actualResults, setActualResults] = useState([])
  const [actualStatus, setActualStatus] = useState('loading')

  const loadActualResults = useCallback(() => {
    setActualStatus('loading')
    fetch('/api/results')
      .then((response) => {
        if (!response.ok) throw new Error('저장 결과를 불러오지 못했습니다.')
        return response.json()
      })
      .then((data) => {
        setActualResults(Array.isArray(data) ? data : [])
        setActualStatus('ready')
      })
      .catch(() => {
        setActualStatus('error')
      })
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(loadActualResults, 0)
    return () => window.clearTimeout(timer)
  }, [loadActualResults])

  const users = useMemo(() => {
    const source = actualResults.length ? actualResults : userResponses
    return source
      .filter((user) => Array.isArray(user.rounds) || Array.isArray(user.quizSequence))
      .map(normalizeUser)
  }, [actualResults])

  const summaryByMission = useMemo(() => {
    return MISSION_ORDER.map((missionId) => {
      const rows = users.flatMap((user) => user.rounds).filter((round) => round.missionId === missionId)
      return {
        key: missionId,
        label: missionId,
        tableValue: averageMs(rows.map((round) => measuredViewForRound(round, 'table')?.responseTimeMs)),
        slipValue: averageMs(rows.map((round) => measuredViewForRound(round, 'slip')?.responseTimeMs)),
      }
    })
  }, [users])

  return (
    <main className="min-h-screen w-full bg-slate-100 px-3 py-3 text-slate-900 sm:px-4 sm:py-4">
      <section className="mb-3 flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold sm:text-xl">관리자 페이지</h1>
          <p className="text-sm text-slate-600">유저별 응답 데이터</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            홈
          </Link>
          <Link
            to="/tutorial"
            className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            게임
          </Link>
        </div>
      </section>

      <ActualResultsSection results={actualResults} status={actualStatus} onRefresh={loadActualResults} />

      <section className="mb-3 rounded-xl bg-white p-3 ring-1 ring-slate-200 sm:p-4">
        <p className="mb-2 text-sm text-slate-600">
          각 유저는 저장된 실제 측정값 기준으로 표 뷰와 주문서 뷰의 응답시간·클릭·오클릭을 비교합니다.
        </p>
        <div className="inline-flex rounded-lg bg-slate-100 p-1 ring-1 ring-slate-200">
          {[
            ['table', '표 보기'],
            ['graph', '그래프 보기'],
            ['summary', '종합 보기'],
          ].map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                viewMode === mode ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {viewMode === 'graph' && (
        <section className="space-y-3">
          {users.map((user) => (
            <article key={user.participantId} className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h2 className="text-base font-bold text-slate-900">{user.participantId}</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  그룹 {user.participantGroup}
                </span>
                <span className="text-xs font-medium text-slate-600">
                  표 {formatMs(user.tableAvg)} / 주문서 {formatMs(user.slipAvg)}
                </span>
                <span className="text-xs font-medium text-slate-600">
                  정답률 {user.accuracy}% · 오클릭 {user.totalMisclicks}회
                </span>
              </div>

              <div>
                <h3 className="mb-1 text-sm font-semibold text-slate-800">태스크 유형별 응답시간 그래프</h3>
                <TrendChart points={buildMissionOrderedSequence(user.rounds)} xLabel="태스크 유형(M01~M04)" />
              </div>

              <div className="mt-2 text-xs text-slate-500">
                실제 풀이 순서: {user.rounds.map((round) => `${round.missionId}/${round.viewLabel}`).join(' -> ')}
              </div>
            </article>
          ))}
        </section>
      )}

      {viewMode === 'summary' && (
        <section className="space-y-3">
          <article className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
            <h2 className="mb-2 text-base font-bold text-slate-900">종합 결과 (전체 유저 통합)</h2>
            <div>
              <h3 className="mb-1 text-sm font-semibold text-slate-800">태스크 유형별 평균 응답시간 그래프</h3>
              <TrendChart points={summaryByMission} xLabel="태스크 유형(M01~M04)" />
            </div>
          </article>
        </section>
      )}

      {viewMode === 'table' && (
        <section className="space-y-3">
          {users.map((user) => (
            <article key={user.participantId} className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
              <header className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-slate-100 px-4 py-3">
                <h2 className="text-base font-bold text-slate-900">{user.participantId}</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  그룹 {user.participantGroup}
                </span>
                <span className="text-xs font-medium text-slate-600">정답률 {user.accuracy}%</span>
                <span className="text-xs font-medium text-slate-600">
                  총 클릭 {user.totalClicks}회 · 오클릭 {user.totalMisclicks}회
                </span>
                <span className="text-xs font-medium text-slate-600">표 평균 {formatMs(user.tableAvg)}</span>
                <span className="text-xs font-medium text-slate-600">주문서 평균 {formatMs(user.slipAvg)}</span>
              </header>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-600">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Round / Task</th>
                      <th className="px-4 py-2.5 font-semibold">표 뷰</th>
                      <th className="px-4 py-2.5 font-semibold">주문서 뷰</th>
                      <th className="px-4 py-2.5 font-semibold">실제 수행 뷰</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.rounds.map((response) => {
                      const tableResult = measuredViewForRound(response, 'table')
                      const slipResult = measuredViewForRound(response, 'slip')
                      return (
                        <tr key={`${user.participantId}-${response.round}`} className="border-t border-slate-100">
                          <td className="px-4 py-2.5 text-slate-800">
                            <div className="font-semibold">
                              R{response.round} - {response.missionId}
                            </div>
                            <div className="text-xs text-slate-500">
                              {response.taskLabel ?? `정답 단계 ${response.expectedSteps?.length ?? response.correctClickCount}개`}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-slate-700">
                            <div>{formatMs(tableResult?.responseTimeMs)}</div>
                            <div className="mt-1 text-xs text-slate-500">오클릭 {tableResult?.misclickCount ?? '-'}회</div>
                          </td>
                          <td className="px-4 py-2.5 text-slate-700">
                            <div>{formatMs(slipResult?.responseTimeMs)}</div>
                            <div className="mt-1 text-xs text-slate-500">오클릭 {slipResult?.misclickCount ?? '-'}회</div>
                          </td>
                          <td className="px-4 py-2.5 text-slate-700">
                            <div className="font-semibold text-slate-800">{response.viewLabel}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              {formatMs(response.responseTimeMs)} · 오클릭 {response.misclickCount}회
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

export default AdminPage
