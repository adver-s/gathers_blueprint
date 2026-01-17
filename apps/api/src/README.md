[フロントエンド（apps/web）]
   ↓ fetch / axios / React Query
[HTTP Request]
  ↓
routes/（URL → controller の紐付け）
  ↓
middleware/（認証・バリデーション）
  ↓
controllers/（リクエストの制御・service 呼び出し）
  ↓
services/（ビジネスロジック）
  ↓
db/（DB のクエリ実行 ← Prisma・SQL・Dynamo）
  ↓
DB（Aurora / DynamoDB）
