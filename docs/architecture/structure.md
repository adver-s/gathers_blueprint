```
root/
├─ apps/
│  ├─ api/
│  │  ├─ src/
│  │  │  ├─ aws/                 # AWS連携関連
│  │  │  ├─ config/              # 環境変数・設定取得コード
│  │  │  ├─ controllers/
│  │  │  ├─ db/
│  │  │  ├─ lib/                # バックエンド固有ライブラリ
│  │  │  ├─ middleware/
│  │  │  ├─ models/
│  │  │  ├─ routes/
│  │  │  ├─ services/
│  │  │  ├─ utils/               # バックエンド固有ユーティリティ
│  │  │  └─ main.py
│  │  ├─ tests/                  # バックエンド用テスト
│  │  ├─ logs/                   # ローカル/コンテナ用ログ出力
│  │  ├─ venv/
│  │  ├─ .env.local              # ローカル開発用環境変数（非機密）
│  │  └─ .env.production         # 本番用非機密変数＋Secret名など
│  └─ web/
│     ├─ app/
│     ├─ components/
│     ├─ config/
│     ├─ contexts/
│     ├─ lib/                     # フロント固有ライブラリ
│     ├─ public/
│     ├─ tests/                   # フロント用テスト
│     ├─ utils/                   # フロント固有ユーティリティ
│     ├─ types/                   # フロント固有型定義
│     ├─ .env.local               # ローカル開発用環境変数（非機密）
│     ├─ .eslintrc.js             # コードのエラー指摘
│     ├─ .prettierrc              # コードの自動修正
│     ├─ .stylelintrc
│     ├─ eslint.config.js
│     ├─ next-env.d.js
│     ├─ next.config.js
│     ├─ package-lock.json
│     ├─ package.json
│     ├─ postcss.config.js
│     └─ tsconfig.json
├─ docs/
├─ infra/
│  ├─ docker/
│  │  ├─ api/
│  │  │  └─ nginx/
│  │  │  └─ docker-compose.dev.yml
│  │  │  └─ Dockerfile
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
├─ .gitignore
└─ tsconfig.base.json
```