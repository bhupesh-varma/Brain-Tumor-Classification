const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let currentFile = null;

const displayImage = (file) => {
  const reader = new FileReader();
  reader.onload = function(evt) {
    const img = new Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.classList.remove('hidden');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
};

// Browse file manually
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    currentFile = file;
    displayImage(file);
  } else {
    canvas.classList.add('hidden');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
});

// Click drop area to trigger file input
dropArea.addEventListener('click', () => fileInput.click());

// Drag & Drop
dropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropArea.classList.add('border-indigo-400', 'bg-indigo-950');
});

dropArea.addEventListener('dragleave', () => {
  dropArea.classList.remove('border-indigo-400', 'bg-indigo-950');
});

dropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  dropArea.classList.remove('border-indigo-400', 'bg-indigo-950');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    currentFile = file;
    fileInput.files = e.dataTransfer.files; // sync file input with dropped file
    displayImage(file);
  }
});

// Paste
document.addEventListener('paste', (e) => {
  const items = (e.clipboardData || window.clipboardData).items;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      currentFile = file;
      displayImage(file);
      break;
    }
  }
});

// Handle form submit
const form = document.getElementById('upload-form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentFile) return;
  const formData = new FormData();
  formData.append("file", currentFile);
  const res = await fetch("/predict", {
    method: "POST",
    body: formData
  });
  const data = await res.json();
  document.getElementById('result').innerText =
    `Prediction: ${data.class} (Confidence: ${(data.confidence * 100).toFixed(2)}%)`;
});
