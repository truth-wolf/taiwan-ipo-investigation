import pandas as pd
import re
import datetime
import numpy as np

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
    
    # 提取關鍵詞或生成潤飾後對話/內心話
    refined_dialog = refine_text(dialog, "dialog")
    refined_inner_thought = refine_text(inner_thought, "thought")
    
    # 濃縮金句
    key_quote = extract_key_quote(dialog, inner_thought)
    
    # 適合報導的爆點標題
    headline = generate_headline(dialog, inner_thought, scores)
    
    # 返回評分和其他資訊
    return {
        **scores,
        "NLP 總分 (1-100)": total_score,
        "潤飾後話術": refined_dialog,
        "潤飾後內心話語": refined_inner_thought,
        "濃縮金句": key_quote,
        "適合報導的爆點標題": headline
    }

def refine_text(text, text_type):
    """潤飾原始文本"""
    if not text:
        return ""
    
    # 簡單潤飾邏輯
    refined = text.replace("、", "，").strip()
    
    # 如果是特別長的文本，嘗試提取或總結
    if len(refined) > 100:
        if text_type == "dialog":
            return extract_summary(refined, "主管以強制手段要求員工達成IPO責任額")
        else:
            return extract_summary(refined, "員工對不合理業績壓力的強烈不滿與反抗")
    
    return refined

def extract_summary(text, default_summary):
    """從長文本中提取摘要"""
    if not text:
        return default_summary
    
    # 嘗試找出最重要的句子
    sentences = re.split(r'[。！？\n]', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    if not sentences:
        return default_summary
    
    # 關鍵詞權重
    keywords = ["責任額", "貸款", "自己買", "IPO", "使命必達", "裙子", "犧牲", "移轉客戶", "約談", "考績", "資遣", "壓力"]
    
    # 找出包含最多關鍵詞的句子
    best_sentence = max(sentences, key=lambda s: sum(1 for k in keywords if k in s))
    
    if len(best_sentence) > 50:
        return best_sentence[:50] + "..."
    
    return best_sentence or default_summary

def extract_key_quote(dialog, inner_thought):
    """從對話和內心話中提取濃縮金句"""
    combined_text = dialog + " " + inner_thought if inner_thought else dialog
    
    # 特殊關鍵詞檢測
    if "裙子" in combined_text and "短" in combined_text:
        return "主管以性別歧視言論暗示女性應利用身體優勢"
    elif "貸款" in combined_text and "買" in combined_text and "責任額" in combined_text:
        return "主管鼓勵員工貸款購買商品達成責任額"
    elif "移轉客戶" in combined_text:
        return "主管威脅未達標者將移轉客戶資源"
    elif "詐騙" in combined_text:
        return "員工被迫使用不當銷售手法，感覺像詐騙集團"
    elif "IPO" in combined_text and "自己買" in combined_text:
        return "員工被迫自掏腰包購買IPO達成業績"
    elif "使命必達" in combined_text:
        return "主管以使命必達為由強制員工達成不合理目標"
    elif "職場霸凌" in combined_text:
        return "主管以言語暴力與威脅實施職場霸凌"
    elif "犧牲自己" in combined_text:
        return "主管暗示女性員工可為業績犧牲自己"
    
    # 從原文中提取濃縮金句
    important_segments = re.findall(r'「[^」]+」|『[^』]+』|"[^"]+"', combined_text)
    if important_segments:
        key_quote = important_segments[0].strip('「」『』""')
        if len(key_quote) > 30:
            key_quote = key_quote[:30] + "..."
        return key_quote
    
    # 如果沒有引號內容，提取最強烈的句子
    sentences = re.split(r'[。！？\n]', combined_text)
    sentences = [s.strip() for s in sentences if s.strip()]
    if sentences:
        key_sentence = max(sentences, key=len)
        if len(key_sentence) > 30:
            key_sentence = key_sentence[:30] + "..."
        return key_sentence
    
    return "金融業銷售壓力下的職場言語暴力"

def generate_headline(dialog, inner_thought, scores):
    """生成適合報導的爆點標題"""
    combined_text = dialog + " " + inner_thought if inner_thought else dialog
    
    # 根據文本內容和得分生成標題
    if "性別歧視" in combined_text or "裙子" in combined_text:
        return "金融業爆性別歧視：主管暗示女職員「利用身體特徵」達成業績"
    elif "貸款" in combined_text and "IPO" in combined_text:
        return "職場壓力驚人：金融從業人員被迫貸款購買IPO達標"
    elif "使命必達" in combined_text and "IPO" in combined_text:
        return "金融業「使命必達」文化下的員工苦痛：IPO責任額成無形枷鎖"
    elif "客戶移轉" in combined_text:
        return "金融業曝光威脅手段：未達責任額就移轉客戶資源"
    elif "詐騙" in combined_text:
        return "從業人員心聲：「我們像詐騙集團」揭露金融業銷售亂象"
    elif "責任額" in combined_text and "壓力" in combined_text:
        return "責任額壓力下的金融從業人員：每月都在買單過活"
    elif "吃藥" in combined_text or "看醫生" in combined_text:
        return "過度銷售壓力致金融從業人員心理健康亮紅燈"
    
    # 如果沒有明確的主題，根據情緒得分生成通用標題
    if scores["被欺壓感 (1-10)"] >= 8:
        return "金融業IPO銷售文化調查：員工在權力不對等下的職場壓迫"
    elif scores["羞辱感 (1-10)"] >= 8:
        return "金融業職場暴力：銷售壓力下的公開羞辱與言語霸凌"
    elif scores["恐懼焦慮 (1-10)"] >= 8:
        return "恐懼與焦慮：金融從業人員在IPO責任額壓力下的心理重擔"
    else:
        return "金融業IPO銷售壓力調查：員工被迫達成不合理責任額"

def generate_markdown_report(df):
    """生成Markdown報告"""
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
    
    return markdown_content

# 讀取和處理數據
def process_data(data_text):
    lines = data_text.strip().split('\n')
    
    # 尋找標題行
    header_found = False
    headers = []
    data_lines = []
    
    for line in lines:
        if not header_found and "時間戳記" in line:
            headers = line.split(',')
            header_found = True
            continue
        
        if header_found and line.strip():
            data_lines.append(line)
    
    # 如果找不到標題行，使用預設標題
    if not header_found:
        headers = ["時間戳記", "職場壓力話術／內部對話片段", "你內心真正想說的話"]
    
    # 處理數據行
    rows = []
    for line in data_lines:
        # 處理逗號在引號中的情況
        if line.count('"') >= 2:
            parts = []
            in_quotes = False
            current_part = ""
            
            for char in line:
                if char == '"':
                    in_quotes = not in_quotes
                    continue
                
                if char == ',' and not in_quotes:
                    parts.append(current_part)
                    current_part = ""
                else:
                    current_part += char
            
            parts.append(current_part)  # 添加最後一部分
            
            # 確保有三個部分
            while len(parts) < 3:
                parts.append("")
            
            rows.append(parts[:3])  # 只取前三個部分
        else:
            parts = line.split(',', 2)  # 只分割前兩個逗號
            if len(parts) >= 3:
                rows.append(parts[:3])
            elif len(parts) == 2:
                rows.append([parts[0], parts[1], ""])
    
    # 創建 DataFrame
    df = pd.DataFrame(rows, columns=headers[:3])
    
    # 重命名列名以匹配目標格式
    df = df.rename(columns={
        headers[0]: "時間戳記",
        headers[1]: "原始話術／內部對話",
        headers[2]: "原始內心話語"
    })
    
    # 確保所有必要的列都存在
    for col in ["時間戳記", "原始話術／內部對話", "原始內心話語"]:
        if col not in df.columns:
            df[col] = ""
    
    # 清理和處理資料
    df = df.drop_duplicates()
    df = df.dropna(how='all')
    
    # 格式化時間戳記
    df["時間戳記"] = df["時間戳記"].apply(parse_timestamp)
    
    return df

def main():
    # 範例數據
    data_text = """時間戳記,職場壓力話術／內部對話片段,你內心真正想說的話
2025/5/16 08:52:49,妳裙子穿得比別人短，責任額跟其他男生一樣不覺得愧疚嗎？你是女生要會利用自己優勢，女生怎麼可能賣不出去，是妳要不要而已你知道方法的。,去死吧"""
    
    # 處理數據
    df = process_data(data_text)
    
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
    
    # 生成 Markdown 報告內容
    markdown_content = generate_markdown_report(result_df)
    
    # 輸出 Markdown 檔案
    with open("IPO.md", "w", encoding="utf-8") as f:
        f.write(markdown_content)
    
    print("分析完成，已輸出 IPO.csv 和 IPO.md 檔案")

if __name__ == "__main__":
    main() 