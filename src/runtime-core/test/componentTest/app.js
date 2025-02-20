import { h } from "../../../../lib/vue.esm.js";
export default {
    render(){
        return h('div',{nae:'s'},[h('p',{class:'red'},'我是第一个p'),h('p',{class:'blue'},this.a)])
    },
    setup(){
        return{
            a:'1'
        }
    }
}