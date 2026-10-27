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
    private SystemTypes!: Il2Cpp.Class;
    private VentilationSystem!: Il2Cpp.Class;

    private ShipStatus_FixedUpdate!: Il2Cpp.Method;

    public init(): void {
        this.HudManager = AssemblyHelper.AssemblyCSharp.class("HudManager");
        this.MapOptions = AssemblyHelper.AssemblyCSharp.class("MapOptions");
        this.PlayerControl = AssemblyHelper.AssemblyCSharp.class("PlayerControl");
        this.ShipStatus = AssemblyHelper.AssemblyCSharp.class("ShipStatus");
        this.SystemTypes = AssemblyHelper.AssemblyCSharp.class("SystemTypes");
        this.VentilationSystem = AssemblyHelper.AssemblyCSharp.class("VentilationSystem");

        this.ShipStatus_FixedUpdate = this.ShipStatus.method<void>("FixedUpdate");
    }

    public override initHooks(): void {
        const module = this;

        this.ShipStatus_FixedUpdate.implementation = function (): void {
            if (State.walkInVents) {
                const localPlayer = module.localPlayer;

                if (localPlayer.isNull()) {
                    return this.method<void>("FixedUpdate").invoke();
                }

                localPlayer.field<boolean>("inVent").value = false;
                localPlayer.field<boolean>("moveable").value = true;
            }

            return this.method<void>("FixedUpdate").invoke();
        };
    }

    public callMeeting(): void {
        const module = this;

        const ShipStatusInstance = module.ShipStatus.field<Il2Cpp.Object>("Instance").value;
        if (ShipStatusInstance.isNull()) {
            Logger.warn(`[${module.name}::callMeeting] ShipStatusInstance is null`);
            return;
        }

        const localPlayer = module.localPlayer;
        if (localPlayer.isNull()) {
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

    /**
     * Triggers every sabotage the current map supports and closes all doors
     *
     * Systems are looked up by name and only used if `ShipStatus.Systems` contains them,
     * so the same code works on every map (Skeld, Mira, Polus, Airship, Fungle)
     */
    public sabotageAll(): void {
        const module = this;

        const ShipStatusInstance = module.ShipStatus.field<Il2Cpp.Object>("Instance").value;
        if (ShipStatusInstance.isNull()) {
            Logger.warn(`[${module.name}::sabotageAll] ShipStatusInstance is null`);
            return;
        }

        const systems = ShipStatusInstance.field<Il2Cpp.Object>("Systems").value;

        // [system, amount]: 128 = "start sabotage" bit used by SabotageSystemType
        // Electrical additionally carries the number of broken switches in the low bits
        const sabotages: [string, number][] = [
            ["Reactor", 128], // Skeld, Mira, Fungle
            ["Laboratory", 128], // Polus reactor
            ["HeliSabotage", 128], // Airship crash course
            ["LifeSupp", 128], // Skeld, Mira oxygen
            ["Electrical", 128 | 4], // Lights
            ["Comms", 128],
            ["HqHud", 128] // Mira comms
        ];

        let sent = 0;
        for (const [name, amount] of sabotages) {
            try {
                const type = UnityUtils.enumValue(module.SystemTypes, name);
                if (type === undefined) continue;
                if (!systems.method<boolean>("ContainsKey").invoke(type)) continue;

                ShipStatusInstance.method<void>("RpcUpdateSystem").invoke(type, amount);
                sent++;
            } catch (e) {
                Logger.warn(`[${module.name}::sabotageAll] ${name} failed: ${e}`);
            }
        }

        module.closeAllDoors();
        Logger.debug(`[${module.name}::sabotageAll] Sent ${sent} sabotages`);
    }

    /** Closes every door on the map (doors are closed room by room) */
    public closeAllDoors(): void {
        const module = this;

        const ShipStatusInstance = module.ShipStatus.field<Il2Cpp.Object>("Instance").value;
        if (ShipStatusInstance.isNull()) {
            Logger.warn(`[${module.name}::closeAllDoors] ShipStatusInstance is null`);
            return;
        }

        const allDoors = ShipStatusInstance.field<Il2Cpp.Array<Il2Cpp.Object>>("AllDoors").value;
        if (allDoors.isNull()) return; // Maps without doors (Mira, Airship, Fungle)

        const rooms = new Set<number>();
        for (const door of allDoors) {
            rooms.add(Number(door.field("Room").value));
        }

        for (const room of rooms) {
            try {
                ShipStatusInstance.method<void>("RpcCloseDoorsOfType").invoke(room);
            } catch (e) {
                Logger.warn(`[${module.name}::closeAllDoors] room ${room} failed: ${e}`);
            }
        }
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

        const HudManagerInstanceExists = module.HudManager.method<boolean>("get_InstanceExists").invoke();
        if (!HudManagerInstanceExists) {
            Logger.warn(`[${module.name}::openSabotageMap] HudManagerInstance does not exist`);
            return;
        }

        // No isNull check here because we trust that InstanceExists tells the truth
        const HudManagerInstance = module.HudManager.method<Il2Cpp.Object>("get_Instance").invoke();
        const MapOptions = UnityUtils.createInstance(module.MapOptions);
        const Modes = module.MapOptions.nested("Modes");
        const Sabotage = Modes.field("Sabotage");

        MapOptions.field("Mode").value = Sabotage.value;

        HudManagerInstance.method<void>("ToggleMapVisible", 1).invoke(MapOptions);
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
