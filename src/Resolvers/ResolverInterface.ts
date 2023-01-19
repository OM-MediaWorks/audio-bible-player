import { AudioBible } from "../types"

export interface ResolverInterface {
    applies (): Promise<Boolean> | Boolean

    getMeta(): Promise<AudioBible>
}