// audioMerger.js

/**
 * 2つの音声ファイルを結合し、2つ目の音声開始時にベル音を挿入する
 * @param {string} audio1Path - 1つ目の音声ファイルのパス
 * @param {string} audio2Path - 2つ目の音声ファイルのパス
 * @param {string} bellPath - ベル音ファイルのパス
 * @param {number} [bellGain=0.5] - ベル音の音量（0.0〜1.0）
 * @returns {Promise<string>} 結合された音声ファイルのURL
 */
async function mergeAudioWithBell(audio1Path, audio2Path, bellPath, bellGain = 0.5) {
    const audioContext = new AudioContext();
    
    // オーディオファイルを読み込む関数
    async function loadAudio(url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await audioContext.decodeAudioData(arrayBuffer);
    }

    try {
        // 3つのオーディオファイルを読み込む
        const [buffer1, buffer2, bellBuffer] = await Promise.all([
            loadAudio(audio1Path),
            loadAudio(audio2Path),
            loadAudio(bellPath)
        ]);

        // 新しいバッファを作成（ステレオ用に2チャンネル）
        const numberOfChannels = 2;
        const mergedBuffer = audioContext.createBuffer(
            numberOfChannels,
            buffer1.length + buffer2.length,
            audioContext.sampleRate
        );

        // 各チャンネルのデータを結合
        for (let channel = 0; channel < numberOfChannels; channel++) {
            const mergedChannelData = mergedBuffer.getChannelData(channel);
            const bell1Data = bellBuffer.getChannelData(Math.min(channel, bellBuffer.numberOfChannels - 1));
            
            // 最初の音声データをコピー
            mergedChannelData.set(buffer1.getChannelData(channel), 0);
            
            // 2つ目の音声が始まる位置にベル音をミックス
            for (let i = 0; i < bellBuffer.length; i++) {
                if (i + buffer1.length < mergedBuffer.length) {
                    mergedChannelData[i + buffer1.length] = bell1Data[i] * bellGain;
                }
            }
            
            // 2つ目の音声データをミックス
            const buffer2Data = buffer2.getChannelData(channel);
            for (let i = 0; i < buffer2.length; i++) {
                if (i + buffer1.length < mergedBuffer.length) {
                    mergedChannelData[i + buffer1.length] += buffer2Data[i];
                    // クリッピングを防ぐために値を制限
                    mergedChannelData[i + buffer1.length] = Math.max(-1, Math.min(1, mergedChannelData[i + buffer1.length]));
                }
            }
        }

        // 結合したバッファをBlobに変換
        const wavBlob = await audioBufferToWav(mergedBuffer);
        return URL.createObjectURL(wavBlob);

    } catch (error) {
        console.error('Error merging audio files:', error);
        throw error;
    }
}

/**
 * AudioBuffer から WAV形式のBlobを生成する
 * @param {AudioBuffer} buffer - 変換するAudioBuffer
 * @returns {Blob} WAV形式のBlob
 */
function audioBufferToWav(buffer) {
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numberOfChannels * 2;
    const outputBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(outputBuffer);

    // WAVヘッダーの書き込み
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, length, true);

    // オーディオデータの書き込み
    const offset = 44;
    for (let i = 0; i < buffer.length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
            view.setInt16(offset + (i * numberOfChannels + channel) * 2, sample * 0x7FFF, true);
        }
    }

    return new Blob([outputBuffer], { type: 'audio/wav' });
}

/**
 * DataViewに文字列を書き込む
 * @param {DataView} view - 書き込み先のDataView
 * @param {number} offset - 書き込み開始位置
 * @param {string} string - 書き込む文字列
 */
function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}