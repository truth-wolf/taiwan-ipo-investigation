/**
 * enhancedTable.js - 增強型表格處理和互動功能
 *
 * 提供下列功能:
 * - 產品視圖和經典視圖切換
 * - 產品視圖高度調整
 * - 表格下載 (CSV, Excel, PDF)
 * - 券商和時間篩選
 * - 數據統計和視覺化
 */

// 初始化函數
function initEnhancedTable() {
  // 等待DOM加載完成
  document.addEventListener("DOMContentLoaded", () => {
    // 檢查是否已經加載了表格
    const checkInterval = setInterval(() => {
      if (document.querySelector("#csv-table_wrapper")) {
        clearInterval(checkInterval);
        enhanceTableInterface();
      }
    }, 100);
  });
}

// 增強表格界面
function enhanceTableInterface() {
  // 創建增強型控制面板
  createEnhancedControls();

  // 初始化產品表格視圖
  initProductTableView();

  // 設置視圖切換事件
  setupViewToggle();

  // 創建表格數據統計
  createDataStats();

  // 添加版權說明
  addAttribution();

  // 設置表格高度調整
  setupResizeHandle();

  // 初始化下載功能
  setupDownloadOptions();
}

// 創建增強型控制面板
function createEnhancedControls() {
  // 獲取原有控制元素的容器
  const originalFilter = document.querySelector(".filter-controls");
  const originalButtons = document.querySelector(".view-buttons");

  if (!originalFilter || !originalButtons) return;

  // 獲取已有的篩選器和按鈕
  const brokerFilter = document.getElementById("broker-filter");
  const dateFilter = document.getElementById("date-filter");
  const classicViewBtn = document.getElementById("classic-view-btn");
  const productViewBtn = document.getElementById("product-view-btn");

  // 創建新的控制面板
  const enhancedControls = document.createElement("div");
  enhancedControls.className = "enhanced-controls";

  // 左側控制組 (篩選器)
  const leftGroup = document.createElement("div");
  leftGroup.className = "control-group";

  // 券商篩選器
  const brokerFilterWrapper = document.createElement("div");
  brokerFilterWrapper.className = "enhanced-filter broker-filter-wrapper";
  if (brokerFilter) {
    brokerFilter.className = "broker-filter-select";
    brokerFilterWrapper.appendChild(brokerFilter);
  }

  // 日期篩選器
  const dateFilterWrapper = document.createElement("div");
  dateFilterWrapper.className = "enhanced-filter date-filter-wrapper";
  if (dateFilter) {
    dateFilter.className = "date-filter-select";
    dateFilterWrapper.appendChild(dateFilter);
  }

  // 顯示總計選項
  const totalCheckbox = document.createElement("div");
  totalCheckbox.className = "enhanced-checkbox";
  totalCheckbox.innerHTML = `
    <label class="inline-flex items-center">
      <input type="checkbox" id="show-totals" class="mr-2"> 
      <span>顯示總計</span>
    </label>
  `;

  leftGroup.appendChild(brokerFilterWrapper);
  leftGroup.appendChild(dateFilterWrapper);
  leftGroup.appendChild(totalCheckbox);

  // 右側控制組 (視圖切換和下載)
  const rightGroup = document.createElement("div");
  rightGroup.className = "control-group";

  // 視圖切換按鈕
  const viewButtons = document.createElement("div");
  viewButtons.className = "view-buttons hidden md:flex";

  // 重新創建視圖按鈕
  const newClassicBtn = document.createElement("button");
  newClassicBtn.id = "classic-view-btn";
  newClassicBtn.className = "view-button active";
  newClassicBtn.innerHTML = '<i class="fas fa-th-list"></i> 經典視圖';

  const newProductBtn = document.createElement("button");
  newProductBtn.id = "product-view-btn";
  newProductBtn.className = "view-button";
  newProductBtn.innerHTML = '<i class="fas fa-table"></i> 產品視圖';

  viewButtons.appendChild(newClassicBtn);
  viewButtons.appendChild(newProductBtn);

  // 下載選單
  const downloadMenu = document.createElement("div");
  downloadMenu.className = "download-menu";
  downloadMenu.innerHTML = `
    <button class="download-button">
      <i class="fas fa-download"></i> 下載表格
    </button>
    <div class="download-options">
      <div class="download-option" data-format="csv">
        <i class="fas fa-file-csv"></i> CSV 格式
      </div>
      <div class="download-option" data-format="excel">
        <i class="fas fa-file-excel"></i> Excel 格式
      </div>
      <div class="download-option" data-format="pdf">
        <i class="fas fa-file-pdf"></i> PDF 格式
      </div>
    </div>
  `;

  rightGroup.appendChild(viewButtons);
  rightGroup.appendChild(downloadMenu);

  // 將左右控制組添加到面板
  enhancedControls.appendChild(leftGroup);
  enhancedControls.appendChild(rightGroup);

  // 獲取表格容器
  const tableWrapper = document.querySelector(".classic-view-table");
  if (tableWrapper && tableWrapper.parentNode) {
    // 替換原有控制面板
    tableWrapper.parentNode.insertBefore(enhancedControls, tableWrapper);

    // 移除原有控制元素
    if (originalFilter.parentNode) {
      originalFilter.parentNode.removeChild(originalFilter);
    }
    if (originalButtons.parentNode) {
      originalButtons.parentNode.removeChild(originalButtons);
    }
  }
}

// 初始化產品表格視圖
function initProductTableView() {
  // 檢查產品視圖容器是否已存在
  let productContainer = document.getElementById("product-table-container");

  // 如果不存在，創建一個新的
  if (!productContainer) {
    productContainer = document.createElement("div");
    productContainer.id = "product-table-container";
    productContainer.className = "product-table-container hidden";

    // 添加調整手柄
    const resizeHandle = document.createElement("div");
    resizeHandle.className = "resize-handle";
    productContainer.appendChild(resizeHandle);

    // 獲取原始表格容器並插入產品視圖容器
    const classicTable = document.querySelector(".classic-view-table");
    if (classicTable && classicTable.parentNode) {
      classicTable.parentNode.insertBefore(
        productContainer,
        classicTable.nextSibling
      );
    }
  }

  // 獲取表格數據
  const tableData = extractTableData();

  // 如果有足夠的數據，生成產品視圖表格
  if (tableData && tableData.length > 0) {
    generateProductTableView(tableData, productContainer);
  }
}

// 從原始表格提取數據
function extractTableData() {
  const data = [];
  const table = document.getElementById("csv-table");

  if (!table) return data;

  // 獲取所有行
  const rows = table.querySelectorAll("tbody tr");

  // 遍歷每一行
  rows.forEach((row) => {
    const rowData = {};

    // 獲取券商名
    const brokerCell = row.querySelector("td:first-child");
    if (brokerCell) {
      rowData.broker = brokerCell.textContent.trim();
    }

    // 獲取產品名
    const productCell = row.querySelector("td:nth-child(2)");
    if (productCell) {
      rowData.product = productCell.querySelector("span")
        ? productCell.querySelector("span").textContent.trim()
        : productCell.textContent.trim();
    }

    // 獲取責任額
    const amountCell = row.querySelector("td:nth-child(3)");
    if (amountCell) {
      rowData.amount = parseInt(amountCell.textContent.trim());
    }

    // 獲取募集期間
    const periodCell = row.querySelector("td:nth-child(4)");
    if (periodCell) {
      rowData.period = periodCell.textContent.trim();
    }

    // 添加到數據陣列
    if (rowData.broker && rowData.product && !isNaN(rowData.amount)) {
      data.push(rowData);
    }
  });

  return data;
}

// 生成產品視圖表格
function generateProductTableView(data, container) {
  // 獲取所有唯一的產品和券商
  const products = [...new Set(data.map((item) => item.product))].sort();
  const brokers = [...new Set(data.map((item) => item.broker))].sort();

  // 創建表格HTML
  let tableHTML = `
    <table class="product-based-table">
      <thead>
        <tr>
          <th>產品</th>
          ${brokers.map((broker) => `<th>${broker}</th>`).join("")}
          <th>平均責任額</th>
        </tr>
      </thead>
      <tbody>
  `;

  // 填充表格內容
  products.forEach((product) => {
    const productData = data.filter((item) => item.product === product);

    tableHTML += `<tr><td>${product}</td>`;

    // 對每個券商尋找匹配數據
    let totalAmount = 0;
    let brokerCount = 0;

    brokers.forEach((broker) => {
      const match = data.find(
        (item) => item.product === product && item.broker === broker
      );
      if (match) {
        tableHTML += `<td class="highlight-data">${match.amount}</td>`;
        totalAmount += match.amount;
        brokerCount++;
      } else {
        tableHTML += `<td>-</td>`;
      }
    });

    // 添加平均值
    const average = brokerCount > 0 ? Math.round(totalAmount / brokerCount) : 0;
    tableHTML += `<td class="total-cell">${average}</td></tr>`;
  });

  // 添加總計行
  tableHTML += `
      <tr class="total-row">
        <td><strong>總責任額</strong></td>
  `;

  // 計算每家券商的總責任額
  brokers.forEach((broker) => {
    const brokerData = data.filter((item) => item.broker === broker);
    const total = brokerData.reduce((sum, item) => sum + item.amount, 0);
    tableHTML += `<td class="total-cell">${total}</td>`;
  });

  // 添加全部平均值
  const grandTotal = data.reduce((sum, item) => sum + item.amount, 0);
  const brokerProducts = data.length;
  const grandAverage =
    brokerProducts > 0 ? Math.round(grandTotal / brokerProducts) : 0;

  tableHTML += `<td class="total-cell">${grandAverage}</td></tr>`;

  // 關閉表格標籤
  tableHTML += `
      </tbody>
    </table>
  `;

  // 將表格HTML添加到容器中
  if (container) {
    // 保留原有的調整手柄
    const resizeHandle = container.querySelector(".resize-handle");
    container.innerHTML = tableHTML;
    if (resizeHandle) {
      container.appendChild(resizeHandle);
    }
  }

  // 初始化排序功能
  initProductTableSorting();
}

// 初始化產品表格排序功能
function initProductTableSorting() {
  const productTable = document.querySelector(".product-based-table");
  if (!productTable) return;

  // 為表頭添加排序功能
  const headers = productTable.querySelectorAll("thead th");
  headers.forEach((header, index) => {
    header.style.cursor = "pointer";

    // 添加排序指示器
    const sortIndicator = document.createElement("span");
    sortIndicator.className = "sort-indicator";
    header.appendChild(sortIndicator);

    // 添加點擊事件
    header.addEventListener("click", () => {
      sortProductTable(index);
    });
  });
}

// 產品表格排序功能
function sortProductTable(columnIndex) {
  const productTable = document.querySelector(".product-based-table");
  if (!productTable) return;

  const tbody = productTable.querySelector("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr:not(.total-row)"));
  const headers = productTable.querySelectorAll("thead th");

  // 排序方向邏輯
  let sortDirection = "asc";
  const currentHeader = headers[columnIndex];

  if (currentHeader.classList.contains("sort-asc")) {
    sortDirection = "desc";
    currentHeader.classList.remove("sort-asc");
    currentHeader.classList.add("sort-desc");
  } else if (currentHeader.classList.contains("sort-desc")) {
    sortDirection = "asc";
    currentHeader.classList.remove("sort-desc");
    currentHeader.classList.add("sort-asc");
  } else {
    // 重置所有表頭的排序類
    headers.forEach((header) => {
      header.classList.remove("sort-asc", "sort-desc");
    });
    currentHeader.classList.add("sort-asc");
  }

  // 排序邏輯
  rows.sort((rowA, rowB) => {
    const cellA = rowA.querySelectorAll("td")[columnIndex].textContent;
    const cellB = rowB.querySelectorAll("td")[columnIndex].textContent;

    // 處理數字與文字排序
    if (columnIndex === 0) {
      // 產品名稱 - 字串比較
      return sortDirection === "asc"
        ? cellA.localeCompare(cellB, "zh-TW")
        : cellB.localeCompare(cellA, "zh-TW");
    } else {
      // 責任額 - 數字比較
      const numA = cellA === "-" ? 0 : parseInt(cellA);
      const numB = cellB === "-" ? 0 : parseInt(cellB);
      return sortDirection === "asc" ? numA - numB : numB - numA;
    }
  });

  // 重新添加排序後的行
  rows.forEach((row) => {
    tbody.appendChild(row);
  });

  // 確保總計行保持在底部
  const totalRow = tbody.querySelector(".total-row");
  if (totalRow) {
    tbody.appendChild(totalRow);
  }
}

// 設置視圖切換
function setupViewToggle() {
  // 獲取視圖切換按鈕
  const classicViewBtn = document.getElementById("classic-view-btn");
  const productViewBtn = document.getElementById("product-view-btn");

  // 獲取表格容器
  const classicTable = document.querySelector(".classic-view-table");
  const productTable = document.getElementById("product-table-container");

  if (!classicViewBtn || !productViewBtn || !classicTable || !productTable)
    return;

  // 添加經典視圖按鈕點擊事件
  classicViewBtn.addEventListener("click", () => {
    classicTable.classList.remove("hidden");
    productTable.classList.add("hidden");
    classicViewBtn.classList.add("active");
    productViewBtn.classList.remove("active");
  });

  // 添加產品視圖按鈕點擊事件
  productViewBtn.addEventListener("click", () => {
    classicTable.classList.add("hidden");
    productTable.classList.remove("hidden");
    classicViewBtn.classList.remove("active");
    productViewBtn.classList.add("active");

    // 確保產品表格已經初始化
    if (productTable.querySelectorAll("table").length === 0) {
      const tableData = extractTableData();
      if (tableData && tableData.length > 0) {
        generateProductTableView(tableData, productTable);
      }
    }
  });
}

function createDataStats() {
  // 解析原始 csvData
  const parsed = csvData.map((row) => ({
    broker: row[0],
    product: row[1],
    amount: Number(row[2]) || 0,
  }));

  // 計算指標
  const rawTotal = parsed.reduce((sum, r) => sum + r.amount, 0);
  const brokerCount = new Set(parsed.map((r) => r.broker)).size;
  const productCount = new Set(parsed.map((r) => r.product)).size;
  const avgAmount = brokerCount > 0 ? Math.round(rawTotal / brokerCount) : 0;

  // 萬→億換算
  let totalTarget, totalUnit;
  if (rawTotal >= 10000) {
    totalTarget = (rawTotal / 10000).toFixed(2); // 保留兩位小數
    totalUnit = "億";
  } else {
    totalTarget = rawTotal;
    totalUnit = "萬";
  }
  const threshold = totalUnit === "億" ? 1 : 10000;

  // 生成卡片 HTML（使用原始彩色 ICON + 數字動畫）
  const statsHTML = `
  <div class="stats-grid grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-6">
    <!-- 總責任額 -->
    <div class="p-4 bg-white rounded shadow">
      <i class="fas fa-hand-holding-usd fa-2x text-blue-600 mb-2"></i>
      <p class="text-2xl font-bold">
        <span 
          class="counter" 
          data-target="${totalTarget}" 
          data-unit="${totalUnit}" 
          data-threshold="${threshold}" 
          data-decimals="${totalUnit === "億" ? 2 : 0}"
        >0</span><span>${totalUnit}</span>
      </p>
      <span class="text-sm text-gray-500">總責任額</span>
    </div>
    <!-- 券商數量 -->
    <div class="p-4 bg-white rounded shadow">
      <i class="fas fa-building fa-2x text-green-600 mb-2"></i>
      <p class="text-2xl font-bold">
        <span 
          class="counter" 
          data-target="${brokerCount}" 
          data-threshold="${brokerCount}" 
          data-decimals="0"
        >0</span>
      </p>
      <span class="text-sm text-gray-500">券商數量</span>
    </div>
    <!-- 產品數量 -->
    <div class="p-4 bg-white rounded shadow">
      <i class="fas fa-cubes fa-2x text-yellow-600 mb-2"></i>
      <p class="text-2xl font-bold">
        <span 
          class="counter" 
          data-target="${productCount}" 
          data-threshold="${productCount}" 
          data-decimals="0"
        >0</span>
      </p>
      <span class="text-sm text-gray-500">產品數量</span>
    </div>
    <!-- 平均責任額 -->
    <div class="p-4 bg-white rounded shadow">
      <i class="fas fa-balance-scale fa-2x text-red-600 mb-2"></i>
      <p class="text-2xl font-bold">
        <span 
          class="counter" 
          data-target="${avgAmount}" 
          data-threshold="${avgAmount}" 
          data-decimals="0"
        >0</span><span>萬</span>
      </p>
      <span class="text-sm text-gray-500">平均責任額</span>
    </div>
  </div>
  `;

  // 移除舊版並插入新版
  const old = document.querySelector(".stats-grid");
  if (old) old.remove();
  const container =
    document.querySelector(".table-wrapper")?.parentNode || document.body;
  container.insertAdjacentHTML("beforeend", statsHTML);

  // 啟動數字動畫
  animateCounters();
}

/**
 * animateCounters - 使用 IntersectionObserver，滑入才開始
 */
function animateCounters() {
  const counters = document.querySelectorAll(".counter");
  const duration = 2000; // 動畫總時長 ms

  if (!("IntersectionObserver" in window)) {
    counters.forEach((counter) => runCounter(counter));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => observer.observe(counter));

  function runCounter(counter) {
    const rawTarget = parseFloat(counter.dataset.target) || 0;
    const decimals = parseInt(counter.dataset.decimals, 10) || 0;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      let value = progress * rawTarget;

      // 處理小數或整數顯示，並用千分位格式
      if (decimals > 0) {
        const fixed = value.toFixed(decimals);
        counter.textContent = Number(fixed).toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
      } else {
        const intVal = Math.floor(value);
        counter.textContent = intVal.toLocaleString();
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }
}

// 在 DOMContentLoaded 時呼叫一次，確保掛載 observer
document.addEventListener("DOMContentLoaded", () => {
  animateCounters();
});

// 添加版權說明
function addAttribution() {
  // 創建版權說明元素
  const attribution = document.createElement("div");
  attribution.className = "data-attribution";
  attribution.innerHTML = `
    <p>數據來源：社群成員提供的內部文件截圖。本數據可供媒體及研究機構參考使用，使用時請註明來源為「#終結IPO制度暴力調查網站」。</p>
    <p>最後更新日期：2025年5月13日</p>
  `;

  // 添加到數據區塊底部
  const dataSection = document.querySelector("#data .max-w-content");
  if (dataSection) {
    dataSection.appendChild(attribution);
  }
}

// 設置表格高度調整功能
function setupResizeHandle() {
  const productTable = document.getElementById("product-table-container");
  const resizeHandle = productTable
    ? productTable.querySelector(".resize-handle")
    : null;

  if (!productTable || !resizeHandle) return;

  let startY, startHeight;

  // 鼠標按下事件
  resizeHandle.addEventListener("mousedown", (e) => {
    startY = e.clientY;
    startHeight = parseInt(
      document.defaultView.getComputedStyle(productTable).height,
      10
    );

    // 添加鼠標移動和松開事件
    document.addEventListener("mousemove", resizeMove);
    document.addEventListener("mouseup", resizeStop);

    // 防止選中文字
    e.preventDefault();
  });

  // 鼠標移動事件
  function resizeMove(e) {
    const newHeight = startHeight + e.clientY - startY;

    // 限制最小高度
    if (newHeight >= 200) {
      productTable.style.height = `${newHeight}px`;
    }
  }

  // 鼠標松開事件
  function resizeStop() {
    document.removeEventListener("mousemove", resizeMove);
    document.removeEventListener("mouseup", resizeStop);
  }
}

// 設置下載選項
function setupDownloadOptions() {
  // 獲取下載按鈕和選項
  const downloadMenu = document.querySelector(".download-menu");
  if (!downloadMenu) return;

  const downloadOptions = downloadMenu.querySelectorAll(".download-option");

  // 為每個選項添加點擊事件
  downloadOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const format = option.getAttribute("data-format");
      downloadTable(format);
    });
  });
}

// 下載表格功能
function downloadTable(format) {
  // 獲取當前活動的表格視圖
  const isProductView = document
    .getElementById("product-view-btn")
    .classList.contains("active");
  const tableData = extractTableData();

  // 根據格式處理下載
  switch (format) {
    case "csv":
      downloadCSV(tableData, isProductView);
      break;
    case "excel":
      downloadExcel(tableData, isProductView);
      break;
    case "pdf":
      downloadPDF(tableData, isProductView);
      break;
  }
}

// 下載CSV格式
function downloadCSV(data, isProductView) {
  if (isProductView) {
    // 產品視圖格式
    const products = [...new Set(data.map((item) => item.product))].sort();
    const brokers = [...new Set(data.map((item) => item.broker))].sort();

    // 創建CSV標頭
    let csvContent = "產品," + brokers.join(",") + ",平均責任額\n";

    // 為每個產品創建一行
    products.forEach((product) => {
      let row = [product];

      // 獲取每個券商的責任額
      let totalAmount = 0;
      let brokerCount = 0;

      brokers.forEach((broker) => {
        const match = data.find(
          (item) => item.product === product && item.broker === broker
        );
        if (match) {
          row.push(match.amount);
          totalAmount += match.amount;
          brokerCount++;
        } else {
          row.push("-");
        }
      });

      // 添加平均值
      const average =
        brokerCount > 0 ? Math.round(totalAmount / brokerCount) : 0;
      row.push(average);

      // 添加到CSV內容
      csvContent += row.join(",") + "\n";
    });

    // 添加總計行
    let totalRow = ["總責任額"];

    // 計算每家券商的總責任額
    brokers.forEach((broker) => {
      const brokerData = data.filter((item) => item.broker === broker);
      const total = brokerData.reduce((sum, item) => sum + item.amount, 0);
      totalRow.push(total);
    });

    // 添加全部平均值
    const grandTotal = data.reduce((sum, item) => sum + item.amount, 0);
    const brokerProducts = data.length;
    const grandAverage =
      brokerProducts > 0 ? Math.round(grandTotal / brokerProducts) : 0;
    totalRow.push(grandAverage);

    csvContent += totalRow.join(",");

    // 下載CSV文件
    downloadFile(csvContent, "ETF責任額數據_產品視圖.csv", "text/csv");
  } else {
    // 經典視圖格式
    let csvContent = "券商,產品,責任額,募集期間\n";

    // 添加每行數據
    data.forEach((item) => {
      csvContent += `${item.broker},${item.product},${item.amount},${item.period}\n`;
    });

    // 下載CSV文件
    downloadFile(csvContent, "ETF責任額數據_經典視圖.csv", "text/csv");
  }
}

// 下載Excel格式 (使用CSV作為Excel可以打開的文件)
function downloadExcel(data, isProductView) {
  // 由於瀏覽器環境無法直接生成Excel，我們使用CSV作為替代
  // 添加BOM來確保Excel正確識別UTF-8編碼
  const BOM = "\uFEFF";

  if (isProductView) {
    // 產品視圖格式
    const products = [...new Set(data.map((item) => item.product))].sort();
    const brokers = [...new Set(data.map((item) => item.broker))].sort();

    // 創建CSV標頭
    let csvContent = BOM + "產品," + brokers.join(",") + ",平均責任額\n";

    // 為每個產品創建一行
    products.forEach((product) => {
      let row = [product];

      // 獲取每個券商的責任額
      let totalAmount = 0;
      let brokerCount = 0;

      brokers.forEach((broker) => {
        const match = data.find(
          (item) => item.product === product && item.broker === broker
        );
        if (match) {
          row.push(match.amount);
          totalAmount += match.amount;
          brokerCount++;
        } else {
          row.push("-");
        }
      });

      // 添加平均值
      const average =
        brokerCount > 0 ? Math.round(totalAmount / brokerCount) : 0;
      row.push(average);

      // 添加到CSV內容
      csvContent += row.join(",") + "\n";
    });

    // 添加總計行
    let totalRow = ["總責任額"];

    // 計算每家券商的總責任額
    brokers.forEach((broker) => {
      const brokerData = data.filter((item) => item.broker === broker);
      const total = brokerData.reduce((sum, item) => sum + item.amount, 0);
      totalRow.push(total);
    });

    // 添加全部平均值
    const grandTotal = data.reduce((sum, item) => sum + item.amount, 0);
    const brokerProducts = data.length;
    const grandAverage =
      brokerProducts > 0 ? Math.round(grandTotal / brokerProducts) : 0;
    totalRow.push(grandAverage);

    csvContent += totalRow.join(",");

    // 下載CSV文件 (Excel可以打開)
    downloadFile(
      csvContent,
      "ETF責任額數據_產品視圖.xlsx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  } else {
    // 經典視圖格式
    let csvContent = BOM + "券商,產品,責任額,募集期間\n";

    // 添加每行數據
    data.forEach((item) => {
      csvContent += `${item.broker},${item.product},${item.amount},${item.period}\n`;
    });

    // 下載CSV文件 (Excel可以打開)
    downloadFile(
      csvContent,
      "ETF責任額數據_經典視圖.xlsx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  }
}

// 下載PDF格式 (使用HTML轉換方法)
function downloadPDF(data, isProductView) {
  // 顯示提示訊息，因為瀏覽器無法直接生成PDF
  alert(
    "提示：由於瀏覽器限制，無法直接產生PDF。\n\n請選擇下載Excel或CSV格式，然後使用Excel等軟體轉換為PDF。"
  );
}

// 通用下載文件函數
function downloadFile(content, fileName, mimeType) {
  // 創建Blob對象
  const blob = new Blob([content], { type: mimeType });

  // 創建下載連結
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName;

  // 觸發點擊事件
  document.body.appendChild(link);
  link.click();

  // 清理
  document.body.removeChild(link);
  window.URL.revokeObjectURL(link.href);
}

// 初始化增強型表格
initEnhancedTable();
