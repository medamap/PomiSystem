# converter.md

## 目的
cs 配下の MSX SCREEN2 .scr 変換処理の問題点と修正方針を引き継ぐためのメモである。

## 対象
- `cs/PomiSystem.Blazor/wwwroot/js/pomi-storage.js`
  - `downloadScr` 実装

## 問題点（現状）
1. **SCREEN2 VRAM全域ダンプになっていない**
   - `patternData(6144)` と `colorData(6144)` しか出力していない。
   - **ネームテーブル(768B)** が欠落している。
   - `dataSize = 6144 + 6144` のため **12,288B** しか出力されない。
   - その結果、BLOADヘッダの `endAddr` も `0x2FFF` になり、SCREEN2の正しい終端 `0x37FF` になっていない。
2. **BLOADとしての形式が不正**
   - BLOADは `FE + start(2) + end(2) + exec(2)` の7バイトヘッダを持つ。
   - SCREEN2全域ダンプなら `start=0x0000, end=0x37FF, exec=0x0000` が期待値。
   - 現状は `end=0x2FFF` となるため **実機BLOADに不整合**。

## 正しいSCREEN2 VRAM構成（前提）
- `0x0000–0x17FF` : パターンジェネレータ（6144B）
- `0x1800–0x1AFF` : ネームテーブル（768B）
- `0x2000–0x37FF` : カラーテーブル（6144B）
- 合計 **14,336B**

## 修正方針
1. **ネームテーブルを生成して挿入する**
   - 現状 `patternData` は tileIndex 順に生成されているため、
     ネームテーブルは基本的に `0..255` を 3バンク(各256) 分並べる形になる。
   - 具体例:
     - バンク0: `0x00–0xFF` を32x8行分配置
     - バンク1: `0x00–0xFF` を同様に配置
     - バンク2: `0x00–0xFF` を同様に配置
   - ネームテーブルは 32x24=768 バイト。

2. **BLOADヘッダの endAddr を 0x37FF にする**
   - `dataSize = 6144 + 768 + 6144` に修正。
   - `endAddr = startAddr + dataSize - 1` で **0x37FF** となる。

3. **出力順序**
   - `scrFile` は以下の順で格納する:
     1) BLOADヘッダ (7B)
     2) patternData (6144B)
     3) nameTable (768B)
     4) colorData (6144B)

## 参考メモ
- `converted.scr` が 12,295B (12,288 + 7) であり、
  ネームテーブル欠落が原因でBLOADとして読み込めなかった。
- `converted.S02` は 14,343B (14,336 + 7) で、
  BLOADヘッダ付きの正しいSCREEN2全域ダンプと整合する。
- `converted2.scr` も 14,343B であり、パターン/ネーム/カラーの位置は妥当である。

## 該当箇所
- `cs/PomiSystem.Blazor/wwwroot/js/pomi-storage.js`
  - `downloadScr` 内の `dataSize` と `scrFile` 構築部分

