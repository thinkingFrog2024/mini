// export * from './reactivity'
export * from './runtime-dom'
export * from './reactivity'
import * as runtimeDom from './runtime-dom'
import { basecompile } from './compiler-core/src'
import { registerRuntimeCompile } from './runtime-dom'
function compileToFunction(template){
    const code = basecompile(template)  
    console.log(code);


//     const code = `const {createElementVNode:_createElementVNode,toDisplayString:_toDisplayString} = Vue
// return  function render(_ctx,_cache){
// console.log(_toDisplayString(_ctx.message))
// return _createElementVNode('div',null,_toDisplayString(_ctx.message))}`
    
    const render = new Function("Vue",code)(runtimeDom)
    // console.log(render);
    return render
}
registerRuntimeCompile(compileToFunction)