/**
 * templates.js - 檢舉範本處理模組
 *
 * 提供範本相關的進階功能，包括：
 * - 特殊字段格式化
 * - 範本變數處理 (Future - placeholder)
 * - 範本下載
 */

window.templateUtil = (function () {
  const templateContentEl = document.getElementById("template-content");
  const editorPlaceholderEl = document.getElementById("editor-placeholder");

  // 格式化範本文字以供顯示 (例如，處理換行符)
  function formatTemplateForDisplay(text) {
    if (!text) return "";
    return text
      .replace(/\n\n/g, "<br><br>")
      .replace(/\n/g, "<br>")
      .replace(/（[^）]+）/g, '<span class="text-secondary">$&</span>');
  }

  // 在編輯器中顯示範本內容
  function displayTemplateInEditor(rawTemplateText) {
    if (templateContentEl) {
      templateContentEl.innerHTML = formatTemplateForDisplay(rawTemplateText);
      templateContentEl.classList.remove("hidden");
    }
    if (editorPlaceholderEl) {
      editorPlaceholderEl.classList.add("hidden");
    }
  }

  // 下載提供的文本內容為 .txt 檔案 (原為 .docx 但內容是純文字)
  function downloadTemplateText(textContent, filename = "檢舉信範本.txt") {
    if (!textContent) {
      if (window.showToast) window.showToast("沒有內容可下載。");
      return;
    }
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (window.showToast) window.showToast("檢舉範本已開始下載");
  }

  // 初始化下載按鈕 (如果仍需要獨立的下載按鈕)
  // 這個下載按鈕 (#download-template) 的事件監聽器可以放在 app.js 或 dataLoader.js
  // 如果它總是下載 #template-content 的內容。
  // For now, this module just provides the download function.
  const downloadButton = document.getElementById("download-template");
  if (downloadButton && templateContentEl) {
    downloadButton.addEventListener("click", function (e) {
      e.preventDefault();
      if (!templateContentEl.classList.contains("hidden")) {
        downloadTemplateText(templateContentEl.innerText);
      }
    });
  }

  return {
    formatTextForDisplay: formatTemplateForDisplay,
    displayTextInEditor: displayTemplateInEditor,
    downloadText: downloadTemplateText,
  };
})();

// The old window.templateModule can be removed or refactored.
// The current structure makes templateUtil a utility object.
