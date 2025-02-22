import { h } from "../../../../lib/vue.esm.js";
import { renderSlots } from "../../../../lib/vue.esm.js";
import {createTextNode} from "../../../../lib/vue.esm.js";
export default {
    render(){
        console.log(renderSlots(this.$slots,'foot',{foot:"foot"}))
        // 使用$slots获取虚拟节点的children
        console.log('slots',this.$slots);
        return h('outer',{},[renderSlots(this.$slots,'head',{head:'head'}),createTextNode('我是文本节点')])},
    setup(){
        return{
        }
    }
}