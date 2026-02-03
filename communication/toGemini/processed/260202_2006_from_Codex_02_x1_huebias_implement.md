# Task 02: X1 色相重視（肌色改善）をUI + 変換へ組み込み

## 目的
- Quick のUIにトグル追加
- pomi-x1.js に適用
- 状態ログを1行だけ追加

## 編集許可
- cs/PomiSystem.Blazor/Pages/Quick.razor
- cs/PomiSystem.Blazor/wwwroot/js/pomi-x1.js

## 実装詳細
1) Quick.razor:
- 「色相重視（肌色改善）」チェックボックス追加
- 初期値 OFF
- 変換処理に bool を渡す

2) pomi-x1.js:
- 受け取った bool で hueBias を切り替え
- Task01のロジックで距離を補正
- ログ1行追加（pomiLog or console）
  例: `[x1] hueBias=on`

## 注意
- OFF時の出力は完全一致
- 追加は最小限
- 既存関数の大幅な整理は禁止
