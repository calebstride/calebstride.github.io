---
title: Jetpack Compose Progress Bar
header: Creating a Nice Progress Bar (Using Jetpack Compose)
description: Creating a nice looking loading / progress bar using jetpack compose
type: blog
creationDate: 2024-04-06
numbered: true
---

When working on a part of my app I was trying to implement a progress/loading bar that would
describe to a user how close they were to a goal.

To do this I wanted to implement a 'nice' looking progress bar that would fit in with the
rest of my application. I've been using Material Design 3 as design guidelines but the 
loading bar element looks like this:

<img src="/images/loadingBar/m3-progress-bar.png" width="400" alt="The default M3 Loading Bar">

Which isn't very clear and doesn't look very appealing. I would prefer a bar that was:
- Larger, so it could be viewed easier
- Could be styled in different ways
- Had rounded ends
- The end of the coloured section should be flat

However, I came across a lot more issues when doing this than I thought I would. So this
blog goes through those issues and explains the final design I came up with.

<div id="doc-menu-area"> </div>

## Set Up
The idea for this bar is that I can provide it with the current value and also the
maximum value. It will then draw the bar in the container I place it in.

To start I figure out the fraction of the bar that is filled in then I can draw the 
bar the appropriate length. The composable layout looks like this:

```kotlin
@Composable
fun ExampleBar(
    currentValue: Float,
    limit: Float,
    modifier: Modifier = Modifier
) {
    // Work out the fraction of the bar that is filled
    val fraction = if (currentValue > limit) 1f else (currentValue / limit)
    Row(modifier = modifier) {
        LoadingElement(fraction = fraction)
    }
}

@Composable
private fun LoadingElement(fraction: Float) {
    // The bar will be created here
}
```

## First Attempt
My first attempt was to create two Box composables with varying weight values. The idea
being that one box will hold display the highlighted value, and the other will be empty.
As the fraction increases then the boxes will grow and shrink to display the correct
value. The bar can be seen below with the modifiers set as different colours.

<img src="/images/loadingBar/first-nice.png" width="400" alt="The first attempt">

The problem with this attempt was there was a lot of other logic needed when rendering
the Boxes using width. The reason for this is that if the fraction is either 0 or 1. Then 
the opposite side Box would fail to render as width can't be 0.

Also, as seen below. When the width of a rounded corner shape is smaller than the
corner radius it behaves a bit weirdly.

<img src="/images/loadingBar/first-bad.png" width="400" alt="The rounded corner issue">

### Improvement
I found out that you could use the Modifier.fillMaxWidth(fraction) method to fill in a 
fraction of the available width. This meant that I could avoid all the logic about handling
weight values and just use one Box instead.

The first attempt code:
```kotlin
@Composable
private fun LoadingElement(fraction: Float) {
    val barColour = Color.Green // Placeholder to show the bar easier
    // The row sets the width for the bar to use and a border
    Row(
        modifier = Modifier
            // I added a border for the whole bar so you can see where the max size is
            .border(
                width = 2.dp,
                color = Color.Magenta,
                shape = RoundedCornerShape(8.dp)
            )
            .fillMaxWidth()
    ) {
        // The box represents the progress (signified by green)
        Box(
            modifier = Modifier
                .fillMaxWidth(fraction)
                .height(20.dp)
                .background(
                    color = barColour,
                    // This still needs changing to something that would allow a flat end
                    // but not overflow when near the rounded ends
                    shape = RoundedCornerShape(topStart = 8.dp, bottomStart = 8.dp)
                )
        )
    }
}
```

The main issue with this is still the ends of the bar. They don't fit with the shape of
the outline and clip out of the border at extreme values. e.g:

<img src="/images/loadingBar/clipped-end.png" width="400" alt="The clipping issue">

One way to avoid this would to use a rounded cap instead of a flat end. But this makes the
actual position of the bar harder to interpret.

<img src="/images/loadingBar/rounded-end.png" width="400" alt="The bar with a rounded end">

## Second Attempt
To handle the issues I decided to switch to trying to draw the bar in the Modifier.drawBehind
method. This turned out to not be necessary, but it was interesting
to get some experience with drawing straight to the canvas.

To fix the issue where the ends of the bar were clipping through the border I decided to
apply a radius to the bar depending on how close to the end it was. So for most the time
there was no end corner radius. But when the loading bar reached the end it would apply
a radius. Here is that code:

```kotlin

@Composable
private fun LoadingElement(fraction: Float) {
    // As the progress bar section is done within the Box, it can now set the full width
    // and the border colour
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(20.dp)
            .border(
                width = 2.dp,
                color = Color.Magenta,
                shape = RoundedCornerShape(8.dp)
            )
            // Our new extension function handles drawing the bar of a given fraction
            .drawBar(fraction)
    )
}

private fun Modifier.drawBar(fraction: Float): Modifier {
    return this.drawBehind {
        // The radius of the corners in pixels
        val roundLength = 8 * density
        // The bar should be a fraction of the available width
        val barLength = size.width * fraction
        val cornerRadius = CornerRadius(x = roundLength)
        // The end corner radius is 0 until we reach within the radius of the end of the bar
        val cornerEndRadius = if (barLength <= size.width - roundLength) {
            CornerRadius(x = 0f)
        } else {
            // When inside the radius of the end corners we find how far we are passed 
            // the radius start. Then we apply that as a corner radius to the progress bar
            CornerRadius( x = barLength - (size.width - roundLength) )
        }
        // We construct a round rectangle using the corner radii calculated earlier 
        val rr = RoundRect(
            rect = Rect(
                topLeft = Offset.Zero,
                bottomRight = Offset(x = barLength, y = 20 * density)
            ),
            topLeft = cornerRadius,
            bottomLeft = cornerRadius,
            topRight = cornerEndRadius,
            bottomRight = cornerEndRadius
        )
        // We then provide the rectable to a path and drawer that path
        drawPath(path = Path().apply { addRoundRect(rr) }, color = Color.Green)
    }
}
```

As you can see this is a lot larger than the previous attempts. But it does give a nice
finish to the end of the progress bar when nearing the end.

<img src="/images/loadingBar/second-near-end.png" width="400" alt="The bar with a slight round end">

It appears straight which is what we want, and it doesn't clip through the border. We
still have this problem at the start though. 

<img src="/images/loadingBar/second-near-start.png" width="400" alt="The bar with a slight round end">

Unfortunately I don't think we can fix this issue using the same method as the end of the 
bar. The reason being that the corner radius can't be greater than the length of the 
shape. So the shape height can't be reduced, which is what we need to happen to stop
the issue at the front.

### Finding the height value
Another possible fix would be to change the height of the rectangle based on the length.
So a short length would have a short height and not clip the border. This would fix the 
issue at the start of the bar. 

I decided that I wouldn't use this solution for the actual implementation as it was becoming
too complex especially considering the edge case it would be fixing. 

I did look at the maths behind it out of interest. I labeled this diagram where the 
dashed line (x) represents the height we need to find.

<img src="/images/loadingBar/height-equation.png" width="400" alt="The equation to find the rounded bar height">

If you place together the top and bottom of the rounded rectangle corners you get a circle
which makes this easier to visualise. 

<img src="/images/loadingBar/height-equation-two.png" width="400" alt="The equation to find the rounded bar height">

So we are now finding the length of the chord of a circle, shown here as x - (h - 2r).
Using the pythagoras theorem we can find the length of a which is double the length of 
x - (h - 2r). Doing some more rearranging we get the equation: 

x = (2 * sqrt(c<sup>2</sup> + b<sup>2</sup>)) + (h - 2r)

We could then use this height as the maximum height for the bar to be to stop it clipping
through the border. Although even then there might be some issue with how the radius works
on such small shapes.

## Third Solution
I decided to do a bit of research into clipping and if there was any way to avoid doing it,
then I came across the [Modifier.clip()](https://developer.android.com/develop/ui/compose/graphics/draw/modifiers#graphics-modifier-clip-shape) method.

This looked promising as it would clip away anything outside a defined shape. So I changed
my first implementation and added this clip method. Thankfully this worked perfectly,
everything outside the border was removed. As this was happening I could completely 
remove the RoundedShape information as I could use a normal rectangle and anything outside the
border would be removed.

This looked exactly how I wanted it to in terms of the shape of the bar.

<img src="/images/loadingBar/third-end.png" width="400" alt="The third solution bar at the end">

The code was also small and simple.

```kotlin
@Composable
private fun LoadingElement(fraction: Float) {
    // The shape for the outside border
    val loadingShape = RoundedCornerShape(8.dp)
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(20.dp)
            .border(color = Color.Magenta, width = 2.dp, shape = loadingShape)
             // The inner composable is clipped within the bounds of this shape
            .clip(shape = loadingShape)
    ) {
        // The inner fill area
        Box(
            modifier = Modifier
                .height(20.dp)
                .fillMaxWidth(fraction)
                .background(color = Color.Green)
        )
    }
}
```

This attempt was definitely good enough for the use cases and was the solution I went 
with. Here is the third attempt with the border set to the same colour as the bar.

<img src="/images/loadingBar/third-final.png" width="400" alt="The final look at the third solution">

## Touch-ups
### Extreme values
One thing I noticed with the final solution is that when the values are very close the 
minimum they don't actually show on the bar. The reason for this is that they're behind
the border.

The opposite is true for extreme maximums, where the bar is full before the fraction reaches
1f. To fix this I just added horizontal padding equal to the border width so that the bar starts 
where the outside border ends.

### Colouring
I decided to add the option of a brush instead of a colour. This gives more freedom to
colouring the bar and allows for different patterns.

I also wanted the bar to display a different colour depending on if the fraction was over 1.
This was because the bar is being used to show how close to a limit the value is, and it
would be good to differentiate when the limit has been reached.

## Conclusion
In the end my loading/progress bar looks like this:

<img src="/images/loadingBar/final-bars.png" width="400" alt="The final look the solution">

Which is much nicer than the default progress bar, and fits better to the rest of the 
application. It also has the option to change colours and size, which the existing one
doesn't.

There are a couple of things that could be added to make it more flexible. For one, the 
bar is made to be static, which means there are no animations and if it was updated it
would look pretty ugly. Also, the way the fraction is handled could be changed to 
prevent as much of the composable being recomposed.

Finally, it would be nice to have an indication of how much over the limit you are if you
have a limit. This could be just by adding a notch, or another graphic indication on the 
bar. For my use-case the bar has the percentage displayed below it, so the information
isn't too important to display.

```kotlin
@Composable
private fun LoadingElement(fraction: Float, overLimit: Boolean) {
    val borderColour = // Determine colour based on overLimit, or pass as a parameter
    val brush = // Create the brush you want, or pass it as a parmeter
    val loadingShape = RoundedCornerShape(8.dp)
    val borderWidth = 2.dp
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(20.dp)
            .border(color = borderColour, width = borderWidth, shape = loadingShape)
            .clip(shape = loadingShape)
    ) {
        Box(
            modifier = Modifier
                .height(20.dp)
                 // Add padding to move passed the border
                .padding(horizontal = borderWidth)
                .fillMaxWidth(fraction)
                .background(brush = brush)
        )
    }
}
```