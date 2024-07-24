---
title: Snake (KMP)
header: Snake (Kotlin Multiplatform)
description: A page containing the summary of creating a simple snake game in Kotlin 
  Multiplatform
---

## Summary

I started this project to practice using the [Kotlin Multiplatform Development technology](https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html).
The idea of this technology is to you can create your app in Kotlin, then compile it to
run on different environments. This allows you to reuse code across different platforms.

For example, you can code most of the logic in Kotlin, and then compile this to both 
Android and IOS platforms. This is similar to how React Native and Flutter work.

<div id="doc-menu-area"> </div>

## Plan
The aim of this is to test the Kotlin Multiplatform technology rather than produce a
complex or new app. For this reason I will be implementing a simple [Snake game](https://en.wikipedia.org/wiki/Snake_(video_game_genre)).

This doesn't need any planning and the ui will just contain the controls for moving the 
snake. Those being up, down, left and right.

## Getting Started
To start I followed [this guide on creating a multiplatform project](https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-multiplatform-getting-started.html) 
in Android Studio.

Using [the wizard](https://kmp.jetbrains.com/) I created a template that would work on
Android, IOS, Desktop and Web.

### Running on Platforms
After importing and building from the Gradle files I could then run the simple app bundled
with the starter code. Running on the Android device was simple and works the same way
with existing Android compose development.

I don't have the IOS runtimes installed, so I skipped that and ran the app on the 
desktop runtime. Doing this was really easy, and just required running the gradle command.
```bash
./gradlew desktopRun -DmainClass=MainKt --quiet
```
This uses your installed Java JVM to run the application. So doesn't require any difficult
setup.

Running the browser version was also really easy and only needed the command:
```bash
./gradlew wasmJsBrowserRun -t --quiet
```
You can then view the app in the browser. The main platform the browser version targets is
[Wasm (Web Assembly)](https://webassembly.org/) instead of the normal JS runtime.


## Rendering the Game
To render the snake game I'll be using Compose, primarily utilising the Box element to
create a grid, using different colours for the snake, food and background. This isn't the
most efficient way, but it'll do for this game.

Since Compose works by detecting the changes in state then I can create some
state that holds the snake positions. By updating these positions compose can render
the updated snake to the screen.

A space will be left at the bottom of the screen to hold the buttons that control the snake.

## Implement Snake Logic
The game will run on a grid where each position in the grid is either a snake, food or
empty. The snake can move to an empty space, food but if it hits itself the game is over.
If the snake reaches some food the size of the snake is increased.

Since the game will be tied closely to the ui I will utilise state objects to update control
the ui. I'll start with a class called SnakeGameState that
will store the config and overall game state, like the score, food and snake position. I 
will then store an array that contains the CellState of each cell.

The user then can control the Snake which will change the direction. Every unit of 
time the snake will move one space in that direction. If the head reaches a food then
the length will increase and another food will be placed on the board. If it reaches 
another part of the snake the game is over.

You can [view the code on the GitHub repo](https://github.com/calebstride/snake-kmp).

An example piece of code is the [tick() method in SnakeGameState](https://github.com/calebstride/snake-kmp/blob/main/composeApp/src/commonMain/kotlin/com/calebstride/snake/game/SnakeGameState.kt) 
that's run every given milliseconds. This is the controlled by the main game 
loop from the ui.

```kotlin
// Within the ui the main game loop is run when the page is rendered
LaunchedEffect(Unit) {
    while(true) {
        snakeGameState.tick()
    }
}

/**
 * Called every time we want to update the game. If the game isn't in a RUNNING state then
 * nothing is updated.
 */
suspend fun tick() {
    delay(delay)
    if (_gameState.value != GameState.RUNNING) return
    // Figure out the space we're going to move to
    val nextIndex = getNextIndex(snakeIndices.first(), direction)
    val cellType = cellStates[nextIndex].cellType.value
    when(cellType) {
        // Add the snake head to this position but don't shrink the snake, also create new food
        CellType.FOOD -> {
            snakeIndices.addFirst(nextIndex)
            updateCellType(nextIndex, CellType.SNAKE)
            createNewFood()
            increaseScore()
        }
        // Add the snake head to this position and move the last snake position
        CellType.EMPTY -> {
            updateCellType(snakeIndices.removeLast(), CellType.EMPTY)
            snakeIndices.addFirst(nextIndex)
            updateCellType(nextIndex, CellType.SNAKE)
        }
        // We've hit the snake so game over
        CellType.SNAKE -> {
            _gameState.value = GameState.GAME_OVER
        }
    }
}
```

## Example
Since I used KMP I can generate this Kotlin code into JS/Wasm. To do that I used
the guide on [generating the artifacts](https://kotlinlang.org/docs/wasm-get-started.html#generate-artifacts). 

This mainly just meant running the below command and manually changing some references to 
files, as they expect you to run the app from the website root.
```bash
./gradlew wasmJsBrowserDistribution
```

I could then upload the js files and reference it in this page. See below for the snake game.

<script type="application/javascript" src="/scripts/snake/composeApp.js"></script>
<div class="compose-app-wrapper">
    <div id="composeApplication" style="width:400px; height: 440px;"></div>
</div>

## Conclusion
I'm pretty happy with the game. It works as expected and is the first game I've actually
ever created apart from simple text games.

It also shows the benefit of Kotlin / Compose Multiplatform. This took me a day and 
a half to code and create, which isn't too quick for a simple game such as this. But 
considering I can now build this to run on IOS, Android, Browsers (via Wasm) and on the 
JVM (which means almost all modern OSs) which shows how beneficial a technology 
like this can be when distributing to multiple platforms.

In terms of using KMP I can see that if you had a complex codebase the project would be
pretty difficult to maintain and build. But thanks to being able to share code it 
would still reduce the overall work and resources needed compared to having separate 
teams for each platform.

In the future I would like to migrate my [finance management application](manageCabbage/app.html) 
to use KMP. The problem with this is the reliance on Java apis and libraries for 
the Android application. I would need to extract these into platform specific code using
the [expect and actual keywords](https://kotlinlang.org/docs/multiplatform-expect-actual.html) 
or adopt multiplatform dependencies.