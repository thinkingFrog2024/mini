import { h } from "../../../../lib/vue.esm.js";
import { getCurrentInstance } from "../../../../lib/vue.esm.js";
export default {
    render(){
        return h('div',{},'div')},
    // 通过setup函数可以接收props
    setup(){
        alert(1)
        console.log('foo',getCurrentInstance())
        return{
            f:'foo'
        }
    }
}