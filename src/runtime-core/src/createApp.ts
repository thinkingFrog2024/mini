import { render } from "./renderer"
import { createVnode } from "./vnode"
export function createApp(rootComponnet){
    return{
        mount(rootContainer){
            // 
            const vnode = createVnode(rootComponnet)
            render(vnode,rootContainer)
        }
    }
}

