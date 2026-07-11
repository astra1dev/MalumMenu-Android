import { ObsidianLayout, add, CENTER } from "frida-java-menu";

import { I18n } from "../../i18n/I18n";
import { State } from "../../data/State";

export class PassiveTab {
    static draw(layout: ObsidianLayout) {
        const passive = layout.textView(I18n.t("menu.tabs.passive"));
        passive.gravity = CENTER;
        add(passive);

        add(
            layout.toggle(I18n.t("menu.functions.unlock_cosmetics"), (state: boolean) => {
                State.unlockCosmetics = state;
            })
        );

        add(
            layout.toggle(I18n.t("menu.functions.disable_analytics"), (state: boolean) => {
                State.disableAnalytics = state;
            })
        );
    }
}
