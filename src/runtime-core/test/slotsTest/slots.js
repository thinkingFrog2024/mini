import { h } from "../../../../lib/vue.esm.js";
import { renderSlots } from "../../../../lib/vue.esm.js";
export default {
    render(){
        // 使用$slots获取虚拟节点的children
        console.log('slots',this.$slots);
        return h('div',{},[,renderSlots(this.$slots,'foot'),renderSlots(this.$slots,'head')])},
    setup(){
        return{
        }
    }
}