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
 *
 * 計算邏輯說明：
 * 1. maxResp: 最高責任額，單一商品中最高的責任額
 * 2. avgResp: 平均責任額，所有商品責任額的平均值
 * 3. ratioResp: 最高/平均責任額比率，顯示極端值的程度
 * 4. avgDays: 平均募集天數
 * 5. minDays: 最短募集天數
 * 6. cutPct: 相對於30天的縮減百分比
 * 7. hellMonth: 地獄月份（最多商品開賣的月份）
 * 8. hellCount: 地獄月份的商品數量
 * 9. avgPerDay: 每日平均責任額
 * 10. hrQuota: 每小時平均配額（假設8小時工作日）
 * 11. peakAmt: 單日最高責任額
 */
function analyzeDataForInsights(data) {
  console.log(`DataLoader: 開始分析 ${data.length} 筆數據用於統計`);

  // 日期處理函數 - 轉換民國年為西元年
  const parseMinguoDate = (minguoDateStr) => {
    if (!minguoDateStr || !minguoDateStr.includes("/")) return null;

    const parts = minguoDateStr.split("/");
    if (parts.length < 3) return null;

    // 民國年轉西元年
    const year = parseInt(parts[0], 10) + 1911;
    const month = parseInt(parts[1], 10) - 1; // 月份0-11
    const day = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

    try {
      return new Date(year, month, day);
    } catch (e) {
      return null;
    }
  };

  // 計算募集期間天數
  const getDurationDays = (periodStr) => {
    if (!periodStr || !periodStr.includes("-") || periodStr.trim() === "-") {
      return 0;
    }

    const [startStr, endStr] = periodStr.split("-");
    const startDate = parseMinguoDate(startStr.trim());
    let endDate = parseMinguoDate(endStr.trim());

    // 處理只有月日的結束日期（沒有年份）
    if (startDate && endStr.trim().split("/").length === 2) {
      const startYearMinguo = startStr.trim().split("/")[0];
      endDate = parseMinguoDate(startYearMinguo + "/" + endStr.trim());
    }

    if (!startDate || !endDate || endDate < startDate) return 0;

    // 計算天數差（包含起始日）
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // 初始化分析變數
  let maxResp = 0; // 最高責任額
  let minResp = Infinity; // 最低責任額（非零）
  let totalResp = 0; // 總責任額
  let totalEntriesForAvgResp = 0; // 有效責任額數量
  let minDays = Infinity; // 最短募集天數
  let totalDays = 0; // 總募集天數
  let totalEntriesForAvgDays = 0; // 有效募集期間數量
  const monthCounts = {}; // 各月份商品數量統計
  const dailyRespArray = []; // 每日責任額陣列
  let peakAmt = 0; // 單日最高責任額
  let peakDateInfo = "—"; // 最高責任額的日期資訊
  const yearMonthCounts = {}; // 按年月統計的商品數量

  // 分析每筆數據
  data.forEach((item) => {
    // 分析責任額
    const respString = String(item.responsibility || "").trim();
    const resp = parseFloat(respString);

    if (!isNaN(resp) && resp > 0) {
      // 確保責任額大於0
      // 更新最高責任額
      if (resp > maxResp) maxResp = resp;
      // 更新最低責任額（非零）
      if (resp < minResp) minResp = resp;
      totalResp += resp;
      totalEntriesForAvgResp++;
    }

    // 分析募集期間
    const period = String(item.period || "").trim();
    const duration = getDurationDays(period);

    if (duration > 0) {
      // 更新最短募集天數
      if (duration < minDays) minDays = duration;
      totalDays += duration;
      totalEntriesForAvgDays++;

      // 計算每日責任額
      if (!isNaN(resp)) {
        const dailyResp = resp / duration;
        dailyRespArray.push(dailyResp);

        // 更新單日最高責任額
        if (dailyResp > peakAmt) {
          peakAmt = dailyResp;
          peakDateInfo = `${item.broker} ${item.product} (${period})`;
        }
      }

      // 統計年月分布（改進版 - 加入商品去重）
      const startDate = period.split("-")[0].trim();
      if (startDate && startDate.includes("/")) {
        const [year, month] = startDate.split("/").map((part) => part.trim());
        if (year && month) {
          // 確保年月格式正確
          const yearNum = parseInt(year, 10);
          const monthNum = parseInt(month, 10);

          if (
            !isNaN(yearNum) &&
            !isNaN(monthNum) &&
            monthNum >= 1 &&
            monthNum <= 12
          ) {
            // 初始化年份物件
            if (!yearMonthCounts[yearNum]) {
              yearMonthCounts[yearNum] = {};
            }
            // 初始化月份的商品集合
            if (!yearMonthCounts[yearNum][monthNum]) {
              yearMonthCounts[yearNum][monthNum] = new Set();
            }
            // 將商品代碼加入集合（自動去重）
            yearMonthCounts[yearNum][monthNum].add(item.product);
          }
        }
      }
    }
  });

  // 找出「地獄月份」- 依年月分組找出最多商品的月份（去重後）
  let hellYear = 0;
  let hellMonth = 0;
  let hellCount = 0;

  // 遍歷每個年份
  Object.entries(yearMonthCounts).forEach(([year, months]) => {
    // 遍歷該年份的每個月份
    Object.entries(months).forEach(([month, products]) => {
      // 取得去重後的商品數量
      const uniqueProductCount = products.size;
      if (uniqueProductCount > hellCount) {
        hellCount = uniqueProductCount;
        hellYear = parseInt(year, 10);
        hellMonth = parseInt(month, 10);
      }
    });
  });

  // 計算統計結果
  if (minResp === Infinity) minResp = 0;
  const ratioResp = minResp > 0 ? (maxResp / minResp).toFixed(1) : 0; // 最高/最低比率
  const avgDays =
    totalEntriesForAvgDays > 0
      ? (totalDays / totalEntriesForAvgDays).toFixed(1)
      : 0;
  const cutPct =
    avgDays > 0 ? Math.max(0, ((30 - avgDays) / 30) * 100).toFixed(1) : 0;

  if (minDays === Infinity) minDays = 0;

  // 計算平均每日責任額和每小時配額
  const avgPerDay =
    dailyRespArray.length > 0
      ? (
          dailyRespArray.reduce((a, b) => a + b, 0) / dailyRespArray.length
        ).toFixed(1)
      : 0;
  const hrQuota = avgPerDay > 0 ? (avgPerDay / 8).toFixed(1) : 0;

  // 更新UI元素
  updateStatElement("ins-maxResp", maxResp); // 最高責任額
  updateStatElement("ins-minResp", minResp); // 最低責任額
  updateStatElement("ins-ratioResp", ratioResp); // 最高/最低比率
  updateStatElement("ins-avgDays", avgDays); // 平均募集天數
  updateStatElement("ins-minDays", minDays); // 最短募集天數
  updateStatElement("ins-cutPct", cutPct); // 縮減百分比
  updateStatElement("ins-hellYear", hellYear); // 地獄年份
  updateStatElement("ins-hellMonth", hellMonth); // 地獄月份
  updateStatElement("ins-hellCount", hellCount); // 地獄月份商品數
  updateStatElement("ins-avgPerDay", avgPerDay); // 每日平均責任額
  updateStatElement("ins-hrQuota", hrQuota); // 每小時平均配額
  updateStatElement("ins-peakDate", peakDateInfo); // 最高責任額日期
  updateStatElement("ins-peakAmt", peakAmt, 1); // 單日最高責任額

  console.log("DataLoader: 數據分析完成，統計元素已更新");

  // 觸發計數器動畫
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

  const textValue =
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
