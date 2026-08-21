/**
 * ModeController.ts
 * タイマーモード / アラームモードの画面切り替えを管理するクラス
 *
 * 2つの画面（section）と2つのボタンを受け取り、「hidden（非表示）」クラスの付け外しで画面を出し入れし、
 * 選択中のボタンには active（色付き）クラスを付ける
 */

export class ModeController {
  /** タイマーモードの画面 */
  private timerMode: HTMLElement;
  /** アラームモードの画面 */
  private alarmMode: HTMLElement;
  /** 「Timer-Mode」ボタン */
  private timerModeButton: HTMLButtonElement;
  /** 「Alarm-Mode」ボタン */
  private alarmModeButton: HTMLButtonElement;

  constructor(
    timerMode: HTMLElement,
    alarmMode: HTMLElement,
    timerModeButton: HTMLButtonElement,
    alarmModeButton: HTMLButtonElement
  ) {
    this.timerMode = timerMode;
    this.alarmMode = alarmMode;
    this.timerModeButton = timerModeButton;
    this.alarmModeButton = alarmModeButton;
  }

  /**
   * タイマーモードを表示し、アラームモードを非表示にする
   * @returns なし
   */
  showTimerMode(): void {
    this.setMode(true);
  }

  /**
   * アラームモードを表示し、タイマーモードを非表示にする
   * @returns なし
   */
  showAlarmMode(): void {
    this.setMode(false);
  }

  /**
   * どちらのモードを表示するかを切り替える（内部処理）
   * @param showTimer trueならタイマーモード、falseならアラームモードを表示
   * @returns なし
   */
  private setMode(showTimer: boolean): void {
    this.timerMode.classList.toggle("hidden", !showTimer);
    this.alarmMode.classList.toggle("hidden", showTimer);

    this.timerModeButton.classList.toggle("active", showTimer);
    this.alarmModeButton.classList.toggle("active", !showTimer);
  }
}