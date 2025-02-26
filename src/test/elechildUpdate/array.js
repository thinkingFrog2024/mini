// children的类型原来是节点数组 更新后是text
import { createTextNode, h,ref } from "../../../lib/vue.esm.js";
export default {
    render(){
        // 三个问题场景：属性的值被修改/变成undefined/属性不存在了
        const self = this

        // 1
        // const narr = h('div',{},[
        //     h('p',{key:'q'},'q'),
        //     h('p',{key:'b'},'b'),
        //     h('p',{key:'c'},'c'),
        // ])
        // const oarr = h('div',{},[
        //     h('p',{key:'a'},'a'),
        //     h('p',{key:'b'},'b'),
        //     h('p',{key:'c'},'c'),
        // ])


        // 2
        const narr = h('div',{},[
            h('p',{key:'a',name : 'a'},'a'),
            h('p',{key:'b'},'b'),
            h('p',{key:'c'},'c'),
        ])
        const oarr = h('div',{},[
            h('p',{key:'a',name:'a'},'a'),
            h('p',{key:'b'},'b'),
            h('p',{key:'e'},'e'),
            h('p',{key:'v'},'v'),
        ])


        // 3
        // const narr = h('div',{},[
        //     h('p',{key:'a'},'a'),
        //     h('p',{key:'b'},'b'),
        // ])
        // const oarr = h('div',{},[
        //     h('p',{key:'c'},'c'),
        //     h('p',{key:'a'},'a'),
        //     h('p',{key:'b'},'b'),
        // ])


        // 4
        // const narr = h('div',{name:'dad'},[
        //     h('p',{key:'a'},'a'),
        //     h('p',{key:'q'},'q'),
        //     h('p',{key:'m'},'m'),
        //     h('p',{key:'b'},'b'),
        //     h('p',{key:'c'},'c'),
        // ])
        // const oarr = h('div',{},[
        //     h('p',{key:'a'},'a'),
        //     h('p',{key:'q'},'q'),
        //     h('p',{key:'e'},'e'),
        //     h('p',{key:'b'},'b'),
        //     h('p',{key:'c'},'c'),
            
        // ])

        // 5
        // const narr = h('div',{},[
        //     h('p',{key:'a'},'a'),
        //     h('p',{key:'b'},'b'),
        //     h('p',{key:'c'},'c'),
        // ])
        // const oarr = h('div',{},[
        //     h('p',{key:'b'},'b'),
        //     h('p',{key:'c'},'c'),
        // ])


        // 6
        // const narr = h('div',{},[
        //     h('p',{key:'a'},'a'),
        //     h('p',{key:'b'},'b'),
        //     h('p',{key:'c'},'c'),
        // ])
        // const oarr = h('div',{},[
        //     h('p',{key:'a'},'a'),
        //     h('p',{key:'b'},'b'),
        // ])


        return  self.n == true?narr:oarr
    },  
    setup(){
        const n = ref(true)
        window.n = n
        return{
            n: n
        }
    }
}
// 数组前面的元素更改了： abc=》dbc
// 数组后面大元素更改了：abc=》abd
// 数组前面添加元素：abc=》eabc
// 数组后面添加元素：abc=》abcd
// 数组前面减少元素：abc=》bc
// 数组后面减少元素：abc=》ab
