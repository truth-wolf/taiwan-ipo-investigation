/**
 * animations.js - 網站動畫效果
 * 
 * 提供以下動畫功能：
 * - 計數器動畫
 * - 滾動顯示效果
 * - 數據條動畫
 * - 頁面載入動畫
 */

// 動畫模組函數
window.animationsModule = function() {
  // 初始化滾動動畫
  initScrollAnimations();
  
  // 初始化計數器動畫
  initCounterAnimations();
  
  // 初始化數據條動畫
  initDataBarAnimations();
  
  // 暫停計數器動畫功能
  window.animationsModule.pauseCounters = function() {
    window.countersPaused = true;
    console.log('計數器動畫已暫停');
  };
  
  // 恢復計數器動畫功能
  window.animationsModule.resumeCounters = function() {
    window.countersPaused = false;
    // 如果頁面已經載入完成，立即啟動計數器
    if (document.body.classList.contains('loaded')) {
      startCounterAnimations();
      console.log('計數器動畫已啟動');
    }
  };
  
  // 監聽頁面載入狀態
  document.addEventListener('loaderCompleted', function() {
    // 檢查是否需要啟動計數器
    if (!window.countersPaused) {
      startCounterAnimations();
    }
  });
};

// 初始化滾動觀察器
function initScrollAnimations() {
  // 選擇所有帶有fade-in類的元素
  const fadeElements = document.querySelectorAll('.fade-in');
  
  // 創建滾動觀察器
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 當元素進入視窗時添加可見類
        entry.target.classList.add('visible');
        // 元素已經顯示後不再觀察
        observer.unobserve(entry.target);
      }
    });
  }, {
    // 配置觀察器，當元素進入20%視窗時觸發
    threshold: 0.2
  });
  
  // 觀察所有淡入元素
  fadeElements.forEach(element => {
    observer.observe(element);
  });
}

// 計數器觀察器引用
let countersObserver;

// 初始化計數器動畫
function initCounterAnimations() {
  // 初始化暫停狀態
  window.countersPaused = window.countersPaused || false;
  
  // 創建計數器觀察器
  createCountersObserver();
  
  // 如果沒有暫停，觀察計數器
  if (!window.countersPaused) {
    startCounterAnimations();
  }
}

// 創建計數器觀察器
function createCountersObserver() {
  // 創建滾動觀察器
  countersObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !window.countersPaused) {
        animateCounter(entry.target);
        
        // 元素已經顯示後不再觀察
        countersObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5
  });
}

// 啟動計數器觀察
function startCounterAnimations() {
  // 選擇所有計數器元素
  const counters = document.querySelectorAll('.counter');
  
  // 確保觀察器存在
  if (!countersObserver) {
    createCountersObserver();
  }
  
  // 觀察所有計數器元素
  counters.forEach(counter => {
    // 跳過已經動畫完的計數器
    if (!counter.hasAttribute('data-animated')) {
      countersObserver.observe(counter);
    }
  });
}

// 動畫單個計數器
function animateCounter(counterElement) {
  // 取得目標值
  const target = parseInt(counterElement.getAttribute('data-target'));
  // 設置計數動畫的持續時間(毫秒)
  const duration = 2000;
  // 動畫開始時間
  const startTime = performance.now();
  
  // 標記已在動畫中
  counterElement.setAttribute('data-animating', 'true');
  
  // 執行計數動畫
  function updateCounter(currentTime) {
    // 檢查是否暫停
    if (window.countersPaused) {
      // 如果暫停，保存目前狀態但不繼續動畫
      return;
    }
    
    // 計算經過的時間比例
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // 使用緩動函數使動畫更自然
    const easeOutQuad = progress * (2 - progress);
    
    // 計算當前值
    const value = Math.floor(easeOutQuad * target);
    
    // 更新元素文本
    counterElement.innerText = value;
    
    // 如果動畫未完成，繼續更新
    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      // 動畫完成，標記為完成
      counterElement.removeAttribute('data-animating');
      counterElement.setAttribute('data-animated', 'true');
    }
  }
  
  // 開始計數動畫
  requestAnimationFrame(updateCounter);
}

// 初始化數據條動畫
function initDataBarAnimations() {
  // 選擇所有數據條
  const dataBars = document.querySelectorAll('.data-bar');
  
  // 創建滾動觀察器
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 添加動畫類
        entry.target.classList.add('animate');
        
        // 延遲顯示數據百分比
        const span = entry.target.querySelector('span');
        if (span) {
          const delay = parseInt(span.getAttribute('data-show-after') || '0');
          
          setTimeout(() => {
            span.style.opacity = '1';
          }, delay);
        }
        
        // 元素已經顯示後不再觀察
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.4
  });
  
  // 觀察所有數據條
  dataBars.forEach(bar => {
    observer.observe(bar);
  });
}

