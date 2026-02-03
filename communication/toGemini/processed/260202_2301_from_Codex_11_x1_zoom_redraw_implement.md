# Task 11: X1入力プレビューのズーム再描画 実装

## 目的
- 画像更新後に X1 入力プレビューのズームを再適用し、はみ出しを抑制

## 編集許可
- cs/PomiSystem.Blazor/Pages/Quick.razor
- cs/PomiSystem.Blazor/wwwroot/js/pomi-x1.js（必要なら）

## 実装内容（最小）
1) X1入力プレビュー描画直後に ApplyX1InputZoom を再実行
2) canvas size 変更がある場合のみ再適用でも可

## 注意
- 既存の変換処理/描画処理の挙動は変えない
- 最小限の追加にとどめる

## 成果報告（必須）
- `communication/toCodex/report/` に報告書を提出
- ファイル名: `260202_23xx_from_Gemini_x1_zoom_redraw_report.md`
- 変更点と簡単な動作確認結果を記載
