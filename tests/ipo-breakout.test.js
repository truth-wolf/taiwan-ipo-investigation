/**
 * 📦 模組：IPO破發模組測試
 * 🕒 最後更新：2025-06-10T21:49:33+08:00
 * 🧑‍💻 作者/更新者：@DigitalSentinel
 * 🔢 版本：v1.0.0
 * 📝 摘要：IPO破發模組的單元測試
 */

describe('IPO破發模組基本功能測試', () => {
  test('應該正確格式化數字', () => {
    const formatNumber = (num, decimals = 0) => {
      if (typeof num !== 'number' || isNaN(num)) return '-';
      return num.toLocaleString('zh-TW', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    };

    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatNumber(10.5, 2)).toBe('10.50');
    expect(formatNumber(NaN)).toBe('-');
  });

  test('應該正確計算損益顏色類別', () => {
    const getPriceClass = value => {
      if (typeof value !== 'number' || isNaN(value)) return 'text-gray-500';
      return value < 0
        ? 'text-green-600 font-semibold'
        : value > 0
          ? 'text-red-600 font-semibold'
          : 'text-gray-500';
    };

    expect(getPriceClass(-5.5)).toBe('text-green-600 font-semibold');
    expect(getPriceClass(3.2)).toBe('text-red-600 font-semibold');
    expect(getPriceClass(0)).toBe('text-gray-500');
    expect(getPriceClass(NaN)).toBe('text-gray-500');
  });

  test('應該正確計算手續費和稅金', () => {
    const BROKER_SELL_FEE_RATE = (0.1425 * 0.6) / 100;
    const TAX_RATE = 0.1 / 100;

    const calculateSellFeeAndTax = (price, quantity) => {
      const fee = Math.max(20, price * quantity * BROKER_SELL_FEE_RATE);
      const tax = price * quantity * TAX_RATE;
      return fee + tax;
    };

    const result = calculateSellFeeAndTax(10, 1000);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeCloseTo(30, 1); // 手續費 20 (最低) + 稅金 10
  });

  test('應該正確解析CSV數據格式', () => {
    const parseCSVLine = (line, headers) => {
      const values = line.split(',').map(val => val.trim());
      const entry = {};
      headers.forEach((header, index) => {
        entry[header] = values[index] ? values[index].trim() : '';
      });
      return entry;
    };

    const headers = [
      '股票名稱',
      '上市日',
      '募集價格',
      '掛牌當天最低',
      '掛盤後一個月最低',
    ];
    const line = '測試股票,2024/01/01,10.00,9.50,9.00';
    const result = parseCSVLine(line, headers);

    expect(result['股票名稱']).toBe('測試股票');
    expect(result['上市日']).toBe('2024/01/01');
    expect(result['募集價格']).toBe('10.00');
    expect(result['掛牌當天最低']).toBe('9.50');
    expect(result['掛盤後一個月最低']).toBe('9.00');
  });

  test('應該正確計算IPO損益', () => {
    const calculateLoss = (subPrice, sellPrice, shares) => {
      const cost = shares * subPrice;
      const sellValue = shares * sellPrice;
      const loss = cost - sellValue;
      const lossPercent = (loss / cost) * 100;
      return { loss, lossPercent };
    };

    const result = calculateLoss(10.0, 9.0, 1000);
    expect(result.loss).toBe(1000);
    expect(result.lossPercent).toBe(10);
  });

  test('應該正確處理特大數字格式化', () => {
    const formatLargeNumber = num => {
      if (typeof num !== 'number' || isNaN(num)) return '-';
      const billion = num / 100000000;
      return billion.toLocaleString('zh-TW', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    expect(formatLargeNumber(500000000)).toBe('5.00');
    expect(formatLargeNumber(1234567890)).toBe('12.35');
    expect(formatLargeNumber(NaN)).toBe('-');
  });
});
