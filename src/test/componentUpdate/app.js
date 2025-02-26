import { h } from "../../../lib/vue.esm.js";
import { ref } from "../../../lib/vue.esm.js";
import son from './son.js'

export default {
    render(){
        
        return h('div',{name:'app-div'},[h(son,{a:this.a,name:'子组件'}),h('button',{'onClick':this.add},'点我加a'),h('p',{},this.msg)])
    },  
    setup(){
        let a = ref(0)
        let msg = ref('xixi')
        let add = ()=>{
            console.log('触发add');
            a.value++
            console.log(a.value)
        }
        window.a = a
        window.msg = msg
        return{
            a,
            msg,
            add
        }
    }
}