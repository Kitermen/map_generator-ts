import empty_block from "./empty_block";

type ReturnParams = {
    div: HTMLDivElement;
    img: HTMLImageElement;
}

const gen_right_block = (): ReturnParams=>{
    const div = document.createElement("div");
    div.classList.add("empty-block");

    const img = new Image();
    img.classList.add("sprite-image");
    img.src = empty_block;

    div.appendChild(img)

    return {div, img} as ReturnParams;
}

export default gen_right_block;
    //default bierze 1 rzecz