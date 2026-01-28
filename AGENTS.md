# PomiSystem エージェント引き継ぎファイル

## プロジェクト概要

レトロコンピュータ向け画像変換サービス。現代の画像を各システムのハードウェア制約に合わせて変換する Web ベースのツール集。

## 技術スタック

- 純粋な JavaScript (ES6+)、フレームワーク不使用
- HTML5 Canvas API による画像処理
- 各コンバーターは単一の HTML ファイルで自己完結

## ディレクトリ構成

```
PomiSystem/
├── README.md                      # プロジェクト全体の説明 (作成済み)
├── AGENTS.md                      # この引き継ぎファイル
├── LICENSE                        # MIT License
└── sources/
    ├── images/                    # UI素材
    ├── nes-bg-converter/          # ファミコン (README作成済み)
    ├── snes-bg-converter/         # スーパーファミコン (README未作成)
    ├── msx-screen2-converter/     # MSX (README作成済み)
    ├── x1-pcg-converter/          # X1 (README未作成)
    ├── vb-bg-converter/           # Virtual Boy (README未作成)
    └── text-graphics-converter/   # テキストグラフィック (README未作成)
```

## 現在の作業状況

### 完了

- [x] プロジェクト全体の README.md 作成
- [x] sources/nes-bg-converter/README.md 作成
- [x] sources/msx-screen2-converter/README.md 作成
- [x] SSH 認証設定 (git push 可能)

### 残タスク

- [ ] sources/snes-bg-converter/README.md 作成
- [ ] sources/x1-pcg-converter/README.md 作成
- [ ] sources/vb-bg-converter/README.md 作成
- [ ] sources/text-graphics-converter/README.md 作成
- [ ] 作業完了後にコミット & プッシュ

## コーディング規約・スタイルガイド

### ドキュメント作成ルール

- 言語: 日本語
- 口調: 真面目、敬体不要 (である調)
- 絵文字: 使用しない
- フォーマット: Markdown

### README の構成

各コンバーターの README は以下の構成で作成する:

1. タイトルと概要
2. 対応仕様 (解像度、パレット、制約など)
3. 機能一覧 (設定項目の表)
4. 処理フロー
5. 出力形式
6. 使い方
7. 既知の問題 (あれば)
8. 技術詳細

### Git コミットメッセージ

- 日本語で記述
- Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com> を付与

## 各コンバーターの概要

### NES BG Converter (README済)

- 対象: ファミコン / NES
- 解像度: 256x240 (標準)
- 特徴: 魔改造モード (最大32パレット、2048 CHR)

### MSX Screen 2 Converter (README済)

- 対象: MSX1
- 解像度: 256x192
- 特徴: 8x1ライン2色制約、達人モード (輪郭強調)、.scr出力 (要修正)

### SNES BG Converter (README未)

- 対象: スーパーファミコン
- index.html を読んで仕様を確認すること

### X1 PCG Converter (README未)

- 対象: SHARP X1 / X1turbo
- PCG (プログラマブルキャラクタジェネレータ) を使用
- index.html を読んで仕様を確認すること

### VB BG Converter (README未)

- 対象: Nintendo Virtual Boy
- 赤黒4階調
- index.html を読んで仕様を確認すること

### Text Graphics Converter (README未)

- 対象: X1turbo / VGA端末
- ASCII / PCG モード、テキストアート生成
- index.html を読んで仕様を確認すること

## 作業手順

1. `sources/<converter>/index.html` を読んで仕様を把握
2. README.md を作成 (上記構成に従う)
3. 全コンバーター完了後、コミット & プッシュ

## Git 操作

```bash
# リモートは SSH 設定済み
git remote -v
# origin  git@github.com:medamap/PomiSystem.git

# コミット例
git add sources/snes-bg-converter/README.md
git commit -m "SNES BG ConverterのREADMEを追加

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
git push
```

## 注意事項

- MSX の .scr 出力は実機で動作しない (フォーマット修正が必要だが、今は対応不要)
- 各コンバーターの index.html は約1800-2000行、全機能が1ファイルに含まれる
