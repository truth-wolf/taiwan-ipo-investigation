// IPO破發模組 - 修復版本
(function () {
  "use strict";

  console.log("IPO破發模組初始化開始...");

  // 增強錯誤診斷
  function logDiagnostic(message, obj) {
    if (obj) {
      console.log(`[IPO診斷] ${message}`, obj);
    } else {
      console.log(`[IPO診斷] ${message}`);
    }
  }

  // 檢查關鍵DOM元素是否存在
  const checkDomElements = function () {
    const elements = [
      { id: "ipo-data-table-body", desc: "數據表格" },
      { id: "statement-details", desc: "對帳單詳情" },
      { id: "simulateNewScenario", desc: "模擬按鈕" },
      { id: "ipo-price-chart", desc: "價格圖表" },
      { id: "manager-quote", desc: "主管語錄" },
      { id: "broker-monologue", desc: "營業員獨白" },
      { id: "total-loss-amount", desc: "總損益" },
    ];

    let allFound = true;
    elements.forEach((elem) => {
      const domElem = document.getElementById(elem.id);
      if (!domElem) {
        console.error(`[IPO錯誤] 找不到${elem.desc}元素 #${elem.id}`);
        allFound = false;
      } else {
        logDiagnostic(`已找到${elem.desc}元素 #${elem.id}`);
      }
    });

    return allFound;
  };

  // 全局變數定義
  let allIpoData = [];
  let ipoSimulationChart = null;

  // 交易成本常數 - 營業員自掏腰包
  const BROKER_BUY_FEE_RATE = (0.1425 * 0.6) / 100; // 0.1425% * 0.6 = 0.0855%
  const BROKER_SELL_FEE_RATE = (0.1425 * 0.6) / 100; // 0.0855%
  const TAX_RATE = 0.1 / 100; // 0.1%

  // 主管壓力語錄
  const PRESSURE_QUOTES = [
    "這責任額不高啦，大家都做得到了，就差你了",
    "你這樣年終可能不保喔",
    "錢自己準備好，必要的話就信貸一下，不然這季怎麼過？",
    "某某上次達不到就是因為不夠努力，人家XX就自己買了 300 萬，你們連一半都不到，是怎樣？",
    "你們不想做就講，我可以叫新人來頂，現在一堆人搶這個位置",
    "沒做到，對不起其他有做到的同事，所以要移轉你的客戶補償給其他人",
    "IPO未達標就是拿資源不做事，0%跟99%一樣是都未達標，未達100%就抽走你的前五大客戶",
    "其他人都做得到，你為什麼做不到，那你要檢討自己的問題嘛！",
    "做不到就移轉客戶",
    "你沒做到的話，工作還要不要",
    "使命必達",
    "上面壓下來的目標，我不管你用什麼方法，一定要達到！",
    "客戶不買？那你就自己想辦法處理掉這些額度，不然影響到團隊績效，你知道後果",
  ];

  // 營業員內心獨白
  const BROKER_MONOLOGUES = [
    "說真的，我已經很久沒有覺得自己是個正常工作的人了...我們只是希望這個行業能把人當人看，而不是一個可以隨時補上責任額的數字產出機器。",
    "我想好好工作，不想靠信貸生存；我想被當作人看，而不是一個被逼買單的業績工具。",
    "每次IPO來的時候，大家都要先確認自己準備了多少錢，不是幫客戶選好產品，而是先確保自己可以補多少洞。",
    "你們看到的是回單跟總銷數字，但你們有看到我們每天為了那些數字，壓力大到吃不下睡不著的樣子嗎？",
    "我領$30,000的薪水，怎麼我不賣IPO就欠你50萬了？？這是證券還是黑道，每個月都來跟我收保護費...",
    "我們薪水很少，平常事務工作也是花體力花精力賺錢來的！我是來賺錢的！不是來買工作的！",
    "底薪三萬，房租一萬五，吃飯一萬，交通雜支五千...這張單下去，這個月又要吃土了...",
    "又來了，又是這種垃圾商品，客戶不賠死才怪...但我能怎麼辦？不扛嗎？明天就叫我滾蛋了...",
    "算了，買吧，買了至少還有工作...吧？只是心好痛，對不起客戶，也對不起自己多年的專業...",
  ];

  // 增強版檔案載入函數，支援多種路徑
  async function loadCSVFile() {
    const possiblePaths = [
      "IPO-最低價格.csv",
      "./IPO-最低價格.csv",
      "/IPO-最低價格.csv",
      "../IPO-最低價格.csv",
    ];

    for (const path of possiblePaths) {
      try {
        logDiagnostic(`嘗試載入路徑: ${path}`);
        const response = await fetch(path);

        if (response.ok) {
          logDiagnostic(`成功載入: ${path}`);
          return await response.text();
        } else {
          logDiagnostic(`路徑失敗 (${response.status}): ${path}`);
        }
      } catch (error) {
        logDiagnostic(`路徑錯誤: ${path} - ${error.message}`);
      }
    }

    throw new Error("無法找到IPO-最低價格.csv檔案，請檢查檔案位置");
  }

  // 載入IPO數據
  async function loadAndProcessData() {
    try {
      logDiagnostic("開始檢查DOM元素...");
      if (!checkDomElements()) {
        console.error("[IPO錯誤] 某些關鍵DOM元素不存在，可能HTML尚未完全載入");
        setTimeout(loadAndProcessData, 1000); // 1秒後重試
        return;
      }

      logDiagnostic("開始載入CSV文件...");
      const csvText = await loadCSVFile();
      logDiagnostic(`CSV文件載入成功，大小: ${csvText.length} 字元`);

      const parsedData = parseCSV(csvText);
      logDiagnostic(`解析完成，找到 ${parsedData.length} 行數據`);

      if (parsedData.length > 0) {
        logDiagnostic("CSV頭部:", parsedData[0]);
      }

      allIpoData = parsedData
        .map((item) => {
          const subPrice = parseFloat(item["募集價格"]);
          const dayLow = parseFloat(item["掛牌當天最低"]);
          const monthLow = parseFloat(item["掛盤後一個月最低"]);

          if (
            isNaN(subPrice) ||
            isNaN(dayLow) ||
            isNaN(monthLow) ||
            subPrice <= 0
          ) {
            console.warn("[IPO警告] 跳過無效數據行:", item);
            return null;
          }

          const lossDay1Amount = subPrice - dayLow;
          const lossDay1Percent = ((dayLow - subPrice) / subPrice) * 100;
          const lossMonth1Amount = subPrice - monthLow;
          const lossMonth1Percent = ((monthLow - subPrice) / subPrice) * 100;

          return {
            name: item["股票名稱"] ? item["股票名稱"].trim() : "N/A",
            date: item["上市日"] ? item["上市日"].trim() : "N/A",
            subPrice,
            dayLow,
            monthLow,
            lossDay1Amount,
            lossDay1Percent,
            lossMonth1Amount,
            lossMonth1Percent,
          };
        })
        .filter((item) => item !== null);

      logDiagnostic(`數據處理完成，有效數據 ${allIpoData.length} 行`);
      if (allIpoData.length > 0) {
        logDiagnostic("第一筆處理後資料:", allIpoData[0]);
      }

      if (allIpoData.length === 0) {
        console.error("[IPO錯誤] 未能從CSV檔案載入有效的IPO資料");
        displayErrorMessage("未能從CSV檔案載入有效的IPO資料。請檢查檔案格式。");
        return;
      }

      // 顯示數據
      logDiagnostic("開始計算並顯示統計數據...");
      calculateAndDisplayStats(allIpoData);
      logDiagnostic("填充數據表格...");
      populateDataTable(allIpoData);
      logDiagnostic("執行首次模擬...");
      runSimulation(); // 執行第一次模擬
      logDiagnostic("IPO破發模組初始化完成");
    } catch (error) {
      console.error("[IPO錯誤] 載入或處理IPO數據時出錯:", error);
      displayErrorMessage(
        `載入IPO資料時發生錯誤: ${error.message}。請確認檔案存在且格式正確。`
      );
    }
  }

  // 解析CSV數據 - 增強版
  function parseCSV(csvText) {
    logDiagnostic("開始解析CSV文本...");

    if (!csvText || typeof csvText !== "string") {
      console.error("[IPO錯誤] CSV文本為空或格式不正確");
      return [];
    }

    // 預處理CSV文本，處理可能的BOM標記和編碼問題
    csvText = csvText.trim();
    if (csvText.charCodeAt(0) === 0xfeff) {
      csvText = csvText.slice(1); // 移除BOM
      logDiagnostic("已移除CSV文件的BOM標記");
    }

    const lines = csvText.split(/\r?\n/);
    logDiagnostic(`CSV檔案共有 ${lines.length} 行`);

    if (lines.length < 2) {
      console.error("[IPO錯誤] CSV文件格式不正確，行數不足");
      return [];
    }

    // 分析標頭
    const headers = lines[0].split(",").map((header) => header.trim());
    logDiagnostic(`CSV標頭: ${headers.join(", ")}`);

    // 檢查必要欄位是否存在
    const requiredColumns = [
      "股票名稱",
      "上市日",
      "募集價格",
      "掛牌當天最低",
      "掛盤後一個月最低",
    ];
    const missingColumns = requiredColumns.filter(
      (col) => !headers.includes(col)
    );

    if (missingColumns.length > 0) {
      console.error(
        `[IPO錯誤] CSV文件缺少必要欄位: ${missingColumns.join(", ")}`
      );
      return [];
    }

    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) {
        logDiagnostic(`跳過空白行 ${i}`);
        continue;
      }

      // 簡化處理：直接分割，不處理複雜的引號情況
      const values = lines[i].split(",").map((val) => val.trim());

      // 檢查值的數量是否與標頭匹配
      if (values.length !== headers.length) {
        console.warn(
          `[IPO警告] 第 ${i + 1} 行的值數量(${values.length})與標頭數量(${
            headers.length
          })不匹配`
        );
        // 嘗試修復：如果值太少，填充空值；如果太多，截斷
        if (values.length < headers.length) {
          values.push(...Array(headers.length - values.length).fill(""));
        } else if (values.length > headers.length) {
          values.splice(headers.length);
        }
      }

      const entry = {};
      headers.forEach((header, index) => {
        entry[header] = values[index] ? values[index].trim() : "";
      });

      data.push(entry);
    }

    logDiagnostic(`成功解析 ${data.length} 行CSV數據`);
    return data;
  }

  // 顯示錯誤訊息
  function displayErrorMessage(message) {
    console.error("[IPO錯誤] " + message);

    const tableBody = document.getElementById("ipo-data-table-body");
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-red-500 font-semibold">${message}</td></tr>`;
      logDiagnostic("已在數據表格中顯示錯誤訊息");
    }

    const statementBody = document.getElementById("statement-details");
    if (statementBody) {
      statementBody.innerHTML = `<tr><td colspan="2" class="text-center p-4 text-red-500 font-semibold">${message}</td></tr>`;
      logDiagnostic("已在對帳單中顯示錯誤訊息");
    }

    // 嘗試禁用相關按鈕
    try {
      const simulateBtn = document.getElementById("simulateNewScenario");
      if (simulateBtn) {
        simulateBtn.disabled = true;
        simulateBtn.classList.add("opacity-50", "cursor-not-allowed");
        logDiagnostic("已禁用模擬按鈕");
      }
    } catch (e) {
      console.error("[IPO錯誤] 禁用按鈕時出錯:", e);
    }
  }

  // 數字格式化
  function formatNumber(num, decimals = 0) {
    if (typeof num !== "number" || isNaN(num)) return "-";
    return num.toLocaleString("zh-TW", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  // 紅漲綠跌 - 調整表格顏色
  function getPriceClass(value) {
    if (typeof value !== "number" || isNaN(value)) return "text-gray-500";
    return value < 0
      ? "text-green-600 font-semibold" // 負數(跌) - 綠色
      : value > 0
      ? "text-red-600 font-semibold" // 正數(漲) - 紅色
      : "text-gray-500"; // 零 - 灰色
  }

  // 計算買入手續費
  function calculateBuyFee(price, quantity) {
    return Math.max(20, price * quantity * BROKER_BUY_FEE_RATE); // 最低手續費20元
  }

  // 計算賣出手續費與稅金
  function calculateSellFeeAndTax(price, quantity) {
    const fee = Math.max(20, price * quantity * BROKER_SELL_FEE_RATE); // 最低手續費20元
    const tax = price * quantity * TAX_RATE;
    return fee + tax;
  }

  // 模擬新情境
  function runSimulation() {
    if (!allIpoData || allIpoData.length === 0) {
      console.error("尚未成功載入IPO數據");
      return;
    }

    // 隨機選擇一支IPO
    const selectedIpo =
      allIpoData[Math.floor(Math.random() * allIpoData.length)];

    // 隨機責任額 (30萬 - 600萬)
    const randomAmount =
      Math.floor(Math.random() * (6000000 - 300000 + 1)) + 300000;

    // 計算買入數量與成本
    const subPrice = selectedIpo.subPrice;
    const sharesToBuy = Math.floor(randomAmount / subPrice);
    const actualCost = sharesToBuy * subPrice;
    const buyFee = calculateBuyFee(subPrice, sharesToBuy);

    // 計算賣出價值與費用
    const sellPrice = selectedIpo.monthLow;
    const sellValue = sharesToBuy * sellPrice;
    const sellFeeAndTax = calculateSellFeeAndTax(sellPrice, sharesToBuy);

    // 計算總損益
    const totalLoss = actualCost + buyFee - sellValue + sellFeeAndTax;
    const lossPercent = (totalLoss / actualCost) * 100;

    // 更新對帳單
    updateStatementUI(
      selectedIpo,
      randomAmount,
      sharesToBuy,
      actualCost,
      buyFee,
      sellValue,
      sellFeeAndTax,
      totalLoss,
      lossPercent
    );

    // 更新壓力模擬
    updatePressureSimulation(totalLoss, lossPercent, randomAmount);

    // 更新圖表
    updatePriceChart(selectedIpo, subPrice, sellPrice);
  }

  // 更新對帳單UI
  function updateStatementUI(
    ipo,
    amount,
    shares,
    cost,
    buyFee,
    sellValue,
    sellFeeAndTax,
    totalLoss,
    lossPercent
  ) {
    const statementHtml = `
        <tr>
          <td class="whitespace-nowrap px-2 py-2 text-gray-700">股票名稱</td>
          <td class="whitespace-nowrap px-2 py-2 font-semibold text-gray-900">${
            ipo.name
          }</td>
        </tr>
        <tr>
          <td class="whitespace-nowrap px-2 py-2 text-gray-700">上市日期</td>
          <td class="whitespace-nowrap px-2 py-2 text-gray-900">${ipo.date}</td>
        </tr>
        <tr>
          <td class="whitespace-nowrap px-2 py-2 text-gray-700">責任額度</td>
          <td class="whitespace-nowrap px-2 py-2 text-red-600 font-bold">${formatNumber(
            amount
          )} 元</td>
        </tr>
        <tr>
          <td class="whitespace-nowrap px-2 py-2 text-gray-700">募集價格</td>
          <td class="whitespace-nowrap px-2 py-2 text-gray-900">${formatNumber(
            ipo.subPrice,
            2
          )} 元/股</td>
        </tr>
        <tr>
          <td class="whitespace-nowrap px-2 py-2 text-gray-700">可購股數</td>
          <td class="whitespace-nowrap px-2 py-2 text-gray-900">${formatNumber(
            shares
          )} 股</td>
        </tr>
        <tr>
          <td class="whitespace-nowrap px-2 py-2 text-gray-700">買入成本</td>
          <td class="whitespace-nowrap px-2 py-2 text-gray-900">${formatNumber(
            cost
          )} 元</td>
        </tr>
        <tr>
          <td class="whitespace-nowrap px-2 py-2 text-gray-700">買入手續費</td>
          <td class="whitespace-nowrap px-2 py-2 text-gray-900">${formatNumber(
            buyFee
          )} 元</td>
        </tr>
        <tr>
          <td class="whitespace-nowrap px-2 py-2 text-gray-700">一個月後最低價</td>
          <td class="whitespace-nowrap px-2 py-2 text-gray-900">${formatNumber(
            ipo.monthLow,
            2
          )} 元/股</td>
        </tr>
        <tr>
          <td class="whitespace-nowrap px-2 py-2 text-gray-700">賣出價值</td>
          <td class="whitespace-nowrap px-2 py-2 text-gray-900">${formatNumber(
            sellValue
          )} 元</td>
        </tr>
        <tr>
          <td class="whitespace-nowrap px-2 py-2 text-gray-700">賣出手續費+稅</td>
          <td class="whitespace-nowrap px-2 py-2 text-gray-900">${formatNumber(
            sellFeeAndTax
          )} 元</td>
        </tr>
      `;

    document.getElementById("statement-details").innerHTML = statementHtml;

    const resultElem = document.getElementById("total-loss-amount");
    resultElem.textContent = `${totalLoss > 0 ? "-" : "+"}${formatNumber(
      Math.abs(totalLoss)
    )} 元 (${Math.abs(lossPercent).toFixed(2)}%)`;
    resultElem.className =
      totalLoss > 0
        ? "text-lg font-bold text-green-600" // 虧損 - 綠色
        : "text-lg font-bold text-red-600"; // 獲利 - 紅色
  }

  // 更新壓力模擬
  function updatePressureSimulation(totalLoss, lossPercent, amount) {
    // 隨機選擇一個壓力語錄
    const randomQuote =
      PRESSURE_QUOTES[Math.floor(Math.random() * PRESSURE_QUOTES.length)];
    document.getElementById("manager-quote").innerHTML = randomQuote;

    // 隨機選擇一個內心獨白
    const randomMonologue =
      BROKER_MONOLOGUES[Math.floor(Math.random() * BROKER_MONOLOGUES.length)];
    document.getElementById("broker-monologue").innerHTML = randomMonologue;

    // 計算壓力指數
    let stressValue = 50; // 基礎壓力值

    // 根據虧損金額和比例調整壓力值
    if (totalLoss > 0) {
      // 虧損情況
      const amountFactor = Math.min((amount / 1000000) * 10, 20); // 金額因素，最高加20%
      const lossFactor = Math.min(Math.abs(lossPercent), 30); // 虧損率因素，最高加30%
      stressValue += amountFactor + lossFactor;
    } else {
      // 獲利情況，降低壓力
      stressValue -= Math.min(Math.abs(lossPercent) * 1.5, 20);
    }

    // 確保在合理範圍內
    stressValue = Math.max(10, Math.min(stressValue, 95));

    // 更新UI
    document.querySelector(".stress-bar").style.width = `${stressValue}%`;
    document.getElementById("stress-percent").textContent = `${Math.round(
      stressValue
    )}%`;

    // 根據壓力調整顏色
    const stressMeter = document.querySelector(".stress-bar");
    if (stressValue > 80) {
      stressMeter.style.backgroundColor = "#e23e57"; // 高壓力 - 主題紅色
    } else if (stressValue > 60) {
      stressMeter.style.backgroundColor = "#f0a500"; // 中高壓力 - 警示色
    } else if (stressValue > 40) {
      stressMeter.style.backgroundColor = "#1a5d7a"; // 中等壓力 - 主題藍色
    } else {
      stressMeter.style.backgroundColor = "#22c55e"; // 低壓力 - 綠色
    }
  }

  // 更新價格圖表
  function updatePriceChart(ipo, buyPrice, sellPrice) {
    const chartCanvas = document.getElementById("ipo-price-chart");
    if (!chartCanvas) {
      console.error("[IPO錯誤] 找不到圖表畫布元素");
      return;
    }

    const ctx = chartCanvas.getContext("2d");

    // 檢查Chart.js是否可用
    if (typeof Chart === "undefined") {
      console.error("[IPO錯誤] Chart.js 未載入");
      return;
    }

    // 確保畫布尺寸正確響應容器
    const resizeChart = function () {
      const container = chartCanvas.parentElement;
      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // 設置畫布尺寸以匹配容器
        chartCanvas.style.width = "100%";
        chartCanvas.style.height = "100%";
      }
    };

    // 立即調整尺寸
    resizeChart();

    // 監聽窗口大小變化，重新調整圖表尺寸
    window.addEventListener("resize", function () {
      if (ipoSimulationChart) {
        resizeChart();
        ipoSimulationChart.resize();
      }
    });

    // 模擬30天的價格走勢
    const days = 30;
    const dayLabels = Array.from({ length: days }, (_, i) => `Day ${i + 1}`);
    dayLabels[0] = "募集日";
    dayLabels[1] = "上市日";
    dayLabels[days - 1] = "一個月後";

    // 生成價格曲線
    const startPrice = ipo.subPrice;
    const endPrice = ipo.monthLow;
    const dayLow = ipo.dayLow;

    // 創建從募集價到一個月後最低價的平滑曲線
    const prices = [startPrice]; // 募集價

    // 上市日價格
    prices.push(dayLow);

    // 生成中間日期的價格
    for (let i = 2; i < days - 1; i++) {
      const progress = i / (days - 1);
      const targetPrice = startPrice + (endPrice - startPrice) * progress;
      const volatility = 0.03; // 每日波動幅度
      const randomFactor = (Math.random() * 2 - 1) * volatility;
      prices.push(targetPrice * (1 + randomFactor));
    }

    // 一個月後最低價
    prices.push(endPrice);

    // 隨機選擇賣出點
    const sellDay =
      Math.floor(days * 0.7) + Math.floor(Math.random() * (days * 0.3));

    // 準備圖表數據
    if (ipoSimulationChart) {
      ipoSimulationChart.destroy();
    }

    try {
      ipoSimulationChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: dayLabels,
          datasets: [
            {
              label: "價格 (元)",
              data: prices,
              fill: false,
              borderColor: "#1a5d7a",
              tension: 0.4,
              pointRadius: 0,
            },
            {
              label: "買入點",
              data: Array(days).fill(null),
              pointBackgroundColor: "#e23e57",
              pointBorderColor: "#fff",
              pointRadius: [0, 6, ...Array(days - 2).fill(0)],
            },
            {
              label: "賣出點",
              data: Array(days).fill(null),
              pointBackgroundColor: "#22c55e",
              pointBorderColor: "#fff",
              pointRadius: Array(days)
                .fill(0)
                .map((_, i) => (i === sellDay ? 6 : 0)),
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              mode: "index",
              intersect: false,
              callbacks: {
                label: function (context) {
                  const label = context.dataset.label || "";
                  if (label === "買入點") {
                    return `買入價: ${formatNumber(buyPrice, 2)} 元`;
                  } else if (label === "賣出點") {
                    return `賣出價: ${formatNumber(sellPrice, 2)} 元`;
                  }
                  return `${label}: ${formatNumber(context.parsed.y, 2)} 元`;
                },
              },
            },
            legend: {
              position: "bottom",
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
            },
            y: {
              ticks: {
                callback: function (value) {
                  return value.toFixed(2);
                },
              },
            },
          },
        },
      });

      // 設置買入賣out點數據
      ipoSimulationChart.data.datasets[1].data[1] = buyPrice;
      ipoSimulationChart.data.datasets[2].data[sellDay] = prices[sellDay];
      ipoSimulationChart.update();
    } catch (error) {
      console.error("[IPO錯誤] 建立圖表時出錯:", error);
    }
  }

  // 填充數據表格
  function populateDataTable(data) {
    const tableBody = document.getElementById("ipo-data-table-body");
    if (!tableBody) return;

    if (data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-gray-500">無可用數據</td></tr>`;
      return;
    }

    let html = "";
    data.forEach((item) => {
      html += `
          <tr>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-700">${
              item.name
            }</td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${
              item.date
            }</td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">${formatNumber(
              item.subPrice,
              2
            )}</td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">${formatNumber(
              item.dayLow,
              2
            )}</td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">${formatNumber(
              item.monthLow,
              2
            )}</td>
            <td class="whitespace-nowrap px-3 py-4 text-sm ${getPriceClass(
              item.lossDay1Percent
            )} text-right">${formatNumber(item.lossDay1Percent, 1)}%</td>
            <td class="whitespace-nowrap px-3 py-4 text-sm ${getPriceClass(
              item.lossMonth1Percent
            )} text-right">${formatNumber(item.lossMonth1Percent, 1)}%</td>
          </tr>
        `;
    });

    tableBody.innerHTML = html;
  }

  // 計算並顯示統計數據
  function calculateAndDisplayStats(data) {
    // 此功能在目前版本中暫未實現
    console.log("統計數據已計算但未顯示");
  }

  // 綁定事件初始化
  function initializeEventHandlers() {
    logDiagnostic("開始綁定事件處理器...");

    try {
      const simulateBtn = document.getElementById("simulateNewScenario");
      if (simulateBtn) {
        simulateBtn.addEventListener("click", runSimulation);
        logDiagnostic("已綁定模擬按鈕事件");
      } else {
        console.error("[IPO錯誤] 找不到模擬按鈕元素");
      }

      const toggleBtn = document.getElementById("toggleDetailedView");
      if (toggleBtn) {
        toggleBtn.addEventListener("click", function () {
          const detailedSection = document.getElementById(
            "detailed-data-section"
          );
          if (detailedSection) {
            detailedSection.classList.toggle("hidden");
            this.innerHTML = detailedSection.classList.contains("hidden")
              ? '<i class="fas fa-table mr-2"></i>完整數據檢視'
              : '<i class="fas fa-eye-slash mr-2"></i>隱藏完整數據';
            logDiagnostic("已切換詳細數據視圖可見性");
          }
        });
        logDiagnostic("已綁定切換詳細視圖按鈕事件");
      } else {
        console.error("[IPO錯誤] 找不到切換詳細視圖按鈕元素");
      }

      const hideBtn = document.getElementById("hideDetailedData");
      if (hideBtn) {
        hideBtn.addEventListener("click", function () {
          const detailedSection = document.getElementById(
            "detailed-data-section"
          );
          if (detailedSection) {
            detailedSection.classList.add("hidden");

            const toggleBtn = document.getElementById("toggleDetailedView");
            if (toggleBtn) {
              toggleBtn.innerHTML =
                '<i class="fas fa-table mr-2"></i>完整數據檢視';
            }

            logDiagnostic("已隱藏詳細數據視圖");
          }
        });
        logDiagnostic("已綁定隱藏詳細數據按鈕事件");
      } else {
        console.error("[IPO錯誤] 找不到隱藏詳細數據按鈕元素");
      }
    } catch (error) {
      console.error("[IPO錯誤] 綁定事件時發生錯誤:", error);
    }
  }

  // 主要初始化函數
  function initializeModule() {
    logDiagnostic("開始初始化IPO破發模組...");

    // 檢查DOM元素是否全部就緒
    if (!checkDomElements()) {
      console.warn("[IPO警告] DOM元素尚未完全載入，延遲初始化");
      setTimeout(initializeModule, 500); // 延遲重試
      return;
    }

    // 綁定事件處理器
    initializeEventHandlers();

    // 開始載入數據
    loadAndProcessData();
  }

  // 確保在DOM準備就緒後初始化
  function ensureDOMReady(callback) {
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      logDiagnostic("文檔已準備就緒，立即初始化");
      setTimeout(callback, 100); // 給予少許時間確保元素完全可用
    } else {
      logDiagnostic("等待文檔完全載入...");
      document.addEventListener("DOMContentLoaded", function () {
        logDiagnostic("文檔載入完成，準備初始化");
        setTimeout(callback, 100);
      });
    }
  }

  // 啟動模組
  ensureDOMReady(initializeModule);
})();
