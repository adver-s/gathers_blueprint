# API (FastAPI)

## セットアップ

```
cd apps/api
python3 -m venv venv
source venv/bin/activate
python3 -m pip install -r requirements.txt
```

## フロント（Next）との API 契約

ベース URL はフロントの [`apps/web/lib/api/baseUrl.ts`](../web/lib/api/baseUrl.ts)（`NEXT_PUBLIC_API_BASE_URL`）と一致させる。**LAN の IP で Next を開くとき**は API も同じホストの `:8000` を指す必要があるため、その場合はマシン上で uvicorn を **`0.0.0.0:8000`** で待ち受けること。

| メソッド | パス | 認証（Bearer） | フロント呼び出し |
|----------|------|----------------|------------------|
| GET | `/health` | 不要 | （手動・監視用） |
| GET | `/auth/config` | 不要 | `amplify.ts` |
| POST | `/auth/sync` | **ID トークン**（`token_use=id`） | `authSync.ts` |
| GET | `/me` | access | `postAuthSync` 経由の拡張で未使用なら省略可 |
| POST | `/me/setup` | access（`get_current_user`） | （サインアップ同期） |
| GET | `/me/events` | access + DB ユーザー必須 | `events.ts` `fetchMyScheduleEvents` |
| GET | `/me/profile` | access + DB ユーザー必須 | `me.ts` `fetchMyProfile` |
| POST | `/me/profile/setup` | access + DB ユーザー必須 | `me.ts` `setupMyProfile` |
| PATCH | `/me/profile` | access + DB ユーザー必須 | `me.ts` `updateMyProfile` |
| GET | `/events` | 不要（一覧は公開） | `events.ts` `fetchEvents` |
| POST | `/events` | access + DB ユーザー必須 | `events.ts` `createEvent` |
| GET | `/events/{id}` | 不要 | `events.ts` `fetchEventById` |
| PATCH | `/events/{id}` | access + オーナー | `events.ts` `updateEvent` |
| POST | `/events/{id}/join` | access | `events.ts` `joinEvent` |
| POST | `/events/{id}/leave` | access | `events.ts` `leaveEvent` |

クエリ（一覧系）: `include_closed`（bool）, `limit`, `offset` — フロントは `URLSearchParams` で `include_closed` 等を付与済み。

認証: **`/auth/sync` 以外の保護ルートは Cognito アクセストークン**（`token_use=access`）。`get_current_user` / `require_db_user_id` が検証する。

CORS: [`src/main.py`](src/main.py) の `CORS_ORIGINS` と（開発時）`allow_origin_regex`。本番では `CORS_ALLOW_LAN_DEV=false` 推奨。詳細は [`src/middleware/README.md`](src/middleware/README.md) または `.env.example`。

レスポンス形: JSON は概ね **snake_case**（Pydantic 既定）。`EventDetail` の拡張フィールド（`mood`, `scheduleItems` 等）はバックエンド実装とフロント型の差分があり得るため、未対応フィールドは省略または `null` 扱いでよい。

## 手動検証の推奨順（HTTP）

1. `GET {base}/health`
2. `GET {base}/auth/config`
3. `POST {base}/auth/sync`（Header: `Authorization: Bearer <ID トークン>`）
4. `GET {base}/events?include_closed=false&limit=20&offset=0`（認証なし）
5. `GET {base}/me/profile`（Header: `Authorization: Bearer <access トークン>`）
6. `GET {base}/me/events?...` およびイベント作成・参加系

`{base}` は開発時 `http://127.0.0.1:8000`、LAN からアクセスする場合は `http://<PCのLAN IP>:8000`。

`GET /events` はトレーリングスラッシュのリダイレクト（`307`）があり得る。DB 接続やマイグレーションが整っていないと `500` になる。
