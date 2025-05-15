/**
 * dataLoader.js - 數據與範本讀取模組
 *
 * 提供專案數據載入功能:
 * - 讀取CSV數據
 * - 初始化DataTables
 * - 檢舉範本載入
 */

// 初始化函數，由DOM載入後自動呼叫
function initDataLoader() {
  console.log("DataLoader 初始化...");
  // loadCsvData();
  loadReportTemplates();
}

// 載入檢舉信範本
function loadReportTemplates() {
  console.log("開始載入檢舉信範本...");
  const templatesContainer = document.getElementById("templates-container");
  if (!templatesContainer) {
    console.error("找不到範本容器元素!");
    return;
  }

  // 清空容器
  templatesContainer.innerHTML =
    '<div class="mt-8"><h4 class="font-semibold mb-4">可用範本</h4><div id="template-items" class="space-y-3"></div></div>';
  const templateItems = document.getElementById("template-items");
  if (!templateItems) {
    console.error("找不到範本項目容器!");
    return;
  }

  // 範本文件列表
  const templateFiles = [
    { id: "1", name: "一般民眾實名檢舉（銀行商品責任額）", file: "txt/1.txt" },
    {
      id: "9",
      name: "群益印美戰略基金檢舉（地緣風險未揭露）",
      file: "txt/9.txt",
    },
    {
      id: "11",
      name: "一般民眾實名檢舉（IPO制度與ETF回單機制）",
      file: "txt/11.txt",
    },
  ];

  console.log("準備加載", templateFiles.length, "個範本檔案");

  // 為每個範本創建按鈕
  templateFiles.forEach((template) => {
    console.log("處理範本:", template.name);
    const button = document.createElement("button");
    button.className =
      "copy-btn w-full py-3 px-4 bg-secondary text-white rounded-lg flex items-center justify-between hover:bg-secondary-dark transition-colors btn-effect";
    button.setAttribute("data-template", `template-${template.id}`);
    button.innerHTML = `
      <span>${template.name}</span>
      <i class="fas fa-copy"></i>
    `;

    templateItems.appendChild(button);

    // 載入範本內容
    fetch(template.file)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`無法載入範本 ${template.file}`);
        }
        return response.text();
      })
      .then((content) => {
        console.log(`成功讀取範本 ${template.file}, 內容長度:`, content.length);

        // 創建隱藏的範本內容元素
        const templateEl = document.createElement("div");
        templateEl.id = `template-${template.id}`;
        templateEl.className = "hidden";
        templateEl.textContent = content;
        document.body.appendChild(templateEl);

        // 繼續為剛才的按鈕添加點擊事件
        button.addEventListener("click", function () {
          const templateContent = document.getElementById("template-content");
          const editorPlaceholder =
            document.getElementById("editor-placeholder");

          if (templateContent && editorPlaceholder) {
            // 顯示範本內容
            editorPlaceholder.classList.add("hidden");
            templateContent.classList.remove("hidden");
            templateContent.innerHTML = formatTemplate(content);

            // 複製到剪貼簿
            copyTextToClipboard(content);
          }
        });
      })
      .catch((error) => {
        console.error(`載入範本 ${template.file} 出錯:`, error);
        // 為按鈕添加錯誤狀態
        button.classList.add("bg-red-500");
        button.classList.remove("bg-secondary");
        button.innerHTML = `
          <span>${template.name} (載入失敗)</span>
          <i class="fas fa-exclamation-triangle"></i>
        `;
        button.disabled = true;
      });
  });
}

// 格式化範本文本
function formatTemplate(text) {
  return text
    .replace(/\n\n/g, "<br><br>")
    .replace(/\n/g, "<br>")
    .replace(/（[^）]+）/g, '<span class="text-secondary">$&</span>');
}

// 複製文本到剪貼簿
function copyTextToClipboard(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const successful = document.execCommand("copy");
    if (typeof window.showToast === "function") {
      window.showToast("範本已複製到剪貼簿！");
    } else {
      console.log("範本已複製到剪貼簿！");
    }
  } catch (err) {
    console.error("複製失敗:", err);
    if (typeof window.showToast === "function") {
      window.showToast("複製失敗，請手動複製");
    } else {
      console.log("複製失敗，請手動複製");
    }
  }

  document.body.removeChild(textarea);
}

// 在DOM完成載入後初始化資料載入器
document.addEventListener("DOMContentLoaded", initDataLoader);
