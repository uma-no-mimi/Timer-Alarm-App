/**
 * main.ts
 * アプリの「入口（スタート地点）」
 * HTML 要素を取り出し、モード切替・タイマー入力・タイマー稼働・タイマー制御のクラスを組み立てて、アプリ全体を動かす
 * DOM要素の取得、オブジェクトの生成、イベントリスナーの設定などを行う
 */

import { ModeController } from "./ModeController";
import { TimerInput, type TimeInputField } from "./TimerInput";
import { Timer } from "./Timer";
import { TimerController } from "./TimerController";


/* モード切替（DOM）：画面を切り替えるためのボタンと、2つの画面を取得する */

const timerMode = document.querySelector<HTMLElement>("#timerMode")!;
const alarmMode = document.querySelector<HTMLElement>("#alarmMode")!;
const timerModeButton = document.querySelector<HTMLButtonElement>("#timerModeButton")!;
const alarmModeButton = document.querySelector<HTMLButtonElement>("#alarmModeButton")!;

const modeController = new ModeController(
  timerMode,
  alarmMode,
  timerModeButton,
  alarmModeButton
);


/* タイマー入力（DOM）：時・分・秒の入力欄と、表示欄・ボタンを取得する */

/**
 * スライダーとテキストボックスを組み合わせた1つの入力欄（TimeInputField）を作る
 * @param sliderId スライダーのID（例: "#hourSlider"）
 * @param textBoxId テキストボックスのID（例: "#hourValue"）
 * @param max この欄の上限値（時=23、分・秒=59）
 * @returns スライダー・テキストボックス・上限値をまとめた TimeInputField
 */
function createTimeField(sliderId: string, textBoxId: string, max: number): TimeInputField {
  return {
    slider: document.querySelector<HTMLInputElement>(sliderId)!,
    textBox: document.querySelector<HTMLInputElement>(textBoxId)!,
    max,
  };
}

const timeFields: TimeInputField[] = [
  createTimeField("#hourSlider", "#hourValue", 23),
  createTimeField("#minuteSlider", "#minuteValue", 59),
  createTimeField("#secondSlider", "#secondValue", 59),
];

const timerDisplay = document.querySelector<HTMLElement>("#timerDisplay")!;
/* 設定したタイマー時間を表示する欄（タイマー稼働の上部） */
const timerSetDisplay = document.querySelector<HTMLElement>("#timerSetDisplay")!;
/* タイマー入力欄（稼働中は非表示にする） */
const timerSetting = document.querySelector<HTMLElement>("#timerSetting")!;
/* History ボタン（タイマー稼働中は非表示にする） */
const historyButton = document.querySelector<HTMLButtonElement>("#historyButton")!;
const timerActionButton = document.querySelector<HTMLButtonElement>("#timerActionButton")!;
const cancelButton = document.querySelector<HTMLButtonElement>("#cancelButton")!;


/* オブジェクト生成・組み立て：部品（クラス）を作成し、互いにつなぐ */

/* タイマー入力クラスを、時・分・秒の3つの入力欄（timeFields）を渡して作成 */
const timerInput = new TimerInput(timeFields);

/* タイマーの稼働本体（カウントダウンや状態管理）を作成 */
const timer = new Timer();

/* タイマー制御クラスを、表示欄・設定時間表示欄・入力欄・Historyボタン・操作ボタン・タイマー本体・入力クラスを渡して作成 */
const timerController = new TimerController(
  timerDisplay,
  timerSetDisplay,
  timerSetting,
  historyButton,
  timerActionButton,
  cancelButton,
  timer,
  timerInput
);

/* 「入力欄の値が変わったら、ボタンの表示（Start等）も更新する」ようにつなぐ */
timerInput.setChangeListener(() => timerController.refreshButtons());


/* ==== 初期化・モード切替の結線：起動時の初期表示と、画面切り替えボタンに動作を登録 ==== */

/* 起動直後は「タイマーモード」を表示する */
modeController.showTimerMode();

/* 「Timer-Mode」ボタンが押されたらタイマーモードを表示する */
timerModeButton.addEventListener("click", () => modeController.showTimerMode());

/* 「Alarm-Mode」ボタンが押されたらアラームモードを表示する */
alarmModeButton.addEventListener("click", () => modeController.showAlarmMode());

/* 初期表示のときの操作ボタン（Start / Cancel 等）の状態を反映する */
timerController.refreshButtons();