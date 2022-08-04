import { registerPlugin } from '@capacitor/core'

export interface PocketRocketPlugin {
    launchARocket(options: { speed: number }): Promise<{ final_speed: number }>;
}

const PocketRocket = registerPlugin<PocketRocketPlugin>('PocketRocket');

 export default PocketRocket;