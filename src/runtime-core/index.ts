export { renderSlots } from "./src/componentSlots";

export { createApp } from "../runtime-dom/index";
export {h} from './src/h'
export {createTextNode,createElementVNode,toDisplayString} from './src/vnode'

export {getCurrentInstance} from './src/component'
export {provide,inject} from './src/provide'
export {createRender} from './src/renderer'
export {nextTick} from './src/queue'
export {registerRuntimeCompile} from './src/component'