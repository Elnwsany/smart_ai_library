let mediaRecorder;               
let audioChunks = [];   
let controller = null;         

const startBtn = document.getElementById("startBtn");
const stopBtn  = document.getElementById("stopBtn");  
const status   = document.getElementById("status");   
const textarea   = document.getElementById("textarea");  

let isUploading = false;

startBtn.onclick = async () => {
  if (isUploading) return; // لو فيه Request شغال، تجاهل الضغط
  isUploading = true;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    startMicFeedback(stream);

    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

    mediaRecorder.onstop = async () => {
      stopMicFeedback();
      const blob = new Blob(audioChunks, { type: "audio/wav" });
      stream.getTracks().forEach(track => track.stop());

      status.innerText = "Uploading...";

      try {
        const formData = new FormData();
        formData.append("file", blob, "recording.wav");

        const response = await fetch("/stt", { method: "POST", body: formData });
        const data = await response.json();
        textarea.innerText = data.text;

        status.innerText = "✅ Uploaded successfully!";
      } catch (err) {
        console.error(err);
        status.innerText = "❌ Upload failed!";
      } finally {
        isUploading = false; // رجع flag بعد الانتهاء
        setTimeout(() => status.innerText = "", 3000);
      }
    };

    mediaRecorder.start();
    stopBtn.style.display = "flex";
    startBtn.style.display = "none";
    status.innerText = "Recording...";

  } catch (err) {
    alert("Microphone access denied!");
    console.error(err);
    isUploading = false; // رجع flag لو حصل خطأ قبل upload
  }
};


stopBtn.onclick = () => {
  mediaRecorder.stop();

  // 🔵 هنا العكس:
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';
    
  status.innerText = "Stopped.";
};

// upload file
const uploadBtn = document.getElementById("uploadBtn");

uploadBtn.addEventListener("click", async (e) => {
    //Dynamically create an input file
    status.style.display ="block"
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*';
    
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // كود الرفع هنا
        const formData = new FormData();
        const newFile = new File([file], "recording.wav", {
            type: file.type,
            lastModified: file.lastModified
        });

        formData.append("file", newFile); 
        
        status.innerText = "Uploading..."; // (14) نغيّر حالة الواجهة
        try {
            const response = await fetch("http://127.0.0.1:5000/stt", {
                method: "POST",
                body: formData
            });
            status.innerText = "✅ Uploaded successfully!"; // (16) نعرض رسالة نجاح
            const data = await response.json();
            textarea.innerText = data.text;
            setTimeout(() => {
                 status.innerText = ""; 
            }, 3000);

        } catch (error) {
            alert("Error uploading: " + error);
        }
    };
    
    fileInput.click(); // فتح نافذة اختيار الملف
});


// Voice Input Feedback Animation
let audioContext;
let analyser;
let dataArray;
let rafId;
const SILENCE_THRESHOLD = 0.02; // شدة الصوت الدنيا
const SILENCE_DURATION = 3000;  // 3 ثواني بدون صوت → stop
let silenceStart = null; // وقت بداية الصمت
let hasHeardSound = false; // علم إذا ظهر أي صوت من البداية


function startMicFeedback(stream) {
  audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;

  dataArray = new Uint8Array(analyser.fftSize);
  source.connect(analyser);

  function animate() {
    rafId = requestAnimationFrame(animate);

    analyser.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const v = (dataArray[i] - 128) / 128;
      sum += v * v;
    }

    const volume = Math.sqrt(sum / dataArray.length);

    const scale = 1 + volume * 0.8;

    stopBtn.style.transform = `scale(${scale})`;
    stopBtn.style.boxShadow = `0 0 ${volume * 30}px rgba(66,133,244,0.6)`;

    if (volume < SILENCE_THRESHOLD) {
      if (!silenceStart) silenceStart = Date.now();
      else if (Date.now() - silenceStart > SILENCE_DURATION) {
        if (mediaRecorder && mediaRecorder.state === "recording") {
          mediaRecorder.stop(); // توقف التسجيل تلقائي
        }
        silenceStart = null;
        startBtn.style.display = 'block';
        stopBtn.style.display = 'none';
        showToast("Recording stopped due to silence!", 3000);
        if (!hasHeardSound) {
          showToast("No sound detected! Please check your microphone.", 4000);
          status.style.display ="none"
    }
        
      }
    } else {
      status.style.display ="block"
      silenceStart = null;
      hasHeardSound = true; // تأكدنا إن فيه صوت فعلياً
    }

  }

  animate();
}

function stopMicFeedback() {
  cancelAnimationFrame(rafId);
  stopBtn.style.transform = "scale(1)";
  stopBtn.style.boxShadow = "none";

  if (audioContext && audioContext.state !== "closed") {
    audioContext.close();
  }
}
// Snackbar
function showToast(message, duration = 3000) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}
