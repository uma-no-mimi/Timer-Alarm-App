/**
 * TimerView.ts
 * タイマー画面の「表示（UI）」を担当するクラス（ビュー）
 * 画面の描画・ボタンの出し分けを行う。
 *
 * ・残り時間の表示
 * ・操作ボタン（Start / Pause / Resume / Stop）のラベル・色の出し分け
 * ・Cancel ボタン・History ボタンの表示と押下可否
 * ・設定時間表示欄・入力欄の切り替え
 * ・タイマー表示の文字色
 * ・各ボタンのクリック処理の登録口（bind）
 *
 * 状態の判断（合計秒数・履歴件数など）は行わず、引数で受け取った値をそのまま表示に反映する。
 */
import { type TimerState } from "./Timer";
import { formatTime } from "../common/format";

export class TimerView {
  /** 残り時間を表示する欄 */
  private timerDisplay: HTMLElement;
  /** 設定したタイマー時間をタイマー稼働の上部に表示する欄 */
  private timerSetDisplay: HTMLElement;
  /** タイマー設定（時・分・秒の入力欄） */
  private timerSetting: HTMLElement;
  /** History ボタン（タイマー稼働中は非表示にする） */
  private historyButton: HTMLButtonElement;
  /** Start / Pause / Resume / Stop を切り替える操作ボタン */
  private actionButton: HTMLButtonElement;
  /** キャンセルボタン */
  private cancelButton: HTMLButtonElement;

  constructor(
    timerDisplay: HTMLElement,
    timerSetDisplay: HTMLElement,
    timerSetting: HTMLElement,
    historyButton: HTMLButtonElement,
    actionButton: HTMLButtonElement,
    cancelButton: HTMLButtonElement
  ) {
    this.timerDisplay = timerDisplay;
    this.timerSetDisplay = timerSetDisplay;
    this.timerSetting = timerSetting;
    this.historyButton = historyButton;
    this.actionButton = actionButton;
    this.cancelButton = cancelButton;
  }

  /* ===== クリック処理の登録 ===== */

  /** 操作ボタン（Start / Pause / Resume / Stop）のクリック処理 */
  bindActionButton(listener: () => void): void {
    this.actionButton.addEventListener("click", listener);
  }

  /** Cancel ボタンのクリック処理 */
  bindCancelButton(listener: () => void): void {
    this.cancelButton.addEventListener("click", listener);
  }

  /** History ボタンのクリック処理 */
  bindHistoryButton(listener: () => void): void {
    this.historyButton.addEventListener("click", listener);
  }

  /* ===== 表示の更新 ===== */
  /** 残り時間を時計表示（例: 05:03:12）にして画面に反映する */
  updateTimerDisplay(remainingSeconds: number): void {
    this.timerDisplay.textContent = formatTime(remainingSeconds);
  }

  /**
   * 状態に合わせて、画面の表示・ボタンをまとめて更新
   * @param state 現在のタイマー状態
   * @param totalSeconds 設定した合計秒数
   * @param hasHistory 履歴が1件以上あるか
   */
  updateUi(state: TimerState, totalSeconds: number, hasHistory: boolean): void {
    this.updateActionButton(state, totalSeconds);
    this.updateCancelButton(state);
    this.updateHistoryButton(state, hasHistory);
    this.updateTimerSettingDisplay(state, totalSeconds);
    this.updateTimerDisplayColor(state);
  }

  /* 操作ボタン（Start / Pause / Resume / Stop）を1つのボタンで出し分ける */
  private updateActionButton(state: TimerState, totalSeconds: number): void {
    let label = "Start";
    let colorClass = "";
    let visible = true;

    switch (state) {
      case "idle":
        if (totalSeconds >= 1) {
          label = "Start";
        } else {
          visible = false;
        }
        break;

      case "running":
        label = "Pause";
        colorClass = "pause-button";
        break;

      case "paused":
        label = "Resume";
        colorClass = "resume-button";
        break;

      case "ringing":
        label = "Stop";
        colorClass = "stop-button";
        break;
    }

    this.actionButton.textContent = label;
    this.actionButton.classList.toggle("pause-button", colorClass === "pause-button");
    this.actionButton.classList.toggle("resume-button", colorClass === "resume-button");
    this.actionButton.classList.toggle("stop-button", colorClass === "stop-button");
    this.setButtonVisible(this.actionButton, visible);
  }

  /* Cancel はタイマー稼働中（実行中・一時停止）のみ表示 */
  private updateCancelButton(state: TimerState): void {
    const visible = state === "running" || state === "paused";
    this.setButtonVisible(this.cancelButton, visible);
  }

  /* History ボタンはタイマー待機中（idle）だけ表示し、履歴の有無で押下可否を変える */
  private updateHistoryButton(state: TimerState, hasHistory: boolean): void {
    /* タイマー待機中のみ表示する */
    this.historyButton.classList.toggle("hidden", state !== "idle");

    /* 履歴が1件も記録されていない間は、History ボタンを押下できないようにする */
    this.historyButton.disabled = !hasHistory;

    /* 履歴があるときは「has-history」クラスを付けて、ボタンと文字の色を変える */
    this.historyButton.classList.toggle("has-history", hasHistory);
  }

  /* 稼働中は「設定した時間」をタイマー稼働の上部に表示し、入力欄を非表示にする */
  private updateTimerSettingDisplay(state: TimerState, totalSeconds: number): void {
    /* 待機（idle）以外はタイマーが開始されているため、設定時間の表示と入力欄の非表示を継続する */
    const active = state !== "idle";

    if (active) {
      /* 設定した時間を表示（例: 05:00:00） */
      this.timerSetDisplay.textContent = formatTime(totalSeconds);
      /* タイマー入力欄を非表示にする */
      this.timerSetting.classList.add("hidden");
    } else {
      /* 待機に戻ったら、設定時間の表示を消して入力欄を再表示する */
      this.timerSetDisplay.textContent = "";
      this.timerSetting.classList.remove("hidden");
    }
  }

  /* タイマー表示の文字色：実行中 #4A90D9 / 一時停止 #40916C / 鳴動中 #EF9745 */
  private updateTimerDisplayColor(state: TimerState): void {
    this.timerDisplay.classList.toggle("running", state === "running");
    this.timerDisplay.classList.toggle("paused", state === "paused");
    this.timerDisplay.classList.toggle("ringing", state === "ringing");
  }

  /* ボタンを見せる / 見えなくする（見えない時もスペースは確保する） */
  private setButtonVisible(button: HTMLButtonElement, visible: boolean): void {
    button.classList.toggle("invisible", !visible);
    button.disabled = !visible;
  }
}
