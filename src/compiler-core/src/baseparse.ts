import { NodeTypes } from "./ast"

const enum TagType{
    Start,
    End
}

export function baseParse(content:string){
    const context = createParserContext(content)
    console.log(content);
    
    return createRoot(parseChildren(context,[]))
}

function parseChildren(context,ancestor){
    const nodes:Array<any>= []
    let node
    while(!isEnd(context,ancestor)){
        const s = context.source
        console.log(s);
        
        
        if(s.startsWith("{{")){
            node = parseInterpolation(context)
        }else if(s[0]=='<'){
            // 判断是不是元素类型
            if(/[a-z]/i.test(s[1])){
                
                node = pareseElement(context,ancestor)
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

function isEnd(context,ancestor){
    // 当source没有值   或者需要结束标签</>的时候 停止循环
    const s = context.source

    //这个处理可以防止在例如：<div><span></div>的情况下进入死循环
    if(s.startsWith('</')){
        for(let i = 0;i<ancestor.length;i++){
            const tag = ancestor[i].tag 
            if(s.slice(2,2+tag.length)===tag){
                return true
            }
        }
    }
    // if(parentTag&&s.startsWith("</"+parentTag+'>')){
    //     return true
    // }
    return !s
}

function parseText(context){

    // 遇到插值语法的时候应该停止截取
    let endIndex = context.source.length
    const endToken = ["{{","<"]
    let index
    for(let i = 0;i<endToken.length;i++){
        index = context.source.indexOf(endToken[i])
        if(index!=-1&&index<endIndex){
            endIndex = index
        }
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

function pareseElement(context,ancestor){
    // 解析tag
    // 删除处理完成的代码
    // 这个正则表达式括号里面是捕获内容
    // 返回的数组里面的第一个元素是整个匹配到的内容 在这里是<div
    // 之后的内容是捕获组捕获到的内容 也就是div

    // 处理<div>
    // <div></div>
    // <div><span></div>
    
    const element:any = parseTag(context,TagType.Start)
    ancestor.push(element)//div sapn
    // 处理element里面的children 经过parseElement的处理element开头的符号已经被去掉了
    element.children = parseChildren(context,ancestor)
    ancestor.pop()
    // 处理</div>

    // 如果缺少结束标签 比如<div><span></div>
    // 那么</div>会被认为是<span>的结束标签
    // 所以需要验证开始标签 结束标签相同
    
    startsWithEndTag(context,element)
    return element
}


function startsWithEndTag(context,element){
    if(context.source.startsWith('<')&&context.source.slice(2,2+element.tag.length).toLowerCase()=== element.tag.toLowerCase()){
        parseTag(context,TagType.End)
    }else{
        throw Error('缺少结束标签')
    }
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
 
    
// {{message}}=>message
    const openDelemeter = "{{"
    const closeDelimeter = "}}"


    const closeIndex = context.source.indexOf(closeDelimeter,openDelemeter.length)
    
    adviceBy(context,openDelemeter.length)
    
    const rawContentLength = closeIndex - openDelemeter.length
    
    const rawcontent = parseTextData(context,rawContentLength)
    
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
        children:child,
        type:NodeTypes.ROOT
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