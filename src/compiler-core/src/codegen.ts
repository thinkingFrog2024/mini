



export function generate(ast){
    console.log(ast);
    
    const context = createCodegenContext()
    const {push} = context
    getFunctionPreamble(ast,context)
    const functionName = 'render'
    const args = ['_ctx','_cache']
    const signature = args.join(',')
    push(`function ${functionName}(${signature}){`)

    getNode(ast.codegenNode,context)
    push('}')
    return context.code
}

function createCodegenContext(){
    const context = {
        code:"",
        push(str){
            context.code+=str
        }
    }
    return context
}

function getNode(node,context){
    const {push} = context
    push(`return ${node.content}`)
}

function getFunctionPreamble(ast,context){
    const {push} = context
    const vueBinging = 'Vue'
    const aliasHelpers = (s)=>`${s}:_${s}`
    push(`const {${ast.helpers.map(aliasHelpers).join(',')} = ${vueBinging}}`)
    push('\n')
    push('return    ')
}