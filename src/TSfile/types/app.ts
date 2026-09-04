/**
 * app.ts
 * アプリ全体で「ローカルストレージに保存するデータ」をまとめた型定義
 *
 * 【設計方針】
 * ・実行時の状態（タイマーが今稼働中か等）は、ここには置かない。
 *   実行状態は各アプリ（Timer.ts の TimerState 等）で完結させる。
 * ・ここに定義するのは「永続化（保存）が必要なデータ」のみ。
 *   AppStorage がこの型を基準にローカルストレージへ保存・読込を行う。
 */

/**
 * Alarm 型
 * アラーム1件分の設定データを表す
 * （保存対象：アラーム登録・有効/無効化・削除で更新される）
 *
 * - id      : アラームを識別するための文字列
 * - hour    : アラームを鳴らす「時」（0〜23）
 * - minute  : アラームを鳴らす「分」（0〜59）
 * - enabled : アラームが有効（true）か無効（false）か
 */
export type Alarm = {
    id: string;
    hour: number;
    minute: number;
    enabled: boolean;
};

/**
 * TimerHistory 型
 * タイマー設定履歴1件分のデータを表す
 *
 * - hour      : 設定した「時」（0〜23）
 * - minute    : 設定した「分」（0〜59）
 * - second    : 設定した「秒」（0〜59）
 * - createdAt : 記録した日時（ISO 8601 文字列）
 */
export type TimerHistory = {
    hour: number;
    minute: number;
    second: number;
    createdAt: string;
};

/**
 * AppData 型
 * アプリの保存対象データをひとまとめにした、保存時の全体構造
 *
 * - version         : データ形式（構造）のバージョン番号。
 *                      将来データ形式を変更したときに読み込み側で判別できるようにするための識別子
 * - alarms          : 登録されているアラームの一覧（Alarm[]）
 * - timerHistories  : 過去に設定したタイマー時間の履歴（TimerHistory[]）
 */
export type AppData = {
    version: number;
    alarms: Alarm[];
    timerHistories: TimerHistory[];
};