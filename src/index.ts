import "frida-il2cpp-bridge";

import { AssemblyHelper } from "./core/AssemblyHelper";
import { ModuleManager } from "./core/ModuleManager";

import { Constants } from "./data/Constants";

import { I18n } from "./i18n/I18n";

import { Logger } from "./logger/Logger";
import { UnityLogger } from "./logger/UnityLogger";

import { MenuUI } from "./ui/MenuUI";

import { UnityUtils } from "./utils/UnityUtils";

class MalumMenu {
    static init() {
        Logger.debug("Script Loaded");
        Il2Cpp.perform(() => {
            Logger.debug("IL2CPP Loaded");
            Logger.infoGreen(`MalumMenu ${Constants.VERSION}, Game Version: ${Il2Cpp.application.version!}`);
            I18n.init();

            // Init Unity related
            AssemblyHelper.init();
            UnityLogger.init();
            UnityUtils.init();
            ModuleManager.initAll();

            // Init UI
            MenuUI.init();
        }).catch(error => Logger.error(`Failed to initialize script: ${error}`));
    }
}

// Frida will wait for init to return before it lets the game execute its entrypoint
MalumMenu.init();
