# Communication Rule

## Purpose

Codex と Gemini の作業分担・依頼・報告のための共通ルール。

## Folder Structure

- communication/
  - toCodex/
  - toGemini/

各配下に以下のサブフォルダを持つ。

- waiting
- proccesing
- processed
- report

## File Naming

- (YYMMDD_HHiiSS)_from_(AgentName)_(Title).md

例:
- 260131_170501_from_Codex_MSXRefactor.md

## Flow

1. 依頼側が `waiting` に新規ファイルを作成。
2. 対応側が作業開始時に `proccesing` へ移動。
3. 作業完了時に `processed` へ移動。
4. 成否にかかわらず結果を `report` に投函。

## Notes

- `toCodex` は Codex 宛、`toGemini` は Gemini 宛。
- Codex は Gemini へ作業を依頼する際に、基本 READONLY 指示や更新対象のファイルを明示する。
- Gemini から Codex への問い合わせは `toCodex/waiting` に入る。
- Codex は `waiting` の確認タイミングを自分で決めてよい。
