interface InfoBlocks{
    div: HTMLDivElement;
}

abstract class PosBlocks implements InfoBlocks{
    div: HTMLDivElement;
    constructor(div: HTMLDivElement){
        this.div = div
    }
}

class LeftBlock extends PosBlocks{
    canvas: HTMLCanvasElement;
    constructor(div: HTMLDivElement, canvas: HTMLCanvasElement){
        //super ====== constructor(div: HTMLDivElement){this.div = div}
        super(div);
        this.canvas = canvas;
    }
}

class RightBlock extends PosBlocks{
    img: HTMLImageElement;
    constructor(div: HTMLDivElement, img: HTMLImageElement){
        super(div);
        this.img = img;
    }
}

export {
    LeftBlock,
    RightBlock
}