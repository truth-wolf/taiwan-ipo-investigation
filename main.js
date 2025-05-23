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
    if (progressLine) {
      const windowHeight = window.innerHeight;
      const documentHeight =
        document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;
      const width = (scrollTop / documentHeight) * 100 + "%";
      progressLine.style.width = width;
    }
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

// 全局變量來存儲圖表實例
let radarChart = null;
let categoriesChart = null;
let emotionRadarChart = null;

function initDataVisualization() {
  try {
    console.log("正在初始化數據視覺化...");

    // 清理現有圖表實例
    if (radarChart) {
      radarChart.destroy();
      radarChart = null;
    }
    if (categoriesChart) {
      categoriesChart.destroy();
      categoriesChart = null;
    }
    if (emotionRadarChart) {
      emotionRadarChart.destroy();
      emotionRadarChart = null;
    }

    // 雷達圖
    const radarChartEl = document.getElementById("radar-chart");
    if (radarChartEl && radarChartEl.getContext) {
      const radarCtx = radarChartEl.getContext("2d");

      // 使用 Chart.js 建立雷達圖
      radarChart = new Chart(radarCtx, {
        type: "radar",
        data: {
          labels: ["壓迫", "焦慮", "無奈", "羞辱", "憤怒"],
          datasets: [
            {
              label: "IPO 心理影響",
              data: [8, 7, 9, 6, 8],
              fill: true,
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "rgb(255, 99, 132)",
              pointBackgroundColor: "rgb(255, 99, 132)",
              pointBorderColor: "#fff",
              pointHoverBackgroundColor: "#fff",
              pointHoverBorderColor: "rgb(255, 99, 132)",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          elements: {
            line: {
              borderWidth: 3,
            },
          },
          plugins: {
            legend: {
              display: true,
              position: "bottom",
            },
          },
        },
      });
    } else {
      console.warn("找不到雷達圖畫布元素或無法獲取繪圖上下文");
    }

    // 類別圖表
    const categoriesChartEl = document.getElementById("categories-chart");
    if (categoriesChartEl && categoriesChartEl.getContext) {
      const categoriesCtx = categoriesChartEl.getContext("2d");

      // 使用 Chart.js 建立橫條圖
      categoriesChart = new Chart(categoriesCtx, {
        type: "bar",
        data: {
          labels: ["券商", "銀行", "保險", "金控", "其他"],
          datasets: [
            {
              label: "回報案例數",
              data: [35, 28, 15, 12, 5],
              backgroundColor: [
                "rgba(255, 99, 132, 0.5)",
                "rgba(54, 162, 235, 0.5)",
                "rgba(255, 206, 86, 0.5)",
                "rgba(75, 192, 192, 0.5)",
                "rgba(153, 102, 255, 0.5)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: "y",
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              beginAtZero: true,
            },
          },
        },
      });
    } else {
      console.warn("找不到類別圖表畫布元素或無法獲取繪圖上下文");
    }

    // 情緒雷達圖
    const emotionRadarChartEl = document.getElementById("emotion-radar-chart");
    if (emotionRadarChartEl && emotionRadarChartEl.getContext) {
      const emotionRadarCtx = emotionRadarChartEl.getContext("2d");

      emotionRadarChart = new Chart(emotionRadarCtx, {
        type: "radar",
        data: {
          labels: [
            "無奈感",
            "被欺壓感",
            "羞辱感",
            "性別歧視感",
            "侮辱性",
            "恐懼焦慮",
            "壓迫性",
            "情緒爆點",
            "委屈沉默",
            "語氣強度",
          ],
          datasets: [
            {
              label: "情緒指標分析",
              data: [8, 9, 7, 3, 7, 8, 9, 8, 8, 8],
              fill: true,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgb(75, 192, 192)",
              pointBackgroundColor: "rgb(75, 192, 192)",
              pointBorderColor: "#fff",
              pointHoverBackgroundColor: "#fff",
              pointHoverBorderColor: "rgb(75, 192, 192)",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          elements: {
            line: {
              borderWidth: 2,
            },
          },
          plugins: {
            legend: {
              display: true,
              position: "bottom",
            },
          },
        },
      });
    } else {
      console.warn("找不到情緒雷達圖畫布元素或無法獲取繪圖上下文");
    }

    console.log("數據視覺化初始化完成！");
  } catch (error) {
    console.error("數據視覺化初始化失敗：", error);
  }
}

// 在頁面卸載時清理圖表實例
window.addEventListener("beforeunload", () => {
  if (radarChart) radarChart.destroy();
  if (categoriesChart) categoriesChart.destroy();
  if (emotionRadarChart) emotionRadarChart.destroy();
});

// 金融業內部對話資料庫
const dialogueDatabase = [
  {
    timestamp: "2025-05-15T10:20:44",
    originalQuote:
      "最常聽到的是：「這責任額不高啦，大家都做得到了，就差你了」、「你這樣年終可能不保喔」，還有一句幾乎每次IPO都會聽到的：「錢自己準備好，必要的話就信貸一下，不然這季怎麼過？」",
    innerThought:
      "深感被當作業績工具而非專業人士，壓力巨大至影響身心健康，渴望尊嚴與合理工作環境，呼籲停止剝削。",
    refinedQuote:
      "主管以「責任額不高、大家都做到、影響年終、自己信貸、不夠努力、不做就滾、剝奪客戶」等話術施壓。",
    pressureScore: 10,
    anxietyScore: 9,
    intensityScore: 9,
    nlpScore: 80,
    keyQuote: "我想好好工作，不想靠信貸生存；我想被當作人看，而不是業績工具。",
  },
  {
    timestamp: "2025-05-15T11:23:39",
    originalQuote:
      "主管在他的私人辦公室對某同事大吼：不然你去告我啊！你這麼厲害你去告嘛！？全辦公室都聽得到的聲音，只因為同事去爭取被移轉出去的客戶的權益",
    innerThought: "主管過分，IPO事件後稍收斂，仍暗示別惹事否則不好過。",
    refinedQuote: "主管辦公室大吼「不然你去告我啊！」，全辦公室聽聞。",
    pressureScore: 9,
    anxietyScore: 7,
    intensityScore: 8,
    nlpScore: 74,
    keyQuote: "「不然你去告我啊！」主管囂張跋扈，事後仍暗示報復。",
  },
  {
    timestamp: "2025-05-15T11:25:29",
    originalQuote: "業績做不到年底考績怎麼打？最近要做行員適評性，乖一點吧！",
    innerThought: "銀行非保險公司，別逼賣保險。主管靠奉承上位，沒實力請閉嘴。",
    refinedQuote: "「業績做不到，考績怎麼打？乖一點！」主管以考績威脅。",
    pressureScore: 8,
    anxietyScore: 7,
    intensityScore: 7,
    nlpScore: 68,
    keyQuote: "「業績做不到，考績怎麼打？乖一點！」主管以考績威脅。",
  },
  {
    timestamp: "2025-05-15T11:25:55",
    originalQuote: "其他人都做得到，你為什麼做不到，那你要檢討自己的問題嘛！",
    innerThought: "恐嚇話語如擠壓氣球，壓力過大會爆開。",
    refinedQuote: "「別人都做到，你為何做不到？檢討自己！」主管施壓。",
    pressureScore: 8,
    anxietyScore: 7,
    intensityScore: 7,
    nlpScore: 68,
    keyQuote: "「別人都做到，你為何做不到？檢討自己！」主管施壓。",
  },
  {
    timestamp: "2025-05-15T11:28:10",
    originalQuote:
      "1.我沒有要你買！我要你去行銷！ 2.大家都做到了，為什麼你現在都還沒做到？ （一直以約談的名義實則逼到讓你自己買，因為沒有直接說出要你買，所以持續老神在在）",
    innerThought:
      "拒絕被逼自購，薪水微薄是來賺錢非買工作。投資應你情我願，而非強迫推銷，花錢買卡無意義。",
    refinedQuote:
      "主管表面喊行銷，實則逼員工自購：「大家都做到，你為何還沒？」",
    pressureScore: 9,
    anxietyScore: 8,
    intensityScore: 8,
    nlpScore: 77,
    keyQuote: "主管表面喊行銷，實則逼員工自購：「大家都做到，你為何還沒？」",
  },
];

// 增強的彩蛋功能
document.addEventListener("DOMContentLoaded", function () {
  // 獲取彩蛋相關元素
  const secretTrigger = document.getElementById("secret-trigger");
  const moodTrigger = document.getElementById("mood-trigger");
  const easterEggDialog = document.getElementById("easter-egg-dialog");
  const easterEggClose = document.getElementById("easter-egg-close");
  const easterEggLoading = document.getElementById("easter-egg-loading");
  const easterEggMessage = document.getElementById("easter-egg-message");
  const quoteText = document.getElementById("quote-text");
  const innerThoughtText = document.getElementById("inner-thought-text");
  const pressureScore = document.getElementById("pressure-score");
  const anxietyScore = document.getElementById("anxiety-score");
  const intensityScore = document.getElementById("intensity-score");
  const nlpScore = document.getElementById("nlp-score");
  const prevButton = document.getElementById("easter-egg-prev");
  const nextButton = document.getElementById("easter-egg-next");
  const understandButton = document.getElementById("easter-egg-understand");
  const moodParticles = document.getElementById("mood-particles");

  let currentDialogueIndex = 0;
  let clickCount = 0;
  let dialogueShown = false;
  let secretTimeoutId = null;

  // 隱藏彩蛋觸發計數
  const triggerEasterEgg = () => {
    clickCount++;

    if (secretTimeoutId) {
      clearTimeout(secretTimeoutId);
    }

    secretTimeoutId = setTimeout(() => {
      if (clickCount >= 5) {
        showMoodTrigger();
      }
      clickCount = 0;
    }, 3000);

    if (clickCount >= 10 && !dialogueShown) {
      showEasterEggDialog();
    }
  };

  // 顯示心情觸發器
  const showMoodTrigger = () => {
    moodTrigger.style.opacity = "1";
    moodTrigger.style.transform = "scale(1)";

    // 為了吸引注意力，添加一些輕微振動
    moodTrigger.animate(
      [
        { transform: "scale(1) rotate(-5deg)" },
        { transform: "scale(1.1) rotate(5deg)" },
        { transform: "scale(1) rotate(0deg)" },
      ],
      {
        duration: 500,
        iterations: 3,
      }
    );
  };

  // 顯示彩蛋對話框
  const showEasterEggDialog = () => {
    dialogueShown = true;
    easterEggDialog.classList.remove("hidden");
    easterEggDialog.classList.add("flex");

    // 模擬載入
    setTimeout(() => {
      easterEggLoading.classList.add("hidden");
      easterEggMessage.classList.remove("hidden");
      updateDialogueContent(currentDialogueIndex);
    }, 1000);

    // 動畫效果
    const dialogBox = easterEggDialog.querySelector(".bg-white");
    dialogBox.animate(
      [
        { transform: "translateY(50px) scale(0.9)", opacity: 0 },
        { transform: "translateY(0) scale(1)", opacity: 1 },
      ],
      {
        duration: 300,
        easing: "ease-out",
      }
    );
  };

  // 隱藏彩蛋對話框
  const hideEasterEggDialog = () => {
    const dialogBox = easterEggDialog.querySelector(".bg-white");

    dialogBox.animate(
      [
        { transform: "translateY(0) scale(1)", opacity: 1 },
        { transform: "translateY(20px) scale(0.95)", opacity: 0 },
      ],
      {
        duration: 200,
        easing: "ease-in",
      }
    ).onfinish = () => {
      easterEggDialog.classList.add("hidden");
      easterEggDialog.classList.remove("flex");
      easterEggMessage.classList.add("hidden");
      easterEggLoading.classList.remove("hidden");
    };
  };

  // 更新對話內容
  const updateDialogueContent = (index) => {
    const dialogue = dialogueDatabase[index];

    // 動態展現對話文字效果
    quoteText.textContent = "";
    innerThoughtText.textContent = "";

    // 重設評分
    pressureScore.textContent = "";
    anxietyScore.textContent = "";
    intensityScore.textContent = "";
    nlpScore.textContent = "";

    // 逐字顯示引述
    typeText(quoteText, dialogue.refinedQuote, 30, () => {
      // 完成後顯示內心想法
      typeText(innerThoughtText, dialogue.innerThought, 30, () => {
        // 評分動畫
        animateCounter(pressureScore, dialogue.pressureScore);
        animateCounter(anxietyScore, dialogue.anxietyScore);
        animateCounter(intensityScore, dialogue.intensityScore);
        animateCounter(nlpScore, dialogue.nlpScore);
      });
    });
  };

  // 文字打字機效果
  const typeText = (element, text, speed, callback) => {
    let i = 0;

    const typing = () => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typing, speed);
      } else if (callback) {
        callback();
      }
    };

    typing();
  };

  // 數字計數動畫
  const animateCounter = (element, target) => {
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();

    const updateCounter = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

      const currentValue = Math.floor(easeProgress * target);
      element.textContent = currentValue;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    };

    requestAnimationFrame(updateCounter);
  };

  // 生成粒子效果
  const createParticles = (mood) => {
    moodParticles.classList.remove("hidden");
    moodParticles.innerHTML = "";

    let particleCount = 30;
    let colors = ["#FFD700", "#FF6B6B", "#4ECDC4"];

    if (mood === "angry") {
      colors = ["#FF4136", "#FF851B", "#FFDC00"];
    } else if (mood === "sad") {
      colors = ["#0074D9", "#7FDBFF", "#39CCCC"];
    }

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.classList.add("particle");

      // 隨機化粒子屬性
      const size = Math.random() * 15 + 5;
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      const speed = Math.random() * 3 + 1;
      const angle = Math.random() * 360;
      const rotation = Math.random() * 360;
      const colorIndex = Math.floor(Math.random() * colors.length);

      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.backgroundColor = colors[colorIndex];
      particle.style.transform = `rotate(${rotation}deg)`;

      // 添加粒子動畫
      particle.animate(
        [
          { transform: `translate(0, 0) rotate(${rotation}deg)`, opacity: 1 },
          {
            transform: `translate(${Math.cos(angle) * 100}px, ${
              -Math.sin(angle) * 100 - 100
            }px) rotate(${rotation + 360}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: 2000 + Math.random() * 1000,
          easing: "cubic-bezier(0.1, 0.8, 0.1, 1)",
        }
      ).onfinish = () => {
        particle.remove();

        // 如果所有粒子都完成，隱藏容器
        if (moodParticles.children.length === 0) {
          moodParticles.classList.add("hidden");
        }
      };

      moodParticles.appendChild(particle);
    }
  };

  // 事件監聽
  if (secretTrigger) {
    secretTrigger.addEventListener("click", triggerEasterEgg);
  }

  if (moodTrigger) {
    moodTrigger.addEventListener("click", () => {
      const moods = ["happy", "angry", "sad"];
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      createParticles(randomMood);
    });
  }

  if (easterEggClose) {
    easterEggClose.addEventListener("click", hideEasterEggDialog);
  }

  if (understandButton) {
    understandButton.addEventListener("click", hideEasterEggDialog);
  }

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      currentDialogueIndex =
        (currentDialogueIndex - 1 + dialogueDatabase.length) %
        dialogueDatabase.length;
      updateDialogueContent(currentDialogueIndex);
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      currentDialogueIndex =
        (currentDialogueIndex + 1) % dialogueDatabase.length;
      updateDialogueContent(currentDialogueIndex);
    });
  }

  // 添加CSS樣式
  const style = document.createElement("style");
  style.textContent = `
    .particle {
      position: absolute;
      border-radius: 50%;
      opacity: 0.8;
      pointer-events: none;
    }
    
    .secret-trigger {
      position: fixed;
      bottom: 5px;
      right: 5px;
      width: 10px;
      height: 10px;
      cursor: pointer;
      z-index: 9999;
    }
    
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
      50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
    }
  `;
  document.head.appendChild(style);

  // 初始化圖表和其他UI
  initDataVisualization();
});

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
