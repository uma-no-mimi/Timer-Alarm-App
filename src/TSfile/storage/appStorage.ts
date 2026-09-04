/**
 * appStorage.ts
 * アプリのデータをローカルストレージに保存・読み込みするためのクラス
 * アプリを再起動しても設定（アラームの登録内容やタイマーの履歴）が消えないように、
 * ブラウザのローカルストレージにデータを保存・読み込みを行う
 */

/* アプリのデータを表す型（AppData）を読み込む */
import type { AppData } from "../types/app";

/*
 * ローカルストレージにデータを保存するときのキー（名前）
 * アプリごとに1つ決めておき、同じアプリ内なら常にこのキーを使って出し入れする
 */
const STORAGE_KEY = "alarmTimerApp";

/**
 * アプリ全体のデータ（AppData）をローカルストレージに保存・読み込みするクラス
 */
export class AppStorage {

    /**
     * アプリ全体のデータをローカルストレージに保存する
     *
     * @param data 保存したいアプリ全体のデータ（アラーム一覧やタイマー履歴など）
     * @returns なし
     */
    save(data: AppData): void {
        /* 保存できるように、保存対象のデータ（オブジェクト）をJSON文字列に変換する */
        const json = JSON.stringify(data);

        /* 変換したJSON文字列を「STORAGE_KEY」という名前でローカルストレージに永続化する */
        localStorage.setItem(
            STORAGE_KEY,
            json
        );
    }

    /**
     * ローカルストレージに保存されたアプリ全体のデータを読み込む
     *
     * @returns 保存されていたアプリ全体のデータ（AppData）
     *          まだ何も保存されていない場合は、空の初期データを返す
     */
    load(): AppData {
        /* ローカルストレージから「STORAGE_KEY」に保存されたJSON文字列を取り出す */
        const json = localStorage.getItem(STORAGE_KEY);

        /*
         * JSON文字列が取得できない（null）＝まだ一度も保存されていない場合
         * このまま parse するとエラーになるため、空の初期データを返して以後の処理が空の状態から始められるようにする。
         */
        if (json === null) {
            return {
                version: 1,
                alarms: [],
                timerHistories: []
            };
        }

        /* 保存済みのJSON文字列をアプリのデータ構造（AppData）に戻して返す */
        return JSON.parse(json);
    }
}