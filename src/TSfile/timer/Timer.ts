/**
 * Timer.ts
 * タイマーの稼働を管理するクラス
 * 残り時間のカウントダウンと、状態（待機・実行中・一時停止・鳴動中）の切り替えを行う
 *
 *  開始時に「残り秒数」を受け取り、1秒ごとに残り時間を減らす
 *  状態や残り時間が変わったときは、登録したコールバック（onTick /onStateChange）を呼び出して、画面側へ変化を伝える
 */

/** タイマーの状態 */
export type TimerState =
  "idle" | // 待機状態
  "running" | // 実行中
  "paused" | // 一時停止
  "ringing"; // 鳴動中

/** Timer から画面へ通知するためのイベント */
export interface TimerEvents {
  /** 残り時間が変わるたびに呼ばれる（引数: 残り秒数） */
  onTick?: (remainingSeconds: number) => void;
  /** 状態が変わったときに呼ばれる（引数: 新しい状態） */
  onStateChange?: (state: TimerState) => void;
}

/** タイマーの稼働を管理するクラス */
export class Timer {
  /** 現在の状態 */
  private state: TimerState = "idle";
  /** 残り秒数 */
  private remainingSeconds = 0;
  /** 1秒ごとに動くカウントダウンの管理番号 */
  private intervalId: ReturnType<typeof setInterval> | null = null;
  /** 画面側への通知先 */
  private events: TimerEvents = {};

  /** イベント（通知先）を登録する */
  setEvents(events: TimerEvents): void {
    this.events = events;
  }

  /** 現在の状態を返す */
  getState(): TimerState {
    return this.state;
  }

  /** 残り時間（秒）を返す */
  getRemainingSeconds(): number {
    return this.remainingSeconds;
  }

  /** 設定した時間からカウントダウンを開始する（状態：待機 → 実行中） */
  start(totalSeconds: number): void {
    if (this.state !== "idle") {
      return;
    }
    if (totalSeconds < 1) {
      return;
    }
    this.remainingSeconds = totalSeconds;
    this.changeState("running");
    this.notifyTick();
    this.startInterval();
  }

  /** 一時停止する（状態：実行中 → 一時停止） */
  pause(): void {
    if (this.state !== "running") {
      return;
    }
    this.clearInterval();
    this.changeState("paused");
  }

  /** 一時停止から再開する（状態：一時停止 → 実行中） */
  resume(): void {
    if (this.state !== "paused") {
      return;
    }
    this.changeState("running");
    this.startInterval();
  }

  /** 鳴動中にタイマーを停止する（状態：鳴動中 → 待機） */
  stop(): void {
    if (this.state !== "ringing") {
      return;
    }
    this.clearInterval();
    /* 停止後は表示を00:00:00に戻し、待機状態に戻す */
    this.remainingSeconds = 0;
    this.changeState("idle");
    this.notifyTick();
  }

  /** 実行中・一時停止中のタイマーをキャンセルして待機に戻す（連打しても1回だけ） */
  cancel(): void {
    if (this.state !== "running" && this.state !== "paused") {
      return;
    }
    this.clearInterval();
    /* キャンセル後は表示を00:00:00に戻し、待機状態に戻す */
    this.remainingSeconds = 0;
    this.changeState("idle");
    this.notifyTick();
  }

  /** 1秒ごとに残り時間を減らす処理を開始する */
  private startInterval(): void {
    this.intervalId = setInterval(() => {
      this.remainingSeconds -= 1;
      this.notifyTick();
      if (this.remainingSeconds <= 0) {
        this.handleEnd();
      }
    }, 1000);
  }

  /** 残り時間が 0 になったとき（状態：実行中 → 鳴動中） */
  private handleEnd(): void {
    this.clearInterval();
    this.remainingSeconds = 0;
    this.changeState("ringing");
    this.notifyTick();
  }

  private clearInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private changeState(state: TimerState): void {
    this.state = state;
    this.events.onStateChange?.(state);
  }

  private notifyTick(): void {
    this.events.onTick?.(this.remainingSeconds);
  }
}