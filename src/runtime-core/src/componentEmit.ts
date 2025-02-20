export function emit(instance,event){
    const {props} = instance
    
    // add=>onAdd
    function capitalize(str:string){
        return str.charAt(0).toUpperCase()+str.slice(1)
    }
    function toHandlerKey(name){
        return name?'on'+capitalize(name):""
    }
    if(props[toHandlerKey(event)]){
        props[toHandlerKey(event)]()
    }
}