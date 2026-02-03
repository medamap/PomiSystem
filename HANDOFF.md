# HANDOFF (2026-02-03)

## 目的

Windows環境からMac環境へ作業移行するための引き継ぎメモ。

## 重要ルール（要約）

- 作業前に必ず作業プラン提示 → 許可取得。
- AGENTS.md はローカル専用で git へ追加しない。
- コミットメッセージは日本語。
- Co-Authored-By はそのコミットに関わったAIのみ付与。

## リポジトリ構成（要点）

- `cs/` : Blazor WASM（現在の主開発）
- `sources/` : 旧HTML単体コンバータ群（維持）
- `docs/` : ドキュメント群（deploy/todo/memo 等）

## デプロイ運用（重要）

- 既定: develop へデプロイ
- staging 指定時: develop + staging
- release 指定時: develop + staging + release
- 手順詳細: `docs/deploy.md`

## 直近の実装/状況

### X1（Quick）

- X1ターゲット追加済み。
- 最小動作（入力 → プレビュー → 変換 → PNG保存）まで実装済み。
- X1は固定8色パレット＋色相重視（HueWeight）対応。
- ディザ: none / bayer2 / bayer4 / floyd / atkinson。
- brightness/contrast/saturation 追加済み。
- X1入力プレビューは canvas で描画（ズーム反映）。
- **X1 自動更新 ON/OFF 実装済み**（OFF時は手動変換のみ反映）。

### MSX

- MSXのSC2出力は実機未対応（仕様修正は後回し）。
- MSX側は自動更新・UIロック・各種挙動は整備済み。

## 重要ファイル（最近触った）

- `cs/PomiSystem.Blazor/Pages/Quick.razor`
  - X1/ MSX UI、各種スライダー、プレビュー、変換。
  - X1のAutoConvertトグル追加。
- `cs/PomiSystem.Blazor/wwwroot/js/pomi-x1.js`
  - X1の変換ロジック（固定8色・ディザ・色相重視・補正）。
- `cs/PomiSystem.Blazor/wwwroot/js/pomi-msx-main.js`
  - MSXの変換ロジック＋共通ズーム制御。
- `cs/PomiSystem.Blazor/wwwroot/css/app.css`
  - スライダー行の横幅固定（レイアウトブレ防止）。

## ToDo / メモ

- `docs/x1_todo.md` : X1移植タスクの進捗と残タスク。
- `docs/todo.md` : 共通タスク（UI/共通化/DDD構想含む）。
- `docs/memo.md` と各種 `*_memo.md` : 作業メモ。

## 直近の未完了・宿題

- X1: PCG生成・タイルリデュース・進捗UIなどは未実装。
- プレビューの「ピクセル表示/スムース表示」切替、
  ドットアスペクト比（1:1 / 1:2）の対応はToDo。
- PNG出力の品質設定（フィルタON/OFF等）もToDo。
- UIの全幅モード（グラフィック作業向け）も後回し。
- DDD方針（プレゼン層とロジック分離、メッセージング化）は
  X1対応の後に本格化。

## 補足

- system_develop / system_staging / system の3環境運用。
- build-info とキャッシュ制御は index.html のJSローダーに統合。
- ルーティングは .htaccess の rewrite で index.html に集約。

---

必要ならこのファイルを更新しながらMac側で継続。
