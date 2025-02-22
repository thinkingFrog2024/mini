import { getCurrentInstance } from "./component";
export function provide(key,value){
    const instance:any = getCurrentInstance()
    const {provides} = instance
    provides[key] = value
}
export function inject(key){
    const instance:any = getCurrentInstance()
    const {parents} = instance
    return parents.provides[key]
}