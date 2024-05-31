export class Menu{ 
    dialog: HTMLDialogElement 
    menu_btns: Map<string, HTMLElement>
    dom?: HTMLElement
    opened: boolean = false

/**
 * @param menu_class used to get element (container) for @param menu_buttons
 * @param menu_buttons used to get all buttons inside element with @param menu and create set that contains their 
 * second class (copy, paste...) and specific HTMLElement (one to paste or one to copy...)
 */
    
    constructor(menu_class: string, menu_buttons: string){
        this.dialog = document.querySelector(`.${menu_class}`)!;
        this.menu_btns = new Map();

        const html_nodes: Array<HTMLElement> = Array.from(document.querySelectorAll(`.${menu_class} .${menu_buttons}`));
        html_nodes.forEach((button)=>{
            
            const secondary_name = button.className.split(" ")[1];
            console.log(button);
            
            this.menu_btns.set(secondary_name, button);
        })
    }

    //clicking on right-bloks shows / hides btns menu 
    addMenu(dom: HTMLElement): Menu{
        window.addEventListener("contextmenu", function(e) { e.preventDefault(); })
        this.dom = dom;
        this.dom.addEventListener("contextmenu", (e)=>{
            e.preventDefault();
            if(this.opened) this.dialog.close()
            else this.dialog.show();
            this.opened = !this.opened;
        })
        return this;
    }
    
    /**
     * f.e. callback method gets @param button_name and matches this value to one from @param this.menu_btns
     */

    callback(button_name: string, call: (element: HTMLElement)=>void, event: keyof HTMLElementEventMap, shortcut: string | null = null): Menu{
        const element = this.menu_btns.get(button_name);
        //console.log(element);
        
        if(element){
            //console.log(element);
            element.addEventListener(event, ()=>{
                call(element);
                this.dialog.close();
                this.opened = false;
            })
            
            if(shortcut && this.dom) document.addEventListener("keydown", (e)=>{
                e.preventDefault();
                
                //context - delete
                if(shortcut == "Delete" && !e.ctrlKey){
                    
                    call(element)
                } 
                if(e.ctrlKey && e.key == shortcut){
                    
                    call(element)
                }              
                
            })
        }
        return this;
    }
}