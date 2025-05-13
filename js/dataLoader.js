/**
 * dataLoader.js - 數據與範本讀取模組
 * 
 * 提供專案數據載入功能:
 * - 讀取CSV數據
 * - 初始化DataTables
 * - 檢舉範本載入
 */

// 初始化函數，由DOM載入後自動呼叫
function initDataLoader() {
  console.log("DataLoader 初始化...");
  loadCsvData();
  loadReportTemplates();
}

// 載入CSV數據
function loadCsvData() {
  console.log("開始載入CSV數據...");
  const csvTable = document.getElementById('csv-table');
  if (!csvTable) {
    console.error("找不到CSV表格元素!");
    return;
  }

  // 檢查jQuery和DataTables是否已載入
  if (typeof $ === 'undefined' || typeof $.fn.DataTable === 'undefined') {
    console.error('需要jQuery和DataTables庫');
    return;
  }

  // 使用Fetch API讀取CSV檔案
  fetch('ipo_broker_product.csv')
    .then(response => {
      if (!response.ok) {
        throw new Error('CSV檔案讀取失敗');
      }
      return response.text();
    })
    .then(csvData => {
      console.log("成功獲取CSV數據，數據長度:", csvData.length);
      
      // 使用Papa Parse解析CSV
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
          console.log("CSV解析完成，列數:", results.data.length);
          console.log("CSV欄位:", results.meta.fields);
          
          // 初始化DataTables
          initDataTable(results.data, results.meta.fields);
        },
        error: function(error) {
          console.error('CSV解析錯誤:', error);
          csvTable.innerHTML = '<tbody><tr><td colspan="4" class="text-red-500 p-4">數據解析錯誤，請稍後再試。</td></tr></tbody>';
        }
      });
    })
    .catch(error => {
      console.error('載入CSV數據時出錯:', error);
      csvTable.innerHTML = '<tbody><tr><td colspan="4" class="text-red-500 p-4">載入數據時出錯，請稍後再試。</td></tr></tbody>';
    });
}

// 初始化DataTable
function initDataTable(data, fields) {
  console.log("初始化DataTable，數據行數:", data.length);
  const csvTable = document.getElementById('csv-table');
  if (!csvTable) return;

  // 清空表格中的現有內容，但保留thead
  const thead = csvTable.querySelector('thead');
  csvTable.innerHTML = '';
  csvTable.appendChild(thead);
  
  // 添加一個空的tbody
  const tbody = document.createElement('tbody');
  csvTable.appendChild(tbody);

  // 準備DataTables欄位設定
  const columns = [
    { data: fields[0], title: "券商" },
    { data: fields[1], title: "產品", render: function(data) {
      // 為產品欄位添加letter-spacing防斷行
      return '<span style="letter-spacing:-0.5px;">' + data + '</span>';
    }},
    { data: fields[2], title: "責任額", className: "dt-right font-bold" },
    { data: fields[3], title: "募集期間" }
  ];

  // 初始化DataTables
  const dataTable = $(csvTable).DataTable({
    data: data,
    columns: columns,
    order: [[2, "desc"]], // 預設按責任額降序排序
    pageLength: 10, // 手機版每頁10筆
    responsive: true, // 響應式設計
    language: {
      search: "搜尋",
      lengthMenu: "每頁 _MENU_ 筆",
      info: "顯示第 _START_ 至 _END_ 筆結果，共 _TOTAL_ 筆",
      paginate: {
        first: "第一頁",
        last: "最後一頁",
        next: "下一頁",
        previous: "上一頁"
      },
      zeroRecords: "沒有找到匹配的記錄",
      infoEmpty: "沒有記錄",
      infoFiltered: "(從 _MAX_ 筆記錄中過濾)"
    },
    dom: '<"top"f>rt<"bottom"lip>', // 自訂控制項佈局
    initComplete: function() {
      console.log("DataTable初始化完成");
      
      // 為桌面版增加更多功能
      if (window.innerWidth > 768) {
        // 增加額外欄位選擇器
        const columnSelector = $(
          '<div class="column-selector mb-4"><label class="mr-2">顯示欄位：</label></div>'
        );
        const additionalColumns = [
          { title: "募集天數", visible: false },
          { title: "平均日責任額", visible: false }
        ];

        additionalColumns.forEach(col => {
          const checkbox = $(
            `<label class="inline-flex items-center mr-4"><input type="checkbox" class="mr-1">${col.title}</label>`
          );
          columnSelector.append(checkbox);
        });

        $('.dataTables_wrapper .top').prepend(columnSelector);
      }
      
      // 為第一行數據添加高亮
      if (data.length > 0) {
        const firstRow = $('#csv-table tbody tr:first-child');
        firstRow.addClass('bg-primary bg-opacity-10');
      }
    }
  });

  // 為DataTable增加響應式樣式
  $("#csv-table").wrap('<div class="table-wrap overflow-x-auto -webkit-overflow-scrolling-touch"></div>');

  // 為手機版設置固定標頭
  if (window.innerWidth <= 768) {
    $("#csv-table thead").addClass("sticky top-0 bg-white z-10");
  }

  // 監聽行點擊事件
  $("#csv-table tbody").on("click", "tr", function() {
    if (window.innerWidth <= 768) {
      // 手機版顯示詳情模態框
      const data = dataTable.row(this).data();
      showDetailModal(data, fields);
    }
  });
}

// 顯示詳細資料模態框
function showDetailModal(data, fields) {
  console.log("顯示詳情模態框，數據:", data);
  // 如果模態框不存在則創建
  let modal = document.getElementById("data-detail-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "data-detail-modal";
    modal.className = "fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center hidden";
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

    // 添加關閉事件
    modal.querySelector(".close-modal").addEventListener("click", function() {
      modal.classList.add("hidden");
    });

    // 點擊背景關閉
    modal.addEventListener("click", function(e) {
      if (e.target === modal) {
        modal.classList.add("hidden");
      }
    });
  }

  // 填充數據
  modal.querySelector(".product-title").textContent = data[fields[1]];
  modal.querySelector(".broker").textContent = data[fields[0]];
  modal.querySelector(".responsibility").textContent = data[fields[2]];
  modal.querySelector(".period").textContent = data[fields[3]];

  // 顯示模態框
  modal.classList.remove("hidden");
}

// 載入檢舉信範本
function loadReportTemplates() {
  console.log("開始載入檢舉信範本...");
  const templatesContainer = document.getElementById('templates-container');
  if (!templatesContainer) {
    console.error("找不到範本容器元素!");
    return;
  }

  // 清空容器
  templatesContainer.innerHTML = '<div class="mt-8"><h4 class="font-semibold mb-4">可用範本</h4><div id="template-items" class="space-y-3"></div></div>';
  const templateItems = document.getElementById('template-items');
  if (!templateItems) {
    console.error("找不到範本項目容器!");
    return;
  }

  // 範本文件列表
  const templateFiles = [
    { id: '1', name: '銀行串聯檢舉信版本一', file: 'txt/1.txt' },
    { id: '9', name: '檢舉信版本九', file: 'txt/9.txt' },
    { id: '11', name: '檢舉信版本 LUCKY 11', file: 'txt/11.txt' }
  ];
  
  console.log("準備加載", templateFiles.length, "個範本檔案");
  
  // 為每個範本創建按鈕
  templateFiles.forEach(template => {
    console.log("處理範本:", template.name);
    const button = document.createElement('button');
    button.className = 'copy-btn w-full py-3 px-4 bg-secondary text-white rounded-lg flex items-center justify-between hover:bg-secondary-dark transition-colors btn-effect';
    button.setAttribute('data-template', `template-${template.id}`);
    button.innerHTML = `
      <span>${template.name}</span>
      <i class="fas fa-copy"></i>
    `;
    
    templateItems.appendChild(button);
    
    // 載入範本內容
    fetch(template.file)
      .then(response => {
        if (!response.ok) {
          throw new Error(`無法載入範本 ${template.file}`);
        }
        return response.text();
      })
      .then(content => {
        console.log(`成功讀取範本 ${template.file}, 內容長度:`, content.length);
        
        // 創建隱藏的範本內容元素
        const templateEl = document.createElement('div');
        templateEl.id = `template-${template.id}`;
        templateEl.className = 'hidden';
        templateEl.textContent = content;
        document.body.appendChild(templateEl);
        
        // 繼續為剛才的按鈕添加點擊事件
        button.addEventListener('click', function() {
          const templateContent = document.getElementById('template-content');
          const editorPlaceholder = document.getElementById('editor-placeholder');
          
          if (templateContent && editorPlaceholder) {
            // 顯示範本內容
            editorPlaceholder.classList.add('hidden');
            templateContent.classList.remove('hidden');
            templateContent.innerHTML = formatTemplate(content);
            
            // 複製到剪貼簿
            copyTextToClipboard(content);
          }
        });
      })
      .catch(error => {
        console.error(`載入範本 ${template.file} 出錯:`, error);
        // 為按鈕添加錯誤狀態
        button.classList.add('bg-red-500');
        button.classList.remove('bg-secondary');
        button.innerHTML = `
          <span>${template.name} (載入失敗)</span>
          <i class="fas fa-exclamation-triangle"></i>
        `;
        button.disabled = true;
      });
  });
}

// 格式化範本文本
function formatTemplate(text) {
  return text
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .replace(/（[^）]+）/g, '<span class="text-secondary">$&</span>');
}

// 複製文本到剪貼簿
function copyTextToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    const successful = document.execCommand('copy');
    if (typeof window.showToast === 'function') {
      window.showToast('範本已複製到剪貼簿！');
    } else {
      console.log('範本已複製到剪貼簿！');
    }
  } catch (err) {
    console.error('複製失敗:', err);
    if (typeof window.showToast === 'function') {
      window.showToast('複製失敗，請手動複製');
    } else {
      console.log('複製失敗，請手動複製');
    }
  }
  
  document.body.removeChild(textarea);
}

// 在DOM完成載入後初始化資料載入器
document.addEventListener('DOMContentLoaded', initDataLoader);
