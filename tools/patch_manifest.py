# Script to edit AndroidManifest.xml and add SYSTEM_ALERT_WINDOW permission required for MalumMenu-Android

import pathlib
import sys

folder = pathlib.Path(sys.argv[1])
manifest = folder / "AndroidManifest.xml"

content = manifest.read_text()
if "android.permission.SYSTEM_ALERT_WINDOW" not in content:
    content = content.replace("<application", '<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>\n    <application', 1)
    manifest.write_text(content)
    print("[+] Added SYSTEM_ALERT_WINDOW permission to AndroidManifest.xml")
else:
    print("[!] AndroidManifest.xml already has SYSTEM_ALERT_WINDOW permission")
