import { h } from "../../../lib/vue.esm.js";
import { ref } from "../../../lib/vue.esm.js";
window.self = null
export default {
    render(){
        
        return h('div',{},[h('p',{class:'red'},this.a),h('button',{onClick:this.add},'add')])
    },  
    setup(){
        let a = ref(0)
        let add = ()=>{
            a.value ++
            console.log('a的值为：',a)
        }
        return{
            a,
            add
        }
    }
}