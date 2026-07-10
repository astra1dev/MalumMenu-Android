import { AssemblyHelper } from "../core/AssemblyHelper";
import { BaseModule } from "../core/BaseModule";
import { State } from "../data/State";
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

    private LocalPlayer?: Il2Cpp.Field;

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

        this.LocalPlayer = this.PlayerControl.field("LocalPlayer");
    }

    public override initHooks(): void {
        const module = this;

        this.PlayerPhysics_LateUpdate.implementation = function (): void {
            //const myPlayer = module.PlayerPhysics.field("myPlayer") as Il2Cpp.Object;

            // static field: public static PlayerControl LocalPlayer;
            // @ts-ignore
            const localPlayer = module.LocalPlayer.value as Il2Cpp.Object;

            if (localPlayer.isNull()) {
                return this.method<void>("LateUpdate").invoke();
            }

            // instance field: public Collider2D Collider;
            const collider = localPlayer.field("Collider").value as Il2Cpp.Object;

            if (State.noclip) {
                collider.method("set_enabled").invoke(false);
            } else {
                collider.method("set_enabled").invoke(true);
            }

            const myPhysics = localPlayer.field("MyPhysics").value as Il2Cpp.Object;

            if (State.customSpeed) {
                myPhysics.field("Speed").value = State.speed;
            } else {
                myPhysics.field("Speed").value = 2.5;
            }

            return this.method<void>("LateUpdate").invoke();
        };

        // @ts-ignore
        this.PlayerPurchasesData_GetPurchase.implementation = function (itemKey: Il2Cpp.String, bundleKey: Il2Cpp.String): boolean {
            if (State.unlockCosmetics){
                return true;
            }
            return this.method<boolean>("GetPurchase", 2).invoke(itemKey, bundleKey);
        };

        this.HudManager_Update.implementation = function (): void {
            const HudManagerInstance = UnityUtils.getInstance(module.HudManager);
            // @ts-ignore
            const localPlayer = module.LocalPlayer.value as Il2Cpp.Object;
            if (localPlayer.isNull()) {
                return this.method<void>("Update").invoke();
            }

            const data = localPlayer.method<Il2Cpp.Object>("get_Data").invoke();
            const role = data.field("Role").value as Il2Cpp.Object;
            const canVent = role.field("CanVent").value;
            const isDead = data.field("IsDead").value;
            // @ts-ignore
            const impostorVentButton = HudManagerInstance.field("ImpostorVentButton").value as Il2Cpp.Object;
            const impostorVentButtonGameObject = UnityUtils.getGameObject(impostorVentButton);

            // @ts-ignore
            const shadowQuad = HudManagerInstance.field("ShadowQuad").value as Il2Cpp.Object;
            const shadowQuadGameObject = UnityUtils.getGameObject(shadowQuad);

            if (State.noShadows) {
                shadowQuadGameObject.method("SetActive", 1).invoke(false);
            } else {
                shadowQuadGameObject.method("SetActive", 1).invoke(true);
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
}
