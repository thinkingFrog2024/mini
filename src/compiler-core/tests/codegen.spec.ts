import { baseParse } from "../src/baseparse"
import { generate } from "../src/codegen"
import { transform } from "../src/tarnsform"
import { trandformElement } from "../src/transforms/transformElement"
import { transformExpression } from "../src/transforms/transformExpression"
import { transformText } from "../src/transforms/transformText"

describe('生成render函数',()=>{
    it('字符串生成render函数',()=>{
        const ast = baseParse('string')
        transform(ast,{})
        const {code} = generate(ast)
        expect(code).toMatchSnapshot()
    })
    it('插值生成render函数',()=>{
        const ast = baseParse('{{message}}')
        // 这个插件用于在变量名也就是message前面添加_ctx.
        transform(ast,{
            nodeTransforms:[transformExpression]
        })
        const {code} = generate(ast)
        expect(code).toMatchSnapshot()
    })
    // 给element类型添加插件
    it('element生成render函数',()=>{
        const ast = baseParse('<div></div>')
        transform(ast,{
            nodeTransforms:[trandformElement]
        })
        const {code} = generate(ast)
        expect(code).toMatchSnapshot()
    })
    it('联合类型生成render函数',()=>{
        const ast:any = baseParse('<div>hi, {{message}}{{xixi}}nini<span></span></div>')
        transform(ast,{
            // 这里虽然调用了trandformElement插件 但是得到的结果里里面的插值表达式前面并没有_ctx
            // 这是因为:插件是对根节点的每个子节点调用的 而ast的结构是:根节点=>元素节点=>文本节点 插值节点
            // 最初对元素节点调用transformExpression 改变了元素节点的childeren ast结构变成了元素节点=>复合节点
            // 但是原来的代码只会遍历root element的子节点
            // 所以我觉得这里在switch里面对复合类型也调用就可以解决这个问题
            // 但是视频里面是修改了调用顺序 在ast的结构被修改之前调用插件

            // ele节点使用transformExpression =》 类型不匹配 下一个
            // 使用trandformElement =》 类型匹配 修改了ast结构
            // 解决方案=》transformExpression先对每个节点进行使用 另外两个插件在这个插件运行完了在使用
            // 初始化一个数组存放后面调用的函数 修改trandformElement,transformText]使其返回一个函数执行原来的逻辑
            // 把他们返回的函数存放在数组里面 在tranverseNode函数的末尾依次调用 这样就实现了对每个节点先调用transformExpression
            // 把进入执行=》退出执行
            nodeTransforms:[transformExpression,trandformElement,transformText]
        })
        console.log(ast.codegenNode.children);
        
        const {code} = generate(ast)
        expect(code).toMatchSnapshot()
    })
}) 

// 联合类型处理 生成的render函数里面会有一个div 第二个参数则是props 第三个参数则是子节点
