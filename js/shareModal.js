/**
 * 📦 模組：終結IPO制度暴力專案模態窗功能
 * 🕒 最後更新：2025-06-10T21:49:33+08:00
 * 🧑‍💻 作者/更新者：@DigitalSentinel
 * 🔢 版本：v1.2.0
 * 📝 摘要：整合歡迎模態窗與分享模態窗功能
 *
 * 功能特點：
 * 1. 自適應響應式設計
 * 2. 精美過渡動畫效果
 * 3. 無縫社群整合
 * 4. 一鍵複製分享功能
 */

window.shareModal = (function () {
  // 在模態窗 HTML 結構中增加自動顯示標記
  const modalHTML = `
    <!-- 分享模態窗 -->
    <div class="modal-overlay" id="shareModal">
      <div class="modal-container share-modal">
        <div class="modal-header">
          <div class="share-header-bg"></div>
          <div class="share-header-pattern"></div>
          <div class="share-icon">
            <i class="fas fa-paper-plane"></i>
          </div>
          <button class="modal-close" id="closeShareModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <h3 class="modal-title">分享與參與</h3>
          <p class="modal-desc">一起揭露IPO與ETF募集制度黑幕</p>
          
          <div class="help-tooltip" style="display: none;">
            <i class="fas fa-info-circle"></i>
            <span class="help-tooltip-text">點擊任意分享按鈕後，不會再顯示歡迎視窗</span>
          </div>
          
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
        </div>
      </div>
    </div>

    <!-- 歡迎模態窗 -->
    <div class="modal-overlay" id="welcomeModal">
      <div class="modal-container welcome-modal">
        <div class="modal-header">
          <div class="welcome-header-bg"></div>
          <div class="welcome-header-pattern"></div>
          <div class="welcome-icon">
            <i class="fas fa-megaphone"></i>
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
            
            <div class="dont-show-again">
              <input type="checkbox" id="dontShowWelcomeAgain">
              <label for="dontShowWelcomeAgain">下次進入網站不再顯示</label>
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
    lineCommunity:
      'https://line.me/ti/g2/eG-fTuz5i-g7ZAqoRCzDkvIv1kN-3PWVGY4E3g',
    threads: 'https://www.threads.com/@anti_ipo?igshid=NTc4MTIwNjQ2YQ%3D%3D',
    share: window.location.origin + window.location.pathname,
  };

  // 初始化函數
  function init() {
    console.log('ShareModal: 初始化模態窗...');
    createModals();
    injectCSS();
    cacheElements();
    bindEvents();
    createFloatingShareButton();

    // 發送初始化完成事件通知
    console.log('ShareModal: 初始化完成');
    document.dispatchEvent(new CustomEvent('modalsReady'));

    return {
      showShareModal,
      hideShareModal,
      showWelcomeModal,
      hideWelcomeModal,
      checkFirstVisit,
      checkAndShowWelcomeModal,
      markUserInteraction,
    };
  }

  // 創建模態窗 DOM
  function createModals() {
    // 檢查並載入FontAwesome
    ensureFontAwesomeLoaded();

    // 創建包含模態窗的容器
    const modalsContainer = document.createElement('div');
    modalsContainer.id = 'modalsContainer';
    modalsContainer.innerHTML = modalHTML;

    // 附加到 body
    document.body.appendChild(modalsContainer);
    console.log('ShareModal: 模態窗DOM已創建');
  }

  // 確保 FontAwesome 已被載入
  function ensureFontAwesomeLoaded() {
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const fontAwesomeLink = document.createElement('link');
      fontAwesomeLink.rel = 'stylesheet';
      fontAwesomeLink.href =
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      fontAwesomeLink.integrity =
        'sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ==';
      fontAwesomeLink.crossOrigin = 'anonymous';
      document.head.appendChild(fontAwesomeLink);
      console.log('ShareModal: FontAwesome 已載入');
    }

    // 添加內嵌font-awesome備用樣式，防止圖標顯示問題
    const faBackupStyle = document.createElement('style');
    faBackupStyle.textContent = `
      @font-face {
        font-family: 'Font Awesome 5 Free';
        font-style: normal;
        font-weight: 900;
        font-display: auto;
        src: url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/webfonts/fa-solid-900.woff2") format("woff2");
      }
      
      @font-face {
        font-family: 'Font Awesome 5 Brands';
        font-style: normal;
        font-weight: 400;
        font-display: auto;
        src: url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/webfonts/fa-brands-400.woff2") format("woff2");
      }
      
      .fas {
        font-family: 'Font Awesome 5 Free';
        font-weight: 900;
      }
      
      .fab {
        font-family: 'Font Awesome 5 Brands';
        font-weight: 400;
      }
      
      /* 常用圖標備用樣式 */
      .fa-megaphone:before {
        content: "\\f674";
      }
      
      .fa-paper-plane:before {
        content: "\\f1d8";
      }
      
      .fa-times:before {
        content: "\\f00d";
      }
      
      .fa-info-circle:before {
        content: "\\f05a";
      }
      
      .fa-comment-dots:before {
        content: "\\f4ad";
      }
      
      .fa-line:before {
        content: "\\f3c0";
      }
      
      .fa-at:before {
        content: "\\f1fa";
      }
      
      .fa-link:before {
        content: "\\f0c1";
      }
      
      .fa-copy:before {
        content: "\\f0c5";
      }
      
      .fa-check-circle:before {
        content: "\\f058";
      }
      
      .fa-arrow-right:before {
        content: "\\f061";
      }
    `;
    document.head.appendChild(faBackupStyle);
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
        max-width: 450px;
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
        height: 100px;
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
        background: linear-gradient(135deg, #e23e57, #ff6b6b);
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
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
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
        background: linear-gradient(135deg, #e23e57, #ff6b6b);
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
        gap: 12px;
        margin-bottom: 25px;
      }

      .share-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 15px 12px;
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
        font-size: 1.8rem;
        margin-bottom: 8px;
        background: linear-gradient(135deg, #e23e57, #ff6b6b);
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
        margin-bottom: 0;
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
        color: #e23e57;
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
        background-color: rgba(226, 62, 87, 0.1);
      }

      .copied-message {
        position: absolute;
        bottom: -30px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #e23e57;
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
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 70px;
        height: 70px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        z-index: 5;
        border: 2px solid rgba(255, 255, 255, 0.3);
      }

      .welcome-icon i {
        font-size: 28px;
        color: #e23e57;
        background: linear-gradient(135deg, #e23e57, #ff6b6b);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        display: inline-block;
        width: auto;
        height: auto;
        line-height: 1;
      }
      
      .option-icon {
        color: #e23e57;
        margin-right: 10px;
        margin-top: 3px;
      }
      
      .option-text {
        color: #525252;
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
      }
      
      /* 修改勾選框樣式為粉紅色可愛勾勾 */
      .dont-show-again {
        display: flex;
        align-items: center;
        margin: 20px 0;
      }
      
      .dont-show-again input[type="checkbox"] {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border: 2px solid #e23e57;
        border-radius: 5px;
        margin-right: 10px;
        position: relative;
        cursor: pointer;
        transition: all 0.2s ease;
        background-color: white;
      }
      
      .dont-show-again input[type="checkbox"]:checked {
        background-color: #e23e57;
      }
      
      .dont-show-again input[type="checkbox"]:checked::after {
        content: '\\2764';  /* 心形符號 */
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: white;
      }
      
      .dont-show-again label {
        cursor: pointer;
        color: #525252;
        font-size: 0.9rem;
        transition: color 0.2s ease;
      }
      
      .dont-show-again label:hover {
        color: #e23e57;
      }

      .action-button {
        background: linear-gradient(135deg, #e23e57, #ff6b6b);
        color: white;
        padding: 14px 30px;
        border-radius: 12px;
        font-weight: 600;
        margin-top: 15px;
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
          grid-template-columns: repeat(2, 1fr);
        }

        .modal-container {
          width: 90%;
          max-width: 360px;
        }
        
        .modal-header {
          height: 90px;
        }
        
        .share-icon, .welcome-icon {
          width: 60px;
          height: 60px;
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
        
        .share-button {
          padding: 12px 8px;
        }
        
        .share-button i {
          font-size: 1.5rem;
          margin-bottom: 6px;
        }
        
        .share-button span {
          font-size: 0.9rem;
        }
        
        .share-button-desc {
          font-size: 0.7rem;
        }
      }
      
      @media (max-width: 380px) {
        .share-options {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(styleElement);

    console.log('ShareModal: CSS 樣式已注入');
  }

  // 獲取並緩存元素引用
  function cacheElements() {
    // 分享模態窗元素
    shareModal = document.getElementById('shareModal');
    shareElements = {
      closeBtn: document.getElementById('closeShareModal'),
      shareFormBtn: document.getElementById('shareForm'),
      joinCommunityBtn: document.getElementById('joinCommunity'),
      followThreadsBtn: document.getElementById('followThreads'),
      copyLinkBtn: document.getElementById('copyLink'),
      copyBtnInline: document.getElementById('copyLinkBtn'),
      shareLinkInput: document.getElementById('shareLinkInput'),
      copiedMsg: document.getElementById('copiedMsg'),
    };

    // 歡迎模態窗元素
    welcomeModal = document.getElementById('welcomeModal');
    welcomeElements = {
      closeBtn: document.getElementById('closeWelcomeModal'),
      actionBtn: document.getElementById('welcomeAction'),
      dontShowAgainCheckbox: document.getElementById('dontShowWelcomeAgain'),
    };

    // 設置分享連結
    if (shareElements.shareLinkInput) {
      shareElements.shareLinkInput.value = links.share;
    }

    console.log('ShareModal: 元素引用已緩存');
  }

  // 綁定事件處理函數
  function bindEvents() {
    // 分享模態窗事件
    if (shareElements.closeBtn) {
      shareElements.closeBtn.addEventListener('click', hideShareModal);
    }

    if (shareElements.shareFormBtn) {
      shareElements.shareFormBtn.addEventListener('click', () => {
        markUserInteraction();
        window.open(links.shareForm, '_blank');
      });
    }

    if (shareElements.joinCommunityBtn) {
      shareElements.joinCommunityBtn.addEventListener('click', () => {
        markUserInteraction();
        window.open(links.lineCommunity, '_blank');
      });
    }

    if (shareElements.followThreadsBtn) {
      shareElements.followThreadsBtn.addEventListener('click', () => {
        markUserInteraction();
        window.open(links.threads, '_blank');
      });
    }

    if (shareElements.copyLinkBtn) {
      shareElements.copyLinkBtn.addEventListener('click', function () {
        markUserInteraction();
        copyToClipboard();
      });
    }

    if (shareElements.copyBtnInline) {
      shareElements.copyBtnInline.addEventListener('click', function () {
        markUserInteraction();
        copyToClipboard();
      });
    }

    // 歡迎模態窗事件
    if (welcomeElements.closeBtn) {
      welcomeElements.closeBtn.addEventListener('click', () => {
        handleWelcomeModalClose();
      });
    }

    if (welcomeElements.actionBtn) {
      welcomeElements.actionBtn.addEventListener('click', () => {
        console.log('ShareModal: 參與行動按鈕被點擊');
        handleWelcomeModalClose();

        // 添加延遲以確保歡迎模態窗已完全關閉
        setTimeout(() => {
          console.log('ShareModal: 準備顯示分享模態窗');
          // 直接使用window.shareModalControls來調用showShareModal
          if (
            window.shareModalControls &&
            typeof window.shareModalControls.showShareModal === 'function'
          ) {
            window.shareModalControls.showShareModal();
            console.log('ShareModal: 分享模態窗已顯示');
          } else {
            console.error('ShareModal: showShareModal函數未定義');
          }
        }, 500);
      });
    }

    if (welcomeElements.dontShowAgainCheckbox) {
      welcomeElements.dontShowAgainCheckbox.addEventListener(
        'change',
        function () {
          if (this.checked) {
            localStorage.setItem('endipo_dont_show_welcome', 'true');
          } else {
            localStorage.removeItem('endipo_dont_show_welcome');
          }
        }
      );
    }

    // 點擊模態窗外部關閉
    if (shareModal) {
      shareModal.addEventListener('click', e => {
        if (e.target === shareModal) {
          hideShareModal();
          markUserInteraction();
        }
      });
    }

    if (welcomeModal) {
      welcomeModal.addEventListener('click', e => {
        if (e.target === welcomeModal) {
          handleWelcomeModalClose();
        }
      });
    }

    // 按 ESC 關閉模態窗
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (shareModal.classList.contains('active')) {
          hideShareModal();
          markUserInteraction();
        } else if (welcomeModal.classList.contains('active')) {
          handleWelcomeModalClose();
        }
      }
    });

    // 添加額外的共享按鈕事件處理
    const shareBtn = document.getElementById('share-btn');
    const mobileShareBtn = document.getElementById('mobile-share-btn');

    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        showShareModal();
        markUserInteraction();
      });
      console.log('ShareModal: 主導航分享按鈕已綁定');
    }

    if (mobileShareBtn) {
      mobileShareBtn.addEventListener('click', () => {
        showShareModal();
        markUserInteraction();
      });
      console.log('ShareModal: 行動版導航分享按鈕已綁定');
    }

    console.log('ShareModal: 事件處理函數已綁定');
  }

  // 處理歡迎模態窗關閉
  function handleWelcomeModalClose() {
    hideWelcomeModal();

    // 檢查是否選中"不再顯示"
    if (
      welcomeElements.dontShowAgainCheckbox &&
      welcomeElements.dontShowAgainCheckbox.checked
    ) {
      localStorage.setItem('endipo_dont_show_welcome', 'true');
    }

    // 只有在兩個模態窗都關閉時，才恢復計數器動畫
    if (
      !shareModal.classList.contains('active') &&
      !welcomeModal.classList.contains('active')
    ) {
      resumeCounterAnimations();
    }
  }

  // 標記用戶已與分享功能互動
  function markUserInteraction() {
    localStorage.setItem('endipo_user_interacted', 'true');
    // 設定用戶交互標記後，確保幫助提示不顯示
    updateHelpTooltipVisibility(false);
    // 將用戶標記為"不再自動顯示"
    localStorage.setItem('endipo_disable_auto_welcome', 'true');
  }

  // 更新幫助提示的顯示狀態
  function updateHelpTooltipVisibility(isAutoShow) {
    const helpTooltip = document.querySelector('.help-tooltip');
    if (helpTooltip) {
      // 只在自動顯示時才顯示幫助提示
      helpTooltip.style.display = isAutoShow ? 'flex' : 'none';
    }
  }

  // 顯示分享模態窗
  function showShareModal() {
    if (shareModal) {
      shareModal.classList.add('active');
      document.body.style.overflow = 'hidden'; // 防止背景滾動
      console.log('ShareModal: 分享模態窗顯示');
    }
  }

  // 隱藏分享模態窗
  function hideShareModal() {
    if (shareModal) {
      shareModal.classList.remove('active');
      document.body.style.overflow = ''; // 恢復背景滾動
      console.log('ShareModal: 分享模態窗隱藏');

      // 只有在兩個模態窗都關閉時，才恢復計數器動畫
      if (!welcomeModal.classList.contains('active')) {
        resumeCounterAnimations();
      }
    }
  }

  // 顯示歡迎模態窗
  function showWelcomeModal(isAutoShow = false) {
    if (welcomeModal) {
      welcomeModal.classList.add('active');
      document.body.style.overflow = 'hidden'; // 防止背景滾動

      // 更新幫助提示的顯示狀態
      updateHelpTooltipVisibility(isAutoShow);

      console.log('ShareModal: 歡迎模態窗顯示');
    }
  }

  // 隱藏歡迎模態窗
  function hideWelcomeModal() {
    if (welcomeModal) {
      welcomeModal.classList.remove('active');
      document.body.style.overflow = ''; // 恢復背景滾動
      console.log('ShareModal: 歡迎模態窗隱藏');

      // 更新最後顯示時間
      localStorage.setItem(
        'endipo_welcome_last_shown',
        new Date().getTime().toString()
      );
    }
  }

  // 複製連結到剪貼簿
  function copyToClipboard() {
    if (shareElements.shareLinkInput && shareElements.copiedMsg) {
      shareElements.shareLinkInput.select();
      shareElements.shareLinkInput.setSelectionRange(0, 99999); // 對行動裝置友好

      try {
        navigator.clipboard
          .writeText(shareElements.shareLinkInput.value)
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
      return true;
    }

    return false;
  }

  // 檢查定時模態窗顯示
  function checkTimedModalDisplay() {
    // 檢查是否選擇了"不再顯示"
    const dontShowAgain = localStorage.getItem('endipo_dont_show_welcome');
    if (dontShowAgain === 'true') {
      return;
    }

    // 檢查用戶是否已經與分享按鈕互動，如果互動過則不再自動顯示
    const userInteracted = localStorage.getItem('endipo_user_interacted');
    if (userInteracted === 'true') {
      return;
    }

    // 檢查是否禁用自動顯示（點擊分享後設置）
    const disableAutoShow = localStorage.getItem('endipo_disable_auto_welcome');
    if (disableAutoShow === 'true') {
      return;
    }

    const lastShownTime = localStorage.getItem('endipo_welcome_last_shown');
    const currentTime = new Date().getTime();

    // 如果是首次訪問或者超過5分鐘未顯示
    if (
      !lastShownTime ||
      currentTime - parseInt(lastShownTime) > 5 * 60 * 1000
    ) {
      showWelcomeModal(true); // 標記為自動顯示
      localStorage.setItem('endipo_welcome_last_shown', currentTime.toString());
      console.log('ShareModal: 定時顯示歡迎模態窗');
    }
  }

  // 檢查是否應該顯示歡迎模態窗（包括定時顯示功能）
  function checkAndShowWelcomeModal() {
    // 先暫停計數器動畫
    pauseCounterAnimations();

    console.log('ShareModal: 檢查是否顯示歡迎模態窗');

    // 檢查是否選擇了"不再顯示"
    const dontShowAgain = localStorage.getItem('endipo_dont_show_welcome');
    if (dontShowAgain === 'true') {
      console.log('ShareModal: 用戶選擇不再顯示，跳過顯示歡迎模態窗');
      resumeCounterAnimations();
      return;
    }

    // 立即顯示歡迎模態窗
    showWelcomeModal(false);
    localStorage.setItem(
      'endipo_welcome_last_shown',
      new Date().getTime().toString()
    );
    console.log('ShareModal: 顯示歡迎模態窗');

    // 設置定時器，每分鐘檢查一次
    setInterval(() => {
      checkTimedModalDisplay();
    }, 60 * 1000);
  }

  // 暫停計數器動畫
  function pauseCounterAnimations() {
    if (
      window.animationsModule &&
      typeof window.animationsModule.pauseCounters === 'function'
    ) {
      window.animationsModule.pauseCounters();
    } else {
      console.log('ShareModal: 計數器動畫暫停功能不可用');
      // 設置一個全局標記，讓動畫模組知道需要暫停計數器
      window.shouldPauseCounters = true;
    }
  }

  // 恢復計數器動畫
  function resumeCounterAnimations() {
    if (
      window.animationsModule &&
      typeof window.animationsModule.resumeCounters === 'function'
    ) {
      window.animationsModule.resumeCounters();
    } else {
      console.log('ShareModal: 計數器動畫恢復功能不可用');
      // 移除全局標記，讓動畫模組知道可以開始計數器
      window.shouldPauseCounters = false;
    }
  }

  // 返回公開 API
  return {
    init: init,
  };
})();

// 將markUserInteraction暴露為全局函數
window.markUserInteraction = function () {
  if (
    window.shareModalControls &&
    typeof window.shareModalControls.markUserInteraction === 'function'
  ) {
    window.shareModalControls.markUserInteraction();
  } else {
    // 備用方案，直接設置localStorage
    localStorage.setItem('endipo_user_interacted', 'true');
    localStorage.setItem('endipo_disable_auto_welcome', 'true');

    // 嘗試更新幫助提示的顯示狀態
    const helpTooltip = document.querySelector('.help-tooltip');
    if (helpTooltip) {
      helpTooltip.style.display = 'none';
    }
  }
};

// 創建懸浮式分享按鈕
function createFloatingShareButton() {
  const floatingShareBtn = document.createElement('div');
  floatingShareBtn.id = 'floating-share-btn';
  floatingShareBtn.className = 'floating-share-btn';
  floatingShareBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';

  // 為懸浮按鈕添加樣式
  const style = document.createElement('style');
  style.textContent = `
    .floating-share-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #e23e57, #ff6b6b);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      z-index: 800;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .floating-share-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25);
    }
    
    .floating-share-btn.pulse {
      animation: shareBtnPulse 2s infinite;
    }
    
    .floating-share-btn.bouncing {
      animation: shareBtnBounce 15s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
    
    @keyframes shareBtnPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.15); }
      100% { transform: scale(1); }
    }
    
    @keyframes shareBtnBounce {
      0%, 100% { transform: translate(0, 0); }
      10% { transform: translate(15px, -10px); }
      20% { transform: translate(-10px, 15px); }
      30% { transform: translate(5px, 20px); }
      40% { transform: translate(-15px, -5px); }
      50% { transform: translate(20px, 10px); }
      60% { transform: translate(-20px, 5px); }
      70% { transform: translate(10px, -20px); }
      80% { transform: translate(-5px, 15px); }
      90% { transform: translate(10px, -10px); }
    }
    
    .help-tooltip {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      text-align: center;
      padding: 8px 16px;
      background-color: rgba(226, 62, 87, 0.1);
      border-radius: 8px;
      cursor: pointer;
      color: #e23e57;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }
    
    .help-tooltip i {
      margin-right: 8px;
      font-size: 16px;
    }
    
    .help-tooltip-text {
      display: inline;
      font-size: 0.875rem;
      color: #525252;
    }
  `;
  document.head.appendChild(style);

  // 添加點擊事件
  floatingShareBtn.addEventListener('click', () => {
    window.shareModalControls.showShareModal();
    window.markUserInteraction();

    // 移除彈跳動畫
    floatingShareBtn.classList.remove('bouncing');
  });

  // 添加到頁面
  document.body.appendChild(floatingShareBtn);

  // 初始脈動動畫
  setTimeout(() => {
    floatingShareBtn.classList.add('pulse');

    // 設置閒置監測
    setupIdleMonitoring(floatingShareBtn);
  }, 3000);
}

// 設置閒置監測，長時間不活動時啟動彈跳動畫
function setupIdleMonitoring(button) {
  let idleTimer;
  let idleTime = 0;
  const idleInterval = 60000; // 1分鐘檢查一次
  const maxIdleTime = 10 * 60000; // 10分鐘後開始彈跳

  // 重置閒置計時器
  function resetIdleTime() {
    idleTime = 0;
    button.classList.remove('bouncing');
    button.classList.add('pulse');
  }

  // 更新閒置時間
  function updateIdleTime() {
    idleTime += idleInterval;

    if (idleTime >= maxIdleTime) {
      // 超過閒置時間，開始彈跳動畫
      button.classList.remove('pulse');
      button.classList.add('bouncing');
    }
  }

  // 設置閒置計時器
  idleTimer = setInterval(updateIdleTime, idleInterval);

  // 監聽用戶活動
  ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'].forEach(
    event => {
      document.addEventListener(event, resetIdleTime);
    }
  );
}

document.addEventListener('DOMContentLoaded', function () {
  console.log('ShareModal: DOM內容已載入');
  try {
    window.shareModalControls = window.shareModal.init();
    console.log('ShareModal: 控制器已初始化');

    // 確保全局API正確
    if (!window.showShareModal && window.shareModalControls.showShareModal) {
      window.showShareModal = window.shareModalControls.showShareModal;
    }

    if (!window.hideShareModal && window.shareModalControls.hideShareModal) {
      window.hideShareModal = window.shareModalControls.hideShareModal;
    }

    // 等待短暫時間後再顯示歡迎模態窗，確保DOM完全渲染
    setTimeout(() => {
      // 初始化歡迎模態窗與定時顯示功能
      if (
        window.shareModalControls &&
        typeof window.shareModalControls.checkAndShowWelcomeModal === 'function'
      ) {
        window.shareModalControls.checkAndShowWelcomeModal();
        console.log('ShareModal: 檢查並顯示歡迎模態窗');
      } else {
        console.error('ShareModal: 無法調用checkAndShowWelcomeModal函數');
      }
    }, 1000);
  } catch (e) {
    console.error('ShareModal: 初始化時發生錯誤', e);
  }

  console.log('ShareModal: 初始化完成');
});

// 為了確保在某些瀏覽器下DOMContentLoaded事件可能已觸發的情況，添加額外檢查
if (document.readyState === 'loading') {
  console.log('ShareModal: 文檔仍在加載中，監聽DOMContentLoaded事件');
} else {
  console.log('ShareModal: 文檔已完成加載，立即初始化');
  // 文檔已完成加載，立即初始化
  if (!window.shareModalControls) {
    window.shareModalControls = window.shareModal.init();

    // 初始化歡迎模態窗與定時顯示功能
    setTimeout(() => {
      if (
        window.shareModalControls &&
        typeof window.shareModalControls.checkAndShowWelcomeModal === 'function'
      ) {
        window.shareModalControls.checkAndShowWelcomeModal();
        console.log('ShareModal: 已初始化並顯示歡迎模態窗');
      }
    }, 1000);
  }
}
