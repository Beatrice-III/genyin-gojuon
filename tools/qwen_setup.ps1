param([string]$Runtime = 'D:\CodexData\runtimes\qwen-tts')
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskScratch = Join-Path $taskRoot 'work\qwen_tmp'
New-Item -ItemType Directory -Force $taskScratch | Out-Null
$env:TEMP = $taskScratch
$env:TMP = $taskScratch
$env:PIP_CACHE_DIR = Join-Path $taskRoot 'work\qwen_pip_cache'
$env:PYTHONPYCACHEPREFIX = Join-Path $taskScratch 'pycache'
$env:HF_HOME = 'D:\CodexData\models\Qwen3-TTS-cache'
if (-not (Test-Path -LiteralPath (Join-Path $Runtime 'Scripts\python.exe'))) {
    python -m venv --system-site-packages $Runtime
}
$qwenPython = Join-Path $Runtime 'Scripts\python.exe'
& $qwenPython -m pip install -r (Join-Path $PSScriptRoot 'qwen_requirements.txt')
if ($LASTEXITCODE -ne 0) { throw 'Qwen TTS dependency installation failed' }
Write-Output "Qwen runtime: $qwenPython"
