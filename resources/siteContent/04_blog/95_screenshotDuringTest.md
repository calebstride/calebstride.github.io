---
title: Screenshots in Android Tests
header: Screenshots in Android Tests
description: Taking a screenshot in an android test using jetpack compose
type: blog
creationDate: 2024-05-17
numbered: true
---

As I was getting ready to publish my app there was a requirement to post screenshots of your
app so potential users know what it looks like.

I did this manually on an Android emulator by going to the screens I wanted and taking a
screenshot. I then had to transfer the screenshots from the emulator to my pc. I could
then upload them to the store page.

The issue with this is that it was pretty slow. Also, if my ui changed at all I would need
to redo it again. So I started looking at ways to automate it.

<div id="doc-menu-area"> </div>

## Requirements
There were a few things I needed to make sure were possible with the solution I choose.

Firstly I would prefer to be able to run this as a test via JUnit. This is just so it 
fits with the rest of the architecture and could be run easily with Gradle and the current
build pipeline.

Secondly I need to be able to run the whole version of my app with data included. This is
so the screenshots are meaningful and show of what the system looks like in use.

Finally, it would be useful to run the test using different screen sizes. This way I can
create screenshots for tablet devices as well as mobile ones.

## Research
I spent a while looking at different solutions to solve this. Ideally I could just write 
some pre-defined flow in a test and then at each point I wanted a screenshot I would just
have to call some method to take the screenshot. Then at the end I would have a collection
of the screenshots I wanted.

### Paparazzi
The first potential solution I came across was [Paparazzi](https://github.com/cashapp/paparazzi).
This allows for you to render you application screens without using an emulator, and also
allows you to take an image from these rendered screens. It also fully integrates with
JUnit and Gradle.

### Shot
The next solution I looked at was [Shot](https://github.com/pedrovgs/Shot). This seems to
be a screenshot testing plugin. It also includes support for Jetpack Compose.

From what I can see this library is built upon 
[Screenshot Tests for Andriod](https://github.com/facebook/screenshot-tests-for-android) 
but unfortunately that library doesn't support Jetpack Compose. It also hasn't been updated
for two years.

### Android Testify
This next one is called [Android Testify](https://github.com/ndtp/android-testify/). Like
the others it supports Jetpack Compose out of the box. It also comes with an Android
Studio plugin to help with retrieving and recording screenshots.

This seems like a pretty small project, but it appears to have good documentation. From
a brief look it looks like it supports working with composeTestRule so writing
tests would be similar to existing ui tests I have.

### Dropshots
[Dropshots](https://github.com/dropbox/dropshots) is another open source screenshot testing
Gradle plugin. This seems to focus on having your screenshots within your test device so
comparisons can be made straight away within the test. This isn't really relevant to me
though as I only want the screenshots to be able to post them on the play store.

Apart from that it looks pretty similar to the other frameworks, although this one doesn't
have much in terms of documentation. So it could potentially be hard to get working. I also
don't see any mention of Jetpack Compose so there's a chance that getting my app to work
would be difficult.

## Data Issue
After looking at a few solutions I'm starting to think that having real data when creating
the screenshots might be unnecessary and make things more complicated. 

The reason being that with some real data I would need to either create it within the app
during the test. Or load it into the app via the restore data feature.

Creating the data through the app would just take too long. I would need to code 
every button press and field input, and I want a fairly large amount of data to make all the 
graphs and pages look populated.

Importing some manually created data wouldn't be too bad. Currently, I do this during manual
testing as it's quick and easy to do. The issue would be moving the 
data to the emulator in the test, which would somehow need to be done within a Gradle script.

### Mock Data
Instead, I think using some fake/mock data would be easier. I could create this data in the 
test and manipulate it easily. 

I already have some fake classes set up to replace all the
classes that interact with a database. These are loaded for tests using hilt. These 
classes essentially just return a constant set of data instead of interacting
with any database. For example,

```kotlin

// The normal repository that retrieves accounts from a database
AccountRepository(private val accountDao) {
    fun getAccounts(): Flow<List<Account>> {
        return accountDao.getAccounts()
    }
}

// The fake repository, allowing me to define the data used in the tests
FakeAccountRepository() {
    fun getAccounts(): Flow<List<Account>> {
        return flow { emit(someConstantDefined) }
    }
}
```

## Choice
All of these libraries seem to be screenshot testing libraries, where the screenshots are 
compared against some baseline desired screenshots. Then if there's a difference between
the screenshots then the test will fail. But for my use cases I only need to take the 
screenshots without any comparisons.

The thing I don't really like about the majority of them is that they require you to 
retrieve the screenshots from the emulator after taking them. But after looking a bit more
into how Instrumentation tests work this is probably unavoidable. The reason being that 
when you run an Instrumentation it runs the test on the emulator. So any screenshots you 
take have to be saved on the emulator.

I was torn between either Paparazzi or Android Testify. But I think paparazzi is built for
testing specific components rather than running the whole app. And since I would need to
load in my whole app to get the desired screens I decided to go with Android Testify.

## Research Again
Before I started using the library I decided to take a look at other ways of creating 
screenshots. As currently I've only really been looking at screenshot testing libraries. 
It turns out there are many different ways it can be done.

### PixelCopy
There's a class called PixelCopy within the android.view package. You can copy the whole 
view into a bitmap image.

```kotlin
// This is setup for a ui test with hilt dependencies
@HiltAndroidTest
@RunWith(AndroidJUnit4::class)
class ScreenshotTest {
    
    // This injects all the hilt dependencies
    @get:Rule(order = 0)
    val hiltRule = HiltAndroidRule(this)
    
    // This creates the rule for controlling the app activity
    @get:Rule(order = 1)
    val composeTestRule = createAndroidComposeRule<MainActivity>()
    
    // Provides a directory to save the images on the device
    private val screenshotsDir = InstrumentationRegistry.getInstrumentation().targetContext.filesDir
    
    @Test
    fun createScreenshot() {
        // Get the window and save create a bitmap of the same size
        val window = composeTestRule.activity.window
        val bitmap = Bitmap.createBitmap(
            window.decorView.width,
            window.decorView.height,
            Bitmap.Config.ARGB_8888
        )
    
        // Copy the window into the provided bitmap
        PixelCopy.request(window, bitmap, { pixelCopyResult ->
           if (pixelCopyResult == PixelCopy.SUCCESS) {
               saveBitmap(bitmap, "screenshot.png")
           }
        }, Handler(Looper.getMainLooper()))
    }
    
    // Save the bitmap into the given file location
    private fun saveBitmap(bitmap: Bitmap, fileName: String) {
        val file = File(screenshotsDir, fileName)
        FileOutputStream(file).use {
            bitmap.compress(Bitmap.CompressFormat.PNG, 90, it)
        }
    }
}
```
This worked as expected and the screenshot.png was on the device after running the test.
The only downside was that the screenshot contained the window toolbars as empty spaces.

### Ui Automator
[Ui Automator](https://developer.android.com/training/testing/other-components/ui-automator) 
seems to be a library for writing tests that focuses on the whole device rather than a
specific activity. It allows you to launch different apps during the test and also interact
with the device.

This means you can call [UiDevice.takeScreenshot](https://developer.android.com/reference/androidx/test/uiautomator/UiDevice#takeScreenshot(java.io.File)) 
to create a screenshot file of the whole device. I didn't try this one, but it seems like 
a very versatile library.

### DeviceCaptor
[DeviceCaptor](https://developer.android.com/reference/androidx/test/core/app/DeviceCapture)
has the takeScreenshot method. This mentions it's a wrapper for the Ui Automator's screenshot
method. So I expect it acts the same way.

### SemanticNodeInteraction
[SemanticNodeInteraction](https://developer.android.com/reference/kotlin/androidx/compose/ui/test/SemanticsNodeInteraction) 
has the captureToImage method. This returns a bitmap of the captured image which can be saved
on the device.

The benefit of this one is that other UI test I currently have make use of SemanticNodeInteraction
for ui interaction and assertions. It also works directly with the composeTestRule which
is used for creating compose ui tests.

```kotlin
// The test could not be much shorter and doesn't include any of the system ui
@Test
fun createScreenshot() {
    saveBitmap(composeTestRule.onRoot().captureToImage().asAndroidBitmap(), "screenshot.png")
}
```

## Creating a test
After looking at the non-screenshot-test ways I decided to give the SemanticNodeInteraction
method a go. The main reason being that it wouldn't require me to add any more 
libraries to my project and the tests would fit with the currently running tests.

I had already managed to create the file as shown by the example above. What I needed to
do was move that file to my local storage after the test was run. Ideally I could
move it to somewhere where it would be tracked by git.

### Moving Files from the Emulator
I found a feature where if you saved a file in the 
"/sdcard/Android/media/<appId>/additional_test_output" directory it was automatically 
moved to the "app\build\outputs\connected_android_test_additional_output" directory. 
It would then be within a file named after the emulator. I couldn't find much about this
feature apart from a [mention on stackoverflow](https://stackoverflow.com/questions/74069309/copy-data-from-an-android-emulator-that-is-run-by-gradle-managed-devices), 
so I'm not sure if it's actively supported.

The only downside with this is that it's not in a file managed by git. It also is in a file
named by the emulator. So if I changed emulator it would appear in a different file.

The other way would be to copy the files across using a gradle task. This task would
run an adb command that would copy the files. I could then run this task whenever I wanted
to update the screenshots, and have them updated in the git repository.

```kotlin
task<Exec>("copyScreenshots") {
    commandLine(adbPullCommandArgs)
}
```

Again though, like the other way, this has the problem that if there are multiple emulators
then the command probably won't run correctly. It also requires you to have abd installed 
and working (which you most likely would if running this).

### Final Solution
The final solution I had was a new object that would use a SemanticsNodeInteraction and 
filename to create a new screenshot file. This would
allow you to take a screenshot of the node you wanted, which would then be saved on the 
emulator.

```kotlin
object ScreenshotCreator {
    // Ensures the files are moved after the test is run
    private val screenshotsDir = File("/sdcard/Android/media/${BuildConfig.APPLICATION_ID}/additional_test_output")
    
    init {
        // Create the directory if doesn't exist
        screenshotsDir.mkdirs()
    }
    
    // Create the screenshot from the node and the filename
    fun create(semanticsNodeInteraction: SemanticsNodeInteraction, fileName: String) {
        val bitmap = semanticsNodeInteraction.captureToImage().asAndroidBitmap()
        val file = File(screenshotsDir, "$fileName.png")
        FileOutputStream(file).use {
            bitmap.compress(Bitmap.CompressFormat.PNG, 90, it)
        }
    }

}

// Example of running the screenshot creation on a root node, will create filname.png
ScreenshotCreator.create(composeTestRule.onRoot(), "filename")
```

I then created a gradle task that would find the screenshots and move them to the git
repo. This could either be run manually or setup so that it runs after a build. I created
this in the parent gradle file.

```kotlin
// Copy the screenshot files into the git tracked repo=
task<Copy>("copyScreenshots") {
    // Sort the files by creation date and then keep the most recent if multiple have the same name
    val screenshotsByDate = fileTree("app/build/outputs/connected_android_test_additional_output") {
        include("**/*.png")
    }.files.sortedByDescending {
        Files.readAttributes(it.toPath(), BasicFileAttributes::class.java).creationTime().toInstant()
    }.distinctBy { it.name }

    from(screenshotsByDate)
    into("otherFiles/screenshots")
}
```

## Thoughts
I think this solution works fine for what I need it for. I also don't really need any other
tests in the end as I can just create a screenshot in existing tests. I also don't need
to do any testing or analysis with the screenshots.

The solution fits all my requirements apart from the multiple screen sizes one. I decided
for now I can just run the tests with different emulators. Using different screen sizes is
something I need to figure out for all my testing.

I was also looking at other app pages on the Google Play Store to get an idea of how
other apps format their screenshots. It appears that a lot of apps include text with their
screenshots and an image of the actual device. They could be using tools like [AppMockUp](https://app-mockup.com)
or [device art generator](https://developer.android.com/distribute/marketing-tools/device-art-generator).
Google recommends not using any framing for screenshots on the device art 
generator page, so I won't be doing any post-processing to my screenshots. I find this
pretty interesting though as many of the Google apps show text and the device frame, such
as [Google Photos](https://play.google.com/store/apps/details?id=com.google.android.apps.photos&hl=en&gl=US)
and [Google Wallet](https://play.google.com/store/apps/details?id=com.google.android.apps.walletnfcrel).

Overall I think I've spent a little too long looking into this for the help it 
currently provides. Especially considering I
won't need to update the screenshots that frequently. In the future it 
could prove a lot more beneficial, especially if I need screenshots for documentation. 
Another plus side is that I could use this tool for debugging if I have to take screenshots 
to make sure a page is rendering correctly. Either way it definitely wasn't wasted time
as I learnt a lot more about UI testing within the Android ecosystem.