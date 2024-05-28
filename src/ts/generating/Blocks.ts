import sprite_img from "../sprite";
import { blank_image } from "../empty_block";
import { LeftBlock, RightBlock } from "./InfoBlocks";

/**
 * @interface BlocksPos and @interface BlocksSizing are used to initialize @param x, @param y, @param w, @param h (types are better) 
 * @module Blocks.ts contains 2 methods that create left side and right side of application
 * @param x, @param y, @param w, @param h, are passed in main @module main.ts (line 90)
 */

interface BlocksPos{
    x: number;
    y: number;
}

interface BlocksSizing extends BlocksPos{
    w: number;
    h: number;
}


export default class Blocks{
    
    static gen_left({x, y, w, h}: BlocksSizing): LeftBlock{
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
        img.src = blank_image;
        img.draggable = false;

        div.appendChild(img)

        return new RightBlock(div, img);
    }
}