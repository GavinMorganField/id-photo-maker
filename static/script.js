document.addEventListener("DOMContentLoaded", () => {
  const style = document.createElement("style")
  style.innerHTML = `
    .progress-indeterminate {
      background-image: linear-gradient(90deg, #4ade80 0%, #86efac 50%, #4ade80 100%);
      background-size: 200% 100%;
      animation: progress-animation 1.5s linear infinite;
    }
    @keyframes progress-animation {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `
  document.head.appendChild(style)
  document.getElementById("white").checked = true
  document.getElementById("size1").checked = true
})
const colorContainer = document.getElementById("colorOptions")
const sizeContainer = document.getElementById("sizeOptions")
const fileInput = document.getElementById("fileInput")
const uploadArea = document.querySelector(".upload-area")
const uploadButton = document.getElementById("uploadBtn")
const resultContainer = document.getElementById("resultContainer") 
const resultImage = document.getElementById("resultImage")
const downloadBtn = document.getElementById("downloadBtn")
const initialUploadAreaHTML = uploadArea.innerHTML
const colorOptions = [
  { id: "white", value: "white", label: "白色", preview: "#FFFFFF" },
  { id: "red", value: "red", label: "红色", preview: "#EF4444" },
  { id: "blue", value: "blue", label: "蓝色", preview: "#3B82F6" },
  { id: "custom", value: "custom", label: "自定义颜色", preview: null },
]
colorOptions.forEach((option) => {
  const optionDiv = document.createElement("div")
  optionDiv.className =
    "radio-option flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
  const radio = document.createElement("input")
  radio.type = "radio"
  radio.id = option.id
  radio.name = "bgColor"
  radio.value = option.value
  radio.className = "flex-shrink-0 h-4 w-4 appearance-none"
  const label = document.createElement("label")
  label.htmlFor = option.id
  label.className = "flex items-center cursor-pointer flex-1"
  label.innerHTML = `
    <span class="text-gray-700 font-medium">${option.label}</span>
    ${
      option.preview
        ? `<span class="color-preview ml-2 w-5 h-5 rounded-full border" style="background-color: ${option.preview}"></span>`
        : ""
    }
  `
  optionDiv.appendChild(radio)
  optionDiv.appendChild(label)
  if (option.id === "custom") {
    const colorPicker = document.createElement("input")
    colorPicker.type = "color"
    colorPicker.id = "customColorPicker"
    colorPicker.value = "#FFFFFF"
    colorPicker.className = "ml-auto w-10 h-10 p-1 rounded border border-gray-300 cursor-pointer"
    label.appendChild(colorPicker)
  }
  colorContainer.appendChild(optionDiv)
})
const sizeOptions = [
  { id: "size1", value: "1寸", label: "1寸 (2.5 cm × 3.5 cm)" },
  { id: "size2", value: "2寸", label: "2寸 (3.5 cm × 5.3 cm)" },
  { id: "size3", value: "5寸", label: "5寸 (8.9 cm × 12.7 cm)" },
  { id: "customInch", value: "customInch", label: "自定义寸" },
  { id: "customCm", value: "customCm", label: "自定义厘米" },
]
sizeOptions.forEach((option) => {
  const optionDiv = document.createElement("div")
  optionDiv.className = "space-y-2 mb-4"
  const radioDiv = document.createElement("div")
  radioDiv.className = "radio-option flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
  const radio = document.createElement("input")
  radio.type = "radio"
  radio.id = option.id
  radio.name = "size"
  radio.value = option.value
  radio.className = "flex-shrink-0 h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
  const label = document.createElement("label")
  label.htmlFor = option.id
  label.className = "cursor-pointer flex-1 text-gray-700 font-medium"
  label.innerHTML = `${option.label}`
  radioDiv.appendChild(radio)
  radioDiv.appendChild(label)
  optionDiv.appendChild(radioDiv)
  if (option.id === "customInch" || option.id === "customCm") {
    const inputContainer = document.createElement("div")
    inputContainer.className = "ml-8 hidden space-y-2"
    inputContainer.id = `${option.id}Container`
    if (option.id === "customInch") {
      inputContainer.innerHTML = `
        <input type="number" id="customInchInput" placeholder="输入寸值" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
      `
    } else {
      inputContainer.innerHTML = `
        <input type="number" id="customCmInput1" placeholder="长度 (cm)" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent">
        <input type="number" id="customCmInput2" placeholder="宽度 (cm)" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent">
      `
    }
    optionDiv.appendChild(inputContainer)
  }
  sizeContainer.appendChild(optionDiv)
})
sizeContainer.addEventListener("change", (e) => {
  if (e.target.name === "size") {
    const customInchContainer = document.getElementById("customInchContainer")
    const customCmContainer = document.getElementById("customCmContainer")
    if (customInchContainer) customInchContainer.classList.add("hidden")
    if (customCmContainer) customCmContainer.classList.add("hidden")
    if (e.target.id === "customInch") {
      customInchContainer.classList.remove("hidden")
    } else if (e.target.id === "customCm") {
      customCmContainer.classList.remove("hidden")
    }
  }
})
const handleFileSelect = (file) => {
  if (file) {
    const fileName = file.name
    uploadArea.innerHTML = `
      <div class="flex flex-col items-center justify-center space-y-2 text-center">
        <svg class="w-12 h-12 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-gray-700 font-medium">${fileName}</p>
        <p class="text-sm text-gray-500">文件已选择</p>
      </div>
    `
  }
}
fileInput.addEventListener("change", (e) => handleFileSelect(e.target.files[0]))
uploadArea.addEventListener("click", () => fileInput.click())
uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault()
  uploadArea.classList.add("border-gray-400", "bg-gray-50")
})
uploadArea.addEventListener("dragleave", (e) => {
  e.preventDefault()
  uploadArea.classList.remove("border-gray-400", "bg-gray-50")
})
uploadArea.addEventListener("drop", (e) => {
  e.preventDefault()
  uploadArea.classList.remove("border-gray-400", "bg-gray-50")
  const files = e.dataTransfer.files
  if (files.length > 0) {
    fileInput.files = files
    handleFileSelect(files[0])
  }
})
uploadButton.addEventListener("click", () => {
  if (!fileInput.files || fileInput.files.length === 0) {
    showAlert("请选择一个图片文件", "error")
    return
  }
  const selectedColor = document.querySelector('input[name="bgColor"]:checked')
  if (!selectedColor) {
    showAlert("请选择背景颜色", "error")
    return
  }
  const bgColor =
    selectedColor.value === "custom"
      ? document.getElementById("customColorPicker").value
      : selectedColor.value
  const selectedSize = document.querySelector('input[name="size"]:checked')
  if (!selectedSize) {
    showAlert("请选择尺寸", "error")
    return
  }
  let size
  if (selectedSize.value === "customInch") {
    const inchValue = document.getElementById("customInchInput").value
    if (!inchValue || inchValue <= 0) {
      showAlert("请输入有效的寸值", "error")
      return
    }
    size = `${inchValue}寸`
  } else if (selectedSize.value === "customCm") {
    const cmValue1 = document.getElementById("customCmInput1").value
    const cmValue2 = document.getElementById("customCmInput2").value
    if (!cmValue1 || !cmValue2 || cmValue1 <= 0 || cmValue2 <= 0) {
      showAlert("请输入有效的长度和宽度", "error")
      return
    }
    size = `${cmValue1}x${cmValue2}cm`
  } else {
    size = selectedSize.value
  }
  uploadButton.textContent = "处理中..."
  uploadButton.disabled = true
  document.body.classList.add("loading")
  const progressContainer = document.createElement("div")
  progressContainer.className = "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-50 w-72"
  progressContainer.innerHTML = `
    <div class="mb-4">
      <p class="text-sm font-medium text-gray-700 mb-1">上传进度</p>
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div id="uploadProgress" class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style="width: 0%"></div>
      </div>
    </div>
    <div>
      <p class="text-sm font-medium text-gray-700 mb-1">生成进度</p>
      <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div id="generateProgress" class="bg-green-500 h-2.5 rounded-full" style="width: 0%"></div>
      </div>
    </div>
  `
  document.body.appendChild(progressContainer)
  const uploadProgress = document.getElementById("uploadProgress")
  const generateProgress = document.getElementById("generateProgress")
  const formData = new FormData()
  formData.append("file", fileInput.files[0])
  formData.append("background_color", bgColor)
  formData.append("size", size)
  const xhr = new XMLHttpRequest()
  xhr.open("POST", "http://localhost:8000/upload", true)
  xhr.upload.addEventListener("progress", (e) => {
    if (e.lengthComputable) {
      const percentCompleted = Math.round((e.loaded / e.total) * 100)
      uploadProgress.style.width = `${percentCompleted}%`
      if (percentCompleted === 100) {
        generateProgress.classList.add("progress-indeterminate")
        generateProgress.style.width = '100%';
      }
    }
  })
  xhr.addEventListener("load", () => {
    generateProgress.classList.remove("progress-indeterminate")
    generateProgress.style.width = '100%';
    if (xhr.status === 200) {
      let result;
      try {
        result = JSON.parse(xhr.responseText);
      } catch (e) {
        showAlert("解析服务器响应失败。请检查服务器返回的是否为有效JSON。", "error");
        console.error("JSON Parse Error:", e, "Response Text:", xhr.responseText);
        return;
      }
      try {
        if (result.image && result.width && result.height) {
          resultImage.src = `data:image/png;base64,${result.image}`;
          resultContainer.classList.add("hidden");
          resultImage.classList.remove("hidden");
          downloadBtn.classList.remove("hidden");
          const oldSizeInfo = downloadBtn.parentNode.querySelector(".size-info");
          if (oldSizeInfo) oldSizeInfo.remove();
          const sizeInfo = document.createElement("div");
          sizeInfo.className = "text-sm text-gray-600 my-2 text-center size-info";
          sizeInfo.textContent = `生成尺寸: ${result.width} × ${result.height} 像素`;
          downloadBtn.parentNode.insertBefore(sizeInfo, downloadBtn);
          showAlert("证件照生成成功！", "success");
          uploadArea.innerHTML = initialUploadAreaHTML;
          fileInput.value = "";
        } else {
          showAlert(result.error || "处理失败，服务器未返回有效数据。", "error");
        }
      } catch (e) {
        showAlert("成功获取数据，但渲染结果时出错。", "error");
        console.error("DOM Render Error:", e);
      }
    } else {
      showAlert(`服务器错误 (状态码: ${xhr.status})。请检查服务器日志。`, "error");
    }
  })
  xhr.addEventListener("error", () => {
    showAlert("网络错误，无法连接到服务器。", "error");
  })
  xhr.addEventListener("loadend", () => {
    if(progressContainer) progressContainer.remove();
    uploadButton.textContent = "生成证件照";
    uploadButton.disabled = false;
    document.body.classList.remove("loading");
  })
  xhr.send(formData)
})
downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a")
  link.download = `id-photo-${Date.now()}.png`
  link.href = resultImage.src
  link.click()
})
function showAlert(message, type = "info") {
  const alertDiv = document.createElement("div")
  const typeClasses = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
  }
  alertDiv.className = `fixed top-5 right-5 px-6 py-3 rounded-lg shadow-lg z-50 transition-transform transform translate-x-full ${typeClasses[type]}`
  alertDiv.textContent = message
  document.body.appendChild(alertDiv)
  setTimeout(() => {
    alertDiv.style.transform = "translateX(0)"
  }, 10)
  setTimeout(() => {
    alertDiv.style.transform = "translateX(calc(100% + 1.25rem))"
    alertDiv.addEventListener('transitionend', () => alertDiv.remove());
  }, 3500)
}