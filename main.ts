import sprite_img from "./src/ts/sprite";
import read_tts from "./src/ts/read_tts";
import Blocks from "./src/ts/generating/Blocks";
import {Menu} from "./src/ts/Menu";

const blank_image = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

// const save = (info: Map<number, number>)=>{
//     const data_object = JSON.stringify(Object.fromEntries(info.entries()))

//     const dowload_button = document.createElement("a")!;
//     const blob = new Blob([data_object]);

//     dowload_button.href = URL.createObjectURL(blob);
//     dowload_button.download = "data.json";
//     dowload_button.click();
// }

// const right_blocks:HTMLImageElement[] = [];
// const right_hash_map:Map<number, number> = new Map();
// const cp_hash_map:Map<number, number> = new Map();
// let selected_right = new Set<number>();

// const left = document.getElementById("app_left")!;
// const check:HTMLInputElement = document.querySelector(".auto-allow")!;
// const right_blocks_container:HTMLDivElement = document.querySelector(".right-side-cont")!;

// const left_indexes:string[] = [];


class MainController{
    menu: Menu

    right_side: HTMLDivElement;
    right_blocks: HTMLImageElement[] = [];
    right_hash_map: Map<number, number> = new Map();
    copy_hash_map: Map<number, number> = new Map();
    selected_right = new Set<number>();

    left_side: HTMLDivElement;
    left_images: string[];

    check: HTMLInputElement;

    constructor(){
        this.left_side = document.querySelector("#app_left")!
        this.left_images = [];

        this.check = document.querySelector(".auto-allow")!

        this.right_side = document.querySelector("#app_right")!;

        this.left_generating();
        this.right_generating();

        this.right_side.addEventListener("mousedown", (e)=>this.mass_right_selecting(e));

        this.menu = new Menu("menu", "menu-btn")
        .addMenu(document.querySelector(".right-side-cont")!)
        .callback("save", ()=>this.save_to_file(this.right_hash_map), "change")
        .callback("load", (element)=>this.load_file(element as HTMLInputElement), "change")

    }

    left_generating(){
        let left_index = 0;
        const left_images: string[] = [];

        for(let i = 0; i < 40; i += 1){
            for(let j = 0; j < 16; j += 1){
                const x = i < 20 ? j * 48 : j * 48 + 768;
                //class obj
                const blocksObj = Blocks.gen_left({x , y: (i % 20)*48, w: 48, h: 48});
                left_images.push(blocksObj.canvas.toDataURL());
                //const {div, canvas} = blocksObj.gen_left();

                //listeners
                const left_index_copy = left_index;
                blocksObj.canvas.addEventListener("click", ()=>{
                    if(!this.selected_right.size) return;

                    const url = blocksObj.canvas.toDataURL();
                    this.selected_right.forEach(sel=>{
                        this.right_blocks[sel].src  = url;
                        this.right_blocks[sel].classList.remove("right-highlighted");
                        this.right_hash_map.set(sel, left_index_copy);
                        this.copy_hash_map.set(sel, left_index_copy);
                    })

                    if(!this.check.checked){
                        this.selected_right = new Set();
                    }
                    else{
                        const index = [...this.selected_right].pop()!+1;
                        this.selected_right = new Set([index]);
                        this.right_blocks[index].classList.add("right-highlighted");
                        //! == nie może być undefined
                    }
                })
                this.left_side.appendChild(blocksObj.div);
                left_index += 1;
            }
        }
    }

    right_generating(){
        for(let i = 0; i < 44 * 38; i += 1){
            const blockObj = Blocks.gen_right();
            let index = i;
            blockObj.img.addEventListener("mousedown", (e)=>{
                if(!e.ctrlKey){
                    this.selected_right.forEach(sel=>this.right_blocks[sel].classList.remove("right-highlighted"));    
                    this.selected_right = new Set();
                }
                this.selected_right.add(index);
                blockObj.img.classList.add("right-highlighted");
            })
            this.right_blocks.push(blockObj.img);
            this.right_side.appendChild(blockObj.div);
        }
    }

    mass_right_selecting(e: MouseEvent){
        let selected_right_local = new Set<number>();
        const div = document.createElement("div");
        const start_pos = {x: e.pageX, y: e.pageY};
        const last_pos = {x: e.pageX, y: e.pageY};
        div.classList.add("plane");
        this.right_side.appendChild(div);
        console.log(e);

        let timeout = Date.now();
        
        div.style.top = `${e.pageY}px`;
        div.style.left = `${e.pageX}px`;

        //mousemove - turnoff to remove massive lags from code
        const controller = new AbortController();


        const color = async(inds: Set<number>)=>{
            selected_right_local.forEach(sel=>{if(!inds.has(sel) && !this.selected_right.has(sel)) this.right_blocks[sel].classList.remove("right-highlighted")})
            inds.forEach(ind => {
                if(!selected_right_local.has(ind)){this.right_blocks[ind].classList.add("right-highlighted")}
            });
            selected_right_local = inds;
        }

        const select_handler = ()=>{
            const _start_pos = {y: start_pos.y, x: start_pos.x};
            const _last_pos = {y: last_pos.y, x: last_pos.x};

            _start_pos.y -= this.right_side.offsetTop;
            _start_pos.x -= this.right_side.offsetLeft;
            _last_pos.y -= this.right_side.offsetTop;
            _last_pos.x -= this.right_side.offsetLeft;

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

        this.right_side.addEventListener("mousemove", (me)=>{
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

        this.right_side.addEventListener("mouseup", (e)=>{
            select_handler();
            if(e.ctrlKey){
                selected_right_local.forEach(sel=>this.selected_right.add(sel));
            }
            else if(selected_right_local.size){
                this.selected_right = selected_right_local;
            }
            controller.abort();
            div.remove();
        }, {once: true});  
    }

    

    async save_to_file(info: Map<number, number>){
        const data_object = JSON.stringify(Object.fromEntries(info.entries()))

        const dowload_button = document.createElement("a")!;
        const blob = new Blob([data_object]);
    
        dowload_button.href = URL.createObjectURL(blob);
        dowload_button.download = "data.json";
        dowload_button.click();
    }

    async load_file(file_input: HTMLInputElement){
        const file = file_input.files![0];
        const file_text = await file.text();
        const json_data = JSON.parse(file_text);
        this.right_blocks.forEach(block=>block.src = blank_image);

        const hash_map: Map<string, number> = new Map(Object.entries(json_data));
        
        for(const [key, value] of hash_map){
            this.right_blocks[parseInt(key)].src = this.left_images[value];
        }
    }
}

const main_function = () =>{
    const controller = new MainController();
}

sprite_img.addEventListener("load", main_function);


const hehe = document.querySelector(".cocainen")!;
hehe.addEventListener("click", ()=>read_tts("cocaine is not good for u"))