import Java from "frida-java-bridge";

import { add, CENTER, ObsidianLayout, toast } from "frida-java-menu";

import { I18n } from "../../i18n/I18n";
import { JavaUtils } from "../../utils/JavaUtils";
import { UnityUtils } from "../../utils/UnityUtils";

export class DebugTab {
    static draw(layout: ObsidianLayout) {
        const debugTab = layout.textView(I18n.t("menu.tabs.debug"));
        debugTab.gravity = CENTER;
        add(debugTab);

        const debugText = [
            `Frida v${Frida.version} (runtime: ${Script.runtime})`,
            `Unity version: ${Il2Cpp.unityVersion}`,
            `Android version: ${Java.androidVersion}`,
            `Architecture: ${Process.arch}`,
            `Platform: ${Process.platform}`,
            `PID: ${Process.id}`
        ];
        for (const text of debugText) {
            add(layout.textView(text));
        }

        add(
            layout.button(I18n.t("menu.functions.go_to_main_menu"), () => {
                UnityUtils.LoadScene("MainMenu");
            })
        );

        add(
            layout.button(
                "Exit game",
                () => {
                    toast(I18n.t("menu.toasts.exit_game"), 0);
                },
                () => {
                    JavaUtils.exitFromApp();
                }
            )
        );
    }
}
