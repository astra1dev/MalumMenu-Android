import { AssemblyHelper } from "../core/AssemblyHelper";
import { BaseModule } from "../core/BaseModule";
import { State } from "../data/State";
import { Logger } from "../logger/Logger";
import { UnityUtils } from "../utils/UnityUtils";

/** Shows every player's role above their name (in game and on the meeting screen) */
export class RolesModule extends BaseModule {
    public readonly name = "Roles";

    private GameData!: Il2Cpp.Class;
    private MeetingHud!: Il2Cpp.Class;
    private PlayerControl!: Il2Cpp.Class;
    private RoleTypes!: Il2Cpp.Class;
    private RoleTeamTypes!: Il2Cpp.Class;

    private PlayerControl_FixedUpdate!: Il2Cpp.Method;
    private MeetingHud_Update!: Il2Cpp.Method;

    private readonly impostorColor = { r: 1, g: 0.1, b: 0.1 };
    private readonly crewColor = { r: 0.4, g: 0.8, b: 1 };
    private readonly specialColor = { r: 0.4, g: 1, b: 0.4 };

    private errorLogged = false;

    public init(): void {
        this.GameData = AssemblyHelper.AssemblyCSharp.class("GameData");
        this.MeetingHud = AssemblyHelper.AssemblyCSharp.class("MeetingHud");
        this.PlayerControl = AssemblyHelper.AssemblyCSharp.class("PlayerControl");
        this.RoleTypes = AssemblyHelper.AssemblyCSharp.class("RoleTypes");
        this.RoleTeamTypes = AssemblyHelper.AssemblyCSharp.class("RoleTeamTypes");

        this.PlayerControl_FixedUpdate = this.PlayerControl.method<void>("FixedUpdate");
        this.MeetingHud_Update = this.MeetingHud.method<void>("Update");
    }

    public override initHooks(): void {
        const module = this;

        this.PlayerControl_FixedUpdate.implementation = function (): void {
            this.method<void>("FixedUpdate").invoke();

            if (!State.revealRoles) return;

            try {
                const data = this.method<Il2Cpp.Object>("get_Data").invoke();
                const cosmetics = this.field<Il2Cpp.Object>("cosmetics").value;
                if (data.isNull() || cosmetics.isNull()) return;

                const nameText = cosmetics.field<Il2Cpp.Object>("nameText").value;
                module.applyRole(data, nameText);
            } catch (e) {
                module.logOnce(e);
            }
        };

        this.MeetingHud_Update.implementation = function (): void {
            this.method<void>("Update").invoke();

            if (!State.revealRoles) return;

            try {
                const states = this.field<Il2Cpp.Array<Il2Cpp.Object>>("playerStates").value;
                const gameData = module.GameData.field<Il2Cpp.Object>("Instance").value;
                if (states.isNull() || gameData.isNull()) return;

                for (const area of states) {
                    const playerId = area.field<number>("TargetPlayerId").value;
                    const data = gameData.method<Il2Cpp.Object>("GetPlayerById").invoke(playerId);
                    if (data.isNull()) continue;

                    const nameText = area.field<Il2Cpp.Object>("NameText").value;
                    module.applyRole(data, nameText);
                }
            } catch (e) {
                module.logOnce(e);
            }
        };
    }

    /** Colors the name and prefixes it with the role name. `data` is a NetworkedPlayerInfo, `nameText` a TMP_Text */
    private applyRole(data: Il2Cpp.Object, nameText: Il2Cpp.Object): void {
        if (nameText.isNull()) return;

        const role = data.field<Il2Cpp.Object>("Role").value;
        if (role.isNull()) return; // roles aren't assigned in the lobby

        const roleName = UnityUtils.enumName(this.RoleTypes, Number(role.field("Role").value)) ?? "?";
        const color = this.isImpostorTeam(role, roleName) ? this.impostorColor : this.isPlainCrew(roleName) ? this.crewColor : this.specialColor;

        // Strip our own previous line so the text doesn't grow every frame
        const current = nameText.method<Il2Cpp.String>("get_text").invoke().content ?? "";
        const playerName = current.includes("\n") ? current.substring(current.lastIndexOf("\n") + 1) : current;
        const label = `${roleName.replace(/([a-z])([A-Z])/g, "$1 $2")}\n${playerName}`;

        if (label !== current) {
            nameText.method<void>("set_text").invoke(Il2Cpp.string(label));
        }
        nameText.method<void>("set_color").invoke(UnityUtils.createColor(color.r, color.g, color.b));
    }

    private isImpostorTeam(role: Il2Cpp.Object, roleName: string): boolean {
        const team = role.tryField("TeamType");
        if (team) {
            return UnityUtils.enumName(this.RoleTeamTypes, Number(team.value)) === "Impostor";
        }
        return ["Impostor", "Shapeshifter", "Phantom", "Viper"].includes(roleName);
    }

    private isPlainCrew(roleName: string): boolean {
        return roleName === "Crewmate" || roleName === "CrewmateGhost";
    }

    private logOnce(e: unknown): void {
        if (this.errorLogged) return;
        this.errorLogged = true;
        Logger.error(`[${this.name}] reveal roles failed: ${e}`);
    }
}
