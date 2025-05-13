/**
 * loader.js - 頁面加載動畫
 * 
 * 顯示頁面加載進度，增強用戶體驗
 */

document.addEventListener('DOMContentLoaded', function() {
  // 創建加載指示器
  const loader = document.getElementById('page-loader');
  
  // 如果加載指示器存在，則設置淡出動畫
  if (loader) {
    setTimeout(function() {
      loader.classList.add('fade-out');
      
      // 動畫結束後移除加載指示器
      setTimeout(function() {
        loader.remove();
        document.body.classList.add('loaded');
      }, 500);
    }, 1000);
  } else {
    document.body.classList.add('loaded');
  }
  
  // 偵測各部分資源是否已加載
  const headerContainer = document.getElementById('header-container');
  const footerContainer = document.getElementById('footer-container');
  const timelineSection = document.getElementById('timeline-section');
  const dataSection = document.getElementById('data-section');
  const impactSection = document.getElementById('impact-section');
  const actionsSection = document.getElementById('actions-section');
  
  // 檢查所有必要的部分是否已加載
  function checkAllPartsLoaded() {
    if (headerContainer.innerHTML && 
        footerContainer.innerHTML && 
        timelineSection.innerHTML && 
        dataSection.innerHTML && 
        impactSection.innerHTML && 
        actionsSection.innerHTML) {
      // 所有部分已加載，可以移除加載指示器
      if (loader && !loader.classList.contains('fade-out')) {
        loader.classList.add('fade-out');
        
        setTimeout(function() {
          loader.remove();
          document.body.classList.add('loaded');
        }, 500);
      }
    }
  }
  
  // 設置觀察器以檢測DOM變化
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        checkAllPartsLoaded();
      }
    });
  });
  
  // 觀察DOM變化
  const config = { childList: true, subtree: true };
  
  // 觀察所有主要容器
  [headerContainer, footerContainer, timelineSection, dataSection, impactSection, actionsSection].forEach(container => {
    if (container) {
      observer.observe(container, config);
    }
  });
  
  // 初次檢查
  checkAllPartsLoaded();
});

/**
 * 添加頁面加載進度功能
 * 跟踪資源加載進度並更新進度條
 */
(function() {
  // 創建進度條
  const progressBar = document.querySelector('.loader-progress');
  if (!progressBar) return;
  
  // 獲取所有需要加載的資源
  const resources = [...document.querySelectorAll('img, script, link[rel="stylesheet"]')];
  const totalResources = resources.length;
  let loadedResources = 0;
  
  // 初始化進度顯示
  updateProgress(0);
  
  // 監聽每個資源的加載完成事件
  resources.forEach(resource => {
    if (resource.complete || resource.readyState === 4) {
      // 資源已加載
      resourceLoaded();
    } else {
      // 為資源添加加載事件監聽器
      resource.addEventListener('load', resourceLoaded);
      resource.addEventListener('error', resourceLoaded); // 即使加載失敗也計算為已處理
    }
  });
  
  // 資源加載完成處理函數
  function resourceLoaded() {
    loadedResources++;
    const progress = Math.min(loadedResources / totalResources, 1);
    updateProgress(progress);
    
    // 所有資源加載完成
    if (loadedResources >= totalResources) {
      setTimeout(function() {
        const loader = document.getElementById('page-loader');
        if (loader) {
          loader.classList.add('fade-out');
          setTimeout(() => loader.remove(), 500);
        }
      }, 500);
    }
  }
  
  // 更新進度條
  function updateProgress(progress) {
    if (progressBar) {
      const percentage = Math.round(progress * 100);
      progressBar.style.width = percentage + '%';
      
      const progressText = document.querySelector('.loader-progress-text');
      if (progressText) {
        progressText.textContent = percentage + '%';
      }
    }
  }
  
  // 如果沒有資源或加載過程太快，確保在一段時間後隱藏加載器
  setTimeout(function() {
    const loader = document.getElementById('page-loader');
    if (loader && !loader.classList.contains('fade-out')) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 500);
    }
  }, 2500);
})();
