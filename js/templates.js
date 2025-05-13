/**
 * templates.js - 檢舉範本處理模組
 *
 * 提供範本相關的進階功能，包括：
 * - 特殊字段格式化
 * - 範本變數處理
 * - 範本預設值配置
 * - 範本檢查與驗證
 */

// 範本模組函數
window.templateModule = function() {
  // 範本相關元素
  const templateContent = document.getElementById('template-content');
  const editorPlaceholder = document.getElementById('editor-placeholder');
  const downloadTemplate = document.getElementById('download-template');
  const copyButtons = document.querySelectorAll('.copy-btn');
  
  // 初始化範本功能
  function initTemplates() {
    // 初始化複製按鈕
    if (copyButtons.length > 0) {
      copyButtons.forEach(button => {
        button.addEventListener('click', function() {
          const templateId = this.getAttribute('data-template');
          loadTemplate(templateId);
        });
      });
    }
    
    // 下載Word檔案
    if (downloadTemplate) {
      downloadTemplate.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (templateContent && !templateContent.classList.contains('hidden')) {
          // 獲取當前範本內容
          const content = templateContent.innerText;
          
          // 轉換為blob並下載
          const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.href = url;
          a.download = '檢舉信範本.docx';
          document.body.appendChild(a);
          a.click();
          
          // 清理
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          // 顯示提示
          showToast('檢舉範本已下載');
        }
      });
    }
  }
  
  // 載入特定範本
  function loadTemplate(templateId) {
    const templateElement = document.getElementById(templateId);
    
    if (templateElement && templateContent) {
      // 顯示範本內容，隱藏佔位符
      if (editorPlaceholder) {
        editorPlaceholder.classList.add('hidden');
      }
      
      templateContent.classList.remove('hidden');
      templateContent.innerText = templateElement.innerHTML;
      
      // 為複製到剪貼簿做準備
      if (!navigator.clipboard) {
        // 舊方法
        const textArea = document.createElement('textarea');
        textArea.value = templateElement.innerHTML;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          showToast(successful ? '範本已複製到剪貼簿' : '複製失敗，請手動複製');
        } catch (err) {
          console.error('複製失敗:', err);
          showToast('複製失敗，請手動複製');
        }
        
        document.body.removeChild(textArea);
      } else {
        // 現代方法
        navigator.clipboard.writeText(templateElement.innerHTML)
          .then(() => {
            showToast('範本已複製到剪貼簿');
          })
          .catch(err => {
            console.error('複製失敗:', err);
            showToast('複製失敗，請手動複製');
          });
      }
    }
  }
  
  // 顯示提示訊息
  function showToast(message) {
    // 檢查是否已有全局顯示函數
    if (typeof window.showToast === 'function') {
      window.showToast(message);
      return;
    }
    
    // 沒有全局函數時，建立一個臨時提示
    let toast = document.getElementById('copy-toast');
    
    // 若不存在則創建
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'copy-toast';
      toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-secondary text-white py-2 px-4 rounded-lg shadow-lg opacity-0 transition-opacity duration-300';
      toast.style.zIndex = '9999';
      document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.classList.remove('opacity-0');
    toast.classList.add('opacity-100');
    
    setTimeout(() => {
      toast.classList.remove('opacity-100');
      toast.classList.add('opacity-0');
    }, 3000);
  }
  
  // 初始化模組
  initTemplates();
};
