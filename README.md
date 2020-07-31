# Cleanreads
Cleanreads userscript for Goodreads.com

1. [Introduction. What is Cleanreads?](#introduction)
2. [Installation. What is a userscript?](#installation)
3. [Instructions. What do I do?](#instructions)

## Introduction

I'm often searching for books on Goodreads and end up searching through the description, Q/A, and comments in an attempt to determine if the book is a 'clean' read.

This script attempts a very basic search of the book description and the first page of comments to determine if the book is clean or not.

At this point it is very simple and could often be wrong, but if people like it hopefully it will be expanded to be more comprehensive. The original idea to create this script came from [this thread](https://www.goodreads.com/topic/show/19517252-introducing-goodreads-cleanreads-rating).

A simple example of what this can show you:

![Simple Cleanreads example](/images/What_Is_Cleanreads.png)

## Installation

This is a userscript, so it's custom JavaScript that is run on certain webpages to do custom actions.

To install a userscript, you will need a browser extension to load the script into the page when the website loads.

There are several options, but I recommend installing the [Tampermonkey](https://tampermonkey.net/) browser extension. It has an install for Chrome, Firefox, and Edge and this script should also work across all 3 browsers. The installation of the extension should be simple but there should also be an instuctional video on their website linked above if more help is needed.

Once you have the extension installed, you can install the latest release version of Cleanreads from Greasyfork (if viewing from Greasyfork, no need to navigate):
https://greasyfork.org/en/scripts/372914-cleanreads

On the link above just click the big "Install this script" button and Tampermonkey should jump in and give you a page with more information and another "Install" button you'll need to click.

Once you've installed the script, that should be all there is to it! Go visit a book on Goodreads and it should all work! If not, feel free to ask a question on the Greasyfork page or contact me directly.

## Instructions

### Basic Usage

All you need to do is visit a book and it should all work! The script will parse the data on the page, give you a Cleanreads rating guesstimate and let you view the details of how it came up with the estimate.

When you first load the page it might take a few seconds but then it should give you a simple verdict which can be expanded: 

![Basic example](/images/Basic_Example.png)

First it gives a simple rating (Most likely clean, Probably not clean, Unknown, etc), then shows in parentheses the count of positive terms and negative terms it found in description/shelves/reviews that it based the rating on. For instance "Probably not clean (1/5)" would mean Cleanreads found 1 term that indicated it may be a clean read and 5 terms that indicated it may not be a clean read, so it is probably not a clean read.

If you want to see exactly how Cleanreads determined the rating, just click the (Details) link and it should expand to show where it is drawing its conclusion from.

Here are a couple examples:

![Example details](/images/Details_Example_2.png) ![Example details](/images/Details_Example.png)

Clicking (Hide) should once again collapse the details.

That's all you need to know for basic usage, but you can also fine tune how it determines what is clean in the settings.

### Settings

To find the settings, go to your profile (if you're not logged in you can find it on anyone's profile), and there should be a link to "Cleanreads settings" available. When you click on that the default settings will pop up and be available for editing:

![Settings dialog](/images/Settings_Dialog.png)

Here there are several options:

1.	Add Positive: adds a new positive search term that adds a point towards the book being clean if matched.
2.	Add Negative: adds a new negative search term that adds a point towards the book NOT being clean if matched.
3.	Reset: This resets all the settings back to default. For now default is pretty simple as shown but can be expanded. Could also potentially add import/export if desired.
4.	Snippet Length: Here you can determine how long the snippet shown before and after a matched term in a review in the expanded Cleanread description is.
5.	Max Verdict Load Attempts: This determines how long it tries to load reviews since they don't load immediately with the page. Increase this if you have exceptionally slow internet I guess...

But how exactly do these Positive/Negative search terms work?

As you can see there are three columns to each search term row. These columns represent in order the "before" text to ignore, the term to match, and the "after" text to ignore.

For instance, for the column that has "no" in the before column, "sex" in the match column, and "ist" in the after column, this means that Cleanreads will search for the word "sex" in reviews/description/shelf names, and count that as a negative search term ONLY if the actual text doesn't read "no sex" or "sexist". Also, the before and after columns allow comma-separated values, so you could change the before column to be "no, very little" and then if it found the text "very little sex" in a review, it would ignore it as a negative search term, but it would match something like "some sex ....".

Now, you should be able to add your own columns. For example, you can click that Add Negative button, and just put "gore" in the middle match column. This way it doesn't care where or how gore appears in a review, if it finds it, that will be a mark against this book being clean.

Hopefully this at least kind of makes sense. Feel free to reach out with questions or rewrite these instructions if you can come up with better. :) Have fun reading!