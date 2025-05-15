/**
 * dataLoader.js - 數據載入與處理模組
 *
 * 負責載入和處理網站所需的所有數據:
 * - CSV數據解析與標準化
 * - 數據載入事件管理
 * - 數據處理與轉換
 */

// 全局數據存儲
window.ipoProductData = null;

/**
 * 初始化數據載入模組
 */
function initDataLoader() {
  console.log("DataLoader: 初始化數據載入模組");

  // 載入主要CSV數據
  loadCsvData();

  // 載入檢舉範本
  loadReportTemplates();

  // 監聽數據載入完成事件，用於初始化圖表與統計
  document.addEventListener("ipoDataLoaded", function (event) {
    console.log("DataLoader: 數據載入完成，開始處理 insight panel");
    updateInsightPanel(event.detail);
  });
}

/**
 * 載入CSV數據
 */
function loadCsvData() {
  console.log("DataLoader: 開始載入CSV數據");

  fetch("ipo_broker_product.csv")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    })
    .then((csvText) => {
      // 解析CSV數據
      const parsedData = parseCSV(csvText);
      console.log(`DataLoader: CSV解析完成，共 ${parsedData.length} 筆數據`);

      // 存儲到全局變數
      window.ipoProductData = parsedData;

      // 觸發數據載入完成事件
      document.dispatchEvent(
        new CustomEvent("ipoDataLoaded", {
          detail: parsedData,
        })
      );
    })
    .catch((error) => {
      console.error("DataLoader: 載入CSV數據失敗:", error);

      // 觸發空數據事件，以便UI可以顯示錯誤
      window.ipoProductData = [];
      document.dispatchEvent(
        new CustomEvent("ipoDataLoaded", {
          detail: [],
        })
      );

      // 顯示錯誤信息
      const tableContainer = document.getElementById("data-table-container");
      if (tableContainer) {
        tableContainer.innerHTML = `
          <div class="text-red-500 p-4 bg-white rounded-lg shadow-card">
            無法載入數據表格。請檢查CSV檔案或重新整理頁面。
          </div>
        `;
      }
    });
}

/**
 * 解析CSV文本為結構化數據
 */
function parseCSV(csvText) {
  console.log("DataLoader: 正在解析CSV文本");

  const lines = csvText.trim().split("\n");
  if (lines.length === 0) {
    console.warn("DataLoader: CSV文本中沒有行");
    return [];
  }

  // 處理標頭行
  const headersLine = lines[0].trim();
  const headers = headersLine
    .replace(/^\ufeff/, "") // 移除BOM標記
    .split(",")
    .map((h) => h.trim().toLowerCase());

  // 驗證標頭是否包含所需欄位
  const expectedHeaders = ["broker", "product", "responsibility", "period"];
  let missingHeaders = false;

  expectedHeaders.forEach((expectedHeader) => {
    if (!headers.includes(expectedHeader)) {
      console.warn(`DataLoader: CSV缺少預期的標頭: ${expectedHeader}`);
      missingHeaders = true;
    }
  });

  // 確保所有標頭都存在
  const data = lines
    .slice(1) // 跳過標頭行
    .map((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return null; // 跳過空行

      const values = trimmedLine.split(",");
      const entry = {};

      headers.forEach((header, i) => {
        entry[header] = values[i]?.trim() || "";
      });

      // 確保所有預期欄位都存在
      expectedHeaders.forEach((eh) => {
        if (!entry.hasOwnProperty(eh)) {
          entry[eh] = "";
        }
      });

      return entry;
    })
    .filter(Boolean); // 移除null項

  console.log(`DataLoader: 解析完成，共 ${data.length} 行有效數據`);
  return data;
}

/**
 * 更新數據洞察面板
 */
function updateInsightPanel(data) {
  console.log("DataLoader: 更新數據洞察面板");

  const insightPanel = document.getElementById("insight-panel");
  if (!insightPanel) {
    console.warn("DataLoader: 找不到 insight-panel 元素");
    return;
  }

  if (!data || data.length === 0) {
    console.warn("DataLoader: 無可用數據用於洞察面板");
    insightPanel.innerHTML =
      '<div class="text-yellow-300 p-4">注意：數據分析區無可用資料。</div>';
    return;
  }

  // 使用現有的面板進行分析
  analyzeDataForInsights(data);
}

/**
 * 分析數據並更新統計數字
 */
function analyzeDataForInsights(data) {
  console.log(`DataLoader: 開始分析 ${data.length} 筆數據用於統計`);

  // 日期處理函數
  const parseMinguoDate = (minguoDateStr) => {
    if (!minguoDateStr || !minguoDateStr.includes("/")) return null;

    const parts = minguoDateStr.split("/");
    if (parts.length < 3) return null;

    const year = parseInt(parts[0], 10) + 1911; // 民國轉西元
    const month = parseInt(parts[1], 10) - 1; // 月份0-11
    const day = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

    try {
      return new Date(year, month, day);
    } catch (e) {
      return null;
    }
  };

  // 計算時間段天數
  const getDurationDays = (periodStr) => {
    if (!periodStr || !periodStr.includes("-") || periodStr.trim() === "-") {
      return 0;
    }

    const [startStr, endStr] = periodStr.split("-");
    let startDate = parseMinguoDate(startStr.trim());
    let endDate = parseMinguoDate(endStr.trim());

    // 處理只有月日的結束日期（沒有年份）
    if (startDate && endStr.trim().split("/").length === 2) {
      const startYearMinguo = startStr.trim().split("/")[0];
      endDate = parseMinguoDate(startYearMinguo + "/" + endStr.trim());
    }

    if (!startDate || !endDate || endDate < startDate) return 0;

    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // 加1因為包含首尾日
  };

  // 初始化分析變數
  let maxResp = 0,
    totalResp = 0,
    totalEntriesForAvgResp = 0;
  let minDays = Infinity,
    totalDays = 0,
    totalEntriesForAvgDays = 0;
  const monthCounts = {};
  let dailyRespArray = [];
  let peakAmt = 0,
    peakDateInfo = "—";

  // 分析每筆數據
  data.forEach((item) => {
    // 分析責任額
    const respString = String(item.responsibility || "").trim();
    const resp = parseFloat(respString);

    if (!isNaN(resp)) {
      if (resp > maxResp) maxResp = resp;
      totalResp += resp;
      totalEntriesForAvgResp++;
    }

    // 分析募集期間
    const period = String(item.period || "").trim();
    const duration = getDurationDays(period);

    if (duration > 0) {
      if (duration < minDays) minDays = duration;
      totalDays += duration;
      totalEntriesForAvgDays++;

      // 計算每日責任額
      if (!isNaN(resp)) {
        const dailyResp = resp / duration;
        dailyRespArray.push(dailyResp);

        if (dailyResp > peakAmt) {
          peakAmt = dailyResp;
          peakDateInfo = `${item.broker} ${item.product} (${period})`;
        }
      }

      // 統計月份分布
      const startMinguoDate = period.split("-")[0].trim();
      if (startMinguoDate && startMinguoDate.includes("/")) {
        const monthPart = startMinguoDate.split("/")[1];
        if (monthPart) {
          const jsMonth = parseInt(monthPart, 10);
          if (!isNaN(jsMonth)) {
            monthCounts[jsMonth] = (monthCounts[jsMonth] || 0) + 1;
          }
        }
      }
    }
  });

  // 計算統計結果
  const avgResp =
    totalEntriesForAvgResp > 0 ? totalResp / totalEntriesForAvgResp : 0;
  const ratioResp = avgResp > 0 ? maxResp / avgResp : 0;
  const avgDays =
    totalEntriesForAvgDays > 0 ? totalDays / totalEntriesForAvgDays : 0;
  const cutPct = avgDays > 0 ? Math.max(0, ((30 - avgDays) / 30) * 100) : 0;

  if (minDays === Infinity) minDays = 0;

  // 找出「地獄月份」- 集中開賣最多檔ETF的月份
  let hellMonth = 0,
    hellCount = 0;

  for (const monthKey in monthCounts) {
    if (monthCounts[monthKey] > hellCount) {
      hellCount = monthCounts[monthKey];
      hellMonth = parseInt(monthKey, 10);
    }
  }

  // 計算平均每日責任額和每小時配額
  const avgPerDay =
    dailyRespArray.length > 0
      ? dailyRespArray.reduce((a, b) => a + b, 0) / dailyRespArray.length
      : 0;
  const hrQuota = avgPerDay > 0 ? avgPerDay / 8 : 0;

  // 更新UI元素
  updateStatElement("ins-maxResp", maxResp);
  updateStatElement("ins-avgResp", avgResp, 1);
  updateStatElement("ins-ratioResp", ratioResp, 1);
  updateStatElement("ins-avgDays", avgDays, 1);
  updateStatElement("ins-minDays", minDays);
  updateStatElement("ins-cutPct", cutPct);
  updateStatElement("ins-hellMonth", hellMonth || "N/A");
  updateStatElement("ins-hellCount", hellCount);
  updateStatElement("ins-avgPerDay", avgPerDay, 1);
  updateStatElement("ins-hrQuota", hrQuota, 1);
  updateStatElement("ins-peakDate", peakDateInfo);
  updateStatElement("ins-peakAmt", peakAmt, 1);

  console.log("DataLoader: 數據分析完成，統計元素已更新");

  // 觸發計數器動畫 (如果動畫模組已載入)
  if (
    window.animationsModule &&
    typeof window.animationsModule.reobserveCounters === "function"
  ) {
    const insightPanel = document.getElementById("insight-panel");
    if (insightPanel) {
      window.animationsModule.reobserveCounters(
        insightPanel.querySelectorAll(".counter")
      );
    }
  }
}

/**
 * 更新統計元素文字並準備動畫
 */
function updateStatElement(id, value, fractionDigits = 0) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`DataLoader: 找不到統計元素 #${id}`);
    return;
  }

  let textValue =
    typeof value === "number" ? value.toFixed(fractionDigits) : String(value);
  element.textContent = textValue;

  // 如果是計數器元素，設置動畫目標值
  if (element.classList.contains("counter")) {
    element.dataset.target = textValue;
  }
}

/**
 * 載入檢舉範本文件
 */
function loadReportTemplates() {
  console.log("DataLoader: 載入檢舉範本");

  const templatesContainer = document.getElementById("templates-container");
  if (!templatesContainer) {
    console.warn("DataLoader: 找不到範本容器元素 #templates-container");
    return;
  }

  // 初始化容器
  templatesContainer.innerHTML = `
    <div class="mt-4">
      <h4 class="font-semibold mb-4">可用範本</h4>
      <div id="template-items" class="space-y-3"></div>
    </div>
  `;

  const templateItems = document.getElementById("template-items");
  if (!templateItems) {
    console.error("DataLoader: 找不到範本項目容器 #template-items");
    return;
  }

  // 範本文件定義
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
    { id: "101", name: "責任額與回單機制檢舉", file: "txt/101.txt" },
    { id: "102", name: "職場霸凌與勞權檢舉", file: "txt/102.txt" },
  ];

  console.log(`DataLoader: 準備載入 ${templateFiles.length} 個範本`);

  // 創建每個範本的按鈕
  templateFiles.forEach((template) => {
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
        console.log(
          `DataLoader: 成功載入範本 ${template.file}，長度: ${content.length}`
        );

        // 點擊按鈕顯示範本內容並複製到剪貼簿
        button.addEventListener("click", function () {
          if (
            window.templateUtil &&
            typeof window.templateUtil.displayTextInEditor === "function"
          ) {
            window.templateUtil.displayTextInEditor(content);
          } else {
            const editor = document.getElementById("template-content");
            if (editor) {
              const placeholder = document.getElementById("editor-placeholder");
              if (placeholder) placeholder.classList.add("hidden");

              editor.classList.remove("hidden");
              editor.innerHTML = formatTemplate(content);
            }
          }

          copyTextToClipboard(content);
        });
      })
      .catch((error) => {
        console.error(`DataLoader: 載入範本 ${template.file} 出錯:`, error);
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

/**
 * 格式化範本文本用於顯示
 */
function formatTemplate(text) {
  return text
    .replace(/\n\n/g, "<br><br>")
    .replace(/\n/g, "<br>")
    .replace(/（[^）]+）/g, '<span class="text-secondary">$&</span>');
}

/**
 * 複製文本到剪貼簿
 */
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

// 在DOM完成載入後初始化數據載入器
document.addEventListener("DOMContentLoaded", initDataLoader);

// 導出模組
window.dataLoader = {
  init: initDataLoader,
  loadCsvData: loadCsvData,
  loadReportTemplates: loadReportTemplates,
};
