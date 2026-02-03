# Task 12: ピクセル表示設定の保存 設計

## 目的
- MSX/X1 のピクセル表示トグル状態を localStorage に保存・復元

## 保存対象
- MsxInputPixelated
- MsxOutputPixelated
- X1InputPixelated
- X1OutputPixelated

## 仕様案
- キー例:
  - quickMsxInputPixelated
  - quickMsxOutputPixelated
  - quickX1InputPixelated
  - quickX1OutputPixelated
- 初期化時に localStorage から復元
- トグル変更時に保存

## 禁止
- 大規模なリファクタリング
