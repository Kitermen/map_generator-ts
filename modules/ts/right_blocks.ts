type Sprite = {
    x: number;
    y: number;
    w: number;
    h: number;
}

type ReturnParams = {
    div: HTMLDivElement;
    img: HTMLImageElement;
}

const gen_right_block = (sprite: Sprite): ReturnParams=>{
    const div = document.createElement("div");
    div.classList.add("empty-block");

    const img = new Image();
    img.classList.add("sprite-image");

    div.appendChild(img)

    return {div, img} as ReturnParams;
}

export default gen_right_block;
    //default bierze 1 rzecz