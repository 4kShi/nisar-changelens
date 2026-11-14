"""Shared configuration for the NISAR ChangeLens pipeline."""
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
WORK_DIR = DATA_DIR / "work"
PUBLIC_DIR = ROOT / "frontend" / "public" / "data" / "v1"

MEKONG_SEARCH_BBOX = [104.4, 8.5, 106.9, 11.2]
DTM_BBOX = [105.4, 10.4, 106.2, 10.95]  # Dong Thap Muoi (Plain of Reeds), approximate

PIPELINE_VERSION = "1.0.0"
DECREASE_DB = -3.0
INCREASE_DB = 3.0
BOXCAR = 5
MAX_GRID = 2048
BACKSCATTER_STRETCH = (-25.0, 0.0)
CHANGE_STRETCH = (-6.0, 6.0)

# Fallback local granules directory (override via NISAR_LOCAL_FALLBACK_DIR env var)
LOCAL_FALLBACK_DIR = Path(os.environ.get("NISAR_LOCAL_FALLBACK_DIR", str(RAW_DIR / "nisar_local")))
