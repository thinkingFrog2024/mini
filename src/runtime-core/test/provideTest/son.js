import { h, inject } from "../../../../lib/vue.esm.js";
export default {
    render(){
        
        return h('div',{},this.father)},
    // 通过setup函数可以接收props
    setup(props){
        const father = inject('father')
        console.log(father);
        return{
            father
        }
    }
}