const fileInput = document.getElementById("audioFile");
const sendTextBtn = document.getElementById("sendTextBtn");
const downloadBtn = document.getElementById("downloadBtn");
const textInput = document.getElementById("textInput");

let audioBlob = null;

const wavesurfer = WaveSurfer.create({
    container: '#wave',
    waveColor: 'violet',
    progressColor: 'purple',
    height: 80,
    responsive: true,
    cursorColor: 'white',
    cursorWidth: 2,        // سمكه
    backend: 'WebAudio',
    normalize: true,
    responsive: true,
    
});

wavesurfer.empty();

// ⬆⬆⬆ the api of tts ⬇⬇⬇

// ⬅ زرار إرسال النص للسيرفر
sendTextBtn.addEventListener("click", () => {
    console.log("SEND BUTTON CLICKED!");

    // 1. ناخد النص من التاج
    const text = textInput.value.trim();
    if (!text) return alert("Text area is empty!");

    // 1️⃣ Hide button & show loader
    sendTextBtn.style.display = "none";
    loader.style.display = "block";

    // 2. We send the text to Flask
    fetch('/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    })

    // 3. نستقبل الصوت كـ Blob
    .then(res => res.blob())
    
    // 4. بعد ما نستلم الصوت، نحوله لرابط مؤقت
    .then(blob => {
        
        // نخزن البلوب لو محتاج تستخدمه تاني
        audioBlob = blob;
        
        // 5. نحول الـ Blob لرابط علشان نحطه جوه WaveSurfer
        const audioURL = URL.createObjectURL(blob);
        
        // 6. نحمل الصوت جوه WaveSurfer
        wavesurfer.load(audioURL);
        
        console.log("Audio loaded into WaveSurfer.");
    })
    
    // 7. لو حصل أي error
    .catch(err => console.error("Error:", err))
    .finally(() => {
        // 2️⃣ Restore button & hide loader بعد ما التحميل يخلص
        sendTextBtn.style.display = "block";
        loader.style.display = "none";
    });
});

// playpause button

const icon = document.getElementById('icon-playPause');

wavesurfer.on('play', () => {
  icon.innerHTML = `
    <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
    <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
  `;
});

wavesurfer.on('pause', () => {
  icon.innerHTML = `
    <polygon points="8,5 19,12 8,19" fill="currentColor"/>
  `;
});

const playPauseBtn = document.getElementById('playPause');
   playPauseBtn.addEventListener('click', () => {
        wavesurfer.playPause(); 
        
    });


// ⬅ Download audio file button
downloadBtn.addEventListener("click", () => {
    if (!audioBlob) return alert("No audio to download!");

    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audio.wav";
    a.click();
});

// upload txt file
document.getElementById('fileInput').addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        textInput.value = e.target.result;
    };
    reader.readAsText(file);
});
