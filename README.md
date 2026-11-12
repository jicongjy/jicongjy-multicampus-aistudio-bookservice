# 독서 메뉴 (Reading Menu)

AI Studio에서 만든 도서 추천 웹앱입니다. 읽을 책을 "메인 메뉴 + 사이드 메뉴"처럼 조합해 추천합니다.

## 실행 방법

필요한 것: Node.js

1. 의존성 설치: `npm install`
2. `.env.example`을 `.env`로 복사하고 키를 채웁니다. (`.env`는 저장소에 올라가지 않습니다.)
   - `ANTHROPIC_API_KEY`, `ANTHROPIC_WORKSPACE_ID`: Claude를 쓸 때
   - `GEMINI_API_KEY`: Gemini를 쓸 때
   - 키가 없어도 키워드 분석 기본 모드로 동작합니다.
3. 실행: `npm run dev` (http://localhost:3000)

## 보안 메모

- API 키는 코드나 저장소에 넣지 않고 환경변수로만 설정합니다.
- `firebase-applet-config.json`의 `apiKey`는 웹앱용 공개 식별자입니다. 데이터 접근은 `firestore.rules`로 제한합니다.
