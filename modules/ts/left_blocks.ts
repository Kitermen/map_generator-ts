import sprite_img from "./sprite";

type Sprite = {
    x: number;
    y: number;
    w: number;
    h: number;
}

type ReturnParams = {
    div: HTMLDivElement;
    data: string;
}

const gen_left_block = (sprite: Sprite): ReturnParams=>{
    const div = document.createElement("div");
    div.classList.add("sprite-block");

    const canvas = document.createElement("canvas");
    canvas.width = 48;
    canvas.height = 48;

    const ctx = canvas.getContext("2d");
    if(ctx) ctx.drawImage(sprite_img, sprite.x, sprite.y, sprite.w, sprite.h, 0, 0, 48, 48);

    const data = canvas.toDataURL();

    const img = new Image();
    img.classList.add("sprite-image");
    img.src = data;

    div.appendChild(img)

    return {div, data} as ReturnParams;
}

export default gen_left_block;
    //default bierze 1 rzecz

