/**
 * TimerController.ts
 * タイマーの「操作ロジック」と、各クラス・ビューとの橋渡しを担当するクラス
 *
 * 画面の表示・ボタンの出し分けは TimerView に分離している。
 * ここでは
 * ・操作ボタン（Start / Pause / Resume / Stop）の押下に応じた処理の振り分け
 * ・タイマー本体（Timer）との結線、状態変化の受け取り
 * ・状態に応じて TimerView へ値を渡して表示を更新
 * ・入力欄のロック（TimerInput への制御）
 * を行う。
 */

import { Timer, type TimerState } from "./Timer";
import { TimerInput } from "./TimerInput";
import { TimerHistoryManager } from "./TimerHistoryManager";
import { TimerHistoryModal } from "./TimerHistoryModal";
import { TimerView } from "./TimerView";

export class TimerController {
  /** タイマーの稼働本体 */
  private timer: Timer;
  /** タイマー入力クラス（設定時間の取得・入力ロック用） */
  private timerInput: TimerInput;
  /** タイマー設定履歴の管理クラス */
  private timerHistoryManager: TimerHistoryManager;
  /** タイマー設定履歴のモーダル */
  private timerHistoryModal: TimerHistoryModal;
  /** タイマー画面の表示（ビュー） */
  private timerView: TimerView;

  /** 現在のタイマー状態（表示用に保持） */
  private state: TimerState = "idle";

  /* =========================
    コンストラクタ
  ========================= */

  /**
   * タイマーの操作ロジックを生成する
   * タイマー本体（Timer）の変化を受け取り、各ボタンのクリック処理を登録する
   */
  constructor(
    timerView: TimerView,
    timer: Timer,
    timerInput: TimerInput,
    timerHistoryManager: TimerHistoryManager,
    timerHistoryModal: TimerHistoryModal
  ) {
    this.timerView = timerView;
    this.timer = timer;
    this.timerInput = timerInput;
    this.timerHistoryManager = timerHistoryManager;
    this.timerHistoryModal = timerHistoryModal;

    /* タイマー本体の変化を画面に反映する */
    this.timer.setEvents({
      onTick: (remainingSeconds) => this.timerView.updateTimerDisplay(remainingSeconds),
      onStateChange: (state) => {
        this.state = state;
        this.updateUi();
      },
    });

    /* 各ボタンのクリック処理を登録する */

    /* 操作ボタン（Start / Pause / Resume / Stop） */
    this.timerView.bindActionButton(() => this.handleAction());

    /* Cancel ボタン */
    this.timerView.bindCancelButton(() => this.cancel());

    /* History ボタン（履歴モーダルを開く。表示・選択反映は TimerHistoryModal が行う） */
    this.timerView.bindHistoryButton(() => this.timerHistoryModal.open());
  }


  /** 入力内容の変更時にボタン表示を更新（main から呼び出す） */
  refreshButtons(): void {
    this.updateUi();
  }

  /* =========================
    操作ボタン（Start / Pause / Resume / Stop）の処理
  ========================= */

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

  /* Start：設定した時間でタイマー本体を開始し、設定時間を履歴に記録する */
  private start(): void {
    const totalSeconds = this.timerInput.getTotalSeconds();
    if (totalSeconds < 1) {
      return;
    }
    this.timer.start(totalSeconds);

    /* 開始した設定時間（時・分・秒）をタイマー設定履歴へ追加する（重複は保存しない） */
    const { hour, minute, second } = this.timerInput.getTimeParts();
    this.timerHistoryManager.add(hour, minute, second);

    /* 履歴の有無で History ボタンの押下可否が変わるため、表示を更新する */
    this.timerView.updateUi(this.state, totalSeconds, this.timerHistoryManager.getHistoryCount() > 0);
  }

  /* =========================
    Cancel ボタンの処理
  ========================= */

  /* Cancel：タイマー本体をキャンセルする（表示を00:00:00に戻す） */
  private cancel(): void {
    this.timer.cancel();
  }

  /* =========================
    表示更新・共通処理
  ========================= */

  /* 状態に合わせて、画面表示と入力ロックをまとめて更新する */
  private updateUi(): void {
    const totalSeconds = this.timerInput.getTotalSeconds();
    const hasHistory = this.timerHistoryManager.getHistoryCount() > 0;

    this.timerView.updateUi(this.state, totalSeconds, hasHistory);
    this.timerInput.setLocked(this.state === "running" || this.state === "paused");
  }
}
