import { AssemblyHelper } from "../core/AssemblyHelper";
import { BaseModule } from "../core/BaseModule";
import { State } from "../data/State";
import { UnityUtils } from "../utils/UnityUtils";

export class PlayerModule extends BaseModule {
    public readonly name = "Player";

    private Vector2!: Il2Cpp.Class;

    private Constants!: Il2Cpp.Class;
    private PhysicsHelpers!: Il2Cpp.Class;
    private PlayerControl!: Il2Cpp.Class;
    private PlayerPhysics!: Il2Cpp.Class;
    private PlayerPurchasesData!: Il2Cpp.Class;
    private HudManager!: Il2Cpp.Class;
    private Vent!: Il2Cpp.Class;

    private Vector2_Distance!: Il2Cpp.Method;

    private PhysicsHelpers_AnythingBetween!: Il2Cpp.Method;
    private PlayerPhysics_LateUpdate!: Il2Cpp.Method;
    private PlayerPurchasesData_GetPurchase!: Il2Cpp.Method;
    private HudManager_Update!: Il2Cpp.Method;
    private Vent_CanUse!: Il2Cpp.Method;

    public init(): void {
        this.Vector2 = AssemblyHelper.CoreModule.class("UnityEngine.Vector2");

        this.Constants = AssemblyHelper.AssemblyCSharp.class("Constants");
        this.PhysicsHelpers = AssemblyHelper.AssemblyCSharp.class("PhysicsHelpers");
        this.PlayerControl = AssemblyHelper.AssemblyCSharp.class("PlayerControl");
        this.PlayerPhysics = AssemblyHelper.AssemblyCSharp.class("PlayerPhysics");
        this.PlayerPurchasesData = AssemblyHelper.AssemblyCSharp.class("PlayerPurchasesData");
        this.HudManager = AssemblyHelper.AssemblyCSharp.class("HudManager");
        this.Vent = AssemblyHelper.AssemblyCSharp.class("Vent");

        this.Vector2_Distance = this.Vector2.method<number>("Distance", 2);

        this.PhysicsHelpers_AnythingBetween = this.PhysicsHelpers.method<boolean>("AnythingBetween", 5);
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

            // If we leave and re-join a game, localPlayer.handle points to dead memory
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
        this.Vent_CanUse.implementation = function (pc: Il2Cpp.Object, canUse: Il2Cpp.Reference<boolean>, couldUse: Il2Cpp.Reference<boolean>): number {
            if (!State.unlockVents) {
                return this.method<number>("CanUse", 3).invoke(pc, canUse, couldUse);
            }

            const localPlayer = module.localPlayer;
            const data = localPlayer.method<Il2Cpp.Object>("get_Data").invoke();

            if (localPlayer.isNull() || data.isNull()) {
                return this.method<number>("CanUse", 3).invoke(pc, canUse, couldUse);
            }

            const role = data.field<Il2Cpp.Object>("Role").value;
            const canVent = role.field<boolean>("CanVent").value;
            const isDead = data.field<boolean>("IsDead").value;

            if (canVent || isDead) {
                return this.method<number>("CanUse", 3).invoke(pc, canUse, couldUse);
            }

            const object = pc.method<Il2Cpp.Object>("get_Object").invoke();
            const collider = object.field<Il2Cpp.Object>("Collider").value;
            const bounds = collider.method<Il2Cpp.Object>("get_bounds").invoke();
            const center = bounds.method<Il2Cpp.Object>("get_center").invoke();

            const transform = this.method<Il2Cpp.Object>("get_transform").invoke();
            const position = transform.method<Il2Cpp.Object>("get_position").invoke();

            // Convert from Vector3 to Vector2. Works, but there's probably a better way of doing it.
            const centerX = center.field<number>("x").value;
            const centerY = center.field<number>("y").value;
            const positionX = position.field<number>("x").value;
            const positionY = position.field<number>("y").value;

            const centerVector2 = UnityUtils.createVector2(centerX, centerY);
            const positionVector2 = UnityUtils.createVector2(positionX, positionY);

            const num = module.Vector2_Distance.invoke(centerVector2, positionVector2) as number;

            const usableDistance = this.method<number>("get_UsableDistance").invoke(); // 0.75f
            const shipOnlyMask = module.Constants.field<number>("ShipOnlyMask").value;

            // Allow usage of vents unless the vent is too far or there are objects blocking the player's path
            canUse.value = num <= usableDistance && !module.PhysicsHelpers_AnythingBetween.invoke(collider, centerVector2, positionVector2, shipOnlyMask, false);
            couldUse.value = true;
            return num;
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
