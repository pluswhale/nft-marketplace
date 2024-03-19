import type { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain"
import type { EnvironmentDictionary } from "./domain"

export class EnvironmentUtils {
    private readonly environmentPersistKey = "saved_environment"
    private readonly defaultEnvironment = "prod"

    readonly allowedEnvironments = Object.keys(this.environments) as RaribleSdkEnvironment[]

    constructor(readonly environments: EnvironmentDictionary) {}

    getConfig = (x: RaribleSdkEnvironment) => this.environments[x]

    isEnvironment = (x: string): x is RaribleSdkEnvironment => {
        return this.allowedEnvironments.includes(x as RaribleSdkEnvironment)
    }

    getLabel = (x: RaribleSdkEnvironment) => this.getConfig(x).label

    getSavedEnvironment = (): RaribleSdkEnvironment | undefined => {
        if (typeof window === 'undefined') {
            // We are on the server, return undefined or some server-side logic
            return undefined;
        }
        const saved = window.localStorage.getItem(this.environmentPersistKey);
        if (saved && this.isEnvironment(saved)) {
            return saved;
        }
        return undefined;
    }

    updateSavedEnvironment = (x: RaribleSdkEnvironment) => {
        if (typeof window !== 'undefined') {
            // We are in the browser, safe to use localStorage
            window.localStorage.setItem(this.environmentPersistKey, x);
        }
        // Else, you could implement some server-side logic or simply do nothing
    }
    getDefaultEnvironment = (): RaribleSdkEnvironment => {
        return this.getSavedEnvironment() || this.defaultEnvironment
    }
}