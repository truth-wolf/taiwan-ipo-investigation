/**
 * app.js - 主要JavaScript入口點
 *
 * 這個文件是網站的核心啟動點:
 * - 初始化各模組
 * - 統一管理功能加載順序
 * - 提供全局工具函數
 */

document.addEventListener("DOMContentLoaded", function () {
  // 移除測試背景類
  document.documentElement.classList.remove("js-test-error-bg");

  console.log("App: 初始化核心功能...");

  // 初始化核心UI功能
  initHeaderAndNav();
  initScrollEvents();
  initSmoothScroll();
  initMobileMenu();
  initBackToTop();
  initSecretFeature();
  initShareFeature();

  // 初始化數據模組
  initDataLoader();

  // 載入其他模組
  loadTemplates();
  loadAnimations();

  console.log("App: 核心功能初始化完成");

  /**
   * 初始化頁面頭部和導航
   */
  function initHeaderAndNav() {
    loadPartialContent("header-container", "partials/header.html");
    loadPartialContent("footer-container", "partials/footer.html");
  }

  /**
   * 初始化滾動事件
   */
  function initScrollEvents() {
    const progressLine = document.querySelector(".progress-line");
    if (!progressLine) return;

    window.addEventListener("scroll", function () {
      updateProgressBar(progressLine);
      updateFixedHeader();
      updateFadeElements();
    });
  }

  /**
   * 更新進度條
   */
  function updateProgressBar(progressLine) {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrollTop = window.scrollY;
    const width = (scrollTop / documentHeight) * 100 + "%";
    progressLine.style.width = width;
  }

  /**
   * 更新固定頭部
   */
  function updateFixedHeader() {
    const header = document.querySelector("header");
    if (!header) return;

    const scrollPosition = window.scrollY;

    if (scrollPosition > 100) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // 處理向上滾動時顯示導航
    if (scrollPosition < this.lastScrollPosition || scrollPosition < 50) {
      header.classList.add("visible");
    } else {
      header.classList.remove("visible");
    }

    this.lastScrollPosition = scrollPosition;
  }

  /**
   * 更新淡入元素
   */
  function updateFadeElements() {
    document.querySelectorAll(".fade-in:not(.visible)").forEach((el) => {
      const elementTop = el.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        el.classList.add("visible");
      }
    });
  }

  /**
   * 初始化平滑滾動
   * 修復錨點跳轉問題
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (targetId === "#") return;

        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          e.preventDefault();
          const yOffset = -80; // 頂部導航偏移量
          const y =
            targetElement.getBoundingClientRect().top +
            window.pageYOffset +
            yOffset;

          window.scrollTo({
            top: y,
            behavior: "smooth",
          });

          // 如果行動選單打開，則關閉它
          const mobileMenu = document.querySelector(".mobile-menu");
          if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
            mobileMenu.classList.add("hidden");
            document.body.style.overflow = "";
          }
        }
      });
    });
  }

  /**
   * 初始化行動選單
   */
  function initMobileMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const mobileMenu = document.querySelector(".mobile-menu");
    const menuClose = document.querySelector(".menu-close");

    if (!menuToggle || !mobileMenu || !menuClose) return;

    menuToggle.addEventListener("click", function () {
      mobileMenu.classList.remove("hidden");
      mobileMenu.classList.add("flex");
      document.body.style.overflow = "hidden";
    });

    menuClose.addEventListener("click", function () {
      mobileMenu.classList.add("hidden");
      mobileMenu.classList.remove("flex");
      document.body.style.overflow = "";
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", function () {
        mobileMenu.classList.add("hidden");
        mobileMenu.classList.remove("flex");
        document.body.style.overflow = "";
      });
    });
  }

  /**
   * 初始化回到頂部按鈕
   */
  function initBackToTop() {
    const backToTop = document.getElementById("back-to-top");
    if (!backToTop) return;

    window.addEventListener("scroll", function () {
      if (window.scrollY > 500) {
        backToTop.classList.remove("opacity-0", "invisible", "translate-y-10");
        backToTop.classList.add("opacity-100", "visible", "translate-y-0");
      } else {
        backToTop.classList.add("opacity-0", "invisible", "translate-y-10");
        backToTop.classList.remove("opacity-100", "visible", "translate-y-0");
      }
    });

    backToTop.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  /**
   * 初始化彩蛋功能
   */
  function initSecretFeature() {
    const secretTrigger = document.getElementById("secret-trigger");
    const secretContent = document.getElementById("secret-content");
    const secretClose = document.getElementById("secret-close");
    const secretUnderstand = document.getElementById("secret-understand");

    if (!secretTrigger || !secretContent || !secretClose || !secretUnderstand)
      return;

    let secretClickCount = 0;

    secretTrigger.addEventListener("click", function () {
      secretClickCount++;

      if (secretClickCount >= 3) {
        secretContent.classList.remove("hidden");
        secretContent.classList.add("flex");
        secretClickCount = 0;
        document.body.style.overflow = "hidden";
      }
    });

    secretClose.addEventListener("click", function () {
      secretContent.classList.add("hidden");
      secretContent.classList.remove("flex");
      document.body.style.overflow = "";
    });

    secretUnderstand.addEventListener("click", function () {
      secretContent.classList.add("hidden");
      secretContent.classList.remove("flex");
      document.body.style.overflow = "";
    });

    document.addEventListener("keydown", function (e) {
      if (e.ctrlKey && e.shiftKey && e.key === "X") {
        secretContent.classList.remove("hidden");
        secretContent.classList.add("flex");
        document.body.style.overflow = "hidden";
      }
    });
  }

  /**
   * 初始化分享功能
   */
  function initShareFeature() {
    const shareBtn = document.getElementById("share-btn");
    const mobileShareBtn = document.getElementById("mobile-share-btn");
    const shareModal = document.getElementById("share-modal");
    const shareClose = document.getElementById("share-close");
    const copyLink = document.getElementById("copy-link");

    if (!shareBtn || !shareModal || !shareClose) return;

    shareBtn.addEventListener("click", function () {
      shareModal.classList.remove("hidden");
      shareModal.classList.add("flex");
      document.body.style.overflow = "hidden";
    });

    if (mobileShareBtn) {
      mobileShareBtn.addEventListener("click", function () {
        shareModal.classList.remove("hidden");
        shareModal.classList.add("flex");

        const mobileMenu = document.querySelector(".mobile-menu");
        if (mobileMenu) {
          mobileMenu.classList.add("hidden");
          mobileMenu.classList.remove("flex");
        }
      });
    }

    shareClose.addEventListener("click", function () {
      shareModal.classList.add("hidden");
      shareModal.classList.remove("flex");
      document.body.style.overflow = "";
    });

    shareModal.addEventListener("click", function (e) {
      if (e.target === shareModal) {
        shareModal.classList.add("hidden");
        shareModal.classList.remove("flex");
        document.body.style.overflow = "";
      }
    });

    if (copyLink) {
      copyLink.addEventListener("click", function () {
        const linkInput = copyLink.parentElement.querySelector("input");
        linkInput.select();
        document.execCommand("copy");
        showToast("連結已複製！");
      });
    }

    document.querySelectorAll(".share-link").forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();

        const platform =
          this.querySelector("span")?.textContent.trim().toLowerCase() || "";
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(
          "台灣證券業IPO與ETF募集制度黑幕揭密 - #終結IPO制度暴力"
        );
        let shareUrl = "";

        switch (platform) {
          case "facebook":
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
          case "twitter":
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
            break;
          case "linkedin":
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            break;
          case "whatsapp":
            shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
            break;
        }

        if (shareUrl) {
          window.open(shareUrl, "_blank", "width=600,height=400");
        }
      });
    });
  }

  /**
   * 載入範本模組
   */
  function loadTemplates() {
    if (typeof window.templateModule === "function") {
      window.templateModule();
    } else {
      console.warn("範本模組尚未載入");
    }
  }

  /**
   * 載入動畫模組
   */
  function loadAnimations() {
    if (typeof window.animationsModule === "function") {
      window.animationsModule();
    } else {
      console.warn("動畫模組尚未載入");
    }
  }

  /**
   * 載入部分內容
   */
  function loadPartialContent(containerId, url) {
    const container = document.getElementById(containerId);
    if (!container) return;

    fetch(url)
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.text();
      })
      .then((html) => {
        container.innerHTML = html;
        // 觸發內容載入完成事件
        document.dispatchEvent(
          new CustomEvent("partialContentLoaded", {
            detail: { containerId, url },
          })
        );
      })
      .catch((error) => {
        console.error(`載入 ${url} 失敗:`, error);
        container.innerHTML = `<div class="text-red-500 p-4">內容載入失敗</div>`;
      });
  }
});

/**
 * 顯示toast提示
 * 全局可用
 */
window.showToast = function (message) {
  let toastEl = document.getElementById("copy-toast");
  if (!toastEl) {
    console.warn("Toast element #copy-toast not found.");
    return;
  }

  const messageSpan = toastEl.querySelector("span");
  if (messageSpan) {
    messageSpan.textContent = message;
  } else {
    toastEl.textContent = message;
  }

  toastEl.classList.remove("opacity-0", "invisible");
  toastEl.classList.add("opacity-100", "visible");

  setTimeout(function () {
    toastEl.classList.remove("opacity-100", "visible");
    toastEl.classList.add("opacity-0", "invisible");
  }, 3000);
};
