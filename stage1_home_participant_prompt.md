# 段階1 実行用プロンプト
（index.html + participant.js）

あなたはフロントエンド実装に精通したエンジニアです。
既存のサイトは壊さずに、新規トップページ index.html と参加者情報管理JS participant.js を追加してください。
この段階では GAS 送信や既存の pre/post/game の改修は行いません（段階2以降でやる）。
まず「保存・復元・終了（削除）・遷移ブロック」が確実に動く状態を作ることが目的です。

## 既存資産（CSS）
- css/variables.css
- css/main.css
- css/survey.css

## 新規作成ファイル
- index.html
- js/participant.js

## index.html 要件
- 匿名コード（text）
- 性別（select：男性 / 女性 / その他 / 回答しない）
- 年齢（number：6〜120）
- 保存して進む
- 事前アンケートへ
- ゲーム開始
- 事後アンケートへ
- 終了する（participant削除）

※ participant 未保存時は遷移不可

## participant.js 要件
- localStorage key: participant
- getParticipant()
- saveParticipant()
- clearParticipant()
- requireParticipantOrRedirect()

## 出力形式
- index.html：全文
- js/participant.js：全文
- 既存ファイルは変更しない
