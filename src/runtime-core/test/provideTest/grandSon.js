import { h } from "../../../../lib/vue.esm.js";
export default {
    render(){
       
        return h('div',{},this.count)},
    // 通过setup函数可以接收props
    setup(props){
        return{
        }
    }
}