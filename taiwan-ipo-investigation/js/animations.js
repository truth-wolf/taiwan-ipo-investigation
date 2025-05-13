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

// 初始化計數器動畫
function initCounterAnimations() {
  // 選擇所有計數器元素
  const counters = document.querySelectorAll('.counter');
  
  // 創建滾動觀察器
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 取得目標值
        const target = parseInt(entry.target.getAttribute('data-target'));
        // 設置計數動畫的持續時間(毫秒)
        const duration = 2000;
        // 動畫開始時間
        const startTime = performance.now();
        
        // 執行計數動畫
        function updateCounter(currentTime) {
          // 計算經過的時間比例
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // 使用緩動函數使動畫更自然
          const easeOutQuad = progress * (2 - progress);
          
          // 計算當前值
          const value = Math.floor(easeOutQuad * target);
          
          // 更新元素文本
          entry.target.innerText = value;
          
          // 如果動畫未完成，繼續更新
          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          }
        }
        
        // 開始計數動畫
        requestAnimationFrame(updateCounter);
        
        // 元素已經顯示後不再觀察
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5
  });
  
  // 觀察所有計數器元素
  counters.forEach(counter => {
    observer.observe(counter);
  });
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

