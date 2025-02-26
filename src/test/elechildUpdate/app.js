import { h } from "../../../lib/vue.esm.js";
// import arrayToText from "./arrayToText.js";
// import textToArray from "./textToArray.js";
import array from "./array.js";
// import text from "./text.js";
export default {
    render(){
        // 三个问题场景：属性的值被修改/变成undefined/属性不存在了
        
        return h('div',{nam:'root'},[
            // h(arrayToText,{},'数组变字符'),
            // h(textToArray,{},'字符变数组'),
            h(array,{},'数组=>数组'),
            // h(text,{},'字符串=》字符串'),
        ])
    },  
    setup(){

        return{
        }
    }
}