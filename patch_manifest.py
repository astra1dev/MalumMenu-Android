# Script to edit AndroidManifest.xml and add SYSTEM_ALERT_WINDOW permission required for MalumMenu-Android

import pathlib

manifest = pathlib.Path("data/edited/AndroidManifest.xml")
content = manifest.read_text()
content = content.replace("<application", '<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>\n  <application', 1)
manifest.write_text(content)
