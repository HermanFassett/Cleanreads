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

All you need to do is visit a book and it should all work! The script will parse the data on the page, give you a Cleanreads rating guesstimate and let you view the details of how it came up with the estimate.

When you first load the page it might take a few seconds but then it should give you a simple verdict: ![Basic example](/images/Basic_Example.png)

First it gives a simple rating (Most likely clean, Probably not clean, Unknown, etc), then shows in parentheses the count of positive terms and negative terms it found in description/reviews that it based the rating on. For instance "Probably not clean (1/5)" would mean Cleanreads found 1 term that indicated it may be a clean read and 5 terms that indicated it may not be a clean read, so it is probably not a clean read.

If you want to see exactly how Cleanreads determined the rating, just click the (Details) link and it should expand to show where it is drawing its conclusion from:

![Example details](/images/Details_Example.png)

Clicking (Hide) should once again collapse the details.

That's all you need to know! Have fun!
