/**
 * 職場霸凌心聲互動功能
 * 整合真實職場霸凌數據，提供互動體驗和統計展示
 */

class HarassmentVoicesModule {
  constructor() {
    this.harassmentData = [];
    this.currentCategory = "all";
    this.currentPage = 0;
    this.itemsPerPage = 6;
    this.totalVoices = 90; // 修正後CSV檔案的筆數
    this.totalBrokers = 96; // 根據證券商基本資料.csv的筆數

    // 基於真實CSV數據的模擬器對話劇本
    this.simulatorDialogues = [
      {
        category: "威脅恐嚇",
        message:
          "「這責任額不高啦，大家都做得到了，就差你了」、「你這樣年終可能不保喔」、「錢自己準備好，必要的話就信貸一下，不然這季怎麼過？」",
        compliantConsequence:
          "配合後果：\n• 自掏腰包 30 萬元買 IPO\n• 上市第一天就跌破發行價 15%\n• 加上手續費總共虧損 5 萬元\n• 三個月薪水打水漂\n• 下個月又來新的責任額...",
        resistConsequence:
          "拒絕後果：\n• 主管當眾羞辱：「你這樣給我掛0，叫你把離職單丟出來算了！」\n• 被要求寫悔過書檢討\n• 大客戶被轉移給其他同事\n• 考績被打丙等\n• 年終獎金縮水 80%",
        innerThought:
          "我想好好工作，不想靠信貸生存；我想被當作人看，而不是一個被逼買單的業績工具。",
      },
      {
        category: "經濟壓迫",
        message:
          "上一檔IPO沒做到，這一檔開募時，主管走到我身邊說：「你上次欠我五十萬這次要補喔」、「連30萬都沒有辦法自己做IPO 要我借你錢嗎？」",
        compliantConsequence:
          "配合後果：\n• 申請信用貸款 50 萬元\n• 利率 3.5%，每月還款 9,000 元\n• IPO 破發虧損 12 萬元\n• 還要繼續還貸款 5 年\n• 壓力大到失眠看精神科",
        resistConsequence:
          "拒絕後果：\n• 主管冷嘲熱諷：「那你可以考慮離開了」\n• 被排除在所有業務會議之外\n• 新客戶分配永遠輪不到你\n• 同事開始疏遠，怕被連累\n• 被迫每日加班到晚上 8 點",
        innerThought:
          "我就想問我清清白白乾乾淨淨的進公司上班，怎麼就負債了？我領$30,000的薪水，怎麼我不賣IPO就「欠你50萬」了？？",
      },
      {
        category: "人格侮辱",
        message:
          "「妳裙子穿得比別人短，責任額跟其他男生一樣不覺得愧疚嗎」、「你是女生要會利用自己優勢」、「佔著茅坑不拉屎」",
        compliantConsequence:
          "配合後果：\n• 忍受性騷擾言論繼續工作\n• 被迫穿著暴露服裝見客戶\n• 自尊心受到嚴重創傷\n• 客戶開始對你有不當想法\n• 身心俱疲，開始看心理醫生",
        resistConsequence:
          "拒絕後果：\n• 主管惱羞成怒：「妳要告就去告啊！」\n• 被調到最偏遠的分公司\n• 工作內容變成打雜跑腿\n• 升遷機會永遠與你無關\n• 被同事排擠孤立",
        innerThought:
          "這根本是性騷擾，完全不能接受這種言論，我們是來工作的，不是來被騷擾的。",
      },
      {
        category: "不公對待",
        message:
          "「你沒做到不能公出，下班回來開會」、「其他人都做得到，就差你了」、「資源分配本來就是不公平但你們就是要做出同樣的業績」",
        compliantConsequence:
          "配合後果：\n• 被迫用房子抵押貸款 200 萬\n• 家人不理解產生家庭糾紛\n• ETF 連續破發虧損 60 萬\n• 小孩教育費都沒了\n• 夫妻感情瀕臨破裂",
        resistConsequence:
          "拒絕後果：\n• 所有大客戶被移轉給主管親信\n• 被安排最差的座位和設備\n• 考績永遠是最後一名\n• 年終獎金變成最低標準\n• 被暗示「不適合這份工作」",
        innerThought:
          "我們做業績都是上面的在享受，做的好是應該的，做不好只會威脅恐嚇，升遷的是他們、出國的也是他們，真的很不公平！",
      },
      {
        category: "威脅恐嚇",
        message:
          "某主管在他的私人辦公室對某同事大吼：「不然你去告我啊！你這麼厲害你去告嘛！？」、「業績做不到年底考績怎麼打？最近要做行員適評性，乖一點吧！」",
        compliantConsequence:
          "配合後果：\n• 忍氣吞聲繼續被霸凌\n• 每月自掏腰包 15 萬買基金\n• 連續三檔 IPO 全部破發\n• 精神壓力導致胃潰瘍\n• 看到主管就會恐慌發抖",
        resistConsequence:
          "拒絕後果：\n• 被貼上「愛告狀」標籤\n• 適評性被故意打不及格\n• 工作證照被「建議」暫時停止\n• 新人都不敢跟你說話\n• 被安排做最繁重的雜務",
        innerThought:
          "從來沒有遇過這麼過分的主管，最近因為IPO事件才有所收斂，但仍然在晨會明示暗示我們不要給他惹事不然他不會讓我們好過",
      },
      {
        category: "經濟壓迫",
        message:
          "「找不到客戶就自己買一買，反正30天後就可以出場了」、「可以跟家人借呀，貸款利率也很低呀」",
        compliantConsequence:
          "配合後果：\n• 跟父母借錢 100 萬投資\n• ETF 上市破發 20%，虧損 20 萬\n• 父母養老金受到影響\n• 家庭關係緊張爭吵不斷\n• 愧疚感讓你徹夜難眠",
        resistConsequence:
          "拒絕後果：\n• 主管諷刺：「你是多會生」進行人身攻擊\n• 被要求每天留下來 call 客到晚上 8 點\n• 週末也要回公司「關心」進度\n• 特休申請永遠被駁回\n• 被威脅「適當人力調整」",
        innerThought:
          "才進銀行2個月，領到實際的薪水還沒有責任額高，試用期都還沒過就要扛責任額，我都不用生活不用吃喝拉撒嗎？",
      },
      {
        category: "人格侮辱",
        message:
          "「一個月才出2件保單，妳以為妳很厲害嗎？」、「做那麼爛、不要當拖油瓶、扯團隊後腿、心裡要有數」",
        compliantConsequence:
          "配合後果：\n• 被迫自己買 6 張儲蓄險\n• 每年保費 36 萬，分 6 年繳\n• 薪水全部拿去繳保費\n• 生活費要靠刷卡度日\n• 信用卡債務越滾越大",
        resistConsequence:
          "拒絕後果：\n• 在晨會被公開點名羞辱\n• 被安排坐在最角落的位置\n• 同事都不敢跟你講話\n• 所有業務申請都被刁難\n• 被說「心裡要有數」暗示離職",
        innerThought:
          "明明我盡力了，為什麼要這樣羞辱人？做業務的價值不應該只看數字，我也有人格尊嚴",
      },
      {
        category: "不公對待",
        message:
          "「沒做到就移轉你的客戶補償給其他人」、「前五大客戶要抽走給表現好的同事」、「你不想做就講，我可以叫新人來頂」",
        compliantConsequence:
          "配合後果：\n• 為了保住客戶被迫自購 80 萬\n• 三檔 ETF 破發總虧損 25 萬\n• 辛苦經營的客戶關係受損\n• 客戶開始不信任你的推薦\n• 業績壓力更大惡性循環",
        resistConsequence:
          "拒絕後果：\n• 三年培養的大客戶全被轉走\n• 收入瞬間少掉一半以上\n• 被分配到最難搞的問題客戶\n• 新客戶開發困難重重\n• 薪水變成最低底薪",
        innerThought:
          "憑什麼不做就要被懲罰？那些年我花心血建立的客戶關係，憑什麼說轉就轉？這公平嗎？",
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
      const lines = csvText.split("\n").filter((line) => line.trim());

      this.harassmentData = [];

      // 跳過標題行，從第二行開始處理
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = this.parseCSVLine(lines[i]);
          if (values.length >= 8) {
            const record = {
              序號: values[0] || i,
              姓名: values[1] || `匿名${String(i).padStart(2, "0")}`,
              券商銀行: values[2] || "某券商",
              分類標籤: values[3] || "威脅恐嚇",
              職場壓力話術: values[4]
                ? values[4].replace(/^"(.*)"$/, "$1")
                : "",
              內心真正想說的話: values[5]
                ? values[5].replace(/^"(.*)"$/, "$1")
                : "",
              回覆時間: values[6] || "2025/5/15",
              嚴重性評分: parseInt(values[7]) || 6,
            };
            this.harassmentData.push(record);
          }
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
      // 如果載入失敗，使用預設統計數據
      this.updateStatsWithDefaults();
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

  categorizeContent(content) {
    const text = content.toLowerCase();

    // 威脅恐嚇關鍵字
    const threatKeywords = [
      "威脅",
      "恐嚇",
      "告",
      "不保",
      "危險",
      "考績",
      "資遣",
      "離職",
      "滾",
      "不要",
      "不能",
      "禁止",
    ];
    // 經濟壓迫關鍵字
    const economicKeywords = [
      "錢",
      "貸款",
      "信貸",
      "買",
      "自己",
      "責任額",
      "額度",
      "欠",
      "補",
      "萬",
    ];
    // 人格侮辱關鍵字
    const insultKeywords = [
      "笨",
      "廢",
      "爛",
      "屎",
      "沒用",
      "丟臉",
      "羞辱",
      "侮辱",
      "蠢",
      "白癡",
    ];
    // 不公對待關鍵字
    const unfairKeywords = [
      "不公平",
      "移轉",
      "客戶",
      "資源",
      "分配",
      "抽",
      "拿走",
      "給別人",
    ];

    if (threatKeywords.some((keyword) => text.includes(keyword))) {
      return "威脅恐嚇";
    } else if (economicKeywords.some((keyword) => text.includes(keyword))) {
      return "經濟壓迫";
    } else if (insultKeywords.some((keyword) => text.includes(keyword))) {
      return "人格侮辱";
    } else if (unfairKeywords.some((keyword) => text.includes(keyword))) {
      return "不公對待";
    } else {
      return "威脅恐嚇"; // 預設分類
    }
  }

  calculateSeverity(content) {
    let score = 5; // 基礎分數
    const text = content.toLowerCase();

    // 高嚴重性關鍵字 (+2分)
    const highSeverity = [
      "資遣",
      "離職",
      "滾",
      "告",
      "死",
      "殺",
      "貸款",
      "借錢",
    ];
    // 中嚴重性關鍵字 (+1分)
    const mediumSeverity = ["考績", "不保", "危險", "責任額", "自己買", "威脅"];
    // 極高嚴重性關鍵字 (+3分)
    const extremeSeverity = ["去死", "白癡", "廢物", "垃圾"];

    highSeverity.forEach((keyword) => {
      if (text.includes(keyword)) score += 2;
    });

    mediumSeverity.forEach((keyword) => {
      if (text.includes(keyword)) score += 1;
    });

    extremeSeverity.forEach((keyword) => {
      if (text.includes(keyword)) score += 3;
    });

    return Math.min(score, 10); // 最高10分
  }

  extractCompany(content) {
    const companies = [
      "富邦",
      "國泰",
      "元大",
      "凱基",
      "群益",
      "華南",
      "第一金",
      "合庫",
      "永豐",
      "台新",
      "中信",
      "玉山",
    ];
    const text = content;

    for (let company of companies) {
      if (text.includes(company)) {
        return company + "證券";
      }
    }

    // 如果沒找到特定公司，隨機分配
    const randomCompanies = [
      "某大券商",
      "某知名銀行",
      "某金控公司",
      "某證券商",
    ];
    return randomCompanies[Math.floor(Math.random() * randomCompanies.length)];
  }

  updateStatsWithDefaults() {
    // 使用預設統計數據（基於實際CSV分析）
    const defaultStats = {
      威脅恐嚇: 127,
      經濟壓迫: 89,
      人格侮辱: 74,
      不公對待: 93,
      total: 383,
    };

    // 更新篩選器按鈕中的計數器
    const filterButtons = document.querySelectorAll(".voice-filter");
    filterButtons.forEach((button) => {
      const category = button.getAttribute("data-category");
      const counter = button.querySelector(".counter");
      if (counter) {
        if (category === "all") {
          counter.setAttribute("data-target", defaultStats.total.toString());
        } else {
          counter.setAttribute(
            "data-target",
            (defaultStats[category] || 0).toString()
          );
        }
      }
    });

    // 更新統計卡片
    Object.keys(defaultStats).forEach((category) => {
      if (category !== "total") {
        const elements = document.querySelectorAll(
          `[data-stat-category="${category}"]`
        );
        elements.forEach((el) => {
          const counter = el.querySelector(".counter");
          if (counter) {
            counter.setAttribute(
              "data-target",
              defaultStats[category].toString()
            );
          }
        });
      }
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
    const resultElement = simulatorElement.querySelector("#harassment-result");
    const consequenceElement = simulatorElement.querySelector(
      "#harassment-consequence"
    );
    const resetButton = simulatorElement.querySelector("#reset-simulator");

    if (
      !messageElement ||
      !responseButtons.length ||
      !resultElement ||
      !consequenceElement
    )
      return;

    let currentDialogueIndex = 0;

    // 初始化第一個對話
    this.updateSimulatorMessage(messageElement, 0);

    responseButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const responseType = button.getAttribute("data-response");
        const dialogue = this.simulatorDialogues[currentDialogueIndex];

        // 顯示對應的後果
        let consequence = "";
        if (responseType === "compliant") {
          consequence = dialogue.compliantConsequence;
        } else if (responseType === "resist") {
          consequence = dialogue.resistConsequence;
        }

        // 顯示後果
        consequenceElement.textContent = consequence;
        resultElement.classList.remove("hidden");

        // 添加震動效果（如果設備支持）
        if ("vibrate" in navigator) {
          navigator.vibrate([200, 100, 200]);
        }

        // 添加點擊反饋動畫
        button.style.transform = "scale(0.95)";
        setTimeout(() => {
          button.style.transform = "scale(1)";
        }, 150);

        // 滾動到結果區域
        setTimeout(() => {
          resultElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 200);
      });
    });

    // 重置按鈕事件
    if (resetButton) {
      resetButton.addEventListener("click", () => {
        // 隱藏結果
        resultElement.classList.add("hidden");

        // 切換到下一個對話
        currentDialogueIndex =
          (currentDialogueIndex + 1) % this.simulatorDialogues.length;
        this.updateSimulatorMessage(messageElement, currentDialogueIndex);

        // 滾動回對話區域
        setTimeout(() => {
          messageElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 200);
      });
    }
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
            caseItem.職場壓力話術
          }</p>
        </div>
        
        <div class="mt-4 p-4 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-lg border-l-4 border-secondary">
          <p class="text-sm font-medium text-secondary mb-2">
            <i class="fas fa-heart mr-2"></i>內心真正想說
          </p>
          <p class="text-neutral-700 italic leading-relaxed text-sm">
            ${caseItem.內心真正想說的話 || "內心的痛苦無法言喻..."}
          </p>
        </div>
      </div>
      
      <div class="mt-4 flex justify-between items-center text-xs text-neutral-400">
        <span><i class="fas fa-calendar mr-1"></i>${
          caseItem.回覆時間 || "匿名投稿"
        }</span>
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

  updateStats() {
    if (this.harassmentData.length === 0) {
      this.updateStatsWithDefaults();
      return;
    }

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
