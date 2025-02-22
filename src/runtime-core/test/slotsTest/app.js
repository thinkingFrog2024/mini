import { h } from "../../../../lib/vue.esm.js";
import foo from './slots.js';
import defa from './defaultSlots.js'
import fn from './functionSlots.js'
window.self = null
export default {
    render(){
        window.self = this
        // 在这个地方获取￥el得到的结果是null 因为￥el是在所有子节点完成挂载之后初始化的
        // return h('div',{nae:'s'},[h(foo,{count:1},h('p',{},'p'),),h(foo,{count:1},[h('p',{},'p'),h('p',{},'p')],)])
        return h('section',{name:'app'},
            [

                h(foo,{},{head:({head})=>h('p',{},head)}),
                h(foo,{},{head:h('p',{},'秒')}),
                h(defa,{},h('p',{},'我是默认插槽')),
                h(fn,{},({a})=>h('p',{},a)),
                h(fn,{},({a})=>[h('p',{},a),h('p',{},'aaa'+a)]),

            ]
        )
    },  
    setup(){
        return{
            a:'1'
        }
    }
}