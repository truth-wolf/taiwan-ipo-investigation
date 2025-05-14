/**
 * app.js - 主要JavaScript邏輯
 *
 * 這個文件包含網站的核心功能:
 * - 導航和UI控制
 * - 暗黑模式切換
 * - 滾動事件處理
 * - 分享功能
 * - 彩蛋功能
 */

document.addEventListener("DOMContentLoaded", function () {
  // 全局變數
  const body = document.body;
  const progressLine = document.querySelector(".progress-line");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const menuClose = document.querySelector(".menu-close");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const backToTop = document.getElementById("back-to-top");
  const secretTrigger = document.getElementById("secret-trigger");
  const secretContent = document.getElementById("secret-content");
  const secretClose = document.getElementById("secret-close");
  const secretUnderstand = document.getElementById("secret-understand");
  const shareBtn = document.getElementById("share-btn");
  const mobileShareBtn = document.getElementById("mobile-share-btn");
  const shareModal = document.getElementById("share-modal");
  const shareClose = document.getElementById("share-close");
  const copyLink = document.getElementById("copy-link");

  // 初始化所有功能
  initScrollEvents();
  initMobileMenu();
  initBackToTop();
  initSecretFeature();
  initShareFeature();
  initSmoothScroll();

  // 載入其他模組
  loadTemplateModule();
  loadAnimationsModule();

  // 閱讀進度條
  function initScrollEvents() {
    window.addEventListener("scroll", function () {
      updateProgressBar();
      updateFixedHeader();
    });
  }

  function updateProgressBar() {
    if (!progressLine) return;

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrollTop = window.scrollY;
    const width = (scrollTop / documentHeight) * 100 + "%";
    progressLine.style.width = width;
  }

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

  // 行動選單控制
  function initMobileMenu() {
    if (!menuToggle || !mobileMenu || !menuClose) return;

    menuToggle.addEventListener("click", function () {
      mobileMenu.classList.remove("hidden");
      mobileMenu.classList.add("flex");

      // 防止背景滾動
      document.body.style.overflow = "hidden";
    });

    menuClose.addEventListener("click", function () {
      mobileMenu.classList.add("hidden");
      mobileMenu.classList.remove("flex");

      // 恢復背景滾動
      document.body.style.overflow = "";
    });

    // 點擊選單項目後關閉選單
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", function () {
        mobileMenu.classList.add("hidden");
        mobileMenu.classList.remove("flex");
        document.body.style.overflow = "";
      });
    });
  }

  // 回到頂部按鈕
  function initBackToTop() {
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

  // 彩蛋功能
  function initSecretFeature() {
    if (!secretTrigger || !secretContent || !secretClose || !secretUnderstand)
      return;

    let secretClickCount = 0;

    secretTrigger.addEventListener("click", function () {
      secretClickCount++;

      if (secretClickCount >= 3) {
        secretContent.classList.remove("hidden");
        secretContent.classList.add("flex");
        secretClickCount = 0;

        // 防止背景滾動
        document.body.style.overflow = "hidden";
      }
    });

    secretClose.addEventListener("click", function () {
      secretContent.classList.add("hidden");
      secretContent.classList.remove("flex");

      // 恢復背景滾動
      document.body.style.overflow = "";
    });

    secretUnderstand.addEventListener("click", function () {
      secretContent.classList.add("hidden");
      secretContent.classList.remove("flex");

      // 恢復背景滾動
      document.body.style.overflow = "";
    });

    // 鍵盤組合觸發彩蛋（Ctrl+Shift+X）
    document.addEventListener("keydown", function (e) {
      if (e.ctrlKey && e.shiftKey && e.key === "X") {
        secretContent.classList.remove("hidden");
        secretContent.classList.add("flex");

        // 防止背景滾動
        document.body.style.overflow = "hidden";
      }
    });
  }

  // 分享功能
  function initShareFeature() {
    if (!shareBtn || !shareModal || !shareClose) return;

    shareBtn.addEventListener("click", function () {
      shareModal.classList.remove("hidden");
      shareModal.classList.add("flex");

      // 防止背景滾動
      document.body.style.overflow = "hidden";
    });

    if (mobileShareBtn) {
      mobileShareBtn.addEventListener("click", function () {
        shareModal.classList.remove("hidden");
        shareModal.classList.add("flex");

        // 關閉行動選單
        if (mobileMenu) {
          mobileMenu.classList.add("hidden");
          mobileMenu.classList.remove("flex");
        }
      });
    }

    shareClose.addEventListener("click", function () {
      shareModal.classList.add("hidden");
      shareModal.classList.remove("flex");

      // 恢復背景滾動
      document.body.style.overflow = "";
    });

    // 點擊分享模態框以外的地方關閉
    shareModal.addEventListener("click", function (e) {
      if (e.target === shareModal) {
        shareModal.classList.add("hidden");
        shareModal.classList.remove("flex");

        // 恢復背景滾動
        document.body.style.overflow = "";
      }
    });

    // 分享連結複製
    if (copyLink) {
      copyLink.addEventListener("click", function () {
        const linkInput = copyLink.parentElement.querySelector("input");
        linkInput.select();
        document.execCommand("copy");

        showToast("連結已複製！");
      });
    }

    // 社群分享按鈕
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

  // 平滑滾動
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();

        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: "smooth",
          });
        }
      });
    });
  }

  // 載入範本模組
  function loadTemplateModule() {
    if (typeof window.templateModule === "function") {
      window.templateModule();
    } else {
      console.warn("範本模組尚未載入");
    }
  }

  // 載入動畫模組
  function loadAnimationsModule() {
    if (typeof window.animationsModule === "function") {
      window.animationsModule();
    } else {
      console.warn("動畫模組尚未載入");
    }
  }

  // 顯示提示函數
  window.showToast = function (message) {
    const toast = document.getElementById("copy-toast");
    if (!toast) return;

    const messageElement = toast.querySelector("span");

    if (messageElement) {
      messageElement.textContent = message;
    }

    toast.classList.remove("opacity-0", "invisible");
    toast.classList.add("opacity-100", "visible");

    // 3秒後自動隱藏
    setTimeout(function () {
      toast.classList.add("opacity-0", "invisible");
      toast.classList.remove("opacity-100", "visible");
    }, 3000);
  };
});
