# POS View Experiment

주점 POS 주문 화면에서 `표 뷰`와 `주문서 뷰`의 수행 결과를 비교하는 React/Vite 기반 HCI 실험 앱입니다.

참가자는 튜토리얼을 본 뒤 8라운드 게임을 진행하고, 완료 결과는 로컬 JSON 파일에 저장됩니다. 관리자 페이지에서는 저장된 참가자별 응답시간, 클릭 수, 오클릭 수, 라운드별 클릭 로그를 확인할 수 있습니다.

## 실행

```bash
npm install
npm run dev
```

로컬 주소:

```text
http://127.0.0.1:5173/
```

검증 명령:

```bash
npm run lint
npm run build
```

## 주요 라우트

- `/`: 실험 소개 및 진입 화면
- `/tutorial`: 게임 튜토리얼
- `/game`: 실제 게임 진행 화면
- `/admin`: 저장 결과 관리자 화면

## 게임 구성

게임은 총 8라운드로 구성됩니다.

- 태스크 유형은 `M01`, `M02`, `M03`, `M04` 총 4개입니다.
- 각 태스크는 `표 뷰` 1회, `주문서 뷰` 1회씩 수행됩니다.
- 즉 `M01~M04` 각각에 대해 두 뷰의 결과가 모두 수집됩니다.
- 라운드 순서는 매 실행마다 랜덤으로 섞입니다.
- 게임 시작 버튼은 튜토리얼로 이동하고, 튜토리얼 완료 후 실제 게임이 시작됩니다.

## 수집 데이터

게임 완료 시 다음 정보가 저장됩니다.

- 참가자 ID
- 실험 시작/완료 시각
- 라운드 번호
- 태스크 ID
- 수행 뷰
- 안내문 표시 시간
- 실제 응답시간
- 정답 클릭 수
- 총 클릭 수
- 오클릭 수
- 클릭 순서 로그
- 기대 정답 단계

오클릭은 현재 단계에서 기대한 주문/카테고리와 다른 메뉴를 클릭했을 때 기록됩니다.

## 저장 위치

결과 파일:

```text
src/data/userResponses.json
```

개발 서버의 `/api/results` 엔드포인트가 이 파일을 읽고 씁니다.

- `GET /api/results`: 저장된 결과 조회
- `POST /api/results`: 새 게임 결과 저장

주의: 이 저장 방식은 로컬 Vite 개발 서버용입니다. `npm run build`로 생성한 정적 파일만 배포하면 `/api/results` JSON 쓰기는 동작하지 않습니다.

## 관리자 페이지

`/admin`에서는 저장된 결과를 다음 방식으로 보여줍니다.

- 실제 저장 결과 요약
- 참가자별 표 보기
- 태스크 유형별 응답시간 그래프
- 전체 참가자 통합 그래프

그래프는 `M01~M04`를 x축으로 두고, 같은 태스크 유형의 `표 뷰`와 `주문서 뷰` 결과를 같은 x 좌표에 표시합니다.

## 프로젝트 구조

```text
src/
  App.jsx
  pages/
    AdminPage.jsx
    GamePage.jsx
    GamePlayPage.jsx
  components/
    OrderTableView.jsx
    OrderSlipView.jsx
  data/
    gameStages.js
    orders.js
    userResponses.json
  utils/
    menuRows.js
vite.config.js
```

## 기술 스택

- React
- React Router
- Vite
- Tailwind CSS
- 로컬 JSON 파일 저장
