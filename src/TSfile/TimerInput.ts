/**
 * TimerInput.ts
 * タイマーの「時・分・秒」を入力する部分を管理するクラス
 * スライダーを動かすとテキストボックスに数字が入り、テキストボックスに数字を入れるとスライダーも動く
 *
 * ・入力値の範囲チェック（補完ルール）
 * ・実行中の入力禁止（ロック）
 * ・入力内容が変わったことを外部へ通知
 */

/** 時・分・秒の1つの入力欄（スライダー + テキストボックス）を表す */
export interface TimeInputField {
  /** スライダー */
  slider: HTMLInputElement;
  /** テキストボックス */
  textBox: HTMLInputElement;
  /** この欄の上限値（時=23、分・秒=59） */
  max: number;
}

export class TimerInput {
  /** 時・分・秒の3つの入力欄 */
  private fields: TimeInputField[];
  /** 入力内容が変わったときに呼ばれる通知先 */
  private onChange: () => void = () => { };

  constructor(fields: TimeInputField[]) {
    this.fields = fields;
    this.bindEvents();
    this.syncAll();
  }

  /** 入力内容が変わったことを外部に通知するリスナーを登録 */
  setChangeListener(listener: () => void): void {
    this.onChange = listener;
  }

  /**
   * 時・分・秒を合計した秒数を返す（例: 1分30秒 → 90）
   * @returns 合計した残り秒数
   */
  getTotalSeconds(): number {
    /* 時・分・秒のそれぞれの重み（1時間=3600秒、1分=60秒、1秒=1秒） */
    const WEIGHTS = [3600, 60, 1];
    return this.fields.reduce((sum, field, index) => {
      return sum + Number(field.slider.value) * (WEIGHTS[index] ?? 1);
    }, 0);
  }

  /** 稼働中などにスライダー・テキストボックスを無効化する */
  setLocked(locked: boolean): void {
    for (const field of this.fields) {
      field.slider.disabled = locked;
      field.textBox.disabled = locked;
    }
  }

  private emitChange(): void {
    this.onChange();
  }

  /**
   * 補完ルール：
   * - 上限値を超える数値 → 上限値に補完
   * - 小数を含む数値 → 切り上げて整数に補完
   * - 上限値を超えた小数 → 上限値に補完
   * - 負の値 → 絶対値として扱い、さらに上限値を超える場合は上限値に補完
   */
  private normalizeInputValue(raw: string, max: number): number {
    const value = Number(raw);
    if (Number.isNaN(value)) {
      return 0;
    }
    return Math.min(Math.ceil(Math.abs(value)), max);
  }

  /* スライダーの値（例: "5"）を2桁（"05"）にしてテキストボックスに反映する */
  private syncTextFromSlider(field: TimeInputField): void {
    field.textBox.value = field.slider.value.padStart(2, "0");
  }

  /* テキストボックスの値を補完ルールで正規化し、スライダーと表示に反映する */
  private normalizeTextBox(field: TimeInputField): void {
    const normalized = this.normalizeInputValue(field.textBox.value, field.max);
    field.slider.value = String(normalized);
    this.syncTextFromSlider(field);
  }

  /* 各入力欄にイベント（フォーカス・入力・Enter など）を登録する */
  private bindEvents(): void {
    for (const [index, field] of this.fields.entries()) {
      /* フォーカス時に全選択（既存の「00」を消さずに置き換えて入力できる） */
      field.textBox.addEventListener("focus", () => {
        field.textBox.select();
      });

      /* スライダー → テキストボックス */
      field.slider.addEventListener("input", () => {
        this.syncTextFromSlider(field);
        this.emitChange();
      });

      /* テキストボックス → スライダー（入力途中は解釈できる範囲で反映） */
      field.textBox.addEventListener("input", () => {
        const parsed = Number(field.textBox.value);
        if (!Number.isNaN(parsed)) {
          field.slider.value = String(parsed);
        }
        this.emitChange();
      });

      /* フォーカスが外れたら補完ルールで正規化 */
      field.textBox.addEventListener("blur", () => {
        this.normalizeTextBox(field);
        this.emitChange();
      });

      /* Enter キー押下でも補完して次の入力欄へ移動 */
      field.textBox.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          this.normalizeTextBox(field);
          this.emitChange();

          const nextField = this.fields[index + 1];
          if (nextField) {
            nextField.textBox.focus();
          }
        }
      });
    }
  }

  /* 全入力欄の表示をスライダーの値に合わせる（初期表示用） */
  private syncAll(): void {
    for (const field of this.fields) {
      this.syncTextFromSlider(field);
    }
  }
}