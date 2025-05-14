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
      <span>顯示總計</span>
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
    <p>最後更新日期：2025年5月13日</p>
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

// 設置下載選項
function setupDownloadOptions() {
  const downloadMenu = document.querySelector(".download-menu");
  if (!downloadMenu) return;

  const downloadButton = downloadMenu.querySelector(".download-button");
  const downloadOptions = downloadMenu.querySelectorAll(".download-option");

  // 點擊按鈕切換選單顯示
  downloadButton.addEventListener("click", function (e) {
    e.stopPropagation(); // 防止事件冒泡
    downloadMenu.classList.toggle("show-options");
  });

  // 點擊文檔其他位置關閉選單
  document.addEventListener("click", function (e) {
    if (!downloadMenu.contains(e.target)) {
      downloadMenu.classList.remove("show-options");
    }
  });

  // 點擊選項後關閉選單並執行下載
  downloadOptions.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.stopPropagation(); // 防止事件冒泡
      const format = option.getAttribute("data-format");
      downloadTable(format);
      downloadMenu.classList.remove("show-options");
    });
  });
}

// 下載表格功能
function downloadTable(format) {
  const isProductView = document
    .getElementById("product-view-btn")
    .classList.contains("active");
  const tableData = extractTableData();

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

// 下載 CSV 格式
function downloadCSV(data, isProductView) {
  if (isProductView) {
    const fullData = window.csvData || [];
    const productsData = {};
    fullData.forEach((item) => {
      const productName = item[1];
      if (!productsData[productName]) {
        productsData[productName] = {
          name: String(productName),
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

    const uniqueBrokers = [...new Set(fullData.map((item) => item[0]))].sort();
    let csvContent =
      "產品,募集期間," + uniqueBrokers.join(",") + ",平均責任額\n";

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
      csvContent +=
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",") +
        "\n";
    });

    let totalRow = ["總責任額", ""];
    uniqueBrokers.forEach((broker) => {
      const brokerTotal = fullData
        .filter((item) => item[0] === broker)
        .reduce((sum, item) => sum + parseInt(item[2], 10), 0);
      totalRow.push(brokerTotal);
    });
    const grandTotalAmount = fullData.reduce(
      (sum, item) => sum + parseInt(item[2], 10),
      0
    );
    const allProductEntriesCount = fullData.filter(
      (row) => row[2] && !isNaN(parseInt(row[2]))
    ).length;
    const finalGrandAverage =
      allProductEntriesCount > 0
        ? Math.round(grandTotalAmount / allProductEntriesCount)
        : 0;
    totalRow.push(finalGrandAverage);
    csvContent += totalRow
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(",");

    downloadFile(csvContent, "ETF責任額數據_產品視圖.csv", "text/csv");
  } else {
    let csvContent = "券商,產品,責任額,募集期間\n";
    data.forEach((item) => {
      if (Array.isArray(item)) {
        let processedItem = [...item];
        processedItem[1] = String(processedItem[1]);
        csvContent +=
          processedItem
            .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
            .join(",") + "\n";
      } else {
        csvContent +=
          [
            `"${item.broker}"`,
            `"${String(item.product).replace(/"/g, '""')}"`,
            item.amount,
            `"${item.period}"`,
          ].join(",") + "\n";
      }
    });
    downloadFile(csvContent, "ETF責任額數據_經典視圖.csv", "text/csv");
  }
}

// 下載 Excel 格式
function downloadExcel(data, isProductView) {
  const BOM = "\uFEFF";
  if (isProductView) {
    const fullData = window.csvData || [];
    const productsData = {};
    fullData.forEach((item) => {
      const productName = item[1];
      if (!productsData[productName]) {
        productsData[productName] = {
          name: String(productName),
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

    const uniqueBrokers = [...new Set(fullData.map((item) => item[0]))].sort();
    let csvContent =
      BOM + "產品,募集期間," + uniqueBrokers.join(",") + ",平均責任額\n";

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
      csvContent +=
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",") +
        "\n";
    });

    let totalRow = ["總責任額", ""];
    uniqueBrokers.forEach((broker) => {
      const brokerTotal = fullData
        .filter((item) => item[0] === broker)
        .reduce((sum, item) => sum + parseInt(item[2], 10), 0);
      totalRow.push(brokerTotal);
    });
    const grandTotalAmount = fullData.reduce(
      (sum, item) => sum + parseInt(item[2], 10),
      0
    );
    const allProductEntriesCount = fullData.filter(
      (row) => row[2] && !isNaN(parseInt(row[2]))
    ).length;
    const finalGrandAverage =
      allProductEntriesCount > 0
        ? Math.round(grandTotalAmount / allProductEntriesCount)
        : 0;
    totalRow.push(finalGrandAverage);
    csvContent += totalRow
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(",");

    downloadFile(
      csvContent,
      "ETF責任額數據_產品視圖.xlsx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  } else {
    let csvContent = BOM + "券商,產品,責任額,募集期間\n";
    data.forEach((item) => {
      if (Array.isArray(item)) {
        let processedItem = [...item];
        processedItem[1] = String(processedItem[1]);
        csvContent +=
          processedItem
            .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
            .join(",") + "\n";
      } else {
        csvContent +=
          [
            `"${item.broker}"`,
            `"${String(item.product).replace(/"/g, '""')}"`,
            item.amount,
            `"${item.period}"`,
          ].join(",") + "\n";
      }
    });
    downloadFile(
      csvContent,
      "ETF責任額數據_經典視圖.xlsx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
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
    const fullData = window.csvData || [];
    const productsData = {};
    fullData.forEach((item) => {
      const productName = item[1];
      if (!productsData[productName]) {
        productsData[productName] = {
          name: String(productName),
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

    const uniqueBrokers = [...new Set(fullData.map((item) => item[0]))].sort();
    const head = [["產品", "募集期間", ...uniqueBrokers, "平均責任額"]];
    const body = sortedProducts.map((product) => {
      let row = [product.name, product.period];
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
      const brokerTotal = fullData
        .filter((item) => item[0] === broker)
        .reduce((sum, item) => sum + parseInt(item[2], 10), 0);
      totalRowData.push(brokerTotal.toLocaleString());
    });
    const grandTotalAmount = fullData.reduce(
      (sum, item) => sum + parseInt(item[2], 10),
      0
    );
    const allProductEntriesCount = fullData.filter(
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
  } else {
    const tableData = data.map((item) => {
      if (Array.isArray(item)) {
        return [
          item[0],
          String(item[1]),
          parseInt(item[2], 10).toLocaleString(),
          item[3],
        ];
      }
      return [
        item.broker,
        String(item.product),
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
  }

  doc.save(`ETF責任額數據_${isProductView ? "產品視圖" : "經典視圖"}.pdf`);
}

// 通用下載文件函數
function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(link.href);
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
