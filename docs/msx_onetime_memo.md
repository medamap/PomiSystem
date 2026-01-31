# MSX 現状フロー棚卸し（Blazor Quick）

## UI → C# → JS の主経路

1) 画像選択（InputFile）
- `OnFileSelected` で base64 化 → `PreviewDataUrl` に格納
- `_shouldRenderPreview = true` / `_hasPreview = true`
- 画像読み込み直後に `ConvertMsx()` を即時実行

2) プレビュー描画（OnAfterRenderAsync）
- `_shouldRenderPreview` が立っていれば `pomiMsx.drawPreview(...)`
- 内部は JS の `_draw(...)` でトリム + リサイズしてキャンバス描画

3) 変換実行（ConvertMsx）
- `pomiMsx.drawScreen2(...)` を呼ぶ
- 完了後 `HasOutput = true` / `StatusLabel = 反映済み`
- AutoConvert 時は完了ポップアップ表示

4) 保存
- PNG: `pomiMsx.downloadPng(canvas, filename)`
- SC2: `pomiMsx.downloadSc2(canvas, filename)`（BLOAD形式）

## JS 側の処理概要（pomi-storage.js）

### 1. 寸法計算 `_calculateDimensions`
- 出力サイズモード（msx/msx2/msx4/auto/…/uhd）を解決
- 入出力アスペクト差に応じてクロップ範囲算出
- cropPosition (25–75) を中心位置として使用

### 2. 低解像度プレビュー `_draw`
- `drawImage` でクロップ → リサイズ
- `imageSmoothingEnabled` は preview 用に true
- 出力情報文字列を返す

### 3. 変換処理 `_drawScreen2`
- 1) クロップ＆リサイズ（work canvas）
- 2) 明るさ/コントラスト/彩度の補正
- 3) 16色 TMS9918 パレットへの距離評価
- 4) 8px単位（横8×縦1ライン）で2色決定
- 5) ディザ処理
  - ordered: checker / bayer2 / bayer4
  - error diffusion: floyd / atkinson
  - stripe / stripe_strong は距離バイアス
- 6) キャンバスへ書き戻し
- 7) ラベル生成（出力情報）

### 4. SC2 出力 `downloadSc2`
- キャンバスから256×192のRGBを取得
- タイル単位で pattern / color / name / palette 埋め込み
- BLOAD ヘッダ付き `.sc2` として保存

## メモ
- 変換フローは C# (Quick.razor) → JS (pomi-storage.js) に集約。
- 将来的なモジュール化は `_drawScreen2` 内の「補正 / 減色 / タイル制約 / ディザ」切り出しが第一候補。
