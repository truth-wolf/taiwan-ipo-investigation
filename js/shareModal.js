/**
 * shareModal.js - 分享功能模態窗
 *
 * 功能：
 * - 顯示精美動畫模態窗口
 * - 支持分享到Threads或複製連結
 * - 首次訪問網站時自動顯示
 */

// 全局變數
let hasVisitedBefore = localStorage.getItem("hasVisited") === "true";
let shareModalInitialized = false;

/**
 * 初始化分享模態窗
 */
function initShareModal() {
  if (shareModalInitialized) return;
  shareModalInitialized = true;

  console.log("ShareModal: 初始化分享模態窗");

  // 創建模態窗HTML
  createShareModalHTML();

  // 綁定事件
  bindShareModalEvents();

  // 如果是首次訪問，等待開場動畫結束後顯示
  if (!hasVisitedBefore) {
    // 監聽載入器完成事件
    document.addEventListener("loaderCompleted", function () {
      setTimeout(showShareModal, 1500); // 延遲1.5秒後顯示
      // 標記已訪問
      localStorage.setItem("hasVisited", "true");
    });
  }

  console.log("ShareModal: 初始化完成");
}

/**
 * 創建分享模態窗HTML
 */
function createShareModalHTML() {
  // 創建模態窗容器
  const modalOverlay = document.createElement("div");
  modalOverlay.className = "share-modal-overlay";
  modalOverlay.id = "shareModalOverlay";

  // 創建模態窗內容
  const modalHTML = `
        <div class="share-modal" id="shareModal">
            <div class="share-modal-header">
                <h2 class="share-modal-title">分享揭露黑幕</h2>
                <p class="share-modal-subtitle">一起終結IPO制度暴力</p>
                <button class="share-modal-close" id="closeShareModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="share-modal-body">
                <div class="share-options">
                    <div class="share-button" id="shareThreads">
                        <i class="fab fa-threads"></i>
                        <span>分享到Threads</span>
                    </div>
                    <div class="share-button" id="shareLineGroup">
                        <i class="fab fa-line"></i>
                        <span>加入LINE社群</span>
                    </div>
                    <div class="share-button" id="shareForm">
                        <i class="fas fa-comment-alt"></i>
                        <span>分享心聲</span>
                    </div>
                    <div class="share-button" id="copyShareLink">
                        <i class="fas fa-link"></i>
                        <span>複製連結</span>
                    </div>
                </div>
                
                <div class="share-link-container">
                    <input type="text" class="share-link" id="shareLink" readonly 
                        value="https://truth-wolf.github.io/taiwan-ipo-investigation/">
                    <button class="copy-button" id="copyLinkButton">
                        <i class="fas fa-copy"></i>
                    </button>
                    <div class="copied-message" id="copiedMessage">已複製到剪貼簿！</div>
                </div>
                
                <div class="share-message">
                    <p>揭露台灣證券業IPO與ETF募集背後的不合理制度，讓更多人了解現狀，一起為改變發聲！ #終結IPO制度暴力</p>
                </div>
                
                <div class="share-description">
                    加入「#終結IPO制度暴力」匿名社群，與基層夥伴一起討論、取暖、曝光！
                </div>
            </div>
        </div>
    `;

  modalOverlay.innerHTML = modalHTML;
  document.body.appendChild(modalOverlay);
}

/**
 * 綁定分享模態窗事件
 */
function bindShareModalEvents() {
  // 獲取元素
  const modalOverlay = document.getElementById("shareModalOverlay");
  const closeBtn = document.getElementById("closeShareModal");
  const shareThreadsBtn = document.getElementById("shareThreads");
  const shareLineGroupBtn = document.getElementById("shareLineGroup");
  const shareFormBtn = document.getElementById("shareForm");
  const copyLinkBtn = document.getElementById("copyShareLink");
  const copyLinkButton = document.getElementById("copyLinkButton");
  const shareLink = document.getElementById("shareLink");
  const copiedMessage = document.getElementById("copiedMessage");

  // 關閉模態窗
  closeBtn.addEventListener("click", hideShareModal);

  // 點擊背景關閉模態窗
  modalOverlay.addEventListener("click", function (event) {
    if (event.target === modalOverlay) {
      hideShareModal();
    }
  });

  // 分享到Threads
  shareThreadsBtn.addEventListener("click", function () {
    // Threads分享URL (使用網頁版URL)
    const threadsURL =
      "https://www.threads.com/@anti_ipo?igshid=NTc4MTIwNjQ2YQ%3D%3D";
    window.open(threadsURL, "_blank");
  });

  // 加入LINE社群
  shareLineGroupBtn.addEventListener("click", function () {
    const lineURL =
      "https://line.me/ti/g2/eG-fTuz5i-g7ZAqoRCzDkvIv1kN-3PWVGY4E3g";
    window.open(lineURL, "_blank");
  });

  // 分享心聲
  shareFormBtn.addEventListener("click", function () {
    const formURL = "https://forms.gle/f3ms9Kb1z772upiDA";
    window.open(formURL, "_blank");
  });

  // 複製連結（按鈕）
  copyLinkBtn.addEventListener("click", copyShareLinkToClipboard);

  // 複製連結（圖標按鈕）
  copyLinkButton.addEventListener("click", copyShareLinkToClipboard);

  // 選擇連結文字時自動全選
  shareLink.addEventListener("click", function () {
    this.select();
  });
}

/**
 * 顯示分享模態窗
 */
function showShareModal() {
  const modalOverlay = document.getElementById("shareModalOverlay");
  if (modalOverlay) {
    modalOverlay.classList.add("active");
    // 防止背景滾動
    document.body.style.overflow = "hidden";
  }
}

/**
 * 隱藏分享模態窗
 */
function hideShareModal() {
  const modalOverlay = document.getElementById("shareModalOverlay");
  if (modalOverlay) {
    modalOverlay.classList.remove("active");
    // 恢復背景滾動
    document.body.style.overflow = "";
  }
}

/**
 * 複製分享連結到剪貼簿
 */
function copyShareLinkToClipboard() {
  const shareLink = document.getElementById("shareLink");
  const copiedMessage = document.getElementById("copiedMessage");

  // 選擇並複製文字
  shareLink.select();
  document.execCommand("copy");

  // 顯示已複製提示
  copiedMessage.classList.add("visible");

  // 2秒後隱藏提示
  setTimeout(() => {
    copiedMessage.classList.remove("visible");
  }, 2000);
}

/**
 * 添加分享按鈕到導航欄
 */
function addHeaderShareButton() {
  // 等待頭部加載
  const checkHeaderInterval = setInterval(() => {
    const navEnd = document.querySelector(".nav-end");
    if (navEnd) {
      clearInterval(checkHeaderInterval);

      // 創建分享按鈕
      const shareButton = document.createElement("button");
      shareButton.className = "nav-share-button pulse-animation";
      shareButton.innerHTML = '<i class="fas fa-share-alt"></i>';
      shareButton.title = "分享網站";

      // 添加點擊事件
      shareButton.addEventListener("click", showShareModal);

      // 插入到導航欄
      navEnd.insertBefore(shareButton, navEnd.firstChild);
    }
  }, 100);
}

// 在DOM載入後初始化
document.addEventListener("DOMContentLoaded", function () {
  // 初始化分享模態窗
  initShareModal();

  // 添加分享按鈕到導航欄
  addHeaderShareButton();
});

// 導出模組
window.shareModal = {
  init: initShareModal,
  show: showShareModal,
  hide: hideShareModal,
};
