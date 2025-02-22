import { h } from "../../../../lib/vue.esm.js";
import { renderSlots } from "../../../../lib/vue.esm.js";
export default {
    render(){
        console.log('this.$slots',this.$slots);
        // 使用$slots获取虚拟节点的children
        return h('p',{},[renderSlots(this.$slots,'name',{a:'我睡觉哦'})])},
    setup(){
        return{
        }
    }
}