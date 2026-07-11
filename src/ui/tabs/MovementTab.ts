import { ObsidianLayout, add, CENTER } from "frida-java-menu";

import { I18n } from "../../i18n/I18n";
import { State } from "../../data/State";

export class MovementTab {
    static draw(layout: ObsidianLayout) {
        const movement = layout.textView(I18n.t("menu.tabs.movement"));
        movement.gravity = CENTER;
        add(movement);

        add(
            layout.toggle(I18n.t("menu.functions.noclip"), (state: boolean) => {
                State.noclip = state;
            })
        );

        add(
            layout.seekbar(I18n.t("menu.functions.speed_val"), 20, 0, (value: number) => {
                State.speed = value;
            })
        );

        add(
            layout.toggle(I18n.t("menu.functions.custom_speed"), (state: boolean) => {
                State.customSpeed = state;
            })
        );
    }
}
