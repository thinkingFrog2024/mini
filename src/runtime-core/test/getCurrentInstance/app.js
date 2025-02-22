import { h } from "../../../../lib/vue.esm.js";
import foo from './props.js'
import { getCurrentInstance } from "../../../../lib/vue.esm.js";
window.self = null
export default {
    render(){
        return h('div',{nae:'s'},[h('p',{class:'red'},'p'),h(foo)])
    },  
    setup(){
        console.log('app',getCurrentInstance());
        return{
            a:'app'
        }
    }
}