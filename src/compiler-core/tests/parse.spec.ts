import { NodeTypes } from "../src/ast"
import { baseParse } from "../src/baseparse"
describe('Parse',()=>{
    it('插值解析',()=>{
        const ast = baseParse("{{message}}")
        expect(ast.children[0]).toStrictEqual({
            type:NodeTypes.INTERPOLATION,
            content:{
                type:NodeTypes.SYMPLE_EXPRESSION,
                content:"message"
            }
        })
    })
})
describe("element",()=>{
    it('div',()=>{

    })
})