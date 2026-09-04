/**
 * TimerHistoryModal.ts
 * タイマー設定履歴のモーダルウィンドウ（履歴一覧の表示・選択反映）を管理するクラス
 *
 * ・History ボタンで開く履歴一覧のモーダルウィンドウを表示 / 非表示する
 * ・履歴をクリックすると、その設定時間（時・分・秒）をタイマー入力欄（TimerInput）へ反映し、設定したことがわかるように「設定しました」と表示する
 */

import type { TimerHistory } from "../types/app";
import { TimerHistoryManager } from "./TimerHistoryManager";
import { TimerInput } from "./TimerInput";
import { formatTimeParts } from "../common/format";

/** タイマー履歴モーダルを構成するDOM要素 */
export interface TimerHistoryModalElements {
  /** モーダル全体（表示/非表示の切替に使う） */
  modal: HTMLElement;
  /** 履歴一覧を描画するリスト */
  list: HTMLElement;
  /** モーダルを閉じるボタン */
  closeButton: HTMLButtonElement;
  /** 「設定しました」を表示する欄 */
  setMessage: HTMLElement;
}

export class TimerHistoryModal {
  /** モーダル全体 */
  private modal: HTMLElement;
  /** 履歴一覧を描画するリスト */
  private list: HTMLElement;
  /** モーダルを閉じるボタン */
  private closeButton: HTMLButtonElement;
  /** 「設定しました」を表示する欄 */
  private setMessage: HTMLElement;
  /** タイマー入力クラス（履歴の設定値反映用） */
  private timerInput: TimerInput;
  /** タイマー設定履歴の管理クラス */
  private historyManager: TimerHistoryManager;

  /**
   * @param elements 履歴モーダルウィンドウを構成するDOM要素
   * @param timerInput タイマー入力クラス（履歴選択時に設定値を反映するため）
   * @param historyManager タイマー設定履歴の管理クラス（一覧の取得のため）
   */
  constructor(
    elements: TimerHistoryModalElements,
    timerInput: TimerInput,
    historyManager: TimerHistoryManager
  ) {
    this.modal = elements.modal;
    this.list = elements.list;
    this.closeButton = elements.closeButton;
    this.setMessage = elements.setMessage;
    this.timerInput = timerInput;
    this.historyManager = historyManager;

    /* モーダルを閉じるボタンで、モーダルを閉じる */
    this.closeButton.addEventListener("click", () => this.close());
  }

  /** 履歴モーダルを開く（一覧を描画してから表示する） */
  open(): void {
    this.renderHistoryList();
    this.modal.classList.remove("hidden");
  }

  /** 履歴モーダルを閉じる */
  close(): void {
    this.modal.classList.add("hidden");
  }

  /* 履歴一覧をモーダル内に描画する */
  private renderHistoryList(): void {
    const histories = this.historyManager.getAll();
    this.list.innerHTML = "";

    /* 新しい順（先頭が最新）で1件ずつ選択ボタンとして表示する
       履歴0件のときは History ボタンが無効になりモーダルを開けないため、このループは必ず1件以上になる */
    for (const history of histories) {
      const listItem = document.createElement("li");
      const itemButton = document.createElement("button");
      itemButton.type = "button";
      itemButton.textContent = formatTimeParts(
        history.hour,
        history.minute,
        history.second
      );
      itemButton.addEventListener("click", () =>
        this.applyHistorySetting(history)
      );
      listItem.appendChild(itemButton);
      this.list.appendChild(listItem);
    }
  }

  /* 履歴を選択：設定値へ反映し、モーダルを閉じて「設定しました」を表示する */
  private applyHistorySetting(history: TimerHistory): void {
    this.timerInput.setValues(history.hour, history.minute, history.second);
    this.close();
    this.showSetMessage();
  }

  /* 「設定しました」を数秒間表示する */
  private showSetMessage(): void {
    this.setMessage.textContent = "設定しました";
    this.setMessage.classList.remove("hidden");

    window.setTimeout(() => {
      this.setMessage.classList.add("hidden");
    }, 2500);
  }
}