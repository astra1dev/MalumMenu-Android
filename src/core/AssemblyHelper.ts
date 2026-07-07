import { Logger } from "../logger/Logger";

export class AssemblyHelper {
    static CoreModule: Il2Cpp.Image;
    static TextMeshPro: Il2Cpp.Image;
    static AssemblyCSharp: Il2Cpp.Image;
    static Hazel: Il2Cpp.Image;

    static init() {
        this.CoreModule = Il2Cpp.domain.assembly("UnityEngine.CoreModule").image;
        this.TextMeshPro = Il2Cpp.domain.assembly("Unity.TextMeshPro").image;
        this.AssemblyCSharp = Il2Cpp.domain.assembly("Assembly-CSharp").image;
        this.Hazel = Il2Cpp.domain.assembly("Hazel").image;

        Logger.info("[AssemblyHelper::init] Initialized");
    }
}
