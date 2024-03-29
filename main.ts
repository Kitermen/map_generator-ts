import sprite_img from "./src/ts/sprite";
import read_tts from "./src/ts/read_tts";
import Blocks from "./src/ts/generating/Blocks";
import empty_block from "./src/ts/empty_block";



const main_function = () =>{
    const right_blocks:HTMLImageElement[] = [];
    let selected_right: number = -1;

    const left = document.getElementById("app_left")!;
    const check:HTMLInputElement = document.querySelector(".auto-allow")!;
   
    for(let i = 0; i < 40; i += 1){
        for(let j = 0; j < 16; j += 1){
            const x = i < 20 ? j * 48 : j * 48 + 768;
            const {div, canvas} = Blocks.gen_left({x , y: (i % 20)*48, w: 48, h: 48});

            //listeners
            canvas.addEventListener("click", ()=>{
                if (selected_right == -1) return;
                right_blocks[selected_right].src = canvas.toDataURL();
                console.log(check);  
                if(check.checked){
                    selected_right += 1;
                } 
            })
            left.appendChild(div);
        }
    }


    const right = document.getElementById("app_right")!;
    right.addEventListener("contextmenu", (e)=>{
        e.preventDefault();
    })
    right.addEventListener("mousedown", (e)=>{
        const div = document.createElement("div");
        const start_pos = {x: e.pageX, y: e.pageY};
        const last_pos = {x: e.pageX, y: e.pageY};
        div.classList.add("plane");
        right.appendChild(div);
        console.log(e);
        
        div.style.top = `${e.pageY}px`;
        div.style.left = `${e.pageX}px`;


        const controller = new AbortController();

        right.addEventListener("mousemove", (me)=>{
            me.stopPropagation();
            me.preventDefault();
            //nie łapie dzieci (co)
            console.log("XXX");
            const page_y = me.pageY - start_pos.y;
            const page_x = me.pageX - start_pos.x;
            if(page_y < 0){
                div.style.top = `${me.pageY}px`;
            }
            if(page_x < 0){
                div.style.left = `${me.pageX}px`;
            }
            div.style.height = `${Math.abs(page_y)}px`;
            div.style.width = `${Math.abs(page_x)}px`;

            last_pos.x = me.pageX;
            last_pos.y = me.pageY;

        }, {signal: controller.signal});

        right.addEventListener("mouseup", ()=>{
            start_pos.y -= right.offsetTop;
            start_pos.x -= right.offsetLeft;
            last_pos.y -= right.offsetTop;
            last_pos.x -= right.offsetLeft;

            const start = {
                x: start_pos.x < last_pos.x ? start_pos.x : last_pos.x,
                y: start_pos.y < last_pos.y ? start_pos.y : last_pos.y
            }

            const end = {
                x: start_pos.x > last_pos.x ? start_pos.x : last_pos.x,
                y: start_pos.y > last_pos.y ? start_pos.y : last_pos.y
            }

            const size = {
                width: end.x - start.x,
                height: end.y - start.y
            }

            // size.x size.y === 0 -> single click

            if(size.width < 10 || size.height < 10){
                controller.abort();
                div.remove();
                return;
            }

            console.log(start, end,size.width, size.height);
            
            
            const block_size = 25;

            const indexes: number[] = []; 
            for(let top = Math.floor(start.y / block_size); top < Math.ceil(end.y / block_size); top++){
                const start_ind = top*44 + Math.floor(start.x / block_size);
                indexes.push(...new Array(Math.ceil(size.width / block_size)).fill(0).map((_, ind)=>start_ind+ind));
            }
            console.log(indexes);

            controller.abort();
            div.remove();
        }, {once: true});  
    })

    for(let i = 0; i < 44 * 38; i += 1){
        const {div, img} = Blocks.gen_right();
        let index = i;
        img.addEventListener("click", ()=>{
            if(selected_right != -1){
                right_blocks[selected_right].classList.remove("right-highlighted")
            } 
            selected_right = index;
            img.classList.add("right-highlighted");
        })
        right_blocks.push(img);
        right.appendChild(div);
    }
}

sprite_img.addEventListener("load", main_function);







const hehe = document.querySelector(".cocainen")!;
hehe.addEventListener("click", ()=>read_tts("cocaine is not good for u"))