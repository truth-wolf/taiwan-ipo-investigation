// 心聲卡片與互動功能
document.addEventListener('DOMContentLoaded', function() {
  // 初始化卡片翻轉功能
  initCardFlip();
  
  // 初始化標籤篩選功能
  initTabFiltering();
  
  // 初始化彩蛋互動
  initEasterEgg();
  
  // 初始化NLP指標動畫
  initNLPMetricsAnimation();
  
  // 初始化互動彈出窗口
  initInteractionPopup();
  
  // 初始化元素淡入效果
  initFadeInElements();
  
  // 初始化視差效果
  initParallaxEffect();
  
  // 初始化互動式彩蛋
  loadEasterEggContent();
});

// 卡片翻轉功能
function initCardFlip() {
  const cards = document.querySelectorAll('.testimony-card');
  
  cards.forEach(card => {
    const flipButton = card.querySelector('.testimony-card-button');
    
    if (flipButton) {
      flipButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        card.classList.toggle('flipped');
        
        // 若有3D效果，移除以避免衝突
        card.style.transform = '';
      });
    }
  });
}

// 標籤篩選功能
function initTabFiltering() {
  const tabs = document.querySelectorAll('.testimony-tab');
  const cards = document.querySelectorAll('.testimony-card');
  
  if (tabs.length && cards.length) {
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        // 移除所有標籤的活動狀態
        tabs.forEach(t => t.classList.remove('active'));
        
        // 設置當前標籤為活動狀態
        this.classList.add('active');
        
        const category = this.getAttribute('data-category');
        
        // 篩選卡片並添加動畫
        cards.forEach(card => {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          
          setTimeout(() => {
            if (category === 'all' || card.getAttribute('data-category') === category) {
              card.style.display = 'block';
              setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
              }, 50);
            } else {
              card.style.display = 'none';
            }
          }, 300);
        });
      });
    });
  }
}

// 互動式彩蛋功能
function initEasterEgg() {
  const loaderTip = document.querySelector('.loader-tip');
  let clickCount = 0;
  let lastClickTime = 0;
  const clickThreshold = 3; // 需要點擊的次數
  const timeThreshold = 2000; // 時間閾值（毫秒）
  
  // 在頁面左下角創建一個隱形的點擊區域
  const triggerArea = document.createElement('div');
  triggerArea.style.position = 'fixed';
  triggerArea.style.left = '0';
  triggerArea.style.bottom = '0';
  triggerArea.style.width = '50px';
  triggerArea.style.height = '50px';
  triggerArea.style.zIndex = '9999';
  triggerArea.style.cursor = 'default';
  document.body.appendChild(triggerArea);
  
  // 添加點擊事件
  triggerArea.addEventListener('click', function() {
    const currentTime = new Date().getTime();
    
    // 檢查是否超過時間閾值
    if (currentTime - lastClickTime > timeThreshold) {
      clickCount = 1;
    } else {
      clickCount++;
    }
    
    lastClickTime = currentTime;
    
    // 如果達到點擊閾值，激活彩蛋
    if (clickCount >= clickThreshold) {
      activateEasterEgg();
      clickCount = 0; // 重置點擊計數
    }
  });
  
  // 故意保留一個在載入提示中的線索
  if (loaderTip) {
    loaderTip.innerHTML = '提示：點擊頁面左下角的小點3次可以查看檢舉人自我保護指南';
  }
}

// 激活互動式彩蛋
function activateEasterEgg() {
  // 先檢查彩蛋內容是否已經載入
  const easterEggSection = document.getElementById('easter-egg-section');
  
  if (easterEggSection) {
    // 已存在，直接顯示
    easterEggSection.classList.remove('hidden');
    easterEggSection.scrollIntoView({ behavior: 'smooth' });
    
    // 添加動畫效果
    setTimeout(function() {
      const fadeElements = easterEggSection.querySelectorAll('.fade-in, .animate-fade-in-up');
      fadeElements.forEach(el => el.classList.add('visible'));
    }, 100);
  } else {
    // 不存在，載入彩蛋內容
    loadEasterEggContent(true);
  }
}

// 加載彩蛋內容
function loadEasterEggContent(andActivate = false) {
  fetch('partials/easter-egg.html')
    .then(response => response.text())
    .then(html => {
      // 將彩蛋內容加入到指定的容器中
      const easterEggContainer = document.getElementById('easter-egg-container');
      if (easterEggContainer) {
        easterEggContainer.innerHTML = html;
        
        // 如果需要立即激活
        if (andActivate) {
          const easterEggSection = document.getElementById('easter-egg-section');
          if (easterEggSection) {
            easterEggSection.classList.remove('hidden');
            easterEggSection.scrollIntoView({ behavior: 'smooth' });
            
            // 添加動畫效果
            setTimeout(function() {
              const fadeElements = easterEggSection.querySelectorAll('.fade-in, .animate-fade-in-up');
              fadeElements.forEach(el => el.classList.add('visible'));
            }, 100);
          }
        }
        
        // 初始化彩蛋內的互動功能
        initEasterEggInteractions();
      }
    })
    .catch(error => {
      console.error('載入彩蛋內容時出錯:', error);
    });
}

// 初始化彩蛋內的互動功能
function initEasterEggInteractions() {
  // 選項按鈕
  const optionButtons = document.querySelectorAll('.option-btn');
  const resultContainer = document.querySelector('.easter-egg-result');
  const resultText = document.querySelector('.easter-egg-result-text');
  const restartButton = document.querySelector('.easter-egg-restart');
  
  if (optionButtons.length && resultContainer && resultText) {
    optionButtons.forEach(button => {
      button.addEventListener('click', function() {
        const result = this.getAttribute('data-result');
        const options = document.querySelectorAll('.easter-egg-option');
        
        // 隱藏所有選項
        options.forEach(option => {
          option.style.opacity = '0';
          option.style.transform = 'translateY(-20px)';
          
          setTimeout(() => {
            option.style.display = 'none';
          }, 300);
        });
        
        // 顯示結果
        setTimeout(() => {
          resultContainer.classList.remove('hidden');
          
          // 設定結果文字
          if (result === 'reject') {
            resultText.innerHTML = '主管冷笑：「真敢拒絕啊？別擔心，你的績效獎金已經自動捐給公司了，這個季度的客戶資源也已經調整。對了，週末別忘了加班。」';
          } else if (result === 'accept') {
            resultText.innerHTML = '主管微笑：「很好，這才是我們的好員工！這樣的責任額下週會多加50%，我相信你一定能做得更好。」你發現自己又陷入新的困境...';
          } else if (result === 'delay') {
            resultText.innerHTML = '主管皺眉：「拖延是不專業的表現。我給你時間到今天下班前，不然就準備收拾桌上的東西吧。記得交回公司的鑰匙。」';
          } else if (result === 'suggest') {
            resultText.innerHTML = '主管大笑：「你以為你在教我做事？我在這行的時間比你吃的鹽還多。明天早上我要看到完整的改進計劃書，三份，手寫的。」';
          }
          
          // 淡入顯示
          setTimeout(() => {
            resultContainer.style.opacity = '1';
            resultContainer.style.transform = 'translateY(0)';
          }, 50);
        }, 350);
      });
    });
    
    // 重新開始
    if (restartButton) {
      restartButton.addEventListener('click', function() {
        resultContainer.style.opacity = '0';
        resultContainer.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          resultContainer.classList.add('hidden');
          
          // 顯示所有選項
          document.querySelectorAll('.easter-egg-option').forEach(option => {
            option.style.display = 'block';
            
            setTimeout(() => {
              option.style.opacity = '1';
              option.style.transform = 'translateY(0)';
            }, 50);
          });
        }, 300);
      });
    }
  }
}

// 顯示更多卡片
function showMoreCards() {
  const hiddenCards = document.querySelectorAll('.testimony-card.hidden');
  
  // 一次顯示6張卡片，帶有動畫效果
  let count = 0;
  hiddenCards.forEach(card => {
    if (count < 6) {
      // 先設置為可見但透明
      card.classList.remove('hidden');
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      // 添加小延遲使動畫錯開
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, count * 100);
      
      count++;
    }
  });
  
  // 如果沒有更多隱藏卡片，隱藏「顯示更多」按鈕
  if (hiddenCards.length <= 6) {
    const moreButton = document.querySelector('.testimony-more-button');
    if (moreButton) {
      moreButton.style.opacity = '0';
      moreButton.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        moreButton.style.display = 'none';
      }, 300);
    }
  }
}

// NLP指標動畫效果
function initNLPMetricsAnimation() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const metrics = entry.target.querySelectorAll('.nlp-metric-value');
        
        metrics.forEach((metric, index) => {
          const targetValue = parseInt(metric.getAttribute('data-value'));
          let currentValue = 0;
          
          // 添加小延遲使動畫錯開
          setTimeout(() => {
            const interval = setInterval(() => {
              if (currentValue >= targetValue) {
                clearInterval(interval);
                metric.classList.add('animated'); // 添加動畫類
              } else {
                currentValue++;
                metric.textContent = currentValue;
              }
            }, 30);
          }, index * 100);
        });
        
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  
  const nlpContainer = document.querySelector('.nlp-heatmap-container');
  if (nlpContainer) {
    observer.observe(nlpContainer);
  }
}

// 元素淡入效果
function initFadeInElements() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 添加小延遲使動畫更自然
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, parseInt(entry.target.style.animationDelay || 0) * 1000);
        
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  const elements = document.querySelectorAll('.animate-fade-in-up');
  elements.forEach((element, index) => {
    // 設置基本樣式和延遲
    if (!element.style.animationDelay) {
      element.style.animationDelay = (0.1 * index) + 's';
    }
    observer.observe(element);
  });
}

// 視差效果
function initParallaxEffect() {
  const cards = document.querySelectorAll('.testimony-card');
  
  if (window.innerWidth >= 1024) { // 只在桌面版啟用
    document.addEventListener('mousemove', function(e) {
      cards.forEach(card => {
        if (!card.classList.contains('flipped')) {
          const rect = card.getBoundingClientRect();
          
          // 檢查滑鼠是否在卡片區域內
          if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          ) {
            // 計算相對位置
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // 計算偏移量（較小的角度使效果更微妙）
            const moveX = (x - centerX) / centerX * 3; // 最大旋轉3度
            const moveY = (y - centerY) / centerY * 3;
            
            // 應用3D轉換
            card.style.transform = `perspective(1000px) rotateY(${moveX}deg) rotateX(${-moveY}deg) translateZ(10px)`;
          } else {
            // 重置變換
            card.style.transform = '';
          }
        }
      });
    });
  }
}

// 互動彈出窗口
function initInteractionPopup() {
  const popup = document.getElementById('interaction-popup');
  
  // 如果沒有互動彈出窗口，不執行此功能
  if (!popup) return;
  
  const closeButton = document.getElementById('interaction-close');
  const resetButton = document.getElementById('interaction-reset');
  const responseOptions = document.querySelectorAll('.response-option');
  const resultContainer = document.getElementById('interaction-result');
  const resultMessage = document.getElementById('result-message');
  
  // 隨機觸發彈出窗口
  let hasTriggered = false;
  
  document.addEventListener('scroll', function() {
    if (!hasTriggered && Math.random() < 0.1) {
      setTimeout(() => {
        showInteractionPopup();
        hasTriggered = true;
      }, 10000); // 10秒後觸發
    }
  });
  
  // 關閉按鈕
  if (closeButton) {
    closeButton.addEventListener('click', function() {
      popup.style.opacity = '0';
      
      setTimeout(() => {
        popup.style.display = 'none';
        document.body.style.overflow = 'auto';
      }, 300);
    });
  }
  
  // 重置按鈕
  if (resetButton) {
    resetButton.addEventListener('click', function() {
      resultContainer.style.opacity = '0';
      resultContainer.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        resultContainer.style.display = 'none';
        
        // 顯示選項
        responseOptions.forEach(option => {
          option.style.display = 'block';
          
          setTimeout(() => {
            option.style.opacity = '1';
            option.style.transform = 'translateY(0)';
          }, 50);
        });
      }, 300);
    });
  }
  
  // 選項點擊
  if (responseOptions.length && resultContainer && resultMessage) {
    responseOptions.forEach(option => {
      option.addEventListener('click', function() {
        // 隱藏所有選項
        responseOptions.forEach(opt => {
          opt.style.opacity = '0';
          opt.style.transform = 'translateY(-20px)';
        });
        
        setTimeout(() => {
          responseOptions.forEach(opt => {
            opt.style.display = 'none';
          });
          
          // 顯示結果
          resultContainer.style.display = 'block';
          
          setTimeout(() => {
            resultContainer.style.opacity = '1';
            resultContainer.style.transform = 'translateY(0)';
          }, 50);
          
          // 設置結果消息
          const responses = [
            "「你是在跟我開玩笑嗎？所有人都能達成，就你做不到？看來你根本不適合這份工作。」",
            "「不要再找藉口了！客戶不買？那是因為你沒有足夠用心！其他同事都做得到，為什麼你不行？」",
            "「你知道不達標的後果吧？我可以直接把你的績效打0分。你自己想清楚吧。」",
            "「好吧，看來你真的不想好好表現。我會在下次會議上特別提醒大家你的『優異表現』。」"
          ];
          
          resultMessage.textContent = responses[Math.floor(Math.random() * responses.length)];
        }, 300);
      });
    });
  }
  
  // 顯示互動彈出窗口
  function showInteractionPopup() {
    popup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
      popup.style.opacity = '1';
    }, 50);
    
    // 重置視窗狀態
    if (resultContainer) {
      resultContainer.style.display = 'none';
      resultContainer.style.opacity = '0';
      resultContainer.style.transform = 'translateY(20px)';
    }
    
    if (responseOptions.length) {
      responseOptions.forEach(option => {
        option.style.display = 'block';
        option.style.opacity = '1';
        option.style.transform = 'translateY(0)';
      });
    }
    
    // 隨機設置主管的問題
    const messageElement = document.getElementById('interaction-message');
    if (messageElement) {
      const questions = [
        "「這個月責任額是300萬，你現在還差250萬。你打算如何解決？」",
        "「你到現在還沒達標，知道這會影響整個分公司的績效吧？」",
        "「其他同事都已完成80%了，只有你還在原地踏步，你覺得這樣合理嗎？」",
        "「客戶不願意買？那是你的事，不是公司的事。你必須想辦法。」"
      ];
      
      messageElement.textContent = questions[Math.floor(Math.random() * questions.length)];
    }
  }
}