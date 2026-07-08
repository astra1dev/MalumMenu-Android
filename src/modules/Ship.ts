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

    private LocalPlayer?: Il2Cpp.Field;

    public init(): void {
        this.HudManager = AssemblyHelper.AssemblyCSharp.class("HudManager");
        this.MapOptions = AssemblyHelper.AssemblyCSharp.class("MapOptions");
        this.PlayerControl = AssemblyHelper.AssemblyCSharp.class("PlayerControl");
        this.ShipStatus = AssemblyHelper.AssemblyCSharp.class("ShipStatus");
        this.VentilationSystem = AssemblyHelper.AssemblyCSharp.class("VentilationSystem");

        this.ShipStatus_FixedUpdate = this.ShipStatus.method<void>("FixedUpdate");

        this.LocalPlayer = this.PlayerControl.field("LocalPlayer");
    }

    public override initHooks(): void {
        const module = this;

        this.ShipStatus_FixedUpdate.implementation = function (): void {
            if (State.walkInVents) {
                // @ts-ignore
                const localPlayer = module.LocalPlayer.value as Il2Cpp.Object;

                if (localPlayer.isNull()){
                    return this.method<void>("FixedUpdate").invoke();
                }

                localPlayer.field("inVent").value = false;
                localPlayer.field("moveable").value = true;
            }

            return this.method<void>("FixedUpdate").invoke();
        };
    }

    public callMeeting(): void {
        const module = this;

        // @ts-ignore
        const localPlayer = module.LocalPlayer.value as Il2Cpp.Object;
        if (localPlayer.isNull()){
            Logger.warn(`[${module.name}::callMeeting] LocalPlayer is null`);
            return;
        }

        localPlayer.method<void>("CmdReportDeadBody").invoke(NULL);
    }

    public sabotageReactor(): void {
        const module = this;

        const ShipStatusInstance = module.ShipStatus.field("Instance").value as Il2Cpp.Object;
        if (ShipStatusInstance.isNull()) {
            Logger.warn(`[${module.name}::sabotageReactor] ShipStatusInstance is null`);
            return;
        }

        ShipStatusInstance.method<void>("RpcUpdateSystem").invoke(3, 128);
    }

    public kickVents(): void {
        const module = this;

        const ShipStatusInstance = module.ShipStatus.field("Instance").value as Il2Cpp.Object;
        if (ShipStatusInstance.isNull()) {
            Logger.warn(`[${module.name}::kickVents] ShipStatusInstance is null`);
            return;
        }

        const allVents = ShipStatusInstance.method<Il2Cpp.Array<Il2Cpp.Object>>("get_AllVents").invoke();

        for (const vent of allVents) {
            module.VentilationSystem.method<void>("Update", 2).invoke(5, vent.field("Id").value);
            // VentilationSystem.Operation.BootImpostors = 5
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

        //const options = module.MapOptions;
        const opt = UnityUtils.createInstance(module.MapOptions) as Il2Cpp.Object;
        opt.field("Mode").value = 3;
        //const options = Il2Cpp.gc.choose(module.MapOptions);
        //options.field("Mode").value = 3;

        // @ts-ignore
        HudManagerInstance.method<void>("ToggleMapVisible", [module.MapOptions]).invoke(opt);
        // MapOptions.Modes.Sabotage = 3
    }
}
