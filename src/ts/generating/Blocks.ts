import sprite_img from "../sprite";
import empty_block from "../empty_block";
import { LeftBlock, RightBlock } from "./InfoBlocks";

interface BlocksPos{
    x: number;
    y: number;
}

interface BlocksSizing extends BlocksPos{
    w: number;
    h: number;
}

// interface BlocksData extends BlocksSizing{}

// type ReturnParams = {
//     div: HTMLDivElement;
// }

// type ReturnLeft = ReturnParams & {canvas: HTMLCanvasElement};
// type ReturnRight = ReturnParams & {img: HTMLImageElement};

export default class Blocks{
    
    static gen_left({x,y,w,h}: BlocksSizing): LeftBlock{
        const div = document.createElement("div");
        div.classList.add("sprite-block");
    
        const canvas = document.createElement("canvas");
        canvas.width = 48;
        canvas.height = 48;
        canvas.classList.add("canvas-left");
        
        const ctx = canvas.getContext("2d");
        if(ctx) ctx.drawImage(sprite_img, x, y, w, h, 0, 0, 48, 48);

        div.appendChild(canvas);
        
        return new LeftBlock(div, canvas);
    }

    static gen_right(): RightBlock{
        const div = document.createElement("div");
        div.classList.add("empty-block");
        div.draggable = false;
        const img = new Image();
        img.classList.add("sprite-image");
        img.src = empty_block;
        img.draggable = false;

        div.appendChild(img)

        return new RightBlock(div, img);
    }
}