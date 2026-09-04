/**
 * format.ts
 * アプリ全体で使う「時間・時刻の表示用フォーマット関数」をまとめたクラス
 *
 * タイマー画面・履歴モーダル・（今後）アラーム画面など、複数箇所で共通利用。
 * 表示形式を変えるときにはこのクラスを修正するだけで済むようにする。
 */

/**
 * 秒数を「時:分:秒」（例：05:03:12）の文字列に変換する
 *
 * @param total 総秒数（例: 183 → "00:03:03"）
 * @returns 「時:分:秒」形式の文字列（例：05:03:12）
 */
export function formatTime(total: number): string {
  const hour = Math.floor(total / 3600).toString().padStart(2, "0");
  const minute = Math.floor((total % 3600) / 60).toString().padStart(2, "0");
  const second = (total % 60).toString().padStart(2, "0");
  return `${hour}:${minute}:${second}`;
}

/**
 * 時・分・秒の値を「時:分:秒」（例：01:02:03）の文字列に変換する
 *
 * @param hour 時（0〜23）
 * @param minute 分（0〜59）
 * @param second 秒（0〜59）
 * @returns 「時:分:秒」形式の文字列
 */

export function formatTimeParts(
  hour: number,
  minute: number,
  second: number
): string {
  const h = hour.toString().padStart(2, "0");
  const m = minute.toString().padStart(2, "0");
  const s = second.toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}