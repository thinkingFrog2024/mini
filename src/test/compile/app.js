
import { ref } from "../../../lib/vue.esm.js";
window.self = null
export default {
    template:`<div>hi, {{message}}{{xixi}}nini<span>fufu</span></div>`,
    setup(){
        let message = ref('小王')
        let xixi = ref('miaomiao')
        return{
            message,
            xixi
        }
    }
}