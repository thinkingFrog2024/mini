import { NodeTypes } from "../src/ast"
import { baseParse } from "../src/baseparse"
import { transform } from "../src/tarnsform"
describe('transform',()=>{
it('name',()=>{
    const ast = baseParse('<div>hi,{{message}}</div>')

    const plugin = (node)=>{
        // 如果是文本类型 那么。。
        if(node.type === NodeTypes.TEXT){
            node.content +='mini'
        }
    }

    transform(ast,{
        nodeTransforms:[plugin]
    })
    const nodeText = ast.children[0].children[0]
    expect(nodeText.content).toBe('hi,mini')
})
})