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

// 在文件開頭添加 SheetJS 檢查和載入邏輯
function loadSheetJS() {
  return new Promise((resolve, reject) => {
    if (window.XLSX) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js";
    script.integrity =
      "sha384-JoVUgRwWGZRMqz5JDhPGQOYPm5v8Vj5oQJZgQ1nJCT0PI5g3Ot2wNQOrVgPD4qhw";
    script.crossOrigin = "anonymous";
    script.onload = resolve;
    script.onerror = () => reject(new Error("無法載入 SheetJS 庫"));
    document.head.appendChild(script);
  });
}

// 修改初始化函數
async function initEnhancedTable() {
  try {
    await loadSheetJS();
    console.log("SheetJS 庫載入成功");
  } catch (error) {
    console.error("SheetJS 載入失敗:", error);
    alert("Excel 下載功能暫時無法使用，請稍後再試");
  }

  // 注入 CSS 樣式
  injectCSS();

  // 等待表格容器準備好
  const checkInterval = setInterval(() => {
    if (document.querySelector("#csv-table_wrapper")) {
      clearInterval(checkInterval);
      enhanceTableInterface();
    }
  }, 100);
}

// 增強表格界面
function enhanceTableInterface() {
  createEnhancedControls();
  initProductTableView();
  createDataStats();
  addAttribution();
  setupResizeHandle();
  setupDownloadOptions();
}

// 創建增強型控制面板
function createEnhancedControls() {
  const tableWrapper = document.querySelector(".classic-view-table");
  if (!tableWrapper) {
    console.error("找不到表格容器，無法創建控制面板");
    return;
  }

  const originalFilter = document.querySelector(".filter-controls");
  const originalButtons = document.querySelector(".view-buttons");

  if (!originalFilter || !originalButtons) return;

  const brokerFilter = document.getElementById("broker-filter");
  const dateFilter = document.getElementById("date-filter");

  const enhancedControls = document.createElement("div");
  enhancedControls.className = "enhanced-controls";

  // 左側控制組 (篩選器)
  const leftGroup = document.createElement("div");
  leftGroup.className = "control-group";

  const brokerFilterWrapper = document.createElement("div");
  brokerFilterWrapper.className = "enhanced-filter broker-filter-wrapper";
  if (brokerFilter) {
    brokerFilter.className = "broker-filter-select";
    brokerFilterWrapper.appendChild(brokerFilter);
  }

  const dateFilterWrapper = document.createElement("div");
  dateFilterWrapper.className = "enhanced-filter date-filter-wrapper";
  if (dateFilter) {
    dateFilter.className = "date-filter-select";
    dateFilterWrapper.appendChild(dateFilter);
  }

  const totalCheckbox = document.createElement("div");
  totalCheckbox.className = "enhanced-checkbox";
  totalCheckbox.innerHTML = `
    <label class="inline-flex items-center">
      <input type="checkbox" id="show-totals" class="mr-2"> 
      <span></span>
    </label>
  `;

  leftGroup.appendChild(brokerFilterWrapper);
  leftGroup.appendChild(dateFilterWrapper);
  leftGroup.appendChild(totalCheckbox);

  // 右側控制組 (視圖切換和下載)
  const rightGroup = document.createElement("div");
  rightGroup.className = "control-group";

  const viewButtons = document.createElement("div");
  viewButtons.className = "view-buttons hidden md:flex";

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

  const downloadMenu = document.createElement("div");
  downloadMenu.className = "download-menu";
  downloadMenu.innerHTML = `
    <button class="download-button" aria-label="下載表格">
      <i class="fas fa-download"></i> <span class="hidden md:inline">下載表格</span>
    </button>
  `;

  rightGroup.appendChild(viewButtons);
  rightGroup.appendChild(downloadMenu);

  enhancedControls.appendChild(leftGroup);
  enhancedControls.appendChild(rightGroup);

  tableWrapper.parentNode.insertBefore(enhancedControls, tableWrapper);

  if (originalFilter.parentNode)
    originalFilter.parentNode.removeChild(originalFilter);
  if (originalButtons.parentNode)
    originalButtons.parentNode.removeChild(originalButtons);

  // 重掛視圖切換事件
  setupViewToggle();
}

// 初始化產品表格視圖
function initProductTableView() {
  let productContainer = document.getElementById("product-table-container");
  if (!productContainer) {
    productContainer = document.createElement("div");
    productContainer.id = "product-table-container";
    productContainer.className = "product-table-container hidden";

    const resizeHandle = document.createElement("div");
    resizeHandle.className = "resize-handle";
    productContainer.appendChild(resizeHandle);

    const classicTable = document.querySelector(".classic-view-table");
    if (classicTable && classicTable.parentNode) {
      classicTable.parentNode.insertBefore(
        productContainer,
        classicTable.nextSibling
      );
    }
  }

  const tableData = extractTableData();
  if (tableData && tableData.length > 0) {
    generateProductTableView(tableData, productContainer);
  }
}

// 從原始表格提取數據
function extractTableData() {
  const data = [];
  const table = document.getElementById("csv-table");
  if (!table) return data;

  const rows = table.querySelectorAll("tbody tr");
  rows.forEach((row) => {
    const rowData = {};
    const brokerCell = row.querySelector("td:first-child");
    if (brokerCell) rowData.broker = brokerCell.textContent.trim();

    const productCell = row.querySelector("td:nth-child(2)");
    if (productCell) {
      rowData.product = productCell.querySelector("span")
        ? productCell.querySelector("span").textContent.trim()
        : productCell.textContent.trim();
    }

    const amountCell = row.querySelector("td:nth-child(3)");
    if (amountCell)
      rowData.amount = parseInt(amountCell.textContent.trim()) || 0;

    const periodCell = row.querySelector("td:nth-child(4)");
    if (periodCell) rowData.period = periodCell.textContent.trim();

    if (rowData.broker && rowData.product && !isNaN(rowData.amount)) {
      data.push(rowData);
    }
  });
  return data;
}

// 生成產品視圖表格
function generateProductTableView(data, container) {
  const products = [...new Set(data.map((item) => item.product))].sort();
  const brokers = [...new Set(data.map((item) => item.broker))].sort();

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

  products.forEach((product) => {
    const productData = data.filter((item) => item.product === product);
    tableHTML += `<tr><td>${product}</td>`;
    let totalAmount = 0,
      brokerCount = 0;

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

    const average = brokerCount > 0 ? Math.round(totalAmount / brokerCount) : 0;
    tableHTML += `<td class="total-cell">${average}</td></tr>`;
  });

  tableHTML += `<tr class="total-row"><td><strong>總責任額</strong></td>`;
  brokers.forEach((broker) => {
    const brokerData = data.filter((item) => item.broker === broker);
    const total = brokerData.reduce((sum, item) => sum + item.amount, 0);
    tableHTML += `<td class="total-cell">${total}</td>`;
  });

  const grandTotal = data.reduce((sum, item) => sum + item.amount, 0);
  const brokerProducts = data.length;
  const grandAverage =
    brokerProducts > 0 ? Math.round(grandTotal / brokerProducts) : 0;
  tableHTML += `<td class="total-cell">${grandAverage}</td></tr></tbody></table>`;

  const resizeHandle = container.querySelector(".resize-handle");
  container.innerHTML = tableHTML;
  if (resizeHandle) container.appendChild(resizeHandle);

  initProductTableSorting();
}

// 初始化產品表格排序功能
function initProductTableSorting() {
  const productTable = document.querySelector(".product-based-table");
  if (!productTable) return;

  const headers = productTable.querySelectorAll("thead th");
  headers.forEach((header, index) => {
    header.style.cursor = "pointer";
    const sortIndicator = document.createElement("span");
    sortIndicator.className = "sort-indicator";
    header.appendChild(sortIndicator);

    header.addEventListener("click", () => sortProductTable(index));
  });
}

// 產品表格排序功能
function sortProductTable(columnIndex) {
  const productTable = document.querySelector(".product-based-table");
  if (!productTable) return;

  const tbody = productTable.querySelector("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr:not(.total-row)"));
  const headers = productTable.querySelectorAll("thead th");

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
    headers.forEach((header) =>
      header.classList.remove("sort-asc", "sort-desc")
    );
    currentHeader.classList.add("sort-asc");
  }

  rows.sort((rowA, rowB) => {
    const cellA = rowA.querySelectorAll("td")[columnIndex].textContent;
    const cellB = rowB.querySelectorAll("td")[columnIndex].textContent;

    if (columnIndex === 0) {
      return sortDirection === "asc"
        ? cellA.localeCompare(cellB, "zh-TW")
        : cellB.localeCompare(cellA, "zh-TW");
    } else {
      const numA = cellA === "-" ? 0 : parseInt(cellA);
      const numB = cellB === "-" ? 0 : parseInt(cellB);
      return sortDirection === "asc" ? numA - numB : numB - numA;
    }
  });

  rows.forEach((row) => tbody.appendChild(row));
  const totalRow = tbody.querySelector(".total-row");
  if (totalRow) tbody.appendChild(totalRow);
}

// 設置視圖切換
function setupViewToggle() {
  const classicViewBtn = document.getElementById("classic-view-btn");
  const productViewBtn = document.getElementById("product-view-btn");
  const classicTable = document.querySelector(".classic-view-table");
  const productTable = document.getElementById("product-table-container");

  if (!classicViewBtn || !productViewBtn || !classicTable || !productTable)
    return;

  classicViewBtn.addEventListener("click", () => {
    classicTable.classList.remove("hidden");
    productTable.classList.add("hidden");
    classicViewBtn.classList.add("active");
    productViewBtn.classList.remove("active");
  });

  productViewBtn.addEventListener("click", () => {
    classicTable.classList.add("hidden");
    productTable.classList.remove("hidden");
    classicViewBtn.classList.remove("active");
    productViewBtn.classList.add("active");

    if (productTable.querySelectorAll("table").length === 0) {
      const tableData = extractTableData();
      if (tableData && tableData.length > 0) {
        generateProductTableView(tableData, productTable);
      }
    }
  });
}

// 創建數據統計
function createDataStats() {
  if (!window.csvData || window.csvData.length === 0) {
    console.error("csvData 未初始化，無法生成統計數據");
    return;
  }

  const parsed = window.csvData.map((row) => ({
    broker: row[0],
    product: row[1],
    amount: Number(row[2]) || 0,
  }));

  const rawTotal = parsed.reduce((sum, r) => sum + r.amount, 0);
  const brokerCount = new Set(parsed.map((r) => r.broker)).size;
  const productCount = new Set(parsed.map((r) => r.product)).size;
  const avgAmount = brokerCount > 0 ? Math.round(rawTotal / brokerCount) : 0;

  let totalTarget, totalUnit;
  if (rawTotal >= 10000) {
    totalTarget = (rawTotal / 10000).toFixed(2);
    totalUnit = "億";
  } else {
    totalTarget = rawTotal;
    totalUnit = "萬";
  }
  const threshold = totalUnit === "億" ? 1 : 10000;

  const statsHTML = `
    <div class="stats-grid grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-6">
      <div class="p-4 bg-white rounded shadow">
        <i class="fas fa-hand-holding-usd fa-2x text-blue-600 mb-2"></i>
        <p class="text-2xl font-bold">
          <span class="counter" data-target="${totalTarget}" data-unit="${totalUnit}" data-threshold="${threshold}" data-decimals="${
    totalUnit === "億" ? 2 : 0
  }">0</span><span>${totalUnit}</span>
        </p>
        <span class="text-sm text-gray-500">總責任額</span>
      </div>
      <div class="p-4 bg-white rounded shadow">
        <i class="fas fa-building fa-2x text-green-600 mb-2"></i>
        <p class="text-2xl font-bold">
          <span class="counter" data-target="${brokerCount}" data-threshold="${brokerCount}" data-decimals="0">0</span>
        </p>
        <span class="text-sm text-gray-500">券商數量</span>
      </div>
      <div class="p-4 bg-white rounded shadow">
        <i class="fas fa-cubes fa-2x text-yellow-600 mb-2"></i>
        <p class="text-2xl font-bold">
          <span class="counter" data-target="${productCount}" data-threshold="${productCount}" data-decimals="0">0</span>
        </p>
        <span class="text-sm text-gray-500">產品數量</span>
      </div>
      <div class="p-4 bg-white rounded shadow">
        <i class="fas fa-balance-scale fa-2x text-red-600 mb-2"></i>
        <p class="text-2xl font-bold">
          <span class="counter" data-target="${avgAmount}" data-threshold="${avgAmount}" data-decimals="0">0</span><span>萬</span>
        </p>
        <span class="text-sm text-gray-500">平均責任額</span>
      </div>
    </div>
  `;

  const old = document.querySelector(".stats-grid");
  if (old) old.remove();
  const container =
    document.querySelector(".table-wrapper")?.parentNode || document.body;
  container.insertAdjacentHTML("beforeend", statsHTML);

  animateCounters();
}

// 動畫計數器
function animateCounters() {
  const counters = document.querySelectorAll(".counter");
  const duration = 2000;

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

      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }
}

// 添加版權說明
function addAttribution() {
  const attribution = document.createElement("div");
  attribution.className = "data-attribution";
  attribution.innerHTML = `
    <p>數據來源：社群成員提供的內部文件截圖。本數據可供媒體及研究機構參考使用，使用時請註明來源為「#終結IPO制度暴力調查網站」。</p>
    <p>最後更新日期：2025年5月16日</p>
  `;

  const dataSection = document.querySelector("#data .max-w-content");
  if (dataSection) dataSection.appendChild(attribution);
}

// 設置表格高度調整功能
function setupResizeHandle() {
  const productTable = document.getElementById("product-table-container");
  const resizeHandle = productTable?.querySelector(".resize-handle");
  if (!productTable || !resizeHandle) return;

  let startY, startHeight;

  resizeHandle.addEventListener("mousedown", (e) => {
    startY = e.clientY;
    startHeight = parseInt(
      document.defaultView.getComputedStyle(productTable).height,
      10
    );

    document.addEventListener("mousemove", resizeMove);
    document.addEventListener("mouseup", resizeStop);
    e.preventDefault();
  });

  function resizeMove(e) {
    const newHeight = startHeight + e.clientY - startY;
    if (newHeight >= 200) productTable.style.height = `${newHeight}px`;
  }

  function resizeStop() {
    document.removeEventListener("mousemove", resizeMove);
    document.removeEventListener("mouseup", resizeStop);
  }
}

// 創建下載模態窗
function createDownloadModal() {
  const modalStyle = document.createElement("style");
  modalStyle.textContent = `
    .download-modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      align-items: center;
      justify-content: center;
    }

    .download-modal.show {
      display: flex;
      animation: modalFadeIn 0.3s ease-out;
    }

    @keyframes modalFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .download-modal-content {
      background: white;
      border-radius: 16px;
      width: 90%;
      max-width: 340px;
      position: relative;
      overflow: hidden;
      transform: translateY(20px);
      opacity: 0;
      animation: modalSlideIn 0.3s ease-out forwards;
      animation-delay: 0.1s;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    @keyframes modalSlideIn {
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      background: var(--primary-color);
      padding: 2rem 1rem;
      text-align: center;
      position: relative;
    }

    .icon-wrapper {
      width: 56px;
      height: 56px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .icon-wrapper i {
      font-size: 28px;
      color: var(--primary-color);
    }

    .modal-body {
      padding: 1.5rem 1.25rem;
    }

    .modal-body h3 {
      font-size: 1.25rem;
      font-weight: bold;
      color: #2d3748;
      margin-bottom: 0.5rem;
      text-align: center;
    }

    .modal-body p {
      color: #718096;
      margin-bottom: 1.25rem;
      text-align: center;
      font-size: 0.875rem;
    }

    .download-options-grid {
      display: grid;
      gap: 0.75rem;
    }

    .download-option-button {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: white;
      width: 100%;
      text-align: left;
      transition: all 0.2s;
      cursor: pointer;
    }

    .download-option-button:hover {
      border-color: var(--primary-color);
      background: #fff5f5;
      transform: translateY(-1px);
    }

    .download-option-button i {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      margin-right: 0.75rem;
      font-size: 1.25rem;
      background: #f7fafc;
    }

    .download-option-button[data-format="excel"] i {
      color: #1f9d55;
    }

    .download-option-button[data-format="csv"] i {
      color: #2b6cb0;
    }

    .download-option-button[data-format="pdf"] i {
      color: #c53030;
    }

    .option-text {
      flex: 1;
    }

    .option-title {
      display: block;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 0.25rem;
      font-size: 0.9375rem;
    }

    .option-desc {
      display: block;
      font-size: 0.8125rem;
      color: #718096;
    }

    .close-modal {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: none;
      border: none;
      font-size: 1.5rem;
      color: white;
      cursor: pointer;
      padding: 0.25rem;
      line-height: 1;
      z-index: 1;
      opacity: 0.8;
      transition: opacity 0.2s;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-modal:hover {
      opacity: 1;
    }

    @media (max-width: 768px) {
      .download-modal-content {
        width: calc(100% - 2rem);
        margin: 1rem;
      }

      .modal-header {
        padding: 1.5rem 1rem;
      }

      .icon-wrapper {
        width: 48px;
        height: 48px;
      }

      .icon-wrapper i {
        font-size: 24px;
      }

      .modal-body {
        padding: 1.25rem 1rem;
      }

      .download-option-button {
        padding: 0.625rem 0.875rem;
      }

      .download-option-button i {
        width: 32px;
        height: 32px;
        font-size: 1.125rem;
      }
    }
  `;
  document.head.appendChild(modalStyle);

  const modal = document.createElement("div");
  modal.className = "download-modal";
  modal.innerHTML = `
    <div class="download-modal-content">
      <div class="modal-header">
        <div class="icon-wrapper">
          <i class="fas fa-download"></i>
        </div>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <h3>下載表格資料</h3>
        <p>請選擇您想要的下載格式：</p>
        <div class="download-options-grid">
          <button class="download-option-button" data-format="excel">
            <i class="fas fa-file-excel"></i>
            <div class="option-text">
              <span class="option-title">Excel 格式</span>
              <span class="option-desc">適合用於 Microsoft Excel 開啟</span>
            </div>
          </button>
          <button class="download-option-button" data-format="csv">
            <i class="fas fa-file-csv"></i>
            <div class="option-text">
              <span class="option-title">CSV 格式</span>
              <span class="option-desc">通用格式，支援各種表格軟體</span>
            </div>
          </button>
          <button class="download-option-button" data-format="pdf">
            <i class="fas fa-file-pdf"></i>
            <div class="option-text">
              <span class="option-title">PDF 格式</span>
              <span class="option-desc">適合列印或分享閱讀</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // 關閉按鈕事件
  const closeBtn = modal.querySelector(".close-modal");
  closeBtn.addEventListener("click", () => {
    modal.classList.remove("show");
  });

  // 點擊模態窗外部關閉
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("show");
    }
  });

  // 下載按鈕事件
  const downloadButtons = modal.querySelectorAll(".download-option-button");
  downloadButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const format = button.getAttribute("data-format");
      downloadTable(format);
      modal.classList.remove("show");
    });
  });

  return modal;
}

// 修改設置下載選項函數
function setupDownloadOptions() {
  const downloadButton = document.querySelector(".download-button");
  if (!downloadButton) return;

  const modal = createDownloadModal();

  downloadButton.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    modal.classList.add("show");
  });
}

// 下載表格功能
function downloadTable(format) {
  // 統一使用產品視圖格式下載
  const isProductView = true;

  // 使用 window.csvData 確保獲取完整數據
  const fullData = (window.csvData || []).map((item) => {
    if (Array.isArray(item)) {
      return [
        item[0],
        String(item[1]), // 確保產品編號是字串格式
        item[2],
        item[3],
      ];
    }
    return item;
  });

  switch (format) {
    case "csv":
      downloadCSV(fullData, isProductView);
      break;
    case "excel":
      downloadExcel(fullData, isProductView);
      break;
    case "pdf":
      downloadPDF(fullData, isProductView);
      break;
  }
}

// 下載 CSV 格式
function downloadCSV(data, isProductView) {
  const BOM = "\uFEFF"; // 添加 BOM 以確保正確的中文編碼
  const formatNumber = (num) => {
    if (typeof num === "number") {
      return num.toLocaleString("zh-TW");
    }
    return num;
  };

  if (isProductView) {
    const productsData = {};
    data.forEach((item) => {
      const productName = String(item[1]).padStart(5, "0"); // 確保產品編號為5位數字串
      if (!productsData[productName]) {
        productsData[productName] = {
          name: productName,
          period: item[3],
          brokers: {},
          totalAmount: 0,
          brokerCount: 0,
        };
      }
      productsData[productName].brokers[item[0]] = parseInt(item[2], 10);
      productsData[productName].totalAmount += parseInt(item[2], 10);
      productsData[productName].brokerCount++;
    });

    const sortedProducts = Object.values(productsData).sort((a, b) => {
      const avgA = a.brokerCount > 0 ? a.totalAmount / a.brokerCount : 0;
      const avgB = b.brokerCount > 0 ? b.totalAmount / b.brokerCount : 0;
      return avgB - avgA;
    });

    const uniqueBrokers = [...new Set(data.map((item) => item[0]))].sort();
    let csvContent =
      BOM + "產品,募集期間," + uniqueBrokers.join(",") + ",平均責任額\n";

    sortedProducts.forEach((product) => {
      let row = [product.name, product.period];
      let productTotalAmount = 0;
      let productBrokerCount = 0;

      uniqueBrokers.forEach((broker) => {
        const amount = product.brokers[broker];
        if (amount !== undefined) {
          row.push(formatNumber(amount));
          productTotalAmount += amount;
          productBrokerCount++;
        } else {
          row.push("-");
        }
      });

      const average =
        productBrokerCount > 0
          ? Math.round(productTotalAmount / productBrokerCount)
          : 0;
      row.push(formatNumber(average));
      csvContent +=
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",") +
        "\n";
    });

    let totalRow = ["總責任額", ""];
    uniqueBrokers.forEach((broker) => {
      const brokerTotal = data
        .filter((item) => item[0] === broker)
        .reduce((sum, item) => sum + parseInt(item[2], 10), 0);
      totalRow.push(formatNumber(brokerTotal));
    });

    const grandTotalAmount = data.reduce(
      (sum, item) => sum + parseInt(item[2], 10),
      0
    );
    const allProductEntriesCount = data.filter(
      (row) => row[2] && !isNaN(parseInt(row[2]))
    ).length;
    const finalGrandAverage =
      allProductEntriesCount > 0
        ? Math.round(grandTotalAmount / allProductEntriesCount)
        : 0;
    totalRow.push(formatNumber(finalGrandAverage));
    csvContent += totalRow
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(",");

    // 網站連結信息
    csvContent +=
      "\n\n數據來源：終結IPO制度暴力調查網站\nhttps://truth-wolf.github.io/taiwan-ipo-investigation/";

    downloadFile(
      csvContent,
      "ETF責任額數據_產品視圖.csv",
      "text/csv;charset=utf-8"
    );
  } else {
    let csvContent = BOM + "券商,產品,責任額,募集期間\n";
    data.forEach((item) => {
      if (Array.isArray(item)) {
        csvContent +=
          [
            `"${item[0]}"`,
            `"${String(item[1]).padStart(5, "0")}"`,
            `"${formatNumber(parseInt(item[2], 10))}"`,
            `"${item[3]}"`,
          ].join(",") + "\n";
      } else {
        csvContent +=
          [
            `"${item.broker}"`,
            `"${String(item.product).padStart(5, "0")}"`,
            `"${formatNumber(parseInt(item.amount, 10))}"`,
            `"${item.period}"`,
          ].join(",") + "\n";
      }
    });

    // 網站連結信息
    csvContent +=
      "\n數據來源：終結IPO制度暴力調查網站\nhttps://truth-wolf.github.io/taiwan-ipo-investigation/";

    downloadFile(
      csvContent,
      "ETF責任額數據_經典視圖.csv",
      "text/csv;charset=utf-8"
    );
  }
}

// 下載 Excel 格式
function downloadExcel(data, isProductView) {
  // 使用 SheetJS 處理 Excel
  const XLSX = window.XLSX;
  if (!XLSX) {
    alert("Excel 功能需要 SheetJS 庫，請檢查是否正確載入");
    return;
  }

  if (isProductView) {
    const productsData = {};
    data.forEach((item) => {
      const productName = String(item[1]); // 確保產品編號為字串
      if (!productsData[productName]) {
        productsData[productName] = {
          name: productName,
          period: item[3],
          brokers: {},
          totalAmount: 0,
          brokerCount: 0,
        };
      }
      productsData[productName].brokers[item[0]] = parseInt(item[2], 10);
      productsData[productName].totalAmount += parseInt(item[2], 10);
      productsData[productName].brokerCount++;
    });

    const sortedProducts = Object.values(productsData).sort((a, b) => {
      const avgA = a.brokerCount > 0 ? a.totalAmount / a.brokerCount : 0;
      const avgB = b.brokerCount > 0 ? b.totalAmount / b.brokerCount : 0;
      return avgB - avgA;
    });

    const uniqueBrokers = [...new Set(data.map((item) => item[0]))].sort();
    const headers = ["產品", "募集期間", ...uniqueBrokers, "平均責任額"];

    const excelData = [headers];

    // 添加產品數據
    sortedProducts.forEach((product) => {
      let row = [product.name, product.period];
      let productTotalAmount = 0;
      let productBrokerCount = 0;

      uniqueBrokers.forEach((broker) => {
        const amount = product.brokers[broker];
        if (amount !== undefined) {
          row.push(amount);
          productTotalAmount += amount;
          productBrokerCount++;
        } else {
          row.push("-");
        }
      });

      const average =
        productBrokerCount > 0
          ? Math.round(productTotalAmount / productBrokerCount)
          : 0;
      row.push(average);
      excelData.push(row);
    });

    // 添加總計行
    let totalRow = ["總責任額", ""];
    uniqueBrokers.forEach((broker) => {
      const brokerTotal = data
        .filter((item) => item[0] === broker)
        .reduce((sum, item) => sum + parseInt(item[2], 10), 0);
      totalRow.push(brokerTotal);
    });

    const grandTotalAmount = data.reduce(
      (sum, item) => sum + parseInt(item[2], 10),
      0
    );
    const allProductEntriesCount = data.filter(
      (row) => row[2] && !isNaN(parseInt(row[2]))
    ).length;
    const finalGrandAverage =
      allProductEntriesCount > 0
        ? Math.round(grandTotalAmount / allProductEntriesCount)
        : 0;
    totalRow.push(finalGrandAverage);
    excelData.push(totalRow);

    // 添加網站資訊
    excelData.push([]);
    excelData.push(["數據來源：終結IPO制度暴力調查網站"]);
    excelData.push(["https://truth-wolf.github.io/taiwan-ipo-investigation/"]);

    // 創建工作表
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // 設置列寬
    const colWidth = headers.map(() => ({ wch: 15 }));
    ws["!cols"] = colWidth;

    // 創建工作簿
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ETF責任額數據");

    // 下載文件
    XLSX.writeFile(wb, "ETF責任額數據_產品視圖.xlsx");
  } else {
    const headers = ["券商", "產品", "責任額", "募集期間"];
    const excelData = [headers];

    data.forEach((item) => {
      if (Array.isArray(item)) {
        excelData.push([
          item[0],
          String(item[1]),
          parseInt(item[2], 10),
          item[3],
        ]);
      } else {
        excelData.push([
          item.broker,
          String(item.product),
          parseInt(item.amount, 10),
          item.period,
        ]);
      }
    });

    // 添加網站資訊
    excelData.push([]);
    excelData.push(["數據來源：終結IPO制度暴力調查網站"]);
    excelData.push(["https://truth-wolf.github.io/taiwan-ipo-investigation/"]);

    // 創建工作表
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // 設置列寬
    const colWidth = headers.map(() => ({ wch: 15 }));
    ws["!cols"] = colWidth;

    // 創建工作簿
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ETF責任額數據");

    // 下載文件
    XLSX.writeFile(wb, "ETF責任額數據_經典視圖.xlsx");
  }
}

// 下載 PDF 格式
function downloadPDF(data, isProductView) {
  const { jsPDF } = window.jspdf;
  if (!jsPDF) {
    alert("PDF 功能需要 jsPDF 庫，請檢查是否正確載入");
    return;
  }

  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(10);
  doc.text("ETF 責任額數據", 14, 10);

  if (isProductView) {
    const productsData = {};
    data.forEach((item) => {
      const productName = String(item[1]); // 確保使用字串格式
      if (!productsData[productName]) {
        productsData[productName] = {
          name: productName, // 已確保是字串格式
          period: item[3],
          brokers: {},
          totalAmount: 0,
          brokerCount: 0,
        };
      }
      productsData[productName].brokers[item[0]] = parseInt(item[2], 10);
      productsData[productName].totalAmount += parseInt(item[2], 10);
      productsData[productName].brokerCount++;
    });

    const sortedProducts = Object.values(productsData).sort((a, b) => {
      const avgA = a.brokerCount > 0 ? a.totalAmount / a.brokerCount : 0;
      const avgB = b.brokerCount > 0 ? b.totalAmount / b.brokerCount : 0;
      return avgB - avgA;
    });

    const uniqueBrokers = [...new Set(data.map((item) => item[0]))].sort();
    const head = [["產品", "募集期間", ...uniqueBrokers, "平均責任額"]];
    const body = sortedProducts.map((product) => {
      let row = [product.name, product.period]; // product.name已確保是字串
      let productTotalAmount = 0;
      let productBrokerCount = 0;
      uniqueBrokers.forEach((broker) => {
        const amount = product.brokers[broker];
        if (amount !== undefined) {
          row.push(amount.toLocaleString());
          productTotalAmount += amount;
          productBrokerCount++;
        } else {
          row.push("-");
        }
      });
      const average =
        productBrokerCount > 0
          ? Math.round(productTotalAmount / productBrokerCount)
          : 0;
      row.push(average.toLocaleString());
      return row;
    });

    let totalRowData = ["總責任額", ""];
    uniqueBrokers.forEach((broker) => {
      const brokerTotal = data
        .filter((item) => item[0] === broker)
        .reduce((sum, item) => sum + parseInt(item[2], 10), 0);
      totalRowData.push(brokerTotal.toLocaleString());
    });
    const grandTotalAmount = data.reduce(
      (sum, item) => sum + parseInt(item[2], 10),
      0
    );
    const allProductEntriesCount = data.filter(
      (row) => row[2] && !isNaN(parseInt(row[2]))
    ).length;
    const finalGrandAverage =
      allProductEntriesCount > 0
        ? Math.round(grandTotalAmount / allProductEntriesCount)
        : 0;
    totalRowData.push(finalGrandAverage.toLocaleString());
    body.push(totalRowData);

    doc.autoTable({
      head: head,
      body: body,
      startY: 20,
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: [26, 93, 122], fontSize: 7, cellPadding: 1.5 },
    });

    // 添加網站連結到PDF底部
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "數據來源：終結IPO制度暴力調查網站 https://truth-wolf.github.io/taiwan-ipo-investigation/",
      14,
      pageHeight - 10
    );

    doc.save(`ETF責任額數據_產品視圖.pdf`);
  } else {
    const tableData = data.map((item) => {
      if (Array.isArray(item)) {
        return [
          item[0],
          String(item[1]), // 確保產品編號為字串
          parseInt(item[2], 10).toLocaleString(),
          item[3],
        ];
      }
      return [
        item.broker,
        String(item.product), // 確保產品編號為字串
        parseInt(item.amount, 10).toLocaleString(),
        item.period,
      ];
    });
    doc.autoTable({
      head: [["券商", "產品", "責任額", "募集期間"]],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [26, 93, 122], fontSize: 8, cellPadding: 2 },
    });

    // 添加網站連結到PDF底部
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "數據來源：終結IPO制度暴力調查網站 https://truth-wolf.github.io/taiwan-ipo-investigation/",
      14,
      pageHeight - 10
    );

    doc.save(`ETF責任額數據_經典視圖.pdf`);
  }
}

// 通用下載文件函數
function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement("a");
  if (window.navigator.msSaveOrOpenBlob) {
    // 針對 IE 瀏覽器的特殊處理
    window.navigator.msSaveOrOpenBlob(blob, fileName);
  } else {
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  }
}

// 計算募集期間天數（防呆版）
function days(period) {
  if (!period || !period.includes("-")) return 0;
  const [s, e] = period.split("-");
  if (!s || !e) return 0;

  const toDate = (str, base) => {
    const p = str.split("/");
    const roc = p.length === 3 ? p[0] : base[0];
    const y = 2000 + parseInt(roc, 10) - 1911;
    const m = parseInt(p[p.length === 3 ? 1 : 0], 10) - 1;
    const d = parseInt(p[p.length === 3 ? 2 : 1], 10);
    return new Date(y, m, d);
  };

  const sParts = s.split("/");
  const start = toDate(s, sParts);
  const end = toDate(e, sParts);
  return Math.round((end - start) / 86400000) + 1;
}

// 初始化增強型表格
initEnhancedTable();

function injectCSS() {
  const style = document.createElement("style");
  style.textContent = `
    /* 下載按鈕基本樣式 */
    .download-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.875rem;
    }

    .download-button:hover {
      background-color: var(--primary-dark);
      transform: translateY(-1px);
    }

    .download-button:active {
      transform: translateY(0);
    }

    .download-button i {
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      .download-button {
        padding: 0.375rem 0.75rem;
      }
    }

    /* 表格基本樣式優化 */
    #csv-table {
      width: 100%;
      font-size: 14px;
      table-layout: fixed;
    }

    #csv-table th,
    #csv-table td {
      padding: 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* 欄位寬度控制 */
    #csv-table td:nth-child(1),
    #csv-table th:nth-child(1) {
      width: 25%;
    }

    #csv-table td:nth-child(2),
    #csv-table th:nth-child(2) {
      width: 20%;
    }

    #csv-table td:nth-child(3),
    #csv-table th:nth-child(3) {
      width: 25%;
      text-align: right;
    }

    #csv-table td:nth-child(4),
    #csv-table th:nth-child(4) {
      width: 30%;
    }

    /* 手機版特別優化 */
    @media (max-width: 768px) {
      #csv-table {
        font-size: 12px;
      }

      #csv-table th,
      #csv-table td {
        padding: 6px 4px;
      }

      .dataTables_wrapper {
        margin: 0;
        padding: 0;
      }
    }

    /* 超小螢幕優化 */
    @media (max-width: 375px) {
      #csv-table {
        font-size: 11px;
      }

      #csv-table th,
      #csv-table td {
        padding: 4px 2px;
      }
    }

    /* 下載選單樣式 */
    .mobile-download-menu {
      position: relative;
      z-index: 1000;
    }

    .mobile-download-button {
      padding: 8px 12px;
      border-radius: 4px;
      background-color: var(--primary-color);
      color: white;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .mobile-download-button:active {
      transform: translateY(1px);
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .mobile-download-options {
      position: absolute;
      right: 0;
      top: 100%;
      margin-top: 4px;
      background: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      padding: 8px 0;
      min-width: 160px;
      z-index: 1001;
    }

    .mobile-download-options .download-option {
      padding: 12px 16px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
      color: #333;
      transition: background-color 0.2s;
    }

    .mobile-download-options .download-option:hover {
      background-color: #f5f5f5;
    }

    /* 分頁按鈕樣式 */
    .dataTables_paginate {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 1rem;
      gap: 0.5rem;
    }

    .dataTables_paginate .paginate_button {
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid #e2e8f0;
      background: white !important;
      color: #4a5568 !important;
      min-width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
    }

    .dataTables_paginate .paginate_button:hover {
      background: #edf2f7 !important;
      color: #2d3748 !important;
      border-color: #cbd5e0;
    }

    .dataTables_paginate .paginate_button.current {
      background: var(--primary-color) !important;
      color: white !important;
      border-color: var(--primary-color);
    }

    .dataTables_paginate .paginate_button.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    .dataTables_paginate .paginate_button i {
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      .dataTables_paginate {
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.375rem;
      }

      .dataTables_paginate .paginate_button {
        padding: 0.375rem 0.5rem;
        min-width: 32px;
        height: 32px;
        font-size: 0.75rem;
      }

      .dataTables_paginate .ellipsis {
        display: none;
      }
    }

    /* 產品視圖表格樣式優化 */
    .product-based-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .product-based-table th,
    .product-based-table td {
      padding: 8px;
      border: 1px solid #e2e8f0;
      text-align: right;
    }

    .product-based-table th:first-child,
    .product-based-table td:first-child {
      text-align: left;
      position: sticky;
      left: 0;
      background: white;
      z-index: 1;
    }

    .product-based-table th {
      background-color: var(--primary-color);
      color: white;
      font-weight: bold;
      white-space: nowrap;
    }

    .product-based-table .highlight-data {
      font-family: monospace;
    }

    .product-based-table .total-cell {
      font-weight: bold;
      color: var(--primary-dark);
    }

    @media (max-width: 768px) {
      .product-based-table {
        font-size: 12px;
      }

      .product-based-table th,
      .product-based-table td {
        padding: 6px;
      }
    }
  `;
  document.head.appendChild(style);
}

function initClassicTable(data) {
  console.log("初始化經典表格視圖");

  // 檢查是否已存在表格
  let csvTable = document.getElementById("csv-table");

  // 如果表格不存在，創建新表格
  if (!csvTable) {
    csvTable = document.createElement("table");
    csvTable.id = "csv-table";
    csvTable.className = "display responsive nowrap";

    // 創建表格容器
    const tableContainer = document.createElement("div");
    tableContainer.className = "classic-view-table";
    tableContainer.appendChild(csvTable);

    // 將表格容器添加到頁面
    const dataSection = document.querySelector("#data .max-w-content");
    if (dataSection) {
      dataSection.appendChild(tableContainer);
    } else {
      document.body.appendChild(tableContainer);
    }
  }

  const columns = [
    {
      title: "券商",
      data: 0,
      render: function (data) {
        return `<span class="broker-name">${data}</span>`;
      },
    },
    {
      title: "產品",
      data: 1,
      render: function (data) {
        return `<span class="product-code">${String(data).padStart(
          5,
          "0"
        )}</span>`;
      },
    },
    {
      title: "責任額",
      data: 2,
      render: function (data) {
        return parseInt(data).toLocaleString("zh-TW");
      },
    },
    { title: "募集期間", data: 3 },
  ];

  // 使用 jQuery 初始化 DataTable
  const dataTable = $(csvTable).DataTable({
    data: data,
    columns: columns,
    order: [[2, "desc"]],
    pageLength: 10,
    responsive: true,
    language: {
      search: "搜尋",
      lengthMenu: "每頁 _MENU_ 筆",
      info: "顯示第 _START_ 至 _END_ 筆結果，共 _TOTAL_ 筆",
      paginate: {
        first: '<i class="fas fa-angle-double-left"></i>',
        last: '<i class="fas fa-angle-double-right"></i>',
        next: '<i class="fas fa-angle-right"></i>',
        previous: '<i class="fas fa-angle-left"></i>',
      },
      zeroRecords: "沒有找到匹配的記錄",
      infoEmpty: "沒有記錄",
      infoFiltered: "(從 _MAX_ 筆記錄中過濾)",
    },
    dom: '<"top"<"filter-controls"fl><"view-buttons">>rtip',
    initComplete: function () {
      console.log("DataTable初始化完成");
      if (data.length > 0) {
        const firstRow = $("#csv-table tbody tr:first-child");
        firstRow.addClass("bg-primary bg-opacity-10");
      }
      addTotalInformation(data);
    },
  });

  return dataTable;
}
