// 自動化整合Excel資料和檢舉信功能
document.addEventListener("DOMContentLoaded", function () {
  console.log("自動化整合腳本啟動...");

  // 1. 確保CSV數據正確載入
  checkCSVLoaded();

  // 2. 確保檢舉信內容正確載入
  checkTemplatesLoaded();
});

// 檢查CSV資料是否正確載入
function checkCSVLoaded() {
  const maxAttempts = 10;
  let attempts = 0;

  function checkTable() {
    const csvTable = document.getElementById("csv-table");
    if (!csvTable) {
      console.log("找不到CSV表格元素，請確認HTML結構");
      return;
    }

    if (csvTable.rows.length > 1) {
      console.log(
        "✅ CSV資料成功載入，共" + (csvTable.rows.length - 1) + "筆記錄"
      );
    } else {
      attempts++;
      if (attempts < maxAttempts) {
        console.log("CSV資料尚未載入完成，嘗試次數: " + attempts);
        setTimeout(checkTable, 1000);
      } else {
        console.log("❌ CSV資料載入失敗，請檢查檔案路徑或格式");
      }
    }
  }

  setTimeout(checkTable, 2000);
}

// 檢查檢舉信模板是否正確載入
function checkTemplatesLoaded() {
  const maxAttempts = 10;
  let attempts = 0;

  function checkTemplates() {
    const templateContainer = document.getElementById("templates-container");
    if (!templateContainer) {
      console.log("找不到檢舉信模板容器，請確認HTML結構");
      return;
    }

    if (templateContainer.querySelectorAll(".copy-btn").length > 0) {
      console.log(
        "✅ 檢舉信模板成功載入，共" +
          templateContainer.querySelectorAll(".copy-btn").length +
          "個模板"
      );
    } else {
      attempts++;
      if (attempts < maxAttempts) {
        console.log("檢舉信模板尚未載入完成，嘗試次數: " + attempts);
        setTimeout(checkTemplates, 1000);
      } else {
        console.log("❌ 檢舉信模板載入失敗，請檢查檔案路徑或格式");
      }
    }
  }

  setTimeout(checkTemplates, 2000);
}
