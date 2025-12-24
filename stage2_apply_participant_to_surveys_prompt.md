# 段階2 実行用プロンプト
（participant を pre-survey / post-survey に適用：ガード＋自動入力＋戻り）

あなたはフロントエンド実装に精通したエンジニアです。
段階1で追加した **index.html** と **js/participant.js**（localStorageに participant を保存）を前提に、
既存のアンケートページ **pre-survey.html / post-survey.html** に participant を適用してください。

この段階の目的は、**参加者情報の一元化（匿名コード・性別・年齢）をアンケートに確実に反映**し、
「直接URLアクセス」や「入力の重複」を事故なく防ぐことです。

## 対象ファイル
- pre-survey.html
- post-survey.html
- js/survey.js
- （既存のCSSファイルは原則変更しない）

## 前提（段階1でできていること）
- localStorage の key `participant` に以下のJSONが保存されている
  - anonymous_code（必須）
  - gender（必須）
  - age（必須）
- js/participant.js に以下の関数がある（無い場合は追加してよい）
  - getParticipant()
  - requireParticipantOrRedirect()

## ゴール（段階2で必ず満たすこと）
1) 直リンク対策（ガード）
- pre-survey.html / post-survey.html を直接開いたとき、participant が無ければ **index.html にリダイレクト**
- 方式は統一：`location.replace('index.html')`

2) 自動入力（重複排除）
- pre-survey.html：
  - anonymous_code / gender / age を participant から自動入力
  - 可能なら readonly / disabled にしてユーザーが編集できないようにする
- post-survey.html：
  - anonymous_code を participant から自動入力
  - 可能なら readonly にする

3) アンケート送信の整合（この段階ではGAS送信の統合はしない）
- 既存の送信ロジック（survey.jsの submit ハンドラ）を壊さない
- 送信後の動作：
  - pre-survey：送信完了表示（alert等）の後に **1〜2秒待って index.html に戻る**
  - post-survey：既存の送信結果通知の後に **1〜2秒待って index.html に戻る**
- 送信失敗時（例：console error）には勝手に戻らない（可能なら）

## 実装ルール（重要）
- 既存のHTML構造とCSSは極力変更しない
- 既存の `initializeSurveys()` / `handlePreSurveySubmit()` / `handlePostSurveySubmit()` を大改修しない
- 追加するJSは「participantガード」「入力の自動反映」「戻り遷移」だけに限定
- イベントの二重登録（submitが2回走る）を絶対に起こさない

## 実装方針（推奨）
- pre-survey.html / post-survey.html の `<script src="js/survey.js"></script>` の後に
  `<script src="js/participant.js"></script>` を読み込み、以下を実行する
  - DOMContentLoaded で requireParticipantOrRedirect()
  - participantがある場合、対象inputへ値をセットし readonly/disabled

※ただし、既存の読み込み順が制約になる場合は survey.js 側で getParticipant() を参照してもよい

## 出力形式
- pre-survey.html：どこに何を追記/変更するか（コピペ可能な差分形式）
- post-survey.html：同上
- js/survey.js：必要なら追記する部分だけ提示（全文書き換えは避ける）
- この段階では index.html / js/app.js は触らない

