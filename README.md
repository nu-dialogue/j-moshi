# J-Moshi: A Japanese Full-duplex Spoken Dialogue System

[![Paper](https://img.shields.io/badge/Paper-To_Appear-lightgrey.svg)]()
[![Model](https://img.shields.io/badge/🤗_Hugging_Face-Model-ffcc66.svg)](https://huggingface.co/nu-dialogue/j-moshi-ext)
[![Demo](https://img.shields.io/badge/GitHub_Pages-Demo-green.svg)](https://nu-dialogue.github.io/j-moshi)
[![License](https://img.shields.io/badge/License-CC_BY--NC_4.0-blue)](LICENSE)

J-Moshiは，日本語におけるfull-duplex音声対話システムです．英語における7Bパラメータのfull-duplex音声対話モデル [Moshi](https://arxiv.org/abs/2410.00037) をベースとし，日本語音声対話データでの追加学習によって構築されました．発話のオーバーラップや相槌など，人間同士の対話におけるような自然なターンテイキングをリアルタイムに実現します．

このリポジトリでは，J-Moshiの学習済みモデル，およびモデルとの対話方法を提供します．なお，J-Moshiが生成した音声のサンプルは[こちら](https://nu-dialogue.github.io/j-moshi)からご覧いただけます．

> [!NOTE]
> J-Moshiは試作段階であり，その応答は不自然な場合があります．また，J-Moshiの学習データの大部分は雑談対話であるため，ユーザの指示に従った応答を生成することはできません．


## Models
以下の2種類のJ-Moshiが公開されています:
- [nu-dialogue/j-moshi](https://huggingface.co/nu-dialogue/j-moshi)
    - [kyutai/moshika-pytorch-bf16](https://huggingface.co/kyutai/moshika-pytorch-bf16)をベースとし，大規模な日本語音声対話データによって学習されたモデル
- [nu-dialogue/j-moshi-ext](https://huggingface.co/nu-dialogue/j-moshi-ext)
    - [kyutai/moshika-pytorch-bf16](https://huggingface.co/kyutai/moshika-pytorch-bf16)をベースとし，大規模な日本語音声対話データおよび，Multi-stream TTSを用いて合成された拡張データによって学習されたモデル

また各リポジトリには，以下の3つのモデルファイルが含まれています:
- `model.safetensors`
    - J-Moshi本体の重み．
- `tokenizer_spm_32k_3.model`
    - テキストトークナイザ．[rinna/japanese-gpt2-medium](https://huggingface.co/rinna/japanese-gpt2-medium)の日本語SentencePieceモデル．
- `tokenizer-e351c8d8-checkpoint125.safetensors`
    - 音声トークナイザ．[kyutai/moshika-pytorch-bf16](https://huggingface.co/kyutai/moshika-pytorch-bf16)のMimiモデル．


## Interactive Demo
Kyutai公式の[MoshiのPyTorch実装](https://github.com/kyutai-labs/moshi/tree/main/moshi)を用いて，J-Moshiと対話することができます．実装の詳細は，オリジナルMoshiのリポジトリ [kyutai-labs/moshi](https://github.com/kyutai-labs/moshi) を参照してください．

### Installation
Python 3.10以上が必要です．

```bash
pip install moshi
```

### Usage
`moshi.server`を実行することで，対話用のweb UIを起動できます．`--hf-repo`オプションでJ-Moshiの 🤗HuggingFace Hubリポジトリ（[nu-dialogue/j-moshi](https://huggingface.co/nu-dialogue/j-moshi), [nu-dialogue/j-moshi-ext](https://huggingface.co/nu-dialogue/j-moshi-ext)）を指定してください．

```bash
python -m moshi.server --hf-repo nu-dialogue/j-moshi-ext
```

### Tips
- 実行には，24GB以上のVRAMを搭載したLinux GPUマシンが必要です．MacOSには対応していません．
- モデルの発話音声がエコーすることを避けるため，対話時にはスピーカではなくイヤホン・ヘッドホンを使用してください．音声デバイスはweb UIアクセス時にブラウザ上で設定できます．

## Training Details
J-Moshiの学習では，以下の音声対話コーパスを使用しました．また，これらデータに加え，J-Moshi-extの学習では，テキスト対話コーパスから音声合成された拡張データも使用しました．使用したコーパスは以下の通りです:
- 音声対話コーパス
    - [J-CHAT](https://arxiv.org/abs/2407.15828)
    - [日本語Callhome](https://catalog.ldc.upenn.edu/LDC96S37)
    - [CSJ](https://www.isca-archive.org/sspr_2003/maekawa03_sspr.html#)
    - [旅行代理店対話コーパス](https://dl.acm.org/doi/10.1145/3675166)
    - 雑談対話コーパス（内製）
    - 相談対話コーパス（内製）
- テキスト対話コーパス
    - [日本語PersonaChat](https://arxiv.org/abs/2109.05217)
    - [日本語EmpatheticDialogues](https://arxiv.org/abs/2109.05217)
    - [日本語日常対話コーパス](https://www.anlp.jp/proceedings/annual_meeting/2023/pdf_dir/H1-1.pdf)
    - [RealPersonaChat](https://aclanthology.org/2023.paclic-1.85/)

学習では，128基のNVIDIA V100 32GB GPUを使用しました．


## Terms of Use
J-Moshiは[CC BY-NC 4.0](LICENSE)の下で公開されており，研究目的での利用を想定しています．本モデルは，なりすましや詐欺など，いかなる悪意ある目的での使用も意図していません．また，本モデルの出力には，学習データに起因するバイアスや不正確もしくは攻撃的な情報が含まれる可能性があります．我々はその使用によって生じるいかなる損害についても責任を負いません．


## Acknowledgments
本研究は，JSTムーンショット型研究開発事業，JPMJMS2011の支援を受けました．雑談対話コーパスおよび相談対話コーパスは，株式会社アイシンとの共同研究において構築しました．また本研究では，名古屋大学のスーパーコンピュータ「不老」を利用しました．最後に，Moshi のテクニカルペーパーおよびモデルを公開していただいた Kyutai Labs に感謝いたします．

<a href="https://avatar-ss.org"><img src="static/image/moonshot_logo.svg" width="200"></a>

## Citation
```bibtex
@inproceedings{ohashi2025jmoshi,
  title = "日本語 {F}ull-duplex 音声対話システムの試作",
  author = "大橋 厚元 and 飯塚 慎也 and 姜 菁菁 and 東中竜一郎",
  booktitle = "言語処理学会 第31回年次大会 発表論文集",
  pages = "",
  year = "2025",
  url = ""
}
```
