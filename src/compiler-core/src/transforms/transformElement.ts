import { NodeTypes } from "../ast";
import { CREATEELEMENTVNODE } from "./runtimeHelp";

// 在ast的helpers数组里面添加上CREATEELEMENTVNODE 实现导入逻辑
export function trandformElement(node,context){
    if(node.type === NodeTypes.ELEMENT){
        context.helper(CREATEELEMENTVNODE)
        node.tag = `'${node.tag}'`
    }
}