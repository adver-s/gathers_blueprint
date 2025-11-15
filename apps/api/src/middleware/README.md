1. 🔐 認証（Auth）
Cognito のトークン検証(CognitoのAPIを叩くわけではない ≠aws/)
JWT の有効性チェック
Authorization ヘッダーがあるか確認

2. 🛡️ 入力バリデーション（Request Validation）
Zod や Yup を使って、
routes → controllers の前に リクエストパラメータをチェックする。

3. 📍 CORS 設定
クロスオリジンリクエストを許可／拒否。

4. 📈 ロギング（アクセスログ）
誰が何時にどの API を叩いたか
どれくらい時間がかかったか
New Relic や Datadog などの APM と併用することもある。

5. 🚦 レートリミット（DoS 攻撃対策）
特定ユーザーからの一定時間あたりのリクエスト数を制限。

6. ❗ エラーハンドリング
controller 内で throw されたエラーをキャッチして整形したレスポンスにする。