# Types for R Project
# Project Template

This template will help you get started with your project. Please look through all these materials so you know how to organize your project.

Link to your page:
https://NEU-CS-7250-S20.github.io/project-team-7 

# Instructions

## Setup

1. Clone this repository to your local machine.
  
    E.g., in your terminal / command prompt `CD` to where you want this the folder for this activity to be. Then run `git clone <YOUR_REPO_URL>`

    **Under no circumstances should you be editing files via the GitHub website user interface.** Do all your edits locally after cloning the repository.

1. `CD` or open a terminal / command prompt window into the cloned folder.

1. Start a simple python webserver. E.g., `python -m http.server`, `python3 -m http.server`, or `py -m http.server`. If you are using python 2 you will need to use `python -m SimpleHTTPServer` instead, but please switch to python 3 as [Python 2 was sunset on 2020.01.01](https://www.python.org/doc/sunset-python-2/).

1. Wait for the output: `Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/)`

1. Now open your web browser (Firefox or Chrome) and navigate to the URL: http://localhost:8000

## Update Hyperlinks

1. In `README.md` (this file) update the URL above with your actual GitHub pages URL.

1. In `index.html` update the GitHub repo URL with the URL of your repository. It is in the span with `id="forkongithub"`.

## Organization

### Root Files
* `README.md` is this explanatory file for the repo.

* `index.html` contains the main website content. It includes comments surrounded by `<!--` and `-->` to help guide you through making your edits.

* `style.css` contains the CSS.

* `LICENCE` is the source code license for the template. You can add your name or leave it as is.

### Folders
Each folder has an explanatory `README.md` file.

* `data` is where you will put your data files.

* `favicons` contains the favicons for the web page. You shouldn't change anything here.

* `files` will contain your slides (PDF) and video (MP4).

* `images` will contain your screenshots, diagrams, and photos.

* `js` will contain all JavaScript files you write.

  * `visualization.js` is the main code that builds all your visualizations. Each visualization should be built following the [Reusable Chart model](https://bost.ocks.org/mike/chart/), ideally with a separate .js file for each one.

* `lib` will contain any JavaScript library you use. It currently includes D3. To ensure long-term survivability, **use the included D3 here rather than linking to [d3js.org](https://d3js.org) or some other CDN.** Likewise, put your other libraries here rather than loading them from elsewhere.

## Academic Honesty

You are welcome to use D3 tutorials or resources as a starting point for your code.
However, **you must cite and reference the resources or sample code you use and explain how you use them**.
**Code you get from [bl.ocks.org](https://bl.ocks.org/) must be cited.**
Failure to properly cite and attribute code is a breach of academic honesty.
Also, per our syllabus, homework is an individual assessment and should be completed by you alone.
Simply copying existing examples without performing thoughtful edits is a breach of academic honesty.
You are welcome to ask fellow classmates and students for help and discuss the assignment, but **the submission should be your own work**.

# Submission Instructions

1. Submit a URL to your GitHub Page (same as the link you edited at the top) to [the associated assignment on Canvas](https://canvas.instructure.com/courses/1781732/assignments/13207302).

# Tips and Tricks

### Workflow

As you work with your team, you may have issues merging your changes. We recommend you pick one member of the team to be the project manager and deal with merging any pull requests.

Instead of all working directly out of the main `gh-pages` branch, you can try adopting a Git branching model for development. See, e.g., [this article by Vincent Driessen](https://nvie.com/posts/a-successful-git-branching-model/) and the included image:

![Image of Git branching model by Vincent Driessen](http://www.ccs.neu.edu/home/cody/courses/shared/git-model.png)
## Resources

**There are different versions of D3**, so make sure that the tutorials that you are using are up-to-date and use the same version we are.

* [D3 Homepage](https://d3js.org)
* [D3 API Documentation](https://github.com/d3/d3/blob/master/API.md)
* [D3 Wiki Gallery](https://github.com/d3/d3/wiki/Gallery)
* [D3 Wiki Tutorials](https://github.com/d3/d3/wiki/Tutorials)
* [Tons of examples on bl.ocks.org](https://bl.ocks.org/)
* [D3 Tips and Tricks **v3.x (Warning: old version of D3)**](https://leanpub.com/D3-Tips-and-Tricks/read)

## Function/method chaining

D3, and this exercise, use [function chaining](https://en.wikipedia.org/wiki/Method_chaining) to apply several changes to the same visualization.

You don't have to use chaining.
E.g., instead of this:
```js
d3.select('body')
  .append('p')
    .text('Hello, world!');
```
you can write:
```js
var body = d3.select('body');
var p = body.append('p');
p.text('Hello, world!');
```

## JS statements: `let` vs. `var` vs. `const`

To make our code more modular, reusable, and error-free we should limit variable scope to the relevant parts of the code.
In part, we do this by using [`let` statements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let) instead of [`var`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var) by default so as to not set global variables.
We can also use [`const`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const) to create read-only references.

## ES6 Arrow functions `=>`

Note that we can use [ES6 Arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions).
E.g., instead of writing `function(d){ return d.name; }` we write `d => d.name` or `d => { return d.name; }`. We would use the latter version with surrounding `{...}` when we need multiple lines of code vs. just a simple expression.


### How to send selection updated events between linked views

The d3-dispatch module [`d3-dispatch`](https://github.com/d3/d3-dispatch) is made for emiting and listening for events, which we can use to coordinate selection updates between linked views.

E.g.,
```js
let dispatcher = d3.dispatch("selectionUpdated");
dispatcher.on("selectionUpdated", callback1);
```
However, to have multiple listeners for that same event you would need to have unique suffixes for the same string beginning with '`.`'.
E.g., to have both a line chart and table listening to scatterplot updates we could have
```js
dispatcher.on("selectionUpdated.sp-to-lc", callback1);
dispatcher.on("selectionUpdated.sp-to-tab", callback1);
```
where `"sp-to-lc"` and `"sp-to-tab"` are arbitrary but written here to be informative.

## Template Repository Setup (For Instructors Only)

### GitHub Pages

It is necessary if using GitHub Classroom to set up GitHub pages for the students, as they do not have admin permissions on their repository. To do this, we need to create and move everything to the `gh-pages` branch and delete the `master` branch.

1. Commit the files to the `master` branch on GitHub.

1. `git branch gh-pages`

1. `git checkout gh-pages`

1. `git branch -D master`

1. `git push origin gh-pages`

1. On GitHub, go to `Settings`->`Branches` and set the default branch to `gh-pages`.

1. `git push origin :master`

### Template Repository

1. On GitHub, go to `Settings` and check the box for `Template repository` at the top. This makes GitHub Classroom copies much faster.

---

# Instructions from subdirectories

## Data (Put any data files in this folder)

Ideally your data is a CSV file.

*Do not commit personally identifying or confidential data!*
If you do so, it is a pain to remove it later and it may have already been crawled by other sources. But [here is how you do so](https://help.github.com/en/github/authenticating-to-github/removing-sensitive-data-from-a-repository).

## Files (Put miscellaneous files in this folder)

In particular:
* Your presentation slides as a PDF.
* Your demo video as an MP4. It must be >= 1920x1080 --- 1080p encoded with the H.264/MPEG-4 AVC codec.

## Images (Put any images/screenshots/figures here)

Use only PNG and/or SVG for screenshots and diagrams as they are lossless or vector graphics, unlike JPG. JPG is ok for photographs.

`sample_visualization.svg` is the sample code copied in `index.html` created using the [Vega Config editor](https://vega.github.io/editor/#/url/vega-lite/N4KABGBEAkDODGALApgWwIaQFxUQFzwAdYsB6UgN2QHN0A6agSz0QFcAjOxge1IRQyUa6ALQAbZskoAWOgCtY3AHaQANOCh5mY5NigBZAJ5h2ydKy0AzVmLCobWwjrDxu3AE4ATRkvR5knmAUjMgA7kGMsKzoEgBefjwq6hCQnn6YOKAQKazuYnqp6XxmBDoioSUo7nTwsBSQGgC+yVAUrkrwfnoA2hoQWdkpyB3c3krUegODKa5iHpN90zPK3lrKC0tLkFp4OgUAgi5+NB6MnbazHmAIMbotm9mQliFingUVflVqiw+QN3uZH4PKCebgYHw9P6sJJQSzcCaqEHuRixWJ7RGQdzoCEY2BKbihSAAXXuwJSWPGuhw3UgAGJpMgAOwATnQjLUdMsACYABzILnwDm05AARgArIyxcyhYyAGzsRnsLlCqXoEXSSxCgLwZnSaWqOnoSyM9BqoWWSzMtLsg205nwSVizW29jodgABjdxKBS2aPumf2QOngaxUOEg7HcrFgiG+ZJSeEMhCpUHxqB8MQaZL9ZMgFBirBTkAk1Hw1Cxhizmxzmz+KJTU1rOwBUEOsGQAEdC0otDFrvXruc7v6Us8g29w4R3Mh4IxCMwEutSVt-g3UmDsWGwN0RCLEWL3USa79E8mCl30D2F1oqFXfcvHgAPDbAyDoR+RSbbbRFgAixzUWEPAwPACgAUnYSBj1rMdXgKNJ-DjV8tFQZAAFUlGYApUGUFgEOHXNTyLfxUEIDxM39aDBkgStAVzd9P0yb9diLQ5vCodwmHGMA-DwZF2AsXQqIDWCJ00NBCAAfQwZ8H2o1cv1BcEtx3MVEWkQ9hOoojz2iK88ASW9KKBYTIFCRhPBYPRZXdd0H0gFBGFLUCcAAZls+yMHcABrAoyJ8UD7PbYNQy-SNo1jJjhlcMZqFgSFnxJTQkyLALkHcfN8kaUy+MvWA4XcVAemAJ5GDEfx3C-YKZ1C8N4AkeBfOyolFmgxshhGWKXy2S5Kro192lWRJutfUT3kqdKkNzBT+vjEENwhakoRhJ54UA1JkVRdEoCxHEoDxAliTk2sKWoFMaWFRV0DFZUMVpNkHptKB7pnRlkB5dbaRFY1FWkT7dVlRU3hauatIDaqQ2GuqGt847tJSgo0wzfIRzAMGUkywsChLMsKzvaYwcgZ8mPQahy2ERC6u4aFAuSs9wwvfTDKE46aK-ZsiyMI5-GoU5kHijExvDD4WEmjEdPDJHfCykz7PMyzIrAGy7KBSAvN88NXUqoKgxqqGwBK+qzg1g3IGi0YfDiyFeqOumi3scrGCgnKKXy4DitK8rJqYiHaqgcKY2dkHskaDQWtDkAgA).)

## js (Put the JavaScript code you write in this folder)

We recommend you separate the implementation details for individual visualizations using the [Reusable Charts](https://bost.ocks.org/mike/chart/) framework Mike Bostock advocates.
Broadly this means implementing visualizations as closures with getter-setter methods.
This can be further extended to [making updatable charts](https://www.toptal.com/d3-js/towards-reusable-d3-js-charts).

## lib (Put JavaScript libraries you use in this folder)

We already include D3 for you. For each library create a folder including a `LICENSE` text file with the software license for the library.