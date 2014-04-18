/*
Copyright (C) 2012, 2013 Neil Redman, Alexander Murashkin <http://gsd.uwaterloo.ca>

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
function SpiderChart(host, settings)
{
    this.id = "mdSpiderChart";

    this.settings = settings;
    this.title = this.settings.title;

    this.width = this.settings.layout.width;
    this.height = this.settings.layout.height;
    this.posx = this.settings.layout.posx;
    this.posy = this.settings.layout.posy;

    this.host = host;

    this.instanceProcessor = null;
    this.selection = new Array();
    this.host.loaded();
}

SpiderChart.method("onDataLoaded", function(data){
    this.clearSelection();
    this.instanceProcessor = new InstanceProcessor(data.instancesXML);
    this.claferProcessor = new ClaferProcessor(data.claferXML);
    this.goals = data.goals;
});

SpiderChart.method("resize", function() // not attached to the window anymore, so need to call the method
{
    this.redrawChart();
    return true;
});

SpiderChart.method("onRendered", function()
{
    this.redrawChart();
});

SpiderChart.method("clearSelection", function()
{
    this.selection = [];
    this.redrawChart();
});

SpiderChart.method("argsToArray", function(argString){
    return argString.split("-");
});

SpiderChart.method("redrawChart", function()
{
    var e = $('#mdSpiderChart div.window-content')[0];

    var sw = document.defaultView.getComputedStyle(e,null).getPropertyValue("width");
    var sh = document.defaultView.getComputedStyle(e,null).getPropertyValue("height");

    var w = parseInt(sw) - 250;
    var h = parseInt(sh) - 100;

    var colorscale = d3.scale.category10();

    //Legend titles

//    var instanceCount = this.instanceProcessor.getInstanceCount();    


    $("#chartNode").html(""); // clear the contents
    if (this.selection.length == 0)
    {
        $("#chartNode").html("Select variants for comparison");
        return;
    }

    var d = new Array();
    var LegendOptions = new Array();


    for (var i = 0; i < this.selection.length; i++){

        var instance = parsePID(this.selection[i]);

        var first;
        var second;

        var current = new Array();
        LegendOptions.push(instance);
        
        for (var j = 0; j < this.goals.length; j++)
        {
            var value = this.instanceProcessor.getFeatureValue(instance, this.argsToArray(this.goals[j].arg), 'int'); // get only numeric
            var axis = this.goals[j].label;
            var obj = new Object();
            obj.axis = axis;
            obj.value = value;
            current.push(obj);
        }
        
        d.push(current);
    }

//Options for the Radar chart, other than default
var mycfg = {
  w: w,
  h: h,
//  maxValue: 0.6,
//  levels: 6,
  ExtraWidthX: 220,
  ExtraWidthY: 80
}

//Call function to draw the Radar chart
//Will expect that data is in %'s

RadarChart.draw("#chartNode", d, mycfg, LegendOptions);

////////////////////////////////////////////
/////////// Initiate legend ////////////////
////////////////////////////////////////////

var svg = d3.select('#chartNode')
    .selectAll('svg')
    .append('svg')
    .attr("width", w+250)
    .attr("height", h)

//Create the title for the legend
var text = svg.append("text")
    .attr("class", "title")
    .attr('transform', 'translate(90,0)') 
    .attr("x", w - 70 + 132)
    .attr("y", 10)
    .attr("font-size", "12px")
    .attr("fill", "#404040")
    .text("Variants:");
        
//Initiate Legend   
var legend = svg.append("g")
    .attr("class", "legend")
    .attr("height", 100)
    .attr("width", 200)
    .attr('transform', 'translate(90,20)') 
    ;
    //Create colour squares
    legend.selectAll('rect')
      .data(LegendOptions)
      .enter()
      .append("rect")
      .attr("x", w - 65 + 152)
      .attr("y", function(d, i){ return i * 20;})
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", function(d, i){ return colorscale(i);})
      ;
    //Create text next to squares
    legend.selectAll('text')
      .data(LegendOptions)
      .enter()
      .append("text")
      .attr("x", w - 52 + 152)
      .attr("y", function(d, i){ return i * 20 + 9;})
      .attr("font-size", "11px")
      .attr("fill", "#737373")
      .text(function(d) { return d; })
      ; 
   

});

//rebuilds the table with the new selection data
SpiderChart.method("onSelectionChanged", function(newSelection){
    //pulls data from the comparison table
    this.selection = newSelection;

    this.redrawChart();
});


//gets containers and placeholders
SpiderChart.method("getContent", function()
{
    var content = '<div id="chartNode" style="width:100%;height:100%"></div>';
	return content;	
});

SpiderChart.method("getInitContent", function()
{
	return this.getContent();
});

SpiderChart.method("onInitRendered", function()
{

});

