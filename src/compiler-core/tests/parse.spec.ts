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
        const ast = baseParse("<div></div>")
        expect(ast.children[0]).toStrictEqual({
            type:NodeTypes.ELEMENT,
            tag:'div',
            children:[]
        })
    })
})

describe("text",()=>{
    it('simple text',()=>{
        const ast = baseParse("some text")
        expect(ast.children[0]).toStrictEqual({
            type:NodeTypes.TEXT,
            content:"some text"
        })
    })

})

describe('解析联合类型',()=>{
    it('<div>hi,{{message}}</div>',()=>{
        const ast = baseParse('<div>hi,{{message}}</div>')
        expect(ast.children[0]).toStrictEqual({
            type:NodeTypes.ELEMENT,
            tag:'div',
            children:[
                {
                    type:NodeTypes.TEXT,
                    content:"hi,"
                },
                {
                    type:NodeTypes.INTERPOLATION,
                    content:{
                        type:NodeTypes.SYMPLE_EXPRESSION,
                        content:"message"
                    }
                }
            ]
        })
    })
    it('<div>hi,<p>p</p>{{message}}</div>',()=>{
        const ast = baseParse('<div>hi,<p>p</p>{{message}}</div>')
        expect(ast.children[0]).toStrictEqual({
            type:NodeTypes.ELEMENT,
            tag:'div',
            children:[
                {
                    type:NodeTypes.TEXT,
                    content:"hi,"
                },
                {
                    type:NodeTypes.ELEMENT,
                    tag:'p',
                    children:[
                        {
                            type:NodeTypes.TEXT,
                            content:"p"
                        },
                    ]
                },
                {
                    type:NodeTypes.INTERPOLATION,
                    content:{
                        type:NodeTypes.SYMPLE_EXPRESSION,
                        content:"message"
                    }
                }
            ]
        })
    })
})

test('缺少标签时抛出错误',()=>{
    
    expect(()=>{
        baseParse("<div><span></div>")
    }).toThrow('缺少结束标签')
})
