import sprite_img from "./src/ts/sprite";
import read_tts from "./src/ts/read_tts";
import Blocks from "./src/ts/generating/Blocks";
import empty_block from "./src/ts/empty_block";

let curr_data = "";
let curr_div:HTMLDivElement | undefined = undefined;

let filled_img:HTMLImageElement | undefined = undefined;

const right_blocks:HTMLImageElement[] = [];
let last_rImg_clicked:number = -1;


const main_function = () =>{
    const left = document.getElementById("app_left")!;
    const check:HTMLInputElement = document.querySelector(".auto-allow")!;
    left.addEventListener("contextmenu", (e)=>{
        e.preventDefault()
        if(!curr_div) return;
        curr_div.classList.remove("highlighted");
        curr_div = undefined;
        curr_data = "";
    })
    for(let i = 0; i < 40; i += 1){
        for(let j = 0; j < 16; j += 1){
            const x = i < 20 ? j * 48 : j * 48 + 768;
            const {div, data} = Blocks.gen_left({x , y: (i % 20)*48, w: 48, h: 48});

            div.addEventListener("click", ()=>{
                if(check.checked){
                    if(last_rImg_clicked != -1){
                        right_blocks[last_rImg_clicked].src = data;
                        right_blocks[last_rImg_clicked].classList.remove("right-highlighted");
                        last_rImg_clicked += 1;
                        right_blocks[last_rImg_clicked].classList.add("right-highlighted");
                        return;
                    }
                }
                if(curr_div){
                    curr_div.classList.remove("highlighted");
                }
                //44 na 38
                curr_data = data;
                curr_div = div;
                div.classList.add("highlighted");
            })
            left.appendChild(div);  
        }
    }

    const right = document.getElementById("app_right")!;
    right.addEventListener("contextmenu", (e)=>{
        e.preventDefault();
    })
    for(let i = 0; i < 44 * 38; i += 1){
        const {div, img} = Blocks.gen_right();
        let index = i;
        right_blocks.push(img);
        //console.log(right_blocks);
        
        const draw_handler = ()=>{
            if(!curr_data) return;

            div.addEventListener("contextmenu", (e)=>{
                e.preventDefault();
                console.log("XD");
                
                img.src = empty_block;
            }, {once: true});

            filled_img = img;
            img.src = curr_data;
        }

        div.addEventListener("click", (e)=>{
            e.preventDefault();
            if(check.checked){
            // if(check.checked && e.altKey){
                if(last_rImg_clicked != -1){
                    right_blocks[last_rImg_clicked].classList.remove("right-highlighted");
                }
                last_rImg_clicked = index;
                right_blocks[index].classList.add("right-highlighted");
                return;
            }
            right_blocks.forEach(block=>{block.classList.remove("right-highlighted")});
            draw_handler();
        });

        div.addEventListener("mouseenter", (e)=>{
            e.preventDefault();
            //buttons - przyciski myszy
            if(e.buttons != 1) return;

            draw_handler();
            console.log(e.button);
        })

        right.appendChild(div);
    }
}

sprite_img.addEventListener("load", main_function);

const hehe = document.querySelector(".cocainen")!;
hehe.addEventListener("click", ()=>read_tts("cocaine is not good for u"))