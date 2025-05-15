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
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        e.preventDefault();

        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });

        const mobileMenu = document.querySelector(".mobile-menu");
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
 * 初始化數據視覺化 (「殘酷事實」區塊)
 * Waits for 'ipoDataLoaded' event from dataLoader.js or uses window.ipoProductData.
 */
function setupInsightPanelListener() {
  console.log("Main.js: setupInsightPanelListener() called.");
  const insightPanel = document.getElementById("insight-panel");
  if (!insightPanel) {
    console.warn(
      "Main.js: Insight panel element not found, cannot initialize."
    );
    return;
  }

  let dataProcessed = false; // Flag to prevent processing multiple times

  const processDataForInsightPanel = (data) => {
    if (dataProcessed) {
      console.log(
        "Main.js: Data for insight panel already processed, skipping."
      );
      return;
    }
    if (!data || data.length === 0) {
      console.warn("Main.js: No data received for Insight Panel.");
      insightPanel.innerHTML =
        '<div class="text-yellow-300 p-4">注意：數據分析區無可用資料。</div>';
      return;
    }
    console.log(
      "Main.js: Processing data for Insight Panel, length:",
      data.length
    );

    const parseMinguoDate = (minguoDateStr) => {
      if (!minguoDateStr || !minguoDateStr.includes("/")) return null;
      const parts = minguoDateStr.split("/");
      if (parts.length < 3) return null;
      const year = parseInt(parts[0], 10) + 1911;
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
      try {
        return new Date(year, month, day);
      } catch (e) {
        return null;
      }
    };
    const getDurationDays = (periodStr) => {
      if (!periodStr || !periodStr.includes("-") || periodStr.trim() === "-") {
        const partsCheck = periodStr ? periodStr.split("-") : [];
        if (
          partsCheck.length < 2 ||
          !partsCheck[0].trim() ||
          !partsCheck[1].trim()
        )
          return 0;
      }
      const [startStr, endStr] = periodStr.split("-");
      let startDate = parseMinguoDate(startStr.trim());
      let endDate = parseMinguoDate(endStr.trim());
      if (startDate && endStr.trim().split("/").length === 2) {
        const startYearMinguo = startStr.trim().split("/")[0];
        endDate = parseMinguoDate(startYearMinguo + "/" + endStr.trim());
      }
      if (!startDate || !endDate || endDate < startDate) return 0;
      const diffTime = Math.abs(endDate - startDate);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

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
    data.forEach((item) => {
      const respString = String(item.responsibility || "").trim();
      const resp = parseFloat(respString);
      if (!isNaN(resp)) {
        if (resp > maxResp) maxResp = resp;
        totalResp += resp;
        totalEntriesForAvgResp++;
      }
      const period = String(item.period || "").trim();
      const duration = getDurationDays(period);
      if (duration > 0) {
        if (duration < minDays) minDays = duration;
        totalDays += duration;
        totalEntriesForAvgDays++;
        if (!isNaN(resp)) {
          const dailyResp = resp / duration;
          dailyRespArray.push(dailyResp);
          if (dailyResp > peakAmt) {
            peakAmt = dailyResp;
            peakDateInfo = `${item.broker} ${item.product} (${period})`;
          }
        }
        const startMinguoDate = period.split("-")[0].trim();
        if (startMinguoDate && startMinguoDate.includes("/")) {
          const monthPart = startMinguoDate.split("/")[1];
          if (monthPart) {
            const jsMonth = parseInt(monthPart, 10);
            if (!isNaN(jsMonth))
              monthCounts[jsMonth] = (monthCounts[jsMonth] || 0) + 1;
          }
        }
      }
    });
    const avgResp =
      totalEntriesForAvgResp > 0 ? totalResp / totalEntriesForAvgResp : 0;
    const ratioResp = avgResp > 0 ? maxResp / avgResp : 0;
    const avgDays =
      totalEntriesForAvgDays > 0 ? totalDays / totalEntriesForAvgDays : 0;
    const cutPct = avgDays > 0 ? Math.max(0, ((30 - avgDays) / 30) * 100) : 0;
    if (minDays === Infinity) minDays = 0;
    let hellMonth = 0,
      hellCount = 0;
    for (const monthKey in monthCounts) {
      if (monthCounts[monthKey] > hellCount) {
        hellCount = monthCounts[monthKey];
        hellMonth = parseInt(monthKey, 10);
      }
    }
    const avgPerDay =
      dailyRespArray.length > 0
        ? dailyRespArray.reduce((a, b) => a + b, 0) / dailyRespArray.length
        : 0;
    const hrQuota = avgPerDay > 0 ? avgPerDay / 8 : 0;

    const updateElementTextAndPrepareForAnimation = (
      id,
      value,
      fractionDigits = 0
    ) => {
      const element = document.getElementById(id);
      if (element) {
        let textValue =
          typeof value === "number"
            ? value.toFixed(fractionDigits)
            : String(value);
        element.textContent = textValue;
        if (element.classList.contains("counter"))
          element.dataset.target = textValue;
      } else {
        console.warn(
          `Main.js: Element with id '${id}' not found for insight panel.`
        );
      }
    };
    updateElementTextAndPrepareForAnimation("ins-maxResp", maxResp);
    updateElementTextAndPrepareForAnimation("ins-avgResp", avgResp, 1);
    updateElementTextAndPrepareForAnimation("ins-ratioResp", ratioResp, 1);
    updateElementTextAndPrepareForAnimation("ins-avgDays", avgDays, 1);
    updateElementTextAndPrepareForAnimation("ins-minDays", minDays);
    updateElementTextAndPrepareForAnimation("ins-cutPct", cutPct);
    updateElementTextAndPrepareForAnimation(
      "ins-hellMonth",
      hellMonth || "N/A"
    );
    updateElementTextAndPrepareForAnimation("ins-hellCount", hellCount);
    updateElementTextAndPrepareForAnimation("ins-avgPerDay", avgPerDay, 1);
    updateElementTextAndPrepareForAnimation("ins-hrQuota", hrQuota, 1);
    updateElementTextAndPrepareForAnimation("ins-peakDate", peakDateInfo);
    updateElementTextAndPrepareForAnimation("ins-peakAmt", peakAmt, 1);

    console.log("Main.js: Insight panel data updated.");
    dataProcessed = true; // Set flag
    if (
      window.animationsModule &&
      typeof window.animationsModule.reobserveCounters === "function"
    ) {
      window.animationsModule.reobserveCounters(
        insightPanel.querySelectorAll(".counter")
      );
    }
  };

  document.addEventListener("ipoDataLoaded", function (event) {
    console.log("Main.js: Event 'ipoDataLoaded' received.");
    processDataForInsightPanel(event.detail);
  });

  // Optional: Attempt to process if data already exists and event was missed (e.g. script order)
  // This should be used cautiously or if DOMContentLoaded order can be guaranteed for dataLoader first.
  // setTimeout(() => {
  //   if (!dataProcessed && window.ipoProductData) {
  //      console.log("Main.js: Processing pre-existing window.ipoProductData for insight panel.");
  //      processDataForInsightPanel(window.ipoProductData);
  //   }
  // }, 500); // Delay to give event listener a chance
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
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        e.preventDefault();

        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });

        const mobileMenu = document.querySelector(".mobile-menu");
        if (mobileMenu && mobileMenu.classList.contains("flex")) {
          mobileMenu.classList.add("hidden");
          mobileMenu.classList.remove("flex");
        }
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

// 輔助函數：動態載入腳本
function loadScript(url, callback) {
  const script = document.createElement("script");
  script.src = url;
  script.onload = callback;
  document.head.appendChild(script);
}

// 檢舉信範本載入功能已移至dataLoader.js
