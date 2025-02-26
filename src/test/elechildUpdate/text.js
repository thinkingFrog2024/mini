// children的类型原来是节点数组 更新后是text
import { createTextNode, h,ref } from "../../../lib/vue.esm.js";
export default {
    render(){
        // 三个问题场景：属性的值被修改/变成undefined/属性不存在了
        console.log('isArray',this.isNew);
        const self = this
        const newchild = h('div',{},'新字符串')
        const oldChild = h('p',{},'旧字符串')
        return  self.isNew === true?newchild:oldChild
    },  
    setup(){
        const isNew = ref(true)
        window.isNew = isNew
        return{
            isNew
        }
    }
}