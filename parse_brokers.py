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
import datetime
import numpy as np

# 自訂母公司簡稱對照字典
CUSTOM_ABBREV = {
    "中國信託": "中信",
    "臺灣企銀": "台企",
    "台灣企銀": "台企",
    "土地銀行": "土銀",
    "臺銀證券": "臺銀",
    "合作金庫": "合庫",
    "彰化銀行": "彰銀",
    "第一金": "第一證",
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

# 函數用於清理和解析時間戳
def parse_timestamp(timestamp):
    try:
        # 處理時間戳記格式
        if not isinstance(timestamp, str):
            return pd.NaT
        
        # 清理時間戳並轉為ISO8601格式
        timestamp = timestamp.strip()
        
        # 處理 "2025/5/16 上午 10:20:44" 之類的格式
        if '上午' in timestamp:
            timestamp = timestamp.replace('上午', 'AM')
        elif '下午' in timestamp:
            timestamp = timestamp.replace('下午', 'PM')
        
        # 嘗試多種時間格式解析
        try:
            dt = pd.to_datetime(timestamp, format='%Y/%m/%d %I:%M:%S')
        except:
            try:
                dt = pd.to_datetime(timestamp, format='%Y/%m/%d %H:%M:%S')
            except:
                try:
                    dt = pd.to_datetime(timestamp, format='%Y/%m/%d %p %I:%M:%S')
                except:
                    dt = pd.to_datetime(timestamp)
        
        # 轉換為ISO8601格式
        return dt.strftime('%Y-%m-%dT%H:%M:%S+08:00')
    except:
        return pd.NaT

# 函數用於評分每筆資料的情緒/壓迫指標
def score_entry(dialog, inner_thought):
    # 初始化評分
    scores = {}
    
    # 合併對話和內心話進行評分
    combined_text = dialog + " " + inner_thought if inner_thought else dialog
    
    # 無奈感：被迫、心力交瘁程度
    helplessness = 0
    helplessness_words = ["無奈", "被迫", "心力交瘁", "沒辦法", "無法", "只能", "只好", "不得不", "迫不得已", "心累", "沒得選", "無力"]
    helplessness += sum([3 for word in helplessness_words if word in combined_text])
    helplessness += 3 if "自己買" in combined_text else 0
    helplessness += 3 if "自掏腰包" in combined_text else 0
    helplessness += 2 if "薪水" in combined_text and ("買" in combined_text or "做業績" in combined_text) else 0
    scores["無奈感 (1-10)"] = min(10, max(1, helplessness))
    
    # 被欺壓感：權力不對等壓迫程度
    oppression = 0
    oppression_words = ["欺壓", "壓迫", "威脅", "恐嚇", "強迫", "逼迫", "威脅", "霸凌", "濫用權力", "必須", "想辦法", "使命必達"]
    oppression += sum([2 for word in oppression_words if word in combined_text])
    oppression += 3 if "責任額" in combined_text and ("要達成" in combined_text or "要做到" in combined_text) else 0
    oppression += 3 if "客戶" in combined_text and "移轉" in combined_text else 0
    oppression += 3 if "辦公室" in combined_text and "約談" in combined_text else 0
    oppression += 3 if "做不到" in combined_text and "離職" in combined_text else 0
    scores["被欺壓感 (1-10)"] = min(10, max(1, oppression))
    
    # 羞辱感：人格貶低、嘲諷程度
    humiliation = 0
    humiliation_words = ["羞辱", "貶低", "嘲諷", "丟臉", "笨蛋", "無能", "沒用", "廢物", "打混", "擺爛", "不學無術", "垃圾"]
    humiliation += sum([3 for word in humiliation_words if word in combined_text])
    humiliation += 3 if "別人都做得到" in combined_text else 0
    humiliation += 3 if "當眾" in combined_text and ("罵" in combined_text or "糟" in combined_text or "批評" in combined_text) else 0
    humiliation += 4 if "裙子" in combined_text and "短" in combined_text else 0
    scores["羞辱感 (1-10)"] = min(10, max(1, humiliation))
    
    # 性別歧視感：性別刻板印象與歧視
    gender_discrimination = 0
    gender_words = ["女生", "女性", "男生", "男性", "性別", "歧視", "性騷擾"]
    if any(word in combined_text for word in gender_words):
        gender_discrimination += 5
    gender_discrimination += 5 if "裙子" in combined_text or "女生要會利用自己優勢" in combined_text else 0
    gender_discrimination += 4 if "一腿" in combined_text else 0
    gender_discrimination += 3 if "犧牲自己" in combined_text and "女" in combined_text else 0
    scores["性別歧視感 (1-10)"] = min(10, max(1, gender_discrimination))
    
    # 侮辱性：侮辱用詞頻率與強度
    insult = 0
    insult_words = ["去死", "白痴", "笨蛋", "廢物", "豬狗不如", "吃屎", "垃圾", "混蛋", "王八蛋", "媽的"]
    insult += sum([3 for word in insult_words if word in combined_text])
    insult += 3 if "怎麼這麼" in combined_text and ("笨" in combined_text or "蠢" in combined_text) else 0
    insult += 3 if "吼" in combined_text or "大聲" in combined_text else 0
    insult += 3 if re.search(r'[#＃*]+', combined_text) else 0
    scores["侮辱性 (1-10)"] = min(10, max(1, insult))
    
    # 恐懼焦慮：害怕後果與焦躁
    anxiety = 0
    anxiety_words = ["害怕", "焦慮", "擔心", "壓力", "恐懼", "懼怕", "怕", "擾民", "不安", "憂慮", "考績", "年終", "資遣"]
    anxiety += sum([2 for word in anxiety_words if word in combined_text])
    anxiety += 3 if "辦公室" in combined_text and "約談" in combined_text else 0
    anxiety += 3 if "考核" in combined_text else 0
    anxiety += 3 if "達不到" in combined_text and ("不保" in combined_text or "績效" in combined_text) else 0
    anxiety += 3 if "看醫生" in combined_text or "吃藥" in combined_text else 0
    scores["恐懼焦慮 (1-10)"] = min(10, max(1, anxiety))
    
    # 壓迫性敘述：命令、強制意味
    coercion = 0
    coercion_words = ["必須", "一定要", "不准", "不允許", "不得", "要求", "使命必達", "沒有選擇", "貸款"]
    coercion += sum([2 for word in coercion_words if word in combined_text])
    coercion += 3 if "責任額" in combined_text and "100%" in combined_text else 0
    coercion += 3 if "自己買" in combined_text or "自掏腰包" in combined_text else 0
    coercion += 3 if "信貸" in combined_text and "買" in combined_text else 0
    coercion += 3 if "使命必達" in combined_text else 0
    scores["壓迫性敘述 (1-10)"] = min(10, max(1, coercion))
    
    # 情緒爆點值：具有新聞爆點的措辭
    emotional_peak = 0
    peak_words = ["詐騙", "違法", "犯罪", "不當", "騙", "PUA", "黑道", "職場霸凌", "生病", "崩潰"]
    emotional_peak += sum([2 for word in peak_words if word in combined_text])
    emotional_peak += 5 if "貸款" in combined_text and "買" in combined_text and "責任額" in combined_text else 0
    emotional_peak += 5 if "自殺" in combined_text or "輕生" in combined_text else 0
    emotional_peak += 4 if "裙子" in combined_text and "短" in combined_text else 0
    emotional_peak += 3 if "貼心女孩" in combined_text or "女生利用優勢" in combined_text else 0
    emotional_peak += 3 if "犧牲自己" in combined_text else 0
    scores["情緒爆點值 (1-10)"] = min(10, max(1, emotional_peak))
    
    # 委屈沉默：壓抑、不敢反駁
    silence = 0
    silence_words = ["委屈", "沉默", "不敢說", "不能說", "憋著", "忍著", "默默", "壓抑", "無處訴苦", "苦難言"]
    silence += sum([2 for word in silence_words if word in combined_text])
    silence += 3 if "不敢" in combined_text else 0
    silence += 3 if "怕" in combined_text and "失去" in combined_text else 0
    silence += 4 if inner_thought and len(inner_thought) > len(dialog) * 2 else 0
    silence += 3 if "不能說" in combined_text or "不敢講" in combined_text else 0
    scores["委屈沉默 (1-10)"] = min(10, max(1, silence))
    
    # 語氣強度：情感張力強度
    intensity = 0
    intensity += 1 if "！" in combined_text else 0
    intensity += 2 if "！！" in combined_text else 0
    intensity += 3 if "！！！" in combined_text else 0
    intensity += 2 if "？？" in combined_text else 0
    intensity += 2 if dialog and dialog.isupper() else 0
    intensity += 3 if inner_thought and inner_thought.isupper() else 0
    intensity += 3 if re.search(r'[。]+', combined_text) else 0
    intensity += 3 if "怒" in combined_text or "氣" in combined_text else 0
    intensity += 3 if "去死" in combined_text else 0
    scores["語氣強度 (1-10)"] = min(10, max(1, intensity))
    
    # 計算 NLP 總分 (1-100)
    total_score = sum(scores.values())
    
    # 潤飾對話和內心話語
    refined_dialog = dialog.replace("、", "，").strip() if dialog else ""
    refined_inner_thought = inner_thought.replace("、", "，").strip() if inner_thought else ""
    
    # 濃縮金句
    key_quote = ""
    if "裙子" in combined_text and "短" in combined_text:
        key_quote = "主管以性別歧視言論暗示女性應利用身體優勢"
    elif "貸款" in combined_text and "買" in combined_text and "責任額" in combined_text:
        key_quote = "主管鼓勵員工貸款購買商品達成責任額"
    elif "移轉客戶" in combined_text:
        key_quote = "主管威脅未達標者將移轉客戶資源"
    elif "詐騙" in combined_text:
        key_quote = "員工被迫使用不當銷售手法，感覺像詐騙集團"
    elif "IPO" in combined_text and "自己買" in combined_text:
        key_quote = "員工被迫自掏腰包購買IPO達成業績"
    elif "使命必達" in combined_text:
        key_quote = "主管以使命必達為由強制員工達成不合理目標"
    elif "職場霸凌" in combined_text:
        key_quote = "主管以言語暴力與威脅實施職場霸凌"
    elif "犧牲自己" in combined_text:
        key_quote = "主管暗示女性員工可為業績犧牲自己"
    else:
        # 從原文中提取濃縮金句
        important_segments = re.findall(r'「[^」]+」|『[^』]+』|"[^"]+"', combined_text)
        if important_segments:
            key_quote = important_segments[0].strip('「」『』""')
        else:
            # 如果沒有引號內容，提取最強烈的句子
            sentences = re.split(r'[。！？\n]', combined_text)
            if sentences:
                key_quote = max(sentences, key=len).strip()
                if len(key_quote) > 30:
                    key_quote = key_quote[:30] + "..."
    
    # 適合報導的爆點標題
    headline = ""
    if "性別歧視" in combined_text or "裙子" in combined_text:
        headline = "金融業爆性別歧視：主管暗示女職員「利用身體特徵」達成業績"
    elif "貸款" in combined_text and "IPO" in combined_text:
        headline = "職場壓力驚人：金融從業人員被迫貸款購買IPO達標"
    elif "使命必達" in combined_text and "IPO" in combined_text:
        headline = "金融業「使命必達」文化下的員工苦痛：IPO責任額成無形枷鎖"
    elif "客戶移轉" in combined_text:
        headline = "金融業曝光威脅手段：未達責任額就移轉客戶資源"
    elif "詐騙" in combined_text:
        headline = "從業人員心聲：「我們像詐騙集團」揭露金融業銷售亂象"
    elif "責任額" in combined_text and "壓力" in combined_text:
        headline = "責任額壓力下的金融從業人員：每月都在買單過活"
    elif "吃藥" in combined_text or "看醫生" in combined_text:
        headline = "過度銷售壓力致金融從業人員心理健康亮紅燈"
    else:
        headline = "金融業IPO銷售壓力調查：員工被迫達成不合理責任額"
    
    # 返回評分和其他資訊
    return {
        **scores,
        "NLP 總分 (1-100)": total_score,
        "潤飾後話術": refined_dialog,
        "潤飾後內心話語": refined_inner_thought,
        "濃縮金句": key_quote,
        "適合報導的爆點標題": headline
    }

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
        # 讀取 CSV，指定編碼並處理 '可能的 BOM
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

    # 處理資料（假設CSV格式第一行是標題）
    headers = ["時間戳記", "職場壓力話術／內部對話片段", "你內心真正想說的話"]
    rows = []
    
    for line in data_lines:
        parts = line.split(",", 2)  # 只分割前兩個逗號
        if len(parts) >= 3:
            rows.append(parts)
        elif len(parts) == 2:
            rows.append([parts[0], parts[1], ""])
    
    # 創建 DataFrame
    df = pd.DataFrame(rows, columns=headers)
    
    # 清理和處理資料
    df = df.drop_duplicates()
    df = df.dropna(how='all')
    
    # 格式化時間戳記
    df["時間戳記"] = df["時間戳記"].apply(parse_timestamp)
    
    # 重命名列名
    df = df.rename(columns={
        "時間戳記": "時間戳記",
        "職場壓力話術／內部對話片段": "原始話術／內部對話",
        "你內心真正想說的話": "原始內心話語"
    })
    
    # 對每筆資料進行評分
    results = []
    for _, row in df.iterrows():
        dialog = row["原始話術／內部對話"] if pd.notna(row["原始話術／內部對話"]) else ""
        inner_thought = row["原始內心話語"] if pd.notna(row["原始內心話語"]) else ""
        
        scores = score_entry(dialog, inner_thought)
        results.append({
            "時間戳記": row["時間戳記"],
            "原始話術／內部對話": dialog,
            "原始內心話語": inner_thought,
            **scores
        })
    
    # 創建結果 DataFrame
    result_df = pd.DataFrame(results)
    
    # 設定欄位順序
    column_order = [
        "時間戳記", "原始話術／內部對話", "原始內心話語", "潤飾後話術", "潤飾後內心話語",
        "無奈感 (1-10)", "被欺壓感 (1-10)", "羞辱感 (1-10)", "性別歧視感 (1-10)",
        "侮辱性 (1-10)", "恐懼焦慮 (1-10)", "壓迫性敘述 (1-10)", "情緒爆點值 (1-10)",
        "委屈沉默 (1-10)", "語氣強度 (1-10)", "NLP 總分 (1-100)",
        "濃縮金句", "適合報導的爆點標題"
    ]
    result_df = result_df[column_order]
    
    # 輸出 CSV 檔案
    result_df.to_csv("IPO.csv", index=False)
    
    # 生成 Markdown 報告
    generate_markdown_report(result_df)
    
    print("分析完成，已輸出 IPO.csv 和 IPO.md 檔案")

def generate_markdown_report(df):
    # 計算基本統計數據
    total_entries = len(df)
    avg_score = round(df["NLP 總分 (1-100)"].mean(), 1)
    
    # 找出最高分和最低分的案例
    highest_score_row = df.loc[df["NLP 總分 (1-100)"].idxmax()]
    lowest_score_row = df.loc[df["NLP 總分 (1-100)"].idxmin()]
    
    # 計算最常見情緒分類
    emotion_columns = [
        "無奈感 (1-10)", "被欺壓感 (1-10)", "羞辱感 (1-10)", "性別歧視感 (1-10)",
        "侮辱性 (1-10)", "恐懼焦慮 (1-10)", "壓迫性敘述 (1-10)", "情緒爆點值 (1-10)",
        "委屈沉默 (1-10)", "語氣強度 (1-10)"
    ]
    
    emotion_map = {
        "無奈感 (1-10)": "無奈感",
        "被欺壓感 (1-10)": "被欺壓感",
        "羞辱感 (1-10)": "羞辱感",
        "性別歧視感 (1-10)": "性別歧視感",
        "侮辱性 (1-10)": "侮辱性言語",
        "恐懼焦慮 (1-10)": "恐懼焦慮",
        "壓迫性敘述 (1-10)": "壓迫性敘述",
        "情緒爆點值 (1-10)": "情緒爆點",
        "委屈沉默 (1-10)": "委屈沉默",
        "語氣強度 (1-10)": "強烈語氣"
    }
    
    # 計算每個情緒類別的平均分數
    emotion_averages = {}
    for col in emotion_columns:
        emotion_averages[col] = df[col].mean()
    
    # 找出平均分數最高的情緒類別
    top_emotion_col = max(emotion_averages, key=emotion_averages.get)
    top_emotion = emotion_map[top_emotion_col]
    
    # 計算高分例子的比例 (分數 >= 7 視為高分)
    high_score_count = sum(1 for score in df[top_emotion_col] if score >= 7)
    top_emotion_percent = round((high_score_count / total_entries) * 100)
    
    # 找出 Top 10 爆點金句 (根據 NLP 總分排序)
    top_quotes = df.sort_values("NLP 總分 (1-100)", ascending=False)[["濃縮金句", "NLP 總分 (1-100)"]].head(10)
    
    # 生成洞察
    # 1. 職場權力話術模板
    power_pattern = "職場主管通過責任額壓力、績效威脅和資源控制形成多層次心理操控，以「使命必達」為名強制員工不合理買單行為，並藉由客戶資源掌控與績效評核權力形成不對等關係。最常見手法包括：威脅移轉客戶、暗示貸款買單、當眾羞辱、績效考核連結和強制達標等。"
    
    # 2. 內心反差剖析
    inner_contrast = "表單顯示從業人員外在被迫服從、內心強烈抗拒的矛盾狀態。公開場合不敢反抗，但匿名表達時情緒極度激烈，常見「去死」等強烈字眼，顯示長期壓抑下的情緒爆發，以及對職場環境徹底失望的態度。多數人感到被迫選擇「賺錢維生」或「保有尊嚴」的兩難困境。"
    
    # 3. 核心痛點統整
    core_pain = "證券與銀行業IPO銷售文化形成三大核心傷害：(1)強制員工自費購買使財務陷入困境，甚至被迫貸款；(2)績效壓力轉嫁造成嚴重心理健康問題，部分人出現焦慮、失眠等症狀；(3)客戶資源被當作獎懲工具，導致員工喪失職業尊嚴與專業自信。特別是資淺與女性從業人員，更易遭遇不當對待。"
    
    # 4. 後續追蹤報導角度
    follow_up_angles = [
        "「貸款買單」現象背後：金融業績效文化的制度性暴力",
        "金融女性從業人員的困境：性別歧視與不當言語環境調查",
        "「被自己的薪水綁架」：金融從業人員的心理健康危機與解方"
    ]
    
    # 生成 Markdown 報告
    markdown_content = f"""## 📊 關鍵統計  
- **受訪筆數**：{total_entries}  
- **平均 NLP 總分**：{avg_score} 分  
- **最高／最低分範例**：  
  - 最高分：濃縮金句「{highest_score_row['濃縮金句']}」 ({int(highest_score_row['NLP 總分 (1-100)'])} 分)  
  - 最低分：濃縮金句「{lowest_score_row['濃縮金句']}」 ({int(lowest_score_row['NLP 總分 (1-100)'])} 分)  
- **最常見情緒分類**：{top_emotion} ({top_emotion_percent}%)

## 🔥 Top 10 爆點金句  
"""
    
    # 加入 Top 10 爆點金句
    for i, (_, row) in enumerate(top_quotes.iterrows(), 1):
        if i <= 10:
            markdown_content += f"{i}. 「{row['濃縮金句']}」 — 總分 {int(row['NLP 總分 (1-100)'])}  \n"
    
    # 加入深度洞察與報導建議
    markdown_content += f"""
## 🕵️‍♂️ 深度洞察與報導建議  
1. **職場權力話術模板**：{power_pattern}  
2. **內心反差剖析**：{inner_contrast}  
3. **核心痛點統整**：{core_pain}  
4. **後續追蹤報導角度**：  
   - {follow_up_angles[0]}  
   - {follow_up_angles[1]}  
   - {follow_up_angles[2]}  
"""
    
    # 輸出 Markdown 檔案
    with open("IPO.md", "w", encoding="utf-8") as f:
        f.write(markdown_content)

if __name__ == '__main__':
    main()