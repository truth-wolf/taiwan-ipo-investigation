#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
解析證券商基本資料並統計分支數量，
並生成對應的簡稱庫 (branch_full_name → parent_company 映射)

使用方式:
  python parse_brokers.py 證券商基本資料.csv

輸出檔案:
  branch_counts.csv      分支統計結果 (parent_company, branch_count)
  abbreviation_map.json  簡稱庫 (branch_full_name → parent_company)
"""

import pandas as pd
import argparse
import os
import json
import sys
import re

# 自訂母公司簡稱對照字典
CUSTOM_ABBREV = {
    "中國信託": "中信",
    "臺灣企銀": "台企",
    "台灣企銀": "台企",
    "土地銀行": "土銀",
    "臺銀證券": "臺銀",
    "合作金庫": "合庫",
    "彰化銀行": "彰銀",
    "第一金控": "第一金",
    "統一證券": "統一",
    "元富證券": "元富",
    "台中銀行": "台中銀",
    "兆豐證券": "兆豐",
    "國泰證券": "國泰",
    "群益金鼎": "群益",
    "凱基證券": "凱基",
    "華南永昌": "華南",
    "富邦證券": "富邦",
    "元大證券": "元大",
    "永豐金": "永豐",
    "玉山證券": "玉山",
    "新光證券": "新光",
    "陽信證券": "陽信",
    "聯邦證券": "聯邦",
    "康和證券": "康和",
    "台新證券": "台新",
    "國票證券": "國票",
    "亞東證券": "亞東",
    "致和證券": "致和",
    "安泰證券": "安泰",
    "福邦證券": "福邦",
    "永全證券": "永全",
    "大昌證券": "大昌",
    "德信證券": "德信",
    "福勝證券": "福勝",
    "光和證券": "光和",
    "新百王證券": "新百王",
    "高橋證券": "高橋",
    "美好證券": "美好",
    "大展證券": "大展",
    "富隆證券": "富隆",
    "盈溢證券": "盈溢",
    "寶盛證券": "寶盛",
    "永興證券": "永興",
    "日進證券": "日進",
    "日茂證券": "日茂",
    "犇亞證券": "犇亞",
    "北城證券": "北城",
    "石橋證券": "石橋",
    "中農證券": "中農",
    "口袋證券": "口袋",
    "京城證券": "京城",
    "宏遠證券": "宏遠",
    "元大期貨": "元大",
    "群益期貨": "群益",
    "港商麥格理": "麥格理",
    "台灣匯立": "匯立",
    "美林": "美林",
    "台灣摩根士丹利": "摩根士丹利",
    "美商高盛": "高盛",
    "港商野村": "野村",
    "港商法國興業": "法國興業",
    "花旗環球": "花旗",
    "新加坡商瑞銀": "瑞銀",
    "大和國泰": "大和國泰",
    "法銀巴黎": "法銀巴黎",
    "香港上海匯豐": "匯豐",
    "摩根大通": "摩根大通"
}

def normalize_name(name):
    """標準化名稱：移除多餘空格、統一分隔符"""
    if not isinstance(name, str):
        return str(name).strip()
    return re.sub(r'\s+', ' ', name.replace('－', '-').strip())

def extract_parent_name(full_name):
    """從完整分行名稱提取母公司名稱"""
    full_name = normalize_name(full_name)
    # 分割符號：- 或 空格，僅分割一次
    parts = re.split(r'[- ]', full_name, maxsplit=1)
    parent = parts[0].strip()
    return parent

def main():
    parser = argparse.ArgumentParser(
        description='解析證券商基本資料並統計分支數量與生成簡稱庫',
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument('csv_file', help='證券商基本資料 CSV 檔案路徑')
    parser.add_argument('--output', '-o',
                        default='branch_counts.csv',
                        help='分支統計輸出 CSV 檔名')
    parser.add_argument('--map', '-m',
                        default='abbreviation_map.json',
                        help='簡稱庫輸出 JSON 檔名')
    args = parser.parse_args()

    # 檢查輸入檔案是否存在
    if not os.path.isfile(args.csv_file):
        print(f"錯誤: 找不到檔案 {args.csv_file}", file=sys.stderr)
        sys.exit(1)

    try:
        # 讀取 CSV，指定編碼並處理 ‘‘可能的 BOM
        df = pd.read_csv(args.csv_file, encoding='utf-8-sig')
    except Exception as e:
        print(f"錯誤: 無法讀取 CSV 檔案 {args.csv_file}: {e}", file=sys.stderr)
        sys.exit(1)

    # 檢查是否有足夠欄位
    if df.shape[1] < 2:
        print("錯誤: CSV 檔案欄位不足，至少需要證券商名稱", file=sys.stderr)
        sys.exit(1)

    # 假設第二欄為證券商名稱
    name_col = '證券商名稱'

    # 清理數據：移除空值並標準化名稱
    df = df.dropna(subset=[name_col])
    df[name_col] = df[name_col].apply(normalize_name)

    # 提取母公司名稱
    df['parent_raw'] = df[name_col].apply(extract_parent_name)

    # 套用自訂簡稱，找不到則保留原始名稱
    df['parent_company'] = df['parent_raw'].apply(
        lambda name: CUSTOM_ABBREV.get(name, name)
    )

    # 計算每個母公司的分支數量
    counts = (
        df['parent_company']
        .value_counts()
        .rename_axis('parent_company')
        .reset_index(name='branch_count')
        .sort_values(by=['branch_count', 'parent_company'], ascending=[False, True])
    )

    # 輸出分支統計 CSV
    try:
        counts.to_csv(args.output, index=False, encoding='utf-8-sig')
        print(f"已將分支統計儲存至 {args.output}")
    except Exception as e:
        print(f"錯誤: 無法寫入 {args.output}: {e}", file=sys.stderr)
        sys.exit(1)

    # 生成簡稱庫：branch_full_name → parent_company
    mapping = dict(
        zip(
            df[name_col],
            df['parent_company']
        )
    )

    # 輸出簡稱庫 JSON
    try:
        with open(args.map, 'w', encoding='utf-8') as f:
            json.dump(mapping, f, ensure_ascii=False, indent=2)
        print(f"已將簡稱庫儲存至 {args.map}")
    except Exception as e:
        print(f"錯誤: 無法寫入 {args.map}: {e}", file=sys.stderr)
        sys.exit(1)

    # 列印母公司簡稱列表
    print("\n# 母公司簡稱列表 (依分支數量排序):")
    for _, row in counts.iterrows():
        print(f"- {row['parent_company']} ({row['branch_count']} 間)")

if __name__ == '__main__':
    main()