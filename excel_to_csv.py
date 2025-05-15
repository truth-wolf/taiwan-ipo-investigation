#!/usr/bin/env python3
# excel_to_csv.py
# 把 IPO Excel（第 2 列為表頭）轉成扁平 CSV，
# 1. 補齊合併儲存格（ffill，只針對「代號／名稱」）
# 2. 濾掉「小計／合計／總計」列
# 3. 如果期間欄位原本空白，輸出 CSV 時也顯示空白

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

    # 只對「代號／名稱」欄做合併儲存格往下補
    df[["代號", "名稱"]] = df[["代號", "名稱"]].ffill()

    # 期間欄保留原樣，如果是 NaN，後面會轉成空字串
    # df["期間"] = df["期間"]  # 不做 ffill

    # 選出券商欄（第 4 欄起）
    brokers = df.columns[3:]

    records = []
    for _, row in df.iterrows():

        # 跳過「小計／合計」列
        if is_subtotal_row(row):
            continue

        product = choose_product(row)
        # 如果期間是 NaN，就用空字串
        period = row["期間"] if pd.notna(row["期間"]) else ""

        # 展平：一券商⇢一列
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

    # 整理輸出，依責任額從高到低排序
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
