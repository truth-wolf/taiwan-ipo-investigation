import pandas as pd
import argparse

# 欄位名稱（根據你給的順序）
COLUMNS = [
    "時間戳記", "原始話術／內部對話", "原始內心話語", "潤飾後話術", "潤飾後內心話語",
    "無奈感 (1–10)", "被欺壓感 (1–10)", "羞辱感 (1–10)", "性別歧視感 (1–10)", "侮辱性 (1–10)",
    "恐懼焦慮 (1–10)", "壓迫性敘述 (1–10)", "情緒爆點值 (1–10)", "委屈沉默 (1–10)", "語氣強度 (1–10)",
    "NLP 總分 (1–100)", "濃縮金句", "適合報導的爆點標題"
]

def extract_top_nlp(input_csv, output_csv, top_n):
    df = pd.read_csv(input_csv, encoding='utf-8-sig')
    # 轉成數字，避免有空值或亂碼
    df["NLP 總分 (1–100)"] = pd.to_numeric(df["NLP 總分 (1–100)"], errors='coerce')
    df_sorted = df.sort_values(by="NLP 總分 (1–100)", ascending=False)
    df_top = df_sorted.head(top_n)
    # 只輸出指定欄位，順序與原始一致
    df_top = df_top[COLUMNS]
    df_top.to_csv(output_csv, index=False, encoding='utf-8-sig')
    print(f"已輸出 NLP 總分前{top_n}名到 {output_csv}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="提取NLP總分前N名的資料")
    parser.add_argument("input_csv", help="輸入CSV檔案路徑")
    parser.add_argument("-n", "--top_n", type=int, default=20, help="要提取的前N名，預設20")
    parser.add_argument("-o", "--output_csv", default="top_nlp.csv", help="輸出CSV檔案路徑")
    args = parser.parse_args()
    extract_top_nlp(args.input_csv, args.output_csv, args.top_n)