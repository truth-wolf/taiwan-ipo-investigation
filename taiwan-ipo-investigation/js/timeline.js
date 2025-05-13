/**
 * timeline.js - 時間軸功能模組
 *
 * 提供時間軸功能，包括：
 * - 時間軸事件動畫
 * - 時間點標記
 * - 互動反饋
 */

window.timelineModule = function() {
  // 選擇所有時間點元素
  const timelineDots = document.querySelectorAll('.timeline-dot');
  const timelineItems = document.querySelectorAll('.timeline-item');
  
  // 初始化時間軸視覺效果
  function initTimeline() {
    // 為每個時間點添加動畫與互動效果
    timelineDots.forEach((dot, index) => {
      // 添加延遲動畫
      dot.style.animationDelay = `${index * 0.2}s`;
      
      // 添加hover效果
      dot.addEventListener('mouseenter', function() {
        this.classList.add('timeline-dot-hover');
      });
      
      dot.addEventListener('mouseleave', function() {
        this.classList.remove('timeline-dot-hover');
      });
      
      // 點擊效果 - 高亮對應的時間項目
      dot.addEventListener('click', function() {
        // 移除所有項目的高亮
        timelineItems.forEach(item => {
          item.classList.remove('timeline-item-highlight');
        });
        
        // 高亮當前項目
        if (timelineItems[index]) {
          timelineItems[index].classList.add('timeline-item-highlight');
        }
      });
    });
    
    // 為時間軸項目添加滾動觀察器
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('timeline-item-visible');
          
          // 同時顯示對應的時間點
          const index = Array.from(timelineItems).indexOf(entry.target);
          if (timelineDots[index]) {
            timelineDots[index].classList.add('timeline-dot-visible');
          }
        }
      });
    }, {
      threshold: 0.3
    });
    
    // 觀察所有時間軸項目
    timelineItems.forEach(item => {
      observer.observe(item);
    });
  }
  
  // 準備連接線
  function prepareTimelineConnections() {
    const timeline = document.querySelector('.timeline');
    if (!timeline || timelineDots.length < 2) return;
    
    // 創建連接線元素
    const connection = document.createElement('div');
    connection.classList.add('timeline-connection');
    timeline.appendChild(connection);
    
    // 調整連接線位置
    const firstDot = timelineDots[0];
    const lastDot = timelineDots[timelineDots.length - 1];
    
    if (firstDot && lastDot) {
      const firstDotRect = firstDot.getBoundingClientRect();
      const lastDotRect = lastDot.getBoundingClientRect();
      const timelineRect = timeline.getBoundingClientRect();
      
      // 計算相對於時間軸的位置
      const top = firstDotRect.top - timelineRect.top + firstDotRect.height / 2;
      const height = lastDotRect.top - firstDotRect.top;
      
      connection.style.top = `${top}px`;
      connection.style.height = `${height}px`;
      connection.style.left = `${firstDotRect.left - timelineRect.left + firstDotRect.width / 2}px`;
    }
  }
  
  // 初始化
  if (timelineDots.length > 0 && timelineItems.length > 0) {
    initTimeline();
    
    // 等待DOM完全載入後再處理連接線
    window.addEventListener('load', function() {
      prepareTimelineConnections();
    });
    
    // 窗口大小變化時重新計算連接線
    window.addEventListener('resize', function() {
      prepareTimelineConnections();
    });
  }
};
