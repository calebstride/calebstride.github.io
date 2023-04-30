---
title: Website Generator
header: Website Generator
---

This project was created to generate the website you're looking at now. It's main purpose was convert markdown files into a website that could be viewed and explored. Admittedly I could have used many different web templates or website technologies to create this website. But I wanted to make the website small and quick to load. I've tried to keep the javascript used down to a minimum and only use it where it is needed.

<div id="docMenuArea"> </div>

## Summary
The tool works in a similar way to [jekll](https://jekyllrb.com/). It takes your markdown files and converts them into static html pages. The reason for this was to allow for documentation to be written easier, rather than writing it directly to html.

You can use javascript, css and other files along with the produced html files.

## How it works
The code is pretty simple. It takes your markdown files and uses a markdown parser to generate html content, it then adds this to templates files which then form the final html page. These files, along with all the other webpage content, get moved into a new directory that makes up your functioning website.

![Flow diagram of website generation](/images/webGenerator/siteGenFlow.png)

Each markdown page can have config defined within it to change the header, template along with other small details.

After the pages are generated you can then move the contents of the output directory into a web host of your choice.

### Site Navigation / Layout
There are some other things that are done during the website generation that can help with the website development. For example a site map is generated. This is a Json object that contains the file structure of your web pages. This is the same as the file structure of your markdown files so you can use it to create a navigation menu in your website. 

This works by creating a tree structure when going through the markdown files. There were some things I had to do to make this work as expected. For example, as the files are read in an order that might differ from the order you want pages to appear in the website, I allowed a number suffix in the file names so an order could be enforced. This suffix is removed in the html pages.

One thing I might change about this is having the navigation menu generated within the tool rather than generating it every time a page is visited. This would allow for slightly quicker load times when browsing multiple pages.

### Blog pages
This is something that was made a lot harder by the fact that I'm not using any kind of backend and it had to be done in the frontend.

## Thoughts
I thought this was a fun little project although I did spend a lot of time tweaky things in it. I added another page HHEEEEEEEEEEEEEERE about the actual website. 


