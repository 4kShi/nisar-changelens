"""Discover NISAR L2 GCOV granules over the Mekong Delta via earthaccess/CMR.

Writes data/work/discovery.json (no credentials, no absolute paths).
Usage: python pipeline/discover.py [--max 100]
"""
from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

from config import MEKONG_SEARCH_BBOX, DTM_BBOX, WORK_DIR

COLLECTIONS = [
    ("NISAR_L2_GCOV_V1", "VALIDATED"),
    ("NISAR_L2_GCOV_PROVISIONAL_V1", "PROVISIONAL"),
]

# NISAR_L2_PR_GCOV_<cycle>_<track>_<dir>_<frame>_<mode>_<pol>_<M|..>_<start>_<end>_<CRID>_<..>
NAME_RE = re.compile(
    r"NISAR_L2_(?P<urgency>[A-Z]{2})_GCOV_(?P<cycle>\d{3})_(?P<track>\d{3})_(?P<dir>[AD])_"
    r"(?P<frame>\d{3})_(?P<mode>\d{4})_(?P<pol>[A-Z]{4})_(?P<x>[A-Z])_(?P<start>\d{8}T\d{6})_"
    r"(?P<end>\d{8}T\d{6})_(?P<crid>[A-Z]\d{5})_"
)


def parse_name(name: str) -> dict:
    m = NAME_RE.search(name)
    return m.groupdict() if m else {}


def granule_record(g, short_name: str, maturity: str) -> dict:
    umm = g["umm"]
    meta = g["meta"]
    name = umm.get("GranuleUR", "")
    links = [u["URL"] for u in umm.get("RelatedUrls", []) if u.get("URL", "").endswith(".h5")]
    size = None
    try:
        for a in umm.get("DataGranule", {}).get("ArchiveAndDistributionInformation", []):
            if a.get("Name", "").endswith(".h5"):
                s = a.get("SizeInBytes") or (a.get("Size", 0) * {"MB": 2**20, "GB": 2**30}.get(a.get("SizeUnit"), 1))
                size = int(s)
    except Exception:
        pass
    spatial = umm.get("SpatialExtent", {}).get("HorizontalSpatialDomain", {}).get("Geometry", {})
    pts = []
    for poly in spatial.get("GPolygons", []):
        pts = [(p["Longitude"], p["Latitude"]) for p in poly["Boundary"]["Points"]]
    bbox = None
    if pts:
        xs, ys = zip(*pts)
        bbox = [min(xs), min(ys), max(xs), max(ys)]
    return {
        "granule_id": name,
        "concept_id": meta.get("concept-id"),
        "provider": meta.get("provider-id"),
        "collection_short_name": short_name,
        "collection_concept_id": meta.get("collection-concept-id"),
        "maturity_from_collection": maturity,
        "temporal": umm.get("TemporalExtent", {}).get("RangeDateTime"),
        "size_bytes": size,
        "h5_urls": links[:2],
        "footprint_bbox": bbox,
        "footprint": pts,
        "parsed": parse_name(name),
    }


def overlaps(a, b) -> bool:
    return a and b and not (a[2] < b[0] or a[0] > b[2] or a[3] < b[1] or a[1] > b[3])


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--max", type=int, default=100)
    ap.add_argument("--since", default="2026-10-01")
    args = ap.parse_args()
    import earthaccess

    auth = earthaccess.login(strategy="netrc")
    out = {"queried_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
           "bbox": MEKONG_SEARCH_BBOX, "authenticated": bool(auth and auth.authenticated),
           "collections": {}, "granules": [], "pairs": []}
    remaining = args.max
    for short_name, maturity in COLLECTIONS:
        try:
            res = earthaccess.search_data(short_name=short_name, bounding_box=tuple(MEKONG_SEARCH_BBOX),
                                          temporal=(args.since, "2026-12-31"), count=remaining)
            out["collections"][short_name] = {"maturity": maturity, "hits": len(res), "error": None}
        except Exception as e:  # collection may not exist / not visible
            out["collections"][short_name] = {"maturity": maturity, "hits": 0, "error": str(e)[:300]}
            res = []
        for g in res:
            out["granules"].append(granule_record(g, short_name, maturity))
        remaining = max(0, remaining - len(res))

    groups = defaultdict(list)
    for r in out["granules"]:
        p = r["parsed"]
        if not p:
            continue
        key = (r["collection_short_name"], p["track"], p["frame"], p["dir"], p["pol"], p["crid"])
        groups[key].append(r)
    for key, items in groups.items():
        items.sort(key=lambda r: r["parsed"]["start"])
        for i in range(len(items) - 1):
            a, b = items[i], items[i + 1]
            out["pairs"].append({
                "collection": key[0], "track": key[1], "frame": key[2], "direction": key[3],
                "polarization": key[4], "crid": key[5],
                "before": a["granule_id"], "after": b["granule_id"],
                "covers_dong_thap_muoi": bool(overlaps(a["footprint_bbox"], DTM_BBOX) and overlaps(b["footprint_bbox"], DTM_BBOX)),
                "total_bytes": (a["size_bytes"] or 0) + (b["size_bytes"] or 0),
            })
    WORK_DIR.mkdir(parents=True, exist_ok=True)
    (WORK_DIR / "discovery.json").write_text(json.dumps(out, indent=1))
    print(json.dumps({"collections": out["collections"], "n_granules": len(out["granules"]),
                      "pairs": out["pairs"]}, indent=1))


if __name__ == "__main__":
    main()
