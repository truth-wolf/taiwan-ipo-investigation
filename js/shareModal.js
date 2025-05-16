/**
 * shareModal.js - 終結IPO制度暴力專案模態窗功能
 * 整合歡迎模態窗與分享模態窗功能
 * 
 * 功能特點：
 * 1. 自適應響應式設計
 * 2. 精美過渡動畫效果
 * 3. 無縫社群整合
 * 4. 一鍵複製分享功能
 */

window.shareModal = (function() {
  // 模態窗 HTML 結構
  const modalHTML = `
    <!-- 分享模態窗 -->
    <div class="modal-overlay" id="shareModal">
      <div class="modal-container share-modal">
        <div class="modal-header">
          <div class="share-header-bg"></div>
          <div class="share-header-pattern"></div>
          <div class="share-icon float-animation">
            <i class="fas fa-share-alt"></i>
          </div>
          <button class="modal-close" id="closeShareModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <h3 class="modal-title">分享與參與</h3>
          <p class="modal-desc">一起揭露IPO與ETF募集制度黑幕</p>
          
          <div class="share-options">
            <div class="share-button animate-fadeInUp" id="shareForm">
              <i class="fas fa-comment-dots"></i>
              <span>分享心聲</span>
              <p class="share-button-desc">分享您的壓力經歷</p>
            </div>
            <div class="share-button animate-fadeInUp" id="joinCommunity">
              <i class="fab fa-line"></i>
              <span>加入社群</span>
              <p class="share-button-desc">匿名LINE社群一起討論</p>
            </div>
            <div class="share-button animate-fadeInUp" id="followThreads">
              <i class="fab fa-at"></i>
              <span>追蹤 Threads</span>
              <p class="share-button-desc">讓更多人知道</p>
            </div>
            <div class="share-button animate-fadeInUp" id="copyLink">
              <i class="fas fa-link"></i>
              <span>複製連結</span>
              <p class="share-button-desc">複製分享連結</p>
            </div>
          </div>

          <div class="share-link-container">
            <input type="text" class="share-link" value="https://truth-wolf.github.io/taiwan-ipo-investigation/" readonly id="shareLinkInput">
            <button class="copy-button" id="copyLinkBtn">
              <i class="fas fa-copy"></i>
            </button>
            <div class="copied-message" id="copiedMsg">已複製到剪貼簿！</div>
          </div>

          <button type="button" class="close-button" id="closeShareBtn">
            關閉 <i class="fas fa-times ml-2"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 歡迎模態窗 -->
    <div class="modal-overlay" id="welcomeModal">
      <div class="modal-container welcome-modal">
        <div class="modal-header">
          <div class="welcome-header-bg"></div>
          <div class="welcome-header-pattern"></div>
          <div class="welcome-icon float-animation">
            <i class="fas fa-bullhorn"></i>
          </div>
          <button class="modal-close" id="closeWelcomeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <h3 class="modal-title">揭露IPO制度黑幕</h3>
          <div class="modal-content">
            <p class="mb-4">感謝您關注「終結IPO制度暴力」行動！我們正在揭露台灣證券業的責任額制度問題，為基層營業員爭取合理的工作環境。</p>
            
            <p class="mb-4">想參與行動嗎？您可以：</p>
            
            <div class="option-item">
              <div class="option-icon"><i class="fas fa-check-circle"></i></div>
              <div class="option-text">分享您的心聲與壓力經歷</div>
            </div>
            
            <div class="option-item">
              <div class="option-icon"><i class="fas fa-check-circle"></i></div>
              <div class="option-text">加入匿名LINE社群，與更多基層夥伴一起討論</div>
            </div>
            
            <div class="option-item">
              <div class="option-icon"><i class="fas fa-check-circle"></i></div>
              <div class="option-text">追蹤、轉發我們的Threads內容，讓更多人知道</div>
            </div>
            
            <button type="button" class="action-button pulse-animation" id="welcomeAction">
              參與行動 <i class="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // 私有變數
  let shareModal;
  let welcomeModal;
  let shareElements = {};
  let welcomeElements = {};
  
  // 社群連結配置
  const links = {
    shareForm: 'https://forms.gle/zz4hmjxWBnHUQQWS9',
    lineCommunity: 'https://line.me/ti/g2/eG-fTuz5i-g7ZAqoRCzDkvIv1kN-3PWVGY4E3g',
    threads: 'https://www.threads.com/@anti_ipo?igshid=NTc4MTIwNjQ2YQ%3D%3D',
    share: window.location.origin + window.location.pathname
  };

  // 初始化函數
  function init() {
    console.log("ShareModal: 初始化模態窗...");
    createModals();
    injectCSS();
    cacheElements();
    bindEvents();
    
    // 發送初始化完成事件通知
    console.log("ShareModal: 初始化完成");
    document.dispatchEvent(new CustomEvent('modalsReady'));
    
    return {
      showShareModal,
      hideShareModal,
      showWelcomeModal,
      hideWelcomeModal,
      checkFirstVisit
    };
  }

  // 創建模態窗 DOM
  function createModals() {
    // 創建包含模態窗的容器
    const modalsContainer = document.createElement('div');
    modalsContainer.id = 'modalsContainer';
    modalsContainer.innerHTML = modalHTML;
    
    // 附加到 body
    document.body.appendChild(modalsContainer);
    console.log("ShareModal: 模態窗DOM已創建");
  }

  // 注入 CSS 樣式
  function injectCSS() {
    // 避免重複添加
    if (document.getElementById('shareModalStyles')) {
      return;
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = 'shareModalStyles';
    styleElement.textContent = `
      /* ----------------- 共用模態窗樣式 ----------------- */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.4s ease, visibility 0.4s ease;
      }

      .modal-overlay.active {
        opacity: 1;
        visibility: visible;
      }

      .modal-container {
        width: 90%;
        max-width: 500px;
        border-radius: 16px;
        overflow: hidden;
        transform: translateY(30px) scale(0.95);
        opacity: 0;
        transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1),
          opacity 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        position: relative;
      }

      .modal-overlay.active .modal-container {
        transform: translateY(0) scale(1);
        opacity: 1;
      }

      .modal-close {
        position: absolute;
        top: 15px;
        right: 15px;
        background: rgba(0, 0, 0, 0.15);
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
        transition: all 0.2s ease;
        z-index: 10;
      }

      .modal-close:hover {
        background: rgba(0, 0, 0, 0.25);
        transform: rotate(90deg);
      }
      
      .modal-title {
        font-size: 1.8rem;
        font-weight: 700;
        margin-bottom: 10px;
        text-align: center;
      }
      
      .modal-desc {
        text-align: center;
        margin-bottom: 25px;
        opacity: 0.8;
      }
      
      .modal-header {
        padding: 0;
        position: relative;
        height: 120px;
        overflow: hidden;
      }
      
      .modal-body {
        padding: 25px;
        position: relative;
      }

      /* ----------------- 分享模態窗樣式 ----------------- */
      .share-modal {
        background: white;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      }
      
      .share-header-bg {
        background: linear-gradient(135deg, #1a5d7a, #0e3341);
        height: 100%;
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
      }

      .share-header-pattern {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='rgba(255,255,255,0.1)' fill-rule='evenodd'/%3E%3C/svg%3E");
      }
      
      .share-icon {
        position: absolute;
        top: -35px;
        left: 50%;
        transform: translateX(-50%);
        width: 70px;
        height: 70px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        z-index: 2;
      }

      .share-icon i {
        font-size: 28px;
        background: linear-gradient(135deg, #1a5d7a, #0e3341);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      
      .share-modal .modal-title {
        color: #262626;
      }

      .share-modal .modal-desc {
        color: #525252;
      }

      .share-options {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        margin-bottom: 25px;
      }

      .share-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px 15px;
        border-radius: 12px;
        background-color: #f7f7f7;
        transition: all 0.3s ease;
        cursor: pointer;
        border: 1px solid #e6e6e6;
        position: relative;
        overflow: hidden;
        text-align: center;
      }

      .share-button:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
      }

      .share-button:active {
        transform: scale(0.97);
      }

      .share-button i {
        font-size: 2rem;
        margin-bottom: 10px;
        background: linear-gradient(135deg, #1a5d7a, #0e3341);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        transition: all 0.3s ease;
      }

      .share-button:hover i {
        transform: scale(1.1);
      }

      .share-button span {
        font-weight: 600;
        color: #262626;
        margin-bottom: 5px;
      }
      
      .share-button-desc {
        font-size: 0.8rem;
        color: #737373;
        margin: 0;
      }

      .share-link-container {
        margin-bottom: 25px;
        position: relative;
      }

      .share-link {
        width: 100%;
        padding: 12px 45px 12px 15px;
        border-radius: 10px;
        border: 1px solid #e6e6e6;
        background-color: #f7f7f7;
        color: #525252;
        font-size: 0.9rem;
      }

      .copy-button {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #1a5d7a;
        cursor: pointer;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 5px;
        transition: all 0.2s ease;
      }

      .copy-button:hover {
        background-color: rgba(26, 93, 122, 0.1);
      }

      .copied-message {
        position: absolute;
        bottom: -30px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #1a5d7a;
        color: white;
        padding: 5px 15px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .copied-message.visible {
        opacity: 1;
      }
      
      .close-button {
        background: transparent;
        color: #525252;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 600;
        border: 1px solid #e6e6e6;
        cursor: pointer;
        transition: all 0.3s ease;
        display: block;
        width: 100%;
        text-align: center;
      }
      
      .close-button:hover {
        background-color: #f7f7f7;
      }

      /* ----------------- 歡迎模態窗樣式 ----------------- */
      .welcome-modal {
        background: white;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }

      .welcome-header-bg {
        background: linear-gradient(135deg, #e23e57, #ff6b6b);
        height: 100%;
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
      }

      .welcome-header-pattern {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='rgba(255,255,255,0.1)' fill-rule='evenodd'/%3E%3C/svg%3E");
      }

      .welcome-icon {
        position: absolute;
        top: -35px;
        left: 50%;
        transform: translateX(-50%);
        width: 70px;
        height: 70px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        z-index: 2;
      }

      .welcome-icon i {
        font-size: 28px;
        background: linear-gradient(135deg, #e23e57, #ff6b6b);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .welcome-modal .modal-title {
        color: #262626;
      }

      .welcome-modal .modal-content {
        color: #525252;
        line-height: 1.6;
      }
      
      .option-item {
        display: flex;
        margin-bottom: 12px;
        align-items: flex-start;
      }
      
      .option-icon {
        color: #e23e57;
        margin-right: 10px;
        margin-top: 3px;
      }
      
      .option-text {
        color: #525252;
      }

      .action-button {
        background: linear-gradient(135deg, #e23e57, #ff6b6b);
        color: white;
        padding: 14px 30px;
        border-radius: 12px;
        font-weight: 600;
        margin-top: 25px;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
        display: block;
        width: 100%;
        text-align: center;
        position: relative;
        overflow: hidden;
      }

      .action-button::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .action-button:hover::after {
        opacity: 1;
      }

      .action-button:active {
        transform: scale(0.98);
      }

      /* ----------------- 動畫效果 ----------------- */
      @keyframes float {
        0%, 100% { transform: translateY(0px) translateX(-50%); }
        50% { transform: translateY(-10px) translateX(-50%); }
      }

      .float-animation {
        animation: float 3s ease-in-out infinite;
      }

      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(226, 62, 87, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(226, 62, 87, 0); }
        100% { box-shadow: 0 0 0 0 rgba(226, 62, 87, 0); }
      }

      .pulse-animation {
        animation: pulse 1.5s infinite;
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-fadeInUp {
        opacity: 0;
        animation: fadeInUp 0.5s ease forwards;
      }

      /* 各選項動畫延遲 */
      .share-options .share-button:nth-child(1) { animation-delay: 0.1s; }
      .share-options .share-button:nth-child(2) { animation-delay: 0.2s; }
      .share-options .share-button:nth-child(3) { animation-delay: 0.3s; }
      .share-options .share-button:nth-child(4) { animation-delay: 0.4s; }

      /* 響應式調整 */
      @media (max-width: 640px) {
        .share-options {
          grid-template-columns: 1fr;
        }

        .modal-container {
          width: 95%;
          max-width: 400px;
        }
        
        .modal-header {
          height: 100px;
        }
        
        .share-icon, .welcome-icon {
          width: 60px;
          height: 60px;
          top: -30px;
        }
        
        .share-icon i, .welcome-icon i {
          font-size: 24px;
        }
        
        .modal-body {
          padding: 20px 15px;
        }
        
        .modal-title {
          font-size: 1.5rem;
        }
      }
    `;
    document.head.appendChild(styleElement);
    
    console.log("ShareModal: CSS 樣式已注入");
  }

  // 獲取並緩存元素引用
  function cacheElements() {
    // 分享模態窗元素
    shareModal = document.getElementById('shareModal');
    shareElements = {
      closeBtn: document.getElementById('closeShareModal'),
      closeButtonBottom: document.getElementById('closeShareBtn'),
      shareFormBtn: document.getElementById('shareForm'),
      joinCommunityBtn: document.getElementById('joinCommunity'),
      followThreadsBtn: document.getElementById('followThreads'),
      copyLinkBtn: document.getElementById('copyLink'),
      copyBtnInline: document.getElementById('copyLinkBtn'),
      shareLinkInput: document.getElementById('shareLinkInput'),
      copiedMsg: document.getElementById('copiedMsg')
    };
    
    // 歡迎模態窗元素
    welcomeModal = document.getElementById('welcomeModal');
    welcomeElements = {
      closeBtn: document.getElementById('closeWelcomeModal'),
      actionBtn: document.getElementById('welcomeAction')
    };

    // 設置分享連結
    if (shareElements.shareLinkInput) {
      shareElements.shareLinkInput.value = links.share;
    }
    
    console.log("ShareModal: 元素引用已緩存");
  }

  // 綁定事件處理函數
  function bindEvents() {
    // 分享模態窗事件
    if (shareElements.closeBtn) {
      shareElements.closeBtn.addEventListener('click', hideShareModal);
    }
    
    if (shareElements.closeButtonBottom) {
      shareElements.closeButtonBottom.addEventListener('click', hideShareModal);
    }
    
    if (shareElements.shareFormBtn) {
      shareElements.shareFormBtn.addEventListener('click', () => window.open(links.shareForm, '_blank'));
    }
    
    if (shareElements.joinCommunityBtn) {
      shareElements.joinCommunityBtn.addEventListener('click', () => window.open(links.lineCommunity, '_blank'));
    }
    
    if (shareElements.followThreadsBtn) {
      shareElements.followThreadsBtn.addEventListener('click', () => window.open(links.threads, '_blank'));
    }
    
    if (shareElements.copyLinkBtn) {
      shareElements.copyLinkBtn.addEventListener('click', copyToClipboard);
    }
    
    if (shareElements.copyBtnInline) {
      shareElements.copyBtnInline.addEventListener('click', copyToClipboard);
    }
    
    // 歡迎模態窗事件
    if (welcomeElements.closeBtn) {
      welcomeElements.closeBtn.addEventListener('click', hideWelcomeModal);
    }
    
    if (welcomeElements.actionBtn) {
      welcomeElements.actionBtn.addEventListener('click', () => {
        hideWelcomeModal();
        setTimeout(showShareModal, 300);
      });
    }
    
    // 點擊模態窗外部關閉
    if (shareModal) {
      shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) hideShareModal();
      });
    }
    
    if (welcomeModal) {
      welcomeModal.addEventListener('click', (e) => {
        if (e.target === welcomeModal) hideWelcomeModal();
      });
    }
    
    // 按 ESC 關閉模態窗
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideShareModal();
        hideWelcomeModal();
      }
    });
    
    // 添加額外的共享按鈕事件處理
    const shareBtn = document.getElementById('share-btn');
    const mobileShareBtn = document.getElementById('mobile-share-btn');
    
    if (shareBtn) {
      shareBtn.addEventListener('click', showShareModal);
      console.log("ShareModal: 主導航分享按鈕已綁定");
    }
    
    if (mobileShareBtn) {
      mobileShareBtn.addEventListener('click', showShareModal);
      console.log("ShareModal: 行動版導航分享按鈕已綁定");
    }
    
    console.log("ShareModal: 事件處理函數已綁定");
  }

  // 顯示分享模態窗
  function showShareModal() {
    if (shareModal) {
      shareModal.classList.add('active');
      document.body.style.overflow = 'hidden'; // 防止背景滾動
      console.log("ShareModal: 分享模態窗顯示");
    }
  }

  // 隱藏分享模態窗
  function hideShareModal() {
    if (shareModal) {
      shareModal.classList.remove('active');
      document.body.style.overflow = ''; // 恢復背景滾動
      console.log("ShareModal: 分享模態窗隱藏");
    }
  }

  // 顯示歡迎模態窗
  function showWelcomeModal() {
    if (welcomeModal) {
      welcomeModal.classList.add('active');
      document.body.style.overflow = 'hidden'; // 防止背景滾動
      console.log("ShareModal: 歡迎模態窗顯示");
    }
  }

  // 隱藏歡迎模態窗
  function hideWelcomeModal() {
    if (welcomeModal) {
      welcomeModal.classList.remove('active');
      document.body.style.overflow = ''; // 恢復背景滾動
      console.log("ShareModal: 歡迎模態窗隱藏");
    }
  }

  // 複製連結到剪貼簿
  function copyToClipboard() {
    if (shareElements.shareLinkInput && shareElements.copiedMsg) {
      shareElements.shareLinkInput.select();
      shareElements.shareLinkInput.setSelectionRange(0, 99999); // 對行動裝置友好
      
      try {
        navigator.clipboard.writeText(shareElements.shareLinkInput.value)
          .then(() => showCopiedMessage())
          .catch(err => {
            console.error('無法複製: ', err);
            // 備用方案
            document.execCommand('copy');
            showCopiedMessage();
          });
      } catch (err) {
        // 舊版瀏覽器備用方案
        document.execCommand('copy');
        showCopiedMessage();
      }
    }
  }

  // 顯示複製成功訊息
  function showCopiedMessage() {
    if (shareElements.copiedMsg) {
      shareElements.copiedMsg.classList.add('visible');
      setTimeout(() => {
        shareElements.copiedMsg.classList.remove('visible');
      }, 2000);
    }
  }

  // 檢查是否首次訪問並顯示歡迎模態窗
  function checkFirstVisit() {
    const visited = localStorage.getItem('endipo_visited');
    
    if (!visited) {
      localStorage.setItem('endipo_visited', 'true');
      
      // 稍微延遲顯示歡迎模態窗，讓頁面先載入完成
      setTimeout(showWelcomeModal, 1500);
      console.log("ShareModal: 首次訪問檢測 - 顯示歡迎模態窗");
      return true;
    }
    
    return false;
  }

  // 返回公開 API
  return {
    init: init
  };
})();

// 在 DOMContentLoaded 事件中初始化（可在專案中自行決定初始化時機）
document.addEventListener('DOMContentLoaded', function() {
  window.shareModalControls = window.shareModal.init();
  
  // 默認檢查是否為首次訪問並顯示歡迎模態窗
  setTimeout(() => {
    window.shareModalControls.checkFirstVisit();
  }, 1000);
  
  // 新增按鈕調用
  const testShareBtn = document.createElement('button');
  testShareBtn.textContent = "顯示分享模態窗";
  testShareBtn.style.cssText = "position: fixed; bottom: 10px; right: 10px; z-index: 999; padding: 10px; background: #1a5d7a; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;";
  testShareBtn.onclick = () => window.shareModalControls.showShareModal();
  document.body.appendChild(testShareBtn);
  
  console.log("ShareModal: 初始化完成，調試按鈕已添加");
});
