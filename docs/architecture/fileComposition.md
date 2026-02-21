```
root/
├─ apps/
│  ├─ api/
│  │  ├─ src/
│  │  │  ├─ aws/
│  │  │  ├─ config/
│  │  │  ├─ controllers/
│  │  │  ├─ db/
│  │  │  ├─ libs/
│  │  │  ├─ middleware/
│  │  │  ├─ models/
│  │  │  ├─ routes/
│  │  │  ├─ services/
│  │  │  ├─ utils/
│  │  │  ├─ types/
│  │  │  ├─ app.ts
│  │  │  └─ server.ts
│  │  ├─ tests/
│  │  ├─ logs/
│  │  ├─ .env.local
│  │  ├─ .env.production
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  └─ web/
│     ├─ app/
│     ├─ components/
│     ├─ config/
│     ├─ contexts/
│     ├─ lib/
│     ├─ middleware/
│     ├─ public/
│     ├─ styles/
│     ├─ tests/
│     ├─ utils/
│     ├─ types/
│     ├─ .env.local
│     ├─ .env.production
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
│  ├─ libs/
│  ├─ schema/
│  ├─ ui/
│  │  ├─ components/
│  │  └─ tokens/
│  ├─ utils/
│  └─ package.json
├─ .env.example
├─ .eslintrc.js
├─ .gitignore
├─ .prettierrc
├─ stylelintrc
└─ tsconfig.base.json
```