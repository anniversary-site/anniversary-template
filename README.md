# 큐피드 템플릿 제작 모드

주문 프론트엔드는 큐피드 사이트를 `?orderEditor=1`로 iframe에 열어 실제 로그인·Our Story·Letter·Photo·Video·Music·Internet 창에서 주문 내용을 입력받습니다. 화면의 예시는 입력 전에는 저장되지 않습니다. 주문 초안 저장과 AI 편지 생성은 주문 프론트엔드의 기존 API를 사용합니다.

제작 모드는 `urluv.shop`, `staging.urluv.shop`, `urluv-order.vercel.app`, `edit.urluv.shop` 또는 로컬 주문 사이트에서 iframe으로 열렸을 때만 메시지를 받습니다. 일반 고객 사이트 접속에는 적용되지 않습니다.

로컬에서 프론트엔드 Vite 개발 서버를 실행하면 이 저장소가 `/cupid-editor/`에서 자동으로 제공됩니다. 스테이징에서는 이 저장소의 Vercel Preview 배포 URL을 주문 프론트엔드의 `VITE_CUPID_EDITOR_URL`에 지정해야 합니다. Preview 배포에서 `/order-editor.js`가 200으로 응답하는지 확인한 뒤 주문 프론트엔드를 배포하세요.
