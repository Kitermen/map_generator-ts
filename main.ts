import sprite_img from "./src/ts/sprite";
import read_tts from "./src/ts/read_tts";
import Blocks from "./src/ts/generating/Blocks";
import {Menu} from "./src/ts/Menu";

//stackoverflow masterrace
const blank_image = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";


type plane_vector = {
    x: number;
    y: number;
}

interface plane_copy{
    url: string;
    x: number;
    y: number;
}


class MainController{
    menu: Menu

    left_side: HTMLDivElement;
    left_images: string[];

    check: HTMLInputElement;

    right_side: HTMLDivElement;
    right_blocks: HTMLImageElement[] = [];
    start_ind: number;
    previous_right_selected: Set<number>;
    right_hash_map: Map<number, number> = new Map();
    selected_right = new Set<number>();

    copy_on: boolean = false;
    copied_indexes: plane_copy[] = [];
    last_copy_position: number = -1;
    //vis - visualization
    last_vis_copy: number[] = [];

    history: Array<Map<number, number>> = [];
    history_id: number = 0;

    timeout: number;

    constructor(){
        this.left_side = document.querySelector("#app_left")!
        this.left_images = [];

        this.check = document.querySelector(".auto-allow")!

        this.right_side = document.querySelector("#app_right")!;
        this.previous_right_selected = new Set<number>();
        this.timeout = 0;
        

        this.left_generating();
        this.right_generating();

        this.right_side.addEventListener("mousedown", (e)=>this.mass_right_selecting(e));

        this.menu = new Menu("menu", "menu-btn")
        .addMenu(document.querySelector(".right-side-cont")!)

        .callback("undo", ()=>this.undo(), "click", "z")
        .callback("redo", ()=>this.redo(), "click", "y")

        .callback("copy", ()=>this.copy(), "click", "c")
        .callback("paste", ()=>this.paste(), "click", "v")

        .callback("save", ()=>this.save_to_file(this.right_hash_map), "click", "s")
        .callback("load", (element)=>this.load_file(element as HTMLInputElement), "change", "l")

    }

    left_generating(){
        let left_index = 0;

        for(let i = 0; i < 40; i += 1){
            for(let j = 0; j < 16; j += 1){
                const x = i < 20 ? j * 48 : j * 48 + 768;
                //class obj
                const blocksObj = Blocks.gen_left({x , y: (i % 20) * 48, w: 48, h: 48});
                this.left_images.push(blocksObj.canvas.toDataURL());
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
                    })
                    this.history.push(new Map(this.right_hash_map));
                    this.history_id += 1;
                    console.log(this.history);

                    if(!this.check.checked){
                        this.selected_right.clear();
                        //this.previous_right_selected.clear();
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
                //KOPIED INDEXES --- wylaczenie zaznaczania kiedy lopiowanie wlaczone flaga
                if(!this.copy_on){
                    console.log(e.target);
                    if(e.button === 2) return;
                    if(!e.ctrlKey){
                        this.selected_right.forEach(sel=>this.right_blocks[sel].classList.remove("right-highlighted"));    
                        this.selected_right.clear();
                        //this.previous_right_selected.clear();
                    }
                    this.selected_right.add(index);
                    blockObj.img.classList.add("right-highlighted");
                }
            })
            this.right_blocks.push(blockObj.img);
            this.right_side.appendChild(blockObj.div);
        }
    }

    async color(inds: Set<number>){
        this.previous_right_selected.forEach(sel=>{if(!inds.has(sel) && !this.selected_right.has(sel)) this.right_blocks[sel].classList.remove("right-highlighted")})
        inds.forEach(ind => {
            if(!this.previous_right_selected.has(ind)){this.right_blocks[ind].classList.add("right-highlighted")}
        });
        this.previous_right_selected = inds;
    }

    select_handler(start_pos: plane_vector, last_pos: plane_vector){
        const _start_pos = {y: start_pos.y, x: start_pos.x};
        const _last_pos = {y: last_pos.y, x: last_pos.x};

        _start_pos.x -= this.right_side.offsetLeft;
        _start_pos.y -= this.right_side.offsetTop;
        _last_pos.x -= this.right_side.offsetLeft;
        _last_pos.y -= this.right_side.offsetTop;

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
        for(let top = Math.floor(start.y / block_size); top < Math.ceil(end.y / block_size); top += 1){
            this.start_ind = top*44 + Math.floor(start.x / block_size);
            //console.log(this.start_ind);
            
            new Array(Math.ceil(size.width / block_size)).fill(0).map((_, ind)=>indexes.add(this.start_ind+ind));
            //0 są nakładane, by można było wstawić na nie indexy, a _ sprawia że 0 tak na prawdę nie istnieją 
        }
        if(Date.now() - this.timeout < 250){
            if(indexes.size) this.color(indexes);
        }
        this.timeout = Date.now();
        
        return indexes;
    }
    

    mass_right_selecting(e: MouseEvent){
        // || allowed code to finally execute paste method 
        if(e.button === 2 || this.copied_indexes.length) return;
        const div = document.createElement("div");
        const start_pos = {x: e.pageX, y: e.pageY};
        const last_pos = {x: e.pageX, y: e.pageY};
        div.classList.add("plane");
        this.right_side.appendChild(div);

        
        div.style.top = `${e.pageY}px`;
        div.style.left = `${e.pageX}px`;

        //mousemove - turnoff to remove massive lags from code
        const controller = new AbortController();


        this.right_side.addEventListener("mousemove", (me)=>{
            me.stopImmediatePropagation();
            me.preventDefault();                                                                                                                                                                                            
            //nie łapie dzieci (co)
            const page_x = me.pageX - start_pos.x;
            const page_y = me.pageY - start_pos.y;
            //console.log(start_pos);                                                                                                   


            if(page_x < 0){                              
                div.style.left = `${me.pageX}px`;
            }
            else div.style.left = `${start_pos.x}px`;

            if(page_y < 0){                                                 
                div.style.top = `${me.pageY}px`;
            }
            else div.style.top = `${start_pos.y}px`;


            div.style.width = `${Math.abs(page_x)}px`;
            div.style.height = `${Math.abs(page_y)}px`;
            

            last_pos.x = me.pageX;
            last_pos.y = me.pageY;
            
            this.select_handler(start_pos, last_pos);

        }, {signal: controller.signal});

        this.right_side.addEventListener("mouseup", (e)=>{
            this.select_handler(start_pos, last_pos);
            if(e.ctrlKey){
                this.previous_right_selected.forEach(sel=>this.selected_right.add(sel));
            }
            else if(this.previous_right_selected.size){
                this.selected_right = this.previous_right_selected;
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
        if(file_input.files?.length == 0){
            file_input.click();
            return;
        }
        const file = file_input.files![0];
        const file_text = await file.text();
        const json_data = JSON.parse(file_text);
        this.right_blocks.forEach(block=>block.src = blank_image);

        const hash_map: Map<string, number> = new Map(Object.entries(json_data));
        
        for(const [key, value] of hash_map){
            this.right_blocks[parseInt(key)].src = this.left_images[value];
        }

        file_input.value = "";
    }

    copy(){
        this.copy_on = true;
        const copied_indexes = [...this.selected_right];
        const top_left_pos: plane_vector = {x: Infinity, y: Infinity};

        let indexes_copy: plane_copy[] = copied_indexes.map((copied_index)=>{
            const left_url = this.right_hash_map.get(copied_index);
            const url = left_url ? this.left_images[left_url] : blank_image;

            //values relative to plane copy
            const index_pos: plane_copy = {
                x: copied_index % 44,
                y: Math.floor(copied_index / 44),
                url
            }

            if(top_left_pos.y > index_pos.y) top_left_pos.y = index_pos.y;
            if(top_left_pos.x > index_pos.x) top_left_pos.x = index_pos.x;

            return index_pos;
        })

        indexes_copy = indexes_copy.map((copied_index)=>{
            return{
                x: copied_index.x - top_left_pos.x,
                y: copied_index.y - top_left_pos.y,
                url: copied_index.url
            }
        })

        this.copied_indexes = indexes_copy;
        console.log(this.copied_indexes);
        
        this.selected_right.forEach((block)=>{
            this.right_blocks[block].classList.remove("right-highlighted");
        })
        this.selected_right.clear();
        //this.previous_right_selected.clear();        
    }

    paste(){
        if(!this.copied_indexes.length) return;
        const controller = new AbortController();
        this.right_side.addEventListener("mousemove", (e)=>this.paste_visualization(e, false), {signal: controller.signal});
        this.right_side.addEventListener("click", (e)=>{
            this.copy_on = false;
            controller.abort();
            
            this.paste_visualization(e, true);
            this.last_vis_copy.forEach((block)=>{
                this.right_blocks[block].classList.remove("right-copied");
            })
            this.copied_indexes = [];
            this.last_vis_copy = [];
        });
    }

    paste_visualization(e: MouseEvent, submit_copy: boolean){
        if(!this.copied_indexes.length) return;
        const block_size = 25;
        const left_pos = e.pageX - this.right_side.offsetLeft;
        const top_pos = e.pageY - this.right_side.offsetTop;


        //top left block of green plane
        const first_index_coords: plane_vector = {
            x: Math.floor(left_pos / block_size), 
            y: Math.floor(top_pos / block_size)
        }
        if(first_index_coords.x < 0 || first_index_coords.y < 0) return;
        const first_index = first_index_coords.y * 44 + first_index_coords.x;

        if(first_index == this.last_copy_position) return;
        this.last_copy_position = first_index;
        

        //get position of blocks in this plane 
        const calc_index = (index: plane_copy) =>{
            return first_index + 44 * index.y + index.x;
        }
        this.right_reset();
        
        this.last_vis_copy = this.copied_indexes.filter((index)=>{
            if(first_index_coords.x + index.x >= 44 || first_index_coords.y + index.y >= 38) return false;
            return true;
           
        }).map((index)=>{
            const plane_element = calc_index(index);
            this.right_blocks[plane_element].src = index.url;
            
            if(submit_copy){               
                for(let i = 0; this.left_images.length; i += 1){
                    if(this.left_images[i] == index.url){
                        this.right_hash_map.set(plane_element, i);
                        break;
                    }
                }
            }
            else this.right_blocks[plane_element].classList.add("right-copied");

            return plane_element;
        })
    }

    right_reset(){
        this.last_vis_copy.forEach((index)=>{
            const get_url = this.right_hash_map.get(index);
            const url = get_url !== undefined ? this.left_images[get_url] : blank_image;
            const block = this.right_blocks[index];
            if(block.src != url) block.src = url;
            if(block.classList.contains("right-copied")) block.classList.remove("right-copied");
        })
    }

    undo(){
        this.history_id -= 1;
        //console.log(this.history.length);
        //console.log(this.history_id);
        if(this.history.length - this.history_id <= 0 || this.history_id < 0){
            this.history_id += 1;
            return;
        }
        
        
        const json_data = this.history[this.history_id - 1];

        this.right_blocks.forEach(block=>block.src = blank_image);

        const hash_map: Map<number, number> = new Map(json_data);

        for(const [key, value] of hash_map){
            this.right_blocks[key].src = this.left_images[value];
        }
    }

    redo(){
        this.history_id += 1;
        //console.log(this.history.length);
        //console.log(this.history_id);
        
        
        if(this.history.length < this.history_id){
            this.history_id -= 1;
            return;   
        }
        console.log("YM");
        
        const json_data = this.history[this.history_id - 1];

        this.right_blocks.forEach(block=>block.src = blank_image);

        const hash_map: Map<number, number> = new Map(json_data);
        
        for(const [key, value] of hash_map){
            this.right_blocks[key].src = this.left_images[value];
        }
    }
}

sprite_img.addEventListener("load", ()=>{const controller = new MainController()});


const hehe = document.querySelector(".cocainen")!;
hehe.addEventListener("click", ()=>read_tts("cocaine is not good for u"))