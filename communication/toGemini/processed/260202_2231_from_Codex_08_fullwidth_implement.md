# Task 08: 全幅モードの実装（MSX/X1 共通）

## 目的
- MSX/X1 の両方で「全幅モード」が効くようにする
- UIで切替、保存、復元を最小実装で行う

## 編集許可
- cs/PomiSystem.Blazor/Pages/Quick.razor
- cs/PomiSystem.Blazor/wwwroot/css/app.css
- cs/PomiSystem.Blazor/wwwroot/js/pomi-msx-main.js（localStorage補助が必要なら）

## 実装内容
1) Quick.razor
- トグル「全幅モード」を追加（MSX/X1 共通の位置）
- bool state を持つ（例: IsFullWidth）
- 初期化時に localStorage から復元
- 切替時に localStorage へ保存

2) app.css
- 既存のコンテナにクラスが付く前提で、全幅時の max-width / padding を緩める
- 影響は Quick のみ（他ページに波及させない）

## 注意
- 既存レイアウトの大幅変更は禁止
- 追加は最小限

## 成果報告（必須）
- `communication/toCodex/report/` に報告書を提出
- ファイル名: `260202_22xx_from_Gemini_fullwidth_report.md`
- 変更点と簡単な動作確認結果を記載
