---
title: Java Multithreading Revision
header: Java Multithreading Revision
description: Revision on Java multithreading and how to do it
type: blog
creationDate: 2024-07-07
numbered: true
---

It's been a while since I've done any multithreading in Java. So this blog will be a quick
reminder / rundown on how multithreading is done within Java. It will also contain a quick 
analysis of multithreading performance.

<div id="doc-menu-area"> </div>

## How to Run Multiple Threads
There are two main methods to use when creating / running multiple threads in Java.

### Using "Thread"
#### Managing Threads
Using the Thread class requires you to create and start each thread manually. You can then
use methods like .start() and .join() to manage the flow of the thread. This technique 
requires more resources per Thread as each one requires memory to be reserved.

#### Implementing Logic
There are two ways you can implement the logic when using the Thread class.

The first way is to implement the Runnable interface. You can then create an instance of
your new class and pass it to a Thread object. The benefit of this is that you can 
separate your logic and the Thread class. You can also retrieve values from your Runnable
instance after the thread has run.

The second way is to extend the Thread class and override the run method. This makes
creating the thread a little simpler, but under the hood the Thread class implements
Runnable. So you're just needlessly tying your logic to the Thread class and might as well
just implement Runnable yourself.

```Java
// The Thread class being extended and overriding run. Not recommended.
public class FibonacciThread extends Thread {
    @Override
    public void run() {
        // This just finds the 10_000_000th fibonacci number to simulate work being done
        Fibonacci.fibonacci();
    }
}

// The Runnable interface being implemented and overriding run
public class FibonacciRunnable implements Runnable {
    @Override
    public void run() {
        Fibonacci.fibonacci();
    }
}

// The threads have to be created and run manually
Thread threadExtended = new FibonacciThread();
threadExtended.start();
Thread threadRunnable = new Thread(new FibonacciRunnable());
threadRunnable.start();

// Calling join will wait until the thread is completed
threadExtended.join();
threadRunnable.join();
```

### Using "ExecutorService"
#### Managing Threads
Using the ExecutorService is easier and more reliable than using Thread and allows you to
manage the Threads more effectively. It comes with useful methods for managing the threads
such as shutdown and invokeAll.

You can also create different types of ExecutorService depending on your use case. For 
example, Executors.newFixedThreadPool(int n) created n threads that are reused to complete
a queue of tasks. Executors.newCachedThreadPool() creates new threads when needed but 
can reuse already created threads when they're available. There are others that you can 
view on the [Executors Javadoc](https://docs.oracle.com/en/java/javase/22/docs/api/java.base/java/util/concurrent/Executors.html).

Under the hood this class manages Thread objects and assigns them given tasks.

#### Implementing Logic
As with Thread you can create a class that implements Runnable and pass this to an 
ExecutorService.

In addition to this you can also implement the Callable interface. The difference from 
Runnable is that the Callable interface allows you to return an object. This returned 
object is wrapped in a Future. The future allows you to check if the contained object is
present and ready to be returned with .isDone(). You can also call .get() that will wait
until the object is ready and then return the result, or return the result immediately if 
it is ready.

```Java
// The Callable class being implemented and overriding call
public class FibonacciCallable implements Callable<Integer> {
    @Override
    public Integer call() {
        return Fibonacci.fibonacci();
    }
}

// Create the ExecutorService with the given number of threads
ExecutorService executorService = Executors.newFixedThreadPool(2);
      
// Create the threads and retrieve the Futures containing the results
Future<?> runnableFuture = executorService.submit(new FibonacciRunnable());
Future<Integer> callableFuture = executorService.submit(new FibonacciCallable());

// Calling get will wait until the value is ready
runnableFuture.get();
callableFuture.get();
```

## Example
In com.calebstride.analysis.multithread.threads.ExecutorServiceManager you can see 
that I run an ExecutorService 
given a number of tasks and a number of threads. The Executors class will create an
ExecutorService with the given number of threads. It will then run each task using 
the thread pool controlled by ExecutorService.

To provide the threads with some work I added a task to calculate a fibonacci number. 
This happens really quickly with lower
numbers, so I calculate numbers above 100_000_000 to make the tasks run for a longer period.

When the task runs really quickly then the ExecutorService spends a longer time creating
the appropriate number of threads, and managing tasks than actually running the logic. 
Therefore, if you only have a smaller number of quicker tasks then multithreading 
tends to provide little benefit.

```text
12137 ms // Two threads, 1000 tasks
3151 ms // Eight threads, 1000 tasks
```

The results above show that increasing the threads will reduce the time taken. This will 
change when we reach the maximum threads the system can handle, at which point any more
threads will be idle and unable to run in parallel.

To expand upon these results I decided to run the same tasks but using a larger range of
threads. I start from single threaded up to using 20 threads.

```text
 Number of Threads |  Average time (ms) | 
                 1 |              24051 | 
                 2 |              12119 | 
                 3 |               8118 | 
                 4 |               6111 | 
                 5 |               4922 | 
                 6 |               4133 | 
                 7 |               3590 | 
                 8 |               3164 | 
                 9 |               2847 | 
                10 |               2586 | 
                11 |               2376 | 
                12 |               2213 | // The time from here no longer decreases
                13 |               2213 | 
                14 |               2209 | 
                15 |               2213 | 
                16 |               2213 | 
                17 |               2210 | 
                18 |               2206 | 
                19 |               2213 | 
                20 |               2215 | 
```

The results line up nicely with the system I'm running on. I have a system with 12 logical
processors, so the system shouldn't speed up when using any number of threads above that,
which is what the results show.

The results also show very nicely that when we double the threads the time taken is halved.
You can also see how the overhead of managing the tasks on the threads is added to the 
execution time. If you multiply the 12 threads time by 12 (the total time spent executing) 
then you get 26556ms, which is 2 seconds longer than running all the tasks on one thread.

## Summary
This blog gave a good opportunity to look back at some of the fundamentals of 
multithreading and refresh my memory on those. It also shows how the benefit of 
multithreading can depend greatly on the system you're running the code on.

There are many more features within Java concurrency, that are important when creating
multithreaded applications, which are not explored in this blog. Such as synchronisation,
atomic operations and handling concurrency exceptions.