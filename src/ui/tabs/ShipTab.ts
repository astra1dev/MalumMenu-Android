import { ObsidianLayout, add, CENTER } from "frida-java-menu";

import { I18n } from "../../i18n/I18n";
import { State } from "../../data/State";
import { ModuleManager } from "../../core/ModuleManager";
import { UnityUtils } from "../../utils/UnityUtils";
import { ShipModule } from "../../modules/Ship";

export class ShipTab {
    static draw(layout: ObsidianLayout) {
        const ship = layout.textView(I18n.t("menu.tabs.ship"));
        ship.gravity = CENTER;
        add(ship);

        add(
            layout.button(
                I18n.t("menu.functions.call_meeting"),
                UnityUtils.run(() => ModuleManager.get(ShipModule)?.callMeeting())
            )
        );

        add(
            layout.button(
                I18n.t("menu.functions.sabotage_reactor"),
                UnityUtils.run(() => ModuleManager.get(ShipModule)?.sabotageReactor())
            )
        );

        // add(
        //     layout.button(
        //         I18n.t("menu.functions.open_sabotage_map"),
        //         UnityUtils.run(() => ModuleManager.get(ShipModule)?.openSabotageMap())
        //     )
        // );

        add(
            layout.toggle(I18n.t("menu.functions.unlock_vents"), (state: boolean) => {
                State.unlockVents = state;
            })
        );

        add(
            layout.button(
                I18n.t("menu.functions.kick_vents"),
                UnityUtils.run(() => ModuleManager.get(ShipModule)?.kickVents())
            )
        );

        add(
            layout.toggle(I18n.t("menu.functions.walk_in_vents"), (state: boolean) => {
                State.walkInVents = state;
            })
        );
    }
}
