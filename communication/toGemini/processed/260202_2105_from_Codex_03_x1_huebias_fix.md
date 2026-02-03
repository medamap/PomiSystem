# Task 03: X1 色相重視ロジックを仕様へ合わせる（不具合修正）

## 目的
- 仕様からのズレを修正し、挙動を明確化する

## 編集許可
- cs/PomiSystem.Blazor/wwwroot/js/pomi-x1.js

## 修正内容
1) targetHue を 30 に統一（設計仕様）
2) 補正係数はソースピクセルのみで算出
   - パレット側の hue を使った補正は削除
   - k = 1 - (w * 0.35 * amountFactor)
   - score = baseDist * k

## 注意
- 既存機能の整理やリファクタリングは禁止
- 変更は最小限
- OFF時の出力は完全一致を維持

## 成果報告（必須）
- 成否にかかわらず `communication/toCodex/report/` に報告書を提出
- ファイル名: `260202_21xx_from_Gemini_x1_huebias_fix_report.md`
- 変更点と簡単な動作確認結果を記載
