/**
 * 📦 模組：IPO破發模擬與數據分析
 * 🕒 最後更新：2025-06-10T21:49:33+08:00
 * 🧑‍💻 作者/更新者：@DigitalSentinel
 * 🔢 版本：v1.2.0
 * 📝 摘要：IPO破發數據載入、模擬計算與壓力分析功能
 */

(() => {
  'use strict';

  // 調試模式開關 - 設為 true 可看到詳細載入過程
  const DEBUG_MODE = true;

  // 全域變數
  let allIpoData = [];
  let ipoSimulationChart = null;

  // 增強版診斷日誌函數
  function logDiagnostic(message, obj) {
    if (DEBUG_MODE) {
      if (obj) {
        console.log(`[IPO調試] ${message}`, obj);
      } else {
        console.log(`[IPO調試] ${message}`);
      }
    }
  }

  // 添加全局調試函數，可在控制台手動調用
  window.ipoDebug = {
    showData: () => {
      console.log('當前載入的IPO數據:', allIpoData);
      console.log(`數據數量: ${allIpoData.length}`);
    },
    reloadData: () => {
      console.log('重新載入數據...');
      loadAndProcessData();
    },
    checkTable: () => {
      const tableBody = document.getElementById('ipo-data-table-body');
      if (tableBody) {
        const rows = tableBody.querySelectorAll('tr');
        console.log(`表格中有 ${rows.length} 行數據`);

        let foundHighRisk = 0;
        rows.forEach((row, index) => {
          const firstCell = row.querySelector('td');
          if (firstCell && firstCell.textContent.includes('高風險')) {
            foundHighRisk++;
            console.log(
              `找到高風險項目在第 ${index + 1} 行:`,
              firstCell.textContent.split('\n')[0].trim()
            );
          }
        });

        console.log(`表格中共有 ${foundHighRisk} 個高風險項目`);
      } else {
        console.log('找不到表格元素');
      }
    },
  };

  // 顯示調試提示
  if (DEBUG_MODE) {
    console.log(
      '%c[IPO調試模式已啟用]',
      'color: #ff6b35; font-weight: bold; font-size: 14px;'
    );
    console.log('可用調試功能:');
    console.log('- ipoDebug.showData() - 顯示當前載入的數據');
    console.log('- ipoDebug.reloadData() - 重新載入數據');
    console.log('- ipoDebug.checkTable() - 檢查表格內容');
  }

  console.log('IPO破發模組初始化開始...');

  // logDiagnostic 函數已在上方定義

  // 檢查關鍵DOM元素是否存在
  const checkDomElements = function () {
    const elements = [
      { id: 'ipo-data-table-body', desc: '數據表格' },
      { id: 'statement-details', desc: '對帳單詳情' },
      { id: 'simulateNewScenario', desc: '模擬按鈕' },
      { id: 'ipo-price-chart', desc: '價格圖表' },
      { id: 'manager-quote', desc: '主管語錄' },
      { id: 'broker-monologue', desc: '營業員獨白' },
      { id: 'total-loss-amount', desc: '總損益' },
    ];

    let allFound = true;
    elements.forEach(elem => {
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

  // 交易成本常數 - 營業員自掏腰包
  const BROKER_SELL_FEE_RATE = (0.1425 * 0.6) / 100; // 0.0855%
  const TAX_RATE = 0.1 / 100; // 0.1%

  // 主管壓力語錄
  const PRESSURE_QUOTES = [
    '這責任額不高啦，大家都做得到了，就差你了',
    '你這樣年終可能不保喔',
    '錢自己準備好，必要的話就信貸一下，不然這季怎麼過？',
    '某某上次達不到就是因為不夠努力，人家XX就自己買了 300 萬，你們連一半都不到，是怎樣？',
    '你們不想做就講，我可以叫新人來頂，現在一堆人搶這個位置',
    '沒做到，對不起其他有做到的同事，所以要移轉你的客戶補償給其他人',
    'IPO未達標就是拿資源不做事，0%跟99%一樣是都未達標，未達100%就抽走你的前五大客戶',
    '其他人都做得到，你為什麼做不到，那你要檢討自己的問題嘛！',
    '做不到就移轉客戶',
    '你沒做到的話，工作還要不要',
    '使命必達',
    '上面壓下來的目標，我不管你用什麼方法，一定要達到！',
    '客戶不買？那你就自己想辦法處理掉這些額度，不然影響到團隊績效，你知道後果',
  ];

  // 營業員內心獨白
  const BROKER_MONOLOGUES = [
    '說真的，我已經很久沒有覺得自己是個正常工作的人了...我們只是希望這個行業能把人當人看，而不是一個可以隨時補上責任額的數字產出機器。',
    '我想好好工作，不想靠信貸生存；我想被當作人看，而不是一個被逼買單的業績工具。',
    '每次IPO來的時候，大家都要先確認自己準備了多少錢，不是幫客戶選好產品，而是先確保自己可以補多少洞。',
    '你們看到的是回單跟總銷數字，但你們有看到我們每天為了那些數字，壓力大到吃不下睡不著的樣子嗎？',
    '我領$30,000的薪水，怎麼我不賣IPO就欠你50萬了？？這是證券還是黑道，每個月都來跟我收保護費...',
    '我們薪水很少，平常事務工作也是花體力花精力賺錢來的！我是來賺錢的！不是來買工作的！',
    '底薪三萬，房租一萬五，吃飯一萬，交通雜支五千...這張單下去，這個月又要吃土了...',
    '又來了，又是這種垃圾商品，客戶不賠死才怪...但我能怎麼辦？不扛嗎？明天就叫我滾蛋了...',
    '算了，買吧，買了至少還有工作...吧？只是心好痛，對不起客戶，也對不起自己多年的專業...',
  ];

  // 增強版檔案載入函數，支援多種路徑
  async function loadCSVFile() {
    const possiblePaths = [
      'IPO-最低價格.csv',
      './IPO-最低價格.csv',
      '/IPO-最低價格.csv',
      '../IPO-最低價格.csv',
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

    throw new Error('無法找到IPO-最低價格.csv檔案，請檢查檔案位置');
  }

  // 載入IPO數據
  async function loadAndProcessData() {
    try {
      logDiagnostic('開始檢查DOM元素...');
      if (!checkDomElements()) {
        console.error('[IPO錯誤] 某些關鍵DOM元素不存在，可能HTML尚未完全載入');
        setTimeout(loadAndProcessData, 1000); // 1秒後重試
        return;
      }

      logDiagnostic('開始載入CSV文件...');
      const csvText = await loadCSVFile();
      logDiagnostic(`CSV文件載入成功，大小: ${csvText.length} 字元`);

      const parsedData = parseCSV(csvText);
      logDiagnostic(`解析完成，找到 ${parsedData.length} 行數據`);

      if (parsedData.length > 0) {
        logDiagnostic('CSV頭部:', parsedData[0]);
        logDiagnostic('CSV最後一行:', parsedData[parsedData.length - 1]);
      }

      let validDataCount = 0;
      let invalidDataCount = 0;
      const invalidRows = [];

      allIpoData = parsedData
        .map((item, index) => {
          const subPrice = parseFloat(item['募集價格']);
          const dayLow = parseFloat(item['掛牌當天最低']);
          const monthLow = parseFloat(item['掛盤後一個月最低']);

          // 更寬鬆的數據驗證邏輯
          if (
            isNaN(subPrice) ||
            isNaN(dayLow) ||
            isNaN(monthLow) ||
            subPrice <= 0 ||
            dayLow <= 0 ||
            monthLow <= 0
          ) {
            console.warn(`[IPO警告] 跳過無效數據行 ${index + 2}:`, item);
            invalidRows.push({
              line: index + 2,
              name: item['股票名稱'],
              subPrice: item['募集價格'],
              dayLow: item['掛牌當天最低'],
              monthLow: item['掛盤後一個月最低'],
            });
            invalidDataCount++;
            return null;
          }

          const lossDay1Amount = subPrice - dayLow;
          const lossDay1Percent = ((dayLow - subPrice) / subPrice) * 100;
          const lossMonth1Amount = subPrice - monthLow;
          const lossMonth1Percent = ((monthLow - subPrice) / subPrice) * 100;

          validDataCount++;

          const result = {
            name: item['股票名稱'] ? item['股票名稱'].trim() : 'N/A',
            date: item['上市日'] ? item['上市日'].trim() : 'N/A',
            subPrice,
            dayLow,
            monthLow,
            lossDay1Amount,
            lossDay1Percent,
            lossMonth1Amount,
            lossMonth1Percent,
          };

          return result;
        })
        .filter(item => item !== null);

      logDiagnostic(`數據處理完成:`);
      logDiagnostic(`- 有效數據: ${validDataCount} 行`);
      logDiagnostic(`- 無效數據: ${invalidDataCount} 行`);
      logDiagnostic(`- 最終數據數量: ${allIpoData.length} 行`);

      if (invalidRows.length > 0) {
        logDiagnostic('無效數據行詳情:', invalidRows);
      }

      if (allIpoData.length > 0) {
        logDiagnostic('第一筆處理後資料:', allIpoData[0]);
        logDiagnostic('最後一筆處理後資料:', allIpoData[allIpoData.length - 1]);
      }

      if (allIpoData.length === 0) {
        console.error('[IPO錯誤] 未能從CSV檔案載入有效的IPO資料');
        displayErrorMessage('未能從CSV檔案載入有效的IPO資料。請檢查檔案格式。');
        return;
      }

      // 顯示數據
      logDiagnostic('開始計算並顯示統計數據...');
      calculateAndDisplayStats(allIpoData);
      logDiagnostic('填充數據表格...');
      populateDataTable(allIpoData);

      // 自動顯示詳細數據表格，以便用戶查看所有數據
      const detailedSection = document.getElementById('detailed-data-section');
      if (detailedSection) {
        detailedSection.classList.remove('hidden');
        logDiagnostic('已自動顯示詳細數據表格');

        // 更新切換按鈕的文字
        const toggleBtn = document.getElementById('toggleDetailedView');
        if (toggleBtn) {
          toggleBtn.innerHTML =
            '<i class="fas fa-eye-slash mr-2"></i>隱藏完整數據';
        }
      }

      logDiagnostic('執行首次模擬...');
      runSimulation(); // 執行第一次模擬
      logDiagnostic('IPO破發模組初始化完成');
    } catch (error) {
      console.error('[IPO錯誤] 載入或處理IPO數據時出錯:', error);
      displayErrorMessage(
        `載入IPO資料時發生錯誤: ${error.message}。請確認檔案存在且格式正確。`
      );
    }
  }

  // 解析CSV數據 - 增強版
  function parseCSV(csvText) {
    logDiagnostic('開始解析CSV文本...');

    if (!csvText || typeof csvText !== 'string') {
      console.error('[IPO錯誤] CSV文本為空或格式不正確');
      return [];
    }

    // 預處理CSV文本，處理可能的BOM標記和編碼問題
    csvText = csvText.trim();
    if (csvText.charCodeAt(0) === 0xfeff) {
      csvText = csvText.slice(1); // 移除BOM
      logDiagnostic('已移除CSV文件的BOM標記');
    }

    const lines = csvText.split(/\r?\n/);
    logDiagnostic(`CSV檔案共有 ${lines.length} 行`);

    if (lines.length < 2) {
      console.error('[IPO錯誤] CSV文件格式不正確，行數不足');
      return [];
    }

    // 分析標頭
    const headers = lines[0]
      .split(',')
      .map(header => header.trim().replace(/"/g, ''));
    logDiagnostic(`CSV標頭: ${headers.join(', ')}`);

    // 檢查必要欄位是否存在
    const requiredColumns = [
      '股票名稱',
      '上市日',
      '募集價格',
      '掛牌當天最低',
      '掛盤後一個月最低',
    ];
    const missingColumns = requiredColumns.filter(
      col => !headers.includes(col)
    );

    if (missingColumns.length > 0) {
      console.error(
        `[IPO錯誤] CSV文件缺少必要欄位: ${missingColumns.join(', ')}`
      );
      return [];
    }

    const data = [];
    let skippedLines = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        logDiagnostic(`跳過空白行 ${i + 1}`);
        skippedLines++;
        continue;
      }

      // 改進的CSV行解析 - 處理包含逗號的字段
      const values = [];
      let currentValue = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim().replace(/^"|"$/g, ''));
          currentValue = '';
        } else {
          currentValue += char;
        }
      }

      // 添加最後一個值
      if (currentValue !== '') {
        values.push(currentValue.trim().replace(/^"|"$/g, ''));
      }

      // 檢查值的數量是否與標頭匹配
      if (values.length !== headers.length) {
        console.warn(
          `[IPO警告] 第 ${i + 1} 行的值數量(${values.length})與標頭數量(${
            headers.length
          })不匹配`
        );
        console.warn(`行內容: ${line}`);
        console.warn(`解析結果: [${values.join(', ')}]`);

        // 嘗試修復：如果值太少，填充空值；如果太多，截斷
        if (values.length < headers.length) {
          values.push(...Array(headers.length - values.length).fill(''));
        } else if (values.length > headers.length) {
          values.splice(headers.length);
        }
      }

      const entry = {};
      headers.forEach((header, index) => {
        entry[header] = values[index] ? values[index].trim() : '';
      });

      data.push(entry);
    }

    logDiagnostic(
      `CSV解析完成，成功處理 ${data.length} 行數據，跳過 ${skippedLines} 空白行`
    );

    // 檢查最後幾行數據
    if (data.length > 0) {
      logDiagnostic('解析後的最後三行數據:');
      const lastThree = data.slice(-3);
      lastThree.forEach((item, index) => {
        logDiagnostic(`倒數第${3 - index}行:`, item);
      });
    }

    return data;
  }

  // 顯示錯誤訊息
  function displayErrorMessage(message) {
    console.error('[IPO錯誤] ' + message);

    const tableBody = document.getElementById('ipo-data-table-body');
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-red-500 font-semibold">${message}</td></tr>`;
      logDiagnostic('已在數據表格中顯示錯誤訊息');
    }

    const statementBody = document.getElementById('statement-details');
    if (statementBody) {
      statementBody.innerHTML = `<tr><td colspan="2" class="text-center p-4 text-red-500 font-semibold">${message}</td></tr>`;
      logDiagnostic('已在對帳單中顯示錯誤訊息');
    }

    // 嘗試禁用相關按鈕
    try {
      const simulateBtn = document.getElementById('simulateNewScenario');
      if (simulateBtn) {
        simulateBtn.disabled = true;
        simulateBtn.classList.add('opacity-50', 'cursor-not-allowed');
        logDiagnostic('已禁用模擬按鈕');
      }
    } catch (e) {
      console.error('[IPO錯誤] 禁用按鈕時出錯:', e);
    }
  }

  // 數字格式化
  function formatNumber(num, decimals = 0) {
    if (typeof num !== 'number' || isNaN(num)) return '-';
    return num.toLocaleString('zh-TW', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  // 特大數字格式化（億為單位）
  function formatLargeNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) return '-';

    // 轉換為億
    const billion = num / 100000000;

    return billion.toLocaleString('zh-TW', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // 紅漲綠跌 - 調整表格顏色
  function getPriceClass(value) {
    if (typeof value !== 'number' || isNaN(value)) return 'text-gray-500';
    return value < 0
      ? 'text-green-600 font-semibold' // 負數(跌) - 綠色
      : value > 0
        ? 'text-red-600 font-semibold' // 正數(漲) - 紅色
        : 'text-gray-500'; // 零 - 灰色
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
      console.error('尚未成功載入IPO數據');
      return;
    }

    // 隨機選擇一支IPO
    const selectedIpo =
      allIpoData[Math.floor(Math.random() * allIpoData.length)];

    // 隨機責任額 (30萬 - 600萬)
    const randomAmount =
      Math.floor(Math.random() * (6000000 - 300000 + 1)) + 300000;

    // 計算買入數量與成本 - 改為以張為單位 (1張 = 1000股)
    const subPrice = selectedIpo.subPrice;
    // 計算可購買張數 (最少1張)
    const lotsToBuy = Math.max(1, Math.floor(randomAmount / subPrice / 1000));
    // 股數 = 張數 * 1000
    const sharesToBuy = lotsToBuy * 1000;
    const actualCost = sharesToBuy * subPrice;

    // 計算賣出價值與費用
    const sellPrice = selectedIpo.monthLow;
    const sellValue = sharesToBuy * sellPrice;
    const sellFeeAndTax = calculateSellFeeAndTax(sellPrice, sharesToBuy);

    // 計算總損益
    const totalLoss = actualCost - sellValue + sellFeeAndTax;
    const lossPercent = (totalLoss / actualCost) * 100;

    // 更新對帳單
    updateStatementUI(
      selectedIpo,
      randomAmount,
      lotsToBuy,
      sharesToBuy,
      actualCost,
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
    lots,
    shares,
    cost,
    sellValue,
    sellFeeAndTax,
    totalLoss,
    lossPercent
  ) {
    const statementHtml = `
        <tr class="hover:bg-neutral-50/30 transition-colors duration-200">
          <td class="px-4 py-3 text-sm font-medium text-neutral-700">股票名稱</td>
          <td class="px-4 py-3 text-sm font-semibold text-neutral-900 text-right">${
            ipo.name
          }</td>
        </tr>
        <tr class="hover:bg-neutral-50/30 transition-colors duration-200">
          <td class="px-4 py-3 text-sm font-medium text-neutral-700">上市日期</td>
          <td class="px-4 py-3 text-sm text-neutral-900 text-right">${ipo.date}</td>
        </tr>
        <tr class="hover:bg-neutral-50/30 transition-colors duration-200">
          <td class="px-4 py-3 text-sm font-medium text-neutral-700">責任額度</td>
          <td class="px-4 py-3 text-sm text-red-600 font-bold text-right">${formatNumber(
            amount
          )} 元</td>
        </tr>
        <tr class="hover:bg-neutral-50/30 transition-colors duration-200">
          <td class="px-4 py-3 text-sm font-medium text-neutral-700">募集價格</td>
          <td class="px-4 py-3 text-sm text-neutral-900 text-right">${formatNumber(
            ipo.subPrice,
            2
          )} 元/股</td>
        </tr>
        <tr class="hover:bg-neutral-50/30 transition-colors duration-200">
          <td class="px-4 py-3 text-sm font-medium text-neutral-700">可購張數</td>
          <td class="px-4 py-3 text-sm text-neutral-900 text-right">${formatNumber(
            lots
          )} 張</td>
        </tr>
        <tr class="hover:bg-neutral-50/30 transition-colors duration-200">
          <td class="px-4 py-3 text-sm font-medium text-neutral-700">可購股數</td>
          <td class="px-4 py-3 text-sm text-neutral-900 text-right">${formatNumber(
            shares
          )} 股</td>
        </tr>
        <tr class="hover:bg-neutral-50/30 transition-colors duration-200">
          <td class="px-4 py-3 text-sm font-medium text-neutral-700">買入成本</td>
          <td class="px-4 py-3 text-sm text-neutral-900 text-right font-semibold">${formatNumber(
            cost
          )} 元</td>
        </tr>
        <tr class="hover:bg-neutral-50/30 transition-colors duration-200">
          <td class="px-4 py-3 text-sm font-medium text-neutral-700">一個月後最低價</td>
          <td class="px-4 py-3 text-sm text-neutral-900 text-right">${formatNumber(
            ipo.monthLow,
            2
          )} 元/股</td>
        </tr>
        <tr class="hover:bg-neutral-50/30 transition-colors duration-200">
          <td class="px-4 py-3 text-sm font-medium text-neutral-700">賣出價值</td>
          <td class="px-4 py-3 text-sm text-neutral-900 text-right font-semibold">${formatNumber(
            sellValue
          )} 元</td>
        </tr>
        <tr class="hover:bg-neutral-50/30 transition-colors duration-200">
          <td class="px-4 py-3 text-sm font-medium text-neutral-700">手續費+稅</td>
          <td class="px-4 py-3 text-sm text-neutral-900 text-right">${formatNumber(
            sellFeeAndTax
          )} 元</td>
        </tr>
      `;

    const statementDetailsElem = document.getElementById('statement-details');
    if (statementDetailsElem) {
      statementDetailsElem.innerHTML = statementHtml;
    }

    const resultElem = document.getElementById('total-loss-amount');
    if (resultElem) {
      resultElem.textContent = `${totalLoss > 0 ? '-' : '+'}${formatNumber(
        Math.abs(totalLoss)
      )} 元 (${Math.abs(lossPercent).toFixed(2)}%)`;
      resultElem.className =
        totalLoss > 0
          ? 'text-xl font-bold text-red-600 transition-colors duration-300' // 虧損 - 紅色
          : 'text-xl font-bold text-green-600 transition-colors duration-300'; // 獲利 - 綠色
    }

    // 更新總責任額顯示（如果存在該元素）
    const totalResponsibilityElem = document.querySelector(
      '.total-responsibility strong'
    );
    if (totalResponsibilityElem) {
      // 將49,107,660萬元轉換為億元
      const totalValue = 49107660 * 10000; // 萬轉元
      totalResponsibilityElem.textContent = formatLargeNumber(totalValue); // 顯示為億
    }

    // 添加動畫效果
    const accountStatement = document.getElementById('account-statement');
    if (accountStatement) {
      accountStatement.classList.add('animate-pulse');
      setTimeout(() => {
        accountStatement.classList.remove('animate-pulse');
      }, 300);
    }
  }

  // 更新壓力模擬
  function updatePressureSimulation(totalLoss, lossPercent, amount) {
    // 隨機選擇一個壓力語錄
    const randomQuote =
      PRESSURE_QUOTES[Math.floor(Math.random() * PRESSURE_QUOTES.length)];
    document.getElementById('manager-quote').innerHTML = randomQuote;

    // 隨機選擇一個內心獨白
    const randomMonologue =
      BROKER_MONOLOGUES[Math.floor(Math.random() * BROKER_MONOLOGUES.length)];
    document.getElementById('broker-monologue').innerHTML = randomMonologue;

    // 計算壓力指數 - 浮誇版本
    let stressValue = 60; // 基礎壓力值提高
    const randomExtra = Math.floor(Math.random() * 40); // 隨機增加0-40%基礎壓力
    stressValue += randomExtra;

    // 根據虧損金額和比例調整壓力值
    if (totalLoss > 0) {
      // 虧損情況
      const amountFactor = Math.min((amount / 1000000) * 15, 30); // 金額因素，最高加30%
      const lossFactor = Math.min(Math.abs(lossPercent) * 1.2, 40); // 虧損率因素，最高加40%
      stressValue += amountFactor + lossFactor;

      // 額外隨機因素，有機會導致壓力暴表
      if (Math.random() < 0.3) {
        // 30%機率增加額外壓力
        stressValue += Math.floor(Math.random() * 40) + 10; // 增加10-50%額外壓力
      }
    } else {
      // 獲利情況，降低壓力
      stressValue -= Math.min(Math.abs(lossPercent) * 1.5, 20);
    }

    // 不設上限，允許超過100%
    stressValue = Math.max(10, stressValue); // 只設最低值

    // 更新UI
    const stressMeter = document.querySelector('.stress-bar');
    const stressLevel = document.getElementById('stress-level');
    const stressPercent = document.getElementById('stress-percent');
    const pressureSimulation = document.getElementById('pressure-simulation');

    // 設定壓力條寬度
    let displayWidth = stressValue;
    if (stressValue > 100) {
      displayWidth = 100; // 寬度最多100%，但視覺效果表現更多
    }

    stressMeter.style.width = `${displayWidth}%`;
    stressPercent.textContent = `${Math.round(stressValue)}%`;

    // 移除所有特殊類別
    stressMeter.classList.remove('extreme', 'overflow');
    stressLevel.classList.remove('extreme');
    stressPercent.classList.remove('extreme');
    pressureSimulation.classList.remove('extreme-stress');

    // 根據壓力調整顏色和特效
    if (stressValue > 150) {
      // 極端壓力情況 - 視覺爆表
      stressMeter.classList.add('extreme', 'overflow');
      stressLevel.classList.add('extreme');
      stressPercent.classList.add('extreme');
      stressMeter.style.backgroundColor = '#dc2626'; // 深紅色
      pressureSimulation.classList.add('extreme-stress'); // 添加震動效果
    } else if (stressValue > 100) {
      // 過度壓力 - 視覺溢出
      stressMeter.classList.add('overflow');
      stressPercent.classList.add('extreme');
      stressMeter.style.backgroundColor = '#ef4444'; // 紅色
    } else if (stressValue > 80) {
      stressMeter.style.backgroundColor = '#f59e0b'; // 橙色
    } else if (stressValue > 60) {
      stressMeter.style.backgroundColor = '#eab308'; // 黃色
    } else if (stressValue > 40) {
      stressMeter.style.backgroundColor = '#84cc16'; // 黃綠色
    } else {
      stressMeter.style.backgroundColor = '#22c55e'; // 綠色
    }
  }

  // 更新價格圖表
  function updatePriceChart(ipo, buyPrice, sellPrice) {
    const chartCanvas = document.getElementById('ipo-price-chart');
    if (!chartCanvas) {
      console.error('[IPO錯誤] 找不到圖表畫布元素');
      return;
    }

    const ctx = chartCanvas.getContext('2d');

    // 檢查Chart.js是否可用
    if (typeof Chart === 'undefined') {
      console.error('[IPO錯誤] Chart.js 未載入');
      return;
    }

    // 確保畫布尺寸正確響應容器
    const resizeChart = function () {
      const container = chartCanvas.parentElement;
      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // 設置畫布尺寸以匹配容器，確保有足夠的空間
        chartCanvas.style.width = '100%';
        chartCanvas.style.height = '100%';

        // 確保最小高度
        if (containerHeight < 350) {
          chartCanvas.style.height = '350px';
        }
      }
    };

    // 立即調整尺寸
    resizeChart();

    // 監聽窗口大小變化，重新調整圖表尺寸
    window.addEventListener('resize', function () {
      if (ipoSimulationChart) {
        resizeChart();
        ipoSimulationChart.resize();
      }
    });

    // 模擬30天的價格走勢
    const days = 30;
    const dayLabels = Array.from({ length: days }, (_, i) => `Day ${i + 1}`);
    dayLabels[0] = '募集日';
    dayLabels[1] = '上市日';
    dayLabels[days - 1] = '一個月後';

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
        type: 'line',
        data: {
          labels: dayLabels,
          datasets: [
            {
              label: '價格 (元)',
              data: prices,
              fill: false,
              borderColor: '#1a5d7a',
              tension: 0.4,
              pointRadius: 0,
            },
            {
              label: '買入點',
              data: Array(days).fill(null),
              pointBackgroundColor: '#e23e57',
              pointBorderColor: '#fff',
              pointRadius: [0, 6, ...Array(days - 2).fill(0)],
            },
            {
              label: '賣出點',
              data: Array(days).fill(null),
              pointBackgroundColor: '#22c55e',
              pointBorderColor: '#fff',
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
              mode: 'index',
              intersect: false,
              callbacks: {
                label: function (context) {
                  const label = context.dataset.label || '';
                  if (label === '買入點') {
                    return `買入價: ${formatNumber(buyPrice, 2)} 元`;
                  } else if (label === '賣出點') {
                    return `賣出價: ${formatNumber(sellPrice, 2)} 元`;
                  }
                  return `${label}: ${formatNumber(context.parsed.y, 2)} 元`;
                },
              },
            },
            legend: {
              position: 'bottom',
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
      console.error('[IPO錯誤] 建立圖表時出錯:', error);
    }
  }

  // 填充數據表格
  function populateDataTable(data) {
    const tableBody = document.getElementById('ipo-data-table-body');
    if (!tableBody) {
      console.error('[IPO錯誤] 找不到數據表格元素 ipo-data-table-body');
      return;
    }

    if (data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-gray-500">無可用數據</td></tr>`;
      return;
    }

    logDiagnostic(`開始填充數據表格，共 ${data.length} 行數據`);

    // 按上市日期排序（最新的在前）
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a.date.replace(/\//g, '-'));
      const dateB = new Date(b.date.replace(/\//g, '-'));
      return dateB - dateA; // 降序排列，最新日期在前
    });

    // 找出月後潛在虧損前10高的項目
    const top10LossData = [...data]
      .sort((a, b) => a.lossMonth1Percent - b.lossMonth1Percent) // 升序排列，虧損最大的在前（負數最小）
      .slice(0, 10)
      .map(item => item.name);

    logDiagnostic('月後潛在虧損前10高的項目:', top10LossData);

    let html = '';
    let processedCount = 0;

    sortedData.forEach((item, index) => {
      try {
        const isTop10Loss = top10LossData.includes(item.name);

        // 生成行的HTML
        const rowHtml = `
          <tr class="hover:bg-neutral-50/30 transition-colors duration-200 ${
            isTop10Loss ? 'bg-red-50 border-l-4 border-red-400' : ''
          }">
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-700 font-medium">
              ${item.name}
              ${isTop10Loss ? '<span class="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">高風險</span>' : ''}
            </td>
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
            )} text-right font-semibold">${formatNumber(item.lossDay1Percent, 1)}%</td>
            <td class="whitespace-nowrap px-3 py-4 text-sm ${getPriceClass(
              item.lossMonth1Percent
            )} text-right font-semibold">${formatNumber(item.lossMonth1Percent, 1)}%</td>
          </tr>
        `;

        html += rowHtml;
        processedCount++;

        // 記錄高風險項目
        if (isTop10Loss) {
          logDiagnostic(`高風險項目(位置: ${index + 1}):`, {
            name: item.name,
            date: item.date,
            lossMonth1Percent: item.lossMonth1Percent,
          });
        }
      } catch (error) {
        console.error(
          `[IPO錯誤] 處理第 ${index + 1} 行數據時出錯:`,
          error,
          item
        );
      }
    });

    // 設置表格內容
    tableBody.innerHTML = html;

    logDiagnostic(
      `數據表格填充完成，成功處理 ${processedCount}/${data.length} 行`
    );

    // 添加數據統計信息到表格下方
    addDataStatistics(data, top10LossData.length);

    // 確認高風險項目是否在表格中
    setTimeout(() => {
      const rows = tableBody.querySelectorAll('tr');
      let foundHighRisk = 0;
      rows.forEach((row, index) => {
        const firstCell = row.querySelector('td');
        if (firstCell && firstCell.textContent.includes('高風險')) {
          foundHighRisk++;
        }
      });

      logDiagnostic(`✅ 月後潛在虧損前10高的項目已標記: ${foundHighRisk} 個`);
    }, 100);
  }

  // 添加數據統計信息
  function addDataStatistics(data, top10Count) {
    const container = document.querySelector(
      '#detailed-data-section .overflow-x-auto'
    );
    if (!container) return;

    // 移除已有的統計信息
    const existingStats = container.querySelector('.data-statistics');
    if (existingStats) {
      existingStats.remove();
    }

    // 計算統計數據
    const totalCount = data.length;
    const breakEvenCount = data.filter(
      item => item.lossDay1Percent >= 0
    ).length;
    const profitableCount = data.filter(
      item => item.lossMonth1Percent >= 0
    ).length;
    const avgDayLoss =
      data.reduce((sum, item) => sum + item.lossDay1Percent, 0) / totalCount;
    const avgMonthLoss =
      data.reduce((sum, item) => sum + item.lossMonth1Percent, 0) / totalCount;
    const highRiskCount = top10Count || 0;

    const statsHtml = `
      <div class="data-statistics mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
          <i class="fas fa-chart-bar text-blue-500 mr-2"></i>數據統計概覽
        </h4>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">${totalCount}</div>
            <div class="text-gray-600">總數據筆數</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold ${breakEvenCount > 0 ? 'text-green-600' : 'text-red-600'}">${breakEvenCount}</div>
            <div class="text-gray-600">當日未破發</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold ${profitableCount > 0 ? 'text-green-600' : 'text-red-600'}">${profitableCount}</div>
            <div class="text-gray-600">月後獲利</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold ${avgMonthLoss >= 0 ? 'text-green-600' : 'text-red-600'}">${formatNumber(avgMonthLoss, 1)}%</div>
            <div class="text-gray-600">平均月後報酬</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600">${highRiskCount}</div>
            <div class="text-gray-600">高風險項目</div>
          </div>
        </div>
        <div class="mt-3 text-xs text-gray-500 flex items-center">
          <i class="fas fa-info-circle mr-1"></i>
          高風險項目為月後潛在虧損前10高的IPO
        </div>
      </div>
    `;

    container.insertAdjacentHTML('afterend', statsHtml);
  }

  // 計算並顯示統計數據
  function calculateAndDisplayStats(data) {
    // 此功能在目前版本中暫未實現
    console.log('統計數據已計算但未顯示');
  }

  // 綁定事件初始化
  function initializeEventHandlers() {
    logDiagnostic('開始綁定事件處理器...');

    try {
      const simulateBtn = document.getElementById('simulateNewScenario');
      if (simulateBtn) {
        simulateBtn.addEventListener('click', runSimulation);
        logDiagnostic('已綁定模擬按鈕事件');
      } else {
        console.error('[IPO錯誤] 找不到模擬按鈕元素');
      }

      const toggleBtn = document.getElementById('toggleDetailedView');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', function () {
          const detailedSection = document.getElementById(
            'detailed-data-section'
          );
          if (detailedSection) {
            detailedSection.classList.toggle('hidden');
            this.innerHTML = detailedSection.classList.contains('hidden')
              ? '<i class="fas fa-table mr-2"></i>完整數據檢視'
              : '<i class="fas fa-eye-slash mr-2"></i>隱藏完整數據';
            logDiagnostic('已切換詳細數據視圖可見性');
          }
        });
        logDiagnostic('已綁定切換詳細視圖按鈕事件');
      } else {
        console.error('[IPO錯誤] 找不到切換詳細視圖按鈕元素');
      }

      const hideBtn = document.getElementById('hideDetailedData');
      if (hideBtn) {
        hideBtn.addEventListener('click', function () {
          const detailedSection = document.getElementById(
            'detailed-data-section'
          );
          if (detailedSection) {
            detailedSection.classList.add('hidden');

            const toggleBtn = document.getElementById('toggleDetailedView');
            if (toggleBtn) {
              toggleBtn.innerHTML =
                '<i class="fas fa-table mr-2"></i>完整數據檢視';
            }

            logDiagnostic('已隱藏詳細數據視圖');
          }
        });
        logDiagnostic('已綁定隱藏詳細數據按鈕事件');
      } else {
        console.error('[IPO錯誤] 找不到隱藏詳細數據按鈕元素');
      }
    } catch (error) {
      console.error('[IPO錯誤] 綁定事件時發生錯誤:', error);
    }
  }

  // 主要初始化函數
  function initializeModule() {
    logDiagnostic('開始初始化IPO破發模組...');

    // 檢查DOM元素是否全部就緒
    if (!checkDomElements()) {
      console.warn('[IPO警告] DOM元素尚未完全載入，延遲初始化');
      setTimeout(initializeModule, 500); // 延遲重試
      return;
    }

    // 綁定事件處理器
    initializeEventHandlers();

    // 開始載入數據
    loadAndProcessData();

    // 處理數據來源文本，使其獨立一行
    document.querySelectorAll('span').forEach(span => {
      if (span.textContent.includes('基於實際IPO數據與模擬買賣時機')) {
        span.className = 'data-source-note';
      }
    });

    // 處理總責任額的顯示
    document.querySelectorAll('span[title]').forEach(span => {
      if (span.textContent.includes('加權總責任額')) {
        span.className = 'total-responsibility';
        const strong = span.querySelector('strong');
        if (strong) {
          // 將49,107,660萬元轉換為億元
          const valueText = strong.textContent.replace(/,/g, '');
          const value = parseInt(valueText) * 10000; // 萬轉元
          strong.textContent = formatLargeNumber(value); // 顯示為億
          // 更新單位文本
          span.innerHTML = span.innerHTML.replace('萬元', '億元');
        }
      }
    });
  }

  // 確保在DOM準備就緒後初始化
  function ensureDOMReady(callback) {
    if (
      document.readyState === 'complete' ||
      document.readyState === 'interactive'
    ) {
      logDiagnostic('文檔已準備就緒，立即初始化');
      setTimeout(callback, 100); // 給予少許時間確保元素完全可用
    } else {
      logDiagnostic('等待文檔完全載入...');
      document.addEventListener('DOMContentLoaded', function () {
        logDiagnostic('文檔載入完成，準備初始化');
        setTimeout(callback, 100);
      });
    }
  }

  // 啟動模組
  ensureDOMReady(initializeModule);
})();
