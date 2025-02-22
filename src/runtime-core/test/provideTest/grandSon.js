import { createTextNode, h, inject } from "../../../../lib/vue.esm.js";
export default {
    render(){
       
        return h('div',{},[createTextNode(this.father),createTextNode(this.grandfather)])},
    // 通过setup函数可以接收props
    setup(props){
        const father = inject('father')
        const grandfather = inject('grandfather')
        
        return{
            father,
            grandfather
        }
    }
}