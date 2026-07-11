import { AssemblyHelper } from "../core/AssemblyHelper";
import { BaseModule } from "../core/BaseModule";
import { State } from "../data/State";
import { UnityUtils } from "../utils/UnityUtils";
import { Logger } from "../logger/Logger";

export class ShipModule extends BaseModule {
    public readonly name = "Ship";

    private HudManager!: Il2Cpp.Class;
    private MapOptions!: Il2Cpp.Class;
    private PlayerControl!: Il2Cpp.Class;
    private ShipStatus!: Il2Cpp.Class;
    private VentilationSystem!: Il2Cpp.Class;

    private ShipStatus_FixedUpdate!: Il2Cpp.Method;

    public init(): void {
        this.HudManager = AssemblyHelper.AssemblyCSharp.class("HudManager");
        this.MapOptions = AssemblyHelper.AssemblyCSharp.class("MapOptions");
        this.PlayerControl = AssemblyHelper.AssemblyCSharp.class("PlayerControl");
        this.ShipStatus = AssemblyHelper.AssemblyCSharp.class("ShipStatus");
        this.VentilationSystem = AssemblyHelper.AssemblyCSharp.class("VentilationSystem");

        this.ShipStatus_FixedUpdate = this.ShipStatus.method<void>("FixedUpdate");
    }

    public override initHooks(): void {
        const module = this;

        this.ShipStatus_FixedUpdate.implementation = function (): void {
            const returnValue = this.method<void>("FixedUpdate").invoke();

            if (State.walkInVents) {
                const localPlayer = module.localPlayer;

                if (localPlayer.isNull()) {
                    return returnValue; 
                }

                localPlayer.field<boolean>("inVent").value = false;
                localPlayer.field("moveable").value = true;
            }

            return returnValue; 
        };
    }

    public callMeeting(): void {
        const module = this;

        const localPlayer = module.localPlayer;
        if (localPlayer.isNull()){
            Logger.warn(`[${module.name}::callMeeting] LocalPlayer is null`);
            return;
        }

        localPlayer.method<void>("CmdReportDeadBody").invoke(NULL);
    }

    public sabotageReactor(): void {
        const module = this;

        const ShipStatusInstance = module.ShipStatus.field<Il2Cpp.Object>("Instance").value;
        if (ShipStatusInstance.isNull()) {
            Logger.warn(`[${module.name}::sabotageReactor] ShipStatusInstance is null`);
            return;
        }

        ShipStatusInstance.method<void>("RpcUpdateSystem").invoke(3, 128);
    }

    public kickVents(): void {
        const module = this;

        const ShipStatusInstance = module.ShipStatus.field<Il2Cpp.Object>("Instance").value;
        if (ShipStatusInstance.isNull()) {
            Logger.warn(`[${module.name}::kickVents] ShipStatusInstance is null`);
            return;
        }

        const allVents = ShipStatusInstance.method<Il2Cpp.Array<Il2Cpp.Object>>("get_AllVents").invoke();

        for (const vent of allVents) {
            // VentilationSystem.Operation.BootImpostors = 5
            module.VentilationSystem.method<void>("Update", 2).invoke(5, vent.field("Id").value);
        }
    }

    public openSabotageMap(): void {
        const module = this;

        const HudManagerInstance = UnityUtils.getInstance(module.HudManager);

        if (HudManagerInstance == undefined) {
            Logger.warn(`[${module.name}::openSabotageMap] HudManagerInstance is null`);
            return;
        }

        // DestroyableSingleton<HudManager>.Instance.ToggleMapVisible(new MapOptions
        // {
        //     Mode = MapOptions.Modes.Sabotage
        // });

        const opt = UnityUtils.createInstance(module.MapOptions);
        // MapOptions.Modes.Sabotage = 3
        opt.field("Mode").value = 3;

        HudManagerInstance.method<void>("ToggleMapVisible", 1).invoke(opt);
    }

    /** 
     * `static PlayerControl::LocalPlayer` 
     * 
     * @returns `PlayerControl` instance
    */
    private get localPlayer(): Il2Cpp.Object {
        return this.PlayerControl.field<Il2Cpp.Object>("LocalPlayer").value;
    }
}
