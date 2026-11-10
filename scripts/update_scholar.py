#!/usr/bin/env python3
"""Scrape the public Google Scholar profile into scholar.json.

Google Scholar has no API and blocks cross-origin requests from browsers, so the
page can't query it directly. This script runs on a schedule (see
.github/workflows/scholar.yml) and the site reads the JSON it writes.

Standard library only. Exits non-zero (without touching the JSON) if the page
can't be fetched or parsed, so a blocked request never wipes good data.
"""
import html
import json
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

USER = "5fMw68EAAAAJ"
URL = f"https://scholar.google.com/citations?user={USER}&hl=en&pagesize=100&sortby=pubdate"
OUT = Path(__file__).resolve().parent.parent / "scholar.json"
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def parse(page):
    # Stats table: [citations all, since-year, h-index all, since, i10 all, since]
    std = [int(x) for x in re.findall(r'class="gsc_rsb_std">(\d+)<', page)]
    if len(std) < 6:
        raise ValueError("stats table not found (blocked or layout changed?)")

    # Per-year chart. Bars carry z-index 1 for the newest year, 2 for the one
    # before, etc.; years with zero citations have no bar.
    years = [int(y) for y in re.findall(r'class="gsc_g_t"[^>]*>(\d{4})<', page)]
    per_year = {y: 0 for y in years}
    if years:
        last = max(years)
        for z, n in re.findall(r'class="gsc_g_a"[^>]*z-index:(\d+)[^>]*><span class="gsc_g_al">(\d+)<', page):
            y = last - int(z) + 1
            if y in per_year:
                per_year[y] = int(n)

    papers = len(re.findall(r'class="gsc_a_tr"', page))
    name = re.search(r'id="gsc_prf_in">([^<]+)<', page)

    return {
        "name": html.unescape(name.group(1)) if name else None,
        "profile": f"https://scholar.google.com/citations?user={USER}&hl=en",
        "citations": std[0],
        "citations_recent": std[1],
        "h_index": std[2],
        "h_index_recent": std[3],
        "i10_index": std[4],
        "i10_index_recent": std[5],
        "papers": papers,
        "per_year": [{"year": y, "citations": per_year[y]} for y in sorted(per_year)],
    }


def main():
    try:
        data = parse(fetch(URL))
    except Exception as e:  # noqa: BLE001
        print(f"scholar update failed: {e}", file=sys.stderr)
        return 1

    old = json.loads(OUT.read_text()) if OUT.exists() else {}
    if {k: v for k, v in old.items() if k != "updated"} == data:
        print("no change")
        return 0

    data["updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    OUT.write_text(json.dumps(data, indent=2) + "\n")
    print(f"updated: {data['citations']} citations, h={data['h_index']}, i10={data['i10_index']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
