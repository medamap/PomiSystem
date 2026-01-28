# PomiSystem

レトロコンピュータ向け画像変換サービス

## 概要

PomiSystem は、現代の画像をレトロコンピュータのグラフィック形式に変換する Web ベースのツール集です。

各システム固有のハードウェア制約（パレット数、タイル構造、色数制限など）を考慮しながら、可能な限り高品質な変換を行います。

## 対応システム

| コンバーター | 対象システム | 解像度 | 特徴 |
|---|---|---|---|
| NES BG Converter | ファミコン / NES | 256x240 | 最大32パレット、CHRタイル最適化、魔改造モード |
| SNES BG Converter | スーパーファミコン | - | 16bit向け変換 |
| MSX Screen 2 Converter | MSX1 | 256x192 | TMS9918パレット (15色)、エッジ強調 (達人モード) |
| X1 PCG Converter | SHARP X1 / X1turbo | - | PCG (プログラマブルキャラクタジェネレータ) |
| VB BG Converter | Virtual Boy | - | 赤黒4階調 |
| Text Graphics Converter | X1turbo / VGA端末 | 80x25 / 80x30 | ASCII / PCGモード、テキストアート |

## 主な機能

- クライアントサイド処理 (画像はサーバーに送信されない)
- リアルタイムプレビュー
- 多彩なディザリング (チェッカー、Bayer、縦縞など)
- 色調補正 (明度、コントラスト、彩度)
- ドラッグアンドドロップによる画像読み込み
- PNG / クリップボードへの出力

## 将来構想

### 現在のワークフロー

```
[画像] -> [変換] -> [PNG出力]
```

### 目指すワークフロー

```
[画像] -> [変換] -> [ディスクイメージ注入] -> [WASMエミュレータ] -> 即時確認
                |
                +-> [UE5 / Unity用アセット出力] -> 現代ゲーム開発
```

### Phase 1: エミュレータ統合

- WASM エミュレータをブラウザに組み込み
- 変換結果を実機相当の環境で即時確認
- ディスクイメージへの直接書き出し

### Phase 2: 現代ゲームエンジン対応

- Unreal Engine 5 / Unity 向けアセット出力
- パレット制限付きスプライトシート
- タイルマップデータ (JSON / Tiled形式) エクスポート

### Phase 3: オーサリング環境

- 複数画像の一括変換
- プロジェクト管理機能
- カスタムパレット定義

## 技術スタック

- JavaScript (ES6+)
- HTML5 Canvas API
- CSS3

フレームワーク不使用。依存関係なし。ビルド不要。

## 使い方

1. `sources/` 内の各コンバーターフォルダにある `index.html` をブラウザで開く
2. 画像をドラッグアンドドロップ、または「ファイルを選択」で読み込む
3. パラメータを調整する
4. 「Download PNG」または「Copy to Clipboard」で出力する

## ディレクトリ構成

```
PomiSystem/
├── README.md
├── LICENSE
└── sources/
    ├── images/                    # UI素材
    ├── nes-bg-converter/          # ファミコン
    ├── snes-bg-converter/         # スーパーファミコン
    ├── msx-screen2-converter/     # MSX
    ├── x1-pcg-converter/          # X1
    ├── vb-bg-converter/           # Virtual Boy
    └── text-graphics-converter/   # テキストグラフィック
```

## 既知の問題

- MSX .scr 出力: エクスポートされる .scr ファイルは実機で正しく読み込めない (フォーマット修正予定)

## ライセンス

MIT License

## 作者

Medamap
