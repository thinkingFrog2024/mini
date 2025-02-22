import { h } from "../../../../lib/vue.esm.js";
import { renderSlots } from "../../../../lib/vue.esm.js";
export default {
    render(){
        // 使用$slots获取虚拟节点的children
        return h('outer',{},[renderSlots(this.$slots),])},
    setup(){
        return{
        }
    }
}