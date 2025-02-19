export class ReactiveEffect{
    private _fn:any
    constructor(fn){
        this._fn = fn
    }
    run(){
        this._fn()
    }
}