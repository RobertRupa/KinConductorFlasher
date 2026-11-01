# KinConductorFlasher

Browser-based factory firmware installer for [KinConductor](https://github.com/RobertRupa/KinConductor) (ESP32 / KinCony), using ESP Web Tools.

**Web UI (after Pages activation):** https://robertrupa.github.io/KinConductorFlasher/

## Features
- Firmware build-profile and published version selection.
- Chrome/Edge Web Serial flashing over USB from HTTPS.
- Downloads available stable upstream releases (including older versions) during GitHub Actions deployment, verifying each available build profile.
- SHA-256, manifest, size and offset verification before offering firmware.
- Installs matching `firmware.factory.bin` at `0x0` **and** `littlefs.bin` at `0x310000`.
- Clear warning and confirmation before factory installation.

## WARNING — destructive factory installation
The merged factory image can overwrite **NVS (including credentials/calibration) and OTA metadata**. This is for first installation or deliberate recovery, **not routine NVS-preserving updates**. Disconnect unsafe loads from relays, back up settings and verify the serial port before proceeding. ESP Web Tools may reset the device. Never disconnect USB during flash.

For routine updates use supported KinConductor OTA or the matching PlatformIO `upload` and `uploadfs`, following [upstream release instructions](https://github.com/RobertRupa/KinConductor/blob/master/docs/releases.md). Do not assume that serial writing `firmware.bin` at `0x10000` updates the currently selected OTA slot.

The profiles `kc868-a4`, `kc868-a8`, `kc868-a8s`, `kc868-a16`, `kc868-a32`, `kc868-a64`, `kc868-a128` are **A6 pin-map aliases** and are not electrically validated for their corresponding boards. The `kc868-a6-coprocessor` profile does not implement a Thread/Zigbee stack.

## Enable GitHub Pages
In this repository's **Settings → Pages**, set **Build and deployment → Source: GitHub Actions**. The `.github/workflows/pages.yml` workflow deploys after pushes to main and rechecks upstream releases daily. Verify the deployment result in the Actions tab. The initial deployment will not be publicly reachable until Pages is enabled.

## Run locally
```bash
python3 scripts/build_catalog.py
python3 -m http.server 8000 --directory site
```
Then visit http://localhost:8000 using desktop Chrome/Edge with Web Serial. Internet access is needed to stage release images, and to load the ESP Web Tools component.

## Supply-chain validation
The build downloads only complete published stable releases from `RobertRupa/KinConductor`; rejects incomplete/mismatched archives, invalid metadata, incorrect offsets/lengths and SHA-256 mismatches. A failed verification aborts publishing. Generated files in `site/` are build outputs.

ESP Web Tools is loaded from the public unpkg CDN; binaries originate from upstream GitHub Releases.

## Older firmware versions

The Version selector includes stable KinConductor releases with packaged firmware archives. Different versions may offer different profiles: v1.1.4 provides ten profiles, whereas v1.1.2 and v1.1.3 provide the A6 and A6-coprocessor packages. The install action stays disabled if that version/profile combination does not exist. Each published image is verified against its release SHA-256 manifest before staging.

## Custom PlatformIO builds

The **Custom PlatformIO build** section lets you pick an upstream branch/tag (`source_ref`), PlatformIO environment (`profile`) and extra C/C++ macro definitions (`custom_defines`). The page produces a ready-to-run `gh workflow run custom-build.yml` command; no GitHub credentials are collected by the page. You can also configure the same inputs in [Actions → Custom KinConductor firmware build → Run workflow](https://github.com/RobertRupa/KinConductorFlasher/actions/workflows/custom-build.yml).

After the run succeeds, download the GitHub Actions artifact containing `firmware.bin`, `littlefs.bin`, bootloader, partition table and SHA-256 checksums. **Custom artifacts are not automatically loaded into the browser flasher** and must not be treated as validated factory images. Review selected flags, partition layout and image sizes before attempting an upload. Custom compilation is independent of the GitHub Pages deployment.
