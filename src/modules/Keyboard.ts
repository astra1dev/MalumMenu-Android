import { AssemblyHelper } from "../core/AssemblyHelper";
import { BaseModule } from "../core/BaseModule";
import { State } from "../data/State";

export class KeyboardModule extends BaseModule {
    name = "Keyboard";

    // Classes
    private ActiveInputManager!: Il2Cpp.Class;

    // Methods
    private ActiveInputManager_UpdateActiveControlType!: Il2Cpp.Method;
    private ActiveInputManager_OnLastActiveControllerChanged!: Il2Cpp.Method;
    private ActiveInputManager_ShouldEnableTouch!: Il2Cpp.Method;
    private HudManager_SetTouchType!: Il2Cpp.Method;

    private keyboardInputValue!: Il2Cpp.ValueType;
    private keyboardControlValue!: Il2Cpp.ValueType;

    public init(): void {
        this.ActiveInputManager = AssemblyHelper.AssemblyCSharp.class("ActiveInputManager");

        this.ActiveInputManager_UpdateActiveControlType = this.ActiveInputManager.method<void>("UpdateActiveControlType", 0);
        this.ActiveInputManager_OnLastActiveControllerChanged = this.ActiveInputManager.method<void>("OnLastActiveControllerChanged", 2);
        this.ActiveInputManager_ShouldEnableTouch = this.ActiveInputManager.method<boolean>("ShouldEnableTouch", 0);

        // Nested enum
        const InputType = AssemblyHelper.AssemblyCSharp.class("ActiveInputManager/InputType");
        this.keyboardInputValue = InputType.field<Il2Cpp.ValueType>("Keyboard").value;

        const ControlTypes = AssemblyHelper.AssemblyCSharp.class("ControlTypes");
        this.keyboardControlValue = ControlTypes.field<Il2Cpp.ValueType>("Keyboard").value;

        const HudManager = AssemblyHelper.AssemblyCSharp.class("HudManager");
        this.HudManager_SetTouchType = HudManager.method<void>("SetTouchType", 1);
    }

    public initHooks(): void {
        const module = this;

        this.ActiveInputManager_UpdateActiveControlType.implementation = function (): void {
            if (!State.keyboardMode) return this.method<void>("UpdateActiveControlType").invoke();
            module.setKeyboardMode();
        };

        this.ActiveInputManager_OnLastActiveControllerChanged.implementation = function (player, controller): void {
            if (!State.keyboardMode) return this.method<void>("OnLastActiveControllerChanged").invoke(player, controller);
            module.setKeyboardMode();
        };

        this.ActiveInputManager_ShouldEnableTouch.implementation = function (): boolean {
            if (!State.keyboardMode) return this.method<boolean>("ShouldEnableTouch").invoke();
            return false;
        };

        // type: ControlTypes enum
        // @ts-ignore
        this.HudManager_SetTouchType.implementation = function (type: Il2Cpp.ValueType): void {
            const returnArg = State.keyboardMode ? module.keyboardControlValue : type;
            this.method<void>("SetTouchType").invoke(returnArg);
        };
    }

    /**
     * Sets `ActiveInputManager.currentControlType` to `ActiveInputManager.InputType.Keyboard`
     */
    private setKeyboardMode(): void {
        this.ActiveInputManager.field("currentControlType").value = this.keyboardInputValue;
    }
}
