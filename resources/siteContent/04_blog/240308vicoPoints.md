---
title: Android Vico Point Colours
header: Android Vico Point Colours
description: A guide on how to change the colour of a point in a vico chart depending on 
  where the point is located
---

### Problem
Whilst working on an android app I started using a great chart library called [vico](https://github.com/patrykandpatrick/vico). 
This library is very extensible and has great documentation as well as some good examples.

For one of the graphs I was creating I wanted to place a point on the graph as a circle. See below for an example graph
before and after the points:

<img src="/images/vico/chartNoPoints.png" width="400" alt="Chart with no points">\
<img src="/images/vico/chartWrongPoints.png" width="400" alt="Chart with wrong points">

This issue with this is that the points don't obey the colour of the line.

### Solution
#### Creating A New Component
To fix this I looked at the class that was used to define the point. This class implements 
the com.patrykandpatrick.vico.core.component.Component class. I then started implement a 
child of this class that would be able to change the point colour based on the position 
of the point.

The draw method was the only one I needed to implement, and it was defined as the following:
```kotlin
override fun draw(
    context: DrawContext,
    left: Float,
    top: Float,
    right: Float,
    bottom: Float,
    opacity: Float
) {
    //TODO
}
```

The left, top, right and bottom values are the positions in the canvas rather than the 
position in x,y space. Luckily the context provided the minimum and maximum y and x values
of the chart.

#### Determining If Above Zero
Unfortunately, the x and y ranges would not provide us with the current position of the 
point being drawn. To get this we need the position of the axis relative to the canvas.

The ChartDrawContext has this data in the chartBounds field. So we can only do this
when the context is type ChartDrawContext, which it was within graphs from my testing.

With the chart ranges given in the canvas position and the x,y ranges we could translate
the position of the point (in canvas space) into a position in x,y space. We then can 
look at the y value to determine if it's above zero.

Here is a method that does this.
```kotlin
private fun isBelowZero(context: ChartDrawContext, canvasYPos: Float): Boolean {
    val yRange = context.chartValues.getYRange(AxisPosition.Vertical.End)
    if (yRange.minY >= 0) return false // All values above 0
    if (yRange.maxY <= 0) return true // All values below 0
    
    val yZeroRatio = -yRange.minY / (yRange.maxY - yRange.minY) // Ratio of y=0 along y axis
    val bounds = context.chartBounds
    val canvasBottomOfChart = maxOf(bounds.bottom, bounds.top) // The top and bottom are no guaranteed to be sorted
    val canvasYZeroPos = canvasBottomOfChart - (yZeroRatio * bounds.height()) // As (0,0) is top left we need take away to make our way up the y axis
    return canvasYPos > canvasYZeroPos
}
```

To start this method we get the yRange object from the context. Then if the minimum Y
value is above 0 we know all the points are positive. The opposite is true when the 
maximum Y is below 0.

We then calculate the ratio that y = 0 is between the minimum and maximum y values. Then
using this ratio we can calculate how far along the canvas 0 is. In the canvas the (0,0)
position is the top left, hence why we subtract the value.

Finally, we can check if the canvasYPos of the current point is above the canvas Y position
of 0.

#### Render Different Colours
To make the colours of the points different I just added two different shape components
with different colours in my class. Depending on if the value is negative or positive
a different shape component is used.

### Conclusion
The final class is at the bottom of this page. After implementing it and setting the
point value in the LineSpec to our new class the result is the following.

<img src="/images/vico/chartFixedPoints.png" width="400" alt="Chart with wrong points">

So now the points reflect the shader of the LineSpec.

I haven't currently seen any issues with this. Although I think that there's potential
for something to go wrong when using zooming. This class could be extended further
to allow for different point shapes or styles depending on their position.

```kotlin
/**
 * A shape component that uses a different shape components depending on the position 
 * the point is drawn
 */
class ShapeComponentAdaptable(
    shape: Shape = Shapes.pillShape,
    colourTop: Int,
    colourBottom: Int,
) : Component() {

    // Shape component for y>0
    private val shapeComponentTop = ShapeComponent(shape = shape, color = colourTop) 

    // Shape component for y<0
    private val shapeComponentBottom =  ShapeComponent(shape = shape, color = colourBottom) 

    override fun draw(
        context: DrawContext,
        left: Float,
        top: Float,
        right: Float,
        bottom: Float,
        opacity: Float
    ) {
        val yPosition = (top + bottom) / 2 // Get the middle y position of the point
        // Default to one shape if the context isn't the correct class
        if (context is ChartDrawContext && !isBelowZero(context = context, canvasYPos = yPosition)) {
            shapeComponentTop.draw(context, left, top, right, bottom, opacity)
        } else {
            shapeComponentBottom.draw(context, left, top, right, bottom, opacity)
        }
    }

    /**
     * Find where the zero Y position is on the canvas, then check if the [canvasYPos] value is below
     * that
     */
    private fun isBelowZero(context: ChartDrawContext, canvasYPos: Float): Boolean {
        val yRange = context.chartValues.getYRange(AxisPosition.Vertical.End)
        if (yRange.minY >= 0) return false // All values above 0
        if (yRange.maxY <= 0) return true // All values below 0
        
        val yZeroRatio = -yRange.minY / (yRange.maxY - yRange.minY) // Ratio of y=0 along y axis
        val bounds = context.chartBounds
        val canvasBottomOfChart = maxOf(bounds.bottom, bounds.top) // The top and bottom are no guaranteed to be sorted
        val canvasYZeroPos = canvasBottomOfChart - (yZeroRatio * bounds.height()) // As (0,0) is top left we need take away to make our way up the y axis
        return canvasYPos > canvasYZeroPos
    }
}
```