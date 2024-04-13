import sprite_img from "./src/ts/sprite";
import read_tts from "./src/ts/read_tts";
import Blocks from "./src/ts/generating/Blocks";
import empty_block from "./src/ts/empty_block";



const main_function = () =>{
    const right_blocks:HTMLImageElement[] = [];
    let selected_right = new Set<number>()

    const left = document.getElementById("app_left")!;
    const check:HTMLInputElement = document.querySelector(".auto-allow")!;
   
    for(let i = 0; i < 40; i += 1){
        for(let j = 0; j < 16; j += 1){
            const x = i < 20 ? j * 48 : j * 48 + 768;
            //obiekt klasy
            const blocksObj = Blocks.gen_left({x , y: (i % 20)*48, w: 48, h: 48});
            //const {div, canvas} = blocksObj.gen_left();

            //listeners
            blocksObj.canvas.addEventListener("click", ()=>{
                if(!selected_right.size) return;
                const url = blocksObj.canvas.toDataURL()
                selected_right.forEach(sel=>right_blocks[sel].src  = url)
                console.log(check);  
                if(check.checked && selected_right.size == 1){
                    selected_right[0] += 1;
                }
                selected_right.forEach(sel=>{right_blocks[sel].classList.remove("right-highlighted")})
                selected_right = new Set();
            })
            left.appendChild(blocksObj.div);
        }
    }


    const right = document.getElementById("app_right")!;
    right.addEventListener("contextmenu", (e)=>{
        e.preventDefault();
    })
    right.addEventListener("mousedown", (e)=>{
        let selected_right_local = new Set<number>();
        const div = document.createElement("div");
        const start_pos = {x: e.pageX, y: e.pageY};
        const last_pos = {x: e.pageX, y: e.pageY};
        div.classList.add("plane");
        right.appendChild(div);
        console.log(e);

        let timeout = Date.now();
        
        div.style.top = `${e.pageY}px`;
        div.style.left = `${e.pageX}px`;

        const controller = new AbortController();

        const color = async(inds: Set<number>)=>{
            selected_right_local.forEach(sel=>{if(!inds.has(sel) && !selected_right.has(sel)) right_blocks[sel].classList.remove("right-highlighted")})
            inds.forEach(ind => {
                if(!selected_right_local.has(ind)){right_blocks[ind].classList.add("right-highlighted")}
            });
            selected_right_local = inds;
        }

        const select_handler = ()=>{
            const _start_pos = {y: start_pos.y, x: start_pos.x};
            const _last_pos = {y: last_pos.y, x: last_pos.x};

            _start_pos.y -= right.offsetTop;
            _start_pos.x -= right.offsetLeft;
            _last_pos.y -= right.offsetTop;
            _last_pos.x -= right.offsetLeft;

            //lewa górna pozycja
            const start = {
                x: _start_pos.x < _last_pos.x ? _start_pos.x : _last_pos.x,
                y: _start_pos.y < _last_pos.y ? _start_pos.y : _last_pos.y
            }

            //prawa dolna pozycja
            const end = {
                x: _start_pos.x > _last_pos.x ? _start_pos.x : _last_pos.x,
                y: _start_pos.y > _last_pos.y ? _start_pos.y : _last_pos.y
            }

            const size = {
                width: end.x - start.x,
                height: end.y - start.y
            }
            
            const block_size = 25;

            const indexes = new Set<number>()
            for(let top = Math.floor(start.y / block_size); top < Math.ceil(end.y / block_size); top++){
                const start_ind = top*44 + Math.floor(start.x / block_size);
                new Array(Math.ceil(size.width / block_size)).fill(0).map((_, ind)=>indexes.add(start_ind+ind));
                //0 są nakładane, by można było wstawić na nie indexy, a _ sprawia że 0 tak na prawdę nie istnieją 
            }
            if(Date.now() - timeout < 200){
                if(indexes.size){
                    //1 - true
                    color(indexes);
                }
            }
            timeout = Date.now();
            
            return indexes;
        }

        right.addEventListener("mousemove", (me)=>{
            me.stopPropagation();
            me.preventDefault();                                                                                                                                                                                            
            //nie łapie dzieci (co)
            const page_y = me.pageY - start_pos.y;
            const page_x = me.pageX - start_pos.x;
            //console.log(start_pos);                                                                                                   
            if(page_y < 0){                                                 
                div.style.top = `${me.pageY}px`;
            }
            else div.style.top = `${start_pos.y}px`;

            if(page_x < 0){                              
                div.style.left = `${me.pageX}px`;
            }
            else div.style.left = `${start_pos.x}px`;

            div.style.height = `${Math.abs(page_y)}px`;
            div.style.width = `${Math.abs(page_x)}px`;

            last_pos.x = me.pageX;
            last_pos.y = me.pageY;
            
            select_handler();

        }, {signal: controller.signal});

        right.addEventListener("mouseup", (e)=>{
            select_handler();
            if(e.ctrlKey){
                selected_right_local.forEach(sel=>selected_right.add(sel))
            }
            else{
                selected_right = selected_right_local;
            }
            controller.abort();
            div.remove();
        }, {once: true});  
    })

    for(let i = 0; i < 44 * 38; i += 1){
        const blockObj = Blocks.gen_right();
        let index = i;
        blockObj.img.addEventListener("mousedown", (e)=>{
            if(!e.ctrlKey){
                selected_right.forEach(sel=>right_blocks[sel].classList.remove("right-highlighted"));    
                selected_right = new Set();
            }
            selected_right.add(index);
            blockObj.img.classList.add("right-highlighted");
        })
        right_blocks.push(blockObj.img);
        right.appendChild(blockObj.div);
    }
}

sprite_img.addEventListener("load", main_function);


const hehe = document.querySelector(".cocainen")!;
hehe.addEventListener("click", ()=>read_tts("cocaine is not good for u"))