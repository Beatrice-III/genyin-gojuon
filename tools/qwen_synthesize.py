"""Local expressive narration using official Qwen3-TTS CustomVoice 1.7B.

Usage: python tools/qwen_synthesize.py --manifest path.json --output path
The JSON is a list of {id,text,speaker?,instruct?,seed?}; defaults fit the demo.
"""
import os
import sys

_scratch = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "work", "qwen_tmp")
os.makedirs(_scratch, exist_ok=True)
sys.pycache_prefix = os.path.join(_scratch, "pycache")

from pathlib import Path
import argparse
import json
import time

if hasattr(sys.stdout,"reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
SCRATCH = ROOT / "work" / "qwen_tmp"
SCRATCH.mkdir(parents=True, exist_ok=True)
for key in ("TEMP", "TMP", "TMPDIR"):
    os.environ[key] = str(SCRATCH)
os.environ["HF_HOME"] = r"D:\CodexData\models\Qwen3-TTS-cache"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["PYTHONPYCACHEPREFIX"] = str(SCRATCH / "pycache")
os.environ["NUMBA_CACHE_DIR"] = str(SCRATCH / "numba")
os.environ["TORCH_HOME"] = str(SCRATCH / "torch")
os.environ["XDG_CACHE_HOME"] = str(SCRATCH / "cache")
os.environ["CUDA_CACHE_PATH"] = str(SCRATCH / "cuda")
sys.pycache_prefix = str(SCRATCH / "pycache")

PERSONA = (
    "自然、亲近的年轻女生，像坐在旁边一起学日语的朋友。"
    "使用标准普通话，口语化表达，语速中等，句内有自然停顿，"
    "语气轻松、有一点好奇心，提问时有交流感，重点词轻轻强调。"
    "声音清晰温暖，不用播报腔，不夸张撒娇，不拖长尾音。"
)

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--manifest", type=Path, required=True)
    p.add_argument("--output", type=Path, required=True)
    p.add_argument("--model", default=r"D:\CodexData\models\Qwen3-TTS-12Hz-1.7B-CustomVoice")
    p.add_argument("--attention", choices=["sdpa", "eager"], default="sdpa")
    p.add_argument("--batch-size", type=int, choices=[1,2,4], default=1)
    p.add_argument("--inventory", action="store_true", help="Read app inventory object's entries and map ja/zh voices")
    p.add_argument("--overwrite", action="store_true")
    args = p.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    items = json.loads(args.manifest.read_text(encoding="utf-8-sig"))
    if args.inventory:
        items=[{
            "id":x["id"], "text":x["text"],
            "language":"Japanese" if x["lang"]=="ja" else "Chinese",
            "speaker":"Ono_Anna" if x["lang"]=="ja" else "Serena",
            "instruct":"", "max_new_tokens":192,
        } for x in items["entries"]]
    if any(not str(x["text"]).strip() for x in items):
        raise ValueError("Empty speech text exists in input manifest")

    import torch
    import soundfile as sf
    import numpy as np
    from qwen_tts import Qwen3TTSModel

    if not torch.cuda.is_available():
        raise RuntimeError("CUDA GPU is required by this local production configuration")
    torch.set_num_threads(4)
    start = time.monotonic()
    model = Qwen3TTSModel.from_pretrained(
        args.model, device_map="cuda:0", dtype=torch.bfloat16,
        attn_implementation=args.attention,
    )
    import importlib.metadata
    (args.output / "runtime.json").write_text(json.dumps({
        "model":args.model,"dtype":"bfloat16","attention":args.attention,
        "torch":torch.__version__,"cuda":torch.version.cuda,
        "qwen_tts":importlib.metadata.version("qwen-tts"),
        "transformers":importlib.metadata.version("transformers"),
        "gpu":torch.cuda.get_device_name(),
    },ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps({"event":"loaded", "seconds":time.monotonic()-start,
          "torch":torch.__version__, "cuda":torch.version.cuda,
          "gpu":torch.cuda.get_device_name(),
          "vram_MiB":torch.cuda.memory_allocated()/1048576,
          "speakers":model.get_supported_speakers()}, ensure_ascii=False), flush=True)
    report=args.output / "synthesis.json"
    results=json.loads(report.read_text(encoding="utf-8")) if report.exists() else []
    pending=[x for x in items if args.overwrite or not (args.output/(x["id"]+".wav")).exists()]
    for index in range(0,len(pending),args.batch_size):
        batch=pending[index:index+args.batch_size]
        seed=int(batch[0].get("seed", 2200+index))
        torch.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)
        print(json.dumps({"event":"batch_started","ids":[x["id"] for x in batch]},ensure_ascii=False),flush=True)
        began=time.monotonic()
        wavs,sr=model.generate_custom_voice(
            text=[x["text"] for x in batch],
            language=[x.get("language", "Chinese") for x in batch],
            speaker=[x.get("speaker", "Serena") for x in batch],
            instruct=[x.get("instruct", PERSONA) for x in batch],
            non_streaming_mode=True,
            max_new_tokens=max(int(x.get("max_new_tokens",640)) for x in batch),
            temperature=0.75, top_p=0.95, repetition_penalty=1.05,
        )
        elapsed=time.monotonic()-began
        for item,raw in zip(batch,wavs):
            out=args.output/(item["id"]+".wav")
            wave=np.asarray(raw,dtype=np.float32)
            if not len(wave) or not np.isfinite(wave).all():
                raise RuntimeError(f"Invalid synthesized wave: {item['id']}")
            sf.write(out,wave,sr,subtype="PCM_24")
            result={**item, "speaker":item.get("speaker", "Serena"), "batch_seed":seed,
                    "file":str(out), "sample_rate":sr, "duration":len(wave)/sr,
                    "batch_size":len(batch), "batch_generation_seconds":elapsed,
                    "peak":float(np.abs(wave).max()),
                    "peak_vram_MiB":torch.cuda.max_memory_allocated()/1048576}
            results=[r for r in results if r["id"]!=item["id"]]+[result]
            print(json.dumps(result,ensure_ascii=False),flush=True)
        report.write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding="utf-8")
    (args.output / "persona.txt").write_text(PERSONA,encoding="utf-8")

if __name__ == "__main__":
    main()
