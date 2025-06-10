/**
 * 📦 模組：Jest 測試環境設定
 * 🕒 最後更新：2025-06-10T21:49:33+08:00
 * 🧑‍💻 作者/更新者：@DigitalSentinel
 * 🔢 版本：v1.2.0
 * 📝 摘要：設定測試環境全域變數與 DOM 模擬
 */

// 模擬 jQuery
global.$ = {
  ready: jest.fn(callback => callback()),
  on: jest.fn(),
  off: jest.fn(),
  find: jest.fn(() => ({
    length: 0,
    addClass: jest.fn(),
    removeClass: jest.fn(),
    css: jest.fn(),
    html: jest.fn(),
    text: jest.fn(),
    val: jest.fn(),
    attr: jest.fn(),
    data: jest.fn(),
    click: jest.fn(),
    show: jest.fn(),
    hide: jest.fn(),
    fadeIn: jest.fn(),
    fadeOut: jest.fn()
  })),
  // 模擬 DataTables
  DataTable: jest.fn(() => ({
    destroy: jest.fn(),
    draw: jest.fn(),
    clear: jest.fn(),
    rows: {
      add: jest.fn()
    }
  }))
};

// 模擬 Chart.js
global.Chart = {
  register: jest.fn(),
  Chart: jest.fn(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
    resize: jest.fn()
  })),
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {}
};

// 模擬 PapaParse
global.Papa = {
  parse: jest.fn((data, config) => {
    if (config && config.complete) {
      config.complete({ data: [] });
    }
    return { data: [] };
  })
};

// 模擬 fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve(''),
    json: () => Promise.resolve({})
  })
);

// 模擬 localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = mockLocalStorage;

// 模擬 Intersection Observer
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// 模擬 console.warn 為靜音 (減少測試輸出噪音)
global.console.warn = jest.fn();

// 設定測試超時時間
jest.setTimeout(10000); 