# 段階3 実行用プロンプト
（ゲームに participant を結合 ＋ GAS送信を共通化：submit.js）

あなたはフロントエンド実装に精通したエンジニアです。
段階1（index.html + participant.js）と段階2（pre/postへのparticipant適用）を完了した前提で、
最後に **ゲーム（index.html + js/app.js）** に participant を結合し、
**GAS送信を全ページで共通化**してスプレッドシートで一元管理できる状態にしてください。

この段階では、既存のゲーム体験やUIを壊さずに、送信点だけを確実に整えることが目的です。

## 対象ファイル
- index.html
- js/app.js
- js/participant.js（段階1）
- js/survey.js（段階2）
- 新規：js/submit.js

## ゴール（段階3で必ず満たすこと）
1) 直リンク対策（ガード）
- index.html を直接開いたとき、participant が無ければ index.html にリダイレクト
  - `requireParticipantOrRedirect()` を使う

2) ゲーム送信に participant を必ず含める
- 既存の `sendGameData()` または `completeGameAndSend()` の送信データに、以下を結合する
  - anonymous_code
  - gender
  - age

3) GAS送信を共通化（新規 submit.js）
- GAS WebアプリURLを `WEB_APP_URL` として submit.js に1か所で管理
- fetchでPOST(JSON)で送信
- 全ページ共通の送信フォーマットに統一：
  {
    "anonymous_code": "...",
    "gender": "...",
    "age": 0,
    "page": "pre" | "game" | "post",
    "timestamp": "ISO文字列",
    "payload": { ページ固有データ }
  }
- submit.js に共通関数 `submitToGAS({ page, payload })` を提供

4) pre/post の送信も submitToGAS に切り替える（安全に）
- survey.js の送信箇所を最小変更で submitToGAS を使う形に置き換える
- 送信失敗時はユーザーに分かる形で通知し、勝手に home に戻らない

5) 完了後の戻り先
- ゲーム：完了画面に「トップに戻る」ボタン → index.html
- pre/post：送信成功後 1〜2秒待って index.html（段階2の挙動維持）

## 実装ルール（重要）
- ゲームの進行ロジック、表示切替（navigateTo等）は壊さない
- survey.js / app.js を全文書き換えしない（差分追記が原則）
- JSの読み込み順に注意し、submit.js は利用側より先に読み込まれるようにする
  - 推奨：participant.js → submit.js → app.js / survey.js の順

## 具体的な実装指示
### A. js/submit.js（新規）
- 以下を実装
  - const WEB_APP_URL = "<<<GAS_WEB_APP_URL>>>"（後で差し替え）
  - async function submitToGAS({ page, payload }) { ... }
    - participant = getParticipant()
    - JSON組み立て（共通フォーマット）
    - fetch POST application/json
    - 成功/失敗を返す（true/false or throw）

### B. index.html（ガード＋読み込み順）
- DOMContentLoaded で requireParticipantOrRedirect() を呼ぶ
- submit.js を読み込むscriptタグを追加する
- 完了画面に「トップに戻る」ボタンが無い場合は追加し、index.htmlへ遷移する

### C. js/app.js（ゲーム送信差分）
- 既存の送信関数（sendGameData等）を、submitToGAS({ page:'game', payload: gamePayload }) に置き換える
- payload には既存の gameData（answers, completionTime 等）を入れる
- participantの3項目は submit.js 側で共通付与するため、payloadには重複させない（してもよいが推奨はしない）

### D. js/survey.js（pre/post送信差分）
- 既存のGAS送信処理を submitToGAS に置き換える
- page は pre/post で明確に指定
- payload には既存の回答データをそのまま入れる
- participantの3項目は submit.js 側で共通付与するため、payloadには重複させない

## 検証手順（この順で）
1) homeで participant 保存
2) index.html を開く（直リンクでもhomeへ戻されない）
3) ゲーム完了 → GASに `page=game` で1行追加される
4) pre-survey送信 → `page=pre`
5) post-survey送信 → `page=post`
6) すべて同一 anonymous_code で揃う

## 出力形式
- js/submit.js：全文
- index.html：追記箇所の差分（コピペ可能）
- js/app.js：差分（送信箇所中心）
- js/survey.js：差分（送信箇所中心）
- 余計な改善提案や大規模整理はしない
