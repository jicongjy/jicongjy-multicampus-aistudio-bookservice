import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase.ts';

/**
 * Firestore 저장 구조
 *  - config/app    : 프롬프트와 AI 파라미터 (누구나 읽기, 관리자만 쓰기)
 *  - config/books  : 감정별 도서 목록 (누구나 읽기, 관리자만 쓰기)
 *  - admins/{uid}  : 관리자 명단. 문서가 있는 사용자만 관리자 (콘솔에서 직접 추가)
 * Firestore는 배열 안의 배열을 저장하지 못해서 도서는 {title, author, reason} 객체로 바꿔 저장한다.
 */
export interface RemoteAppConfig {
  emotionPrompt?: string;
  reasonPrompt?: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface BookEntry {
  name: string;
  keys: string[];
  exact?: string[];
  note?: string;
  books: [string, string, string][];
}

const appRef = () => doc(db, 'config', 'app');
const booksRef = () => doc(db, 'config', 'books');

export async function loadRemoteConfig(): Promise<RemoteAppConfig | null> {
  const snap = await getDoc(appRef());
  return snap.exists() ? (snap.data() as RemoteAppConfig) : null;
}

export async function saveRemoteConfig(cfg: Required<RemoteAppConfig>, uid: string): Promise<void> {
  await setDoc(appRef(), { ...cfg, updatedAt: serverTimestamp(), updatedBy: uid });
}

export async function resetRemoteConfig(): Promise<void> {
  await deleteDoc(appRef());
}

export async function loadRemoteBooks(): Promise<BookEntry[] | null> {
  const snap = await getDoc(booksRef());
  if (!snap.exists()) return null;
  const items = snap.data().items;
  if (!Array.isArray(items)) return null;
  const out: BookEntry[] = items.map((it: any) => ({
    name: String(it.name),
    keys: Array.isArray(it.keys) ? it.keys.map(String) : [],
    ...(Array.isArray(it.exact) ? { exact: it.exact.map(String) } : {}),
    ...(typeof it.note === 'string' && it.note ? { note: it.note } : {}),
    books: (Array.isArray(it.books) ? it.books : []).map(
      (b: any) => [String(b.title), String(b.author), String(b.reason)] as [string, string, string]
    ),
  }));
  return out.length > 0 ? out : null;
}

export async function saveRemoteBooks(items: BookEntry[], uid: string): Promise<void> {
  const plain = items.map((it) => ({
    name: it.name,
    keys: it.keys,
    exact: it.exact ?? [],
    note: it.note ?? '',
    books: it.books.map(([title, author, reason]) => ({ title, author, reason })),
  }));
  await setDoc(booksRef(), { items: plain, updatedAt: serverTimestamp(), updatedBy: uid });
}

export async function resetRemoteBooks(): Promise<void> {
  await deleteDoc(booksRef());
}

/** 관리자가 처음 접속했을 때 DB에 문서가 없으면 현재 값(기본값)으로 채운다. 이미 있으면 건드리지 않는다. */
export async function seedRemoteIfMissing(
  cfg: Required<RemoteAppConfig>,
  books: BookEntry[],
  uid: string
): Promise<void> {
  const [appSnap, booksSnap] = await Promise.all([getDoc(appRef()), getDoc(booksRef())]);
  if (!appSnap.exists()) await saveRemoteConfig(cfg, uid);
  if (!booksSnap.exists()) await saveRemoteBooks(books, uid);
}

/** 관리자 명단(admins/{uid})에 문서가 있으면 관리자. 실패 원인도 함께 돌려줘 화면에 보여 준다. */
export interface AdminCheck {
  ok: boolean;
  detail: string;
}

export async function checkIsAdmin(uid: string): Promise<AdminCheck> {
  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    return snap.exists()
      ? { ok: true, detail: '확인됨' }
      : { ok: false, detail: `문서 없음: admins/${uid}` };
  } catch (e: any) {
    return { ok: false, detail: `읽기 오류(${e?.code || 'unknown'}): ${e?.message || ''}` };
  }
}
