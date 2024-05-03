---
title: App
header: App (Manage Cabbage)
description: Creating the android app version of Manage Cabbage 
---

After thinking a while about how I actually use the current Manage Cabbage website to
manage my finances, I realised that I only really used the website through my phone. So I
thought about creating an app version of the website that I could create. I had always 
been slightly interested in learning app development and had no prior experience, so I 
decided to give it a go.

<div id="doc-menu-area" class="numbered-menu"> </div>

## Picking a framework
The first thing I had to do was to pick a language / framework to create the app in. I 
have an android phone so that already limited my choices slightly. I wanted to find one
that I wouldn't need to learn a new language for, and that was popular enough to have
good resources and decent learning materials.

### React Native
The first framework I looked at was [React Native](https://reactnative.dev/). This framework
seemed like a good contender. It uses javascript, which I have previous experience using.
I also have experience using the web version of React so a lot of the terminology would
be familiar. The site has a good amount of resources and learning material, as well as a
decently sized community. In addition, as it is written in javascript it is platform independent,
meaning that the app I develop can be used on both Android and ios devices.

### Jetpack Compose
I then decided to look if any framework used Java, as that is the language I have most
experience with, and therefore would be easiest to learn. It turns out that most native 
Android apps use Java as their main language, which I was unaware of.

Looking into this a bit more it appears that Android now encourages app developers to use
Kotlin + Jetpack Compose rather than Java + XML for development. Therefore, I started looking at
[Jetpack Compose](https://developer.android.com/develop/ui/compose). The language it uses
is Kotlin, which I had no experience with, but it compiles into Java bytecode and runs
on the JVM. It seemed to have a good collection of learning resources and documentation. 
The only downside seemed to be that it was normally only used for creating Android apps
and couldn't be used on other platforms. There are the Compose Multiplatform libraries,
but they seemed early on in development.

### Flutter
The final framework I looked at was [Flutter](https://flutter.dev/). This uses Dart as 
its programming language which, unlike the other frameworks I looked at, I had no 
experience in at all. Like the other two it seemed to have a large amount of learning
resources and the community seemed pretty large. Like React Native this could be deployed
on any platform, including the web.

### Final Choice
My final decision for the framework I was going to use was Jetpack Compose. The main
reason being that I would find working in the JVM ecosystem a lot easier than in 
javascript, or learning Dart from scratch. Although I would need to learn Kotlin, but as
I already had a good grasp on Java it shouldn't be too difficult. It's also specifically
made for Android which is the device I use and will be developing for.

## Learning the framework
I started learning Jetpack Compose by doing [this tutorial](https://developer.android.com/courses/android-basics-compose/course).
It started completely from the ground though and assumes you have very little coding
experience, which does make some parts worth skipping.

### Kotlin
This tutorial also included resources to learn Kotlin. I found Kotlin pretty fun to use.
It's very similar to Java, although you seem less restricted to having to define classes
to do everything. 

Functions are also first class, so you can pass them around as parameters
or store them in variables. This is what Jetpack Compose uses as it's main structure to create
elements. For example, I can pass a function to a method that with apply some processing
after running the lambda, no matter what the lambda does

```kotlin
// Functions can take another function as an argument 
// (Unit means nothing is returned, a bit like void in Java)
fun onClickHandler(onClick: () -> Unit) {
    // Run the given lambda
    onClick()
    // We can then do additional processing
    println("Clear up some data")
}

// You can then call the handler and run whatever you want in the lambda
onClickHandler({ println("Do some processing") })

// If the final parameter of a function is a lambda it can be moved outside of ()
onClickHandler() { println("Do some processing") }

// Finally an empty () isn't needed if no other params are present
onClickHandler { println("Do some processing") }

// The above three function calls are identical
```

It also handles null a lot better than Java. Instead of every type possibly
being null and having to fudge your way around it with null checks and @NotNull etc. you
can define types as possible being null by using '?' when defining the type. You can
also call methods safely on potential null values by using '.?'
```kotlin
// A string that is not nullable
var notNullable: String = "I am definitely not null"
notNullable = null   // This will show an error and is not possible

// A string that is nullable (Notice the '?')
var nullable: String? = "I could be null"
nullable = null      // This is fine as the string can be null

// It makes using values a lot easier
notNullable.length   // This is fine as we know the value is not null
nullable.length      // This will throw an error as it could be null

// If you want to call a potential null value you use '?.'
nullable?.length     // This returns null if the first value is null, otherwise calls .length
```

### Jetpack Compose
Jetpack Compose is a framework built on top of Kotlin. It behaves a little like a markup
language in terms of nesting elements. But you can define each element yourself using
some building blocks, such as Box, Column, Row and Text. Each component you define is
done in a function and marked with the @Composable annotation.

You can modify these components using a Modifier to give them extra details, such as
making them clickable, changing their colour, their shape and the position they're 
displayed.

```kotlin
// This creates some simple text with a blue background
@Composable
fun TextInBlueBox(textInput: String) {
    // As you can see the child elements are passed as a lambda function
    Box(modifier = Modifier.background(color = Color.Blue, shape = RectangleShape)) {
        // The text element will be displayed inside the box element
        Text(text = textInput)
    }
}

// You can then call this element
TextInBlueBox(textInput = "Display me in a box")

// Notice that you can optionally name parameters in Kotlin. The below would also work
// but it's best practice to write the parameter name with Composable elements
TextInBlueBox("Display me as well")
```
There are some libraries to add elements for you. The one in the training is the material
design 3 library which adds elements to fit with Google's material design guidelines.

### Learning Summary
In the end I had a good understanding of the main concepts and how to use them. I knew
pretty much everything I would need to create a CRUD application, which is what 
Manage Cabbage would be. Also, I liked how you were encouraged to match Google's material
design guidelines. As I hadn't had much experience with designing UIs this made it much
easier.

## Creating the app
From this position I was able to start creating my Manage Cabbage android application. 
Taking everything that I had learnt in the tutorials
I felt comfortable I knew everything I would need to know. This section just goes over the
main observations I had creating the app.

### Using Kotlin
I found using Kotlin pretty fun. It ended up being very similar to Java, so I felt
comfortable with the terminology and structure. But then it had a lot of features that
are definitely not well done in Java. For example the null handling is very nice, so
many times in Java you would have to do null checking just for safety. Whilst in Kotlin
there are features to make dealing with nulls a lot easier and quicker.

I miss ternary operators, as they aren't available in Kotlin. Instead, they have
one-line if else statements. Which are easier to read, but they don't look as nice.

Being able to assign variables from if statements and switch ('when' in Kotlin) statements
is very handy. For example,

```kotlin
// In Java
String a = null;
if (num > 6) {
    a = "GOOD";
} else if (num <= 6 && num > 3) {
    a = "OK";
} else {
    a = "BAD";
}
// In Kotlin
val a = if (num > 6) {
    "OK" 
} else if (num <= 6 && num > 3) {
    "BAD"
} else {
    "BAD"
}
```

Also, surprisingly I learnt quiet a lot about multithreading when creating the app. 
Multithreading is needed in Android apps to separate the rendering of the ui and the backend
work. This is so the main thread doesn't get stuck causing a janky UI. Kotlin has a 
multithreading library called Coroutines which is the suggested library to deal with this.

### Lack of uniformity
It did seem a bit like Jetpack Compose hasn't reached full maturity yet. The reason I think
this is that there are some features where there isn't much documentation online, 
and the documentation that exists conflicts with other places the feature is documented.

An example of this is when dealing with ViewModel state. Each example app or tutorial 
seems to deal with it slightly differently, whether it's the classes they suggest using
or the structure. It may also be just up to the developer how to structure it, but it was
something I had trouble fully understanding.

Also, when accessing a lot of features on the Android device, such as the Biometric features
or permission, a lot of the suggested ways of doing things use the old Android methods. 
They do work together with Jetpack Compose but are a bit awkward to implement and require
knowledge of the old framework. I'm not sure if this would be an issue with other frameworks
especially the multiplatform ones.

### Publishing
I found publishing the application to be pretty straightforward but rather slow. The main 
storefront for Android apps is Google Play. To get your app on Google Play you need to 
pay to create a development account. You also need to get 20 people to test the app 
before being able to publish it.

It did seem like the store isn't aimed at individuals creating apps but rather encourages you
to do it as a company instead. For example, having to have your details publicly available
on the store page.

There are probably legal reasons for this, but it makes using Google Play as an individual
a bit of a pain. It's also probably to try and keep the apps good quality and not allow
the store to fill up with shovelware.

### Creation Summary
Overall I found it interesting and pretty fun using Jetpack Compose and Kotlin. I think
I might enjoy Kotlin more than Java, which I wasn't expecting at the start of this project.
It seems a lot more flexible than Java whilst still somehow being strongly typed, and the
lambdas in Kotlin take the Java ones to the next level.

I also enjoyed being able to see the changes you make when creating the UI, which you
don't get to experience much when doing backend work.

## Final App
It was interesting working on app development especially since I've never done any work
on mobile applications before. It would be interesting to see how other frameworks worked
in comparison to Jetpack Compose but perhaps that's for another day.

In the meantime the app is still having features added but the majority of it has 
been completed and a demo version is [available on the play store](https://play.google.com/store/apps/details?id=com.managecabbage.android).