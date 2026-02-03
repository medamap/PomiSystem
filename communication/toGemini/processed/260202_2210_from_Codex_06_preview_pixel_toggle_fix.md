# Task 06: ピクセル表示の保持（不具合修正）

## 目的
- リサイズ時にピクセル表示が解除される問題を修正

## 編集許可
- cs/PomiSystem.Blazor/wwwroot/js/pomi-msx-main.js
- cs/PomiSystem.Blazor/Pages/Quick.razor（必要なら）

## 修正内容
1) window resize 時に isPixelated を維持する
- _zoomState に isPixelated を保存
- _ensureZoomListener 内で updateInputZoom / updateOutputZoom / updatePreviewZoom を isPixelated 付きで呼ぶ

2) X1 入力プレビューもピクセル表示を保持
- updatePreviewZoom の isPixelated を _zoomState から復元

3) （任意）UIの一貫性
- X1側トグルにも disabled="@IsUiLocked" を付ける（MSXと挙動統一）

## 注意
- 既存ロジックの整理やリファクタリングは禁止
- 変更は最小限

## 成果報告（必須）
- `communication/toCodex/report/` に報告書を提出
- ファイル名: `260202_21xx_from_Gemini_preview_pixel_toggle_fix_report.md`
- 変更点と簡単な動作確認結果を記載
