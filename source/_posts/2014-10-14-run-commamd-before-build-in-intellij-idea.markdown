---
layout: post
title: "Run commamd before build in IntelliJ IDEA"
date: 2014-10-14 17:22:29 +0800
comments: true
categories: [Java]
tags: [Java, Android,  IntelliJ]
---

I came across [this question at `StackOverflow`][0] when I was searching the same question in Google. 

I found that you don't need a ant build script, that is just use the IntelliJ default system is just fine. For example, I am doing my project with android-ndk, so I want intelliJ run `ndk-build NDK_DEBUG=1 -j4` before normal build.

Here is the solution:

 1. Run -> Editor configuration
 2. Select on of you build configuration in the left side of the dialog.
 3. On the right side there is an area marked as **Before Launch**
 4. Click the "plus" button, choose `Run External Tool` in the popup menu.
 5. Click the "plus" button in the new popup window
 6. Then you get into the real configuration window.

Let me show you some fine picture:

1. Select on of you build configuration in the left side of the dialog. 

![Select on of you build configuration in the left side of the dialog.][1]

2. On the right side there is an area marked as **Before Launch**  

![On the right side there is an area marked as **Before Launch** ][2]

3. Select on of you build configuration in the left side of the dialog. 

 ![enter image description here][3]

4. Click the "plus" button in the new popup window 

![Click the "plus" button in the new popup window][4]

5. Then you get into the real configuration window. 

![Then you get into the real configuration window.][5]


[0]: http://stackoverflow.com/questions/8380693/run-e-g-calc-exe-before-build-in-intellij-with-android-projects
[1]: /assets/storage/run_commamd_before_build_in_intellij/step1.png
[2]: /assets/storage/run_commamd_before_build_in_intellij/step2.png
[3]: /assets/storage/run_commamd_before_build_in_intellij/step3.png
[4]: /assets/storage/run_commamd_before_build_in_intellij/step4.png
[5]: /assets/storage/run_commamd_before_build_in_intellij/step5.png

