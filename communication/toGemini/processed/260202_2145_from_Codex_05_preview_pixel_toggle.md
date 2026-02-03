# Task 05: プレビューのピクセル表示切替トグル（実装）

## 目的
- 入力/出力プレビューの表示を「ピクセル/スムーズ」で切り替え可能にする
- 見た目で成果がわかる軽量実装

## 編集許可
- cs/PomiSystem.Blazor/Pages/Quick.razor
- cs/PomiSystem.Blazor/wwwroot/js/pomi-msx-main.js
- cs/PomiSystem.Blazor/wwwroot/js/pomi-x1.js
- cs/PomiSystem.Blazor/wwwroot/css/app.css

## 実装内容
1) UIトグル追加（Quick.razor）
- 「入力プレビュー: ピクセル/スムーズ」トグル
- 「出力プレビュー: ピクセル/スムーズ」トグル
- 初期値はスムーズ

2) 表示反映
- JS 側で canvas の表示モード切替
- 具体: canvas.style.imageRendering を切替（'pixelated' / 'auto'）
- 変換ロジックには影響を与えない（見た目のみ）

3) CSS調整（必要なら）
- トグル配置の軽微な整列のみ

## 注意
- 既存ロジックのリファクタリング禁止
- データ変換には影響させないこと
- 既定値は「スムーズ」

## 成果報告（必須）
- `communication/toCodex/report/` に報告書を提出
- ファイル名: `260202_21xx_from_Gemini_preview_pixel_toggle_report.md`
- 変更点と簡単な動作確認結果を記載
