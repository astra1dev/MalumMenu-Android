import { ObsidianLayout, add, toast, CENTER } from "frida-java-menu";

import { I18n } from "../../i18n/I18n";
import { JavaUtils } from "../../utils/JavaUtils";
import { Constants } from "../../data/Constants";

export class OtherTab {
    static draw(layout: ObsidianLayout) {
        const other = layout.textView(I18n.t("menu.tabs.other"));
        other.gravity = CENTER;
        add(other);

        add(
            layout.radioGroup(I18n.t("menu.other.language"), I18n.getLocalisedLanguages(), (index: number) => {
                const selectedLocale = I18n.supportedLocales[index];
                I18n.changeLocale(selectedLocale);
                toast(I18n.t("menu.toasts.on_locale_changed", I18n.getLocalisedLanguages()[index]), 0);
            })
        );

        add(layout.button(I18n.t("menu.other.github_url"), () => JavaUtils.openURL(Constants.GITHUB_URL)));
        add(layout.button(I18n.t("menu.other.discord_url"), () => JavaUtils.openURL(Constants.DISCORD_URL)));
        add(layout.button(I18n.t("menu.other.malummenu_url"), () => JavaUtils.openURL(Constants.MALUMMENU_URL)));
        add(layout.button(I18n.t("menu.other.changelog"), () => JavaUtils.openURL(Constants.GITHUB_CHANGELOG_URL)));
    }
}
