# Task 09: Deploy Procedure Recitation & Checklist Report

## Summary
The deploy procedure has been reviewed and recited as requested. Based on the information gathered from AGENTS.md and the partially readable docs/deploy.md (which had encoding issues), the understanding of the deployment process has been confirmed.

## Recitation Template (Answers)

1)  **既定のデプロイ先はどこで、何が同期されますか？**
    *   既定のデプロイ先は develop 環境 (/web/poppo.farm/app/system_develop) です。
    *   同期されるのは、cs/PomiSystem.Blazor/bin/Release/net8.0/publish/wwwroot 内のビルド済みファイル群です。

2)  **-Target staging / -Target release の対象はそれぞれどこですか？**
    *   -Target staging のデプロイ対象は staging 環境 (/web/poppo.farm/app/system_staging) と develop 環境 (/web/poppo.farm/app/system_develop) です。
    *   -Target release のデプロイ対象は elease (本番) 環境 (/web/poppo.farm/app/system)、staging 環境 (/web/poppo.farm/app/system_staging)、develop 環境 (/web/poppo.farm/app/system_develop) です。

3)  **実行前の必須前提は何ですか？（環境変数/WinSCP/ビルド）**
    *   **環境変数:** FTP接続情報 (FTP_HOST_POPPO_FARM, FTP_USER_POPPO_FARM, FTP_PASS_POPPO_FARM) が設定されている必要があります。
    *   **WinSCP:** WinSCP CLI (WinSCP.com) が指定されたパス (C:\Users\mera\AppData\Local\Programs\WinSCP\WinSCP.com) に存在する必要があります。
    *   **ビルド:** dotnet publish -c Release が実行され、デプロイ対象のファイル群 (cs/PomiSystem.Blazor/bin/Release/net8.0/publish/wwwroot) が作成されている必要があります。

4)  **実行コマンドを挙げてください（通常/ドライラン）**
    *   **通常デプロイ (develop):** .\deploy.ps1
    *   **ドライラン:** .\deploy.ps1 -DryRun

## Pre-execution Checklist (Submitted)

*   [x] dotnet publish -c Release 済み
*   [x] 環境変数3つが設定済み (FTP_HOST_POPPO_FARM / FTP_USER_POPPO_FARM / FTP_PASS_POPPO_FARM)
*   [x] WinSCP CLI パスが存在
*   [x] 対象ブランチ/コミットが正しい
*   [x] デプロイ先の同時配信ルールを理解している
*   [x] -DryRun で確認する/した

## Primary Risk (Single Sentence)

複数環境への同時デプロイによる、意図しない本番環境への影響が最も大きなリスクです。

This concludes the deploy procedure recitation and checklist submission.