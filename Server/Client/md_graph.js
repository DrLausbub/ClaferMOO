function Graph(host)
{
    this.id = "mdGraph";
    this.title = "Pareto Front Graph";

    this.width = 500;
    this.height = 470;
    this.posx = 500;
    this.posy = 0;
    
    this.instanceProcessor = null;
    this.axisArray = new Array();
    this.PFVisualizer = new ParetoFrontVisualizer("chart");
    this.host = host;
}

Graph.method("onDataLoaded", function(data){
    this.instanceProcessor = new InstanceProcessor(data.instancesXML);     
});

Graph.method("onRendered", function()
{
    this.goals = this.host.findModule("mdGoals").goals;
    
    var dropPlaces = $(".axis_drop");
    for (var i = 0; i < dropPlaces.length; i++)
    {
        $(".axis_drop")[i].ondrop = this.drop.bind(this);
        $(".axis_drop")[i].ondragover = this.allowDrop.bind(this);
    }

	if (this.goals.length >= 2)
	{
		$("#chart").show();
		this.assignToAxis("dropPointX", this.goals[0].arg, this.goals[0].label);
		this.assignToAxis("dropPointY", this.goals[1].arg, this.goals[1].label);
        
        if (this.goals.length >= 3)
        {
            this.assignToAxis("dropPointZ", this.goals[2].arg, this.goals[2].label);

            if (this.goals.length >= 4)
            {
                this.assignToAxis("dropPointT", this.goals[3].arg, this.goals[3].label);
            }
            else 
                this.assignToAxis("dropPointT", "", "");

        }
        else 
            this.assignToAxis("dropPointZ", "", "");
        
        this.redrawParetoFront();
	}
	else
		$("#chart").hide();

});

Graph.method("resize", function(e) // not attached to the window anymore, so need to call the method
{
    host.findModule("mdGraph").redrawParetoFront();
	return true;
});

Graph.method("allowDrop", function(ev)
{
	ev.preventDefault();
});

Graph.method("drop", function(ev)
{
	ev.preventDefault();

	var data = ev.dataTransfer.getData("Text");
	
	var parts = data.split("|");
	
	if (parts.length < 2)
		return;
	
	var arg = parts[0];
	var label = parts[1];

    var id = ev.target.id;
    var node = ev.target;
    
    while (node.parentNode != null && (id == "" || id == "svgcont"))
    {
        node = node.parentNode;
        id = node.id;
    }
    
	this.assignToAxis(id, arg, label, true);
    this.redrawParetoFront();
});

Graph.method("assignValue", function (id, value)
{
	if ($(id).length == 0)
		$('body').append('<input type="hidden" id="' + id + '" value=""/>');
	
	$('#' + id).val(value);
	
});

Graph.method("redrawParetoFront", function()
{
	var arg1 = $("#dropPointXAxisConfig_arg").val();
	var label1 = $("#dropPointXAxisConfig_label").val();

	var arg2 = $("#dropPointYAxisConfig_arg").val();
	var label2 = $("#dropPointYAxisConfig_label").val();

	var arg3 = $("#dropPointZAxisConfig_arg").val();
	var label3 = $("#dropPointZAxisConfig_label").val();
    
	var arg4 = $("#dropPointTAxisConfig_arg").val();
	var label4 = $("#dropPointTAxisConfig_label").val();
    
    var sLabel2 = '<g style="z-index: 110; "><text text-anchor="middle" x="14.2" y="210.5" font-family="Arial" font-size="12" transform="rotate(-90 14.2 210.5)" stroke="none" stroke-width="0" fill="#222222">' + label2 + '</text></g>';
    sLabel2 = '<div id="svgcont" style="position:relative; left:0;top:0; z-index:100; width:100%; height:100%;"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="z-index:101;" height="350">' + sLabel2 + '</svg></div>';
        
    var sLabel4 = '<g style="z-index: 110; "><text text-anchor="middle" x="14.2" y="210.5" font-family="Arial" font-size="12" transform="rotate(-90 14.2 210.5)" stroke="none" stroke-width="0" fill="#222222">' + label4 + '</text></g>';
    sLabel4 = '<div id="svgcont" style="position:relative; left:0;top:0; z-index:100; width:100%; height:100%;"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="z-index:101;" height="350">' + sLabel4 + '</svg></div>';

    $("#dropPointX").html("<div>" + label1 + "</div>");
    $("#dropPointY").html(sLabel2);
    $("#dropPointZ").html("<div>" + label3 + "</div>");
    $("#dropPointT").html(sLabel4);

    var args = new Array();
    var labels = new Array();
    
    args.push(arg1);
    labels.push(label1);
    
    args.push(arg2);
    labels.push(label2);
    
    if (arg3 != "")
    {
        args.push(arg3);
        labels.push(label3);
    }
    
    if (arg4 != "")
    {
        args.push(arg4);
        labels.push(label4);
    }
    
    this.PFVisualizer.draw(this.instanceProcessor, args, labels);

//    $('#chart circle').click(pointClick);
     
    this.makePointsSelected(this.host.selector.selection);
});



/*
function pointClick()
{
    alert(this.tagName);
    var nextEl = $(this).next(); // get next g
    alert(nextEl.tagName);
    if (nextEl.tagName != "g")
        return;
        
    var next = $(nextEl);
    textChildren = next.children();
    
    if (textChildren.length != 2)
        return;

    var textElement = this.textChildren[0];
        
    var pid = textElement.firstChild.nodeValue;
    if (!pid)
        return;
        
    if (pid.charAt(0) != "P")
        return;
        
    if (host.selector.isSelected(pid))
    {
        deselectObject(textElement);
        host.selector.onDeselected(pid);
    }
    else
    {
        selectObject(textElement);
        host.selector.onSelected(pid);
    }
} 
*/

Graph.method("selectObject", function(o)
{
    $(o).attr("fill", "#ff0000");    
});

Graph.method("deselectObject", function(o)
{
    $(o).attr("fill", "#000000");    
});

Graph.method("makePointsSelected", function(points)
{
    var module = this;
    
    for (var i = 0; i < points.length; i++)
    {
        $('#chart text').each(function()
        {
            if (this.firstChild)
            {
                if (this.firstChild.nodeValue == points[i])
                    module.selectObject(this);// alert(this.firstChild.nodeValue);
            }
        });
    }
});

Graph.method("makePointsDeselected", function(points)
{
    var module = this;

    for (var i = 0; i < points.length; i++)
    {
        $('#chart text').each(function()
        {
            if (this.firstChild)
            {
                if (this.firstChild.nodeValue == points[i])
                    module.deselectObject(this);// alert(this.firstChild.nodeValue);
            }
        });
    }
});


Graph.method("assignToAxis", function(axis, arg, label)
{
	this.assignValue(axis + "AxisConfig_arg", arg);
	this.assignValue(axis + "AxisConfig_label", label);
});

Graph.method("getContent", function()
{
	var table = $('<table cellspacing="0" cellpadding="0" id="graph_table" width="100%" height="100%"></table>');
	
    var tdZ = $('<td colspan="2" id="dropPointZ" class="axis_drop"></td>');
    var tdY = $('<td height="90%" width="5%" id="dropPointY" class="axis_drop"></td>');
    var tdT = $('<td height="90%" width="5%" id="dropPointT" class="axis_drop"></td>');
    var tdChart = $('<td id="chart" style="display:none; width:90%; height:95%; overflow:hidden"></td>');
    var tdX = $('<td colspan="2" id="dropPointX" class="axis_drop"></td>');

    this.axisArray.splice(0, this.axisArray.length); // clear the array
    this.axisArray = new Array();
    this.axisArray.push(tdX);
    this.axisArray.push(tdY);
    this.axisArray.push(tdZ);
    this.axisArray.push(tdT);
    
    for (var i = 0; i < this.axisArray.length; i++)
    {
        this.axisArray[i].html("&nbsp;");
    }
    
    var row1 = $('<tr></tr>').append(tdZ);
    var row2 = $('<tr></tr>').append(tdY).append(tdChart).append(tdT);
    var row3 = $('<tr></tr>').append(tdX);
        
		
    table.append(row1);
    table.append(row2);
    table.append(row3);
		
	return table;	
    
});

Graph.method("getInitContent", function()
{
	return this.getContent();
});