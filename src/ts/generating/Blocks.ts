import sprite_img from "../sprite";
import empty_block from "../empty_block";

type Sprite = {
    x: number;
    y: number;
    w: number;
    h: number;
}

type ReturnParams = {
    div: HTMLDivElement;
}

type ReturnLeft = ReturnParams & {canvas: HTMLCanvasElement};
type ReturnRight = ReturnLeft & {img: HTMLImageElement};

export default class Blocks{

    static gen_left(sprite: Sprite): ReturnLeft{
        const div = document.createElement("div");
        div.classList.add("sprite-block");
    
        const canvas = document.createElement("canvas");
        canvas.width = 48;
        canvas.height = 48;
        canvas.classList.add("canvas-left");

        const ctx = canvas.getContext("2d");
        if(ctx) ctx.drawImage(sprite_img, sprite.x, sprite.y, sprite.w, sprite.h, 0, 0, 48, 48);

        div.appendChild(canvas);
    
        return {div, canvas} as ReturnLeft;
    }

    static gen_right(): ReturnRight{
        const div = document.createElement("div");
        div.classList.add("empty-block");
        div.draggable = false;
        const img = new Image();
        img.classList.add("sprite-image");
        img.src = empty_block;
        img.draggable = false;

        div.appendChild(img)

        return {div, img} as ReturnRight;
    }
}