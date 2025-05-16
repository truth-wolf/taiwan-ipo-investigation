/**
 * enhancedDataTable.js - 完整優化版本
 * 
 * 提供多種表格視圖與功能:
 * - 經典視圖 (券商-產品)
 * - 產品視圖 (產品-券商)
 * - 篩選與排序功能
 * - 總和與統計
 * - 資料視覺化
 * - 自動檢測與載入SheetJS庫
 * - 導出Excel和CSV功能
 */

// 全局變數
let csvData = [];
let dataTable = null;
let productTableInitialized = false;

// 初始化函數
function initEnhancedDataTable() {
  console.log("增強型DataTable初始化...");

  // 確保依賴庫已載入
  if (
    typeof Papa === "undefined" ||
    typeof Chart === "undefined" ||
    typeof $ === "undefined"
  ) {
    console.error("必要依賴庫未載入：PapaParse, Chart.js 或 jQuery");
    displayError("載入失敗：缺少必要程式庫");
    return;
  }
  
  // 檢查SheetJS庫是否載入
  if (typeof XLSX === 'undefined') {
    console.log("SheetJS庫未預載入，嘗試動態載入...");
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js", function() {
      console.log("SheetJS庫動態載入完成");
    });
  } else {
    console.log("SheetJS庫已預先載入");
  }

  // 等待DOM載入完成
  document.addEventListener("DOMContentLoaded", function () {
    let attempts = 0;
    const maxAttempts = 100; 
    const intervalTime = 100; 
    let pollerIntervalId;

    const executeMainLogic = function () {
      // 主要邏輯實現
      fetch("ipo_broker_product.csv")
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP 錯誤：${response.status}`);
          return response.text();
        })
        .then((csvText) => {
          Papa.parse(csvText, {
            header: false,
            skipEmptyLines: true,
            complete: function (results) {
              console.log("CSV解析完成，列數:", results.data.length);
              csvData = results.data.slice(1); // 移除標題行
              window.csvData = csvData; // 提供給其他模組使用

              initClassicTable(csvData);
              initFilters(csvData);
              if (window.innerWidth >= 768) {
                prepareProductTableContainer();
                initViewButtons();
<<<<<<< Updated upstream
=======
                // 初始化完成後自動切換到產品視圖
                setTimeout(() => {
                  initProductTable(csvData);
                  toggleTableView("product");
                }, 100);
              } else {
                // 手機版初始化
                createMobileViewToggle();
>>>>>>> Stashed changes
              }
              initDataVisualizations(csvData);
              generateKeyInsights();
            },
            error: function (error) {
              console.error("CSV解析錯誤:", error);
              displayError("資料解析錯誤，請稍後再試。");
            },
          });
        })
        .catch((error) => {
          console.error("載入CSV數據時出錯:", error);
          displayError("載入數據時出錯，請稍後再試。");
        });
    };

    // 初始嘗試尋找表格
    const initialCsvTable = document.getElementById("csv-table");
    if (initialCsvTable) {
      console.log("成功找到 #csv-table 容器 (立即)。開始執行主要邏輯...");
      executeMainLogic();
    } else {
      // 如果未立即找到，開始輪詢
      console.log("#csv-table 未立即找到，開始輪詢...");
      pollerIntervalId = setInterval(function () {
        const csvTableCurrent = document.getElementById("csv-table");
        attempts++;
        if (csvTableCurrent) {
          clearInterval(pollerIntervalId);
          console.log(
            `成功找到 #csv-table 容器 (輪詢 ${attempts} 次)。開始執行主要邏輯...`
          );
          executeMainLogic();
        } else if (attempts >= maxAttempts) {
          clearInterval(pollerIntervalId);
          console.error(
            `找不到 #csv-table 容器，已達最大輪詢嘗試次數 (${maxAttempts})。`
          );
          displayError("表格容器未找到 (輪詢超時)");
        }
      }, intervalTime);
    }
  });
}

// 顯示錯誤訊息
function displayError(message) {
  console.error("表格錯誤:", message);
  const csvTable = document.getElementById("csv-table");
  if (csvTable) {
    csvTable.innerHTML = `<tbody><tr><td colspan="4" class="text-red-500 p-4">${message}</td></tr></tbody>`;
  }
}

// 初始化經典表格 (券商-產品視圖)
function initClassicTable(data) {
  console.log("初始化經典表格視圖");
  const csvTable = document.getElementById("csv-table");
  if (!csvTable) return;

  // 計算高亮閾值 - 找出最高和較高的責任額
  const amounts = data
    .map((item) => parseInt(item[2], 10))
    .filter((amount) => !isNaN(amount));
  amounts.sort((a, b) => b - a);
  const highestAmount = amounts[0];
  const highThreshold = highestAmount * 0.7; // 最高值的70%作為高值閾值

  const columns = [
    { title: "券商" },
    {
      title: "產品",
      render: function (data, type, row) {
        return '<span style="letter-spacing:-0.5px;">' + data + "</span>";
      },
      width: "20%", // 建議寬度，可調整
    },
    {
      title: "責任額",
      className: "dt-center font-bold", // 將dt-right改為dt-center置中對齊
      render: function (data, type, row) {
        if (type === "display") {
          const amount = parseInt(data, 10);
          if (!isNaN(amount)) {
            // 根據閾值決定顯示樣式，增加100萬以上的顏色區分
            if (amount >= 1000000 || amount === highestAmount) {
              return (
                '<span style="color: #c1292e; font-weight: bold;">' +
                amount.toLocaleString() +
                "</span>"
              );
            } else if (amount >= highThreshold || amount >= 500000) {
              return (
                '<span style="color: #e85d04; font-weight: bold;">' +
                amount.toLocaleString() +
                "</span>"
              );
            } else if (amount >= 100000) { // 10萬以上的一般高亮
              return (
                '<span style="color: #e23e57; font-weight: bold;">' +
                amount.toLocaleString() +
                "</span>"
              );
            }
            return amount.toLocaleString();
          }
        }
        return data; // 返回原始數據用於排序等
      },
    },
    { title: "募集期間" },
  ];

  dataTable = $(csvTable).DataTable({
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
        first: "<i class='fas fa-angle-double-left'></i>",
        last: "<i class='fas fa-angle-double-right'></i>",
        next: "<i class='fas fa-angle-right'></i>",
        previous: "<i class='fas fa-angle-left'></i>"
      },
      zeroRecords: "沒有找到匹配的記錄",
      infoEmpty: "沒有記錄",
      infoFiltered: "(從 _MAX_ 筆記錄中過濾)",
    },
    // 在初始化時檢查SheetJS庫
    initComplete: function() {
      console.log("檢查SheetJS庫的可用性:", typeof XLSX !== 'undefined' ? "已載入" : "未載入");
      if (typeof XLSX === 'undefined') {
        console.warn("SheetJS庫未載入，Excel功能可能不可用");
        // 動態載入SheetJS庫
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js", function() {
          console.log("SheetJS庫已動態載入");
        });
      }
      
      // 如果數據存在，高亮顯示第一行
      if (data.length > 0) {
        const firstRow = $("#csv-table tbody tr:first-child");
        firstRow.addClass("bg-primary bg-opacity-10");
      }
      
      // 添加總計資訊
      addTotalInformation(data);
    },
    dom: '<"top"<"filter-controls"fl><"view-buttons">>rtip',
  });

  const viewControls = `
    <div class="view-switch hidden md:flex md:space-x-2">
      <button id="classic-view-btn" class="view-button active">
        <i class="fas fa-th-list"></i> 經典視圖
      </button>
      <button id="product-view-btn" class="view-button">
        <i class="fas fa-table"></i> 產品視圖
      </button>
      <button id="export-csv-btn" class="view-button export-button">
        <i class="fas fa-download"></i> 匯出CSV
      </button>
    </div>
  `;

  $(".view-buttons").html(viewControls);
  
  // 添加匯出CSV按鈕功能
  $("#export-csv-btn").on("click", function() {
    console.log("準備匯出CSV...");
    try {
      const csvContent = [['\u5238\u5546', '\u7522\u54c1', '\u8cac\u4efb\u984d', '\u52df\u96c6\u671f\u9593']]
      data.forEach(row => csvContent.push(row));
      
      // 轉換為CSV格式
      let csvString = '';
      csvContent.forEach(row => {
        csvString += row.join(',') + '\n';
      });
      
      // 創建下載連結
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "IPO責任額數據.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log("CSV檔案匯出成功");
    } catch (error) {
      console.error("CSV檔案匯出失敗:", error);
    }
  });

  // 在手機版上點擊行顯示詳情
  if (window.innerWidth <= 768) {
    $("#csv-table tbody").on("click", "tr", function () {
      const rowData = dataTable.row(this).data();
      showDetailModal(rowData);
    });
  }
}

// 初始化篩選器
function initFilters(data) {
  console.log("初始化篩選器");

  const brokers = [...new Set(data.map((item) => item[0]))].sort();
  const months = [
    ...new Set(
      data.map((item) => {
        const dateMatch = item[3].match(/(\d+)\/(\d+)/);
        return dateMatch ? `${dateMatch[1]}/${dateMatch[2]}` : "";
      })
    ),
  ]
    .filter(Boolean)
    .sort();

  const brokerFilter = document.getElementById("broker-filter");
  if (brokerFilter) {
    brokerFilter.innerHTML = '<option value="">所有券商</option>';
    brokers.forEach((broker) => {
      brokerFilter.innerHTML += `<option value="${broker}">${broker}</option>`;
    });
    brokerFilter.addEventListener("change", function () {
      const selectedBroker = this.value;
      dataTable.columns(0).search(selectedBroker).draw();
    });
  }

  const dateFilter = document.getElementById("date-filter");
  if (dateFilter) {
    dateFilter.innerHTML = '<option value="">所有日期</option>';
    months.forEach((month) => {
      dateFilter.innerHTML += `<option value="${month}">${month}</option>`;
    });
    dateFilter.addEventListener("change", function () {
      const selectedMonth = this.value;
      dataTable.columns(3).search(selectedMonth).draw();
    });
  }

  const showTotalsCheckbox = document.getElementById("show-totals");
  if (showTotalsCheckbox) {
    showTotalsCheckbox.addEventListener("change", function () {
      const totalInfoElement = document.querySelector(".table-info");
      if (totalInfoElement) {
        totalInfoElement.style.display = this.checked ? "block" : "none";
      }
    });
  }
}

// 準備產品表格容器
function prepareProductTableContainer() {
  console.log("準備產品表格容器");
  const tableWrapper =
    document.querySelector(".table-wrapper") ||
    document.querySelector(".overflow-x-auto");
  if (!tableWrapper) return;

  tableWrapper.classList.add("classic-view-table");

  const productTableContainer = document.createElement("div");
  productTableContainer.id = "product-table-container";
  productTableContainer.className = "table-wrapper product-based-view hidden";

  tableWrapper.parentNode.appendChild(productTableContainer);
}

// 初始化視圖切換按鈕
function initViewButtons() {
  setTimeout(() => {
    const classicViewBtn = document.getElementById("classic-view-btn");
    const productViewBtn = document.getElementById("product-view-btn");

    if (classicViewBtn && productViewBtn) {
      classicViewBtn.addEventListener("click", () =>
        toggleTableView("classic")
      );
      productViewBtn.addEventListener("click", () =>
        toggleTableView("product")
      );
    }

    // 新增：手機版視圖切換功能
    createMobileViewToggle();
  }, 500);
}

// 新增：創建手機版視圖切換按鈕
function createMobileViewToggle() {
  if (window.innerWidth >= 768) return; // 僅在手機版添加

  const tableWrapper =
    document.querySelector(".table-wrapper") ||
    document.querySelector(".overflow-x-auto");

  if (!tableWrapper) return;

  // 檢查是否已存在切換按鈕
  if (document.querySelector(".mobile-view-toggle")) return;

  const mobileToggle = document.createElement("div");
  mobileToggle.className = "mobile-view-toggle";
  mobileToggle.innerHTML = `
    <button id="mobile-classic-btn" class="active" aria-label="經典視圖"><i class="fas fa-th-list"></i></button>
    <button id="mobile-product-btn" aria-label="產品視圖"><i class="fas fa-table"></i></button>
    <button id="mobile-export-btn" aria-label="匯出數據"><i class="fas fa-download"></i></button>
  `;

  tableWrapper.parentNode.insertBefore(mobileToggle, tableWrapper);

  // 添加經典視圖按鈕事件
  document
    .getElementById("mobile-classic-btn")
    .addEventListener("click", () => {
      toggleTableView("classic");
      document.getElementById("mobile-classic-btn").classList.add("active");
      document.getElementById("mobile-product-btn").classList.remove("active");
      document.getElementById("mobile-export-btn").classList.remove("active");
    });

  // 添加產品視圖按鈕事件
  document
    .getElementById("mobile-product-btn")
    .addEventListener("click", () => {
      if (!productTableInitialized) initProductTable(csvData);
      toggleTableView("product");
      document.getElementById("mobile-product-btn").classList.add("active");
      document.getElementById("mobile-classic-btn").classList.remove("active");
      document.getElementById("mobile-export-btn").classList.remove("active");
    });
    
  // 添加手機版匯出按鈕功能
  document
    .getElementById("mobile-export-btn")
    .addEventListener("click", () => {
      console.log("手機版 - 準備匯出選單");
      // 顯示匯出選項選單
      const exportMenu = document.createElement("div");
      exportMenu.className = "mobile-export-menu";
      exportMenu.innerHTML = `
        <div class="mobile-export-options">
          <button id="mobile-export-csv"><i class="fas fa-file-csv"></i> 匯出CSV</button>
          <button id="mobile-export-excel"><i class="fas fa-file-excel"></i> 匯出Excel</button>
          <button id="mobile-export-cancel">取消</button>
        </div>
      `;
      document.body.appendChild(exportMenu);
      
      // 設置選單位置
      const buttonRect = document.getElementById("mobile-export-btn").getBoundingClientRect();
      exportMenu.style.position = "fixed";
      exportMenu.style.top = (buttonRect.bottom + 10) + "px";
      exportMenu.style.left = (window.innerWidth / 2 - 100) + "px";
      
      // 添加事件處理
      document.getElementById("mobile-export-csv").addEventListener("click", function() {
        // 觸發CSV匯出邏輯
        $("#export-csv-btn").trigger("click");
        document.body.removeChild(exportMenu);
      });
      
      document.getElementById("mobile-export-excel").addEventListener("click", function() {
        // 觸發Excel匯出邏輯
        $("#download-excel-btn").trigger("click");
        document.body.removeChild(exportMenu);
      });
      
      document.getElementById("mobile-export-cancel").addEventListener("click", function() {
        document.body.removeChild(exportMenu);
      });
      
      // 點擊其他區域關閉選單
      document.addEventListener("click", function closeMenu(e) {
        if (!exportMenu.contains(e.target) && e.target.id !== "mobile-export-btn") {
          if (document.body.contains(exportMenu)) {
            document.body.removeChild(exportMenu);
          }
          document.removeEventListener("click", closeMenu);
        }
      });
    });
}

// 切換表格視圖
function toggleTableView(viewType) {
  console.log("切換表格視圖到:", viewType);
  const classicViewTable = document.querySelector(".classic-view-table");
  const productViewTable = document.getElementById("product-table-container");

  if (!classicViewTable || !productViewTable) {
    console.error("找不到表格容器元素", { classicViewTable, productViewTable });
    return;
  }

  const classicViewBtn = document.getElementById("classic-view-btn");
  const productViewBtn = document.getElementById("product-view-btn");

  if (viewType === "classic") {
    // 確保經典視圖顯示
    classicViewTable.style.display = "block";
    classicViewTable.classList.remove("hidden");

    // 隱藏產品視圖
    productViewTable.style.display = "none";
    productViewTable.classList.add("hidden");

    // 更新按鈕狀態
    if (classicViewBtn && productViewBtn) {
      classicViewBtn.classList.add("active");
      productViewBtn.classList.remove("active");
    }

    // 手機版特殊處理
    if (window.innerWidth < 768) {
      classicViewTable.classList.add("visible");
      productViewTable.classList.remove("visible");
    }
  } else if (viewType === "product") {
    // 確保產品表格已初始化
    if (!productTableInitialized) {
      console.log("產品表格尚未初始化，正在初始化...");
      initProductTable(csvData);
    }

    // 顯示產品視圖
    productViewTable.style.display = "block";
    productViewTable.classList.remove("hidden");

    // 隱藏經典視圖
    classicViewTable.style.display = "none";
    classicViewTable.classList.add("hidden");

    // 更新按鈕狀態
    if (classicViewBtn && productViewBtn) {
      classicViewBtn.classList.remove("active");
      productViewBtn.classList.add("active");
    }

    // 手機版特殊處理
    if (window.innerWidth < 768) {
      classicViewTable.classList.remove("visible");
      productViewTable.classList.add("visible");
    }
  }

  console.log("視圖切換後狀態:", {
    經典視圖: {
      display: classicViewTable.style.display,
      hidden: classicViewTable.classList.contains("hidden"),
      visible: classicViewTable.classList.contains("visible"),
    },
    產品視圖: {
      display: productViewTable.style.display,
      hidden: productViewTable.classList.contains("hidden"),
      visible: productViewTable.classList.contains("visible"),
    },
  });
}

// 初始化產品表格 (產品-券商視圖)
function initProductTable(data) {
  if (productTableInitialized) return;
  console.log("初始化產品表格視圖");

  const brokers = [...new Set(data.map((item) => item[0]))].sort();

  // 增強的產品排序邏輯 + 收集募資期間
  let productDetails = {};
  data.forEach((item) => {
    const productName = item[1];
    const amount = parseInt(item[2], 10);
    const period = item[3]; // 募資期間

    if (!productDetails[productName]) {
      productDetails[productName] = {
        totalAmount: 0,
        count: 0,
        name: productName,
        period: period, // 儲存第一個遇到的募資期間
      };
    }
    if (!isNaN(amount)) {
      productDetails[productName].totalAmount += amount;
      productDetails[productName].count++;
    }
  });

  let sortedProductObjects = Object.values(productDetails).map((p) => {
    p.average = p.count > 0 ? Math.round(p.totalAmount / p.count) : 0;
    return p;
  });

  sortedProductObjects.sort((a, b) => b.average - a.average);

  // 計算平均責任額的閾值，用於高亮顯示
  const averages = sortedProductObjects
    .map((p) => p.average)
    .filter((a) => a > 0);
  averages.sort((a, b) => b - a);
  const highestAverage = averages[0];
  const highAverageThreshold = highestAverage * 0.7; // 最高平均值的70%
  const warningAverageThreshold = highestAverage * 0.5; // 最高平均值的50%

  let tableHTML = `
    <table id="product-table" class="product-based-table w-full">
      <thead>
        <tr>
          <th>產品</th>
          <th>募集期間</th>
          ${brokers.map((broker) => `<th>${broker}</th>`).join("")}
          <th>平均責任額</th>
        </tr>
      </thead>
      <tbody>
  `;

  sortedProductObjects.forEach((productObj) => {
    const product = productObj.name;
    const fundraisingPeriod = productObj.period;
    tableHTML += `<tr><td>${product}</td><td class="fundraising-period">${fundraisingPeriod}</td>`;

    let totalAmountForAverageCalc = 0;
    let brokerCountForAverageCalc = 0;

    brokers.forEach((broker) => {
      const match = data.find(
        (item) => item[1] === product && item[0] === broker
      );
      if (match) {
        const amount = parseInt(match[2], 10);
        let amountClass = "highlight-data"; // Default
        if (amount >= 1000000) {
          // 1M
          amountClass += " amount-critical";
        } else if (amount >= 500000) {
          // 500k
          amountClass += " amount-warning";
        } else if (amount >= 100000) {
          // 100k
          amountClass += " amount-high";
        }
        tableHTML += `<td class="${amountClass}">${match[2]}</td>`;
        totalAmountForAverageCalc += amount;
        brokerCountForAverageCalc++;
      } else {
        tableHTML += `<td>-</td>`;
      }
    });

    const average = productObj.average;
    // 為平均責任額添加高亮樣式
    let averageClass = "total-cell";
    if (average >= highestAverage * 0.9) {
      // 接近最高平均值
      averageClass += " average-highest";
    } else if (average >= highAverageThreshold) {
      // 高於閾值
      averageClass += " average-high";
    } else if (average >= warningAverageThreshold) {
      // 中等值
      averageClass += " average-medium";
    }

    tableHTML += `<td class="${averageClass}">${average}</td></tr>`;
  });

  // 計算每個經紀商的總責任額
  const brokerTotals = {};
  brokers.forEach((broker) => {
    brokerTotals[broker] = data
      .filter((item) => item[0] === broker)
      .reduce((sum, item) => sum + parseInt(item[2], 10), 0);
  });

  // 找出最高和第二高的總責任額，以便高亮顯示
  const sortedTotals = Object.values(brokerTotals).sort((a, b) => b - a);
  const highestTotal = sortedTotals[0];
  const secondHighestTotal = sortedTotals[1];

  // 總責任額行
  tableHTML += `<tr class="total-row"><td><strong>總責任額</strong></td><td></td>`;

  brokers.forEach((broker) => {
    const brokerData = data.filter((item) => item[0] === broker);
    const total = brokerData.reduce(
      (sum, item) => sum + parseInt(item[2], 10),
      0
    );

    // 對總額進行高亮度設定
    let cellClass = "total-cell";
    if (total === highestTotal) {
      cellClass += " total-cell-highest";
    } else if (total >= highestTotal * 0.7) {
      // 達到最高值的70%或以上
      cellClass += " total-cell-high";
    }

    tableHTML += `<td class="${cellClass}">${total}</td>`;
  });

  const grandTotal = data.reduce((sum, item) => sum + parseInt(item[2], 10), 0);
  const brokerProducts = data.length;
  const grandAverage =
    brokerProducts > 0 ? Math.round(grandTotal / brokerProducts) : 0;
  tableHTML += `<td class="total-cell-highest">${grandAverage}</td></tr></tbody></table>`;

  const productTableContainer = document.getElementById(
    "product-table-container"
  );
  if (productTableContainer) {
    productTableContainer.innerHTML = tableHTML;
    productTableInitialized = true;
    initProductTableSorting();
  } else {
    console.error("找不到產品表格容器");
  }
}

// 初始化產品表格排序功能
function initProductTableSorting() {
  const productTable = document.getElementById("product-table");
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
  const productTable = document.getElementById("product-table");
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
        ? cellA.localeCompare(cellB)
        : cellB.localeCompare(cellA);
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

// 添加總計信息
function addTotalInformation(data) {
  const totalAmount = data.reduce((sum, item) => sum + parseInt(item[2]), 0);
  const uniqueBrokers = [...new Set(data.map((item) => item[0]))];
  const uniqueProducts = [...new Set(data.map((item) => item[1]))];

  // 移除可能已存在的表格信息元素
  const existingInfo = document.querySelector(".table-info");
  if (existingInfo) existingInfo.remove();

  const infoElement = document.createElement("div");
  infoElement.className = "table-info mt-4";
  infoElement.innerHTML = `
    <div class="flex flex-col md:flex-row md:justify-between text-neutral-600">
      <span>總責任額: <strong class="text-primary-dark">${totalAmount.toLocaleString()}</strong> 萬元</span>
      <span>券商數量: <strong class="text-primary-dark">${
        uniqueBrokers.length
      }</strong></span>
      <span>產品數: <strong class="text-primary-dark">${
        uniqueProducts.length
      }</strong></span>
      <button id="download-excel-btn" class="download-excel-btn ml-auto mt-2 md:mt-0">
        <i class="fas fa-file-excel mr-1"></i> 下載Excel
      </button>
    </div>
  `;

  const tableWrapper =
    document.querySelector(".classic-view-table") ||
    document.querySelector(".overflow-x-auto");
  if (tableWrapper) {
    tableWrapper.parentNode.insertBefore(infoElement, tableWrapper.nextSibling);
  }

  // 新增：總額顯示/隱藏的控制
  const showTotalsCheckbox = document.getElementById("show-totals");
  if (showTotalsCheckbox) {
    // 確保總計信息預設顯示
    infoElement.style.display = showTotalsCheckbox.checked ? "block" : "none";

    // 重新綁定事件監聽器，確保始終與最新的總計信息元素保持一致
    showTotalsCheckbox.addEventListener("change", function () {
      const totalInfoElement = document.querySelector(".table-info");
      if (totalInfoElement) {
        totalInfoElement.style.display = this.checked ? "block" : "none";
      }
    });
  }
  
  // 添加下載Excel功能
  const downloadExcelBtn = document.getElementById("download-excel-btn");
  if (downloadExcelBtn) {
    downloadExcelBtn.addEventListener("click", function() {
      console.log("準備下載Excel檔案...");
      if (typeof XLSX === 'undefined') {
        console.error("SheetJS庫未載入，無法下載Excel");
        alert("Excel功能暫時無法使用，請稍後再試。");
        return;
      }
      
      try {
        // 準備工作表數據
        const wsData = [['\u5238\u5546', '\u7522\u54c1', '\u8cac\u4efb\u984d', '\u52df\u96c6\u671f\u9593']];
        data.forEach(row => wsData.push(row));
        
        // 創建工作表
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // 創建工作簿並添加工作表
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '\u8cac\u4efb\u984d\u6578\u64da');
        
        // 下載Excel檔案
        XLSX.writeFile(wb, 'IPO責任額數據.xlsx');
        console.log("Excel檔案下載成功");
      } catch (error) {
        console.error("Excel檔案生成失敗:", error);
      }
    });
  }
}

// 初始化數據視覺化
function initDataVisualizations(data) {
  console.log("初始化數據視覺化");
  // 確保先移除可能已存在的舊圖表容器，避免重複添加
  const existingViz = document.querySelector(".data-visualization");
  if (existingViz) {
    existingViz.remove();
  }

  const visualizationContainer = document.createElement("div");
  visualizationContainer.className =
    "data-visualization grid grid-cols-1 md:grid-cols-2 gap-8 mt-8";

  // 將圖表容器附加到 .overflow-x-auto 區域的末尾，以獲得更穩定的佈局
  const mainContentArea = document.querySelector(".overflow-x-auto");
  if (mainContentArea) {
    mainContentArea.appendChild(visualizationContainer);
  } else {
    console.error("找不到 .overflow-x-auto 容器來附加數據視覺化區塊");
    // 作為備用，嘗試附加到 body，但這可能不是理想的佈局
    document.body.appendChild(visualizationContainer);
  }

  try {
    createBrokerComparisonChart(data, visualizationContainer);
    createTimeSeriesChart(data, visualizationContainer);
  } catch (error) {
    console.error("圖表初始化失敗:", error);
  }
}

// 創建券商責任額比較圖表
function createBrokerComparisonChart(data, container) {
  const brokerData = {};
  data.forEach((item) => {
    const broker = item[0];
    const amount = parseInt(item[2]);
    if (!isNaN(amount)) {
      if (!brokerData[broker]) brokerData[broker] = 0;
      brokerData[broker] += amount;
    }
  });

  const labels = Object.keys(brokerData).sort(
    (a, b) => brokerData[b] - brokerData[a]
  );
  const chartData = labels.map((key) => brokerData[key]);

  const chartContainer = document.createElement("div");
  chartContainer.className = "chart-container bg-white rounded-lg shadow-card";
  chartContainer.innerHTML = `
    <div class="chart-title p-4">各券商總責任額比較</div>
    <div class="p-4 pb-6">
      <canvas id="broker-chart" height="250"></canvas>
    </div>
  `;
  container.appendChild(chartContainer);

  const ctx = document.getElementById("broker-chart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "總責任額 (萬元)",
          data: chartData,
          backgroundColor: "rgba(26, 93, 122, 0.7)",
          borderColor: "rgba(26, 93, 122, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: "top" },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${
                context.dataset.label
              }: ${context.raw.toLocaleString()} 萬元`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value.toLocaleString();
            },
          },
        },
      },
    },
  });
}

// 創建責任額時間趨勢圖表
function createTimeSeriesChart(data, container) {
  const timeData = {};
  data.forEach((item) => {
    const periodMatch = item[3].match(/(\d+)\/(\d+)\/(\d+)-/);
    if (periodMatch) {
      const year = parseInt(periodMatch[1]);
      const month = parseInt(periodMatch[2]);
      const dateKey = `${year}/${month.toString().padStart(2, "0")}`;
      const amount = parseInt(item[2]);
      if (!isNaN(amount)) {
        if (!timeData[dateKey]) {
          timeData[dateKey] = { totalAmount: 0, count: 0, maxAmount: 0 };
        }
        timeData[dateKey].totalAmount += amount;
        timeData[dateKey].count += 1;
        timeData[dateKey].maxAmount = Math.max(
          timeData[dateKey].maxAmount,
          amount
        );
      }
    }
  });

  const sortedDates = Object.keys(timeData).sort();
  const averageData = sortedDates.map((date) =>
    Math.round(timeData[date].totalAmount / timeData[date].count)
  );
  const maxData = sortedDates.map((date) => timeData[date].maxAmount);

  const chartContainer = document.createElement("div");
  chartContainer.className = "chart-container bg-white rounded-lg shadow-card";
  chartContainer.innerHTML = `
    <div class="chart-title p-4">責任額時間趨勢</div>
    <div class="p-4 pb-6">
      <canvas id="time-series-chart" height="250"></canvas>
    </div>
  `;
  container.appendChild(chartContainer);

  const ctx = document.getElementById("time-series-chart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: sortedDates,
      datasets: [
        {
          label: "平均責任額 (萬元)",
          data: averageData,
          backgroundColor: "rgba(226, 62, 87, 0.2)",
          borderColor: "rgba(226, 62, 87, 1)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
        {
          label: "最高責任額 (萬元)",
          data: maxData,
          backgroundColor: "rgba(26, 93, 122, 0.2)",
          borderColor: "rgba(26, 93, 122, 1)",
          borderWidth: 2,
          tension: 0.3,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: "top" },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${
                context.dataset.label
              }: ${context.raw.toLocaleString()} 萬元`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value.toLocaleString();
            },
          },
        },
      },
    },
  });
}

// 設置事件監聽器
function setupEventListeners() {
  window.addEventListener("resize", function () {
    if (
      window.innerWidth >= 768 &&
      !productTableInitialized &&
      csvData.length > 0
    ) {
      prepareProductTableContainer();
      initViewButtons();
    }
  });
}

// 顯示詳細資料模態框 (僅手機版)
function showDetailModal(data) {
  let modal = document.getElementById("data-detail-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "data-detail-modal";
    modal.className =
      "fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center hidden";
    modal.innerHTML = `
      <div class="bg-white dark:bg-neutral-800 rounded-lg w-5/6 max-w-md overflow-hidden">
        <div class="p-4 bg-secondary text-white">
          <h3 class="text-lg font-bold product-title"></h3>
        </div>
        <div class="p-4">
          <div class="mb-3">
            <strong>券商：</strong><span class="broker"></span>
          </div>
          <div class="mb-3">
            <strong>責任額：</strong><span class="responsibility"></span>萬
          </div>
          <div class="mb-3">
            <strong>募集期間：</strong><span class="period"></span>
          </div>
          <div class="mt-6 text-right">
            <button class="close-modal px-4 py-2 bg-neutral-200 rounded">關閉</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector(".close-modal").addEventListener("click", function () {
      modal.classList.add("hidden");
    });

    modal.addEventListener("click", function (e) {
      if (e.target === modal) modal.classList.add("hidden");
    });
  }

  modal.querySelector(".product-title").textContent = data[1];
  modal.querySelector(".broker").textContent = data[0];
  modal.querySelector(".responsibility").textContent = data[2];
  modal.querySelector(".period").textContent = data[3];
  modal.classList.remove("hidden");
}

// 生成關鍵 insights 和統計數據
function generateKeyInsights() {
  if (!window.csvData || window.csvData.length === 0) {
    console.error("csvData 未就緒，無法生成 insights");
    return;
  }

  const rows = window.csvData.map((r) => ({
    broker: r[0],
    product: r[1],
    amount: Number(r[2]) || 0,
    period: r[3],
  }));

  const y113 = rows.filter((r) => r.period.startsWith("113/"));
  const y114 = rows.filter((r) => r.period.startsWith("114/"));

  const max113 = Math.max(...y113.map((r) => r.amount));
  const max114 = Math.max(...y114.map((r) => r.amount));
  const avg113 = Math.round(
    y113.reduce((s, r) => s + r.amount, 0) / y113.length
  );

  const avgDays113 = (
    y113.reduce((s, r) => s + days(r.period), 0) / y113.length
  ).toFixed(1);
  const avgDays114 = (
    y114.reduce((s, r) => s + days(r.period), 0) / y114.length
  ).toFixed(1);

  const timeKey = (r) => r.period.slice(0, 8);
  const comboMap = {};
  rows.forEach((r) => {
    const key = r.broker + "_" + timeKey(r);
    comboMap[key] = (comboMap[key] || 0) + 1;
  });
  const maxCombo = Math.max(...Object.values(comboMap));

  const productMap = {};
  rows.forEach((r) => {
    productMap[r.product] = productMap[r.product] || [];
    productMap[r.product].push(r.amount);
  });
  const maxGap = Math.max(
    ...Object.values(productMap).map(
      (arr) => Math.max(...arr) - Math.min(...arr)
    )
  );

  const format = (num) => num.toLocaleString();
  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = format(val);
  };

  setText("avg113", avg113);
  setText("max114", max114);
  setText("avgDays113", avgDays113);
  setText("avgDays114", avgDays114);
  setText("maxCombo", maxCombo);
  setText("maxGap", maxGap);

  document
    .querySelectorAll(
      "#avg113, #max114, #avgDays113, #avgDays114, #maxCombo, #maxGap"
    )
    .forEach((counter) => {
      let start = 0;
      const endVal = Number(counter.textContent.replace(/,/g, ""));
      const step = Math.ceil(endVal / 60);
      const tick = () => {
        start += step;
        if (start >= endVal) {
          counter.textContent = format(endVal);
        } else {
          counter.textContent = format(start);
          requestAnimationFrame(tick);
        }
      };
      tick();
    });
}

// 輔助函數：計算天數
function days(period) {
  if (!period || !period.includes("-")) return 0;
  const [start, end] = period.split("-");
  return 7; // 簡單估計
}

// 輔助函數：動態載入腳本
function loadScript(url, callback) {
  console.log("動態載入腳本:", url);
  const script = document.createElement("script");
  script.src = url;
  script.onload = function() {
    console.log("腳本載入成功:", url);
    if (callback) callback();
  };
  script.onerror = function() {
    console.error("腳本載入失敗:", url);
  };
  document.head.appendChild(script);
}

// 初始化
initEnhancedDataTable();

// 導出模組
window.enhancedDataTable = {
  init: initEnhancedDataTable,
  toggleTableView: toggleTableView
};
