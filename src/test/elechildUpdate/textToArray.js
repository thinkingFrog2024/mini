// children的类型原来是节点数组 更新后是text
import { createTextNode, h,ref } from "../../../lib/vue.esm.js";
export default {
    render(){
        // 三个问题场景：属性的值被修改/变成undefined/属性不存在了
        console.log('isArray',this.isArray);
        const self = this
        const arrchild = h('div',{},[h('p',{},'数组里的第一个p')])
        const textChild = h('div',{},'字符串children'+self.isArray)
        return  self.isArray === true?arrchild:textChild
    },  
    setup(){
        const isArray = ref(false)
        window.isArray = isArray
        return{
            isArray
        }
    }
}