import { NodeTypes } from "./ast"

const enum TagType{
    Start,
    End
}

export function baseParse(content:string){
    const context = createParserContext(content)

    return createRoot(parseChildren(context,''))
}

function parseChildren(context,parentTag){
    const nodes:Array<any>= []
    let node
    while(!isEnd(context,parentTag)){
        const s = context.source
        if(s.startsWith("{{")){
            node = parseInterpolation(context)
        }else if(s[0]=='<'){
            // 判断是不是元素类型
            if(/[a-z]/i.test(s[1])){
                
                node = pareseElement(context)
            }
        }
        // 如果既不是element类型 也不是插值类型 就当作Text类型处理
        if(!node){
            node = parseText(context)
        }
        nodes.push(node)
    }
    return nodes
}

function isEnd(context,parentTag){
    // 当source没有值   或者需要结束标签</>的时候 停止循环
    const s = context.source
    
    if(parentTag&&s.startsWith("</"+parentTag+'>')){
        return true
    }
    return !s
}

function parseText(context){

    // 遇到插值语法的时候应该停止截取
    let endIndex = context.source.length
    const endToken = "{{"
    const index = context.source.indexOf(endToken)
    if(index!=-1){
        endIndex = index
    }


    const content = parseTextData(context,endIndex)
    adviceBy(context,content.length)
    return{
        type:NodeTypes.TEXT,
        content:content
    }

}


function parseTextData(context,length){
    return context.source.slice(0,length)
}

function pareseElement(context){
    // 解析tag
    // 删除处理完成的代码
    // 这个正则表达式括号里面是捕获内容
    // 返回的数组里面的第一个元素是整个匹配到的内容 在这里是<div
    // 之后的内容是捕获组捕获到的内容 也就是div

    // 处理<div>
    const element:any = parseTag(context,TagType.Start)
    // 处理element里面的children 经过parseElement的处理element开头的符号已经被去掉了
    element.children = parseChildren(context,element.tag)

    // 处理</div>
    parseTag(context,TagType.End)

    return element
}

function parseTag(context,type){
    const match:any = /^<\/?([a-z]*)/i.exec(context.source)
    const tag = match[1]
    adviceBy(context,match[0].length)
    adviceBy(context,1)
    if(type === TagType.Start){
        return {
            type:NodeTypes.ELEMENT,
            tag:tag
        }
    }
}

function parseInterpolation(context){
    console.log('_________________________________');
    
// {{message}}=>message
    const openDelemeter = "{{"
    const closeDelimeter = "}}"


    const closeIndex = context.source.indexOf(closeDelimeter,openDelemeter.length)
    console.log(closeIndex);
    
    adviceBy(context,openDelemeter.length)
    
    const rawContentLength = closeIndex - openDelemeter.length
    console.log(rawContentLength);
    
    const rawcontent = parseTextData(context,rawContentLength)
    console.log(rawContentLength);
    
    // 删除已经处理的部分
    adviceBy(context,rawContentLength+closeDelimeter.length)
    const content = rawcontent.trim()
    return {
        type:NodeTypes.INTERPOLATION,
        content:{
            type:NodeTypes.SYMPLE_EXPRESSION,
            content:content
        }
    }
}

function createRoot(child){
    return {
        children:child
    }
}

function adviceBy(context:any,length:number){
    context.source = context.source.slice(length)
}

function createParserContext(content){
    return{
        source:content
    }
}