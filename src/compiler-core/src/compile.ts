import { baseParse } from "../src/baseparse"
import { generate } from "../src/codegen"
import { transform } from "../src/tarnsform"
import { trandformElement } from "../src/transforms/transformElement"
import { transformExpression } from "../src/transforms/transformExpression"
import { transformText } from "../src/transforms/transformText"


export function basecompile(template){
    const ast:any = baseParse(template)
    transform(ast,{
        nodeTransforms:[transformExpression,trandformElement,transformText]
    })
    const {code} = generate(ast)
    return code
}
// const Vue:any = {}
// const {createElementVNode:_createElementVNode,toDisplayString:_toDisplayString} = Vue
// function render(_ctx,_cache){
// return _createElementVNode('div'),null,'hi, '+_toDisplayString(_ctx.message)+_toDisplayString(_ctx.xixi)+'nini',_createElementVNode('span'),null}