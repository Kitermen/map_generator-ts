const main = document.getElementById("app")!
const divTab: HTMLDivElement[] = [];
for(let i = 0; i < 20; i += 1){
    for(let j = 0; j < 16; j += 1){
        const div = document.createElement("div");
        div.style.backgroundImage = "url(/modules/gfx/sprites.png)";
        div.style.backgroundPosition = `${-j*48}px ${-i*48}px`;
        div.style.width = "25px"
        div.style.height = "25px"
        divTab.push(div);
    }
}

divTab.forEach(block => {
    main.appendChild(block)    
});