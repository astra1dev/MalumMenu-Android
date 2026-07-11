import { AssemblyHelper } from "../core/AssemblyHelper";
import { BaseModule } from "../core/BaseModule";
import { State } from "../data/State";
import { Logger } from "../logger/Logger";
import { UnityUtils } from "../utils/UnityUtils";

export class PlayerModule extends BaseModule {
    public readonly name = "Player";

    private PlayerControl!: Il2Cpp.Class;
    private PlayerPhysics!: Il2Cpp.Class;
    private PlayerPurchasesData!: Il2Cpp.Class;
    private HudManager!: Il2Cpp.Class;
    private Vent!: Il2Cpp.Class;

    private PlayerPhysics_LateUpdate!: Il2Cpp.Method;
    private PlayerPurchasesData_GetPurchase!: Il2Cpp.Method;
    private HudManager_Update!: Il2Cpp.Method;
    private Vent_CanUse!: Il2Cpp.Method;

    public init(): void {
        this.PlayerControl = AssemblyHelper.AssemblyCSharp.class("PlayerControl");
        this.PlayerPhysics = AssemblyHelper.AssemblyCSharp.class("PlayerPhysics");
        this.PlayerPurchasesData = AssemblyHelper.AssemblyCSharp.class("PlayerPurchasesData");
        this.HudManager = AssemblyHelper.AssemblyCSharp.class("HudManager");
        this.Vent = AssemblyHelper.AssemblyCSharp.class("Vent");

        this.PlayerPhysics_LateUpdate = this.PlayerPhysics.method<void>("LateUpdate");
        this.PlayerPurchasesData_GetPurchase = this.PlayerPurchasesData.method<boolean>("GetPurchase");
        this.HudManager_Update = this.HudManager.method<void>("Update");
        this.Vent_CanUse = this.Vent.method<boolean>("CanUse", 3);
    }

    public override initHooks(): void {
        const module = this;

        this.PlayerPhysics_LateUpdate.implementation = function (): void {
            //const myPlayer = module.PlayerPhysics.field<Il2Cpp.Object>("myPlayer");
            const localPlayer = module.localPlayer;

            // If we re-enter to the map, localPlayer.handle points to dead memory 
            // To prevent this, we check the internal Unity m_CachedPtr for 0x0
            // Since it's always pointing to real memory
            const cachedPtr = UnityUtils.cachedPtr(localPlayer);

            if (localPlayer.isNull() || cachedPtr.isNull()) { 
                return this.method<void>("LateUpdate").invoke();
            }

            // instance field: public Collider2D Collider;
            const collider = localPlayer.field<Il2Cpp.Object>("Collider").value; 

            if (State.noclip) {
                collider.method("set_enabled").invoke(false);
            } else {
                collider.method("set_enabled").invoke(true);
            }

            const myPhysics = localPlayer.field<Il2Cpp.Object>("MyPhysics").value;

            if (State.customSpeed) {
                myPhysics.field<number>("Speed").value = State.speed;
            } else {
                myPhysics.field<number>("Speed").value = 2.5;
            }

            return this.method<void>("LateUpdate").invoke();
        };

        // @ts-ignore
        this.PlayerPurchasesData_GetPurchase.implementation = function (itemKey: Il2Cpp.String, bundleKey: Il2Cpp.String): boolean {
            if (State.unlockCosmetics) {
                return true;
            }
            return this.method<boolean>("GetPurchase", 2).invoke(itemKey, bundleKey);
        };

        this.HudManager_Update.implementation = function (): void {
            const HudManagerInstance = UnityUtils.getInstance(module.HudManager);
            const localPlayer = module.localPlayer;

            if (HudManagerInstance == null || localPlayer.isNull()) {
                return this.method<void>("Update").invoke();
            }

            // NetworkedPlayerInfo
            const data = localPlayer.method<Il2Cpp.Object>("get_Data").invoke();
            // RoleBehaviour
            const role = data.field<Il2Cpp.Object>("Role").value;
            const canVent = role.field<boolean>("CanVent").value;
            const isDead = data.field<boolean>("IsDead").value;
            const impostorVentButton = HudManagerInstance.field<Il2Cpp.Object>("ImpostorVentButton").value;
            const impostorVentButtonGameObject = UnityUtils.getGameObject(impostorVentButton);

            const shadowQuad = HudManagerInstance.field<Il2Cpp.Object>("ShadowQuad").value;
            const shadowQuadGameObject = UnityUtils.getGameObject(shadowQuad);

            if (State.noShadows) {
                shadowQuadGameObject.method<void>("SetActive", 1).invoke(false);
            } else {
                shadowQuadGameObject.method<void>("SetActive", 1).invoke(true);
            }

            if (!canVent && !isDead) {
                impostorVentButtonGameObject.method<void>("SetActive", 1).invoke(State.unlockVents);
            }

            return this.method<void>("Update").invoke();
        };

        //@ts-ignore
        this.Vent_CanUse.implementation = function (pc: Il2Cpp.Object, canUse: boolean, couldUse: boolean): boolean {
            // TODO: add implementation from Vent.CanUse: https://github.com/scp222thj/MalumMenu/blob/main/src/Patches/VentPatches.cs

            return this.method<boolean>("CanUse", 3).invoke(pc, canUse, couldUse);
        };
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
