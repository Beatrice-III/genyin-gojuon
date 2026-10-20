"""Build and verify the offline APK using the installed Android SDK, without Gradle.
All intermediate files stay in this project's work/android-build directory.
The existing V1 signing key is reused; it is never regenerated or overwritten.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import subprocess
import zipfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ANDROID = ROOT / 'android'
ANDROID_NS = '{http://schemas.android.com/apk/res/android}'


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def safe_clean(directory):
    resolved = directory.resolve()
    task_work = (ROOT / 'work').resolve()
    if resolved == task_work or task_work not in resolved.parents:
        raise RuntimeError('Refusing cleanup outside a dedicated task work subdirectory')
    if resolved.exists():
        shutil.rmtree(resolved)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sdk', default=os.environ.get('ANDROID_SDK_ROOT', r'C:\Android'))
    parser.add_argument('--java', default=os.environ.get('JAVA_HOME', r'C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot'))
    parser.add_argument('--output', default='outputs/v3/源音五十音-3.0.0.apk')
    parser.add_argument('--report', default='outputs/v3/APK验证.json')
    parser.add_argument('--keystore', type=Path, default=ANDROID / 'genyin-release.jks')
    parser.add_argument('--key-alias', default='genyin')
    parser.add_argument('--debug', action='store_true', help='Generate a disposable development signing identity and independent .dev package')
    parser.add_argument('--keep-work', action='store_true')
    args = parser.parse_args()
    sdk, java = Path(args.sdk), Path(args.java)
    tools = sdk / 'build-tools' / '36.0.0'
    platform = sdk / 'platforms' / 'android-36' / 'android.jar'
    work = ROOT / 'work' / 'android-build'
    output, report_path = (ROOT / args.output).resolve(), (ROOT / args.report).resolve()
    for deliverable in (output, report_path):
        if ROOT not in deliverable.parents or not any(p in ('outputs', 'work') for p in deliverable.relative_to(ROOT).parts):
            raise RuntimeError('Build output must be inside this project outputs/ or work/')
        deliverable.parent.mkdir(parents=True, exist_ok=True)
    for executable in (tools / 'aapt2.exe', tools / 'd8.bat', tools / 'zipalign.exe', tools / 'apksigner.bat', java / 'bin/javac.exe', platform):
        if not executable.exists():
            raise FileNotFoundError(executable)
    key = args.keystore
    if not args.debug and not key.is_file():
        raise FileNotFoundError('The original signing key is required for compatible updates.')
    if not args.debug and not os.environ.get('GENYIN_KEYSTORE_PASSWORD'):
        raise RuntimeError('Release signing requires GENYIN_KEYSTORE_PASSWORD; use --debug for a public-source development build.')
    audio_manifest_path = ROOT / 'assets/audio/manifest.json'
    audio_manifest = json.loads(audio_manifest_path.read_text('utf-8')) if audio_manifest_path.is_file() else {}
    if not args.debug:
        if audio_manifest.get('complete') is not True or not audio_manifest.get('audio') or not audio_manifest.get('chinese'):
            raise RuntimeError('A complete offline course audio manifest is required for release.')
        for record in audio_manifest.get('records', []):
            source = ROOT / record['path']
            if not source.is_file() or digest(source) != record['sha256']:
                raise RuntimeError('Offline course recording is missing or changed: ' + record['path'])
    safe_clean(work)
    work.mkdir(parents=True)
    temp = work / 'tmp'
    temp.mkdir()
    env = dict(os.environ, JAVA_HOME=str(java), TEMP=str(temp), TMP=str(temp), TMPDIR=str(temp), PYTHONIOENCODING='utf-8')
    env['PATH'] = str(java / 'bin') + os.pathsep + env.get('PATH', '')
    env['JAVA_TOOL_OPTIONS'] = '-Djava.io.tmpdir=' + str(temp)
    log = []

    def run(label, command):
        result = subprocess.run([str(a) for a in command], cwd=work, env=env, capture_output=True, text=True, encoding='utf-8', errors='replace')
        log.append({'step': label, 'exitCode': result.returncode, 'stdout': result.stdout.strip(), 'stderr': result.stderr.strip()})
        print(label + ': ' + ('OK' if result.returncode == 0 else 'FAILED'), flush=True)
        if result.returncode:
            raise RuntimeError(label + '\n' + result.stdout + '\n' + result.stderr)
        return result.stdout

    shutil.copytree(ANDROID / 'res', work / 'res')
    shutil.copytree(ANDROID / 'src', work / 'src')
    shutil.copy2(ANDROID / 'AndroidManifest.xml', work / 'AndroidManifest.xml')
    if args.debug:
        debug_manifest = ET.parse(work / 'AndroidManifest.xml')
        debug_manifest.getroot().set('package', 'com.genyin.gojuon.dev')
        debug_manifest.getroot().find('application').set(ANDROID_NS + 'debuggable', 'true')
        activity = debug_manifest.getroot().find('application/activity')
        activity.set(ANDROID_NS + 'name', 'com.genyin.gojuon.MainActivity')
        debug_manifest.write(work / 'AndroidManifest.xml', encoding='utf-8', xml_declaration=True)
    # Keep command-line paths ASCII/relative; tools can use a Unicode working directory.
    if args.debug:
        env['GENYIN_SIGNING_PASSWORD'] = secrets.token_urlsafe(28)
        run('Create disposable development key', [java / 'bin/keytool.exe', '-genkeypair', '-keystore', 'release.jks', '-storepass:env', 'GENYIN_SIGNING_PASSWORD', '-keypass:env', 'GENYIN_SIGNING_PASSWORD', '-alias', args.key_alias, '-keyalg', 'RSA', '-keysize', '2048', '-validity', '3650', '-dname', 'CN=Genyin Development'])
    else:
        shutil.copy2(key, work / 'release.jks')
        env['GENYIN_SIGNING_PASSWORD'] = os.environ['GENYIN_KEYSTORE_PASSWORD']
    web = work / 'assets/www'
    web.mkdir(parents=True)
    shutil.copy2(ROOT / 'index.html', web / 'index.html')
    for name in ('css', 'js', 'assets', 'audio', 'fonts'):
        if (ROOT / name).is_dir():
            def ignore_assets(directory, names):
                ignored = {n for n in names if n == '__pycache__' or n.endswith('.map') or n == '.DS_Store'}
                if audio_manifest.get('complete') and Path(directory).resolve() == (ROOT / 'assets/audio').resolve():
                    ignored.add('kana')
                return ignored
            shutil.copytree(ROOT / name, web / name, ignore=ignore_assets)
    for name in ('gen', 'classes', 'dex'):
        (work / name).mkdir()
    run('Compile Android resources', [tools / 'aapt2.exe', 'compile', '--dir', 'res', '-o', 'compiled_res.zip'])
    run('Link Android resources', [tools / 'aapt2.exe', 'link', '-o', 'unsigned.apk', '-I', platform,
        '--manifest', 'AndroidManifest.xml', '-A', 'assets', '--java', 'gen', 'compiled_res.zip'])
    source_paths = [p.relative_to(work).as_posix() for folder in ('src', 'gen') for p in (work / folder).rglob('*.java')]
    (work / 'sources.txt').write_text('\n'.join(source_paths), encoding='utf-8')
    run('Compile Java with warnings', [java / 'bin/javac.exe', '--release', '11', '-Xlint:all', '-encoding', 'UTF-8', '-cp', platform, '-d', 'classes', '@sources.txt'])
    class_paths = [p.relative_to(work).as_posix() for p in (work / 'classes').rglob('*.class')]
    run('Compile DEX', [tools / 'd8.bat', '--release', '--lib', platform, '--min-api', '24', '--output', 'dex', *class_paths])
    with zipfile.ZipFile(work / 'unsigned.apk', 'a', compression=zipfile.ZIP_DEFLATED) as archive:
        for dex in (work / 'dex').glob('*.dex'):
            archive.write(dex, dex.name)
    run('Align APK', [tools / 'zipalign.exe', '-f', '-P', '16', '4', 'unsigned.apk', 'aligned.apk'])
    run('Sign APK', [tools / 'apksigner.bat', 'sign', '--ks', 'release.jks', '--ks-key-alias', args.key_alias,
        '--ks-pass', 'env:GENYIN_SIGNING_PASSWORD', '--key-pass', 'env:GENYIN_SIGNING_PASSWORD', '--out', 'signed.apk', 'aligned.apk'])
    signature = run('Verify signature', [tools / 'apksigner.bat', 'verify', '--verbose', '--print-certs', 'signed.apk'])
    run('Verify ZIP alignment', [tools / 'zipalign.exe', '-c', '-P', '16', '4', 'signed.apk'])
    metadata = run('Inspect package', [tools / 'aapt2.exe', 'dump', 'badging', 'signed.apk'])
    manifest = ET.parse(work / 'AndroidManifest.xml').getroot()
    permissions = [p.attrib.get(ANDROID_NS + 'name') for p in manifest.findall('uses-permission')]
    assert 'android.permission.INTERNET' not in permissions
    asset_hashes = {}
    with zipfile.ZipFile(work / 'signed.apk') as archive:
        assert archive.testzip() is None, 'Corrupt APK ZIP member'
        for source in web.rglob('*'):
            if source.is_file():
                name = 'assets/www/' + source.relative_to(web).as_posix()
                bundled = archive.read(name)
                assert bundled == source.read_bytes(), 'Asset mismatch: ' + name
                asset_hashes[name] = hashlib.sha256(bundled).hexdigest()
    certificate = re.search(r'Signer #1 certificate SHA-256 digest: ([0-9a-f]+)', signature).group(1)
    original = ROOT / '源音五十音.apk'
    upgrade_compatible = None
    if original.is_file() and not args.debug:
        old_signature = run('Verify inherited signing identity', [tools / 'apksigner.bat', 'verify', '--print-certs', original])
        old_certificate = re.search(r'Signer #1 certificate SHA-256 digest: ([0-9a-f]+)', old_signature).group(1)
        upgrade_compatible = certificate == old_certificate
        assert upgrade_compatible, 'Signing identity changed; refusing incompatible release'
    shutil.copy2(work / 'signed.apk', output)
    summary = {
        'apk': str(output), 'versionName': manifest.attrib[ANDROID_NS + 'versionName'],
        'versionCode': int(manifest.attrib[ANDROID_NS + 'versionCode']), 'package': manifest.attrib['package'],
        'minSdk': 24, 'targetSdk': 36, 'sha256': digest(output), 'sizeBytes': output.stat().st_size,
        'signingCertificateSha256': certificate, 'sameSigningIdentityAsInheritedApk': upgrade_compatible,
        'signatureVerified': True, 'zipAlignment16kVerified': True, 'zipIntegrityVerified': True,
        'bundledAssetCount': len(asset_hashes), 'bundledAssetsMatchSource': True, 'assetSha256': asset_hashes,
        'permissions': permissions, 'packageMetadata': metadata, 'buildSteps': log,
        'validationBoundary': 'The direct SDK build has javac warnings enabled; Android Lint/Gradle was not run. Device runtime checks are recorded separately.'
    }
    report_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
    print('APK: ' + str(output), flush=True)
    print('SHA-256: ' + summary['sha256'], flush=True)
    print('Assets verified: ' + str(len(asset_hashes)), flush=True)
    if not args.keep_work:
        safe_clean(work)


if __name__ == '__main__':
    main()
