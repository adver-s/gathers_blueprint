network/
VPC
Public / Private Subnet
Route Table
NAT Gateway

rds/
Aurora クラスター
Aurora インスタンス
IAM DB 認証の設定

ec2/
EC2 インスタンス
セキュリティグループ
IAM ロール

iam/
EC2 → Aurora アクセス権
EC2 → S3 権限
Lambda 実行ロール等（将来拡張）

目的: AWS にあるリソース（S3, Aurora, Cognito など）を 自動で作り上げるための設計図をまとめる
具体的にやること:「この S3 バケットを作る」「この Aurora を作る」と Terraform 記述で定義する
実際に Terraform を実行すると AWS 上にリソースが構築される
ポイント: ファイルの中身は「設定を書き込む」ことが目的で、直接リソースは作らない。Terraform 実行時に作られる。