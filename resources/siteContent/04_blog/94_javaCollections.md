---
title: Java Collections Analysis
header: Java Collections Analysis
description: Comparing java collections and analysis there time and memory performance
type: blog
creationDate: 2024-05-23
numbered: true
---

During almost every technical interview or programming exercise in Java there's always a 
question about Java collections and the best one for the given scenario.

I know the main use cases between Sets, Lists and Queues (which are the main groups of 
collections). What I'm not really sure is the actual numerical differences between them,
for example, I know a HashSet uses up more memory than an ArrayList but by how much?

In this blog I'll go through some collections and test different use cases for them.
Comparing the speed and memory usage as I go. You can [check out the code on GitHub](https://github.com/calebstride/java-collection-analysis)

<div id="doc-menu-area"> </div>

## Planning
Running this test should be pretty simple as all the Collections implement the 
[Collection](https://docs.oracle.com/en/java/javase/22/docs/api/java.base/java/util/Collection.html)
interface. Therefore, I can define how the test should be run and run it the same way for
each class.

### Classes and Methods
I will start by testing ArrayList and HashSet which are the most popular Set and List
implementations. The methods I will be timing to start with are the add, contains, remove,
and size. I'll make sure to design the code so that I can easily add more methods and/or
classes when desired.

### Metric Collection
The two main metrics I will be collecting are the size of the object, and the time it 
takes to perform the method.

#### Time
To record the time I'm going to be using the StopWatch object from the [commons-lang3](https://commons.apache.org/proper/commons-lang/) 
library. Alternatively I could use the System.currentTimeMillis() but the StopWatch class
makes this simpler. Also, the library includes helpful classes that I will likely be 
using elsewhere.

```java
// Getting the time for something to run using System
long start = System.currentTimeMillis();
// Do processing
long end = System.currentTimeMillis();
long timeTaken = end - start;

// Using StopWatch
StopWatch watch = new StopWatch();
watch.start();
// Do processing
watch.stop();
long timeTaken = watch.getTime();
```

#### Memory Usage
Recording the memory usage seems a bit more complicated. There seem to be a few solutions
online ranging from creating and analysing heap dumps to just serialising the object
to bytes and checking the byte number.

The solution I went with was to use the [jol](https://github.com/openjdk/jol) library.
This library uses the Instrumentation API which alters existing bytecode loaded into the 
JVM. This makes it pretty simple to check the size of objects and will make sure to check the
nested objects as well.

```java
// Use the GraphLayout class to find the size of the object and all children
long size = GraphLayout.parseInstance(integerArray).totalSize();

// You can use .toPrintable() to creat a string of the size breakdown
```

I decided to double-check this was returning the right kind of value because I honestly 
wasn't sure how much data objects used in Java. This returned a size of around 1.1KB for 
an ArrayList with 50 Integers. 

I created a heap dump but this suggested that the arrayList used 336 bytes which is a bit
different. Looking at the analysis of from the .toPrintable() method it looks like the 
heap dump shows the size of the actual ArrayList object plus some other element (24 + 312). But the
GraphLayout output size includes the size of all the elements in the array (24 + 312 + (16 * 50)).
As this is just being used as a comparison it shouldn't matter too much as long as 
they're measured the same way.

```text
// The size of an ArrayList with 50 Integers
Size of the array using GraphLayout: 1136 bytes
// The output from toPrintable() for the same ArrayList
Size: java.util.ArrayList@4973813ad object externals:
          ADDRESS       SIZE TYPE                PATH                           VALUE
         ff8efd28         24 java.util.ArrayList                                (object)
         ff8efd40        608 (something else)    (somewhere else)               (something else)
         ff8effa0        312 [Ljava.lang.Object; .elementData                   [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
         ff8f00d8    6517144 (something else)    (somewhere else)               (something else)
         fff27270         16 java.lang.Integer   .elementData[0]                0
         fff27280         16 java.lang.Integer   .elementData[1]                1
         ...
// I'm going to assume the 312 byte long value is some reference to all the elements in the array
```

## Running the Scenarios
To start I create a few collections of different types. I then fill them with integer 
values so that they're all the same size. I then run the methods we aim to test on each
collection n times. The reason for this is to get a good average.

This returns a result which I can analyse and print to the console. You can 
[find the code on GitHub](https://github.com/calebstride/java-collection-analysis).

### Altering Collections
One issue I came across was how to test the scenarios n times without altering the 
collection. This is because if I'm adding a value n times then the collection will be
a different size each iteration, making timings harder to compare.

I decided that for this scenario I would continue with altering the collection during the
scenarios. This does make some data useless (such as the min and max times) for scenarios,
as they will likely just be when the collection was at its largest / smallest. But I'll
still be able to compare the times of different collections which is the goal.

### Value to Use
Another issue was deciding what value to use for the method calls that require a given 
value. For example, contains requires you to give a value to search for. This has a chance
to majorly impact the test results. The reason being that I could run the worst case 
scenario (the value isn't in the collection) on one collection, then the other collection,
run the best case scenario (the value is the first element).

To fix this I created another class to generate values that could be inserted and removed
from the collection. The removal elements are spread throughout the collection, so it's not
always worst case of removing from the end. I did a similar thing for contains so bad and
good cases could be tested.

## Results
I changed the timing from milliseconds to nanoseconds as some of the values were very
small.

### HashSet vs ArrayList
#### 500k Integers running each operation 1000 times
The results are generally what I expected from my knowledge of the two classes. The thing
that surprised me was how much quicker the Set is at retrieving values. 

```text
The results for the collection (size: 500000) scenarios (n: 1000): 
The summary for the ArrayList of type Integer:
ArrayList Size - 10160912 bytes
Add time     : av. 235ns  min. 100ns  max. 19000ns
Remove time  : av. 144125ns  min. 23900ns  max. 518800ns
Contains time: av. 280670ns  min. 257900ns  max. 5430900ns
Size time    : av. 126ns  min. 0ns  max. 7300ns

The summary for the HashSet of type Integer:
HashSet Size - 28194400 bytes
Add time     : av. 221ns  min. 100ns  max. 37700ns
Remove time  : av. 423ns  min. 100ns  max. 36300ns
Contains time: av. 265ns  min. 100ns  max. 14100ns
Size time    : av. 77ns  min. 0ns  max. 10500ns
```

It's over 1000x quicker in this scenario. Although the set is using around 3x the 
memory compared to the 
ArrayList. I imagine the size of the Collection isn't helping the ArrayList, in some 
scenarios it's having to loop through half a million elements, whilst the Set just does
one hash lookup. Generally though the ArrayList is still doing the lookup in 0.28ms which
very fast.

#### 5k Integers running each operation 1000 times
I ran the tests again but used a much smaller array size, this time a modest 5000. The Set
was quicker in all scenarios this time. But the gap between them was much smaller.

```text
The results for the collection (size: 5000) scenarios (n: 1000): 
The comparison of the ArrayList against HashSet of type Integer:
ArrayList Size - 105024 bytes against HashSets 272864 bytes
Add: ArrayList was slower with an average time: 172ns compared to HashSets: 133ns (77.33%) (1x)
Remove: ArrayList was slower with an average time: 7992ns compared to HashSets: 191ns (2.39%) (41x)
Contains: ArrayList was slower with an average time: 11378ns compared to HashSets: 246ns (2.16%) (46x)
Size: ArrayList was slower with an average time: 122ns compared to HashSets: 75ns (61.48%) (1x)
```

It wasn't until I got down to collection sizes of around 50 where the Set was only 2-4x 
quicker. In normal use cases though I don't normally have Collections with a huge set of
values, so it's unlikely to have such a performance difference.

Despite seeming much quicker in general it's important to remember that Sets provide a 
different function to Lists. Since Sets don't allow for duplicate values there are many
situations where you can't use a Set.

### Different Collections
I ran the test again but added some more common collections.

```text
Integer Collections with 500000 elements running each process 1000 times

                |   add (ns) |     remove (ns) |   contains (ns) |  size (ns) | bytes (KB) |
      ArrayList |        211 |          135626 |          267235 |        136 |      10160 |
     LinkedList |        111 |          667566 |         1630064 |        116 |      20000 |
        HashSet |        206 |             313 |             273 |         94 |      28194 |
        TreeSet |       1513 |             508 |             615 |         76 |      28000 |
  LinkedHashSet |        226 |             240 |             133 |         66 |      32194 |
     ArrayDeque |         95 |          208836 |          317725 |        109 |      10200 |
          Stack |         91 |          124012 |          269064 |        148 |      10621 |
```

I honestly haven't got that much experience with a some of these collections, but it was
interesting to see the range some of them had.

#### Add
LinkedLists have a one of the quickest insertion times, especially compared to their
removal / contains times. The reason being that they don't need
to allocate or increase the memory usage as they can just place the element in a new area
in memory. This is unlike ArrayLists which need to allocate and relocate to a new place
in memory if the current allocation has been filled.

The slowest to add was the TreeSet by a large margin. This is due to the logic in the
underlying [Red-black tree](https://en.wikipedia.org/wiki/Red%E2%80%93black_tree). The
tree needs to balanced to maintain an effective search time when new values are added.

The Queues were also pretty quick at insertions, pretty much on level with the LinkedList. 
As Queues seem to be built on arrays I expected them to be similar to the ArrayList rather
than closer to the LinkedList. Looking into the Java code it looks like the only major 
difference is how they calculate the size in which the array is grown when it reaches
capacity.

```java
\\ This is in ArrayList::grow
ArraysSupport.newLength(oldCapacity,
                minCapacity - oldCapacity, /* minimum growth */
                oldCapacity >> 1           /* preferred growth */)

\\ This is from Vector::grow (used within the Stack)
\\ capacityIncrement is 0 by default
ArraysSupport.newLength(oldCapacity,
                minCapacity - oldCapacity, /* minimum growth */
                capacityIncrement > 0 ? capacityIncrement : oldCapacity
                                           /* preferred growth */);
```

The growth in the ArrayList increases the size by the oldCapacity bitshift once to the 
right, which is around a 50% increase each time. The Stack increases the capacity by
the oldCapacity value, so it doubles each time. I imagine this difference is why the 
Queues are slightly quicker. They needed to regrow less often (or not at all) during
the 1000 elements being inserted in the test.

In most cases this won't make a difference as the time difference is so small (~100ns). But it 
makes you aware of the importance of sizing an array if you know the size beforehand. This
would make more of a difference if the size of the collection changed dramatically.

#### Remove / Contains
The slowest to search and remove the collection was the LinkedList. This is because of the
way that linked lists are structured. Like an ArrayList they have to go through each element
from the beginning to find a given element. But due to the LinkedLists design of having
elements in separate areas of memory, and having to read / locate every element as you 
traverse the list, it takes a lot more time. Compared to just checking the next area in
memory as with an ArrayList.

Sets were by far the quickest at removal and contains. The HashSets were quicker as they
are able to run a constant hash function in O(1) time to get the value's location. On the
other hand TreeSets run in O(long n) time as they need to traverse the underlying binary
tree. Removal was slightly slower for the TreeSet as well as it needs to
re-arrange the underlying binary tree to keep the order.

The Queues (Stack and ArrayDeque) have a similar time to the ArrayList. It looks like this
is because they are all built on an underlying array.

#### Size
Calling the size method was pretty much constant between all elements. This is because
they all keep track of the size internally. So all they have to do is check that internal
value.

#### Memory Usage
Again the results for the memory usage weren't that surprising. The Queues and Lists built
on arrays were the smallest and all pretty similar. Due to arrays being essentially just
a block of data with not much else.

The Sets were the largest as they have to contain the underlying HashMap, which maps the
hash result to the location in memory. They also contain objects to help maintain insertion 
order (LinkedHashSet) or ordering (TreeSet).

The LinkedList is in the middle of the two. It's larger than an array as each 
element needs to store the location of the previous and next element.

### Different Objects
I ran the results again but used a custom object called Contact (6 string fields and an
integer field) that contained more data than an Integer.

```text
Contact Collection with 500000 elements running each process 1000 times

                |   add (ns) |     remove (ns) |   contains (ns) |  size (ns) | bytes (KB) |
      ArrayList |        280 |         1722565 |         3936094 |        142 |     222160 |
     LinkedList |        109 |        21198885 |        40902217 |         99 |     232000 |
        HashSet |        441 |             540 |             587 |         92 |     240194 |
        TreeSet |       1479 |            1399 |            1482 |         74 |     240000 |
  LinkedHashSet |        395 |             415 |             388 |         79 |     244194 |
     ArrayDeque |        103 |         2329822 |         5272262 |        114 |     222200 |
          Stack |         91 |         3115778 |         7131846 |        155 |     222621 |
```

The add timings were about the same as before. Generally add shouldn't be
impacted by the size of the object as the references to the object are being written to
the array rather than the whole object.

Remove and contains were much slower for the Lists and Queues, but only slightly slower
for the Sets. The reason the Lists and Queues were so slow (~20x slower) is because they
needed to call .equals on the Contact for every single element they check against. This
has a chance to get even slower depending on the implementation of .equals. The Sets
only have to calculate the hash once per search, just like when using Integers. So even if
calculating the hashCode value is complex it only needs to be done once.

The difference in memory usage is about the same as when we used Integers. Although the 
actual memory usage has increased around 10x. The large increase is just due to fact Contacts
hold much more information compared to an Integer. I'm a bit surprised that the difference
in memory is the same. I assume this is because all the implementations only hold references
to the objects or hashes, both of which remain a constant size independent of the object.

## Summary
Overall this was an interesting little project. I hadn't really ever thought about the 
byte size of collections before so that was interesting to explore. I'll also look at 
increasing the use of Sets where I can because of how much quicker the lookup is (for 
removal and searching).

It would be interesting to plot the times on a graph using different array sizes 
and seeing how they compare to their Big-O timings.