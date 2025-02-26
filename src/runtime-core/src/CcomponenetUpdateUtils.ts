export function shouldUpdate(newProps,oldProps){
    console.log(newProps);
    
    for(const key in newProps){
        if(newProps[key]!=oldProps[key]){
            return true
        }
    }for(const key in oldProps){
        if(newProps[key]!=oldProps[key]){
            return true
        }
    }
    return false
}