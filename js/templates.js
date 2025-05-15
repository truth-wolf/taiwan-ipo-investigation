/**
 * templates.js - 範本處理模組
 *
 * 提供範本相關功能:
 * - 顯示範本內容
 * - 格式化範本
 * - 範本編輯器控制
 */

// 範本處理模組
window.templateUtil = {
  // 在編輯器中顯示文本
  displayTextInEditor: function (text) {
    console.log("Templates: 在編輯器中顯示範本內容");

    const editorPlaceholder = document.getElementById("editor-placeholder");
    const templateContent = document.getElementById("template-content");

    if (!templateContent) {
      console.warn("Templates: 找不到範本內容容器 #template-content");
      return;
    }

    // 隱藏佔位元素，顯示內容區域
    if (editorPlaceholder) {
      editorPlaceholder.classList.add("hidden");
    }

    templateContent.classList.remove("hidden");

    // 使用格式化函數處理範本內容
    templateContent.innerHTML = this.formatTemplate(text);
  },

  // 格式化範本文本，增加可讀性
  formatTemplate: function (text) {
    if (!text) return "";

    return text
      .replace(/\n\n/g, "<br><br>") // 雙換行轉為兩個<br>
      .replace(/\n/g, "<br>") // 單個換行轉為<br>
      .replace(/（[^）]+）/g, '<span class="text-secondary">$&</span>'); // 突出顯示（註釋）
  },

  // 註冊下載按鈕事件
  initDownloadButton: function () {
    const downloadButton = document.getElementById("download-template");
    if (!downloadButton) {
      console.warn("Templates: 找不到下載按鈕 #download-template");
      return;
    }

    downloadButton.addEventListener("click", function () {
      const templateContent = document.getElementById("template-content");
      if (!templateContent || templateContent.classList.contains("hidden")) {
        alert("請先選擇一個範本！");
        return;
      }

      const content = templateContent.innerText || templateContent.textContent;
      if (!content.trim()) {
        alert("範本內容為空，無法下載！");
        return;
      }

      // 創建Blob並下載
      const blob = new Blob([content.replace(/<br>/g, "\n")], {
        type: "application/msword",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "檢舉信範本.doc";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (typeof window.showToast === "function") {
        window.showToast("範本已下載！");
      }
    });
  },
};

// 範本模組初始化函數
window.templateModule = function () {
  console.log("Templates: 初始化範本模組");

  // 初始化下載按鈕
  window.templateUtil.initDownloadButton();

  // 在這裡添加其他範本相關的初始化代碼
};

// 在DOM載入完成後自動初始化
document.addEventListener("DOMContentLoaded", function () {
  if (typeof window.templateModule === "function") {
    window.templateModule();
  }
});
