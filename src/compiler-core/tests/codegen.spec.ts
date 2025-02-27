import { baseParse } from "../src/baseparse"
import { generate } from "../src/codegen"
import { transform } from "../src/tarnsform"
describe('生成render函数',()=>{
    // it('字符串生成render函数',()=>{
    //     const ast = baseParse('string')
    //     transform(ast,{})
    //     const code = generate(ast)
    //     expect(code).toMatchSnapshot()
    // })
    it('插值生成render函数',()=>{
        const ast = baseParse('{{message}}')
        transform(ast,{})
        const code = generate(ast)
        expect(code).toMatchSnapshot()
    })
}) 