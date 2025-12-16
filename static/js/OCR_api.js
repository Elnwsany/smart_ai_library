const dropArea = document.getElementById("dropArea");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const gallery = document.getElementById("gallery");
const bottomActions = document.getElementById("bottomActions");
const ocrResults = document.getElementById("ocrResults");


let uploadedImages = [];

uploadBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));

dropArea.addEventListener("dragover", (e) => {
e.preventDefault();
dropArea.style.background = "#e9e9e9";
});


dropArea.addEventListener("dragleave", () => {
dropArea.style.background = "#fff";
});


dropArea.addEventListener("drop", (e) => {
e.preventDefault();
dropArea.style.background = "#fff";
handleFile(e.dataTransfer.files[0]);
});


function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) return;

  uploadedImages.push(file); // حفظ الصورة الحقيقية

  const reader = new FileReader();
  reader.onload = () => addThumbnail(reader.result);

  reader.readAsDataURL(file);
  fileInput.value = "";
}



function addThumbnail(src) {
  const index = uploadedImages.length - 1;

  const thumb = document.createElement("div");
  thumb.className = "thumb";

  thumb.innerHTML = `
    <img src="${src}" />
    <button class="remove-btn">X</button>
  `;

  thumb.querySelector(".remove-btn").addEventListener("click", () => {
    uploadedImages.splice(index, 1); // حذف الصورة من الأراي
    thumb.remove();
    if (gallery.children.length === 0){
      bottomActions.style.display = "none";
      gallery.style.display = "none";
    } 
  });

  gallery.appendChild(thumb);
  gallery.style.display = "flex";
  bottomActions.style.display = "block";
}



bottomActions.addEventListener("click", (e) => {
  if (e.target.id === "processBtn") {
    console.log("Button clicked!");
    if (!uploadedImages.length) {
        alert("Please upload at least one image before processing!");
        return; // يمنع الاستمرار لو مفيش صور
     }
    const formData = new FormData();

  uploadedImages.forEach((file) => {
    formData.append("images", file);
  });
  document.getElementById("loader").style.display = "block";
    animateLoader();
  fetch("/ocr", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    console.log("Success:", data);
    document.getElementById("loader").style.display = "none";
    stopLoader();

    ocrResults.innerHTML = "";

    // التحكم في ظهور العنصر حسب النتائج
    if (!data.results.length) {
        ocrResults.style.display = "none";
    } else {
        ocrResults.style.display = "flex"; // أو "block" حسب CSS
    }

      data.results.forEach(fileResult => {
        const fullText = fileResult.text.join("\n"); // ← الحل الأساسي
        const resultDiv = document.createElement("div");
        resultDiv.className = "ocr-result-block";
        resultDiv.style.border = "1px solid #ccc";
        resultDiv.style.width = "100%";
        resultDiv.style.padding = "10px";
        resultDiv.style.margin = "5px 0";

        const title = document.createElement("strong");
        title.textContent = fileResult.filename;
        resultDiv.appendChild(title);

        fileResult.text.forEach(text => {
          const p = document.createElement("p");
          p.textContent = text;
          p.style.fontSize = "12px";
          p.style.margin = "2px 0";
          resultDiv.appendChild(p);
        });

        const copyBtn = document.createElement("button");
        copyBtn.textContent = "Copy";
        copyBtn.style.marginRight = "10px";
        copyBtn.style.fontSize = "12px";
        copyBtn.style.padding = "4px 8px";
        copyBtn.style.cursor = "pointer";

        copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(fullText)
                .then(() => copyBtn.textContent = "copied")
                .catch(() => alert("Failed to copy"));
        });

        const downloadBtn = document.createElement("button");
        downloadBtn.textContent = "Download";
        downloadBtn.style.fontSize = "12px";
        downloadBtn.style.padding = "4px 8px";
        downloadBtn.style.cursor = "pointer";

        downloadBtn.addEventListener("click", () => {
            const blob = new Blob([fullText], { type: "text/plain" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = fileResult.filename.replace(/\.[^/.]+$/, "") + ".txt";
            a.click();

            URL.revokeObjectURL(url);
        });

        const btnBox = document.createElement("div");
        btnBox.style.marginTop = "8px";
        btnBox.appendChild(copyBtn);
        btnBox.appendChild(downloadBtn);

        resultDiv.appendChild(btnBox);

        ocrResults.appendChild(resultDiv);
      });
    })
    .catch(err => console.error(err));
}
});

let loadInterval;

function animateLoader() {
  const fill = document.getElementById("loaderFill");
  let width = 0;

  loadInterval = setInterval(() => {
    width += Math.random() * 10; // يزيد تدريجيًا
    if (width >= 95) width = 95;
    fill.style.width = width + "%";
  }, 300);
}

function stopLoader() {
  const fill = document.getElementById("loaderFill");
  clearInterval(loadInterval);
  fill.style.width = "100%";
  setTimeout(() => {
    fill.style.width = "0%";
  }, 500);
}
