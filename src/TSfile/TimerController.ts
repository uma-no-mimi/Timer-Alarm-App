/**
 * TimerController.ts
 * タイマーの画面（表示・ボタン）を制御するクラス
 * タイマー本体（Timer）の状態変化を受け取って、残り時間の表示やボタンの出し分け、入力のロックを行う
 *
 * ・操作ボタン（Start / Pause / Resume / Stop）は同じ場所に1つ表示され、状態に合わせてラベルと色が切り替わる
 * ・Cancel はタイマー稼働中（実行中・一時停止）だけ表示される
 */

import { Timer, type TimerState } from "./Timer";
import { TimerInput } from "./TimerInput";

export class TimerController {
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
  /** タイマーの稼働本体 */
  private timer: Timer;
  /** タイマー入力クラス（設定時間の取得・入力ロック用） */
  private timerInput: TimerInput;

  /** 現在のタイマー状態（表示用に保持） */
  private state: TimerState = "idle";

  constructor(
    timerDisplay: HTMLElement,
    timerSetDisplay: HTMLElement,
    timerSetting: HTMLElement,
    historyButton: HTMLButtonElement,
    actionButton: HTMLButtonElement,
    cancelButton: HTMLButtonElement,
    timer: Timer,
    timerInput: TimerInput
  ) {
    this.timerDisplay = timerDisplay;
    this.timerSetDisplay = timerSetDisplay;
    this.timerSetting = timerSetting;
    this.historyButton = historyButton;
    this.actionButton = actionButton;
    this.cancelButton = cancelButton;
    this.timer = timer;
    this.timerInput = timerInput;

    /* タイマー本体の変化を画面に反映する */
    this.timer.setEvents({
      onTick: (remainingSeconds) => this.updateTimerDisplay(remainingSeconds),
      onStateChange: (state) => {
        this.state = state;
        this.updateUi();
      },
    });

    /* 操作ボタン・キャンセルボタンのクリックを登録 */
    this.actionButton.addEventListener("click", () => this.handleAction());
    this.cancelButton.addEventListener("click", () => this.cancel());
  }

  /** 入力内容の変更時にボタン表示を更新（main から呼び出す） */
  refreshButtons(): void {
    this.updateUi();
  }

  /* 操作ボタンが押されたとき、現在の状態に応じて実行する処理を振り分ける */
  private handleAction(): void {
    switch (this.state) {
      case "idle":
        this.start();
        break;
      case "running":
        this.timer.pause();
        break;
      case "paused":
        this.timer.resume();
        break;
      case "ringing":
        this.timer.stop();
        break;
    }
  }

  /* Start：設定した時間でタイマー本体を開始する */
  private start(): void {
    const totalSeconds = this.timerInput.getTotalSeconds();
    if (totalSeconds >= 1) {
      this.timer.start(totalSeconds);
    }
  }

  /* Cancel：タイマー本体をキャンセルする（設定時間に戻る） */
  private cancel(): void {
    this.timer.cancel(this.timerInput.getTotalSeconds());
  }

  /* 残り時間を時計表示（例: 05:03:12）にして画面に反映する */
  private updateTimerDisplay(remainingSeconds: number): void {
    this.timerDisplay.textContent = formatTime(remainingSeconds);
  }

  /* 状態に合わせて、操作ボタンの表示と入力ロックをまとめて更新する */
  private updateUi(): void {
    this.updateActionButton();
    this.updateCancelButton();
    this.updateHistoryButton();
    this.updateTimerSettingDisplay();
    this.updateTimerDisplayColor();
    this.timerInput.setLocked(this.state === "running" || this.state === "paused");
  }

  /* History ボタンはタイマー待機中（idle）だけ表示する */
  private updateHistoryButton(): void {
    this.historyButton.classList.toggle("hidden", this.state !== "idle");
  }

  /* 稼働中は「設定した時間」をタイマー稼働の上部に表示し、入力欄を非表示にする */
  private updateTimerSettingDisplay(): void {
    /* 待機（idle）以外はタイマーが開始されているため、設定時間の表示と入力欄の非表示を継続する */
    const active = this.state !== "idle";

    if (active) {
      /* 設定した時間を表示（例: 05:00:00） */
      this.timerSetDisplay.textContent = formatTime(this.timerInput.getTotalSeconds());
      /* タイマー入力欄を非表示にする */
      this.timerSetting.classList.add("hidden");
    } else {
      /* 待機に戻ったら、設定時間の表示を消して入力欄を再表示する */
      this.timerSetDisplay.textContent = "";
      this.timerSetting.classList.remove("hidden");
    }
  }

  /* タイマー表示の文字色：実行中 #4A90D9 / 一時停止 #40916C / 鳴動中 #EF9745 */
  private updateTimerDisplayColor(): void {
    this.timerDisplay.classList.toggle("running", this.state === "running");
    this.timerDisplay.classList.toggle("paused", this.state === "paused");
    this.timerDisplay.classList.toggle("ringing", this.state === "ringing");
  }

  /* 操作ボタン（Start / Pause / Resume / Stop）を1つのボタンで出し分ける */
  private updateActionButton(): void {
    let label = "Start";
    let colorClass = "";
    let visible = true;

    switch (this.state) {
      case "idle":
        if (this.timerInput.getTotalSeconds() >= 1) {
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
  private updateCancelButton(): void {
    const visible = this.state === "running" || this.state === "paused";
    this.setButtonVisible(this.cancelButton, visible);
  }

  /* ボタンを見せる / 見えなくする（見えない時もスペースは確保する） */
  private setButtonVisible(button: HTMLButtonElement, visible: boolean): void {
    button.classList.toggle("invisible", !visible);
    button.disabled = !visible;
  }
}

/**
 * 秒数を「時:分:秒」（例：05:03:12）の文字列に変換する
 * @param total 残り秒数
 * @returns 「時:分:秒」形式の文字列（例：05:03:12）
 */
function formatTime(total: number): string {
  const hour = Math.floor(total / 3600).toString().padStart(2, "0");
  const minute = Math.floor((total % 3600) / 60).toString().padStart(2, "0");
  const second = (total % 60).toString().padStart(2, "0");
  return `${hour}:${minute}:${second}`;
}