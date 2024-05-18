export class Menu{ 
    dialog: HTMLDialogElement 
    menu_btns: Map<string, HTMLElement>
    dom?: HTMLElement
    opened: boolean = false

    constructor(menu_class: string, menu_buttons: string){
        this.dialog = document.querySelector(`.${menu_class}`)!;
        this.menu_btns = new Map();

        const html_nodes: Array<HTMLElement> = Array.from(document.querySelectorAll(`.${menu_class} .${menu_buttons}`));
        html_nodes.forEach((button)=>{
            const secondary_name = button.className.split(" ")[1];
            this.menu_btns.set(secondary_name, button);
        })
    }

    addMenu(dom: HTMLElement): Menu{
        this.dom = dom;
        
        this.dom.addEventListener("contextmenu", (e)=>{
            e.preventDefault();
            if(this.opened) this.dialog.close()
            else this.dialog.show();
            this.opened = !this.opened;
        })

        
        
        return this;
    }
    
    callback(button_name: string, call: (element: HTMLElement)=>void, event: keyof HTMLElementEventMap, shortcut: string | null = null): Menu{
        const element = this.menu_btns.get(button_name);
        if(element){
            element.addEventListener(event, ()=>{
                call(element);
                this.dialog.close();
                this.opened = false;
            })
            
            if(shortcut && this.dom) document.addEventListener("keydown", (e)=>{
                e.preventDefault();
                if(e.ctrlKey && e.key == shortcut) call(element);
            })
        }
        return this;
    }

}