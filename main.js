/**
 * main.js - 主要交互功能實現
 * 這個文件負責網站所有的互動功能，包括：
 * - 捲動動畫與進度追蹤
 * - 數據視覺化與計數器動畫
 * - 行動裝置選單操作
 * - 暗黑模式切換
 * - 範本複製與表單互動
 * - 彩蛋功能實現
 */

document.addEventListener("DOMContentLoaded", function () {
  // 全局變數
  const body = document.body;
  const progressLine = document.querySelector(".progress-line");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const menuClose = document.querySelector(".menu-close");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const backToTop = document.getElementById("back-to-top");
  const secretTrigger = document.getElementById("secret-trigger");
  const secretContent = document.getElementById("secret-content");
  const secretClose = document.getElementById("secret-close");
  const secretUnderstand = document.getElementById("secret-understand");
  const shareBtn = document.getElementById("share-btn");
  const shareModal = document.getElementById("share-modal");
  const shareClose = document.getElementById("share-close");
  const copyLink = document.getElementById("copy-link");
  const copyBtns = document.querySelectorAll(".copy-btn");
  const copyToast = document.getElementById("copy-toast");
  const templateEditor = document.getElementById("template-editor");
  const editorPlaceholder = document.getElementById("editor-placeholder");
  const templateContent = document.getElementById("template-content");
  const downloadTemplate = document.getElementById("download-template");

  // 閱讀進度條
  window.addEventListener("scroll", function () {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrollTop = window.scrollY;
    const width = (scrollTop / documentHeight) * 100 + "%";
    progressLine.style.width = width;
  });

  // 行動選單
  if (menuToggle && mobileMenu && menuClose) {
    menuToggle.addEventListener("click", function () {
      mobileMenu.classList.remove("hidden");
      mobileMenu.classList.add("flex");
    });

    menuClose.addEventListener("click", function () {
      mobileMenu.classList.add("hidden");
      mobileMenu.classList.remove("flex");
    });
  }

  // 暗黑模式切換
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", function () {
      body.classList.toggle("dark-mode");
      darkModeToggle.innerHTML = body.classList.contains("dark-mode")
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';

      // 保存使用者偏好
      localStorage.setItem("darkMode", body.classList.contains("dark-mode"));
    });

    // 檢查使用者之前的偏好
    if (localStorage.getItem("darkMode") === "true") {
      body.classList.add("dark-mode");
      darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }

  // 回到頂部按鈕
  if (backToTop) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 500) {
        backToTop.classList.remove("opacity-0", "invisible", "translate-y-10");
        backToTop.classList.add("opacity-100", "visible", "translate-y-0");
      } else {
        backToTop.classList.add("opacity-0", "invisible", "translate-y-10");
        backToTop.classList.remove("opacity-100", "visible", "translate-y-0");
      }
    });

    backToTop.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // 彩蛋功能
  if (secretTrigger && secretContent && secretClose && secretUnderstand) {
    let secretClickCount = 0;

    secretTrigger.addEventListener("click", function () {
      secretClickCount++;

      if (secretClickCount >= 3) {
        secretContent.classList.remove("hidden");
        secretContent.classList.add("flex");
        secretClickCount = 0;
      }
    });

    secretClose.addEventListener("click", function () {
      secretContent.classList.add("hidden");
      secretContent.classList.remove("flex");
    });

    secretUnderstand.addEventListener("click", function () {
      secretContent.classList.add("hidden");
      secretContent.classList.remove("flex");
    });

    // 鍵盤組合觸發彩蛋（Ctrl+Shift+X）
    document.addEventListener("keydown", function (e) {
      if (e.ctrlKey && e.shiftKey && e.key === "X") {
        secretContent.classList.remove("hidden");
        secretContent.classList.add("flex");
      }
    });
  }

  // 分享功能
  if (shareBtn && shareModal && shareClose) {
    shareBtn.addEventListener("click", function () {
      shareModal.classList.remove("hidden");
      shareModal.classList.add("flex");
    });

    shareClose.addEventListener("click", function () {
      shareModal.classList.add("hidden");
      shareModal.classList.remove("flex");
    });

    // 點擊分享模態框以外的地方關閉
    shareModal.addEventListener("click", function (e) {
      if (e.target === shareModal) {
        shareModal.classList.add("hidden");
        shareModal.classList.remove("flex");
      }
    });

    // 分享連結複製
    if (copyLink) {
      copyLink.addEventListener("click", function () {
        const linkInput = copyLink.parentElement.querySelector("input");
        linkInput.select();
        document.execCommand("copy");

        showToast("連結已複製！");
      });
    }

    // 社群分享按鈕
    document.querySelectorAll(".share-link").forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();

        const platform = this.querySelector("span")
          .textContent.trim()
          .toLowerCase();
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(
          "台灣證券業IPO與ETF募集制度黑幕揭密 - #終結IPO制度暴力"
        );
        let shareUrl = "";

        switch (platform) {
          case "facebook":
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
          case "twitter":
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
            break;
          case "linkedin":
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            break;
          case "whatsapp":
            shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
            break;
        }

        if (shareUrl) {
          window.open(shareUrl, "_blank", "width=600,height=400");
        }
      });
    });
  }

  // 複製範本功能
  if (copyBtns.length && copyToast) {
    copyBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const templateId = this.getAttribute("data-template");
        const templateText = document.getElementById(templateId).textContent;

        // 複製到剪貼簿
        const textarea = document.createElement("textarea");
        textarea.value = templateText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);

        // 顯示範本內容
        if (editorPlaceholder && templateContent) {
          editorPlaceholder.classList.add("hidden");
          templateContent.classList.remove("hidden");
          templateContent.innerHTML = formatTemplate(templateText);
        }

        // 顯示提示
        showToast("範本已複製到剪貼簿！");

        // 點擊複製按鈕動畫效果
        this.classList.add("active");
        setTimeout(() => {
          this.classList.remove("active");
        }, 300);
      });
    });
  }

  // 下載範本功能
  if (downloadTemplate && templateContent) {
    downloadTemplate.addEventListener("click", function () {
      const templateText = templateContent.textContent;

      if (!templateText.trim()) {
        alert("請先選擇一個範本！");
        return;
      }

      // 建立 Word 文件下載
      const blob = new Blob([templateText], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "檢舉信範本.doc";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // 顯示提示函數
  function showToast(message) {
    if (!copyToast) return;

    const toast = copyToast;
    toast.querySelector("span").textContent = message;

    toast.classList.remove("opacity-0", "invisible");
    toast.classList.add("opacity-100", "visible");

    setTimeout(function () {
      toast.classList.add("opacity-0", "invisible");
      toast.classList.remove("opacity-100", "visible");
    }, 3000);
  }

  // 格式化範本函數
  function formatTemplate(text) {
    return text
      .replace(/\n\n/g, "<br><br>")
      .replace(/\n/g, "<br>")
      .replace(/（[^）]+）/g, '<span class="text-secondary">$&</span>');
  }

  // 平滑滾動
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });

        // 如果是行動選單，點擊後關閉選單
        if (mobileMenu && mobileMenu.classList.contains("flex")) {
          mobileMenu.classList.add("hidden");
          mobileMenu.classList.remove("flex");
        }
      }
    });
  });

  // 動畫效果

  // 1. 元素淡入效果
  const fadeElements = document.querySelectorAll(".fade-in");

  // 2. 數據條動畫
  const dataBars = document.querySelectorAll(".data-bar");
  const dataBarLabels = document.querySelectorAll(".data-bar span");

  // 3. 計數器動畫
  const counters = document.querySelectorAll(".counter");

  // 初始化Intersection Observer (淡入效果)
  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.1,
      rootMargin: "0px",
    }
  );

  // 觀察所有需要淡入的元素
  fadeElements.forEach((element) => {
    fadeObserver.observe(element);
  });

  // 資料條動畫 Observer
  const dataBarObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");

          // 顯示標籤
          const label = entry.target.querySelector("span");
          if (label) {
            const delay =
              parseInt(label.getAttribute("data-show-after")) || 1000;

            setTimeout(() => {
              label.style.opacity = "1";
            }, delay);
          }

          dataBarObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.5,
    }
  );

  // 觀察所有數據條
  dataBars.forEach((bar) => {
    dataBarObserver.observe(bar);
  });

  // 計數器動畫 Observer
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.getAttribute("data-target"));
          let count = 0;
          const duration = 2000; // 動畫持續時間（毫秒）
          const frameRate = 30; // 每秒幀數
          const increment = target / ((duration / 1000) * frameRate);

          const updateCounter = () => {
            count += increment;

            if (count < target) {
              counter.textContent = Math.ceil(count);
              requestAnimationFrame(updateCounter);
            } else {
              counter.textContent = target;
            }
          };

          updateCounter();
          counterObserver.unobserve(counter);
        }
      });
    },
    {
      threshold: 0.5,
    }
  );

  // 觀察所有計數器
  counters.forEach((counter) => {
    counterObserver.observe(counter);
  });

  // 數據圖表初始化 (如果有需要)
  initDataVisualization();

  // 導航選單切換
  initMobileNav();

  // 平滑滾動
  initSmoothScroll();

  // 圖表初始化
  initCharts();

  // 搜尋功能
  initSearch();

  // 移動裝置檢測與優化
  initMobileOptimization();
});

/**
 * 初始化數據視覺化
 * 根據CSV數據生成圖表或其他視覺化元素
 */
function initDataVisualization() {
  // 如果頁面中有圖表容器則初始化
  const chartContainer = document.getElementById("responsibility-chart");

  if (!chartContainer) return;

  // 使用 CSV 數據繪製圖表
  // 這裡可以使用 fetch 載入 data.csv 或者從 HTML data 屬性獲取數據
  fetch("data.csv")
    .then((response) => response.text())
    .then((csvData) => {
      // 解析 CSV 數據
      const data = parseCSV(csvData);

      // 建立圖表（這裡省略具體實現）
      console.log("Data loaded:", data.length, "entries");

      // 您可以在這裡使用 Chart.js 或其他圖表庫
    })
    .catch((error) => {
      console.error("Error loading data:", error);
    });
}

/**
 * 簡單的 CSV 解析函數
 */
function parseCSV(csvText) {
  const lines = csvText.split("\n");
  const headers = lines[0].split(",");

  return lines
    .slice(1)
    .map((line) => {
      if (!line.trim()) return null;

      const values = line.split(",");
      const entry = {};

      headers.forEach((header, i) => {
        entry[header.trim()] = values[i]?.trim() || "";
      });

      return entry;
    })
    .filter(Boolean);
}

// 初始化移動裝置選單
function initMobileNav() {
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      mobileMenu.classList.toggle("hidden");
      document.body.classList.toggle("overflow-hidden");
    });

    // 點擊選單項目後自動關閉選單
    const mobileMenuItems = mobileMenu.querySelectorAll("a");
    mobileMenuItems.forEach((item) => {
      item.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
        document.body.classList.remove("overflow-hidden");
      });
    });
  }
}

// 平滑滾動
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
}

// 初始化圖表
function initCharts() {
  // 檢查是否有圖表容器
  const chartContainers = document.querySelectorAll(".chart-container");
  if (chartContainers.length === 0) return;

  // 如果存在圖表，載入Chart.js
  loadScript(
    "https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js",
    function () {
      // 責任額統計圖
      const quotaChartEl = document.getElementById("quota-chart");
      if (quotaChartEl) {
        const ctx = quotaChartEl.getContext("2d");
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: [
              "華南",
              "富邦",
              "群益",
              "元大",
              "元富",
              "康和",
              "中信",
              "永豐",
              "凱基",
            ],
            datasets: [
              {
                label: "責任額分配 (億元)",
                data: [2.8, 5.6, 4.9, 8.5, 2.1, 1.8, 3.2, 6.4, 7.2],
                backgroundColor: [
                  "rgba(54, 162, 235, 0.6)",
                  "rgba(255, 99, 132, 0.6)",
                  "rgba(255, 206, 86, 0.6)",
                  "rgba(75, 192, 192, 0.6)",
                  "rgba(153, 102, 255, 0.6)",
                  "rgba(255, 159, 64, 0.6)",
                  "rgba(199, 199, 199, 0.6)",
                  "rgba(83, 102, 255, 0.6)",
                  "rgba(255, 99, 132, 0.6)",
                ],
                borderColor: [
                  "rgba(54, 162, 235, 1)",
                  "rgba(255, 99, 132, 1)",
                  "rgba(255, 206, 86, 1)",
                  "rgba(75, 192, 192, 1)",
                  "rgba(153, 102, 255, 1)",
                  "rgba(255, 159, 64, 1)",
                  "rgba(199, 199, 199, 1)",
                  "rgba(83, 102, 255, 1)",
                  "rgba(255, 99, 132, 1)",
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "top",
              },
              title: {
                display: true,
                text: "券商ETF責任額分配",
              },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }

      // 時間趨勢圖
      const trendChartEl = document.getElementById("trend-chart");
      if (trendChartEl) {
        const ctx = trendChartEl.getContext("2d");
        new Chart(ctx, {
          type: "line",
          data: {
            labels: [
              "2023-Q1",
              "2023-Q2",
              "2023-Q3",
              "2023-Q4",
              "2024-Q1",
              "2024-Q2",
            ],
            datasets: [
              {
                label: "ETF平均責任額 (萬元/人)",
                data: [50, 60, 80, 100, 120, 150],
                fill: false,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: "ETF責任額趨勢",
              },
            },
          },
        });
      }
    }
  );
}

// 搜尋功能
function initSearch() {
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

  if (searchInput && searchResults) {
    searchInput.addEventListener("input", function () {
      const query = this.value.toLowerCase().trim();

      if (query.length < 2) {
        searchResults.innerHTML = "";
        searchResults.classList.add("hidden");
        return;
      }

      // 模擬搜尋結果
      const results = [
        { title: "責任額制度問題", url: "#problems" },
        { title: "職場霸凌案例", url: "#impact" },
        { title: "檢舉信範本", url: "#templates" },
        { title: "ETF統計數據", url: "#data" },
      ].filter((item) => item.title.toLowerCase().includes(query));

      if (results.length > 0) {
        searchResults.innerHTML = "";
        results.forEach((result) => {
          const item = document.createElement("a");
          item.href = result.url;
          item.className = "block px-4 py-2 hover:bg-gray-100";
          item.textContent = result.title;
          item.addEventListener("click", function () {
            searchResults.classList.add("hidden");
            searchInput.value = "";
          });
          searchResults.appendChild(item);
        });
        searchResults.classList.remove("hidden");
      } else {
        searchResults.innerHTML =
          '<div class="px-4 py-2 text-gray-500">找不到相關結果</div>';
        searchResults.classList.remove("hidden");
      }
    });

    // 點擊其他地方關閉搜尋結果
    document.addEventListener("click", function (e) {
      if (
        !searchInput.contains(e.target) &&
        !searchResults.contains(e.target)
      ) {
        searchResults.classList.add("hidden");
      }
    });
  }
}

// 移動裝置優化
function initMobileOptimization() {
  // 檢測是否為移動裝置
  const isMobile = window.innerWidth <= 768;

  // 調整表格顯示
  if (isMobile) {
    const tables = document.querySelectorAll("table");
    tables.forEach((table) => {
      table.classList.add("table-mobile");
    });

    // 顯示移動裝置提示
    const mobileWarnings = document.querySelectorAll(".mobile-warning");
    mobileWarnings.forEach((warning) => {
      warning.classList.remove("hidden");
    });

    // 自動折疊長文本
    const longTexts = document.querySelectorAll(".long-text");
    longTexts.forEach((text) => {
      const content = text.innerHTML;
      const preview = content.substring(0, 100) + "...";

      const previewEl = document.createElement("div");
      previewEl.className = "preview";
      previewEl.innerHTML = preview;

      const fullEl = document.createElement("div");
      fullEl.className = "full-text hidden";
      fullEl.innerHTML = content;

      const toggleBtn = document.createElement("button");
      toggleBtn.className = "text-blue-600 text-sm mt-1";
      toggleBtn.textContent = "顯示更多";
      toggleBtn.addEventListener("click", function () {
        if (fullEl.classList.contains("hidden")) {
          fullEl.classList.remove("hidden");
          previewEl.classList.add("hidden");
          this.textContent = "顯示較少";
        } else {
          fullEl.classList.add("hidden");
          previewEl.classList.remove("hidden");
          this.textContent = "顯示更多";
        }
      });

      text.innerHTML = "";
      text.appendChild(previewEl);
      text.appendChild(fullEl);
      text.appendChild(toggleBtn);
    });
  }

  // 監聽窗口調整
  window.addEventListener("resize", function () {
    const width = window.innerWidth;

    if (width <= 768) {
      document.body.classList.add("mobile");
    } else {
      document.body.classList.remove("mobile");
    }
  });

  // 初始設置
  if (isMobile) {
    document.body.classList.add("mobile");
  }
}

// CSV資料載入功能已移至dataLoader.js

// 輔助函數：動態載入腳本
function loadScript(url, callback) {
  const script = document.createElement("script");
  script.src = url;
  script.onload = callback;
  document.head.appendChild(script);
}

// 檢舉信範本載入功能已移至dataLoader.js
