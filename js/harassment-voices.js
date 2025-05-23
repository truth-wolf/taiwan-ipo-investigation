/**
 * 職場霸凌心聲互動功能
 * 整合真實職場霸凌數據，提供互動體驗和統計展示
 */

class HarassmentVoicesModule {
  constructor() {
    this.harassmentData = [];
    this.currentCategory = "all";
    this.currentPage = 0;
    this.itemsPerPage = 3;
    this.totalBrokers = 96; // 根據證券商基本資料.csv的筆數
    this.simulatorDialogues = [
      {
        category: "威脅恐嚇",
        message:
          "「你這樣年終可能不保喔」、「錢自己準備好，必要的話就信貸一下，不然這季怎麼過？」",
        innerThought:
          "我想好好工作，不想靠信貸生存；我想被當作人看，而不是一個被逼買單的業績工具。",
      },
      {
        category: "經濟壓迫",
        message:
          "上一檔IPO沒做到，這一檔開募時，主管走到我身邊說：你上次欠我五十萬這次要補喔",
        innerThought:
          "我就想問我清清白白乾乾淨淨的進公司上班，怎麼就負債了？我領$30,000的薪水，怎麼我不賣IPO就「欠你50萬」了？？",
      },
      {
        category: "人格侮辱",
        message:
          "「妳裙子穿得比別人短，責任額跟其他男生一樣不覺得愧疚嗎」「你是女生要會利用自己優勢」",
        innerThought:
          "這根本是性騷擾，完全不能接受這種言論，我們是來工作的，不是來被騷擾的。",
      },
      {
        category: "不公對待",
        message:
          "「某主管」不守信用，有營業員自掏腰包買（保險、申購IPO基金及申購ETF)之後還被資遣",
        innerThought:
          "我們做業績都是上面的在享受，做的好是應該的，做不好只會威脅恐嚇",
      },
    ];

    // 初始化數據載入
    this.loadCSVData();
    this.init();
  }

  async loadCSVData() {
    try {
      const response = await fetch("職場霸凌真實心聲數據.csv");
      const csvText = await response.text();

      // 解析CSV數據
      const lines = csvText.split("\n");
      const headers = lines[0].split(",");

      this.harassmentData = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = this.parseCSVLine(lines[i]);
          const record = {
            序號: values[0],
            姓名: values[1],
            券商銀行: values[2],
            分類標籤: values[3],
            主管壓力話術: values[4] ? values[4].replace(/^"(.*)"$/, "$1") : "",
            內心真正想說的話: values[5]
              ? values[5].replace(/^"(.*)"$/, "$1")
              : "",
            回覆時間: values[6],
            嚴重性評分: parseInt(values[7]) || 0,
          };
          this.harassmentData.push(record);
        }
      }

      // 按嚴重性評分排序（高到低）
      this.harassmentData.sort((a, b) => b.嚴重性評分 - a.嚴重性評分);

      console.log("職場霸凌數據載入完成:", this.harassmentData.length, "筆");

      // 載入完成後更新統計和渲染卡片
      this.updateStats();
      this.loadVoiceCards();
    } catch (error) {
      console.error("載入職場霸凌數據時出錯:", error);
    }
  }

  parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  updateStats() {
    // 統計各分類數量
    const stats = {
      威脅恐嚇: this.harassmentData.filter(
        (item) => item.分類標籤 === "威脅恐嚇"
      ).length,
      經濟壓迫: this.harassmentData.filter(
        (item) => item.分類標籤 === "經濟壓迫"
      ).length,
      人格侮辱: this.harassmentData.filter(
        (item) => item.分類標籤 === "人格侮辱"
      ).length,
      不公對待: this.harassmentData.filter(
        (item) => item.分類標籤 === "不公對待"
      ).length,
    };

    console.log("統計結果:", stats);

    // 更新篩選器按鈕中的計數器
    const filterButtons = document.querySelectorAll(".voice-filter");
    filterButtons.forEach((button) => {
      const category = button.getAttribute("data-category");
      const counter = button.querySelector(".counter");
      if (counter) {
        if (category === "all") {
          counter.setAttribute(
            "data-target",
            this.harassmentData.length.toString()
          );
        } else {
          counter.setAttribute(
            "data-target",
            (stats[category] || 0).toString()
          );
        }
      }
    });

    // 更新底部統計卡片
    const statCards = {
      威脅恐嚇: stats.威脅恐嚇,
      經濟壓迫: stats.經濟壓迫,
      人格侮辱: stats.人格侮辱,
      不公對待: stats.不公對待,
    };

    // 更新統計數字顯示
    Object.keys(statCards).forEach((category) => {
      const elements = document.querySelectorAll(
        `[data-stat-category="${category}"]`
      );
      elements.forEach((el) => {
        const counter = el.querySelector(".counter");
        if (counter) {
          counter.setAttribute("data-target", statCards[category].toString());
        }
      });
    });
  }

  init() {
    this.initEventListeners();
    this.initCounters();
  }

  initEventListeners() {
    // 等待DOM載入完成後綁定事件
    setTimeout(() => {
      this.initFilters();
      this.initSimulator();
      this.initPagination();
    }, 500);
  }

  initFilters() {
    const filterButtons = document.querySelectorAll(".voice-filter");
    filterButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();

        // 移除所有活躍狀態
        filterButtons.forEach((btn) =>
          btn.classList.remove(
            "active",
            "bg-primary/10",
            "text-primary",
            "border-primary/20"
          )
        );
        filterButtons.forEach((btn) =>
          btn.classList.add("bg-neutral-50", "hover:bg-neutral-100")
        );

        // 添加活躍狀態
        button.classList.remove("bg-neutral-50", "hover:bg-neutral-100");
        button.classList.add(
          "active",
          "bg-primary/10",
          "text-primary",
          "border-primary/20"
        );

        // 更新當前分類
        this.currentCategory = button.getAttribute("data-category");
        this.currentPage = 0;

        // 重新載入卡片
        this.loadVoiceCards();
      });
    });
  }

  initSimulator() {
    const simulatorElement = document.getElementById("harassment-simulator");
    if (!simulatorElement) return;

    const messageElement = simulatorElement.querySelector(
      "#harassment-message"
    );
    const responseButtons =
      simulatorElement.querySelectorAll(".response-option");

    if (!messageElement || !responseButtons.length) return;

    let currentDialogueIndex = 0;

    // 初始化第一個對話
    this.updateSimulatorMessage(messageElement, 0);

    responseButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // 更新到下一個對話
        currentDialogueIndex =
          (currentDialogueIndex + 1) % this.simulatorDialogues.length;
        this.updateSimulatorMessage(messageElement, currentDialogueIndex);

        // 添加點擊反饋
        button.style.transform = "scale(0.95)";
        setTimeout(() => {
          button.style.transform = "scale(1)";
        }, 150);
      });
    });
  }

  updateSimulatorMessage(messageElement, index) {
    const dialogue = this.simulatorDialogues[index];
    if (!dialogue) return;

    // 打字機效果
    messageElement.innerHTML = "";
    const fullText = dialogue.message;
    let charIndex = 0;

    const typeWriter = () => {
      if (charIndex < fullText.length) {
        messageElement.innerHTML += fullText.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, 30);
      } else {
        // 顯示內心話
        setTimeout(() => {
          messageElement.innerHTML += `<br><br><span class="text-secondary font-medium">內心真正想說：</span><br><span class="text-neutral-600 italic">${dialogue.innerThought}</span>`;
        }, 500);
      }
    };

    typeWriter();
  }

  initPagination() {
    const prevButton = document.getElementById("voices-prev");
    const nextButton = document.getElementById("voices-next");

    if (prevButton) {
      prevButton.addEventListener("click", () => {
        if (this.currentPage > 0) {
          this.currentPage--;
          this.loadVoiceCards();
        }
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", () => {
        const filteredData = this.getFilteredData();
        const maxPage = Math.ceil(filteredData.length / this.itemsPerPage) - 1;

        if (this.currentPage < maxPage) {
          this.currentPage++;
          this.loadVoiceCards();
        }
      });
    }
  }

  getFilteredData() {
    if (this.currentCategory === "all") {
      return this.harassmentData;
    }
    return this.harassmentData.filter(
      (item) => item.分類標籤 === this.currentCategory
    );
  }

  loadVoiceCards() {
    const container = document.getElementById("voices-cards-container");
    if (!container) return;

    const filteredData = this.getFilteredData();
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = Math.min(
      startIndex + this.itemsPerPage,
      filteredData.length
    );
    const pageData = filteredData.slice(startIndex, endIndex);

    // 清空容器
    container.innerHTML = "";

    // 生成卡片
    pageData.forEach((item, index) => {
      const card = this.createVoiceCard(item, startIndex + index);
      container.appendChild(card);
    });

    // 更新分頁按鈕狀態
    this.updatePaginationButtons(filteredData.length);
  }

  updatePaginationButtons(totalItems) {
    const prevButton = document.getElementById("voices-prev");
    const nextButton = document.getElementById("voices-next");
    const pageInfo = document.getElementById("voices-page-info");

    const maxPage = Math.ceil(totalItems / this.itemsPerPage) - 1;

    if (prevButton) {
      prevButton.disabled = this.currentPage === 0;
      prevButton.style.opacity = this.currentPage === 0 ? "0.5" : "1";
    }

    if (nextButton) {
      nextButton.disabled = this.currentPage >= maxPage;
      nextButton.style.opacity = this.currentPage >= maxPage ? "0.5" : "1";
    }

    if (pageInfo) {
      pageInfo.textContent = `${this.currentPage + 1} / ${maxPage + 1}`;
    }
  }

  createVoiceCard(caseItem, index) {
    const categoryConfig = {
      威脅恐嚇: { color: "red", icon: "bullhorn", label: "威脅恐嚇" },
      經濟壓迫: {
        color: "orange",
        icon: "money-bill-wave",
        label: "經濟壓迫",
      },
      人格侮辱: { color: "purple", icon: "frown", label: "人格侮辱" },
      不公對待: { color: "blue", icon: "balance-scale", label: "不公對待" },
    };

    const config =
      categoryConfig[caseItem.分類標籤] || categoryConfig["威脅恐嚇"]; // 預設值

    const card = document.createElement("div");
    card.className =
      "voice-card bg-white/90 backdrop-blur-sm rounded-2xl shadow-card p-6 border border-white/20 hover:shadow-hover transition-all duration-300 animate-fade-in-up";
    card.style.animationDelay = `${index * 0.1}s`;

    // 嚴重性指示器（不對外顯示數字）
    const getSeverityColor = (score) => {
      if (score >= 9) return "bg-red-600";
      if (score >= 7) return "bg-orange-500";
      if (score >= 5) return "bg-yellow-500";
      return "bg-green-500";
    };

    const getSeverityText = (score) => {
      if (score >= 9) return "極度嚴重";
      if (score >= 7) return "嚴重";
      if (score >= 5) return "中度";
      return "輕度";
    };

    card.innerHTML = `
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-${
            config.color
          }-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
            <i class="fas fa-${config.icon} text-${
      config.color
    }-500 text-xl"></i>
          </div>
          <div>
            <div class="font-semibold text-neutral-800">${caseItem.姓名}</div>
            <div class="text-sm text-neutral-500">${caseItem.券商銀行}</div>
          </div>
        </div>
        <div class="flex flex-col items-end">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${
            config.color
          }-100 text-${config.color}-700 mb-2">
            <i class="fas fa-${config.icon} mr-1"></i>
            ${config.label}
          </span>
          <div class="flex items-center">
            <div class="w-2 h-2 ${getSeverityColor(
              caseItem.嚴重性評分
            )} rounded-full mr-1"></div>
            <span class="text-xs text-neutral-500">${getSeverityText(
              caseItem.嚴重性評分
            )}</span>
          </div>
        </div>
      </div>
      
      <div class="space-y-4">
        <div class="bg-gradient-to-r from-neutral-50 to-neutral-25 p-4 rounded-xl border-l-4 border-${
          config.color
        }-400">
          <p class="text-sm font-medium text-neutral-600 mb-2">
            <i class="fas fa-quote-left text-${config.color}-400 mr-2"></i>
            主管施壓話術
          </p>
          <p class="text-neutral-800 leading-relaxed">${
            caseItem.主管壓力話術
          }</p>
        </div>
        
        <div class="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-xl border-l-4 border-primary">
          <p class="text-sm font-medium text-primary mb-2">
            <i class="fas fa-heart text-primary mr-2"></i>
            內心真正想說的話
          </p>
          <p class="text-neutral-700 leading-relaxed italic">${
            caseItem.內心真正想說的話
          }</p>
        </div>
      </div>
      
      <div class="mt-4 flex justify-between items-center text-xs text-neutral-400">
        <span><i class="fas fa-calendar mr-1"></i>${caseItem.回覆時間}</span>
        <span>案例 #${caseItem.序號}</span>
      </div>
    `;

    return card;
  }

  initCounters() {
    // 等待數據載入後再初始化計數器
    setTimeout(() => {
      const counters = document.querySelectorAll(".counter");

      const observerOptions = {
        threshold: 0.5,
        rootMargin: "0px 0px -50px 0px",
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            !entry.target.classList.contains("counted")
          ) {
            this.animateCounter(entry.target);
            entry.target.classList.add("counted");
          }
        });
      }, observerOptions);

      counters.forEach((counter) => {
        observer.observe(counter);
      });
    }, 1000);
  }

  animateCounter(element) {
    const target = parseInt(element.getAttribute("data-target") || "0");
    const duration = 2000;
    const startTime = performance.now();
    const startValue = 0;

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // 使用 easeOutQuart 緩動函數
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.round(
        startValue + (target - startValue) * easeProgress
      );

      element.textContent = currentValue;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    };

    requestAnimationFrame(updateCounter);
  }
}

// 初始化職場霸凌心聲模組
function initHarassmentVoices() {
  try {
    new HarassmentVoicesModule();
    console.log("職場霸凌心聲模組初始化成功");
  } catch (error) {
    console.error("職場霸凌心聲模組初始化失敗:", error);
  }
}

// 確保函數全域可用
window.initHarassmentVoices = initHarassmentVoices;
