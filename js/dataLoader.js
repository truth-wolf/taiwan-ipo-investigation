/**
 * dataLoader.js - 數據與範本讀取模組
 *
 * 提供專案數據載入功能:
 * - 讀取CSV數據
 * - 初始化DataTables
 * - 檢舉範本載入
 */

// Store parsed CSV data globally for other modules to access
window.ipoProductData = null;

// 初始化函數，由DOM載入後自動呼叫
function initDataLoader() {
  console.log("DataLoader: initDataLoader() called.");
  loadCsvData();
  loadReportTemplates();
}

/**
 * 簡單的 CSV 解析函數 (Copied from main.js for now)
 * 欄位名稱: broker,product,responsibility,period
 */
function parseCSV(csvText) {
  console.log("DataLoader: parseCSV() called.");
  const lines = csvText.trim().split("\n");
  if (lines.length === 0) {
    console.warn("DataLoader: parseCSV - No lines in CSV text.");
    return [];
  }
  const headersLine = lines[0].trim();
  const headers = headersLine
    .replace(/^\ufeff/, "")
    .split(",")
    .map((h) => h.trim().toLowerCase());
  const expectedHeaders = ["broker", "product", "responsibility", "period"];
  let missingHeaders = false;
  expectedHeaders.forEach((eh) => {
    if (!headers.includes(eh)) {
      console.warn(`CSV 檔案缺少預期的表頭: ${eh} in dataLoader`);
      missingHeaders = true;
    }
  });
  // if (missingHeaders) { console.error("CSV 檔案表頭不完整(dataLoader)。"); return []; }

  console.log("DataLoader: parseCSV - Parsed headers:", headers);
  const data = lines
    .slice(1)
    .map((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return null;
      const values = trimmedLine.split(",");
      const entry = {};
      headers.forEach((header, i) => {
        entry[header] = values[i]?.trim() || "";
      });
      expectedHeaders.forEach((eh) => {
        if (!entry.hasOwnProperty(eh)) entry[eh] = "";
      });
      return entry;
    })
    .filter(Boolean);
  console.log("DataLoader: parseCSV - Parsed data length:", data.length);
  return data;
}

function loadCsvData() {
  console.log("DataLoader: loadCsvData() called.");
  fetch("ipo_broker_product.csv")
    .then((response) => {
      console.log("DataLoader: loadCsvData - Fetch response received.");
      if (!response.ok) {
        console.error(
          "DataLoader: loadCsvData - Fetch error! Status:",
          response.status
        );
        throw new Error(
          `HTTP error! status: ${response.status} while fetching ipo_broker_product.csv`
        );
      }
      return response.text();
    })
    .then((csvText) => {
      console.log(
        "DataLoader: loadCsvData - CSV text received, length:",
        csvText.length
      );
      window.ipoProductData = parseCSV(csvText);
      console.log(
        "DataLoader: loadCsvData - Parsed IPO data, length:",
        window.ipoProductData.length
      );
      console.log(
        "DataLoader: loadCsvData - Dispatching 'ipoDataLoaded' event."
      );
      document.dispatchEvent(
        new CustomEvent("ipoDataLoaded", { detail: window.ipoProductData })
      );

      // Placeholder for initializing DataTable if it happens here
      // if (typeof initEnhancedDataTable === 'function') { initEnhancedDataTable(window.ipoProductData); }
    })
    .catch((error) => {
      console.error(
        "DataLoader: loadCsvData - CATCH block. Error loading IPO CSV data:",
        error
      );
      window.ipoProductData = []; // Ensure it's an empty array on error
      document.dispatchEvent(
        new CustomEvent("ipoDataLoaded", { detail: window.ipoProductData })
      ); // Dispatch with empty data
      // Display error to user, perhaps in the table area
      const tableContainer = document.getElementById("data-table-container");
      if (tableContainer) {
        tableContainer.innerHTML =
          '<div class="text-red-500 p-4 bg-white rounded-lg shadow-card">無法載入主要的表格數據。請檢查CSV檔案。</div>';
      }
    });
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
    {
      id: "101",
      name: "責任額與回單機制檢舉",
      file: "txt/101.txt",
    },
    {
      id: "102",
      name: "職場霸凌與勞權檢舉",
      file: "txt/102.txt",
    },
  ];

  console.log("準備加載", templateFiles.length, "個範本檔案");

  // 為每個範本創建按鈕
  templateFiles.forEach((template) => {
    console.log("處理範本:", template.name);
    const button = document.createElement("button");
    button.className =
      "copy-btn w-full py-3 px-4 bg-secondary text-white rounded-lg flex items-center justify-between hover:bg-secondary-dark transition-colors btn-effect";
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

        button.addEventListener("click", function () {
          if (
            window.templateUtil &&
            typeof window.templateUtil.displayTextInEditor === "function"
          ) {
            window.templateUtil.displayTextInEditor(content);
          } else {
            console.error("templateUtil.displayTextInEditor not available.");
            const editor = document.getElementById("template-content");
            if (editor) editor.textContent = content;
          }
          copyTextToClipboard(content);
        });
      })
      .catch((error) => {
        console.error(`載入範本 ${template.file} 出錯:`, error);
        button.classList.add("bg-red-500", "hover:bg-red-700");
        button.classList.remove("bg-secondary", "hover:bg-secondary-dark");
        button.innerHTML = `
          <span>${template.name} (載入失敗)</span>
          <i class="fas fa-exclamation-triangle"></i>
        `;
        button.disabled = true;
      });
  });
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
    document.execCommand("copy");
    if (typeof window.showToast === "function") {
      window.showToast("範本已複製到剪貼簿！");
    } else {
      console.log("範本已複製到剪貼簿！(showToast not found)");
    }
  } catch (err) {
    console.error("複製失敗:", err);
    if (typeof window.showToast === "function") {
      window.showToast("複製失敗，請手動複製");
    } else {
      console.log("複製失敗，請手動複製 (showToast not found)");
    }
  }

  document.body.removeChild(textarea);
}

// 在DOM完成載入後初始化資料載入器
document.addEventListener("DOMContentLoaded", initDataLoader);
