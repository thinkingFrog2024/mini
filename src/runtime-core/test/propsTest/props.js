import { h } from "../../../../lib/vue.esm.js";
export default {
    render(){
        window.self = this
        this.count =10
        console.log('count',this.count)
        // 在这个地方获取￥el得到的结果是null 因为￥el是在所有子节点完成挂载之后初始化的
        return h('div',{},this.count)},
    // 通过setup函数可以接收props
    setup(props){
        console.log('在setup函数里面读取props',props)
        return{
        }
    }
}