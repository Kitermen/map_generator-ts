import sprite_img from "./src/ts/sprite";
import read_tts from "./src/ts/read_tts";
import Blocks from "./src/ts/generating/Blocks";
import empty_block from "./src/ts/empty_block";

const blank_image = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const save = (info: Map<number, number>)=>{
    const data_object = JSON.stringify(Object.fromEntries(info.entries()))

    const dowload_button = document.createElement("a")!;
    const blob = new Blob([data_object]);

    dowload_button.href = URL.createObjectURL(blob);
    dowload_button.download = "data.json";
    dowload_button.click();
}

const main_function = () =>{
    const right_blocks:HTMLImageElement[] = [];
    const right_hash_map:Map<number, number> = new Map();
    let selected_right = new Set<number>();

    const left = document.getElementById("app_left")!;
    const check:HTMLInputElement = document.querySelector(".auto-allow")!;
   
    const left_indexes:string[] = [];


    document.querySelector("button.save")?.addEventListener("click", ()=>save(right_hash_map));
    const file_input: HTMLInputElement = document.querySelector("input.file_input")!;
    file_input.addEventListener("change",async()=>{
        const file = file_input.files![0];
        const file_text = await file.text();
        const json_data = JSON.parse(file_text);

        const hash_map: Map<string, number> = new Map(Object.entries(json_data));
        
        for(const [key, value] of hash_map){
            right_blocks[parseInt(key)].src = left_indexes[value];
        }
    })

    let left_index = 0;
    for(let i = 0; i < 40; i += 1){
        for(let j = 0; j < 16; j += 1){
            const x = i < 20 ? j * 48 : j * 48 + 768;
            //obiekt klasy
            const blocksObj = Blocks.gen_left({x , y: (i % 20)*48, w: 48, h: 48});
            left_indexes.push(blocksObj.canvas.toDataURL());
            //const {div, canvas} = blocksObj.gen_left();

            //listeners
            const left_index_copy = left_index;
            blocksObj.canvas.addEventListener("click", ()=>{
                if(!selected_right.size) return;
                const url = blocksObj.canvas.toDataURL();
                selected_right.forEach(sel=>{
                    right_blocks[sel].src  = url;
                    right_blocks[sel].classList.remove("right-highlighted");
                    right_hash_map.set(sel, left_index_copy);
                });
                console.log(right_hash_map);
                
                console.log(check);  

                if(!check.checked){
                    selected_right = new Set();
                }
                else{
                    const index = [...selected_right].pop()!+1;
                    selected_right = new Set([index]);
                    right_blocks[index].classList.add("right-highlighted");
                    //! == nie może być undefined
                }
            })
            left.appendChild(blocksObj.div);
            left_index++;
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
            if(Date.now() - timeout < 250){
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
                selected_right_local.forEach(sel=>selected_right.add(sel));
            }
            else if(selected_right_local.size){
                selected_right = selected_right_local;
            }
            controller.abort();
            div.remove();
        }, {once: true});  
    })

    for(let i = 0; i < 44 * 38; i += 1){
        const blockObj = Blocks.gen_right();
        blockObj.img.onerror = function(){this.src = blank_image};
        blockObj.img.src = "";
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