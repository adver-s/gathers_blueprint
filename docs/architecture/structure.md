root/
├─ apps/
│  ├─ api/
│  │  ├─ src/
│  │  │  ├─ aws/                 # AWS連携関連
│  │  │  ├─ config/              # 環境変数・設定取得コード
│  │  │  ├─ controllers/
│  │  │  ├─ db/
│  │  │  ├─ libs/                # バックエンド固有ライブラリ
│  │  │  ├─ middleware/
│  │  │  ├─ models/
│  │  │  ├─ routes/
│  │  │  ├─ services/
│  │  │  ├─ utils/               # バックエンド固有ユーティリティ
│  │  │  ├─ types/               # バックエンド固有型定義
│  │  │  ├─ app.ts
│  │  │  └─ server.ts
│  │  ├─ tests/                  # バックエンド用テスト
│  │  ├─ logs/                   # ローカル/コンテナ用ログ出力
│  │  ├─ .env.local              # ローカル開発用環境変数（非機密）
│  │  ├─ .env.production         # 本番用非機密変数＋Secret名など
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  └─ web/
│     ├─ app/
│     ├─ components/
│     ├─ config/
│     ├─ contexts/
│     ├─ lib/                     # フロント固有ライブラリ
│     ├─ middleware/
│     ├─ public/
│     ├─ styles/
│     ├─ tests/                   # フロント用テスト
│     ├─ utils/                   # フロント固有ユーティリティ
│     ├─ types/                   # フロント固有型定義
│     ├─ .env.local               # ローカル開発用環境変数（非機密）
│     ├─ .env.production          # 本番用非機密変数（NEXT_PUBLIC_系）
│     ├─ next-env.d.js
│     ├─ next.config.js
│     ├─ package.json
│     ├─ postcss.config.js
│     ├─ tailwind.config.js
│     └─ tsconfig.json
├─ docs/
├─ infra/
│  ├─ docker/
│  │  ├─ api/
│  │  │  └─ nginx/
│  │  │  └─ docker-compose.dev.yml
│  │  │  └─ Dockerfile            # apps/api/Dockerfile は削除済み
│  │  └─ web/
│  │     ├─ docker-compose.dev.yml
│  │     └─ Dockerfile
│  ├─ scripts/
│  │  ├─ build_frontend.sh
│  │  ├─ deploy_backend.sh
│  │  └─ migrate_db.sh
│  └─ terraform/
│     ├─ environments/
│     │  ├─ dev/
│     │  │  └─ main.tf
│     │  └─ prod/
│     │     └─ main.tf
│     ├─ modules/
│     │  ├─ aurora/
│     │  ├─ cognito/
│     │  ├─ ec2/
│     │  ├─ iam/
│     │  ├─ network/
│     │  └─ s3/
│     └─ backend.tf
├─ packages/
│  ├─ libs/                      # 共通処理ライブラリ
│  ├─ schema/
│  ├─ ui/
│  │  ├─ components/
│  │  └─ tokens/
│  ├─ utils/                     # 共通ユーティリティ
│  └─ package.json
├─ .env.example                  # チーム向けサンプル
├─ .eslintrc.js
├─ .gitignore
├─ .prettierrc
├─ stylelintrc
└─ tsconfig.base.json
