//Variables
const Canvas = $("#Game").get(0)
const CanvasDimension = { "width": 800, "height": 800 }
const SquareBackgroundSize = { "x": 20, "y": 20 }
const OutBoard = {"Horizontal" : CanvasDimension["width"] / SquareBackgroundSize["x"] - 1 , "Vertical" : CanvasDimension["height"] / SquareBackgroundSize["y"] - 1}
const AllPossiblePositions = MappingAllPossiblePositions()
let InputDelay = false
let SpecialEffect = false

Canvas.width = CanvasDimension["width"]
Canvas.height = CanvasDimension["height"]

const Context = Canvas.getContext("2d")

ClearBoard()

let GameOver = false

let GameSettings = BuildGameSettings()
const Snake = CreateSnake()
const Fruits = CreateFruits(GameSettings.FruitSpan)

$(document).keydown(() => Snake.SetDirection())

RunGame()
//---------------------------------------------------------

function BuildGameSettings(){
    return {
        "FruitSpan" : 2,
        "FruitLengthToTriggerFruitSpan" : 1, 
        "Speed" : 8,

        GameLevels(){
            if(!SpecialEffect){
                switch(true){
                    case (Snake.Trail.length >= 5 && Snake.Trail.length < 10): // Level 1
                        with(GameSettings){
                            FruitSpan = 3
                            Speed = 10
                        }
                    break
                    case (Snake.Trail.length >= 10 && Snake.Trail.length < 20): // Level 2
                        with(GameSettings){
                            Speed = 12
                        }
                    break
                    case (Snake.Trail.length >= 20 && Snake.Trail.length < 40): // Level 3
                        with(GameSettings){
                            FruitSpan = 4
                            Speed = 15
                        }
                    break
                    case (Snake.Trail.length > 40): // Level 4
                        with(GameSettings){
                            Speed = 18
                        }
                    break        
                }
            }
        }
    }
} 

function MappingAllPossiblePositions(){
    let AllPossiblePositionsArray = [], index = 0

    for (let i = 0; i <= OutBoard["Horizontal"]; i++) {
        for (let j = 0; j <= OutBoard["Vertical"]; j++) {
            AllPossiblePositionsArray[index] = {"x" : i, "y" : j}
            index++
        }
    }

    return AllPossiblePositionsArray.map(value => JSON.stringify(value))
}

function ClearBoard() {
    with (Context) {
        fillStyle = "#DCDCDC"
        lineWidth = 5
        strokeStyle = "#FF34F1"
        fillRect(0, 0, Canvas.width, Canvas.height)
        strokeRect(0, 0, Canvas.width, Canvas.height)
    }

}

function CreateSnake() {

    const InitialHorizontalPosition = Math.floor((Math.random() * OutBoard["Horizontal"]) + 1)
    const InitialVerticalPosition = Math.floor((Math.random() * OutBoard["Vertical"]) + 1)
    
    return {
        Color : "#194471",
        Direction : {"x" : 0, "y" : 0},
        Head : { "x": InitialHorizontalPosition, "y": InitialVerticalPosition },
        Trail : [],
        LastPosition : {"Head" : {"x" : null, "y" : null}, "Trail" : {"x" : null, "y" : null}},

        SetDirection() {
            let ValidMoves = {       
                ArrowUp(){
                    if(Snake.Direction["y"] != 1){
                        Snake.Direction = {"x" : 0, "y" : -1}
                    }
                },
                ArrowDown(){
                    if(Snake.Direction["y"] != -1){
                        Snake.Direction = {"x" : 0, "y" : 1}
                    }
                },
                ArrowLeft(){
                    if(Snake.Direction["x"] != 1){
                        Snake.Direction = {"x" : -1, "y" : 0}
                    }
                },
                ArrowRight(){
                    if(Snake.Direction["x"] != -1){
                        Snake.Direction = {"x" : 1, "y" : 0}
                    }
                }
            }
        
            if(ValidMoves.hasOwnProperty(event.key) && InputDelay === false){
                ValidMoves[event.key]()
                InputDelay = true    
            }
        },

        MoveSnake(){
            if(Snake.Trail.length > 0){ 
                Snake.Trail.pop()
                Snake.Trail.splice(0, 0, Snake.LastPosition["Head"])
            } 
        },

        BiteOwnBody(){
            if(Snake.Trail.length > 0){
                Object.values(Snake.Trail).forEach(SnakeSegment => {
                    if(SnakeSegment["x"] === Snake.Head["x"] && SnakeSegment["y"] === Snake.Head["y"]){
                        EndGame()
                    }
                })
            }
        }
    }
}

function CreateFruits(NumberOfFruits){

    let PossibleFruitsPlacements = MappingPossibleFruitsPlacements()
    let FruitsArray = []
   
    for (let index = 0; index < NumberOfFruits; index++) {
        FruitsArray.push(
            PossibleFruitsPlacements[Math.floor(Math.random() * PossibleFruitsPlacements.length)]
        )  
    }

    return FruitsArray    
}

function MappingPossibleFruitsPlacements(){
    let UnablePositions = [Snake.Head, ...Snake.Trail].map(value => JSON.stringify(value))
    let EnablePositions = $(AllPossiblePositions).not(UnablePositions).get()

    return EnablePositions.map(value => JSON.parse(value))
}

function EatFruit(){
    Fruits.forEach((Fruit, Index) => {
        if(Fruit["x"] === Snake.Head["x"] && Fruit["y"] === Snake.Head["y"]){
            Fruits.splice(Index, 1)
            Snake.Trail.push(Snake.LastPosition["Trail"])
            $("#Score").text(Snake.Trail.length)        
        }
    })
}

function AddMoreFruits(){
    if(Fruits.length === GameSettings.FruitLengthToTriggerFruitSpan){
        Fruits.push(...CreateFruits(GameSettings.FruitSpan))
    }
}

function Draw(SnakeSegments, Fruits) {
    
    ClearBoard()
    for (SnakeSegment of SnakeSegments) {
        with (Context) {
            fillStyle = Snake.Color
            lineWidth = 2
            strokeStyle = "black"
            fillRect(SnakeSegment["x"] * SquareBackgroundSize["x"] , SnakeSegment["y"] * SquareBackgroundSize["y"], SquareBackgroundSize["x"], SquareBackgroundSize["y"])
            strokeRect(SnakeSegment["x"] * SquareBackgroundSize["x"] , SnakeSegment["y"] * SquareBackgroundSize["y"], SquareBackgroundSize["x"], SquareBackgroundSize["y"])
        }
    }

    for (Fruit of Fruits) {
        with (Context) {
            fillStyle = "#BA0925"
            lineWidth = 1
            strokeStyle = "#000"
            fillRect(Fruit["x"] * SquareBackgroundSize["x"] , Fruit["y"] * SquareBackgroundSize["y"], SquareBackgroundSize["x"], SquareBackgroundSize["y"])
            strokeRect(Fruit["x"] * SquareBackgroundSize["x"] , Fruit["y"] * SquareBackgroundSize["y"], SquareBackgroundSize["x"], SquareBackgroundSize["y"])
        }
    }
}

function VerifyOutBoard(NewPosition, Type) {

    let Parameter = (Type == "Horizontal") ? "x" : "y"

    if(NewPosition == 0 && Snake.Direction[Parameter] == -1 || NewPosition == OutBoard[Type] && Snake.Direction[Parameter] == 1){
        EndGame()
    }

    else{
        NewPosition += Snake.Direction[Parameter]
    }
    
    return NewPosition
}

function RunGame(){
    InputDelay = false

    Snake.LastPosition["Head"] = {"x" : Snake.Head["x"] , "y" : Snake.Head["y"]}
    Snake.LastPosition["Trail"] = (Snake.LastPosition["Trail"].length > 0) ? {"x" : Snake.Trail[Snake.Trail.length - 1]["x"] , "y" : Snake.Trail[Snake.Trail.length - 1]["y"]} : Snake.LastPosition["Head"]
    
    
    Snake.Head["x"] = VerifyOutBoard(Snake.Head["x"], "Horizontal")
    Snake.Head["y"] = VerifyOutBoard(Snake.Head["y"], "Vertical")
    Snake.MoveSnake()
    Snake.BiteOwnBody()

    EatFruit()
    AddMoreFruits()
    GameSettings.GameLevels()

    Draw([Snake.Head, ...Snake.Trail], Fruits)

    if(!GameOver){
        setTimeout(function() {
            requestAnimationFrame(RunGame)
        }, 1000 / GameSettings.Speed)
    }
}

function EndGame(){
    with(Snake.Direction){
        x = 0
        y = 0
    }
    Snake.Color = "#000"
    
    GameOver = true
    
    $("#GameOver").text("Game Over")
    $("#Restart").text("( Enter to continue )")

    $(document).keydown(event => {
        if (event.key === "Enter"){
            location.reload()
        }
    })
}
