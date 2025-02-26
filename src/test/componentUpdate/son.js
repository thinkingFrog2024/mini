import { h } from "../../../lib/vue.esm.js";
import { ref } from "../../../lib/vue.esm.js";

export default {
    render(){
        console.log(this.$props.a,'aaaaaaaaaa');
        return h('div',{name:'son-div'},this.$props.a)
    },  
    setup(){
        return{
        }
    }
}