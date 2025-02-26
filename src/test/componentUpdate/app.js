import { h } from "../../../lib/vue.esm.js";
import { ref } from "../../../lib/vue.esm.js";
import son from './son.js'

export default {
    render(){
        
        return h('div',{name:'app-div'},[h(son,{a:this.a,name:'子组件'}),h('button',{'onClick':this.add},'点我加a')])
    },  
    setup(){
        let a = ref(0)
        let msg = ref('xixi')
        let add = ()=>{
            console.log('触发add');
            a.value++
            console.log(a.value)
        }
        return{
            a,
            msg,
            add
        }
    }
}