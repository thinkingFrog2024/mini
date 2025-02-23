import { getCurrentInstance } from "./component";
export function provide(key,value){
    const instance:any = getCurrentInstance()
    let {provides,parent} = instance
    if(instance){
        // 为了支持跨层级provide 把当前组件的provides的原型设置成父级的provides属性
    if(parent&&provides === parent.provides){
        provides = instance.provides = Object.create(parent.provides)
    }
    provides[key] = value
    }

}
export function inject(key,defaultVal){
    const instance:any = getCurrentInstance()
    const {parents} = instance
    if(parents){
        return parents.provides[key]?parents.provides[key]:typeof defaultVal==='function'?defaultVal():defaultVal
    }
}