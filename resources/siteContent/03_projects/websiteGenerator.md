---
title: Website Generator
header: Website Generator
---

This project was created to generate the website you're looking at now. It's main 
purpose was convert markdown files into a collection of static html files. 
Admittedly I could have used many different web templates or website technologies to 
create this website. But I wanted to make the website small and quick to load. I've 
tried to keep the javascript used down to a minimum and only use it where it is needed.

<div id="doc-menu-area" class="numbered-menu"> </div>

## Summary
The tool works in a similar way to [jekll](https://jekyllrb.com/). It takes 
your markdown files and converts them into static html pages. The reason for 
this was to allow for documentation to be written easier, rather than writing 
it directly to html.

You can use javascript, css and other files along with the produced html files.

[View the source code on GitHub.](https://github.com/CalebStride/personal-site)

## How it works
The code is pretty simple. It takes your markdown files and uses a Markdown 
parser to generate html content, it then adds this to templates files which then
form the final html page. These files, along with all the other webpage content, 
get moved into a new directory that makes up your functioning website.

![Flow diagram of website generation](/images/webGenerator/siteGenFlow.png)

Each markdown page can have config defined within it to change the header, title
and template.

After the pages are generated you can then move the contents of the output 
directory into a web host of your choice.

### Site Navigation / Layout
There are some other things that are done during the website generation that 
can help with the website development. For example a site map is generated. This 
is a Json object that contains the file structure of your web pages. This is the 
same as the file structure of your markdown files, so you can use it to create a 
navigation menu in your website. 

This works by creating a tree structure when going through the markdown files. 
There were some things I had to do to make this work as expected. For example, 
as the files are read in an order that might differ from the order you want pages 
to appear in the website, I allowed a number suffix in the file names so an order 
could be enforced. This suffix is removed in the html pages.

### Html Generation
One thing I changed during development was to move the generation of the navigation
menu and content menus to the markdown conversion stage, rather than having it 
generated in the ui.

As you don't have access to the DOM when you're running javascript in node you
can't just create html like you would in a browser. I used the 
[cheerio](https://github.com/cheeriojs/cheerio) dependency, so I could do this 
within node. The example below show's an example of using cheerio, where I'm 
creating a button that will run some function if clicked. Then appending that 
button to a node in my document.

```javascript
// Load the file as a cheerio object
const $ = cheerio.load(existingHtmlString);
// Get a node of interest using jQuery esc selector
const $selectedNode = $('#idSelector');
// Create a new button 
let $genericButton = $(`<button onclick="runGenericFunction();">Press Me!</button>`);
// Append the button to the node you selected earlier
$selectedNode.append($genericButton);
// Then return the whole document as a html string for saving
const newHtmlString = $.html();
```

Most of the logic is pretty similar to using jQuery. It then leaves me with
working html that I can save and serve as static files.

The main reason I moved this to the file generation was to reduce the amount of 
time the page took to render.
Even though this time would be negligible it had to be run every time a page was
visited. Instead, it now loads once when first loading the page but can be cached
for subsequent requests.

### Blog pages
This part of the site is still under development. I was thinking about a search
functionality which could be helpful if someone had a lot of blog posts. But 
currently this would just contain a list of subpages.

## Thoughts
I thought this was a fun little project. I definitely learnt a bit about node
as I hadn't previously used it. I didn't write any tests for this as I'm not 
sure on how testing frameworks work within node so that's something to look in to.

You can see the website that I generated using this tool
[here](https://calebstride.com/index.html) and the 
[resources](https://github.com/CalebStride/CalebStride.github.io) of that site.


