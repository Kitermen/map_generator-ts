import sprite_img from "./sprite";

let empty_block = "";

const canvas = document.createElement("canvas");
canvas.width = 48;
canvas.height = 48;
//26 x 14
const ctx = canvas.getContext("2d");
if(ctx) ctx.drawImage(sprite_img, 26 * 48, 14 * 48, 48, 48, 0, 0, 48, 48);

empty_block = canvas.toDataURL();


export default empty_block;