# Task 13: ピクセル表示設定の保存 実装

## 目的
- MSX/X1 のピクセル表示トグル状態を保存/復元する

## 編集許可
- cs/PomiSystem.Blazor/Pages/Quick.razor

## 実装内容
1) OnInitializedAsync で localStorage から各トグルを復元
2) トグル変更時に localStorage へ保存
3) 保存時に Apply*Zoom で即反映

## 注意
- 既存ロジックの整理は禁止
- 追加は最小限

## 成果報告（必須）
- `communication/toCodex/report/` に報告書を提出
- ファイル名: `260202_23xx_from_Gemini_pixel_toggle_persist_report.md`
- 変更点と簡単な動作確認結果を記載
