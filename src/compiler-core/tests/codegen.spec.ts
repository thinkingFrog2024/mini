import { baseParse } from "../src/baseparse"
import { generate } from "../src/codegen"
import { transform } from "../src/tarnsform"
import { trandformElement } from "../src/transforms/transformElement"
import { transformExpression } from "../src/transforms/transformExpression"
import { transformText } from "../src/transforms/transformText"

describe('生成render函数',()=>{
    // it('字符串生成render函数',()=>{
    //     const ast = baseParse('string')
    //     transform(ast,{})
    //     const {code} = generate(ast)
    //     expect(code).toMatchSnapshot()
    // })
    // it('插值生成render函数',()=>{
    //     const ast = baseParse('{{message}}')
    //     // 这个插件用于在变量名也就是message前面添加_ctx.
    //     transform(ast,{
    //         nodeTransforms:[transformExpression]
    //     })
    //     const {code} = generate(ast)
    //     expect(code).toMatchSnapshot()
    // })
    // // 给element类型添加插件
    // it('element生成render函数',()=>{
    //     const ast = baseParse('<div></div>')
    //     transform(ast,{
    //         nodeTransforms:[trandformElement]
    //     })
    //     const {code} = generate(ast)
    //     expect(code).toMatchSnapshot()
    // })
    it('联合类型生成render函数',()=>{
        const ast:any = baseParse('<div>hi, {{message}}</div>')
        transform(ast,{
            // 这里虽然调用了trandformElement插件 但是得到的结果里里面的插值表达式前面并没有_ctx
            // 这是因为:插件是对根节点的每个子节点调用的 而ast的结构是:根节点=>元素节点=>文本节点 插值节点
            // 最初对元素节点调用transformExpression 改变了元素节点的childeren ast结构变成了元素节点=>复合节点
            // 但是原来的代码只会遍历root element的子节点
            // 所以我觉得这里在switch里面对复合类型也调用就可以解决这个问题
            // 但是视频里面是修改了调用顺序 在ast的结构被修改之前调用插件
            nodeTransforms:[transformExpression,trandformElement,transformText]
        })
        console.log(ast.codegenNode.children);
        
        const {code} = generate(ast)
        expect(code).toMatchSnapshot()
    })
}) 

// 联合类型处理 生成的render函数里面会有一个div 第二个参数则是props 第三个参数则是子节点
