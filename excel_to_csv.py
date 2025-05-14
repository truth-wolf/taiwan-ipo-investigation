#!/usr/bin/env python3
# excel_to_csv.py
# 把 IPO Excel（第 2 列為表頭）轉成扁平 CSV，
# 1. 補齊合併儲存格（ffill）
# 2. 濾掉「小計／合計／總計」列

import pandas as pd
import re
import argparse
from pathlib import Path

# ------------------------------------------------------------
# 1. 判斷產品代號，用不到就給名稱
# ------------------------------------------------------------


def choose_product(row) -> str:
    pid = str(row["代號"]).strip() if pd.notna(row["代號"]) else ""
    pname = str(row["名稱"]).strip() if pd.notna(row["名稱"]) else ""
    return pid if re.fullmatch(r"\d{3,5}[A-Za-z]?(B)?", pid) else (pid or pname)


# ------------------------------------------------------------
# 2. 辨識並排除「加總列」
# ------------------------------------------------------------
_SUBTOTAL_KEYWORDS = ("小計", "合計", "總計")


def is_subtotal_row(row) -> bool:
    name = str(row["名稱"]).strip()
    code = str(row["代號"]).strip()
    return any(k in name for k in _SUBTOTAL_KEYWORDS) or any(
        k in code for k in _SUBTOTAL_KEYWORDS
    )

# ------------------------------------------------------------
# 3. 主要流程
# ------------------------------------------------------------


def convert_excel_to_csv(excel_file="IPO-1.xlsx",
                         output_file="ipo_broker_product.csv") -> str:

    # 讀取，header 在第 2 列（index=1）
    df = pd.read_excel(excel_file, header=1)

    # 合併儲存格往下補 —— 只補「代號／名稱／期間」三欄
    df[["代號", "名稱", "期間"]] = df[["代號", "名稱", "期間"]].ffill()

    # 選出券商欄（第 4 欄起）
    brokers = df.columns[3:]

    records = []
    for _, row in df.iterrows():

        # 1) 跳過「小計／合計」列
        if is_subtotal_row(row):
            continue

        # 2) 沒有「期間」代表是分類小標或表尾，也跳過
        if pd.isna(row["期間"]):
            continue

        product = choose_product(row)
        period = row["期間"]

        # 3) 展平：一券商⇢一列
        for b in brokers:
            val = row[b]
            if pd.isna(val):
                continue
            records.append({
                "broker": b,
                "product": product,
                "responsibility": int(val),
                "period": period
            })

    # 4) 整理輸出
    out = (
        pd.DataFrame.from_records(records)
        .sort_values("responsibility", ascending=False)
    )
    out.to_csv(output_file, index=False, encoding="utf-8")
    print(f"✅ 轉檔完成：{output_file}")
    return output_file


# ------------------------------------------------------------
# 4. CLI
# ------------------------------------------------------------
if __name__ == "__main__":
    ap = argparse.ArgumentParser(
        description="Convert IPO Excel to flat CSV for GitHub Pages"
    )
    ap.add_argument("src", nargs="?", default="IPO-1.xlsx",
                    help="來源 Excel 檔案（第 2 列為表頭）")
    ap.add_argument("-o", "--output", default="ipo_broker_product.csv",
                    help="輸出 CSV 檔名")
    args = ap.parse_args()
    convert_excel_to_csv(args.src, args.output)
