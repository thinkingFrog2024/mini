import { createTextNode, h, inject, provide } from "../../../../lib/vue.esm.js";
import soo from './grandSon.js'
export default {
    render(){
        
        return h('div',{},[createTextNode(this.father),h(soo,{}),createTextNode(this.m),createTextNode(this.n)])},
    // 通过setup函数可以接收props
    setup(props){
        const father = inject('father')
        const m = inject('m','mommy')
        const n = inject('n',()=>'function')
        provide('father','father2')
        console.log(father);
        return{
            father,
            m,
            n
        }
    }
}