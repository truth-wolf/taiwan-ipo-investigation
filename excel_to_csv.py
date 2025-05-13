#!/usr/bin/env python3
# excel_to_csv.py
# 將「第 2 列為表頭」的 Excel 轉成扁平 CSV，並自動填充合併儲存格

import argparse
import re
import sys
from pathlib import Path

import pandas as pd

# PID 正則：3–5 位數字，可選英文字母或尾部 B
PID_RE = re.compile(r"\d{3,5}[A-Za-z]?(B)?")

def choose_product(row) -> str:
    """
    依 row["募集"] 或 row["名稱"] 選擇 product，
    若募集欄符合 PID_RE 就用之，否則用名稱。
    """
    pid   = str(row.get("募集") or "").strip()
    pname = str(row.get("名稱") or "").strip()
    return pid if PID_RE.fullmatch(pid) else (pid or pname)

def convert_excel_to_csv(src: Path, dest: Path) -> None:
    # 1) 讀 Excel（第 2 列為 header）
    df = pd.read_excel(src, header=1)

    # 2) 清洗欄位名稱：去掉換行與首尾空白
    df.columns = (
        df.columns
          .astype(str)
          .str.replace(r"[\r\n]", "", regex=True)
          .str.strip()
    )

    # 3) 向下填滿所有欄位的 NaN（處理合併儲存格）
    df.ffill(axis=0, inplace=True)

    # 4) 券商欄位，假設從第 4 欄起都是券商
    brokers = df.columns[3:]

    records = []
    for _, row in df.iterrows():
        for b in brokers:
            val = row.get(b)
            if pd.isna(val):
                continue
            records.append({
                "broker":         b.strip(),
                "product":        choose_product(row),
                "responsibility": int(val),
                "period":         str(row.get("期間") or "").strip()
            })

    # 5) 建 DataFrame，過濾空 period，再依 responsibility 排序
    out = (
        pd.DataFrame(records)
          .query("period == period")  # 避掉 NaN period
          .sort_values("responsibility", ascending=False)
    )

    # 6) 輸出 CSV
    out.to_csv(dest, index=False, encoding="utf-8")
    print(f"✅ 轉檔完成：{dest}")

if __name__ == "__main__":
    ap = argparse.ArgumentParser(
        description="Convert IPO Excel to flat CSV for GitHub Pages"
    )
    ap.add_argument(
        "src",
        nargs="?",
        default="IPO-1.xlsx",
        help="來源 Excel 檔（第2列為欄位），預設 IPO-1.xlsx"
    )
    ap.add_argument(
        "-o", "--output",
        default="ipo_broker_product.csv",
        help="輸出 CSV 檔，預設 ipo_broker_product.csv"
    )
    args = ap.parse_args()

    src  = Path(args.src)
    dest = Path(args.output)
    if not src.exists():
        print(f"❌ 找不到檔案：{src}", file=sys.stderr)
        sys.exit(1)

    convert_excel_to_csv(src, dest)
