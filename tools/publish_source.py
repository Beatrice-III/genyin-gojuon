"""Validate/export a public source bundle from an explicit allowlist.

This tool never publishes to a remote service, reads credential stores, or
copies work/, outputs/, signing identities, model weights or private backups.
Default outputs: work/github/source/ and outputs/Genyin-Gojuon-source.zip.
"""
from __future__ import annotations

import argparse
import ast
import hashlib
import json
from pathlib import Path
import re
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[1]
EXACT = (
    '.gitignore', 'README.md', 'LICENSE', 'NOTICE', 'THIRD_PARTY.md',
    'index.html', '启动应用.bat', 'record_bilibili_video.py',
    'android/AndroidManifest.xml', 'android/README.md', 'android/build_apk.py',
    'assets/fonts/SourceKana.woff2', 'assets/fonts/OFL.txt',
    'assets/audio/LICENSE',
    '.github/workflows/source-check.yml',
)
GLOBS = (
    'css/*.css', 'js/*.js', 'android/src/**/*.java', 'android/res/**/*.xml',
    'android/res/**/*.png', 'tools/*.py', 'tools/*.cjs', 'tools/*.ps1',
    'tools/*.json', 'tools/*.md', 'tools/*requirements.txt', 'tools/*runtime_lock.txt',
    'assets/audio/*.json', 'assets/audio/*.md',
    'docs/images/*.png', 'docs/images/*.webp', 'docs/images/*.jpg', 'docs/images/*.jpeg',
)
FORBIDDEN_SUFFIXES = {'.jks', '.keystore', '.p12', '.pfx', '.pem', '.key',
                      '.apk', '.aab', '.mp4', '.wav', '.mp3', '.safetensors'}
EXCLUDED_SOURCES = {'tools/pack_course_audio.py', 'docs/images/intro-cover.png'}
TOKEN_PATTERN = re.compile(r'(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)')
SECRET_NAME = re.compile(r'PASSWORD|PASSWD|TOKEN|SECRET', re.I)


def validate_course_manifest(require_audio: bool = False) -> None:
    manifest_path = ROOT / 'assets/audio/manifest.json'
    if not manifest_path.is_file():
        raise RuntimeError('Complete course audio manifest is required')
    manifest = json.loads(manifest_path.read_text(encoding='utf-8-sig'))
    if manifest.get('complete') is not True or manifest.get('provider') != 'Microsoft Edge TTS':
        raise RuntimeError('Course manifest must declare the actual complete Microsoft Edge TTS source')
    references = set()
    for language in ('audio', 'chinese'):
        mapping = manifest.get(language)
        if not isinstance(mapping, dict) or not mapping:
            raise RuntimeError('Audio manifest is missing ' + language)
        for value in mapping.values():
            file_path = value if isinstance(value, str) else value.get('path', '') if isinstance(value, dict) else ''
            if not re.fullmatch(r'assets/audio/(?:ja|zh)/[A-Za-z0-9_-]+\.mp3', file_path):
                raise RuntimeError('Audio manifest contains an unexpected local path')
            references.add(file_path)
    recorded = set()
    for record in manifest.get('records', []):
        relative = record.get('path', '')
        if relative not in references or relative in recorded:
            raise RuntimeError('Course audio records are incomplete or contain duplicates')
        if record.get('lang') not in ('ja', 'zh') or ('/' + record['lang'] + '/') not in relative:
            raise RuntimeError('Course audio record language does not match its directory')
        if not re.fullmatch(r'[0-9a-f]{64}', record.get('sha256', '')):
            raise RuntimeError('Course recording is missing a valid SHA-256: ' + relative)
        if require_audio:
            path = ROOT / relative
            if not path.is_file() or path.stat().st_size < 100:
                raise RuntimeError('Missing local course recording: ' + relative)
            if hashlib.sha256(path.read_bytes()).hexdigest() != record['sha256']:
                raise RuntimeError('Local course recording hash mismatch: ' + relative)
        recorded.add(relative)
    if recorded != references:
        raise RuntimeError('Every course audio reference must have a manifest record')


def source_files(require_audio: bool = False) -> list[Path]:
    selected = {ROOT / name for name in EXACT if (ROOT / name).is_file()}
    for pattern in GLOBS:
        selected.update(p for p in ROOT.glob(pattern) if p.is_file())
    validate_course_manifest(require_audio)
    selected = {p for p in selected if p.relative_to(ROOT).as_posix() not in EXCLUDED_SOURCES}
    return sorted(selected, key=lambda p: p.relative_to(ROOT).as_posix())


def check_sources(files: list[Path]) -> None:
    required = ('index.html', 'README.md', 'LICENSE', 'THIRD_PARTY.md',
                'android/build_apk.py', 'tools/publish_source.py')
    missing = [name for name in required if ROOT / name not in files]
    if missing:
        raise RuntimeError('Missing public source files: ' + ', '.join(missing))
    failures = []
    for source in files:
        relative = source.relative_to(ROOT).as_posix()
        if source.is_symlink() or ROOT.resolve() not in source.resolve().parents:
            failures.append(relative + ': symbolic link or path outside source root')
            continue
        if source.suffix.lower() in FORBIDDEN_SUFFIXES:
            failures.append(relative + ': forbidden private or generated file type')
            continue
        if source.stat().st_size > 20 * 1024 * 1024:
            failures.append(relative + ': unexpected source file larger than 20 MiB')
        if source.suffix.lower() in {'.woff2', '.png', '.webp', '.jpg', '.jpeg'}:
            continue
        content = source.read_text(encoding='utf-8-sig')
        if TOKEN_PATTERN.search(content):
            failures.append(relative + ': credential-like content; value suppressed')
        if source.suffix == '.py':
            tree = ast.parse(content, filename=relative)
            for node in ast.walk(tree):
                if (isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute)
                        and isinstance(node.func.value, ast.Attribute)
                        and node.func.value.attr == 'environ'
                        and node.func.attr == 'get' and len(node.args) >= 2
                        and isinstance(node.args[0], ast.Constant)
                        and isinstance(node.args[0].value, str)
                        and SECRET_NAME.search(node.args[0].value)
                        and isinstance(node.args[1], ast.Constant)
                        and node.args[1].value):
                    failures.append(relative + ': nonempty hardcoded secret fallback; value suppressed')
    if failures:
        raise RuntimeError('Public source validation failed:\n' + '\n'.join(failures))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='validate without creating files')
    parser.add_argument('--require-audio', action='store_true', help='also verify every local course recording (binaries are never exported)')
    parser.add_argument('--stage', default='work/github/source')
    parser.add_argument('--archive', default='outputs/Genyin-Gojuon-source.zip')
    args = parser.parse_args()
    files = source_files(require_audio=not args.check or args.require_audio)
    check_sources(files)
    manifest = {
        'format': 'genyin.public-source.v1',
        'files': [{'path': p.relative_to(ROOT).as_posix(), 'bytes': p.stat().st_size,
                   'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in files],
        'exclusions': ['signing keys and credentials', 'work and outputs',
                       'model weights', 'all Microsoft-service audio binaries',
                       'unused Qwen course-audio packaging experiment',
                       'legacy duplicated android/assets web sources'],
    }
    if args.check:
        print(f'Public source allowlist passed: {len(files)} files')
        return
    stage = (ROOT / args.stage).resolve()
    archive = (ROOT / args.archive).resolve()
    allowed_stage = (ROOT / 'work' / 'github').resolve()
    if ROOT.resolve() not in allowed_stage.parents or allowed_stage not in stage.parents:
        raise RuntimeError('Stage must be a dedicated subdirectory of work/github/')
    if (ROOT / 'outputs').resolve() not in archive.parents or archive.suffix != '.zip':
        raise RuntimeError('Archive must be a .zip file inside outputs/')
    if stage.exists():
        raise RuntimeError('Stage already exists; select a new export directory')
    stage.mkdir(parents=True)
    for source in files:
        destination = stage / source.relative_to(ROOT)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
    (stage / 'SOURCE_MANIFEST.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    archive.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as bundle:
        for source in sorted(stage.rglob('*')):
            if source.is_file():
                bundle.write(source, 'genyin-gojuon/' + source.relative_to(stage).as_posix())
    with zipfile.ZipFile(archive) as bundle:
        if bundle.testzip() is not None:
            raise RuntimeError('Source archive integrity check failed')
    print(f'Exported {len(files)} source files and source manifest')
    print('Archive: ' + str(archive))
    print('SHA-256: ' + hashlib.sha256(archive.read_bytes()).hexdigest())


if __name__ == '__main__':
    main()
