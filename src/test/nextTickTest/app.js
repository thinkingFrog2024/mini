import { getCurrentInstance, h ,nextTick } from "../../../lib/vue.esm.js";
import { ref } from "../../../lib/vue.esm.js";
export default {
    render(){
        return h('div',{},[h('p',{class:'red'},this.a),h('button',{onClick:this.add},'add')])
    },  
    setup(){
        let a = ref(0)
        const instance = getCurrentInstance()

        let add = ()=>{
        // 使用schelduler把视图更新逻辑变成异步的之后 在setup函数内  这个for循环获取当前的组件实例 组件实例上面的数据并不是最新的
        // 这个时候旧需要使用nextTick获取最新的数据
        // 其实nextTick的原理就是在执行微任务的时候再获取数据
            for(let i = 0;i<100;i++){
                    console.log('for循环',instance);
                    debugger
    
                a.value++
            }
        }
        nextTick(()=>{
            debugger
            console.log('nextTick',instance)
            debugger
        })
        
        return{
            a,
            add
        }
    }
}