# Implementation Plan: エントリーポイントの分散と属性入力の各ページへの移設

このプランでは、`index.html` の簡略化と、各個別ページへの属性入力機能の分散・統合を行います。

## Phase 1: 共通入力UI・ロジックの準備 [checkpoint: e3294b9]
各ページで再利用できる属性入力用のHTML/JavaScriptコンポーネントまたは関数を準備します。

- [x] Task: 属性入力フォームの共通HTMLテンプレートの作成 e7529ed
- [x] Task: `js/participant.js` に属性情報の存在チェックとUI表示を制御する共通関数の追加 d2ce991
- [x] Task: 属性入力フォームのスタイリング（既存のCSSとの統合） 66eb4ab
- [ ] Task: Conductor - User Manual Verification 'Phase 1: 共通入力UI・ロジックの準備' (Protocol in workflow.md)

## Phase 2: index.html の簡略化 [checkpoint: 62c573c]
`index.html` から入力フォームを削除し、純粋なナビゲーションページにします。

- [x] Task: `index.html` から属性入力関連のHTML要素を削除 2f07367
- [x] Task: `index.html` 内のJavaScriptロジックを修正し、ナビゲーションボタンを常時有効化 2f07367
- [ ] Task: Conductor - User Manual Verification 'Phase 2: index.html の簡略化' (Protocol in workflow.md)

## Phase 3: 各個別ページへの属性入力の組み込み [checkpoint: 060df30]
事前アンケート、ゲーム、事後アンケートの各ページに属性入力機能を統合します。

- [x] Task: `pre-survey.html` への属性入力UIの統合と表示制御の実装 9557db9
- [x] Task: `game.html` への属性入力UIの統合と表示制御の実装 9557db9
- [x] Task: `post-survey.html` への属性入力UIの統合と表示制御の実装 9557db9
- [ ] Task: Conductor - User Manual Verification 'Phase 3: 各個別ページへの属性入力の組み込み' (Protocol in workflow.md)

## Phase 4: データ連携の最終確認 [checkpoint: 0b339ed]
各ページでの入力データが正しく保存され、既存の送信処理に組み込まれているかを確認します。

- [x] Task: 各ページからのデータ送信時に属性情報が含まれていることを確認・修正 46c28f8
- [x] Task: 全体的なユーザーフローの動作確認（全3パターン + 後日事後のみ） 54068b7
- [ ] Task: Conductor - User Manual Verification 'Phase 4: データ連携の最終確認' (Protocol in workflow.md)
