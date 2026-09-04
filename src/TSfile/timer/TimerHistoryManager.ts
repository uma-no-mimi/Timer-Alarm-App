/**
 * TimerHistoryManager.ts
 * タイマー設定履歴を管理するクラス
 *
 * ・タイマーを開始したときに呼ばれ、設定時間（時・分・秒）を履歴として記録
 * ・保存できる件数は最大5件（超過したら最も古い履歴を削除）
 * ・履歴は「新しい順」で管理する（先頭=最新、末尾=最も古い）
 * ・同じ設定時間は重複して保存しない（既に保存済みの時間を再設定した場合は、その履歴を削除して一番新しい履歴として先頭に登録し直す＝最新化する）
 * ・履歴はローカルストレージ（AppStorage）に保存され、次回起動時にも読み込める
 *
 * 動作概要（タイマー開始時）:
 *   設定時間を受け取る → 同じ時間の履歴があれば削除（最新化）
 *   → 5件超過なら最も古い履歴（末尾）を削除 → 先頭に追加 → 保存
 */

import type { AppData, TimerHistory } from "../types/app";
import { AppStorage } from "../storage/appStorage";

export class TimerHistoryManager {
  /** 保存できる履歴の最大件数（仕様: 最大5件） */
  private static readonly MAX_HISTORIES = 5;

  /** 現在保持している履歴の一覧 */
  private histories: TimerHistory[] = [];

  /** ローカルストレージ操作を担うクラス */
  private storage: AppStorage;

  /**
   * コンストラクタ：保存済みの履歴をローカルストレージから読み込む
   * @param storage ローカルストレージ操作クラス
   */
  constructor(storage: AppStorage) {
    this.storage = storage;
    this.histories = this.storage.load().timerHistories;
  }

  /**
   * タイマー開始時に設定時間（時・分・秒）を履歴へ追加する
   *
   * 同じ設定時間の履歴が既に存在する場合は、重複して追加せずに
   * その既存の履歴を削除して、改めて一番新しい履歴（先頭）として登録し直す。
   *
   * @param hour 設定した時
   * @param minute 設定した分
   * @param second 設定した秒
   * @returns 履歴を追加（または最新化）できたら true、認められない場合は false
   */
  add(hour: number, minute: number, second: number): boolean {
    /* 同じ設定時間の履歴が既にあれば、その古い履歴を削除して（最新化の準備） */
    this.removeDuplicate(hour, minute, second);

    /* 5件を超えて保存しないため、既に最大件数なら最も古い履歴（末尾）を削除する */
    if (this.histories.length >= TimerHistoryManager.MAX_HISTORIES) {
      this.histories.pop();
    }

    /* 新しい履歴を先頭に追加する（作成日時は現在日時） */
    this.histories.unshift({
      hour,
      minute,
      second,
      createdAt: new Date().toISOString(),
    });

    this.saveToStorage();
    return true;
  }

  /**
   * 履歴一覧を取得する
   * @returns 現在の履歴一覧（新しい順。先頭=最新）。外部から変更されないようコピーを返す
   */
  getAll(): TimerHistory[] {
    return [...this.histories];
  }

  /**
   * 現在の履歴件数を返す（History ボタンの押下可否判定に使う）
   * @returns 履歴の件数
   */
  getHistoryCount(): number {
    return this.histories.length;
  }

  /**
   * 同じ設定時間（時・分・秒）の履歴が既に存在する場合、その履歴を一覧から削除する
   * （再設定された同じ時間を、一番新しい履歴として登録し直すための前処理）
   */
  private removeDuplicate(hour: number, minute: number, second: number): void {
    this.histories = this.histories.filter(
      (history) =>
        !(
          history.hour === hour &&
          history.minute === minute &&
          history.second === second
        )
    );
  }

  /**
   * 現在の履歴一覧をローカルストレージへ保存する
   */
  private saveToStorage(): void {
    const data: AppData = this.storage.load();
    data.timerHistories = [...this.histories];
    this.storage.save(data);
  }
}