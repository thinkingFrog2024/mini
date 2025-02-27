import { NodeTypes } from "../ast";

export function transformExpression(node){
    // 插值类型=>content=>字符串类型
    if(node.type === NodeTypes.INTERPOLATION){
        const raw = node.content.content
        node.content.content = '_ctx.'+raw
    }
}