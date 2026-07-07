import { ObsidianLayout, add, CENTER } from "frida-java-menu";

import { I18n } from "../../i18n/I18n";
import { State } from "../../data/State";

export class ESPTab {
    static draw(layout: ObsidianLayout) {
        const esp = layout.textView(I18n.t("menu.tabs.esp"));
        esp.gravity = CENTER;
        add(esp);

        add(
            layout.toggle(I18n.t("menu.functions.no_shadows"), (state: boolean) => {
                State.noShadows = state;
            })
        );
    }
}
