import sprite_img from "./modules/ts/sprite";
import read_tts from "./modules/ts/read_tts";
import gen_left_block from "./modules/ts/left_blocks";

let curr_data = "";
let curr_div:HTMLDivElement | undefined = undefined;

const main_function = () =>{
    const main = document.getElementById("app")!;
    for(let i = 0; i < 40; i += 1){
        for(let j = 0; j < 16; j += 1){
            const x = i < 20 ? j * 48 : j * 48 + 768;
            const {div, data} = gen_left_block({x , y: (i % 20)*48, w: 48, h: 48});

            div.addEventListener("click", ()=>{
                if(curr_div){
                    curr_div.classList.remove("highlighted");
                }
                curr_data = data;
                curr_div = div;
                div.classList.add("highlighted");
            })
            main.appendChild(div);  
        }
    }
}

sprite_img.addEventListener("load", main_function);

const hehe = document.querySelector(".cocainen")!;
hehe.addEventListener("click", ()=>read_tts("cocaine is not good for u"))