
let Width = 20;
let Height = 20;
let Apples = 1;
let Loop = false;

let GameContainer = document.getElementById("GameContainer")

let Snake = [];
let Tiles = [];
let SnakeDir = 1;
let LastSnakeDir = 1;

let MaxInputQueue = 3;
let InputQueue = [];
let AlreadyGotInputForThisFrame = false;

let GameInterval = null;
Reset();

setInterval(GamepadInput, 10);

window.onkeydown = function(event){
    if(event.key == "r"){
        Reset();
        return;
    }

    if(event.key == "ArrowUp" || event.key == "ArrowDown"){
        event.preventDefault();//Stop scrolling
    }

    if(AlreadyGotInputForThisFrame || InputQueue.length > 0){
        InputQueue.push(event.key);
        if(InputQueue.length > MaxInputQueue){
            InputQueue = [];
        }
        return;
    }

    if((event.key == "w" || event.key == "ArrowUp") && LastSnakeDir != Width && LastSnakeDir != -Width){
        SnakeDir = -Width;
        AlreadyGotInputForThisFrame = true;
    }
    if((event.key == "a" || event.key == "ArrowLeft") && LastSnakeDir != 1 && LastSnakeDir != -1){
        SnakeDir = -1;
        AlreadyGotInputForThisFrame = true;
    }
    if((event.key == "s" || event.key == "ArrowDown") && LastSnakeDir != -Width && LastSnakeDir != Width){
        SnakeDir = Width;
        AlreadyGotInputForThisFrame = true;
    }
    if((event.key == "d"  || event.key == "ArrowRight") && LastSnakeDir != -1 && LastSnakeDir != 1){
        SnakeDir = 1;
        AlreadyGotInputForThisFrame = true;
    }
}

function GamepadInput()
{
    let Gamepads = navigator.getGamepads()
    for(let i = 0; i < Gamepads.length; i++){
        if(Gamepads[i] != undefined){
            let x = Gamepads[i].axes[0];
            let y = Gamepads[i].axes[1];
            let length = (x**2 + y**2)**0.5;
            if(length > 0.5){
                if(Math.abs(x) > Math.abs(y)){//Horizontal input
                    if(x < 0){ // Left
                        if(InputQueue.length < 3 && InputQueue[InputQueue.length - 1] != "a"){
                            InputQueue.push("a");
                        }
                    }
                    else{ // Right
                        if(InputQueue.length < 3 && InputQueue[InputQueue.length - 1] != "d"){
                            InputQueue.push("d");
                        }
                    }
                }
                else{ // Vertical input
                    if(y < 0){ // Up
                        if(InputQueue.length < 3 && InputQueue[InputQueue.length - 1] != "w"){
                            InputQueue.push("w");
                        }
                    }
                    else{ // Down
                        if(InputQueue.length < 3 && InputQueue[InputQueue.length - 1] != "s"){
                            InputQueue.push("s");
                        }
                    }
                }
            }
            if(Gamepads[i].buttons[1].pressed)
            {
                Reset();
            }
        }
    }
}

function ReadInputQueue(){
    let key = InputQueue.shift();
    if(key == null)
    {
        return;
    }

    if((key == "w" || key == "ArrowUp") && LastSnakeDir != Width && LastSnakeDir != -Width){
        SnakeDir = -Width;
        return;
    }
    if((key == "a" || key == "ArrowLeft") && LastSnakeDir != 1 && LastSnakeDir != -1){
        SnakeDir = -1;
        return;
    }
    if((key == "s" || key == "ArrowDown") && LastSnakeDir != -Width && LastSnakeDir != Width){
        SnakeDir = Width;
        return;
    }
    if((key == "d"  || key == "ArrowRight")&& LastSnakeDir != -1 && LastSnakeDir != 1){
        SnakeDir = 1;
        return;
    }
    
    ReadInputQueue();        
}

function Apple(){
    let Possibilities = [];
    for(let i = 0; i < Tiles.length; i++){
        if((Tiles[i].classList.item(1) == "Dark" || Tiles[i].classList.item(1) == null) && Tiles[i].classList.item(2) == null)
        {
            Possibilities.push(Tiles[i]);
        }
    }
    if(Possibilities.length > 0){
        Possibilities[Math.floor(Math.random() * Possibilities.length)].classList.add("Apple");
    }
    else{
        console.log("No room for apples");
    }
}

function LoopInterval(SnakeLenght){
 return 100 + 1000/(SnakeLenght);
}

function Gameloop(){
    if(!AlreadyGotInputForThisFrame){
        ReadInputQueue();
    }
    //Cleanup tail and head colors
    Tiles[Snake[Snake.length - 1]].classList.remove("SnakeBody");
    Tiles[Snake[0]].classList.remove("SnakeHead");
    Tiles[Snake[0]].classList.add("SnakeBody");

    let NextPosition = CheckPosition(Snake[0], SnakeDir);
    if(NextPosition == null){
        return;
    }

    //Add new head position
    Snake.unshift(NextPosition);
    LastSnakeDir = SnakeDir; //Last dir to know where we can turn
    Snake.pop(); //Remove tail
    
    Tiles[Snake[0]].classList.add("SnakeHead");

    AlreadyGotInputForThisFrame = false;
}

//Check for apples, collision and loops
function CheckPosition(Original, Dir){
    let pos = Original + Dir;
    if(Original % Width == 0 && Dir == -1){
        if(!Loop){
            Die();
            return null;
        }
        else{
            pos = Original + Width - 1;
        }
    }
    if(Original % Width == Width-1 && Dir == 1){
        if(!Loop){
            Die();
            return null;
        }
        else{
            pos = Original - Width + 1;
        }
    }
    if(Original < Width && Dir == -Width){
        if(!Loop){
            Die();
            return null;
        }
        else{
            pos = Width * (Height-1) + Original;
        }
    }
    if(Original >= Width * (Height-1) && Dir == Width){
        if(!Loop){
            Die();
            return null;
        }
        else{
            pos = Original % Width;
        }
    }

    //Apples
    if(Tiles[pos].classList.contains("Apple")){
        Tiles[pos].classList.remove("Apple")
        Snake.push(Snake[Snake.length - 1]);
        clearInterval(GameInterval);
        GameInterval = setInterval(Gameloop, LoopInterval(Snake.length));
        //re-render the tail, since it should drag behind
        Tiles[Snake[Snake.length - 1]].classList.add("SnakeBody");

        //Prerender the head to pervent apples from spawning on it.
        Tiles[pos].classList.add("SnakeHead");

        //new apple
        Apple();
        return pos;
    }

    if(Tiles[pos].classList.contains("SnakeBody")){
        Die();
        return pos;
    }


    return pos; // ok
}

function Die(){
    clearInterval(GameInterval);
    for(let i = 0; i < Snake.length; i++){
        Tiles[Snake[i]].classList.remove("SnakeBody");
        Tiles[Snake[i]].classList.remove("SnakeHead");
        Tiles[Snake[i]].classList.add("DeadSnake");
    }
}

function Reset(){
    Width = parseInt(document.getElementById("gamewidth").value);
    Height = parseInt(document.getElementById("gameheight").value);
    Apples = parseInt(document.getElementById("apples").value);
    Loop = document.getElementById("looparound").checked;

    SnakeDir = 1;
    LastSnakeDir = 1;
    InputQueue = [];

    if(isNaN(Width)){
        Width = 5;
    }
    if(isNaN(Height)){
        Height = 5;
    }
    if(isNaN(Apples)){
        Apples = 5;
    }

    //Max width = what fits
    MaxWidth =  Math.floor(getContentWidth(document.getElementsByClassName("divmain")[0])/(parseFloat(getComputedStyle(document.documentElement).fontSize)))-1;
    if(MaxWidth < Width){
        Width = MaxWidth;
        document.getElementById("gamewidth").value = Width;
    }
    MinWidth = 5;
    if(Width < MinWidth){
        Width = MinWidth;
        document.getElementById("gamewidth").value = Width;
    }

    //go go square powers
    MaxHeight =  MaxWidth;
    if(MaxHeight < Height){
        Height = MaxHeight;
        document.getElementById("gameheight").value = Height;
    }
    MinHeight = 5;
    if(Height < MinHeight){
        Height = MinHeight;
        document.getElementById("gameheight").value = Height;
    }


    while(GameContainer.firstChild != null)
    {
        GameContainer.removeChild(GameContainer.firstChild);
    }

    console.log("Creating " + Width*Height + " GameCells");
    for(let i = 0; i < Width*Height; i++){
        let NewCell = document.createElement("div");
        NewCell.classList.add("GameCell");
        if(Width % 2 == 1){
            if(i % 2 == 1){
                NewCell.classList.add("Dark");
            }
        }
        else if(i%2-(Math.floor(i/Width)%2) == 0)
        {
            NewCell.classList.add("Dark");
        }
        GameContainer.appendChild(NewCell);
    }
    GameContainer.style.width = Width + "rem";

    SnakeStart = Math.floor((Height-1)/2)*Width+1;
    Snake = [SnakeStart + 2, SnakeStart + 1, SnakeStart];

    Tiles = GameContainer.children;
    for(let i = 1; i < Snake.length; i++){
        Tiles[Snake[i]].classList.add("SnakeBody");
    }
    Tiles[Snake[0]].classList.add("SnakeHead");

    if(GameInterval != null){
        clearInterval(GameInterval);
    }

    for(let i = 0; i < Apples; i++){
        Apple();
    }

    GameInterval = setInterval(Gameloop, LoopInterval(Snake.length));
}

function getContentWidth (element) {
    var styles = getComputedStyle(element)
  
    return element.clientWidth
      - parseFloat(styles.paddingLeft)
      - parseFloat(styles.paddingRight)
  }