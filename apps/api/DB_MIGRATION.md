# Database Migration Guide

# SQLAlchemy、Alembicのインストール
```
pip install -r requirements.txt
```

# DockerでDB起動
```
docker compose up -d
```

# .env.exampleをコピーして.env.local作成
```
cp .env.example .env.local
```

# Alembicでマイグレーション実行
```
alembic upgrade head
```

# ※DBをリセットしたい場合
```
docker compose down -v
docker compose up -d
alembic upgrade head
```