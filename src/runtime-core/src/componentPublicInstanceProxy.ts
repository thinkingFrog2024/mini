const publicPropertiesMAp = {
    $el:(i)=>i.vnode.el
}



export const publicinstanceProxyHandlers = {
    get({_:instance},key){
        // 如果key在setupState里面 也就是setup函数返回的数据
        const {setupState} = instance
        if(key in setupState){
            return setupState[key]
        }else if(publicPropertiesMAp[key]){
            return publicPropertiesMAp[key](instance)
        }
    }
}