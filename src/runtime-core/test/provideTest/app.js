import { h } from "../../../../lib/vue.esm.js";
import foo from './son.js'
import { provide } from "../../../../lib/vue.esm.js";
export default {
    render(){
        // 在这个地方获取￥el得到的结果是null 因为￥el是在所有子节点完成挂载之后初始化的
        return h('div',{},[h('p',{class:'red'},),h(foo,{count:1})])
    },  
    setup(){
        provide('father','father')
        return{
        }
    }
}