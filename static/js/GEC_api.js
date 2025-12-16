const inputText = document.getElementById("inputText");
const fileInput = document.getElementById("fileInput");
const processBtn = document.getElementById("processBtn");
const resultBox = document.getElementById("result-box");
const actions = document.getElementById("actions");
const loaderWrapper = document.getElementById("loaderWrapper");


// Show process button when text or file exists
function checkShowButton() {
if (inputText.value.trim() !== "") processBtn.style.display = "block";
else processBtn.style.display = "none"
}


inputText.addEventListener("input", checkShowButton);


// Read TXT file
fileInput.addEventListener("change", function () {
const file = this.files[0];
if (!file) return;


const reader = new FileReader();
reader.onload = function (e) {
inputText.value = e.target.result;
processBtn.style.display = "block";
};
reader.readAsText(file);
});


// Process button logic (send to server)
processBtn.addEventListener("click", async function () {
const text = inputText.value.trim();
if (!text) return alert("Please enter your text first")

showLoader()
actions.style.display = "none";
resultBox.style.display = "none";

// Example: send to server
let res = await fetch("/GEC", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ text })
});
let data = await res.json();
resultBox.textContent = data.result;
actions.style.display = "flex";
resultBox.style.display = "block";
hideLoader()

});


// Download TXT
function downloadTxt() {
const text = resultBox.textContent;
const blob = new Blob([text], { type: "text/plain" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "result.txt";
a.click();
}


// Copy text
function copyText() {
navigator.clipboard.writeText(resultBox.textContent);
document.getElementById("copy").textContent = "copied";
}

// loader wrapper 
function showLoader() {
  loaderWrapper.style.display = "flex";
  loaderWrapper.setAttribute("aria-hidden", "false");
  if (processBtn) processBtn.disabled = true;
}
function hideLoader() {
  loaderWrapper.style.display = "none";
  loaderWrapper.setAttribute("aria-hidden", "true");
  if (processBtn) processBtn.disabled = false;
}