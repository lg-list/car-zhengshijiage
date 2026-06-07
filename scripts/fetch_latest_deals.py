#!/usr/bin/env python3
"""
Update data/latest-deals.json from public lead sources.

This script is intentionally conservative:
- It only reads public URLs configured in data/sources.json.
- It never stores personal information, VINs, phone numbers, or addresses.
- Public web leads are saved as verification="pending" until manually reviewed.
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
SOURCES_PATH = DATA_DIR / "sources.json"
DEALS_PATH = DATA_DIR / "latest-deals.json"

PRICE_RE = re.compile(r"\$?\b([2-9][0-9],[0-9]{3}|[2-9][0-9]{3,4})\b")
YEAR_RE = re.compile(r"\b(202[4-9])\b")
TRIM_RE = re.compile(r"\b(LE|SE|XLE|XSE|XL|XLT|Lariat|Limited|Premium|Sport|Base|Long Range|Performance)\b", re.I)


def read_json(path: Path, fallback: dict[str, Any]) -> dict[str, Any]:
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def fetch_url(url: str) -> str:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "AutoLedgerBot/0.1 (+https://www.autoleledger.com/methodology.html)",
            "Accept": "application/json,text/plain,text/html;q=0.9,*/*;q=0.8",
        },
    )
    with urllib.request.urlopen(request, timeout=20) as response:
        return response.read().decode("utf-8", errors="ignore")


def collect_texts(raw: str) -> list[str]:
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        return [raw]

    texts: list[str] = []

    def walk(value: Any) -> None:
        if isinstance(value, dict):
            for key, child in value.items():
                if key in {"title", "selftext", "body", "text", "description"} and isinstance(child, str):
                    texts.append(child)
                else:
                    walk(child)
        elif isinstance(value, list):
            for child in value:
                walk(child)

    walk(payload)
    return texts


def parse_leads(source: dict[str, Any], raw: str) -> list[dict[str, Any]]:
    leads: list[dict[str, Any]] = []
    for text in collect_texts(raw):
        lower = text.lower()
        if not any(token in lower for token in ["otd", "out the door", "out-the-door", "落地", "paid", "price"]):
            continue

        prices = [int(match.group(1).replace(",", "")) for match in PRICE_RE.finditer(text)]
        prices = [price for price in prices if 15000 <= price <= 150000]
        if not prices:
            continue

        out_the_door = max(prices)
        vehicle_price = min(prices)
        year_match = YEAR_RE.search(text)
        trim_match = TRIM_RE.search(text)
        fingerprint = hashlib.sha256(f"{source['url']}|{text[:240]}|{out_the_door}".encode("utf-8")).hexdigest()[:16]

        leads.append(
            {
                "id": fingerprint,
                "brand": source["brand"],
                "model": source["model"],
                "modelName": source["modelName"],
                "year": int(year_match.group(1)) if year_match else datetime.now(timezone.utc).year,
                "trim": trim_match.group(1).upper() if trim_match else source.get("defaultTrim", "Base"),
                "city": source.get("city", "Public"),
                "state": source.get("state", "US"),
                "purchaseDate": datetime.now(timezone.utc).strftime("%Y-%m"),
                "msrp": 0,
                "dealerQuote": 0,
                "vehiclePrice": vehicle_price,
                "outTheDoorPrice": out_the_door,
                "sourceType": "public_lead",
                "verification": "pending",
                "sourceUrl": source["url"],
            }
        )

    return leads


def merge_records(existing: list[dict[str, Any]], incoming: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_key: dict[str, dict[str, Any]] = {}
    for record in existing + incoming:
        key = record.get("id") or "|".join(
            str(record.get(field, "")) for field in ["brand", "model", "trim", "city", "purchaseDate", "vehiclePrice", "outTheDoorPrice", "sourceUrl"]
        )
        by_key[key] = record

    return sorted(by_key.values(), key=lambda row: (row.get("purchaseDate", ""), row.get("modelName", "")), reverse=True)


def main() -> int:
    sources_payload = read_json(SOURCES_PATH, {"sources": []})
    current_payload = read_json(DEALS_PATH, {"records": []})
    incoming: list[dict[str, Any]] = []

    for source in sources_payload.get("sources", []):
        try:
            incoming.extend(parse_leads(source, fetch_url(source["url"])))
        except Exception as exc:  # Keep daily jobs resilient when a source blocks or changes.
            print(f"source failed: {source.get('name', source.get('url'))}: {exc}", file=sys.stderr)

    payload = {
        "updatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "records": merge_records(current_payload.get("records", []), incoming),
    }
    write_json(DEALS_PATH, payload)
    print(f"wrote {len(payload['records'])} records to {DEALS_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
