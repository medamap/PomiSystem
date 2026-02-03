# Task 09: Deploy 手順の復唱 + チェックリスト提出（実行なし）

## 目的
- deploy の理解を確認し、実行移譲の可否を判断する
- 実行は禁止（レビュー/復唱のみ）

## やること
1) 下記の「復唱テンプレ」に回答
2) 実行前チェックリストを埋めて提出
3) どこがリスクか一言でまとめる

## 復唱テンプレ（回答必須）
1) 既定のデプロイ先はどこで、何が同期されますか？
2) -Target staging / -Target release の対象はそれぞれどこですか？
3) 実行前の必須前提は何ですか？（環境変数/WinSCP/ビルド）
4) 実行コマンドを挙げてください（通常/ドライラン）

## 実行前チェックリスト（提出必須）
- [ ] dotnet publish -c Release 済み
- [ ] 環境変数3つが設定済み（FTP_HOST_POPPO_FARM / FTP_USER_POPPO_FARM / FTP_PASS_POPPO_FARM）
- [ ] WinSCP CLI パスが存在
- [ ] 対象ブランチ/コミットが正しい
- [ ] デプロイ先の同時配信ルールを理解している
- [ ] -DryRun で確認する/した

## 禁止
- デプロイの実行は禁止

## 成果報告（必須）
- `communication/toCodex/report/` に報告書を提出
- ファイル名: `260202_22xx_from_Gemini_deploy_recap.md`
- 回答とチェックリストを必ず含める
