import { h } from "../../../lib/vue.esm.js";
import { ref } from "../../../lib/vue.esm.js";
window.self = null
export default {
    render(){
        // 三个问题场景：属性的值被修改/变成undefined/属性不存在了
        
        return h('div',{nam:'root',...this.props},[
            h('button',{onClick:this.namechange},'小王变小明'),
            h('button',{onClick:this.undefinedName},'小王变undefined'),
            h('button',{onClick:this.deleteid},'删除id'),
            h('button',{onClick:this.addSex},'添加sex'),
        ])
    },  
    setup(){
        const props = ref({
            name:'小王',
            id:'2023'
        })
        const namechange = ()=>{
            console.log('修改');
            
            props.value.name = '小明'
        }
        const undefinedName = ()=>{
            console.log('未定义');
            props.value.name = undefined
        }
        const deleteid = ()=>{
            console.log('删除');
            props.value = {
                name:'小王'
            }
        }
        const addSex = ()=>{
            console.log('删除');
            props.value = {
                name:'小王',
                sex:'nu'
            }
        }
        return{
            props,
            namechange,
            undefinedName,
            deleteid,
            addSex
        }
    }
}