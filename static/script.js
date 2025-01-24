const videoDir = 'static/video/';
const audioDir = 'static/audio/';
const textDir = 'static/text/';


// Generate Interactive Demo Videos
$(document).ready(function() {
    const videoFiles = [
        ["ya-2.mp4", "oh-3.mp4"],
        ["ze-1.mp4", "ya-1.mp4"],
        ["sa-1.mp4", "ze-3.mp4"],
    ];
    videoFiles.forEach(([file1, file2]) => {
        const videoElement = `
            <div class="row mb-4">
                <div class="col-12 col-md-6 mb-4 mb-md-0">
                    <div class="ratio ratio-8x5">
                        <video class="object-fit-contain" controls>
                            <source src="${videoDir + file1}" type="video/mp4">
                            Your browser does not support HTML video.
                        </video>
                    </div>
                </div>
                <div class="col-12 col-md-6">
                    <div class="ratio ratio-8x5">
                        <video class="object-fit-contain" controls>
                            <source src="${videoDir + file2}" type="video/mp4">
                            Your browser does not support HTML video.
                        </video>
                    </div>
                </div>
            </div>
        `;
        $('#demo-video-container').append(videoElement);
    });
});


// Generate Dialogue Continuation Table
$(document).ready(function() {
    const columns = {
        'Prompt': [],
        'Generation': ['Re-synthesis', 'dGSLM', 'J-Moshi', 'J-Moshi-ext'],
    };
    const promptFiles = [
        'prompt-323.wav',
        'prompt-440.wav',
        'prompt-159.wav',
        'prompt-62.wav',
        'prompt-406.wav',
    ];
    const generationFiles = [
        ['resynth-323.wav', 'dgslm-323.wav', 'jmoshi-323.wav', 'jmoshi-ext-323.wav'],
        ['resynth-440.wav', 'dgslm-440.wav', 'jmoshi-440.wav', 'jmoshi-ext-440.wav'],
        ['resynth-159.wav', 'dgslm-159.wav', 'jmoshi-159.wav', 'jmoshi-ext-159.wav'],
        ['resynth-62.wav',  'dgslm-62.wav',  'jmoshi-62.wav',  'jmoshi-ext-62.wav'],
        ['resynth-406.wav', 'dgslm-406.wav', 'jmoshi-406.wav', 'jmoshi-ext-406.wav'],
    ];
    const table = $('#continuation-table')

    // Add header
    // first header: Prompt (colspan=1, rowspan=2) + Generation (colspan=4, rowspan=1)
    // second header: Re-synthesis + dGSLM + J-Moshi + J-Moshi-ext
    const thead = $('<thead>');
    const headerRow1 = $('<tr>');
    headerRow1.append($('<th>', { colspan: 1, rowspan: 2 }).text('Prompt'));
    headerRow1.append($('<th>', { colspan: 4 }).text('Generation'));
    thead.append(headerRow1);
    const headerRow2 = $('<tr>');
    columns['Generation'].forEach(header => {
        headerRow2.append($('<th>').text(header));
    });
    thead.append(headerRow2);
    table.append(thead);

    // Add rows
    const tbody = $('<tbody>');
    promptFiles.forEach((prompt, i) => {
        const row = $('<tr>');
        const promptCell = $('<td>');
        const promptAudio = $('<audio controls>').append(
            $('<source>', { src: audioDir + prompt, type: 'audio/wav' })
        );
        promptCell.append(promptAudio);
        row.append(promptCell);
        generationFiles[i].forEach((generation, j) => {
            const cell = $('<td>');
            const audio = $(`<audio id="audio-${i}-${j}" controls>`)
            cell.append(audio);
            row.append(cell);
        });
        tbody.append(row);
    });
    table.append(tbody);
    promptFiles.forEach((prompt, i) => {
        generationFiles[i].forEach((generation, j) => {
            mergeAudioWithBell(
                audioDir + prompt, audioDir + generation, audioDir + "bell.mp3", 0.1
            ).then(audioURL => {
                $(`#audio-${i}-${j}`).append($('<source>', { src: audioURL, type: 'audio/wav' }));
            });
        });
    });
});


// Generate Multi-stream TTS Table
// Text data loader
function loadTextData(filename) {
    return new Promise((resolve, reject) => {
        $.get(textDir + filename, data => {
            resolve(data);
        });
    });
};

$(document).ready(function() {
    const columns = ['Text', 'Synthesized Audio'];
    const files = [
        ['daily-1-0679.txt', 'daily-1-0679.wav'],
        ['daily-1-0823.txt', 'daily-1-0823.wav'],
        ['daily-4-0373.txt', 'daily-4-0373.wav'],
        ['daily-5-0276.txt', 'daily-5-0276.wav'],
        ['daily-5-0726.txt', 'daily-5-0726.wav'],
    ];
    const table = $('#mstts-table');

    // Add header
    const thead = $('<thead>');
    const headerRow = $('<tr>');
    columns.forEach(header => {
        headerRow.append($('<th>').text(header));
    });
    thead.append(headerRow);
    table.append(thead);

    // Add rows
    const tbody = $('<tbody>');
    files.forEach((file, i) => {
        const row = $('<tr>');
        // Add text cell ("text-align: left;min-width: 200px;")
        const textCell = $('<td>').css('text-align', 'left');//.css('min-width', '100px');
        const textPromise = loadTextData(file[0]);
        textPromise.then(text => {
            textCell.text(text);
        });
        row.append(textCell);
        // Add waveform cell
        const waveCell = $('<td>');//.css('min-width', '200px');
        const waveform = $('<div>').attr('id', `waveform-${i}`);
        waveCell.append(waveform);
        const playPauseButton = `
            <button class="btn btn-secondary" data-action="play" id="play-pause-${i}">
                <i class="bi bi-play-fill"></i> Play / <i class="bi bi-pause-fill"></i> Pause
            </button>
        `;
        waveCell.append(playPauseButton);
        row.append(waveCell);
        tbody.append(row);
    });
    table.append(tbody);

    // Create wavesurfer instances
    files.forEach((file, i) => {
        const wavesurfer = WaveSurfer.create({
            container: `#waveform-${i}`,
            url: audioDir + file[1],
            splitChannels: [
                {
                    waveColor: '#2E7D9E',
                    progressColor: '#173E4E',
                },
                {
                    waveColor: '#E57872',
                    progressColor: '#2A0908',
                }
            ],
            barWidth: 2,
            height: 55,
            width: 500,
        });
        $(`#play-pause-${i}`).click(() => {
            wavesurfer.playPause();
        });
    });
});
