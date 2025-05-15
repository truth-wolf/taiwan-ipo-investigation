/**
 * tableUtil.js - 表格功能增強模組
 *
 * 負責處理與表格相關的功能增強:
 * - 固定標頭和列
 * - 優化表格顯示與性能
 * - 提供表格視圖切換支援
 */

// 表格工具模組
window.tableUtil = {
  /**
   * 初始化表格增強功能
   */
  init: function () {
    console.log("TableUtil: 初始化表格功能增強模組");

    // 監聽數據加載完成事件
    document.addEventListener("ipoDataLoaded", function () {
      console.log("TableUtil: 偵測到數據加載完成，開始增強表格");
      window.tableUtil.enhanceTables();
    });

    // 監聽視圖切換按鈕
    document.addEventListener("DOMContentLoaded", function () {
      window.tableUtil.initViewSwitcher();
    });

    // 監聽窗口大小變化，重新調整表格
    window.addEventListener("resize", this.handleWindowResize.bind(this));
  },

  /**
   * 增強表格功能
   */
  enhanceTables: function () {
    // 等待表格渲染完成
    setTimeout(() => {
      this.fixTableHeaders();
      this.optimizeTableScrolling();
    }, 500);
  },

  /**
   * 固定表格標頭和列
   */
  fixTableHeaders: function () {
    console.log("TableUtil: 固定表格標頭和列");

    // 經典表格視圖標頭固定
    const classicTable = document.getElementById("csv-table");
    if (classicTable) {
      // 確保表格使用適當的佈局策略
      classicTable.style.borderCollapse = "separate";
      classicTable.style.borderSpacing = "0";

      // 固定標頭
      const headerCells = classicTable.querySelectorAll("thead th");
      headerCells.forEach((cell) => {
        cell.style.position = "sticky";
        cell.style.top = "0";
        cell.style.zIndex = "20";
        cell.style.backgroundColor = "#1a5d7a";
      });

      // 固定第一列（券商列）
      const firstCellsInRows = classicTable.querySelectorAll(
        "tbody td:first-child"
      );
      firstCellsInRows.forEach((cell) => {
        cell.style.position = "sticky";
        cell.style.left = "0";
        cell.style.zIndex = "10";
        cell.style.backgroundColor = "#fff";
      });

      // 標頭左上角單元格需要更高的z-index
      const cornerCell = classicTable.querySelector("thead th:first-child");
      if (cornerCell) {
        cornerCell.style.position = "sticky";
        cornerCell.style.left = "0";
        cornerCell.style.zIndex = "30";
      }

      console.log("TableUtil: 經典表格標頭固定完成");
    }

    // 產品表格視圖標頭固定
    const productTable = document.getElementById("product-table");
    if (productTable) {
      // 確保表格使用適當的佈局策略
      productTable.style.borderCollapse = "separate";
      productTable.style.borderSpacing = "0";

      // 固定標頭
      const headerCells = productTable.querySelectorAll("thead th");
      headerCells.forEach((cell) => {
        cell.style.position = "sticky";
        cell.style.top = "0";
        cell.style.zIndex = "20";
        cell.style.backgroundColor = "#1a5d7a";
      });

      // 固定第一列（產品列）
      const firstCellsInRows = productTable.querySelectorAll(
        "tbody td:first-child"
      );
      firstCellsInRows.forEach((cell) => {
        cell.style.position = "sticky";
        cell.style.left = "0";
        cell.style.zIndex = "10";
        cell.style.backgroundColor = "#fff";
      });

      // 固定第二列（募集期間）
      const secondCellsInRows = productTable.querySelectorAll(
        "tbody td:nth-child(2)"
      );
      secondCellsInRows.forEach((cell) => {
        cell.style.position = "sticky";
        cell.style.left = "130px";
        cell.style.zIndex = "9";
        cell.style.backgroundColor = "#fff";
      });

      // 標頭左上角單元格需要更高的z-index
      const cornerCell = productTable.querySelector("thead th:first-child");
      if (cornerCell) {
        cornerCell.style.position = "sticky";
        cornerCell.style.left = "0";
        cornerCell.style.zIndex = "30";
      }

      // 標頭第二單元格也需要高z-index
      const secondHeaderCell = productTable.querySelector(
        "thead th:nth-child(2)"
      );
      if (secondHeaderCell) {
        secondHeaderCell.style.position = "sticky";
        secondHeaderCell.style.left = "130px";
        secondHeaderCell.style.zIndex = "29";
      }

      console.log("TableUtil: 產品表格標頭固定完成");
    }
  },

  /**
   * 優化表格滾動性能
   */
  optimizeTableScrolling: function () {
    // 避免滾動時重新計算佈局
    const tables = document.querySelectorAll("table");
    tables.forEach((table) => {
      // 使用transform: translateZ(0)來啟用硬件加速
      table.style.transform = "translateZ(0)";

      // 防止滾動時布局重排
      const tableContainer =
        table.closest(".table-wrapper") || table.parentElement;
      if (tableContainer) {
        tableContainer.style.overflow = "auto";
        tableContainer.style.willChange = "transform";
      }
    });
  },

  /**
   * 初始化視圖切換器
   */
  initViewSwitcher: function () {
    console.log("TableUtil: 初始化視圖切換器");

    // 桌面版視圖切換
    const classicViewBtn = document.getElementById("classic-view-btn");
    const productViewBtn = document.getElementById("product-view-btn");

    if (classicViewBtn && productViewBtn) {
      classicViewBtn.addEventListener("click", () =>
        this.switchTableView("classic")
      );
      productViewBtn.addEventListener("click", () =>
        this.switchTableView("product")
      );
    }

    // 移動版視圖切換
    const mobileClassicBtn = document.getElementById("mobile-classic-btn");
    const mobileProductBtn = document.getElementById("mobile-product-btn");

    if (mobileClassicBtn && mobileProductBtn) {
      mobileClassicBtn.addEventListener("click", () => {
        this.switchTableView("classic");
        mobileClassicBtn.classList.add("active");
        mobileProductBtn.classList.remove("active");
      });

      mobileProductBtn.addEventListener("click", () => {
        this.switchTableView("product");
        mobileProductBtn.classList.add("active");
        mobileClassicBtn.classList.remove("active");
      });
    }
  },

  /**
   * 切換表格視圖
   */
  switchTableView: function (viewType) {
    console.log(`TableUtil: 切換表格視圖至 ${viewType}`);

    const classicViewTable = document.querySelector(".classic-view-table");
    const productViewTable = document.getElementById("product-table-container");

    if (!classicViewTable || !productViewTable) {
      console.warn("TableUtil: 找不到表格視圖容器");
      return;
    }

    const classicViewBtn = document.getElementById("classic-view-btn");
    const productViewBtn = document.getElementById("product-view-btn");

    if (viewType === "classic") {
      // 顯示經典視圖
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

      // 手機版處理
      if (window.innerWidth < 768) {
        classicViewTable.classList.add("visible");
        productViewTable.classList.remove("visible");
      }
    } else if (viewType === "product") {
      // 確保產品表格已初始化
      this.ensureProductTableInitialized();

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

      // 手機版處理
      if (window.innerWidth < 768) {
        classicViewTable.classList.remove("visible");
        productViewTable.classList.add("visible");
      }
    }

    // 切換後重新固定表頭
    setTimeout(() => this.fixTableHeaders(), 100);
  },

  /**
   * 確保產品表格已初始化
   */
  ensureProductTableInitialized: function () {
    // 檢查產品表格是否已初始化
    if (!document.getElementById("product-table")) {
      console.log("TableUtil: 產品表格尚未初始化，嘗試初始化");

      if (typeof initProductTable === "function" && window.csvData) {
        initProductTable(window.csvData);
      } else if (
        typeof window.enhancedTable !== "undefined" &&
        typeof window.enhancedTable.initProductTable === "function"
      ) {
        window.enhancedTable.initProductTable();
      } else {
        console.warn("TableUtil: 無法初始化產品表格，缺少必要函數");
      }
    }
  },

  /**
   * 處理窗口大小變化
   */
  handleWindowResize: function () {
    // 延遲執行避免頻繁調用
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      console.log("TableUtil: 窗口大小變化，重新調整表格");
      this.fixTableHeaders();

      // 自動調整至適合的視圖
      if (window.innerWidth <= 768) {
        // 移動設備下可能切換至更適合的視圖
      }
    }, 200);
  },
};

// 初始化表格工具
document.addEventListener("DOMContentLoaded", function () {
  window.tableUtil.init();
});
