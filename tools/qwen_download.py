"""Download official Qwen3-TTS assets into D: only; rerunnable/resumable."""
import os
import sys

_scratch = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "work", "qwen_tmp")
os.makedirs(_scratch, exist_ok=True)
sys.pycache_prefix = os.path.join(_scratch, "pycache")

from pathlib import Path
import argparse
import hashlib
import json
import shutil
import subprocess
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
SCRATCH = ROOT / "work" / "qwen_tmp"
SCRATCH.mkdir(parents=True, exist_ok=True)
for key in ("TEMP", "TMP", "TMPDIR"):
    os.environ[key] = str(SCRATCH)
os.environ["HF_HOME"] = r"D:\CodexData\models\Qwen3-TTS-cache"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
os.environ["HF_HUB_DISABLE_XET"] = "1"

def fetch_json(url):
    with urllib.request.urlopen(url, timeout=60) as response:
        return json.load(response)

def sha256(path):
    h=hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(8*1024*1024), b""):
            h.update(block)
    return h.hexdigest()

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--size", choices=["1.7B", "0.6B"], default="1.7B")
    p.add_argument("--small-only", action="store_true")
    p.add_argument("--revision", help="Override the tested official Hugging Face commit")
    args=p.parse_args()
    name=f"Qwen3-TTS-12Hz-{args.size}-CustomVoice"
    repo="Qwen/"+name
    target=Path(r"D:\CodexData\models") / name
    target.mkdir(parents=True,exist_ok=True)
    tested={"1.7B":"0c0e3051f131929182e2c023b9537f8b1c68adfe",
            "0.6B":"85e237c12c027371202489a0ec509ded67b5e4b5"}
    revision=args.revision or tested[args.size]
    files=fetch_json(f"https://huggingface.co/api/models/{repo}/tree/{revision}?recursive=true")
    records=[]
    for item in files:
        rel=item["path"]
        if item["type"] != "file" or not (rel.endswith((".json",".txt",".safetensors",".npz")) or rel=="README.md" or rel.startswith("LICENSE")):
            continue
        if args.small_only and item["size"]>10_000_000:
            continue
        out=target / rel
        out.parent.mkdir(parents=True,exist_ok=True)
        expected=item.get("lfs",{}).get("oid")
        if not out.exists() or out.stat().st_size != item["size"]:
            reused=False
            if rel=="speech_tokenizer/model.safetensors" and expected:
                sibling=Path(r"D:\CodexData\models") / f"Qwen3-TTS-12Hz-{'0.6B' if args.size=='1.7B' else '1.7B'}-CustomVoice" / rel
                if sibling.exists() and sibling.stat().st_size==item["size"] and sha256(sibling)==expected:
                    shutil.copy2(sibling,out)
                    reused=True
            if not reused:
                url=f"https://huggingface.co/{repo}/resolve/{revision}/{rel}"
                print(f"Downloading {rel} ({item['size']:,} bytes)",flush=True)
                subprocess.run(["curl.exe" if os.name=="nt" else "curl", "-L", "--fail", "--retry", "3", "--connect-timeout", "20", "--output", str(out),url],check=True)
        actual=sha256(out)
        if expected and expected!=actual:
            raise RuntimeError(f"SHA256 mismatch for {out}: {actual} != {expected}")
        records.append({"path":rel,"bytes":item["size"],"sha256":actual})
    (target / "downloaded_assets.json").write_text(json.dumps({"repo":repo,"revision":revision,"license":"Apache-2.0","files":records},indent=2),encoding="utf-8")
    print(f"Ready: {target}",flush=True)

if __name__=="__main__":
    main()
