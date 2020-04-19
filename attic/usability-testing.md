# Comments from Usability Testing

## Julia (Example use)

Select "blavaan" in the list of packages being analyzed, then "show more" in packages, 
click "methods", then click "getGeneric" in Functions (left bottom).
The violet diagram will show that when called within "blavaan", 
the function methods.getGeneric takes character as the first argument, then logical as the second, 
then either missing or environment as the third argument, and returns character.
By default, information from all packages being analyzed is used.

## Cody

* Learned: I learned that symbols are the biggest first argument type, and doubles come second. 
  Also [ is a really popular fn followed by sqrt.
  
* Complements: This is really cool and I see how it can be a powerful way to explore the data. 
  Your usage example was also really helpful.

* Confusing: I don’t really understand the sequence of layers in the alluvial diagram. 
  Each level is an argument type and it starts in a function and terminates in the return type, right? 
  That would be more clear if you fixed the return type level to a far-right column, 
  function to the far-left column, and having the others more clearly differentiated in between.

* Confusing: In the package filtering pane I would have expected that clicking on the highlighted gray rectangle 
  would toggle the checkbox, not just the label and box itself. 
  It is easy to click outside the letters in the label too, which doesn’t work.

* Suggestion: It would be good to have a clear filters button for the package filtering pane, or “select all”

* Confusing: In the treemaps, it is not very clear which cell I’ve selected. 
  The faint bolding of the text isn’t enough of an indicator. Preserving the wider border could do.

* Confusing: How does select multiple packages work? Just enable ctrl+click?

* Bug: When I click go back a bunch in the functions treemap, it doesn’t go to the top level. 
  I get this JS error: “TypeError: eventHandlers.onselected is not a function 19 pkgfun-treemap.js:157:39”

* Confusing: The selection in the alluvial diagram is not how I’d expect it to work. 
  It shows the entire sequence up to the selected element, right? 
  I wonder if just a vertical brush would be easier to understand than a 2D one.

* Bug: The alluvial layout algorithm creates a bunch of unnecessary line crossings.

* Bug: Window resizing worked pretty well, but the right-most charts don’t stay in the same places 
  and it doesn’t work under ~800px wide very well.

## Sara

* Great work, very nice.

* Show more clearly which packages are being selected in the treemap,
  bolding the name is not visible enough. 
  Consider keeping a border on the currently selected packages around the rectangles of the package in the treemap, 
  perhaps using a different border color than the one you are using for mouseover.

## Ondrej

It’s hard for me to comment on this project because I don’t understand what the data is supposed to show. 
I guess in the top-left chart, there are functions on the left and the types they accept/return on the right? 
E.g. when I load the page, I can see “[“ => “symbol” => “symbol” => “symbol” from left to right. 
It would be great if you indicated what each of the things mean, maybe through showing more information 
on mouse over. Moreover, when you load the page, none of the “ Packages being analyzed:” is selected, 
but I suppose one of them is the default one.

## Hai

The interaction works fast and quite well. 
But the vis should have more explanations. 
I think that “go back” should be replaced by an icon to reduce the text. 
Bar charts in my opinion should have boundaries between two consecutive bars. 
Grids for bar charts might be helpful as well. To save some space and mouse movements, 
the packages can be arranged horizontally instead of vertically which would cause more scrollings.

## Nikos

I have a hard time understanding some of your components, especially the ones on the left. 
I think it would be good if you included more explanations in the charts themselves in the form of axis labels, etc. 
For example, in the Sankey diagram what happens when I go from left to right? 
You could have an arrow pointing that way with an appropriate label. 
The treemaps have a [show more] option which I assume you have there because you can’t show everything at once. 
At the same time the squares seem to be taking a lot of screen space most of the time… 
I don’t have a better suggestion but it wasn’t very intuitive for me. 
Maybe show all the squares and have a “zoom” option that makes the treemap fit the entire screen temporarily?

## Melisa

Really good linking among all the charts. 
I like how there are multiple views of the same information and multiple filtering options. 
It’s not quite clear how the middle filter on the right side works, the one labeled “Select Multiple Packages”. 
Also increase the font size of the labels on the Sankey diagram. 

## Peter

It took a little bit of staring initially to understand what was being expressed, but I think I understand. 
Confused by the flow graph, I understand functions name and returne type, 
but why do some functions extend outwards (like <- function and then to LANGSXP twice after symbol). 
Now I don’t know anything about R but it seems the most popular functions for most packages 
are functions like <-, <, [[, !=, e.g. some basic logic functions. 
I imagine most of these would be covered when building this project for R. 
Maybe user can look at less standard functions if curious? 
Not sure if select multiple packages button does anything.

## Xiongyi

All the brushing and linking work pretty well, which is impressive. 
However, I don’t have a ton of knowledge in this area, so I do not understand some of the components of this project. 
It seems not so clear to me how the different components are connected with each other. 
Maybe re-organize the layout a bit so that it is more clear? 

## Danny

The use of color is really nice to highlight the visualizations of interest here. 
Sometimes when I’m trying to brush over the purple parts it zooms in after I unclick which exits the overview. 
I like the use of buttons in the Packages and Functions visualizations 
but at first glance they did not look like buttons to me. 
Perhaps making them actual html buttons would solve this confusion.

## Chengguang

Interesting and good interactions! I tried several clicks and selections. 
The linking and brushing works really impressively. 
However, because of the knowledge of the domain, I am attracted by the visual design but confused with 
the underline meaning. 
Generally, I think this is a good visualization with real-time response.

## Aaron

The brushing and linking, as well as the click functionality here was awesome. 
I appreciated the usage of those here. 
I was a bit confused by the ‘Packages’ section. 
Since they did not match up with the Packages being analyzed, I was confused how to exactly interpet the difference. 
The color encodings were great though -- strong use of them, 
as well as the selection of the chart types for each type of data.

## Seyed Ali

You can consider changing the cursor icon for the purple chart. 
Also in some cases, when I select something in the purple chart, it does not zoom on it correctly. 
The brushing and linking seems to work fine. Nice Work! 
Don’t forget to add labels for the x and y axis for the bar chart. 
Some of the charts seem to be too big. You should consider resizing them 
because it makes it harder to understand everything in one sight. 
Also the “filtering” part with checkboxes was hard to interact with. 
You can implement buttons instead of checkboxes or make it possible to click on the gray area to toggle the checkbox.

## Ge

Took me a bit to understand what was happening on the visualization. 
I like the linking among all the visualizations and all visualization represents your data well. 
Would be nice to see some explanation of how each part connects and works on your page. 
It took me a while for everything to load up in my chrome. 

## Mansi

Wonderfully implemented visualizations with a nice choice of idioms as well. 
I found the transitions particularly impressive. 
The numbers on the Tree Map do not have any units. 
After a while the “go back” feature becomes a little tedious. 
Maybe reducing the scale of the tree maps would help? 
The width of the bars in the graph overlap in some cases.

## Shuwen

* I really liked the part that different charts are linked together and 
  a use can click through them to figure out the relations.

* Types overview chart:  
  It seems to me that the portion of the upper part is too big. 
  Is the information here about the portional meaning or is it about the interations between them? 
  If the latter, perhaps you can tweak the scale so we can view it more clearly?  
  Ok, perhaps the idea is to let the user click through different setup to see the portional relationship

* The font of the charts except for the type overview chart are a bit small, I think there is plenty of space left. 
  For the type overview chart, maybe it can be tweaked by doing more mouse over event to diplay 
  details names or partial zoom in etc?

* Layout:  
  I am gussing the funtional and number of test belong to the left handside rather than the filtering part? 

## Neha

It took a little bit of a learning curve to understand what is going on 
and I still don’t know if I get all the functionality completely. 
It might be because of lack of domain knowledge but I don’t know what the right workflow is - 
ie what order to have selections in, since all the visualizations link together 
(which actually could be a great thing). The select multiple packages option is not clear to me 
(does it select multiple packages in the treemap below? 
In that case, could the selected ones be highlighted somehow?)

## Alesia

Very nice visualization! I really like the overview chart and corresponding brushing/linking, 
however it would be nice to have an opportunity to return to the initial state after brushing. 
For me, it, would be easier to understand the information from the tree maps if it was not partially hidden, 
just has all packages and functions without ‘go back’ and ‘show more’ links.

## Akshay

I loved the concept of zoomable treemap, it has really nice animations and overcomes the difficulties 
of a traditional large treemap where the small values are overlooked/neglected. 
However, one drawback of this is this makes comparison between squares difficult especially 
if there are many things to look at in the treemap. 
Although, I couldn’t interpret the first visualizations as there were no labels, 
explanation provided for it. 
So maybe make it a little more intuitive by adding some context. 
But the Zoomable treemaps were the highlight and makes it very clear.
