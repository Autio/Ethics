function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
var width = 1600,
    height = 1500;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
    .size([width, height]);
	
var tier_width = 60,
    tier_height = 200;

// PINNING DOWN
	var node_drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dragend);
		
    function dragstart(d, i) {
        force.stop() // stops the force auto positioning before you start dragging
    }
	
    function dragmove(d, i) {
        d.px += d3.event.dx;
        d.py += d3.event.dy;
        d.x += d3.event.dx;
        d.y += d3.event.dy;
    }
	
    function dragend(d, i) {
        d.fixed = true; // of course set 	the node to fixed so the force doesn't include the node in its auto positioning stuff
        force.resume();
    }
	
function node_action(d)
{

	if(d3.event.shiftKey)
	{
		console.log("shift double click");
		connectedNodes(d);
	} else 
	{

		function releasenode(d) {
			d.fixed = false; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
			//force.resume();
		}
	}
	
}


var svg = d3.select("#main_vis").append("svg")
    .attr("width", width)
    .attr("height", height);

var graph = getData();

var nodeMap = {};

graph.nodes.forEach(function(d) { nodeMap[d.name] = d; });

graph.links.forEach(function(l) {
    l.source = nodeMap[l.source];
    l.target = nodeMap[l.target];
})

force.nodes(graph.nodes)
    .links(graph.links)
    .start();

	// HIGHLIGHTING

	//Toggle stores whether the highlighting is on
	var toggle = 0;
	//Create an array logging what is connected to what
	var linkedByIndex = {};
	for (i = 0; i < graph.nodes.length; i++) {
		linkedByIndex[i + "," + i] = 1;
	};
	graph.links.forEach(function (d) {
		linkedByIndex[d.source.index + "," + d.target.index] = 1;
	});
	//This function looks up whether a pair are neighbours
	function neighboring(a, b) {
		return linkedByIndex[a.index + "," + b.index];
	} 
	
	function connectedNodes(d) {
		if (toggle == 0) {
			//Reduce the opacity of all but the neighbouring nodes
			node.style("opacity", function (o) {
			//d = d3.select(this).node().__data__;
				return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
			});
			link.style("opacity", function (o) {
				return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
			});
			//Reduce the op
			toggle = 1;
		} else {
			//Put them back to opacity=1
			node.style("opacity", 1);
			link.style("opacity", 1);
			toggle = 0;
		}
	}


var link = svg.selectAll(".link")
    .data(graph.links)
    .enter().append("line")
    .attr("class", "link")
    .style("marker-end", "url(#suit)") // arrows
    .style("stroke-width", function(d) {
        return Math.sqrt(d.value)+1;
    });

var node = svg.selectAll(".node")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("class", "node")
    .attr("r", 5)

    .style("fill", function(d) { return color(d.group); })
	.on('dblclick', node_action)
    .call(node_drag);
    //.on('dblclick', node_drag); //Added code ;
	
node.append("title")
    .text(function(d) { return d.DisplayName; });

force.on("tick", function() {

// Attach the lines
// Do it based on tier data in the nodes
    link.attr("x1", function(d) { if(d.source.tier_x) { return d.source.tier_x * tier_width;} else {return d.source.x; }})
        .attr("y1", function(d) { if(d.source.tier_y) { return d.source.tier_y * tier_height;} else {return d.source.y; }})
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

// Set node position
// Also based on data in the nodes
    node.attr("cx", function(d) { if(d.tier_x) { console.log("hello" + d.tier_x); return d.tier_x * tier_width;} else {return d.x; }})
        .attr("cy", function(d) { if(d.tier_y) { console.log("hello" + d.tier_y); return d.tier_y * tier_height;} else {return d.y; }});


        
// ARROWS
svg.append("defs").selectAll("marker")
    .data(["suit", "licensing", "resolved"])
  .enter().append("marker")
    .attr("id", function(d) { return d; })
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 25)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
  .append("path")
    .attr("d", "M0,-5L10,0L0,5 L10,0 L0, -5")
    .style("stroke", "#4679BD")
    .style("opacity", "0.6");

});

function getData() {

  return {
   "nodes":[
     {
         "name": "1D01",
         "DisplayName": "I Definition 1",
         "ShortText": "Definition: Cause of Itself",
         "group": 1, 
         "InDegree": "0",
         "OutDegree": "3",
         "tier_y": 1,
         "tier_x": 1
      },
      {
         "name": "1D02",
         "DisplayName": "I Definition 2",
         "ShortText": "Definition: Finite in its kind",
         "group": 1, "InDegree": "0",
         "OutDegree": "2",
         "tier_y": 1,
         "tier_x": 2
      },
      {
         "name": "1D03",
         "DisplayName": "I Definition 3",
         "ShortText": "Definition: Substance",
         "group": 1, "InDegree": "0",
         "OutDegree": "10",
         "tier_y": 1,
         "tier_x": 3
      },
      {
         "name": "1D04",
         "DisplayName": "I Definition 4",
         "ShortText": "Definition: Attribute",
         "group": 1, "InDegree": "0",
         "OutDegree": "6",
         "tier_y": 1,
         "tier_x": 4
      },
      {
         "name": "1D05",
         "DisplayName": "I Definition 5",
         "ShortText": "Definition: Mode",
         "group": 1, "InDegree": "0",
         "OutDegree": "10",
         "tier_y": 1,
         "tier_x": 5
      },
      {
         "name": "1D06",
         "DisplayName": "I Definition 6",
         "ShortText": "Definition: God",
         "group": 1, "InDegree": "0",
         "OutDegree": "11",
         "tier_y": 1,
         "tier_x": 6
      },
      {
         "name": "1D07",
         "DisplayName": "I Definition 7",
         "ShortText": "Definition: Free",
         "group": 1, "InDegree": "0",
         "OutDegree": "3",
         "tier_y": 1,
         "tier_x": 7
      },
      {
         "name": "1D08",
         "DisplayName": "I Definition 8",
         "ShortText": "Definition: Eternity",
         "group": 1, "InDegree": "0",
         "OutDegree": "5",
         "tier_y": 1,
         "tier_x": 7
      },
      {
         "name": "1A01",
         "DisplayName": "I Axiom 1",
         "ShortText": "Axiom: In itself or in another",
         "group": 2, "InDegree": "0",
         "OutDegree": "8",
         "tier_y": 1,
         "tier_x": 10
      },
      {
         "name": "1A02",
         "DisplayName": "I Axiom 2",
         "ShortText": "Axiom: Not conceived through another, through itself",
         "group": 2, "InDegree": "0",
         "OutDegree": "11"
      },
      {
         "name": "1A03",
         "DisplayName": "I Axiom 3",
         "ShortText": "Axiom: Effect from cause",
         "group": 2, "InDegree": "0",
         "OutDegree": "2",
         "tier_y": 1,
         "tier_x": 12
      },
      {
         "name": "1A04",
         "DisplayName": "I Axiom 4",
         "ShortText": "Axiom: Knowledge of effect from knowledge of cause",
         "group": 2, "InDegree": "0",
         "OutDegree": "9"
      },
      {
         "name": "1A05",
         "DisplayName": "I Axiom 5",
         "ShortText": "Axiom: Nothing in common, no knowledge in common",
         "group": 2, "InDegree": "0",
         "OutDegree": "1"
      },
      {
         "name": "1A06",
         "DisplayName": "I Axiom 6",
         "ShortText": "Axiom: True idea agrees with ideato",
         "group": 2, "InDegree": "0",
         "OutDegree": "6"
      },
      {
         "name": "1A07",
         "DisplayName": "I Axiom 7",
         "ShortText": "Axiom: If conceived not existing, then essence not requires existence",
         "group": 2, "InDegree": "0",
         "OutDegree": "1"
      },
      {
         "name": "1P01",
         "DisplayName": "I Proposition 1",
         "ShortText": "Substance prior to modifications",
         "group": 3, "InDegree": "2",
         "OutDegree": "1",
         "tier_y": 2,
         "tier_x": 1
      },
      {
         "name": "1P02",
         "DisplayName": "I Proposition 2",
         "ShortText": "Substances with different attributes have nothing in common",
         "group": 3, "InDegree": "1",
         "OutDegree": "3",
         "tier_y": 2,
         "tier_x": 2
      },
      {
         "name": "1P03",
         "DisplayName": "I Proposition 3",
         "ShortText": "Two things with nothing in common are not cause of each other",
         "group": 3, "InDegree": "2",
         "OutDegree": "1",
         "tier_y": 2,
         "tier_x": 3
      },
      {
         "name": "1P04",
         "DisplayName": "I Proposition 4",
         "ShortText": "Two distinct things must have a difference of attribute or of mode",
         "group": 3, "InDegree": "4",
         "OutDegree": "1",
         "tier_y": 2,
         "tier_x": 4
      },
      {
         "name": "1P05",
         "DisplayName": "I Proposition 5",
         "ShortText": "Not two substances with same nature or attribute",
         "group": 3, "InDegree": "4",
         "OutDegree": "5",
         "tier_y": 2,
         "tier_x": 5
      },
      {
         "name": "1P06",
         "DisplayName": "I Proposition 6",
         "ShortText": "One substance cannot produce another",
         "group": 3, "InDegree": "5",
         "OutDegree": "3",
         "tier_y": 2,
         "tier_x": 6
      },
      {
         "name": "1P07",
         "DisplayName": "I Proposition 7",
         "ShortText": "Nature of a substance is to exist.",
         "group": 3, "InDegree": "2",
         "OutDegree": "7",
         "tier_y": 2,
         "tier_x": 7
      },
      {
         "name": "1P08",
         "DisplayName": "I Proposition 8",
         "ShortText": "Every substance is necessarily infinite",
         "group": 3, "InDegree": "3",
         "OutDegree": "1",
         "tier_y": 2,
         "tier_x": 8
      },
      {
         "name": "1P09",
         "DisplayName": "I Proposition 9",
         "ShortText": "The more reality, the more attributes",
         "group": 3, "InDegree": "1",
         "OutDegree": "0",
         "tier_y": 2,
         "tier_x": 9
      },
      {
         "name": "1P10",
         "DisplayName": "I Proposition 10",
         "ShortText": "Each attribute of a substance, conceived through itself",
         "group": 3, "InDegree": "2",
         "OutDegree": "4",
         "tier_y": 2,
         "tier_x": 10
      },
      {
         "name": "1P12",
         "DisplayName": "I Proposition 12",
         "ShortText": "No attribute of substance implies substance is divisible",
         "group": 3, "InDegree": "7",
         "OutDegree": "0",
         "tier_y": 2,
         "tier_x": 11
      },
      {
         "name": "1P13",
         "DisplayName": "I Proposition 13",
         "ShortText": "Substance absolutely infinite is indivisible",
         "group": 3, "InDegree": "2",
         "OutDegree": "0",
         "tier_y": 2,
         "tier_x": 12
      },
      {
         "name": "1P14",
         "DisplayName": "I Proposition 14",
         "ShortText": "Besides God, no substance can be nor be conceived",
         "group": 3, "InDegree": "3",
         "OutDegree": "4",
         "tier_y": 2,
         "tier_x": 13
      },
      {
         "name": "1P15",
         "DisplayName": "I Proposition 15",
         "ShortText": "Whatever is, is in God",
         "group": 3, "InDegree": "4",
         "OutDegree": "17",
         "tier_y": 2,
         "tier_x": 14
      },
      {
         "name": "1P16",
         "DisplayName": "I Proposition 16",
         "ShortText": "Everything conceived by infinite intellect follows from God's nature",
         "group": 3, "InDegree": "1",
         "OutDegree": "14",
         "tier_y": 2,
         "tier_x": 15
      },
      {
         "name": "1P17",
         "DisplayName": "I Proposition 17",
         "ShortText": "God acts from the laws of his own nature and is not compelled",
         "group": 3, "InDegree": "2",
         "OutDegree": "2",
         "tier_y": 2,
         "tier_x": 16
      },
      {
         "name": "1P17C02",
         "DisplayName": "I Proposition 17 Corollary 2",
         "ShortText": "God alone is a free cause",
         "group": 3, "InDegree": "6",
         "OutDegree": "1",
         "tier_y": 2,
         "tier_x": 17
      },
      {
         "name": "1P18",
         "DisplayName": "I Proposition 18",
         "ShortText": "God is the immanent cause of all things",
         "group": 3, "InDegree": "4",
         "OutDegree": "0"
      },
      {
         "name": "1P19",
         "DisplayName": "I Proposition 19",
         "ShortText": "God is eternal; all His attributes are eternal",
         "group": 3, "InDegree": "5",
         "OutDegree": "2"
      },
      {
         "name": "1P20",
         "DisplayName": "I Proposition 20",
         "ShortText": "The existence and essence or God are one and the same",
         "group": 3, "InDegree": "3",
         "OutDegree": "2"
      },
      {
         "name": "1P20C02",
         "DisplayName": "I Proposition 20 Corollary 2",
         "ShortText": "God is immutable",
         "group": 3, "InDegree": "1",
         "OutDegree": "2"
      },
      {
         "name": "1P21",
         "DisplayName": "I Proposition 21",
         "ShortText": "What follows from God's nature is infinite and exists forever",
         "group": 3, "InDegree": "3",
         "OutDegree": "6"
      },
      {
         "name": "1P22",
         "DisplayName": "I Proposition 22",
         "ShortText": "What follows from an attribute as modified, exists forever and is infinite",
         "group": 3, "InDegree": "1",
         "OutDegree": "2"
      },
      {
         "name": "1P23",
         "DisplayName": "I Proposition 23",
         "ShortText": "Every mode which exists infinitely follows from an attribute or an infinite mode",
         "group": 3, "InDegree": "5",
         "OutDegree": "1"
      },
      {
         "name": "1P24",
         "DisplayName": "I Proposition 24",
         "ShortText": "The essence of things produced by God does not involve existence",
         "group": 3, "InDegree": "1",
         "OutDegree": "1"
      },
      {
         "name": "1P25",
         "DisplayName": "I Proposition 25",
         "ShortText": "God is the efficient cause of the existence and essence of things",
         "group": 3, "InDegree": "2",
         "OutDegree": "3"
      },
      {
         "name": "1P25C01",
         "DisplayName": "I Proposition 25 Corollary",
         "ShortText": "Individual things are modifications or modes of God's attributes",
         "group": 3, "InDegree": "3",
         "OutDegree": "9"
      },
      {
         "name": "1P26",
         "DisplayName": "I Proposition 26",
         "ShortText": "God and only God can determine a thing to action",
         "group": 3, "InDegree": "2",
         "OutDegree": "2"
      },
      {
         "name": "1P27",
         "DisplayName": "I Proposition 27",
         "ShortText": "A thing determined to an action by God cannot become indeterminate",
         "group": 3, "InDegree": "1",
         "OutDegree": "1"
      },
      {
         "name": "1P28",
         "DisplayName": "I Proposition 28",
         "ShortText": "Finite things determined to actions by other finite things",
         "group": 3, "InDegree": "8",
         "OutDegree": "7"
      },
      {
         "name": "1P29",
         "DisplayName": "I Proposition 29",
         "ShortText": "In Nature is nothing contingent",
         "group": 3, "InDegree": "6",
         "OutDegree": "6"
      },
      {
         "name": "1D09",
         "DisplayName": "I Proposition 29 Definition",
         "ShortText": "Natura naturans/Natura naturata",
         "group": 3, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "1P30",
         "DisplayName": "I Proposition 30",
         "ShortText": "Actual intellect comprehends attributes of God",
         "group": 3, "InDegree": "3",
         "OutDegree": "1"
      },
      {
         "name": "1P31",
         "DisplayName": "I Proposition 31",
         "ShortText": "The actual intellect must be referred to natura naturata",
         "group": 3, "InDegree": "4",
         "OutDegree": "0"
      },
      {
         "name": "1P32",
         "DisplayName": "I Proposition 32",
         "ShortText": "The will cannnot be a free cause",
         "group": 3, "InDegree": "3",
         "OutDegree": "2"
      },
      {
         "name": "1P32C02",
         "DisplayName": "I Proposition 32 Corollary 2",
         "ShortText": "Will and intellect related as motion and rest",
         "group": 3, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "1P33",
         "DisplayName": "I Proposition 33",
         "ShortText": "Things are produced by God in the only possible order.",
         "group": 3, "InDegree": "4",
         "OutDegree": "2"
      },
      {
         "name": "1P34",
         "DisplayName": "I Proposition 34",
         "ShortText": "The power of God is His essence itself",
         "group": 3, "InDegree": "3",
         "OutDegree": "4"
      },
      {
         "name": "1P35",
         "DisplayName": "I Proposition 35",
         "ShortText": "Whatever we conceive to be in God's power necessarily exists",
         "group": 3, "InDegree": "1",
         "OutDegree": "1"
      },
      {
         "name": "1P36",
         "DisplayName": "I Proposition 36",
         "ShortText": "Nothing exists from whose nature an effect does not follow",
         "group": 3, "InDegree": "3",
         "OutDegree": "2"
      },
      {
         "name": "1P06C01",
         "DisplayName": "I Proposition 6 Corollary 1",
         "ShortText": "There is nothing by which substance can be produced",
         "group": 3, "InDegree": "4",
         "OutDegree": "1"
      },
      {
         "name": "1P14C01",
         "DisplayName": "I Proposition 14 Corollary 1",
         "ShortText": "No substance is divisible",
         "group": 3, "InDegree": "2",
         "OutDegree": "5"
      },
      {
         "name": "1P14C02",
         "DisplayName": "I Proposition 14 Corollary 2",
         "ShortText": "Thinking things and extended things are attributes or modifications of God",
         "group": 3, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "1P16C01",
         "DisplayName": "I Proposition 16 Corollary 1",
         "ShortText": "God is cause of  himself, not through anything contingent",
         "group": 3, "InDegree": "1",
         "OutDegree": "2"
      },
      {
         "name": "1P17C01",
         "DisplayName": "I Proposition 17 Corollary 1",
         "ShortText": "God acts only through the perfection of His nature",
         "group": 3, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "1P20C01",
         "DisplayName": "I Proposition 20 Corollary 1",
         "ShortText": "The existence of God is an eternal truth",
         "group": 3, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "1P24C01",
         "DisplayName": "I Proposition 24 Corollary 1",
         "ShortText": "God the cause of continued existence of things",
         "group": 3, "InDegree": "2",
         "OutDegree": "2"
      },
      {
         "name": "1P32C01",
         "DisplayName": "I Proposition 32 Corollary 1",
         "ShortText": "God does not act from freedom of will",
         "group": 3, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "2D01",
         "DisplayName": "II Definition 1",
         "ShortText": "Definition 'Body'",
         "group": 4, "InDegree": "0",
         "OutDegree": "1"
      },
      {
         "name": "2D02",
         "DisplayName": "II Definition 2",
         "ShortText": "Definition of 'Essence'",
         "group": 4, "InDegree": "0",
         "OutDegree": "3"
      },
      {
         "name": "2D03",
         "DisplayName": "II Definition 3",
         "ShortText": "Definition of 'Idea'",
         "group": 4, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "2D04",
         "DisplayName": "II Definition 4",
         "ShortText": "Definition of 'Adequate Idea'",
         "group": 4, "InDegree": "0",
         "OutDegree": "2"
      },
      {
         "name": "2D05",
         "DisplayName": "II Definition 5",
         "ShortText": "Definition of 'Duration'",
         "group": 4, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "2D06",
         "DisplayName": "II Definition 6",
         "ShortText": "Definition of 'Reality' and 'Perfection'",
         "group": 4, "InDegree": "0",
         "OutDegree": "2"
      },
      {
         "name": "2D07",
         "DisplayName": "II Definition 7",
         "ShortText": "Definition of 'Individual Things'",
         "group": 4, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "2A01",
         "DisplayName": "II Axion 1",
         "ShortText": "Essence of man does not involve existence",
         "group": 4, "InDegree": "0",
         "OutDegree": "2"
      },
      {
         "name": "2A02",
         "DisplayName": "II Axion 2",
         "ShortText": "Man thinks",
         "group": 4, "InDegree": "0",
         "OutDegree": "1"
      },
      {
         "name": "2A03",
         "DisplayName": "II Axion 3",
         "ShortText": "Modes of thought such as love, desire, or the emotions do not exists unless an idea of what is loved or desired also exists, but not conversely",
         "group": 4, "InDegree": "0",
         "OutDegree": "2"
      },
      {
         "name": "2A04",
         "DisplayName": "II Axion 4",
         "ShortText": "We perceive that a certain body is affected in many ways",
         "group": 4, "InDegree": "0",
         "OutDegree": "1"
      },
      {
         "name": "2A05",
         "DisplayName": "II Axion 5",
         "ShortText": "No individual things are felt except bodies and modes of thought",
         "group": 4, "InDegree": "0",
         "OutDegree": "1"
      },
      {
         "name": "2P01",
         "DisplayName": "II Proposition 1",
         "ShortText": "Thought is an attribute of God; or God is a thinking thing",
         "group": 5, "InDegree": "3",
         "OutDegree": "2"
      },
      {
         "name": "2P02",
         "DisplayName": "II Proposition 2",
         "ShortText": "Extension is an attribute of God; or God is an extended thing",
         "group": 5, "InDegree": "3",
         "OutDegree": "0"
      },
      {
         "name": "2P03",
         "DisplayName": "II Proposition 3",
         "ShortText": "In god exists the idea of his essence and of all things that follow from it.",
         "group": 5, "InDegree": "4",
         "OutDegree": "6"
      },
      {
         "name": "2P04",
         "DisplayName": "II Proposition 4",
         "ShortText": "The idea of God can be one only",
         "group": 5, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "2P05",
         "DisplayName": "II Proposition 5",
         "ShortText": "Formal being of ideas recognizes God as cause only qua thinking being.",
         "group": 5, "InDegree": "4",
         "OutDegree": "0"
      },
      {
         "name": "2P06",
         "DisplayName": "II Proposition 6",
         "ShortText": "Modes of an attribute have God as cause only under that attribute",
         "group": 5, "InDegree": "2",
         "OutDegree": "7"
      },
      {
         "name": "2P07",
         "DisplayName": "II Proposition 7",
         "ShortText": "The order and connection of ideas is the same as the order and connection of things.",
         "group": 5, "InDegree": "1",
         "OutDegree": "14"
      },
      {
         "name": "2P07C01",
         "DisplayName": "II Proposition 7 Corollary 1",
         "ShortText": "God's power of thinking is equal to his power of acting",
         "group": 5, "InDegree": "1",
         "OutDegree": "5"
      },
      {
         "name": "2P08",
         "DisplayName": "II Proposition 8",
         "ShortText": "The ideas of non-existent things are comprehended in the infinite idea of God",
         "group": 5, "InDegree": "1",
         "OutDegree": "1"
      },
      {
         "name": "2P08C01",
         "DisplayName": "II Proposition 8 Corollary 1",
         "ShortText": "Individual things do not exist unless in God's attributes",
         "group": 5, "InDegree": "1",
         "OutDegree": "6"
      },
      {
         "name": "2P09",
         "DisplayName": "II Proposition 9",
         "ShortText": "Individual thing has god for a cause only as affected by another thing",
         "group": 5, "InDegree": "4",
         "OutDegree": "7"
      },
      {
         "name": "2P09C01",
         "DisplayName": "II Proposition 9 Corollary 1",
         "ShortText": "A knowledge of everything in an individual object exists in God so far as he possesses the idea of the object",
         "group": 5, "InDegree": "1",
         "OutDegree": "3"
      },
      {
         "name": "2P10",
         "DisplayName": "II Proposition 10",
         "ShortText": "The being of substance does not pertain to the essence of man",
         "group": 5, "InDegree": "3",
         "OutDegree": "1"
      },
      {
         "name": "2P10C01",
         "DisplayName": "II Proposition 10 Corollary 1",
         "ShortText": "Essence of man consists of modifications of God's attributes",
         "group": 5, "InDegree": "3",
         "OutDegree": "2"
      },
      {
         "name": "2P11",
         "DisplayName": "II Proposition 11",
         "ShortText": "The actual being of the human mind is the idea of an individual thing actually existing",
         "group": 5, "InDegree": "7",
         "OutDegree": "11"
      },
      {
         "name": "2P11C01",
         "DisplayName": "II Proposition 11 Corollary 1",
         "ShortText": "Human mind is a part of the infinite intellect of God",
         "group": 5, "InDegree": "1",
         "OutDegree": "15"
      },
      {
         "name": "2P12",
         "DisplayName": "II Proposition 12",
         "ShortText": "Whatever happens in the object of the human mind is perceived by the mind",
         "group": 5, "InDegree": "4",
         "OutDegree": "9"
      },
      {
         "name": "2P13",
         "DisplayName": "II Proposition 13",
         "ShortText": "The object of the idea constituting the human mind is a body",
         "group": 5, "InDegree": "6",
         "OutDegree": "14"
      },
      {
         "name": "2P13C01",
         "DisplayName": "II Proposition 13 Corollary 1",
         "ShortText": "Man is composed of mind and body, and the body exists as we perceive it",
         "group": 5, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "2O01",
         "DisplayName": "II Postulate 1",
         "ShortText": "Human body composed of a number of individual, composite parts",
         "group": 5, "InDegree": "0",
         "OutDegree": "2"
      },
      {
         "name": "2O02",
         "DisplayName": "II Postulate 2",
         "ShortText": "Some body parts are fluid, some soft, some hard",
         "group": 5, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "2O03",
         "DisplayName": "II Postulate 3",
         "ShortText": "The parts of the body are affected by external bodies",
         "group": 5, "InDegree": "0",
         "OutDegree": "4"
      },
      {
         "name": "2O04",
         "DisplayName": "II Postulate 4",
         "ShortText": "The human body needs for its preservation many other bodies",
         "group": 5, "InDegree": "0",
         "OutDegree": "2"
      },
      {
         "name": "2O05",
         "DisplayName": "II Postulate 5",
         "ShortText": "A fluid part imprints upon a soft part",
         "group": 5, "InDegree": "0",
         "OutDegree": "1"
      },
      {
         "name": "2O06",
         "DisplayName": "II Postulate 6",
         "ShortText": "The body can move and arrange external bodies",
         "group": 5, "InDegree": "0",
         "OutDegree": "2"
      },
      {
         "name": "2P14",
         "DisplayName": "II Proposition 14",
         "ShortText": "The human mind is adapted to the perception of many things",
         "group": 5, "InDegree": "3",
         "OutDegree": "2"
      },
      {
         "name": "2P15",
         "DisplayName": "II Proposition 15",
         "ShortText": "The idea which constitutes the formal being of the human mind is composed of many ideas",
         "group": 5, "InDegree": "4",
         "OutDegree": "1"
      },
      {
         "name": "2P16",
         "DisplayName": "II Proposition 16",
         "ShortText": "The idea of every way in which human body is affected involves the nature of the body and external body",
         "group": 5, "InDegree": "2",
         "OutDegree": "13"
      },
      {
         "name": "2P16C01",
         "DisplayName": "II Proposition 16 Corollary 1",
         "ShortText": "The human mind perceives the nature of many bodies and of its own body",
         "group": 5, "InDegree": "1",
         "OutDegree": "2"
      },
      {
         "name": "2P16C02",
         "DisplayName": "II Proposition 16 Corollary 2",
         "ShortText": "The ideas we have of external bodies indicate the constitution of our own body",
         "group": 5, "InDegree": "1",
         "OutDegree": "5"
      },
      {
         "name": "2P17",
         "DisplayName": "II Proposition 17",
         "ShortText": "The mind will regard as present and existing whatever affects its body",
         "group": 5, "InDegree": "3",
         "OutDegree": "17"
      },
      {
         "name": "2P17C01",
         "DisplayName": "II Proposition 17 Corollary 1",
         "ShortText": "The mind can contemplate external things when they are no longer present",
         "group": 5, "InDegree": "4",
         "OutDegree": "4"
      },
      {
         "name": "2P18",
         "DisplayName": "II Proposition 18",
         "ShortText": "When the mind is affected by two bodies, imagining one causes remembering the other",
         "group": 5, "InDegree": "1",
         "OutDegree": "7"
      },
      {
         "name": "2P19",
         "DisplayName": "II Proposition 19",
         "ShortText": "The human mind does not know the human body itself except through ideas of the body's modifications",
         "group": 5, "InDegree": "8",
         "OutDegree": "5"
      },
      {
         "name": "2P20",
         "DisplayName": "II Proposition 20",
         "ShortText": "There exists in God the idea of the human mind, related to Him as is the idea of the human body",
         "group": 5, "InDegree": "5",
         "OutDegree": "3"
      },
      {
         "name": "2P21",
         "DisplayName": "II Proposition 21",
         "ShortText": "God's idea of the mind is united to the mind in the same way as the mind is united to the body",
         "group": 5, "InDegree": "2",
         "OutDegree": "3"
      },
      {
         "name": "2P22",
         "DisplayName": "II Proposition 22",
         "ShortText": "The human mind perceives both the modifications of the body and also the ideas of those modifications",
         "group": 5, "InDegree": "4",
         "OutDegree": "3"
      },
      {
         "name": "2P23",
         "DisplayName": "II Proposition 23",
         "ShortText": "The mind does not know itself except insofar as it perceives the ideas of modifications of the body",
         "group": 5, "InDegree": "6",
         "OutDegree": "5"
      },
      {
         "name": "2P24",
         "DisplayName": "II Proposition 24",
         "ShortText": "The human mind does not involve an adequate knowledge of the parts of the body",
         "group": 5, "InDegree": "8",
         "OutDegree": "2"
      },
      {
         "name": "2P25",
         "DisplayName": "II Proposition 25",
         "ShortText": "The idea of each modification of the body does not involve an adequate knowledge of an external body",
         "group": 5, "InDegree": "3",
         "OutDegree": "4"
      },
      {
         "name": "2P26",
         "DisplayName": "II Proposition 26",
         "ShortText": "The human mind perceives no external body as existing except through ideas of modifications of its body",
         "group": 5, "InDegree": "4",
         "OutDegree": "4"
      },
      {
         "name": "2P26C01",
         "DisplayName": "II Proposition 26 Corollary 1",
         "ShortText": "Insofar as the human mind imagines an external body, insofar it has not an adequate knowledge of it.",
         "group": 5, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "2P27",
         "DisplayName": "II Proposition 27",
         "ShortText": "The idea of any modification of the body does not inolve an adequate knowledge of the human body itself",
         "group": 5, "InDegree": "2",
         "OutDegree": "3"
      },
      {
         "name": "2P28",
         "DisplayName": "II Proposition 28",
         "ShortText": "The ideas of the modifications of the human body, in the human mind, are not clear and distinct",
         "group": 5, "InDegree": "4",
         "OutDegree": "2"
      },
      {
         "name": "2P29",
         "DisplayName": "II Proposition 29",
         "ShortText": "The idea of the idea of a modification of the body does not inolve an adequate knowledge of the mind",
         "group": 5, "InDegree": "3",
         "OutDegree": "2"
      },
      {
         "name": "2P29C01",
         "DisplayName": "II Proposition 29 Corollary 1",
         "ShortText": "The mind, when it perceives things in the order of Nature, has no adequate knowledge",
         "group": 5, "InDegree": "7",
         "OutDegree": "1"
      },
      {
         "name": "2P30",
         "DisplayName": "II Proposition 30",
         "ShortText": "We can have only an inadequate knowledge of the duration of our body",
         "group": 5, "InDegree": "5",
         "OutDegree": "0"
      },
      {
         "name": "2P31",
         "DisplayName": "II Proposition 31",
         "ShortText": "We can have only an inadequate knowledge of the duration of external things",
         "group": 5, "InDegree": "1",
         "OutDegree": "1"
      },
      {
         "name": "2P32",
         "DisplayName": "II Proposition 32",
         "ShortText": "All ideas, insofar as they are related to God, are true",
         "group": 5, "InDegree": "2",
         "OutDegree": "5"
      },
      {
         "name": "2P33",
         "DisplayName": "II Proposition 33",
         "ShortText": "In ideas, there is nothing positive on account of which they are called false",
         "group": 5, "InDegree": "2",
         "OutDegree": "2"
      },
      {
         "name": "2P34",
         "DisplayName": "II Proposition 34",
         "ShortText": "Every idea in us which is absolute, that is to say adequate and perfect, is true",
         "group": 5, "InDegree": "2",
         "OutDegree": "2"
      },
      {
         "name": "2P35",
         "DisplayName": "II Proposition 35",
         "ShortText": "Falsity consists in the privation of knowledge involved in mutilated and confused ideas",
         "group": 5, "InDegree": "1",
         "OutDegree": "3"
      },
      {
         "name": "2P36",
         "DisplayName": "II Propositon 36",
         "ShortText": "Inadequate and confused ideas follow by the same necessity as adequate ideas",
         "group": 5, "InDegree": "6",
         "OutDegree": "0"
      },
      {
         "name": "2P37",
         "DisplayName": "II Proposition 37",
         "ShortText": "What is common to everything and equally in part and whole forms the essence of no individual thing",
         "group": 5, "InDegree": "1",
         "OutDegree": "1"
      },
      {
         "name": "2P38",
         "DisplayName": "II Proposition 38",
         "ShortText": "What is equally in part and whole can only be adequately conceived",
         "group": 5, "InDegree": "7",
         "OutDegree": "6"
      },
      {
         "name": "2P38C01",
         "DisplayName": "II Proposition 38 Corollary 1",
         "ShortText": "Some ideas are common to all men, and must be clearly and distinctly perceived by all",
         "group": 5, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "2P39",
         "DisplayName": "II Proposition 39",
         "ShortText": "The mind will have an adequate idea of what is common and proper to the human body",
         "group": 5, "InDegree": "4",
         "OutDegree": "1"
      },
      {
         "name": "2P39C01",
         "DisplayName": "II Proposition 39 Corollary 1",
         "ShortText": "The more things the body has in common with other bodies, the more the mind will be adapted to perceive",
         "group": 5, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "2P40",
         "DisplayName": "II Proposition 40",
         "ShortText": "The consequences of adequate ideas are adequate",
         "group": 5, "InDegree": "1",
         "OutDegree": "13"
      },
      {
         "name": "2D08",
         "DisplayName": "II Definition 8",
         "ShortText": "Definition of Knowledge from vague experience (2P40Note2)",
         "group": 4, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "2D09",
         "DisplayName": "II Definition 9",
         "ShortText": "Definition of Knowledge of the first kind (2P40Note2)",
         "group": 4, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "2D10",
         "DisplayName": "II Definition 10",
         "ShortText": "Definition of Reason, or knowledge of the second kind(2P40Note2)",
         "group": 4, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "2D11",
         "DisplayName": "II Definition 11",
         "ShortText": "Definition of Intuitive Science or knowledge of the third kind (2P40Note2)",
         "group": 4, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "2P41",
         "DisplayName": "II Proposition 41",
         "ShortText": "Knowledge of the first kind is the cause of falsity; others, true",
         "group": 5, "InDegree": "2",
         "OutDegree": "5"
      },
      {
         "name": "2P42",
         "DisplayName": "II Proposition 42",
         "ShortText": "Knowledge of the second kind teach us to distinguish true from false",
         "group": 5, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "2P43",
         "DisplayName": "II Proposition 43",
         "ShortText": "Whoever has a true idea knows that he has a true idea and cannot doubt the truth of the thing",
         "group": 5, "InDegree": "3",
         "OutDegree": "6"
      },
      {
         "name": "2P44",
         "DisplayName": "II Proposition 44",
         "ShortText": "It is not the nature of reason to consider things as contingent, but as necessary",
         "group": 5, "InDegree": "3",
         "OutDegree": "3"
      },
      {
         "name": "2P44C01",
         "DisplayName": "II Proposition 44 Corollary 1",
         "ShortText": "Through imagination alone we regard things as contingent",
         "group": 5, "InDegree": "3",
         "OutDegree": "0"
      },
      {
         "name": "2P44C02",
         "DisplayName": "II Proposition 44 Corollary 2",
         "ShortText": "It is the nature of reason to perceive things under a certain form of eternity",
         "group": 5, "InDegree": "6",
         "OutDegree": "2"
      },
      {
         "name": "2P45",
         "DisplayName": "II Proposition 45",
         "ShortText": "Every idea of any body or actually existing individual thing involves the eternal essence of God",
         "group": 5, "InDegree": "5",
         "OutDegree": "2"
      },
      {
         "name": "2P46",
         "DisplayName": "II Proposition 46",
         "ShortText": "The knowledge of God's essence which idea involves is adequate and perfect",
         "group": 5, "InDegree": "2",
         "OutDegree": "3"
      },
      {
         "name": "2P47",
         "DisplayName": "II Proposition 47",
         "ShortText": "The human mind possess an adequate knowledge of the eternal essence of God",
         "group": 5, "InDegree": "7",
         "OutDegree": "4"
      },
      {
         "name": "2P48",
         "DisplayName": "II Proposition 48",
         "ShortText": "In the mind there is no free will",
         "group": 5, "InDegree": "3",
         "OutDegree": "2"
      },
      {
         "name": "2P49",
         "DisplayName": "II Propostion 49",
         "ShortText": "Volition or affirmation and negation except what an idea involves",
         "group": 5, "InDegree": "3",
         "OutDegree": "1"
      },
      {
         "name": "2P49C01",
         "DisplayName": "II Proposition 49 Corollary 1",
         "ShortText": "The will and the intellect are one and the same",
         "group": 5, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "2P06C01",
         "DisplayName": "II Proposition 6 Corollary 1",
         "ShortText": "Formal being of things not modes of thought but as shown",
         "group": 5, "InDegree": "1",
         "OutDegree": "1"
      },
      {
         "name": "2A06",
         "DisplayName": "II Axiom 6",
         "ShortText": "When body a affects body b, all modes follow from nature of a and b (Axiom 1 After 2 Lemma 3)",
         "group": 4, "InDegree": "0",
         "OutDegree": "4"
      },
      {
         "name": "2A07",
         "DisplayName": "II Axion 7",
         "ShortText": "When a body strikes against another, angle of reflection equals angle of incidence (Axiom 2 After II Lemma 3)",
         "group": 4, "InDegree": "0",
         "OutDegree": "2"
      },
      {
         "name": "2A08",
         "DisplayName": "II Axion 8",
         "ShortText": "Changability of bodies depends on adjoining surfaces (Axiom 3 After Lemma 3)",
         "group": 4, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "2D12",
         "DisplayName": "II Definition 12",
         "ShortText": "Definition of 'Mutually United' (After Lemma 3)",
         "group": 4, "InDegree": "0",
         "OutDegree": "2"
      },
      {
         "name": "2P31C01",
         "DisplayName": "II Proposition 31 Corollary 1",
         "ShortText": "All individual things are contingent and corruptible",
         "group": 5, "InDegree": "3",
         "OutDegree": "0"
      },
      {
         "name": "3D01",
         "DisplayName": "III Definition 1",
         "ShortText": "Adequate/Inadequate cause:  effect clearly understood by means of the cause",
         "group": 6, "InDegree": "0",
         "OutDegree": "9"
      },
      {
         "name": "3D02",
         "DisplayName": "III Definition 2",
         "ShortText": "We act when we are adequate cause",
         "group": 6, "InDegree": "0",
         "OutDegree": "11"
      },
      {
         "name": "3D03",
         "DisplayName": "III Definition 3",
         "ShortText": "Emotion: modifications of the body that alter the power of acting",
         "group": 6, "InDegree": "0",
         "OutDegree": "3"
      },
      {
         "name": "3O01",
         "DisplayName": "III Postulate 1",
         "ShortText": "The human body can be affected in many ways that alter its power of acting",
         "group": 7, "InDegree": "0",
         "OutDegree": "2"
      },
      {
         "name": "3O02",
         "DisplayName": "III Postulate 2",
         "ShortText": "The human body is capable of suffering many changes and retaining traces of objects",
         "group": 7, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3P01",
         "DisplayName": "III Proposition 1",
         "ShortText": "Our mind acts at times and at times suffers",
         "group": 7, "InDegree": "5",
         "OutDegree": "9"
      },
      {
         "name": "3P01C01",
         "DisplayName": "III Proposition 1 Corollary 1",
         "ShortText": "Mind subject to passions in proportion to its inadequate ideas; it acts in proportion to adequate ideas",
         "group": 7, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "3P02",
         "DisplayName": "III Proposition 2",
         "ShortText": "The body cannot determine the mind to thought; nor can the mind determine the body to motion or rest",
         "group": 7, "InDegree": "3",
         "OutDegree": "0"
      },
      {
         "name": "3P03",
         "DisplayName": "III Proposition 3",
         "ShortText": "The actions of the mind arise from adequate ideas alone; passive states depend on inadequate ideas",
         "group": 7, "InDegree": "6",
         "OutDegree": "19"
      },
      {
         "name": "3P04",
         "DisplayName": "III Proposition 4",
         "ShortText": "A thing cannot be destroyed except by an external cause",
         "group": 7, "InDegree": "0",
         "OutDegree": "7"
      },
      {
         "name": "3P05",
         "DisplayName": "III Proposition 5",
         "ShortText": "Insofar as one thing is able to destroy another, they are of contary natures",
         "group": 7, "InDegree": "1",
         "OutDegree": "5"
      },
      {
         "name": "3P06",
         "DisplayName": "III Proposition 6",
         "ShortText": "Each thing, insofar as it is in itself, endeavors to persevere in its being",
         "group": 7, "InDegree": "4",
         "OutDegree": "9"
      },
      {
         "name": "3P07",
         "DisplayName": "III Proposition 7",
         "ShortText": "The effort by which each thing endeavors to persevere in its own being is nothing but the actual essence of the thing itself",
         "group": 7, "InDegree": "3",
         "OutDegree": "21"
      },
      {
         "name": "3P08",
         "DisplayName": "III Proposition 8",
         "ShortText": "The effort by which each thing endeavors to persevere in its own being does not involve finite but indefinite time",
         "group": 7, "InDegree": "1",
         "OutDegree": "1"
      },
      {
         "name": "3P09",
         "DisplayName": "III Proposition 9",
         "ShortText": "The mind endeavors to persevere in its being for an indefinite time, and is conscious of this effort",
         "group": 7, "InDegree": "4",
         "OutDegree": "12"
      },
      {
         "name": "3P10",
         "DisplayName": "III Proposition 10",
         "ShortText": "There can be no idea in the mind which excludes the existence of the body, for such an idea is contrary to the mind",
         "group": 7, "InDegree": "5",
         "OutDegree": "0"
      },
      {
         "name": "3P11",
         "DisplayName": "III Proposition 11",
         "ShortText": "If anything increases, helps, or limits our body's power of action, the idea of that thing increases, diminishes, helps, or limits our mind's power of thought.",
         "group": 7, "InDegree": "2",
         "OutDegree": "27"
      },
      {
         "name": "3P12",
         "DisplayName": "III Proposition 12",
         "ShortText": "The mind endeavors as much as possible to imagine those things which increase or assist the body's power of acting",
         "group": 7, "InDegree": "6",
         "OutDegree": "7"
      },
      {
         "name": "3P13",
         "DisplayName": "III Proposition 13",
         "ShortText": "Whenever the mind imagines those things which lessen or limit the body's power of action, it endeavors as much as possible to recollet what excludes the existence of those things",
         "group": 7, "InDegree": "2",
         "OutDegree": "25"
      },
      {
         "name": "3P13C01",
         "DisplayName": "III Proposition 13 Corollary 1",
         "ShortText": "The mind is averse to imagine those things which lessen or hinder its power and that of the body",
         "group": 7, "InDegree": "1",
         "OutDegree": "2"
      },
      {
         "name": "3P14",
         "DisplayName": "III Proposition 14",
         "ShortText": "If the mind at any time has been simultaneously affected by two emotions, whenever it is afterwards affected by one, it will be affected by the other",
         "group": 7, "InDegree": "3",
         "OutDegree": "2"
      },
      {
         "name": "3P15",
         "DisplayName": "III Proposition 15",
         "ShortText": "Anything may be accidentally the cause of joy, sorrow, or desire",
         "group": 7, "InDegree": "2",
         "OutDegree": "4"
      },
      {
         "name": "3P15C01",
         "DisplayName": "III Proposition 15 Corollary 1",
         "ShortText": "The fact that we have contemplated a thing with an emotion of joy or sorrow, of which it is not the efficient cause, is a sufficient reason for being able to love or hate it",
         "group": 7, "InDegree": "6",
         "OutDegree": "2"
      },
      {
         "name": "3P16",
         "DisplayName": "III Proposition 16",
         "ShortText": "We will love or hate whatever resembles something that usually affects the mind with joy or sorrow",
         "group": 7, "InDegree": "3",
         "OutDegree": "3"
      },
      {
         "name": "3P17",
         "DisplayName": "III Proposition 17",
         "ShortText": "If we imagine that x usually affects us with sorrow and x resembles y, which affects equally with joy, we shall both love and hate x.",
         "group": 7, "InDegree": "2",
         "OutDegree": "1"
      },
      {
         "name": "3P18",
         "DisplayName": "III Proposition 18",
         "ShortText": "A man is affected by the image of a past or future thing with the same joy or sorrow as the image of a present thing.",
         "group": 7, "InDegree": "4",
         "OutDegree": "2"
      },
      {
         "name": "3P19",
         "DisplayName": "III Proposition 19",
         "ShortText": "He who imagines that what he loves is destroyed will sorrow; imagining it preserved, will rejoice",
         "group": 7, "InDegree": "4",
         "OutDegree": "4"
      },
      {
         "name": "3P20",
         "DisplayName": "III Proposition 20",
         "ShortText": "He who imagines that what he hates is destroyed will rejoice",
         "group": 7, "InDegree": "3",
         "OutDegree": "2"
      },
      {
         "name": "3P22",
         "DisplayName": "III Proposition 22",
         "ShortText": "If we imagine that a person affects with joy a thing we love, we shall be affected with love toward him",
         "group": 7, "InDegree": "2",
         "OutDegree": "1"
      },
      {
         "name": "3P23",
         "DisplayName": "III Proposition 23",
         "ShortText": "If we imagine what we hate is affected with sorrow, we will rejoice.  Our emotions are inversely proportional to the joy or sorrow in the hated object.",
         "group": 7, "InDegree": "3",
         "OutDegree": "3"
      },
      {
         "name": "3P21",
         "DisplayName": "III Proposition 21",
         "ShortText": "He who imagines that what he loves is affected with joy or sorrow will also be affected with joy or sorrow, and these emotions will be proportional to their status in the beloved.",
         "group": 7, "InDegree": "2",
         "OutDegree": "5"
      },
      {
         "name": "3P24",
         "DisplayName": "III Proposition 24",
         "ShortText": "If we imagine that a person affects with joy a thin we hate, we are affected with hatred toward him, and conversely",
         "group": 7, "InDegree": "2",
         "OutDegree": "1"
      },
      {
         "name": "3P25",
         "DisplayName": "III Proposition 25",
         "ShortText": "We endeavor to affirm, both concerning ourselves and the beloved object, which we imagine will affect us or the object with joy; and conversely",
         "group": 7, "InDegree": "5",
         "OutDegree": "1"
      },
      {
         "name": "3P26",
         "DisplayName": "III Proposition 26",
         "ShortText": "If we hate a thing, we endeavor to affirm concerning it whatever will affect it with sorrow, and to deny what will give it joy",
         "group": 7, "InDegree": "1",
         "OutDegree": "2"
      },
      {
         "name": "3P27",
         "DisplayName": "III Proposition 27",
         "ShortText": "Although we may not have been moved toward a thing by any emotion, if it is like ourselves, we will echo its emotions",
         "group": 7, "InDegree": "2",
         "OutDegree": "9"
      },
      {
         "name": "3P27C01",
         "DisplayName": "III Proposition 27 Corollary 1",
         "ShortText": "If a person produces joy in a thing like us, we will be affected with love toward him; and conversely",
         "group": 7, "InDegree": "1",
         "OutDegree": "1"
      },
      {
         "name": "3P27C02",
         "DisplayName": "III Proposition 27 Corollary 2",
         "ShortText": "If we pity a thing, the fact that its misery affects us with sorrow will not make us hate it",
         "group": 7, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "3P27C03",
         "DisplayName": "III Proposition 27 Corollary 3",
         "ShortText": "If we pity a thing, we shall endeavor as much as possible to free it from its misery",
         "group": 7, "InDegree": "4",
         "OutDegree": "1"
      },
      {
         "name": "3P28",
         "DisplayName": "III Proposition 28",
         "ShortText": "We endeavor to bring into existence everything which we imagine conduces to joy and to remove or destroy what is opposed to it",
         "group": 7, "InDegree": "7",
         "OutDegree": "8"
      },
      {
         "name": "3P29",
         "DisplayName": "III Proposition 29",
         "ShortText": "We shall endeavor to do everything which we imagine men will look upon with joy, and conversely",
         "group": 7, "InDegree": "2",
         "OutDegree": "4"
      },
      {
         "name": "3P30",
         "DisplayName": "III Proposition 30",
         "ShortText": "If a person has done anything which he imagines will affect other with joy, he will be joyful, and ill think himself as cause",
         "group": 7, "InDegree": "3",
         "OutDegree": "4"
      },
      {
         "name": "3P31",
         "DisplayName": "III Proposition 31",
         "ShortText": "If we imagine others love what we love, we will love those things more steadily, and conversely",
         "group": 7, "InDegree": "2",
         "OutDegree": "4"
      },
      {
         "name": "3P31C01",
         "DisplayName": "III Proposition 31 Corollary 1",
         "ShortText": "Each man endeavors to make others love what he loves and hate what he hates.",
         "group": 7, "InDegree": "3",
         "OutDegree": "1"
      },
      {
         "name": "3P32",
         "DisplayName": "III Proposition 32",
         "ShortText": "If we imagine a peson enjoys a thing that only one can possess, we will try to prevent his possessing it.",
         "group": 7, "InDegree": "2",
         "OutDegree": "1"
      },
      {
         "name": "3P33",
         "DisplayName": "III Proposition 33",
         "ShortText": "If we love something like ourselves, we strive to make it love us in return",
         "group": 7, "InDegree": "3",
         "OutDegree": "3"
      },
      {
         "name": "3P34",
         "DisplayName": "III Proposition 34",
         "ShortText": "The greater the emotion with which we imagine a beloved object is affected by us, the greater will be our self-exaltation",
         "group": 7, "InDegree": "4",
         "OutDegree": "2"
      },
      {
         "name": "3P35",
         "DisplayName": "III Proposition 35",
         "ShortText": "If I love x, and y love x more, I will hate x and envy y.",
         "group": 7, "InDegree": "8",
         "OutDegree": "1"
      },
      {
         "name": "3P36",
         "DisplayName": "III Proposition 36",
         "ShortText": "Whoever recollects a thing with which he was once delighted will wish to possess it with every condition that existed formerly",
         "group": 7, "InDegree": "2",
         "OutDegree": "1"
      },
      {
         "name": "3P36C01",
         "DisplayName": "III Proposition 36 Corollary 1",
         "ShortText": "If a lover discovers that one condition is missing, he will be sad",
         "group": 7, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "3P37",
         "DisplayName": "III Proposition 37",
         "ShortText": "The desire which springs from sorrow or joy, hatred or love, is greater in proportion as the emotion is greater",
         "group": 7, "InDegree": "4",
         "OutDegree": "7"
      },
      {
         "name": "3P38",
         "DisplayName": "III Proposition 38",
         "ShortText": "If we cease to love something, we will hate it more than if we had never loved it.",
         "group": 7, "InDegree": "8",
         "OutDegree": "1"
      },
      {
         "name": "3P39",
         "DisplayName": "III Proposition 39",
         "ShortText": "If a man hates another, he will endeavor to do him evil unless he fears a greater evil will arise for himself; and conversely",
         "group": 7, "InDegree": "3",
         "OutDegree": "5"
      },
      {
         "name": "3P40",
         "DisplayName": "III Proposition 40",
         "ShortText": "If we imagine that we are hated by another without having given him cause, we shall hate him in return",
         "group": 7, "InDegree": "2",
         "OutDegree": "5"
      },
      {
         "name": "3P40C01",
         "DisplayName": "III Proposition 40 Corollary 1",
         "ShortText": "If x love y and imagines that y hates x, we will be agitated with both love and hatred",
         "group": 7, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "3P40C02",
         "DisplayName": "III Proposition 40 Corollary 2",
         "ShortText": "If we imagine that an evil has been brought on us by a man toward who we have had no emotion, we will try to return evil to him",
         "group": 7, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "3P41",
         "DisplayName": "III Proposition 41",
         "ShortText": "If we imagine we are beloved without having cause, we shall love him in return",
         "group": 7, "InDegree": "1",
         "OutDegree": "3"
      },
      {
         "name": "3P41C01",
         "DisplayName": "III Proposition 41 Corollary 1",
         "ShortText": "If we imagine we are loved by someone we hate, we will be agitated by both love and hatred",
         "group": 7, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "3P42",
         "DisplayName": "III Proposition 42",
         "ShortText": "If, moved by lover or hope of self-exaltation, we have conferred a favor, we shall be sad if we see the favor is received with ingratitude",
         "group": 7, "InDegree": "5",
         "OutDegree": "1"
      },
      {
         "name": "3P43",
         "DisplayName": "III Proposition 43",
         "ShortText": "Hatred is increased through return of hatred, but may be destroyed by love",
         "group": 7, "InDegree": "6",
         "OutDegree": "1"
      },
      {
         "name": "3P44",
         "DisplayName": "III Proposition 44",
         "ShortText": "Hatred which is altogether overcome by love passes into love, and love is therefore greater than hatred had not preceded it.",
         "group": 7, "InDegree": "3",
         "OutDegree": "1"
      },
      {
         "name": "3P45",
         "DisplayName": "III Proposition 45",
         "ShortText": "If we imagine that any one like ourselves is affected with hatred toward an object like ourselves which we love, we shall hate him.",
         "group": 7, "InDegree": "3",
         "OutDegree": "0"
      },
      {
         "name": "3P46",
         "DisplayName": "III Proposition 46",
         "ShortText": "If we have been affected with joy or sorrow by a foreigner, and if our joy or sorrow is accompanied with the idea of this person as cause, we love no only him, but the nation to which he belongs",
         "group": 7, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "3P47",
         "DisplayName": "III Proposition 47",
         "ShortText": "The joy which arises from our imagining that what we hate has been destroyed or has been injured is not unaccompanied with some sorrow",
         "group": 7, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "3P48",
         "DisplayName": "III Proposition 48",
         "ShortText": "Love and hatred toward any object are destroyed if the love or hatred be joined to the idea of another cause.",
         "group": 7, "InDegree": "1",
         "OutDegree": "3"
      },
      {
         "name": "3P49",
         "DisplayName": "III Proposition 49",
         "ShortText": "For the same reason, love or hatred toward an object we imagine to be free must be greater than toward an object under necessity",
         "group": 7, "InDegree": "3",
         "OutDegree": "1"
      },
      {
         "name": "3P50",
         "DisplayName": "III Proposition 50",
         "ShortText": "Anything may be accidentally the cause either of hope or fear",
         "group": 7, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "3P51",
         "DisplayName": "III Proposition 51",
         "ShortText": "Different men may be affected by one and the same object in different ways, and the same may be affected differently at different times.",
         "group": 7, "InDegree": "2",
         "OutDegree": "1"
      },
      {
         "name": "3P52",
         "DisplayName": "III Proposition 52",
         "ShortText": "An object which we have seen before together with other objects, or which is very like them, will not be comtemplated as much as something peculiar",
         "group": 7, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "3P53",
         "DisplayName": "III Proposition 53",
         "ShortText": "When the mind contemplates itself and its own power of acting, it rejoices; and it rejoices in proportion to the distinctness with which it imagines itself and its power of action",
         "group": 7, "InDegree": "3",
         "OutDegree": "4"
      },
      {
         "name": "3P53C01",
         "DisplayName": "III Proposition 53 Corollary 1",
         "ShortText": "The more a man imagines that he is praised by others, the more is his joy strengthened.",
         "group": 7, "InDegree": "3",
         "OutDegree": "0"
      },
      {
         "name": "3P54",
         "DisplayName": "III Proposition 54",
         "ShortText": "The mind endeavors to imagine those things only which posit its power of acting",
         "group": 7, "InDegree": "1",
         "OutDegree": "1"
      },
      {
         "name": "3P55",
         "DisplayName": "III Proposition 55",
         "ShortText": "When the mind imagines its own weakness, it necessarily sorrows",
         "group": 7, "InDegree": "2",
         "OutDegree": "4"
      },
      {
         "name": "3P55C01",
         "DisplayName": "III Proposition 55 Corollary 1",
         "ShortText": "This sorrow is strengthened in proportion as the mind imagines itself blamed by others",
         "group": 7, "InDegree": "5",
         "OutDegree": "0"
      },
      {
         "name": "3P55C02",
         "DisplayName": "III Proposition 55 Corollary 2",
         "ShortText": "Noone envies the virtue of a person who is not his equal",
         "group": 7, "InDegree": "4",
         "OutDegree": "0"
      },
      {
         "name": "3P56",
         "DisplayName": "III Proposition 56",
         "ShortText": "There are as many kinds of emotions or derivitives of joy, sorrow and desire, as there are kinds of objects by which we are affected",
         "group": 7, "InDegree": "6",
         "OutDegree": "1"
      },
      {
         "name": "3P57",
         "DisplayName": "III Proposition 57",
         "ShortText": "The emotion of one person differs from the corresponding emotion of another as much as the essence of the one differs from the other",
         "group": 7, "InDegree": "3",
         "OutDegree": "0"
      },
      {
         "name": "3P58",
         "DisplayName": "III Proposition 58",
         "ShortText": "Besides the joys and sorrows which are passive, there are other emotions of joy and sorrow which are related to us in so far as we act.",
         "group": 7, "InDegree": "5",
         "OutDegree": "1"
      },
      {
         "name": "3P59",
         "DisplayName": "III Proposition 59",
         "ShortText": "Among the emotions which are related to the mind insofar as it acts, there are none which are not related to joy or desire",
         "group": 7, "InDegree": "3",
         "OutDegree": "7"
      },
      {
         "name": "3E01",
         "DisplayName": "III Definition of Emotions 1",
         "ShortText": "Definition of desire",
         "group": 6, "InDegree": "0",
         "OutDegree": "5"
      },
      {
         "name": "3E02",
         "DisplayName": "III Definition of Emotions 2",
         "ShortText": "Definition of joy",
         "group": 6, "InDegree": "0",
         "OutDegree": "2"
      },
      {
         "name": "3E03",
         "DisplayName": "III Definition of Emotions 3",
         "ShortText": "Definition of sorrow",
         "group": 6, "InDegree": "0",
         "OutDegree": "2"
      },
      {
         "name": "3E04",
         "DisplayName": "III Definition of Emotions 4",
         "ShortText": "Definition of astonishment",
         "group": 6, "InDegree": "0",
         "OutDegree": "1"
      },
      {
         "name": "3E05",
         "DisplayName": "III Definition of Emotions 5",
         "ShortText": "Definition of contempt",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E06",
         "DisplayName": "III Definition of Emotions 6",
         "ShortText": "Definition of love",
         "group": 6, "InDegree": "0",
         "OutDegree": "4"
      },
      {
         "name": "3E07",
         "DisplayName": "III Definition of Emotions 7",
         "ShortText": "Definition of hatred",
         "group": 6, "InDegree": "0",
         "OutDegree": "3"
      },
      {
         "name": "3E08",
         "DisplayName": "III Definition of Emotions 8",
         "ShortText": "Definition of inclination",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E09",
         "DisplayName": "III Definition of Emotions 9",
         "ShortText": "Definition of aversion",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E10",
         "DisplayName": "III Definition of Emotions 10",
         "ShortText": "Definition of devotion",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E11",
         "DisplayName": "III Definition of Emotions 11",
         "ShortText": "Definition of derision",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E12",
         "DisplayName": "III Definition of Emotions 12",
         "ShortText": "Definition of hope",
         "group": 6, "InDegree": "0",
         "OutDegree": "1"
      },
      {
         "name": "3E13",
         "DisplayName": "III Definition of Emotions 13",
         "ShortText": "Definition of fear",
         "group": 6, "InDegree": "0",
         "OutDegree": "2"
      },
      {
         "name": "3E14",
         "DisplayName": "III Definition of Emotions 14",
         "ShortText": "Definition of confidence",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E15",
         "DisplayName": "III Definition of Emotions 15",
         "ShortText": "Definition of despair",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E16",
         "DisplayName": "III Definition of Emotions 16",
         "ShortText": "Definition of gladness",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E17",
         "DisplayName": "III Definition of Emotions 17",
         "ShortText": "Definition of remorse",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E18",
         "DisplayName": "III Definition of Emotions 18",
         "ShortText": "Definition of commiseration",
         "group": 6, "InDegree": "0",
         "OutDegree": "1"
      },
      {
         "name": "3E19",
         "DisplayName": "III Definition of Emotions 19",
         "ShortText": "Definition of favor",
         "group": 6, "InDegree": "0",
         "OutDegree": "2"
      },
      {
         "name": "3E20",
         "DisplayName": "III Definition of Emotions 20",
         "ShortText": "Definition of indignation",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E21",
         "DisplayName": "III Definition of Emotions 21",
         "ShortText": "Definition of overestimation",
         "group": 6, "InDegree": "0",
         "OutDegree": "1"
      },
      {
         "name": "3E22",
         "DisplayName": "III Definition of Emotions 22",
         "ShortText": "Definition of contempt",
         "group": 6, "InDegree": "0",
         "OutDegree": "1"
      },
      {
         "name": "3E23",
         "DisplayName": "III Definition of Emotions 23",
         "ShortText": "Definition of envy",
         "group": 6, "InDegree": "0",
         "OutDegree": "2"
      },
      {
         "name": "3E24",
         "DisplayName": "III Definition of Emotions 24",
         "ShortText": "Definition of compassion",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E25",
         "DisplayName": "III Definition of Emotions 25",
         "ShortText": "Definition of self-satisfaction",
         "group": 6, "InDegree": "0",
         "OutDegree": "2"
      },
      {
         "name": "3E26",
         "DisplayName": "III Definition of Emotions 26",
         "ShortText": "Definition of humility",
         "group": 6, "InDegree": "0",
         "OutDegree": "1"
      },
      {
         "name": "3E27",
         "DisplayName": "III Definition of Emotions 27",
         "ShortText": "Definition of repentance",
         "group": 6, "InDegree": "0",
         "OutDegree": "1"
      },
      {
         "name": "3E28",
         "DisplayName": "III Definition of Emotions 28",
         "ShortText": "Definition of pride",
         "group": 6, "InDegree": "0",
         "OutDegree": "3"
      },
      {
         "name": "3E29",
         "DisplayName": "III Definition of Emotions 29",
         "ShortText": "Definition of despondency",
         "group": 6, "InDegree": "0",
         "OutDegree": "1"
      },
      {
         "name": "3E30",
         "DisplayName": "III Definition of Emotions 30",
         "ShortText": "Definition of self-exaltation",
         "group": 6, "InDegree": "0",
         "OutDegree": "3"
      },
      {
         "name": "3E31",
         "DisplayName": "III Definition of Emotions 31",
         "ShortText": "Definition of shame",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E32",
         "DisplayName": "III Definition of Emotions 32",
         "ShortText": "Definition of regret",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E33",
         "DisplayName": "III Definition of Emotions 33",
         "ShortText": "Definition of emulation",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E34",
         "DisplayName": "III Definition of Emotions 34",
         "ShortText": "Definition of thankfulness or gratitude",
         "group": 6, "InDegree": "0",
         "OutDegree": "1"
      },
      {
         "name": "3E35",
         "DisplayName": "III Definition of Emotions 35",
         "ShortText": "Definition of benevolence",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E36",
         "DisplayName": "III Definition of Emotions 36",
         "ShortText": "Definition of anger",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E37",
         "DisplayName": "III Definition of Emotions 37",
         "ShortText": "Definition of vengeance",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E38",
         "DisplayName": "III Definition of Emotions 38",
         "ShortText": "Definition of cruelty",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E39",
         "DisplayName": "III Definition of Emotions 39",
         "ShortText": "Definition of fear",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E40",
         "DisplayName": "III Definition of Emotions 40",
         "ShortText": "Definition of audacity",
         "group": 6, "InDegree": "0",
         "OutDegree": "1"
      },
      {
         "name": "3E41",
         "DisplayName": "III Definition of Emotions 41",
         "ShortText": "Definition of pusillanimousity",
         "group": 6, "InDegree": "0",
         "OutDegree": "1"
      },
      {
         "name": "3E42",
         "DisplayName": "III Definition of Emotions 42",
         "ShortText": "Definition of consternation",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E43",
         "DisplayName": "III Definition of Emotions 43",
         "ShortText": "Definition of courtesy or moderation",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E44",
         "DisplayName": "III Definition of Emotions 44",
         "ShortText": "Definition of ambition",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E45",
         "DisplayName": "III Definition of Emotions 45",
         "ShortText": "Definition of luxuriousness",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E46",
         "DisplayName": "III Definition of Emotions 46",
         "ShortText": "Definition of drunkenness",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E47",
         "DisplayName": "III Definition of Emotions 47",
         "ShortText": "Definition of avarice",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "3E48",
         "DisplayName": "III Definition of Emotions 48",
         "ShortText": "Definition of lust",
         "group": 6, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "4D01",
         "DisplayName": "IV Definition 1",
         "ShortText": "Definition of good",
         "group": 8, "InDegree": "0",
         "OutDegree": "4"
      },
      {
         "name": "4D02",
         "DisplayName": "IV Definition 2",
         "ShortText": "Definition of evil",
         "group": 8, "InDegree": "0",
         "OutDegree": "1"
      },
      {
         "name": "4D03",
         "DisplayName": "IV Definition 3",
         "ShortText": "Definition of contingent",
         "group": 8, "InDegree": "0",
         "OutDegree": "2"
      },
      {
         "name": "4D04",
         "DisplayName": "IV Definition 4",
         "ShortText": "Definition of possible",
         "group": 8, "InDegree": "0",
         "OutDegree": "1"
      },
      {
         "name": "4D05",
         "DisplayName": "IV Definition 5",
         "ShortText": "Definition of contrary emotions",
         "group": 8, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "4D06",
         "DisplayName": "IV Definition 6",
         "ShortText": "Definition of emotion felt toward a thing future, present or past",
         "group": 8, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "4D07",
         "DisplayName": "IV Definition 7",
         "ShortText": "Definition of 'end for which we do something' …appetite",
         "group": 8, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "4D08",
         "DisplayName": "IV Definition 8",
         "ShortText": "Defintion of virtue or power",
         "group": 8, "InDegree": "0",
         "OutDegree": "8"
      },
      {
         "name": "4A01",
         "DisplayName": "IV Axion 1",
         "ShortText": "Each thing in nature is surpassed in strength by some other thing, which can destroy it",
         "group": 8, "InDegree": "0",
         "OutDegree": "2"
      },
      {
         "name": "4P01",
         "DisplayName": "IV Proposition 1",
         "ShortText": "Nothing positive contained in a false idea is removed by the presence of the true insofar as it is true",
         "group": 9, "InDegree": "4",
         "OutDegree": "1"
      },
      {
         "name": "4P02",
         "DisplayName": "IV Proposition 2",
         "ShortText": "We suffer in so far as we are a part of nature, which part cannot be conceived by itself nor without other parts",
         "group": 9, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "4P03",
         "DisplayName": "IV Proposition 3",
         "ShortText": "The force by which man perseveres in existence is limited and infinitely surpassed by the power of external causes",
         "group": 9, "InDegree": "1",
         "OutDegree": "4"
      },
      {
         "name": "4P04",
         "DisplayName": "IV Proposition 4",
         "ShortText": "It is impossible that a man not be a part of Nature and that he should suffer no changes but which follow from his own nature",
         "group": 9, "InDegree": "7",
         "OutDegree": "1"
      },
      {
         "name": "4P05",
         "DisplayName": "IV Proposition 5",
         "ShortText": "The force and increase of a passion and its perseverance in existence are not limited by the power by which we endeavor to persevere in existence, but by the power of the external cause",
         "group": 9, "InDegree": "4",
         "OutDegree": "6"
      },
      {
         "name": "4P04C01",
         "DisplayName": "IV Proposition 4 Corollary 1",
         "ShortText": "A man is always subject to passions, and he accommodates himself to it as far as the nature of things requires",
         "group": 9, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "4P06",
         "DisplayName": "IV Proposition 6",
         "ShortText": "The other actions or power of a man may be so far surpassed by the force of a passion or emotion that the emotion may obstinately cling to him",
         "group": 9, "InDegree": "2",
         "OutDegree": "4"
      },
      {
         "name": "4P07",
         "DisplayName": "IV Proposition 7",
         "ShortText": "An emotion cannot be restrained nor removed unless by an opposed and stronger emotion",
         "group": 9, "InDegree": "6",
         "OutDegree": "4"
      },
      {
         "name": "4P08",
         "DisplayName": "IV Proposition 8",
         "ShortText": "Knowledge of good or evil is nothing by an emotion of joy or sorrow in so far as we are conscious of it",
         "group": 9, "InDegree": "6",
         "OutDegree": "6"
      },
      {
         "name": "4P09",
         "DisplayName": "IV Proposition 9",
         "ShortText": "If we imagine the cause of an emotion to be actually present with us, that emotion will be stronger than if we imagined the cause not to be present",
         "group": 9, "InDegree": "3",
         "OutDegree": "5"
      },
      {
         "name": "4P09C01",
         "DisplayName": "IV Proposition 9 Corollary 1",
         "ShortText": "The image of a past or future object is weaker than the image of a present object; and ceterus paribus, the emotion toward it is weaker as well",
         "group": 9, "InDegree": "1",
         "OutDegree": "2"
      },
      {
         "name": "4P10",
         "DisplayName": "IV Proposition 10",
         "ShortText": "We are affected more strongly by a future object that we imagine is near than by one more distant, and similarly for past objects",
         "group": 9, "InDegree": "1",
         "OutDegree": "1"
      },
      {
         "name": "4P11",
         "DisplayName": "IV Proposition 11",
         "ShortText": "The emotion toward an object we imagine as necessary is stronger than toward an object possible or contingent",
         "group": 9, "InDegree": "2",
         "OutDegree": "1"
      },
      {
         "name": "4P12",
         "DisplayName": "IV Proposition 12",
         "ShortText": "The emotion toward an object we know does not exist in the present, and which we imagine as possible is stronger than the emotion toward a contingent object",
         "group": 9, "InDegree": "3",
         "OutDegree": "1"
      },
      {
         "name": "4P12C01",
         "DisplayName": "IV Proposition 12 Corollary 1",
         "ShortText": "The emotion toward an object which we know does not exist as paresnt, and which we imagine as contingent is much weaker than toward an object imagined to be present",
         "group": 9, "InDegree": "3",
         "OutDegree": "1"
      },
      {
         "name": "4P13",
         "DisplayName": "IV Proposition 13",
         "ShortText": "The emotion toward a contingent object which we know does not exist in the present is much weaker than the emotion toward a past object.",
         "group": 9, "InDegree": "4",
         "OutDegree": "0"
      },
      {
         "name": "4P14",
         "DisplayName": "IV Proposition 14",
         "ShortText": "No emotion can be restrained by the true knowledge of good and evil in so far as it is true, but only in so far as it is considered as an emotion",
         "group": 9, "InDegree": "3",
         "OutDegree": "0"
      },
      {
         "name": "4P15",
         "DisplayName": "IV Proposition 15",
         "ShortText": "Desire that arises from a true knowledge of good and evil can be extinguished or restrained by many other desires",
         "group": 9, "InDegree": "9",
         "OutDegree": "2"
      },
      {
         "name": "4P16",
         "DisplayName": "IV Proposition 16",
         "ShortText": "The desire that springs from a knowledge of good and evil can be easily extinguished or restrained, insofar as this knowledge is connected with the future",
         "group": 9, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "4P17",
         "DisplayName": "IV Proposition 17",
         "ShortText": "The desire that springs from a true knowledge of good and evil can be still more easily restrained when it is connected with objects which are contingent",
         "group": 9, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "4P18",
         "DisplayName": "IV Proposition 18",
         "ShortText": "The desire that springs from joy, other things being equal, is stronger than that which springs from sorrow.",
         "group": 9, "InDegree": "3",
         "OutDegree": "0"
      },
      {
         "name": "4P19",
         "DisplayName": "IV Proposition 19",
         "ShortText": "According to the laws of his own nature, each person necessarily desires that which he considers to be good and avoids what he considers to be evil.",
         "group": 9, "InDegree": "4",
         "OutDegree": "3"
      },
      {
         "name": "4P20",
         "DisplayName": "IV Proposition 20",
         "ShortText": "The more a person strives and is able to seek his own profit, the more virtue does he possess; on the other hand, so far as he neglects is own profit, he is impotent",
         "group": 9, "InDegree": "4",
         "OutDegree": "0"
      },
      {
         "name": "4P21",
         "DisplayName": "IV Proposition 21",
         "ShortText": "No one can desire to be happy, to act well and live well, who does not at the same time desire to be, to act, and to live…that is, to actually exist.",
         "group": 9, "InDegree": "2",
         "OutDegree": "1"
      },
      {
         "name": "4P22",
         "DisplayName": "IV Proposition 22",
         "ShortText": "No virtue can be conceived prior to this, namely the endeavor for self-preservation",
         "group": 9, "InDegree": "2",
         "OutDegree": "2"
      },
      {
         "name": "4P23",
         "DisplayName": "IV Proposition 23",
         "ShortText": "A man cannot be absolutely said to act in conformity with virtue except in so far as he is determined because he understands",
         "group": 9, "InDegree": "4",
         "OutDegree": "1"
      },
      {
         "name": "4P25",
         "DisplayName": "IV Proposition 25",
         "ShortText": "No one endeavors to preserve his own being formt he sake of another object",
         "group": 9, "InDegree": "3",
         "OutDegree": "1"
      },
      {
         "name": "4P24",
         "DisplayName": "IV Proposition 24",
         "ShortText": "To act absolutely in conformity with virtue is, in us, nothing but acting, living, and preserving our being as reason directs from the ground of seeking our own profit.",
         "group": 9, "InDegree": "3",
         "OutDegree": "6"
      },
      {
         "name": "4P26",
         "DisplayName": "IV Proposition 26",
         "ShortText": "All efforts which we make through reason are nothing but efforts to understand; and nothing is adjudged profitable except that which conduces to understanding",
         "group": 9, "InDegree": "7",
         "OutDegree": "11"
      },
      {
         "name": "4P27",
         "DisplayName": "IV Proposition 27",
         "ShortText": "We do not know that anything is certainly good or evil except that which actually conduces to understanding, or which can prevent us from understanding",
         "group": 9, "InDegree": "4",
         "OutDegree": "7"
      },
      {
         "name": "4P28",
         "DisplayName": "IV Proposition 28",
         "ShortText": "The highest good of the mind is the knowledge of God, and the highest virtue of the mind is to know God",
         "group": 9, "InDegree": "8",
         "OutDegree": "4"
      },
      {
         "name": "4P29",
         "DisplayName": "IV Proposition 29",
         "ShortText": "No individual object whose nature is altogether different from our own can either help or restrain our power of acting; absolutely nothing can be to us either good or evil unless it possesses something in common with ourselves",
         "group": 9, "InDegree": "5",
         "OutDegree": "1"
      },
      {
         "name": "4P30",
         "DisplayName": "IV Proposition 30",
         "ShortText": "Nothing can be evil through that which it possesses in common with our nature, but in so far as a thing is evil to us is it contrary to us.",
         "group": 9, "InDegree": "4",
         "OutDegree": "5"
      },
      {
         "name": "4P31",
         "DisplayName": "IV Proposition 31",
         "ShortText": "Insofar as an object agrees with our nature, is it necessarily good.",
         "group": 9, "InDegree": "4",
         "OutDegree": "2"
      },
      {
         "name": "4P31C01",
         "DisplayName": "IV Proposition 31 Corollary 1",
         "ShortText": "The more an object agrees with our nature, the more profitable it is to us…that is, the better for us.",
         "group": 9, "InDegree": "2",
         "OutDegree": "3"
      },
      {
         "name": "4P32",
         "DisplayName": "IV Proposition 32",
         "ShortText": "Insofar as men are subject to passions, they cannot be said to agree in nature",
         "group": 9, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "4P33",
         "DisplayName": "IV Proposition 33",
         "ShortText": "Men may differ in nature from one another insof as they are agitated by emotions which are passions and insofar also as one and the same man is agitated by passions, he is changeable and inconstant",
         "group": 9, "InDegree": "5",
         "OutDegree": "1"
      },
      {
         "name": "4P34",
         "DisplayName": "IV Proposition 34",
         "ShortText": "Insofar as men are agitated by emotions which are passions, they can be contrary to one another",
         "group": 9, "InDegree": "8",
         "OutDegree": "1"
      },
      {
         "name": "4P35",
         "DisplayName": "IV Proposition 35",
         "ShortText": "Sofar as men live in conformity with the guidance of reason, insofar only do they always necessarily agree in nature",
         "group": 9, "InDegree": "7",
         "OutDegree": "4"
      },
      {
         "name": "4P35C01",
         "DisplayName": "IV Proposition 35 Corollary 1",
         "ShortText": "There is no single thing in Nature that is more profitable to man than a man who lives according to the guidance of reason",
         "group": 9, "InDegree": "4",
         "OutDegree": "3"
      },
      {
         "name": "4P35C02",
         "DisplayName": "IV Proposition 35 Corollary 2",
         "ShortText": "When each man seeks most that which is profitable to himself, then are men most profitable to one another",
         "group": 9, "InDegree": "4",
         "OutDegree": "0"
      },
      {
         "name": "4P36",
         "DisplayName": "IV Proposition 36",
         "ShortText": "The highest good of those who follow after virtue is common to all, and all may equally enjoy it.",
         "group": 9, "InDegree": "4",
         "OutDegree": "2"
      },
      {
         "name": "1P11",
         "DisplayName": "I Proposition 11",
         "ShortText": "God, a substance, necessarily exists",
         "group": 2, "InDegree": "7",
         "OutDegree": "8"
      },
      {
         "name": "4P51",
         "DisplayName": "IV Proposition 51",
         "ShortText": "Favor is not opposed to reason but agrees with it, and may arise from it",
         "group": 9, "InDegree": "6",
         "OutDegree": "0"
      },
      {
         "name": "4P38",
         "DisplayName": "IV Proposition 38",
         "ShortText": "What disposes the human body to be affected in many ways, or which renders it capable of affecting external bodies in many ways is profitable to man.",
         "group": 9, "InDegree": "3",
         "OutDegree": "5"
      },
      {
         "name": "4P39",
         "DisplayName": "IV Proposition 39",
         "ShortText": "Whatever is effective to preserve the propostion of motion and rest which the parts of the human body bear to each other is good, and contrarywise",
         "group": 9, "InDegree": "5",
         "OutDegree": "1"
      },
      {
         "name": "4P40",
         "DisplayName": "IV Proposition 40",
         "ShortText": "Whatever conduces to the universal fellowship of men is profitable, and contrarywise",
         "group": 9, "InDegree": "3",
         "OutDegree": "0"
      },
      {
         "name": "4P41",
         "DisplayName": "IV Proposition 41",
         "ShortText": "Joy is not directly evil but good; sorrow, on the other hand, is directly evil.",
         "group": 9, "InDegree": "2",
         "OutDegree": "5"
      },
      {
         "name": "4P42",
         "DisplayName": "IV Proposition 42",
         "ShortText": "Cheerfulness can never be excessive, but is always good; melancholy, on the contrary, is always evil",
         "group": 9, "InDegree": "3",
         "OutDegree": "0"
      },
      {
         "name": "4P43",
         "DisplayName": "IV Proposition 43",
         "ShortText": "Pleasurable excitement may be excessive and an evil; and pain may be good insofar as pleasurable excitement or joy is evil",
         "group": 9, "InDegree": "6",
         "OutDegree": "3"
      },
      {
         "name": "4P44",
         "DisplayName": "IV Proposition 44",
         "ShortText": "Love and desire may be excessive",
         "group": 9, "InDegree": "5",
         "OutDegree": "0"
      },
      {
         "name": "4P45",
         "DisplayName": "IV Proposition 45",
         "ShortText": "Hatred can never be good",
         "group": 9, "InDegree": "2",
         "OutDegree": "2"
      },
      {
         "name": "4P45C01",
         "DisplayName": "IV Proposition 45 Corollary 1",
         "ShortText": "Envy, mockery, contempt, anger, revenge, and the other emotions which are related to hatred are evil.",
         "group": 9, "InDegree": "3",
         "OutDegree": "3"
      },
      {
         "name": "4P45C02",
         "DisplayName": "IV Proposition 45 Corollary 2",
         "ShortText": "Whatver we desire because we are affected by hatred is base and unjust in the State",
         "group": 9, "InDegree": "3",
         "OutDegree": "0"
      },
      {
         "name": "4P46",
         "DisplayName": "IV Proposition 46",
         "ShortText": "He who lives according to the guidance of reason strives as much as possible to repay hatred, anger, or contempt of other with love or generosity",
         "group": 9, "InDegree": "5",
         "OutDegree": "0"
      },
      {
         "name": "4P47",
         "DisplayName": "IV Proposition 47",
         "ShortText": "The emotions hope and fear cannot be good of themselves",
         "group": 9, "InDegree": "4",
         "OutDegree": "0"
      },
      {
         "name": "4P48",
         "DisplayName": "IV Proposition 48",
         "ShortText": "The emotions of overestimation and contempt are always evil",
         "group": 9, "InDegree": "4",
         "OutDegree": "0"
      },
      {
         "name": "4P49",
         "DisplayName": "IV Proposition 49",
         "ShortText": "Overestimation easily renders the man who is overestimated proud",
         "group": 9, "InDegree": "4",
         "OutDegree": "0"
      },
      {
         "name": "4P50",
         "DisplayName": "IV Proposition 50",
         "ShortText": "Pity in a man who lives according to the guidance of reason is in itself evil and unprofitable",
         "group": 9, "InDegree": "5",
         "OutDegree": "1"
      },
      {
         "name": "4P59",
         "DisplayName": "IV Proposition 59",
         "ShortText": "To all actions to which we are determined by an emotion wherein the mind is passive we may, without the emotion, be determined by reason",
         "group": 9, "InDegree": "7",
         "OutDegree": "0"
      },
      {
         "name": "4P52",
         "DisplayName": "IV Proposition 52",
         "ShortText": "Self-satisfaction may arise from reason, and the self-satisfaction alone which arises from reason is the highest that can exist",
         "group": 9, "InDegree": "5",
         "OutDegree": "0"
      },
      {
         "name": "4P53",
         "DisplayName": "IV Proposition 53",
         "ShortText": "Humility is not a virtue, that is to say, it does not spring from reason",
         "group": 9, "InDegree": "3",
         "OutDegree": "0"
      },
      {
         "name": "4P54",
         "DisplayName": "IV Proposition 54",
         "ShortText": "Repentance is not a virtue, that is to say, it does not spring from reason; on the contrary, the man who repends of what he has done is doubly writched or impotent",
         "group": 9, "InDegree": "3",
         "OutDegree": "0"
      },
      {
         "name": "4P55",
         "DisplayName": "IV Proposition 55",
         "ShortText": "The greatest pride or the greatest despondency is the greatest ignorance of one's self",
         "group": 9, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "4P56",
         "DisplayName": "IV Proposition 56",
         "ShortText": "The greatest pride or despondency incates the greatest impotence of mind",
         "group": 9, "InDegree": "4",
         "OutDegree": "1"
      },
      {
         "name": "4P56C01",
         "DisplayName": "IV Proposition 56 Corollary 1",
         "ShortText": "The proud and desponding are, above all others, subject to emotions",
         "group": 9, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "4P57",
         "DisplayName": "IV Proposition 57",
         "ShortText": "The proud man loves the presence of parasites or flatterers, and hates that of the noble-minded",
         "group": 9, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "4P58",
         "DisplayName": "IV Proposition 58",
         "ShortText": "Self-exaltation is not opposed to reason, but may spring from it",
         "group": 9, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "4P60",
         "DisplayName": "IV Proposition 60",
         "ShortText": "The desire that arises from joy or sorrow, which is related to one or to some, but not to all, the parts of the body, has no regard to the profit of the whole man",
         "group": 9, "InDegree": "4",
         "OutDegree": "0"
      },
      {
         "name": "4P61",
         "DisplayName": "IV Proposition 61",
         "ShortText": "A desire which springs from reason can never be in excess",
         "group": 9, "InDegree": "3",
         "OutDegree": "0"
      },
      {
         "name": "4P62",
         "DisplayName": "IV Proposition 62",
         "ShortText": "Insofar as the conception of an object is formed by the mind according to the dictate of reason, the mind is equally affected, whether the idea be that of something past, present, or future",
         "group": 9, "InDegree": "4",
         "OutDegree": "1"
      },
      {
         "name": "4P63",
         "DisplayName": "IV Proposition 63",
         "ShortText": "He who is led by fear and does what is good in order that he may avoid what is evil is not led by reason",
         "group": 9, "InDegree": "3",
         "OutDegree": "3"
      },
      {
         "name": "4P64",
         "DisplayName": "IV Proposition 64",
         "ShortText": "The knowledge of evil is inadequate knowledge",
         "group": 9, "InDegree": "7",
         "OutDegree": "0"
      },
      {
         "name": "4P65",
         "DisplayName": "IV Proposition 65",
         "ShortText": "According to the guidance of reason, of two things which are good, we shall follow the greater good, and of two evils, the lesser",
         "group": 9, "InDegree": "1",
         "OutDegree": "2"
      },
      {
         "name": "4P66",
         "DisplayName": "IV Proposition 66",
         "ShortText": "According to the guidance of reason, we shall seek the greater future good before that which is leas and present; and contrarywise",
         "group": 9, "InDegree": "2",
         "OutDegree": "2"
      },
      {
         "name": "4P67",
         "DisplayName": "IV Proposition 67",
         "ShortText": "A free man thinks of nothing less than of death, and his wisdom is not a meditation upon death, but upon life",
         "group": 9, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "4P65C01",
         "DisplayName": "IV Proposition 65 Corollary 1",
         "ShortText": "According to the guidance of reason, we shall follow a lesser evil for the sake of a greater good, and a lesser good which is the cause of a greater evil we shall neglect",
         "group": 9, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "4P66C01",
         "DisplayName": "IV Proposition 66 Corollary 1",
         "ShortText": "According to the guidance of reason, we shall seek the lesser present evil which is the cause of the greater future good, and the lesser present good which is the cause of a greater future evil we shall neglect",
         "group": 9, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "4P68",
         "DisplayName": "IV Proposition 68",
         "ShortText": "If men were born free, they would form no conception of good and evil so long as they were free",
         "group": 9, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "4P69",
         "DisplayName": "IV Proposition 69",
         "ShortText": "The virtue of a free man is seen to be as great in avoiding danger as in overcoming it",
         "group": 9, "InDegree": "6",
         "OutDegree": "0"
      },
      {
         "name": "4P70",
         "DisplayName": "IV Proposition 70",
         "ShortText": "The free man who lives amongst those who are ignorant strives as much as possible to avoid their favors",
         "group": 9, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "4P71",
         "DisplayName": "IV Proposition 71",
         "ShortText": "None but those who are free are very grateful to one another",
         "group": 9, "InDegree": "3",
         "OutDegree": "0"
      },
      {
         "name": "4P72",
         "DisplayName": "IV Proposition 72",
         "ShortText": "A free man never acts deceitfully, but always honorably",
         "group": 9, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "4P73",
         "DisplayName": "IV Proposition 73",
         "ShortText": "A man who is guided by reason is freer in a State where he lives according to the common laws than he is in solitude, where he obeys himself alone",
         "group": 9, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "4P07C01",
         "DisplayName": "IV Proposition 7 Corollary 1",
         "ShortText": "A man is necessarily always subject to passions",
         "group": 9, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "4P22C01",
         "DisplayName": "IV Proposition 22 Corollary 1",
         "ShortText": "The endeavor after self-preservation is the primary and only foundation of virtue",
         "group": 9, "InDegree": "2",
         "OutDegree": "4"
      },
      {
         "name": "4P50C01",
         "DisplayName": "IV Proposition 50 Corollary 1",
         "ShortText": "A man who lives according to the dictates of reason endeavors as much as possible to prevent himself from being touched by pity",
         "group": 9, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "5A01",
         "DisplayName": "V Axion 1",
         "ShortText": "If two contrary actions be excited in the same subject, a change must necessarily take place in both, or in one, until they cease to be contrary",
         "group": 10, "InDegree": "0",
         "OutDegree": "1"
      },
      {
         "name": "5A02",
         "DisplayName": "V Axiom 2",
         "ShortText": "The power of an emotion is limited by the power of its cause, insofar as the essence of the emotion is manifested or limited by the essence of the cause itself",
         "group": 10, "InDegree": "0",
         "OutDegree": "0"
      },
      {
         "name": "5P01",
         "DisplayName": "V Proposition 1",
         "ShortText": "As thoughts and the ideas of things are arranged and connected in the mind, exactly so are the modifications of the body or the images of things arranged and connected in the body",
         "group": 10, "InDegree": "5",
         "OutDegree": "1"
      },
      {
         "name": "5P02",
         "DisplayName": "V Proposition 2",
         "ShortText": "If we detatch a perturbation of the mind or an emotion from the thought of an external cause and connect it with other thoughts, then the love or hatred toward the external cause will be destroyed",
         "group": 10, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "5P03",
         "DisplayName": "V Proposition 3",
         "ShortText": "An emotion which is a passion ceases to be a passion as soon as we form a clear and distinct idea of it",
         "group": 10, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "5P04",
         "DisplayName": "V Proposition 4",
         "ShortText": "There is no modification of the body of which we cannot form some clear and distinct conception",
         "group": 10, "InDegree": "3",
         "OutDegree": "1"
      },
      {
         "name": "5P05",
         "DisplayName": "V Proposition 5",
         "ShortText": "An emotion toward an object which we do not imagine as necessary, possible, or contingent, but which we simply imagine is, other things equal, the greatest of all",
         "group": 10, "InDegree": "3",
         "OutDegree": "1"
      },
      {
         "name": "5P06",
         "DisplayName": "V Proposition 6",
         "ShortText": "Insofar as the mind understands all things as necessary, so far has it greater power over the emotions, or suffers less from them.",
         "group": 10, "InDegree": "4",
         "OutDegree": "0"
      },
      {
         "name": "5P07",
         "DisplayName": "V Proposition 7",
         "ShortText": "The emotions which spring from reason or which are excited by it are, if time be taken into account, more powerful than those which are related to individual objects which we contemplate as absent",
         "group": 10, "InDegree": "6",
         "OutDegree": "0"
      },
      {
         "name": "5P08",
         "DisplayName": "V Proposition 8",
         "ShortText": "The greater the number of the causes which simultaneously concur to excite any emotion, the greater it will be",
         "group": 10, "InDegree": "2",
         "OutDegree": "1"
      },
      {
         "name": "5P32C01",
         "DisplayName": "V Proposition 32 Corollary 1",
         "ShortText": "From the third kind of knowledge necessarily springs the intellectual love of God",
         "group": 10, "InDegree": "3",
         "OutDegree": "2"
      },
      {
         "name": "5P33",
         "DisplayName": "V Proposition 33",
         "ShortText": "The intellectual love of God which arises from the third kind of knowledge is eternal",
         "group": 10, "InDegree": "2",
         "OutDegree": "2"
      },
      {
         "name": "5P34",
         "DisplayName": "V Proposition 34",
         "ShortText": "The mind is subject to emotions which are related to passions only so long at the body exists",
         "group": 10, "InDegree": "3",
         "OutDegree": "1"
      },
      {
         "name": "5P34C01",
         "DisplayName": "V Proposition 34 Corollary 1",
         "ShortText": "No love except the intellectual love is eternal",
         "group": 10, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "5P09",
         "DisplayName": "V Proposition 9",
         "ShortText": "If we are affected by an emotion which is related to many and different causes which the mind contemplates at the same time with the emotion itslef, we are less injured, suffer less from it, and are less affected toward each cause",
         "group": 10, "InDegree": "5",
         "OutDegree": "0"
      },
      {
         "name": "5P10",
         "DisplayName": "V Proposition 10",
         "ShortText": "So long as we are not agitated by emotions which are contrary to our nature, do we possess the power of arranging and connecting the modifications of the body according to the order of the intellect",
         "group": 10, "InDegree": "6",
         "OutDegree": "1"
      },
      {
         "name": "5P11",
         "DisplayName": "V Proposition 11",
         "ShortText": "The greater the number of objects to which an image is related, the more constant is it, or the more frequently does it present iself, and the more does it occupy the mind",
         "group": 10, "InDegree": "1",
         "OutDegree": "2"
      },
      {
         "name": "5P12",
         "DisplayName": "V Proposition 12",
         "ShortText": "The images of things are more eaily connected with those images which are related to things which we clearly and distinctly understand than with any others",
         "group": 10, "InDegree": "3",
         "OutDegree": "0"
      },
      {
         "name": "5P13",
         "DisplayName": "V Proposition 13",
         "ShortText": "The greater the number of other things with which any image is connected, the more frequently does it present itself",
         "group": 10, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "5P14",
         "DisplayName": "V Proposition 14",
         "ShortText": "The mind can cause all the modifications of the body or of the images of things to be related to the idea of God",
         "group": 10, "InDegree": "2",
         "OutDegree": "3"
      },
      {
         "name": "5P15",
         "DisplayName": "V Proposition 15",
         "ShortText": "He who clearly and distinctly understands himself and his emotions loves God, and loves Him better the better he understands himself and his emotions",
         "group": 10, "InDegree": "3",
         "OutDegree": "2"
      },
      {
         "name": "5P16",
         "DisplayName": "V Proposition 16",
         "ShortText": "This love of God above everything else ought to occupy the mind",
         "group": 10, "InDegree": "3",
         "OutDegree": "1"
      },
      {
         "name": "5P17",
         "DisplayName": "V Proposition 17",
         "ShortText": "God is free from passions, nor is He affected with any emotion of joy and sorrow",
         "group": 10, "InDegree": "5",
         "OutDegree": "0"
      },
      {
         "name": "5P18",
         "DisplayName": "V Proposition 18",
         "ShortText": "No man can hate God",
         "group": 10, "InDegree": "5",
         "OutDegree": "2"
      },
      {
         "name": "5P18C01",
         "DisplayName": "V Proposition 18 Corollary 1",
         "ShortText": "Love of God cannot be turned into hatred",
         "group": 10, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "5P19",
         "DisplayName": "V Proposition 19",
         "ShortText": "He who loves God cannot strive that God should live him in return",
         "group": 10, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "5P20",
         "DisplayName": "V Proposition 20",
         "ShortText": "This love of God cannot be defiled either by the emotion of envy or jealousy, but is the more strengthened, the more people we imagine to be connected with God by the same bond of love",
         "group": 10, "InDegree": "6",
         "OutDegree": "0"
      },
      {
         "name": "5P21",
         "DisplayName": "V Proposition 21",
         "ShortText": "The mind can imagine nothing, nor can it recollect anything that is past, except while the body exists",
         "group": 10, "InDegree": "4",
         "OutDegree": "4"
      },
      {
         "name": "5P22",
         "DisplayName": "V Proposition 22",
         "ShortText": "In God, nevertheless, there necessarily exists an idea which expresses the essence of this or that human body under the form of eternity",
         "group": 10, "InDegree": "4",
         "OutDegree": "1"
      },
      {
         "name": "5P23",
         "DisplayName": "V Proposition 23",
         "ShortText": "The human mind cannot be absolutely destroyed with the body, but something of it remains which is eternal",
         "group": 10, "InDegree": "3",
         "OutDegree": "4"
      },
      {
         "name": "5P24",
         "DisplayName": "V Proposition 24",
         "ShortText": "The more we understand individual objects, the more we understand God",
         "group": 10, "InDegree": "1",
         "OutDegree": "2"
      },
      {
         "name": "5P25",
         "DisplayName": "V Proposition 25",
         "ShortText": "The highest effort of the mind and its highest virtue is to understand things by the third kind of knowledge",
         "group": 10, "InDegree": "5",
         "OutDegree": "1"
      },
      {
         "name": "5P26",
         "DisplayName": "V Proposition 26",
         "ShortText": "The better the mind is adapted to understand things by the third kind of knowledge, the more it desires to understand them by this kind of knowledge",
         "group": 10, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "5P27",
         "DisplayName": "V Proposition 27",
         "ShortText": "From this third kind of knowledge arises the highest possible peace of mind",
         "group": 10, "InDegree": "5",
         "OutDegree": "1"
      },
      {
         "name": "5P28",
         "DisplayName": "V Proposition 28",
         "ShortText": "The effort or the desire to know things by the third kind of knowledgte cannot arise from the first kind, but may arise from the second kind of knowledge",
         "group": 10, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "5P29",
         "DisplayName": "V Proposition 29",
         "ShortText": "Everything which the mind understands under the form of eternity, it understands not because it conceives the present actual existence of the body, but because it coneives the essence of the body under the form of eternity",
         "group": 10, "InDegree": "6",
         "OutDegree": "5"
      },
      {
         "name": "5P30",
         "DisplayName": "V Proposition 30",
         "ShortText": "Our mind, insofar as it knows itself and the body under the form of eternity, necessarily has aknowledge of God, and knws that it is in God and is conceived through Him",
         "group": 10, "InDegree": "1",
         "OutDegree": "2"
      },
      {
         "name": "5P31",
         "DisplayName": "V Proposition 31",
         "ShortText": "The third kind of knowledge depends upon the mind as its formal cause, insofar as the mind itself is eternal",
         "group": 10, "InDegree": "7",
         "OutDegree": "1"
      },
      {
         "name": "5P32",
         "DisplayName": "V Proposition 32",
         "ShortText": "We delight in whatever we understand by the third kind of knowledgte, and our delight is accompanied with the idea of God as its cause",
         "group": 10, "InDegree": "3",
         "OutDegree": "4"
      },
      {
         "name": "5P35",
         "DisplayName": "V Proposition 35",
         "ShortText": "God loves himself with an infinite intellectual love",
         "group": 10, "InDegree": "5",
         "OutDegree": "1"
      },
      {
         "name": "5P36",
         "DisplayName": "V Proposition 36",
         "ShortText": "The intellectual love of the mind toward God is the very love with which He loves Himself, not insofar as He is infinite, but in so far as He can be manifested through the essence of the human mind considered under the form of eternity",
         "group": 10, "InDegree": "6",
         "OutDegree": "2"
      },
      {
         "name": "5P36C01",
         "DisplayName": "V Proposition 36 Corollary 1",
         "ShortText": "God, insofar as He loves Himself, love men, and consequently that the love of God toward men and the intellectual love of the mind toward God are one and the same thing",
         "group": 10, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "5P37",
         "DisplayName": "V Proposition 37",
         "ShortText": "There is nothing in Nature which is contrary to this intellectual love, or which can negate it",
         "group": 10, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "5P38",
         "DisplayName": "V Proposition 38",
         "ShortText": "The more objects the mind understands by the second and third kinds of knowledge, the less it suffers from those emotions which are evil, and the less it fears death",
         "group": 10, "InDegree": "4",
         "OutDegree": "1"
      },
      {
         "name": "5P39",
         "DisplayName": "V Proposition 39",
         "ShortText": "He who possess a body fit for many things possesses a mind of which the greater part is eternal",
         "group": 10, "InDegree": "7",
         "OutDegree": "0"
      },
      {
         "name": "5P40",
         "DisplayName": "V Proposition 40",
         "ShortText": "The more perfection a thing possesses, the more it acts and the less it suffers; and conversely, the more it acts, the more perfect it is",
         "group": 10, "InDegree": "2",
         "OutDegree": "1"
      },
      {
         "name": "5P40C01",
         "DisplayName": "V Proposition 40 Corollary 1",
         "ShortText": "That part of the mind which abides, whether great or small, is more perfect than the other part",
         "group": 10, "InDegree": "5",
         "OutDegree": "0"
      },
      {
         "name": "5P41",
         "DisplayName": "V Proposition 41",
         "ShortText": "Even if we did not know that our mind is eternal, we should still consider as of primary importance piety and religion and absolutely everything which in the Fourth Part we have shown to be related to strength of mind and generosity",
         "group": 10, "InDegree": "2",
         "OutDegree": "0"
      },
      {
         "name": "5P42",
         "DisplayName": "V Proposition 42",
         "ShortText": "Blessedness is not the reward of virtue but is virtue itself; nor do we delight in blessedness because we restrain our lusts, but, on the contrary, because we delight in it, therefore are we able to restrain them",
         "group": 10, "InDegree": "7",
         "OutDegree": "0"
      },
      {
         "name": "1P16C02",
         "DisplayName": "I Proposition 16 Corollary 2",
         "ShortText": "God is cause through Himself, and not through that which is contingent",
         "group": 2, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "1P16C03",
         "DisplayName": "I Proposition 16 Corollary 3",
         "ShortText": "God is absolutely the first cause",
         "group": 2, "InDegree": "1",
         "OutDegree": "0"
      },
      {
         "name": "4P37",
         "DisplayName": "IV Proposition 37",
         "ShortText": "The good which every one who follows after virtue seeks for himself he will desire for other men; and his desire on their behalf will be greater in proportion as he has greater knowledge of God",
         "group": 8, "InDegree": "6",
         "OutDegree": "12"
      }
   ],
  "links":
[
		{
        "source": "1A01",
        "target": "1P04",
		"value": 1
		},
      {
        "source": "1A01",
        "target": "1P06C01"
      ,"value": 1},
      {
        "source": "1A01",
        "target": "1P11"
      ,"value": 1},
      {
        "source": "1A01",
        "target": "1P14C02"
      ,"value": 1},
      {
        "source": "1A01",
        "target": "1P15"
      ,"value": 1},
      {
        "source": "1A01",
        "target": "1P28"
      ,"value": 1},
      {
        "source": "1A01",
        "target": "2P10"
      ,"value": 1},
      {
        "source": "1A01",
        "target": "4P31"
      ,"value": 1},
      {
        "source": "1A03",
        "target": "1P27"
      ,"value": 1},
      {
        "source": "1A03",
        "target": "5P33"
      ,"value": 1},
      {
        "source": "1A04",
        "target": "1P03"
      ,"value": 1},
      {
        "source": "1A04",
        "target": "1P06"
      ,"value": 1},
      {
        "source": "1A04",
        "target": "1P25"
      ,"value": 1},
      {
        "source": "1A04",
        "target": "2P05"
      ,"value": 1},
      {
        "source": "1A04",
        "target": "2P06"
      ,"value": 1},
      {
        "source": "1A04",
        "target": "2P07"
      ,"value": 1},
      {
        "source": "1A04",
        "target": "2P16"
      ,"value": 1},
      {
        "source": "1A04",
        "target": "2P45"
      ,"value": 1},
      {
        "source": "1A04",
        "target": "5P22"
      ,"value": 1},
      {
        "source": "1A05",
        "target": "1P03"
      ,"value": 1},
      {
        "source": "1A06",
        "target": "1P05"
      ,"value": 1},
      {
        "source": "1A06",
        "target": "1P30"
      ,"value": 1},
      {
        "source": "1A06",
        "target": "2P29"
      ,"value": 1},
      {
        "source": "1A06",
        "target": "2P32"
      ,"value": 1},
      {
        "source": "1A06",
        "target": "2P44"
      ,"value": 1},
      {
        "source": "1A06",
        "target": "2P44C02"
      ,"value": 1},
      {
        "source": "1A07",
        "target": "1P11"
      ,"value": 1},
      {
        "source": "1D01",
        "target": "1P07"
      ,"value": 1},
      {
        "source": "1D01",
        "target": "1P24"
      ,"value": 1},
      {
        "source": "1D01",
        "target": "5P35"
      ,"value": 1},
      {
        "source": "1D02",
        "target": "1P08"
      ,"value": 1},
      {
        "source": "1D02",
        "target": "1P21"
      ,"value": 1},
      {
        "source": "1D03",
        "target": "1P01"
      ,"value": 1},
      {
        "source": "1D03",
        "target": "1P02"
      ,"value": 1},
      {
        "source": "1D03",
        "target": "1P04"
      ,"value": 1},
      {
        "source": "1D03",
        "target": "1P05"
      ,"value": 1},
      {
        "source": "1D03",
        "target": "1P06"
      ,"value": 1},
      {
        "source": "1D03",
        "target": "1P06C01"
      ,"value": 1},
      {
        "source": "1D03",
        "target": "1P10"
      ,"value": 1},
      {
        "source": "1D03",
        "target": "1P15"
      ,"value": 1},
      {
        "source": "1D03",
        "target": "1P18"
      ,"value": 1},
      {
        "source": "1D03",
        "target": "1P28"
      ,"value": 1},
      {
        "source": "1D04",
        "target": "1P04"
      ,"value": 1},
      {
        "source": "1D04",
        "target": "1P09"
      ,"value": 1},
      {
        "source": "1D04",
        "target": "1P10"
      ,"value": 1},
      {
        "source": "1D04",
        "target": "1P12"
      ,"value": 1},
      {
        "source": "1D04",
        "target": "1P19"
      ,"value": 1},
      {
        "source": "1D04",
        "target": "1P20"
      ,"value": 1},
      {
        "source": "1D05",
        "target": "1P01"
      ,"value": 1},
      {
        "source": "1D05",
        "target": "1P04"
      ,"value": 1},
      {
        "source": "1D05",
        "target": "1P06C01"
      ,"value": 1},
      {
        "source": "1D05",
        "target": "1P15"
      ,"value": 1},
      {
        "source": "1D05",
        "target": "1P23"
      ,"value": 1},
      {
        "source": "1D05",
        "target": "1P25C01"
      ,"value": 1},
      {
        "source": "1D05",
        "target": "1P28"
      ,"value": 1},
      {
        "source": "1D05",
        "target": "1P31"
      ,"value": 1},
      {
        "source": "1D05",
        "target": "2P01"
      ,"value": 1},
      {
        "source": "1D05",
        "target": "2P02"
      ,"value": 1},
      {
        "source": "1D06",
        "target": "1P11"
      ,"value": 1},
      {
        "source": "1D06",
        "target": "1P14"
      ,"value": 1},
      {
        "source": "1D06",
        "target": "1P16"
      ,"value": 1},
      {
        "source": "1D06",
        "target": "1P19"
      ,"value": 1},
      {
        "source": "1D06",
        "target": "1P23"
      ,"value": 1},
      {
        "source": "1D06",
        "target": "1P31"
      ,"value": 1},
      {
        "source": "1D06",
        "target": "2P01"
      ,"value": 1},
      {
        "source": "1D06",
        "target": "2P02"
      ,"value": 1},
      {
        "source": "1D06",
        "target": "2P45"
      ,"value": 1},
      {
        "source": "1D06",
        "target": "4P28"
      ,"value": 1},
      {
        "source": "1D06",
        "target": "5P35"
      ,"value": 1},
      {
        "source": "1D07",
        "target": "1P17C02"
      ,"value": 1},
      {
        "source": "1D07",
        "target": "1P32"
      ,"value": 1},
      {
        "source": "1D07",
        "target": "3P49"
      ,"value": 1},
      {
        "source": "1D08",
        "target": "1P19"
      ,"value": 1},
      {
        "source": "1D08",
        "target": "1P20"
      ,"value": 1},
      {
        "source": "1D08",
        "target": "1P23"
      ,"value": 1},
      {
        "source": "1D08",
        "target": "5P29"
      ,"value": 1},
      {
        "source": "1D08",
        "target": "5P30"
      ,"value": 1},
      {
        "source": "1P01",
        "target": "1P05"
      ,"value": 1},
      {
        "source": "1P02",
        "target": "1P06"
      ,"value": 1},
      {
        "source": "1P02",
        "target": "1P11"
      ,"value": 1},
      {
        "source": "1P02",
        "target": "1P12"
      ,"value": 1},
      {
        "source": "1P03",
        "target": "1P06"
      ,"value": 1},
      {
        "source": "1P04",
        "target": "1P05"
      ,"value": 1},
      {
        "source": "1P05",
        "target": "1P06"
      ,"value": 1},
      {
        "source": "1P05",
        "target": "1P08"
      ,"value": 1},
      {
        "source": "1P05",
        "target": "1P12"
      ,"value": 1},
      {
        "source": "1P05",
        "target": "1P13"
      ,"value": 1},
      {
        "source": "1P05",
        "target": "1P14"
      ,"value": 1},
      {
        "source": "1P06",
        "target": "1P06C01"
      ,"value": 1},
      {
        "source": "1P06",
        "target": "1P12"
      ,"value": 1},
      {
        "source": "1P06",
        "target": "3P07"
      ,"value": 1},
      {
        "source": "1P06C01",
        "target": "1P07"
      ,"value": 1},
      {
        "source": "1P07",
        "target": "1P08"
      ,"value": 1},
      {
        "source": "1P07",
        "target": "1P11"
      ,"value": 1},
      {
        "source": "1P07",
        "target": "1P12"
      ,"value": 1},
      {
        "source": "1P07",
        "target": "1P19"
      ,"value": 1},
      {
        "source": "1P07",
        "target": "2P10"
      ,"value": 1},
      {
        "source": "1P08",
        "target": "1P12"
      ,"value": 1},
      {
        "source": "1P10",
        "target": "1P12"
      ,"value": 1},
      {
        "source": "1P10",
        "target": "1P14C01"
      ,"value": 1},
      {
        "source": "1P10",
        "target": "2P05"
      ,"value": 1},
      {
        "source": "1P10",
        "target": "2P06"
      ,"value": 1},
      {
        "source": "1P11",
        "target": "1P13"
      ,"value": 1},
      {
        "source": "1P11",
        "target": "1P14"
      ,"value": 1},
      {
        "source": "1P11",
        "target": "1P17C02"
      ,"value": 1},
      {
        "source": "1P11",
        "target": "1P19"
      ,"value": 1},
      {
        "source": "1P11",
        "target": "1P21"
      ,"value": 1},
      {
        "source": "1P11",
        "target": "1P29"
      ,"value": 1},
      {
        "source": "1P11",
        "target": "1P33"
      ,"value": 1},
      {
        "source": "1P11",
        "target": "1P34"
      ,"value": 1},
      {
        "source": "1P14",
        "target": "1P14C01"
      ,"value": 1},
      {
        "source": "1P14",
        "target": "1P14C02"
      ,"value": 1},
      {
        "source": "1P14",
        "target": "1P15"
      ,"value": 1},
      {
        "source": "1P14",
        "target": "1P18"
      ,"value": 1},
      {
        "source": "1P14C01",
        "target": "1P17C02"
      ,"value": 1},
      {
        "source": "1P14C01",
        "target": "1P24C01"
      ,"value": 1},
      {
        "source": "1P14C01",
        "target": "1P30"
      ,"value": 1},
      {
        "source": "1P14C01",
        "target": "1P33"
      ,"value": 1},
      {
        "source": "1P14C01",
        "target": "2P04"
      ,"value": 1},
      {
        "source": "1P15",
        "target": "1P17"
      ,"value": 1},
      {
        "source": "1P15",
        "target": "1P17C02"
      ,"value": 1},
      {
        "source": "1P15",
        "target": "1P18"
      ,"value": 1},
      {
        "source": "1P15",
        "target": "1P23"
      ,"value": 1},
      {
        "source": "1P15",
        "target": "1P25"
      ,"value": 1},
      {
        "source": "1P15",
        "target": "1P25C01"
      ,"value": 1},
      {
        "source": "1P15",
        "target": "1P29"
      ,"value": 1},
      {
        "source": "1P15",
        "target": "1P30"
      ,"value": 1},
      {
        "source": "1P15",
        "target": "1P31"
      ,"value": 1},
      {
        "source": "1P15",
        "target": "2P03"
      ,"value": 1},
      {
        "source": "1P15",
        "target": "2P10C01"
      ,"value": 1},
      {
        "source": "1P15",
        "target": "2P33"
      ,"value": 1},
      {
        "source": "1P15",
        "target": "2P36"
      ,"value": 1},
      {
        "source": "1P15",
        "target": "2P45"
      ,"value": 1},
      {
        "source": "1P15",
        "target": "4P28"
      ,"value": 1},
      {
        "source": "1P15",
        "target": "4P37"
      ,"value": 1},
      {
        "source": "1P15",
        "target": "5P14"
      ,"value": 1},
      {
        "source": "1P16",
        "target": "1P16C01"
      ,"value": 1},
      {
        "source": "1P16",
        "target": "1P16C02"
      ,"value": 1},
      {
        "source": "1P16",
        "target": "1P16C03"
      ,"value": 1},
      {
        "source": "1P16",
        "target": "1P17"
      ,"value": 1},
      {
        "source": "1P16",
        "target": "1P17C02"
      ,"value": 1},
      {
        "source": "1P16",
        "target": "1P26"
      ,"value": 1},
      {
        "source": "1P16",
        "target": "1P29"
      ,"value": 1},
      {
        "source": "1P16",
        "target": "1P33"
      ,"value": 1},
      {
        "source": "1P16",
        "target": "1P34"
      ,"value": 1},
      {
        "source": "1P16",
        "target": "1P36"
      ,"value": 1},
      {
        "source": "1P16",
        "target": "2P03"
      ,"value": 1},
      {
        "source": "1P16",
        "target": "2P44C02"
      ,"value": 1},
      {
        "source": "1P16",
        "target": "4P04"
      ,"value": 1},
      {
        "source": "1P16",
        "target": "5P22"
      ,"value": 1},
      {
        "source": "1P16C01",
        "target": "1P18"
      ,"value": 1},
      {
        "source": "1P16C01",
        "target": "1P34"
      ,"value": 1},
      {
        "source": "1P17",
        "target": "1P17C01"
      ,"value": 1},
      {
        "source": "1P17",
        "target": "1P17C02"
      ,"value": 1},
      {
        "source": "1P17C02",
        "target": "2P48"
      ,"value": 1},
      {
        "source": "1P19",
        "target": "1P20"
      ,"value": 1},
      {
        "source": "1P19",
        "target": "1P23"
      ,"value": 1},
      {
        "source": "1P20",
        "target": "1P20C01"
      ,"value": 1},
      {
        "source": "1P20",
        "target": "1P20C02"
      ,"value": 1},
      {
        "source": "1P20C02",
        "target": "1P21"
      ,"value": 1},
      {
        "source": "1P20C02",
        "target": "5P17"
      ,"value": 1},
      {
        "source": "1P21",
        "target": "1P22"
      ,"value": 1},
      {
        "source": "1P21",
        "target": "1P28"
      ,"value": 1},
      {
        "source": "1P21",
        "target": "1P29"
      ,"value": 1},
      {
        "source": "1P21",
        "target": "2P11"
      ,"value": 1},
      {
        "source": "1P21",
        "target": "2P30"
      ,"value": 1},
      {
        "source": "1P21",
        "target": "4P04"
      ,"value": 1},
      {
        "source": "1P22",
        "target": "1P28"
      ,"value": 1},
      {
        "source": "1P22",
        "target": "2P11"
      ,"value": 1},
      {
        "source": "1P23",
        "target": "1P32"
      ,"value": 1},
      {
        "source": "1P24",
        "target": "1P24C01"
      ,"value": 1},
      {
        "source": "1P24C01",
        "target": "1P28"
      ,"value": 1},
      {
        "source": "1P24C01",
        "target": "4P04"
      ,"value": 1},
      {
        "source": "1P25",
        "target": "1P25C01"
      ,"value": 1},
      {
        "source": "1P25",
        "target": "1P26"
      ,"value": 1},
      {
        "source": "1P25",
        "target": "5P22"
      ,"value": 1},
      {
        "source": "1P25C01",
        "target": "1P28"
      ,"value": 1},
      {
        "source": "1P25C01",
        "target": "1P36"
      ,"value": 1},
      {
        "source": "1P25C01",
        "target": "2P01"
      ,"value": 1},
      {
        "source": "1P25C01",
        "target": "2P02"
      ,"value": 1},
      {
        "source": "1P25C01",
        "target": "2P05"
      ,"value": 1},
      {
        "source": "1P25C01",
        "target": "2P10C01"
      ,"value": 1},
      {
        "source": "1P25C01",
        "target": "3P06"
      ,"value": 1},
      {
        "source": "1P25C01",
        "target": "5P24"
      ,"value": 1},
      {
        "source": "1P25C01",
        "target": "5P36"
      ,"value": 1},
      {
        "source": "1P26",
        "target": "1P28"
      ,"value": 1},
      {
        "source": "1P26",
        "target": "1P29"
      ,"value": 1},
      {
        "source": "1P27",
        "target": "1P29"
      ,"value": 1},
      {
        "source": "1P28",
        "target": "1P32"
      ,"value": 1},
      {
        "source": "1P28",
        "target": "2P09"
      ,"value": 1},
      {
        "source": "1P28",
        "target": "2P30"
      ,"value": 1},
      {
        "source": "1P28",
        "target": "2P31"
      ,"value": 1},
      {
        "source": "1P28",
        "target": "2P48"
      ,"value": 1},
      {
        "source": "1P28",
        "target": "4P29"
      ,"value": 1},
      {
        "source": "1P28",
        "target": "5P06"
      ,"value": 1},
      {
        "source": "1P29",
        "target": "1P31"
      ,"value": 1},
      {
        "source": "1P29",
        "target": "1P32C02"
      ,"value": 1},
      {
        "source": "1P29",
        "target": "1P33"
      ,"value": 1},
      {
        "source": "1P29",
        "target": "2P31C01"
      ,"value": 1},
      {
        "source": "1P29",
        "target": "2P44"
      ,"value": 1},
      {
        "source": "1P29",
        "target": "5P06"
      ,"value": 1},
      {
        "source": "1P30",
        "target": "2P04"
      ,"value": 1},
      {
        "source": "1P32",
        "target": "1P32C01"
      ,"value": 1},
      {
        "source": "1P32",
        "target": "1P32C02"
      ,"value": 1},
      {
        "source": "1P33",
        "target": "2P31C01"
      ,"value": 1},
      {
        "source": "1P33",
        "target": "4P11"
      ,"value": 1},
      {
        "source": "1P34",
        "target": "1P35"
      ,"value": 1},
      {
        "source": "1P34",
        "target": "1P36"
      ,"value": 1},
      {
        "source": "1P34",
        "target": "3P06"
      ,"value": 1},
      {
        "source": "1P34",
        "target": "4P04"
      ,"value": 1},
      {
        "source": "1P35",
        "target": "2P03"
      ,"value": 1},
      {
        "source": "1P36",
        "target": "2P13"
      ,"value": 1},
      {
        "source": "1P36",
        "target": "3P07"
      ,"value": 1},
      {
        "source": "2A01",
        "target": "2P11"
      ,"value": 1},
      {
        "source": "2A01",
        "target": "2P30"
      ,"value": 1},
      {
        "source": "2A02",
        "target": "2P11"
      ,"value": 1},
      {
        "source": "2A03",
        "target": "2P11"
      ,"value": 1},
      {
        "source": "2A03",
        "target": "2P49"
      ,"value": 1},
      {
        "source": "2A04",
        "target": "2P13"
      ,"value": 1},
      {
        "source": "2A05",
        "target": "2P13"
      ,"value": 1},
      {
        "source": "2A06",
        "target": "2P16"
      ,"value": 1},
      {
        "source": "2A06",
        "target": "2P24"
      ,"value": 1},
      {
        "source": "2A06",
        "target": "3P51"
      ,"value": 1},
      {
        "source": "2A06",
        "target": "3P57"
      ,"value": 1},
      {
        "source": "2A07",
        "target": "2P17C01"
      ,"value": 1},
      {
        "source": "2A07",
        "target": "5P04"
      ,"value": 1},
      {
        "source": "2D01",
        "target": "3P02"
      ,"value": 1},
      {
        "source": "2D02",
        "target": "2P10"
      ,"value": 1},
      {
        "source": "2D02",
        "target": "2P37"
      ,"value": 1},
      {
        "source": "2D02",
        "target": "2P49"
      ,"value": 1},
      {
        "source": "2D04",
        "target": "4P62"
      ,"value": 1},
      {
        "source": "2D04",
        "target": "5P17"
      ,"value": 1},
      {
        "source": "2D06",
        "target": "5P35"
      ,"value": 1},
      {
        "source": "2D06",
        "target": "5P40"
      ,"value": 1},
      {
        "source": "2D12",
        "target": "2P24"
      ,"value": 1},
      {
        "source": "2D12",
        "target": "4P39"
      ,"value": 1},
      {
        "source": "2O01",
        "target": "2P15"
      ,"value": 1},
      {
        "source": "2O01",
        "target": "2P24"
      ,"value": 1},
      {
        "source": "2O03",
        "target": "2P14"
      ,"value": 1},
      {
        "source": "2O03",
        "target": "2P28"
      ,"value": 1},
      {
        "source": "2O03",
        "target": "3P51"
      ,"value": 1},
      {
        "source": "2O03",
        "target": "4P39"
      ,"value": 1},
      {
        "source": "2O04",
        "target": "2P19"
      ,"value": 1},
      {
        "source": "2O04",
        "target": "4P39"
      ,"value": 1},
      {
        "source": "2O05",
        "target": "2P17C01"
      ,"value": 1},
      {
        "source": "2O06",
        "target": "2P14"
      ,"value": 1},
      {
        "source": "2O06",
        "target": "4P39"
      ,"value": 1},
      {
        "source": "2P01",
        "target": "2P03"
      ,"value": 1},
      {
        "source": "2P01",
        "target": "2P20"
      ,"value": 1},
      {
        "source": "2P03",
        "target": "2P05"
      ,"value": 1},
      {
        "source": "2P03",
        "target": "2P20"
      ,"value": 1},
      {
        "source": "2P03",
        "target": "2P24"
      ,"value": 1},
      {
        "source": "2P03",
        "target": "5P01"
      ,"value": 1},
      {
        "source": "2P03",
        "target": "5P22"
      ,"value": 1},
      {
        "source": "2P03",
        "target": "5P35"
      ,"value": 1},
      {
        "source": "2P06",
        "target": "2P06C01"
      ,"value": 1},
      {
        "source": "2P06",
        "target": "2P09"
      ,"value": 1},
      {
        "source": "2P06",
        "target": "2P36"
      ,"value": 1},
      {
        "source": "2P06",
        "target": "2P45"
      ,"value": 1},
      {
        "source": "2P06",
        "target": "3P02"
      ,"value": 1},
      {
        "source": "2P06",
        "target": "4P07"
      ,"value": 1},
      {
        "source": "2P06",
        "target": "4P29"
      ,"value": 1},
      {
        "source": "2P06C01",
        "target": "5P01"
      ,"value": 1},
      {
        "source": "2P07",
        "target": "2P07C01"
      ,"value": 1},
      {
        "source": "2P07",
        "target": "2P08"
      ,"value": 1},
      {
        "source": "2P07",
        "target": "2P09"
      ,"value": 1},
      {
        "source": "2P07",
        "target": "2P12"
      ,"value": 1},
      {
        "source": "2P07",
        "target": "2P15"
      ,"value": 1},
      {
        "source": "2P07",
        "target": "2P19"
      ,"value": 1},
      {
        "source": "2P07",
        "target": "2P20"
      ,"value": 1},
      {
        "source": "2P07",
        "target": "2P24"
      ,"value": 1},
      {
        "source": "2P07",
        "target": "2P25"
      ,"value": 1},
      {
        "source": "2P07",
        "target": "2P26"
      ,"value": 1},
      {
        "source": "2P07",
        "target": "2P36"
      ,"value": 1},
      {
        "source": "2P07",
        "target": "3P11"
      ,"value": 1},
      {
        "source": "2P07",
        "target": "3P12"
      ,"value": 1},
      {
        "source": "2P07",
        "target": "5P01"
      ,"value": 1},
      {
        "source": "2P07C01",
        "target": "2P32"
      ,"value": 1},
      {
        "source": "2P07C01",
        "target": "2P38"
      ,"value": 1},
      {
        "source": "2P07C01",
        "target": "2P39"
      ,"value": 1},
      {
        "source": "2P07C01",
        "target": "3P28"
      ,"value": 1},
      {
        "source": "2P07C01",
        "target": "5P01"
      ,"value": 1},
      {
        "source": "2P08",
        "target": "2P08C01"
      ,"value": 1},
      {
        "source": "2P08C01",
        "target": "2P09"
      ,"value": 1},
      {
        "source": "2P08C01",
        "target": "2P11"
      ,"value": 1},
      {
        "source": "2P08C01",
        "target": "2P15"
      ,"value": 1},
      {
        "source": "2P08C01",
        "target": "2P45"
      ,"value": 1},
      {
        "source": "2P08C01",
        "target": "5P21"
      ,"value": 1},
      {
        "source": "2P08C01",
        "target": "5P23"
      ,"value": 1},
      {
        "source": "2P09",
        "target": "2P09C01"
      ,"value": 1},
      {
        "source": "2P09",
        "target": "2P19"
      ,"value": 1},
      {
        "source": "2P09",
        "target": "2P20"
      ,"value": 1},
      {
        "source": "2P09",
        "target": "2P24"
      ,"value": 1},
      {
        "source": "2P09",
        "target": "2P25"
      ,"value": 1},
      {
        "source": "2P09",
        "target": "3P01"
      ,"value": 1},
      {
        "source": "2P09",
        "target": "3P10"
      ,"value": 1},
      {
        "source": "2P09C01",
        "target": "2P12"
      ,"value": 1},
      {
        "source": "2P09C01",
        "target": "2P13"
      ,"value": 1},
      {
        "source": "2P09C01",
        "target": "2P30"
      ,"value": 1},
      {
        "source": "2P10",
        "target": "2P10C01"
      ,"value": 1},
      {
        "source": "2P10C01",
        "target": "2P11"
      ,"value": 1},
      {
        "source": "2P10C01",
        "target": "4P29"
      ,"value": 1},
      {
        "source": "2P11",
        "target": "2P11C01"
      ,"value": 1},
      {
        "source": "2P11",
        "target": "2P12"
      ,"value": 1},
      {
        "source": "2P11",
        "target": "2P13"
      ,"value": 1},
      {
        "source": "2P11",
        "target": "2P20"
      ,"value": 1},
      {
        "source": "2P11",
        "target": "2P48"
      ,"value": 1},
      {
        "source": "2P11",
        "target": "3P02"
      ,"value": 1},
      {
        "source": "2P11",
        "target": "3P03"
      ,"value": 1},
      {
        "source": "2P11",
        "target": "3P10"
      ,"value": 1},
      {
        "source": "2P11",
        "target": "4P37"
      ,"value": 1},
      {
        "source": "2P11",
        "target": "5P09"
      ,"value": 1},
      {
        "source": "2P11",
        "target": "5P38"
      ,"value": 1},
      {
        "source": "2P11C01",
        "target": "2P12"
      ,"value": 1},
      {
        "source": "2P11C01",
        "target": "2P13"
      ,"value": 1},
      {
        "source": "2P11C01",
        "target": "2P19"
      ,"value": 1},
      {
        "source": "2P11C01",
        "target": "2P22"
      ,"value": 1},
      {
        "source": "2P11C01",
        "target": "2P23"
      ,"value": 1},
      {
        "source": "2P11C01",
        "target": "2P24"
      ,"value": 1},
      {
        "source": "2P11C01",
        "target": "2P30"
      ,"value": 1},
      {
        "source": "2P11C01",
        "target": "2P34"
      ,"value": 1},
      {
        "source": "2P11C01",
        "target": "2P38"
      ,"value": 1},
      {
        "source": "2P11C01",
        "target": "2P39"
      ,"value": 1},
      {
        "source": "2P11C01",
        "target": "2P40"
      ,"value": 1},
      {
        "source": "2P11C01",
        "target": "2P43"
      ,"value": 1},
      {
        "source": "2P11C01",
        "target": "3P01"
      ,"value": 1},
      {
        "source": "2P11C01",
        "target": "3P28"
      ,"value": 1},
      {
        "source": "2P11C01",
        "target": "5P36"
      ,"value": 1},
      {
        "source": "2P12",
        "target": "2P14"
      ,"value": 1},
      {
        "source": "2P12",
        "target": "2P17"
      ,"value": 1},
      {
        "source": "2P12",
        "target": "2P17C01"
      ,"value": 1},
      {
        "source": "2P12",
        "target": "2P19"
      ,"value": 1},
      {
        "source": "2P12",
        "target": "2P21"
      ,"value": 1},
      {
        "source": "2P12",
        "target": "2P22"
      ,"value": 1},
      {
        "source": "2P12",
        "target": "2P38"
      ,"value": 1},
      {
        "source": "2P12",
        "target": "4P07"
      ,"value": 1},
      {
        "source": "2P12",
        "target": "5P04"
      ,"value": 1},
      {
        "source": "2P13",
        "target": "2P13C01"
      ,"value": 1},
      {
        "source": "2P13",
        "target": "2P15"
      ,"value": 1},
      {
        "source": "2P13",
        "target": "2P19"
      ,"value": 1},
      {
        "source": "2P13",
        "target": "2P21"
      ,"value": 1},
      {
        "source": "2P13",
        "target": "2P23"
      ,"value": 1},
      {
        "source": "2P13",
        "target": "2P24"
      ,"value": 1},
      {
        "source": "2P13",
        "target": "2P26"
      ,"value": 1},
      {
        "source": "2P13",
        "target": "2P29"
      ,"value": 1},
      {
        "source": "2P13",
        "target": "2P38"
      ,"value": 1},
      {
        "source": "2P13",
        "target": "2P39"
      ,"value": 1},
      {
        "source": "2P13",
        "target": "3P03"
      ,"value": 1},
      {
        "source": "2P13",
        "target": "3P10"
      ,"value": 1},
      {
        "source": "2P13",
        "target": "5P23"
      ,"value": 1},
      {
        "source": "2P13",
        "target": "5P29"
      ,"value": 1},
      {
        "source": "2P14",
        "target": "3P11"
      ,"value": 1},
      {
        "source": "2P14",
        "target": "4P38"
      ,"value": 1},
      {
        "source": "2P15",
        "target": "3P03"
      ,"value": 1},
      {
        "source": "2P16",
        "target": "2P16C01"
      ,"value": 1},
      {
        "source": "2P16",
        "target": "2P16C02"
      ,"value": 1},
      {
        "source": "2P16",
        "target": "2P17"
      ,"value": 1},
      {
        "source": "2P16",
        "target": "2P19"
      ,"value": 1},
      {
        "source": "2P16",
        "target": "2P23"
      ,"value": 1},
      {
        "source": "2P16",
        "target": "2P25"
      ,"value": 1},
      {
        "source": "2P16",
        "target": "2P26"
      ,"value": 1},
      {
        "source": "2P16",
        "target": "2P27"
      ,"value": 1},
      {
        "source": "2P16",
        "target": "2P28"
      ,"value": 1},
      {
        "source": "2P16",
        "target": "2P38"
      ,"value": 1},
      {
        "source": "2P16",
        "target": "2P39"
      ,"value": 1},
      {
        "source": "2P16",
        "target": "3P27"
      ,"value": 1},
      {
        "source": "2P16",
        "target": "4P05"
      ,"value": 1},
      {
        "source": "2P16C01",
        "target": "2P26"
      ,"value": 1},
      {
        "source": "2P16C01",
        "target": "2P47"
      ,"value": 1},
      {
        "source": "2P16C02",
        "target": "2P17"
      ,"value": 1},
      {
        "source": "2P16C02",
        "target": "3P14"
      ,"value": 1},
      {
        "source": "2P16C02",
        "target": "3P18"
      ,"value": 1},
      {
        "source": "2P16C02",
        "target": "4P09"
      ,"value": 1},
      {
        "source": "2P16C02",
        "target": "5P34"
      ,"value": 1},
      {
        "source": "2P17",
        "target": "2P17C01"
      ,"value": 1},
      {
        "source": "2P17",
        "target": "2P19"
      ,"value": 1},
      {
        "source": "2P17",
        "target": "2P44C01"
      ,"value": 1},
      {
        "source": "2P17",
        "target": "2P47"
      ,"value": 1},
      {
        "source": "2P17",
        "target": "3P12"
      ,"value": 1},
      {
        "source": "2P17",
        "target": "3P13"
      ,"value": 1},
      {
        "source": "2P17",
        "target": "3P18"
      ,"value": 1},
      {
        "source": "2P17",
        "target": "3P19"
      ,"value": 1},
      {
        "source": "2P17",
        "target": "3P25"
      ,"value": 1},
      {
        "source": "2P17",
        "target": "3P27"
      ,"value": 1},
      {
        "source": "2P17",
        "target": "3P28"
      ,"value": 1},
      {
        "source": "2P17",
        "target": "3P56"
      ,"value": 1},
      {
        "source": "2P17",
        "target": "4P09"
      ,"value": 1},
      {
        "source": "2P17",
        "target": "4P13"
      ,"value": 1},
      {
        "source": "2P17",
        "target": "5P07"
      ,"value": 1},
      {
        "source": "2P17",
        "target": "5P21"
      ,"value": 1},
      {
        "source": "2P17",
        "target": "5P34"
      ,"value": 1},
      {
        "source": "2P17C01",
        "target": "2P18"
      ,"value": 1},
      {
        "source": "2P17C01",
        "target": "2P44C01"
      ,"value": 1},
      {
        "source": "2P17C01",
        "target": "3P18"
      ,"value": 1},
      {
        "source": "2P17C01",
        "target": "3P25"
      ,"value": 1},
      {
        "source": "2P18",
        "target": "3P14"
      ,"value": 1},
      {
        "source": "2P18",
        "target": "3P52"
      ,"value": 1},
      {
        "source": "2P18",
        "target": "4P13"
      ,"value": 1},
      {
        "source": "2P18",
        "target": "5P01"
      ,"value": 1},
      {
        "source": "2P18",
        "target": "5P12"
      ,"value": 1},
      {
        "source": "2P18",
        "target": "5P13"
      ,"value": 1},
      {
        "source": "2P18",
        "target": "5P21"
      ,"value": 1},
      {
        "source": "2P19",
        "target": "2P23"
      ,"value": 1},
      {
        "source": "2P19",
        "target": "2P29C01"
      ,"value": 1},
      {
        "source": "2P19",
        "target": "2P47"
      ,"value": 1},
      {
        "source": "2P19",
        "target": "3P30"
      ,"value": 1},
      {
        "source": "2P19",
        "target": "3P53"
      ,"value": 1},
      {
        "source": "2P20",
        "target": "2P22"
      ,"value": 1},
      {
        "source": "2P20",
        "target": "2P23"
      ,"value": 1},
      {
        "source": "2P20",
        "target": "2P43"
      ,"value": 1},
      {
        "source": "2P21",
        "target": "2P22"
      ,"value": 1},
      {
        "source": "2P21",
        "target": "4P08"
      ,"value": 1},
      {
        "source": "2P21",
        "target": "5P03"
      ,"value": 1},
      {
        "source": "2P22",
        "target": "2P23"
      ,"value": 1},
      {
        "source": "2P22",
        "target": "2P47"
      ,"value": 1},
      {
        "source": "2P22",
        "target": "4P08"
      ,"value": 1},
      {
        "source": "2P23",
        "target": "2P29C01"
      ,"value": 1},
      {
        "source": "2P23",
        "target": "2P47"
      ,"value": 1},
      {
        "source": "2P23",
        "target": "3P09"
      ,"value": 1},
      {
        "source": "2P23",
        "target": "3P30"
      ,"value": 1},
      {
        "source": "2P23",
        "target": "3P53"
      ,"value": 1},
      {
        "source": "2P24",
        "target": "2P28"
      ,"value": 1},
      {
        "source": "2P24",
        "target": "2P36"
      ,"value": 1},
      {
        "source": "2P25",
        "target": "2P27"
      ,"value": 1},
      {
        "source": "2P25",
        "target": "2P28"
      ,"value": 1},
      {
        "source": "2P25",
        "target": "2P29C01"
      ,"value": 1},
      {
        "source": "2P25",
        "target": "2P38"
      ,"value": 1},
      {
        "source": "2P26",
        "target": "2P26C01"
      ,"value": 1},
      {
        "source": "2P26",
        "target": "2P29C01"
      ,"value": 1},
      {
        "source": "2P26",
        "target": "5P21"
      ,"value": 1},
      {
        "source": "2P26",
        "target": "5P29"
      ,"value": 1},
      {
        "source": "2P27",
        "target": "2P29"
      ,"value": 1},
      {
        "source": "2P27",
        "target": "2P29C01"
      ,"value": 1},
      {
        "source": "2P27",
        "target": "2P38"
      ,"value": 1},
      {
        "source": "2P28",
        "target": "2P29C01"
      ,"value": 1},
      {
        "source": "2P28",
        "target": "2P36"
      ,"value": 1},
      {
        "source": "2P29",
        "target": "2P29C01"
      ,"value": 1},
      {
        "source": "2P29",
        "target": "4P64"
      ,"value": 1},
      {
        "source": "2P29C01",
        "target": "3P03"
      ,"value": 1},
      {
        "source": "2P31",
        "target": "2P31C01"
      ,"value": 1},
      {
        "source": "2P32",
        "target": "2P33"
      ,"value": 1},
      {
        "source": "2P32",
        "target": "2P34"
      ,"value": 1},
      {
        "source": "2P32",
        "target": "2P36"
      ,"value": 1},
      {
        "source": "2P32",
        "target": "4P01"
      ,"value": 1},
      {
        "source": "2P32",
        "target": "5P17"
      ,"value": 1},
      {
        "source": "2P33",
        "target": "2P35"
      ,"value": 1},
      {
        "source": "2P33",
        "target": "4P01"
      ,"value": 1},
      {
        "source": "2P34",
        "target": "2P41"
      ,"value": 1},
      {
        "source": "2P34",
        "target": "2P43"
      ,"value": 1},
      {
        "source": "2P35",
        "target": "2P41"
      ,"value": 1},
      {
        "source": "2P35",
        "target": "4P01"
      ,"value": 1},
      {
        "source": "2P35",
        "target": "5P05"
      ,"value": 1},
      {
        "source": "2P37",
        "target": "2P44C02"
      ,"value": 1},
      {
        "source": "2P38",
        "target": "2P38C01"
      ,"value": 1},
      {
        "source": "2P38",
        "target": "2P44C02"
      ,"value": 1},
      {
        "source": "2P38",
        "target": "2P46"
      ,"value": 1},
      {
        "source": "2P38",
        "target": "3P03"
      ,"value": 1},
      {
        "source": "2P38",
        "target": "5P04"
      ,"value": 1},
      {
        "source": "2P38",
        "target": "5P07"
      ,"value": 1},
      {
        "source": "2P39",
        "target": "2P39C01"
      ,"value": 1},
      {
        "source": "2P40",
        "target": "2P42"
      ,"value": 1},
      {
        "source": "2P40",
        "target": "3P01"
      ,"value": 1},
      {
        "source": "2P40",
        "target": "3P56"
      ,"value": 1},
      {
        "source": "2P40",
        "target": "3P58"
      ,"value": 1},
      {
        "source": "2P40",
        "target": "4P26"
      ,"value": 1},
      {
        "source": "2P40",
        "target": "4P27"
      ,"value": 1},
      {
        "source": "2P40",
        "target": "4P52"
      ,"value": 1},
      {
        "source": "2P40",
        "target": "5P07"
      ,"value": 1},
      {
        "source": "2P40",
        "target": "5P10"
      ,"value": 1},
      {
        "source": "2P40",
        "target": "5P12"
      ,"value": 1},
      {
        "source": "2P40",
        "target": "5P25"
      ,"value": 1},
      {
        "source": "2P40",
        "target": "5P28"
      ,"value": 1},
      {
        "source": "2P40",
        "target": "5P31"
      ,"value": 1},
      {
        "source": "2P41",
        "target": "2P44"
      ,"value": 1},
      {
        "source": "2P41",
        "target": "2P44C02"
      ,"value": 1},
      {
        "source": "2P41",
        "target": "4P27"
      ,"value": 1},
      {
        "source": "2P41",
        "target": "4P35"
      ,"value": 1},
      {
        "source": "2P41",
        "target": "4P62"
      ,"value": 1},
      {
        "source": "2P43",
        "target": "3P58"
      ,"value": 1},
      {
        "source": "2P43",
        "target": "4P27"
      ,"value": 1},
      {
        "source": "2P43",
        "target": "4P52"
      ,"value": 1},
      {
        "source": "2P43",
        "target": "4P56"
      ,"value": 1},
      {
        "source": "2P43",
        "target": "4P62"
      ,"value": 1},
      {
        "source": "2P43",
        "target": "5P27"
      ,"value": 1},
      {
        "source": "2P44",
        "target": "2P44C01"
      ,"value": 1},
      {
        "source": "2P44",
        "target": "2P44C02"
      ,"value": 1},
      {
        "source": "2P44",
        "target": "3P18"
      ,"value": 1},
      {
        "source": "2P44C02",
        "target": "4P62"
      ,"value": 1},
      {
        "source": "2P44C02",
        "target": "5P29"
      ,"value": 1},
      {
        "source": "2P45",
        "target": "2P46"
      ,"value": 1},
      {
        "source": "2P45",
        "target": "2P47"
      ,"value": 1},
      {
        "source": "2P46",
        "target": "2P47"
      ,"value": 1},
      {
        "source": "2P46",
        "target": "5P18"
      ,"value": 1},
      {
        "source": "2P46",
        "target": "5P31"
      ,"value": 1},
      {
        "source": "2P47",
        "target": "4P36"
      ,"value": 1},
      {
        "source": "2P47",
        "target": "4P37"
      ,"value": 1},
      {
        "source": "2P47",
        "target": "5P10"
      ,"value": 1},
      {
        "source": "2P47",
        "target": "5P18"
      ,"value": 1},
      {
        "source": "2P48",
        "target": "2P49"
      ,"value": 1},
      {
        "source": "2P48",
        "target": "2P49C01"
      ,"value": 1},
      {
        "source": "2P49",
        "target": "2P49C01"
      ,"value": 1},
      {
        "source": "3D01",
        "target": "3P01"
      ,"value": 1},
      {
        "source": "3D01",
        "target": "4P02"
      ,"value": 1},
      {
        "source": "3D01",
        "target": "4P05"
      ,"value": 1},
      {
        "source": "3D01",
        "target": "4P15"
      ,"value": 1},
      {
        "source": "3D01",
        "target": "4P18"
      ,"value": 1},
      {
        "source": "3D01",
        "target": "4P19"
      ,"value": 1},
      {
        "source": "3D01",
        "target": "4P23"
      ,"value": 1},
      {
        "source": "3D01",
        "target": "4P33"
      ,"value": 1},
      {
        "source": "3D01",
        "target": "5P31"
      ,"value": 1},
      {
        "source": "3D02",
        "target": "3P01"
      ,"value": 1},
      {
        "source": "3D02",
        "target": "4P02"
      ,"value": 1},
      {
        "source": "3D02",
        "target": "4P05"
      ,"value": 1},
      {
        "source": "3D02",
        "target": "4P15"
      ,"value": 1},
      {
        "source": "3D02",
        "target": "4P23"
      ,"value": 1},
      {
        "source": "3D02",
        "target": "4P33"
      ,"value": 1},
      {
        "source": "3D02",
        "target": "4P35"
      ,"value": 1},
      {
        "source": "3D02",
        "target": "4P35C01"
      ,"value": 1},
      {
        "source": "3D02",
        "target": "4P52"
      ,"value": 1},
      {
        "source": "3D02",
        "target": "4P61"
      ,"value": 1},
      {
        "source": "3D02",
        "target": "4P64"
      ,"value": 1},
      {
        "source": "3D03",
        "target": "3P14"
      ,"value": 1},
      {
        "source": "3D03",
        "target": "4P07"
      ,"value": 1},
      {
        "source": "3D03",
        "target": "4P09"
      ,"value": 1},
      {
        "source": "3E01",
        "target": "4P37"
      ,"value": 1},
      {
        "source": "3E01",
        "target": "4P59"
      ,"value": 1},
      {
        "source": "3E01",
        "target": "4P61"
      ,"value": 1},
      {
        "source": "3E01",
        "target": "5P26"
      ,"value": 1},
      {
        "source": "3E01",
        "target": "5P28"
      ,"value": 1},
      {
        "source": "3E02",
        "target": "5P17"
      ,"value": 1},
      {
        "source": "3E02",
        "target": "5P27"
      ,"value": 1},
      {
        "source": "3E03",
        "target": "4P64"
      ,"value": 1},
      {
        "source": "3E03",
        "target": "5P17"
      ,"value": 1},
      {
        "source": "3E04",
        "target": "4P59"
      ,"value": 1},
      {
        "source": "3E06",
        "target": "4P44"
      ,"value": 1},
      {
        "source": "3E06",
        "target": "5P02"
      ,"value": 1},
      {
        "source": "3E06",
        "target": "5P15"
      ,"value": 1},
      {
        "source": "3E06",
        "target": "5P32C01"
      ,"value": 1},
      {
        "source": "3E07",
        "target": "4P34"
      ,"value": 1},
      {
        "source": "3E07",
        "target": "5P02"
      ,"value": 1},
      {
        "source": "3E07",
        "target": "5P18"
      ,"value": 1},
      {
        "source": "3E12",
        "target": "4P47"
      ,"value": 1},
      {
        "source": "3E13",
        "target": "4P47"
      ,"value": 1},
      {
        "source": "3E13",
        "target": "4P63"
      ,"value": 1},
      {
        "source": "3E18",
        "target": "4P50"
      ,"value": 1},
      {
        "source": "3E19",
        "target": "4P51"
      ,"value": 1},
      {
        "source": "3E21",
        "target": "4P48"
      ,"value": 1},
      {
        "source": "3E22",
        "target": "4P48"
      ,"value": 1},
      {
        "source": "3E23",
        "target": "3P20"
      ,"value": 1},
      {
        "source": "3E23",
        "target": "5P20"
      ,"value": 1},
      {
        "source": "3E25",
        "target": "4P52"
      ,"value": 1},
      {
        "source": "3E25",
        "target": "5P32"
      ,"value": 1},
      {
        "source": "3E26",
        "target": "4P53"
      ,"value": 1},
      {
        "source": "3E27",
        "target": "4P54"
      ,"value": 1},
      {
        "source": "3E28",
        "target": "4P49"
      ,"value": 1},
      {
        "source": "3E28",
        "target": "4P55"
      ,"value": 1},
      {
        "source": "3E28",
        "target": "4P57"
      ,"value": 1},
      {
        "source": "3E29",
        "target": "4P55"
      ,"value": 1},
      {
        "source": "3E30",
        "target": "4P49"
      ,"value": 1},
      {
        "source": "3E30",
        "target": "4P58"
      ,"value": 1},
      {
        "source": "3E30",
        "target": "4P68"
      ,"value": 1},
      {
        "source": "3E34",
        "target": "4P71"
      ,"value": 1},
      {
        "source": "3E40",
        "target": "4P69"
      ,"value": 1},
      {
        "source": "3E41",
        "target": "4P69"
      ,"value": 1},
      {
        "source": "3O01",
        "target": "3P12"
      ,"value": 1},
      {
        "source": "3O01",
        "target": "3P15"
      ,"value": 1},
      {
        "source": "3P01",
        "target": "3P01C01"
      ,"value": 1},
      {
        "source": "3P01",
        "target": "3P03"
      ,"value": 1},
      {
        "source": "3P01",
        "target": "3P56"
      ,"value": 1},
      {
        "source": "3P01",
        "target": "3P58"
      ,"value": 1},
      {
        "source": "3P01",
        "target": "3P59"
      ,"value": 1},
      {
        "source": "3P01",
        "target": "4P15"
      ,"value": 1},
      {
        "source": "3P01",
        "target": "4P21"
      ,"value": 1},
      {
        "source": "3P01",
        "target": "4P23"
      ,"value": 1},
      {
        "source": "3P01",
        "target": "4P28"
      ,"value": 1},
      {
        "source": "3P03",
        "target": "3P09"
      ,"value": 1},
      {
        "source": "3P03",
        "target": "3P56"
      ,"value": 1},
      {
        "source": "3P03",
        "target": "4P24"
      ,"value": 1},
      {
        "source": "3P03",
        "target": "4P28"
      ,"value": 1},
      {
        "source": "3P03",
        "target": "4P32"
      ,"value": 1},
      {
        "source": "3P03",
        "target": "4P35"
      ,"value": 1},
      {
        "source": "3P03",
        "target": "4P35C02"
      ,"value": 1},
      {
        "source": "3P03",
        "target": "4P51"
      ,"value": 1},
      {
        "source": "3P03",
        "target": "4P52"
      ,"value": 1},
      {
        "source": "3P03",
        "target": "4P59"
      ,"value": 1},
      {
        "source": "3P03",
        "target": "4P61"
      ,"value": 1},
      {
        "source": "3P03",
        "target": "4P63"
      ,"value": 1},
      {
        "source": "3P03",
        "target": "4P64"
      ,"value": 1},
      {
        "source": "3P03",
        "target": "5P03"
      ,"value": 1},
      {
        "source": "3P03",
        "target": "5P18"
      ,"value": 1},
      {
        "source": "3P03",
        "target": "5P36"
      ,"value": 1},
      {
        "source": "3P03",
        "target": "5P40"
      ,"value": 1},
      {
        "source": "3P03",
        "target": "5P40C01"
      ,"value": 1},
      {
        "source": "3P03",
        "target": "5P42"
      ,"value": 1},
      {
        "source": "3P04",
        "target": "3P05"
      ,"value": 1},
      {
        "source": "3P04",
        "target": "3P06"
      ,"value": 1},
      {
        "source": "3P04",
        "target": "3P08"
      ,"value": 1},
      {
        "source": "3P04",
        "target": "4P01"
      ,"value": 1},
      {
        "source": "3P04",
        "target": "4P04"
      ,"value": 1},
      {
        "source": "3P04",
        "target": "4P20"
      ,"value": 1},
      {
        "source": "3P04",
        "target": "4P30"
      ,"value": 1},
      {
        "source": "3P05",
        "target": "3P06"
      ,"value": 1},
      {
        "source": "3P05",
        "target": "3P10"
      ,"value": 1},
      {
        "source": "3P05",
        "target": "3P37"
      ,"value": 1},
      {
        "source": "3P05",
        "target": "4P07"
      ,"value": 1},
      {
        "source": "3P05",
        "target": "4P30"
      ,"value": 1},
      {
        "source": "3P06",
        "target": "3P07"
      ,"value": 1},
      {
        "source": "3P06",
        "target": "3P12"
      ,"value": 1},
      {
        "source": "3P06",
        "target": "4P04"
      ,"value": 1},
      {
        "source": "3P06",
        "target": "4P20"
      ,"value": 1},
      {
        "source": "3P06",
        "target": "4P25"
      ,"value": 1},
      {
        "source": "3P06",
        "target": "4P26"
      ,"value": 1},
      {
        "source": "3P06",
        "target": "4P31"
      ,"value": 1},
      {
        "source": "3P06",
        "target": "4P60"
      ,"value": 1},
      {
        "source": "3P06",
        "target": "4P64"
      ,"value": 1},
      {
        "source": "3P07",
        "target": "3P09"
      ,"value": 1},
      {
        "source": "3P07",
        "target": "3P10"
      ,"value": 1},
      {
        "source": "3P07",
        "target": "3P37"
      ,"value": 1},
      {
        "source": "3P07",
        "target": "3P54"
      ,"value": 1},
      {
        "source": "3P07",
        "target": "4P04"
      ,"value": 1},
      {
        "source": "3P07",
        "target": "4P05"
      ,"value": 1},
      {
        "source": "3P07",
        "target": "4P08"
      ,"value": 1},
      {
        "source": "3P07",
        "target": "4P15"
      ,"value": 1},
      {
        "source": "3P07",
        "target": "4P18"
      ,"value": 1},
      {
        "source": "3P07",
        "target": "4P20"
      ,"value": 1},
      {
        "source": "3P07",
        "target": "4P21"
      ,"value": 1},
      {
        "source": "3P07",
        "target": "4P22"
      ,"value": 1},
      {
        "source": "3P07",
        "target": "4P25"
      ,"value": 1},
      {
        "source": "3P07",
        "target": "4P26"
      ,"value": 1},
      {
        "source": "3P07",
        "target": "4P32"
      ,"value": 1},
      {
        "source": "3P07",
        "target": "4P33"
      ,"value": 1},
      {
        "source": "3P07",
        "target": "4P60"
      ,"value": 1},
      {
        "source": "3P07",
        "target": "4P64"
      ,"value": 1},
      {
        "source": "3P07",
        "target": "5P08"
      ,"value": 1},
      {
        "source": "3P07",
        "target": "5P09"
      ,"value": 1},
      {
        "source": "3P07",
        "target": "5P25"
      ,"value": 1},
      {
        "source": "3P08",
        "target": "3P09"
      ,"value": 1},
      {
        "source": "3P09",
        "target": "3P12"
      ,"value": 1},
      {
        "source": "3P09",
        "target": "3P13"
      ,"value": 1},
      {
        "source": "3P09",
        "target": "3P27C03"
      ,"value": 1},
      {
        "source": "3P09",
        "target": "3P28"
      ,"value": 1},
      {
        "source": "3P09",
        "target": "3P37"
      ,"value": 1},
      {
        "source": "3P09",
        "target": "3P55C01"
      ,"value": 1},
      {
        "source": "3P09",
        "target": "3P55C02"
      ,"value": 1},
      {
        "source": "3P09",
        "target": "3P56"
      ,"value": 1},
      {
        "source": "3P09",
        "target": "3P57"
      ,"value": 1},
      {
        "source": "3P09",
        "target": "3P58"
      ,"value": 1},
      {
        "source": "3P09",
        "target": "4P19"
      ,"value": 1},
      {
        "source": "3P09",
        "target": "4P26"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "3P12"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "3P15"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "3P15C01"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "3P19"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "3P20"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "3P21"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "3P23"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "3P34"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "3P35"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "3P37"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "3P38"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "3P53"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "3P55"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "3P55C01"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "3P55C02"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "3P56"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "3P57"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "3P59"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "4P08"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "4P18"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "4P29"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "4P30"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "4P41"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "4P42"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "4P43"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "4P44"
      ,"value": 1},
      {
        "source": "3P11",
        "target": "4P51"
      ,"value": 1},
      {
        "source": "3P12",
        "target": "3P15C01"
      ,"value": 1},
      {
        "source": "3P12",
        "target": "3P19"
      ,"value": 1},
      {
        "source": "3P12",
        "target": "3P25"
      ,"value": 1},
      {
        "source": "3P12",
        "target": "3P28"
      ,"value": 1},
      {
        "source": "3P12",
        "target": "3P33"
      ,"value": 1},
      {
        "source": "3P12",
        "target": "3P42"
      ,"value": 1},
      {
        "source": "3P12",
        "target": "4P60"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P13C01"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P15C01"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P17"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P19"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P20"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P22"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P23"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P24"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P25"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P27C03"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P28"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P29"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P33"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P34"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P35"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P38"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P39"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P40"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P44"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P45"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P48"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P49"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P55C01"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "3P55C02"
      ,"value": 1},
      {
        "source": "3P13",
        "target": "4P57"
      ,"value": 1},
      {
        "source": "3P13C01",
        "target": "3P15C01"
      ,"value": 1},
      {
        "source": "3P13C01",
        "target": "3P38"
      ,"value": 1},
      {
        "source": "3P14",
        "target": "3P15C01"
      ,"value": 1},
      {
        "source": "3P14",
        "target": "3P16"
      ,"value": 1},
      {
        "source": "3P15",
        "target": "3P15C01"
      ,"value": 1},
      {
        "source": "3P15",
        "target": "3P16"
      ,"value": 1},
      {
        "source": "3P15",
        "target": "3P36"
      ,"value": 1},
      {
        "source": "3P15",
        "target": "3P50"
      ,"value": 1},
      {
        "source": "3P15C01",
        "target": "3P16"
      ,"value": 1},
      {
        "source": "3P15C01",
        "target": "3P35"
      ,"value": 1},
      {
        "source": "3P16",
        "target": "3P17"
      ,"value": 1},
      {
        "source": "3P16",
        "target": "3P46"
      ,"value": 1},
      {
        "source": "3P16",
        "target": "4P34"
      ,"value": 1},
      {
        "source": "3P17",
        "target": "3P31"
      ,"value": 1},
      {
        "source": "3P18",
        "target": "3P50"
      ,"value": 1},
      {
        "source": "3P18",
        "target": "4P12"
      ,"value": 1},
      {
        "source": "3P19",
        "target": "3P21"
      ,"value": 1},
      {
        "source": "3P19",
        "target": "3P36C01"
      ,"value": 1},
      {
        "source": "3P19",
        "target": "3P42"
      ,"value": 1},
      {
        "source": "3P19",
        "target": "5P19"
      ,"value": 1},
      {
        "source": "3P20",
        "target": "3P23"
      ,"value": 1},
      {
        "source": "3P20",
        "target": "3P28"
      ,"value": 1},
      {
        "source": "3P21",
        "target": "3P22"
      ,"value": 1},
      {
        "source": "3P21",
        "target": "3P24"
      ,"value": 1},
      {
        "source": "3P21",
        "target": "3P25"
      ,"value": 1},
      {
        "source": "3P21",
        "target": "3P38"
      ,"value": 1},
      {
        "source": "3P21",
        "target": "3P45"
      ,"value": 1},
      {
        "source": "3P22",
        "target": "3P27C03"
      ,"value": 1},
      {
        "source": "3P23",
        "target": "3P26"
      ,"value": 1},
      {
        "source": "3P23",
        "target": "3P35"
      ,"value": 1},
      {
        "source": "3P23",
        "target": "3P38"
      ,"value": 1},
      {
        "source": "3P24",
        "target": "3P55C02"
      ,"value": 1},
      {
        "source": "3P25",
        "target": "4P49"
      ,"value": 1},
      {
        "source": "3P26",
        "target": "3P40C02"
      ,"value": 1},
      {
        "source": "3P26",
        "target": "3P43"
      ,"value": 1},
      {
        "source": "3P27",
        "target": "3P27C01"
      ,"value": 1},
      {
        "source": "3P27",
        "target": "3P27C02"
      ,"value": 1},
      {
        "source": "3P27",
        "target": "3P27C03"
      ,"value": 1},
      {
        "source": "3P27",
        "target": "3P29"
      ,"value": 1},
      {
        "source": "3P27",
        "target": "3P30"
      ,"value": 1},
      {
        "source": "3P27",
        "target": "3P31"
      ,"value": 1},
      {
        "source": "3P27",
        "target": "3P40"
      ,"value": 1},
      {
        "source": "3P27",
        "target": "3P47"
      ,"value": 1},
      {
        "source": "3P27",
        "target": "3P53C01"
      ,"value": 1},
      {
        "source": "3P27C01",
        "target": "3P32"
      ,"value": 1},
      {
        "source": "3P27C03",
        "target": "4P50"
      ,"value": 1},
      {
        "source": "3P28",
        "target": "3P31C01"
      ,"value": 1},
      {
        "source": "3P28",
        "target": "3P32"
      ,"value": 1},
      {
        "source": "3P28",
        "target": "3P35"
      ,"value": 1},
      {
        "source": "3P28",
        "target": "3P36"
      ,"value": 1},
      {
        "source": "3P28",
        "target": "3P38"
      ,"value": 1},
      {
        "source": "3P28",
        "target": "3P39"
      ,"value": 1},
      {
        "source": "3P28",
        "target": "4P19"
      ,"value": 1},
      {
        "source": "3P28",
        "target": "5P19"
      ,"value": 1},
      {
        "source": "3P29",
        "target": "3P31C01"
      ,"value": 1},
      {
        "source": "3P29",
        "target": "3P33"
      ,"value": 1},
      {
        "source": "3P29",
        "target": "3P43"
      ,"value": 1},
      {
        "source": "3P29",
        "target": "3P53C01"
      ,"value": 1},
      {
        "source": "3P30",
        "target": "3P34"
      ,"value": 1},
      {
        "source": "3P30",
        "target": "3P35"
      ,"value": 1},
      {
        "source": "3P30",
        "target": "3P42"
      ,"value": 1},
      {
        "source": "3P30",
        "target": "3P43"
      ,"value": 1},
      {
        "source": "3P31",
        "target": "3P31C01"
      ,"value": 1},
      {
        "source": "3P31",
        "target": "3P35"
      ,"value": 1},
      {
        "source": "3P31",
        "target": "4P37"
      ,"value": 1},
      {
        "source": "3P31",
        "target": "5P20"
      ,"value": 1},
      {
        "source": "3P31C01",
        "target": "4P37"
      ,"value": 1},
      {
        "source": "3P32",
        "target": "4P34"
      ,"value": 1},
      {
        "source": "3P33",
        "target": "3P34"
      ,"value": 1},
      {
        "source": "3P33",
        "target": "3P38"
      ,"value": 1},
      {
        "source": "3P33",
        "target": "3P42"
      ,"value": 1},
      {
        "source": "3P34",
        "target": "3P35"
      ,"value": 1},
      {
        "source": "3P34",
        "target": "3P42"
      ,"value": 1},
      {
        "source": "3P35",
        "target": "5P20"
      ,"value": 1},
      {
        "source": "3P36",
        "target": "3P36C01"
      ,"value": 1},
      {
        "source": "3P37",
        "target": "3P38"
      ,"value": 1},
      {
        "source": "3P37",
        "target": "3P39"
      ,"value": 1},
      {
        "source": "3P37",
        "target": "3P43"
      ,"value": 1},
      {
        "source": "3P37",
        "target": "3P44"
      ,"value": 1},
      {
        "source": "3P37",
        "target": "4P15"
      ,"value": 1},
      {
        "source": "3P37",
        "target": "4P37"
      ,"value": 1},
      {
        "source": "3P37",
        "target": "4P44"
      ,"value": 1},
      {
        "source": "3P38",
        "target": "3P44"
      ,"value": 1},
      {
        "source": "3P39",
        "target": "3P40C02"
      ,"value": 1},
      {
        "source": "3P39",
        "target": "4P34"
      ,"value": 1},
      {
        "source": "3P39",
        "target": "4P45"
      ,"value": 1},
      {
        "source": "3P39",
        "target": "4P45C01"
      ,"value": 1},
      {
        "source": "3P39",
        "target": "4P70"
      ,"value": 1},
      {
        "source": "3P40",
        "target": "3P40C01"
      ,"value": 1},
      {
        "source": "3P40",
        "target": "3P41"
      ,"value": 1},
      {
        "source": "3P40",
        "target": "3P43"
      ,"value": 1},
      {
        "source": "3P40",
        "target": "3P45"
      ,"value": 1},
      {
        "source": "3P40",
        "target": "4P34"
      ,"value": 1},
      {
        "source": "3P41",
        "target": "3P41C01"
      ,"value": 1},
      {
        "source": "3P41",
        "target": "3P43"
      ,"value": 1},
      {
        "source": "3P41",
        "target": "4P49"
      ,"value": 1},
      {
        "source": "3P42",
        "target": "4P70"
      ,"value": 1},
      {
        "source": "3P43",
        "target": "4P46"
      ,"value": 1},
      {
        "source": "3P44",
        "target": "4P46"
      ,"value": 1},
      {
        "source": "3P48",
        "target": "3P49"
      ,"value": 1},
      {
        "source": "3P48",
        "target": "5P06"
      ,"value": 1},
      {
        "source": "3P48",
        "target": "5P09"
      ,"value": 1},
      {
        "source": "3P49",
        "target": "5P05"
      ,"value": 1},
      {
        "source": "3P51",
        "target": "4P33"
      ,"value": 1},
      {
        "source": "3P53",
        "target": "3P53C01"
      ,"value": 1},
      {
        "source": "3P53",
        "target": "3P55C01"
      ,"value": 1},
      {
        "source": "3P53",
        "target": "3P58"
      ,"value": 1},
      {
        "source": "3P53",
        "target": "5P15"
      ,"value": 1},
      {
        "source": "3P54",
        "target": "3P55"
      ,"value": 1},
      {
        "source": "3P55",
        "target": "3P55C01"
      ,"value": 1},
      {
        "source": "3P55",
        "target": "4P34"
      ,"value": 1},
      {
        "source": "3P55",
        "target": "4P53"
      ,"value": 1},
      {
        "source": "3P55",
        "target": "4P54"
      ,"value": 1},
      {
        "source": "3P56",
        "target": "4P33"
      ,"value": 1},
      {
        "source": "3P58",
        "target": "3P59"
      ,"value": 1},
      {
        "source": "3P59",
        "target": "4P34"
      ,"value": 1},
      {
        "source": "3P59",
        "target": "4P46"
      ,"value": 1},
      {
        "source": "3P59",
        "target": "4P51"
      ,"value": 1},
      {
        "source": "3P59",
        "target": "4P63"
      ,"value": 1},
      {
        "source": "3P59",
        "target": "4P69"
      ,"value": 1},
      {
        "source": "3P59",
        "target": "5P18"
      ,"value": 1},
      {
        "source": "3P59",
        "target": "5P42"
      ,"value": 1},
      {
        "source": "4A01",
        "target": "4P03"
      ,"value": 1},
      {
        "source": "4A01",
        "target": "4P07"
      ,"value": 1},
      {
        "source": "4D01",
        "target": "4P08"
      ,"value": 1},
      {
        "source": "4D01",
        "target": "4P26"
      ,"value": 1},
      {
        "source": "4D01",
        "target": "4P28"
      ,"value": 1},
      {
        "source": "4D01",
        "target": "4P31"
      ,"value": 1},
      {
        "source": "4D02",
        "target": "4P08"
      ,"value": 1},
      {
        "source": "4D03",
        "target": "4P12"
      ,"value": 1},
      {
        "source": "4D03",
        "target": "4P13"
      ,"value": 1},
      {
        "source": "4D04",
        "target": "4P12"
      ,"value": 1},
      {
        "source": "4D08",
        "target": "4P20"
      ,"value": 1},
      {
        "source": "4D08",
        "target": "4P22"
      ,"value": 1},
      {
        "source": "4D08",
        "target": "4P23"
      ,"value": 1},
      {
        "source": "4D08",
        "target": "4P24"
      ,"value": 1},
      {
        "source": "4D08",
        "target": "4P35C02"
      ,"value": 1},
      {
        "source": "4D08",
        "target": "4P56"
      ,"value": 1},
      {
        "source": "4D08",
        "target": "5P25"
      ,"value": 1},
      {
        "source": "4D08",
        "target": "5P42"
      ,"value": 1},
      {
        "source": "4P01",
        "target": "4P14"
      ,"value": 1},
      {
        "source": "4P03",
        "target": "4P06"
      ,"value": 1},
      {
        "source": "4P03",
        "target": "4P15"
      ,"value": 1},
      {
        "source": "4P03",
        "target": "4P43"
      ,"value": 1},
      {
        "source": "4P03",
        "target": "4P69"
      ,"value": 1},
      {
        "source": "4P04",
        "target": "4P04C01"
      ,"value": 1},
      {
        "source": "4P05",
        "target": "4P06"
      ,"value": 1},
      {
        "source": "4P05",
        "target": "4P07"
      ,"value": 1},
      {
        "source": "4P05",
        "target": "4P15"
      ,"value": 1},
      {
        "source": "4P05",
        "target": "4P43"
      ,"value": 1},
      {
        "source": "4P05",
        "target": "4P69"
      ,"value": 1},
      {
        "source": "4P05",
        "target": "5P08"
      ,"value": 1},
      {
        "source": "4P06",
        "target": "4P43"
      ,"value": 1},
      {
        "source": "4P06",
        "target": "4P44"
      ,"value": 1},
      {
        "source": "4P06",
        "target": "4P60"
      ,"value": 1},
      {
        "source": "4P06",
        "target": "5P07"
      ,"value": 1},
      {
        "source": "4P07",
        "target": "4P07C01"
      ,"value": 1},
      {
        "source": "4P07",
        "target": "4P14"
      ,"value": 1},
      {
        "source": "4P07",
        "target": "4P15"
      ,"value": 1},
      {
        "source": "4P07",
        "target": "4P69"
      ,"value": 1},
      {
        "source": "4P08",
        "target": "4P14"
      ,"value": 1},
      {
        "source": "4P08",
        "target": "4P15"
      ,"value": 1},
      {
        "source": "4P08",
        "target": "4P19"
      ,"value": 1},
      {
        "source": "4P08",
        "target": "4P29"
      ,"value": 1},
      {
        "source": "4P08",
        "target": "4P30"
      ,"value": 1},
      {
        "source": "4P08",
        "target": "4P64"
      ,"value": 1},
      {
        "source": "4P09",
        "target": "4P09C01"
      ,"value": 1},
      {
        "source": "4P09",
        "target": "4P10"
      ,"value": 1},
      {
        "source": "4P09",
        "target": "4P11"
      ,"value": 1},
      {
        "source": "4P09",
        "target": "4P13"
      ,"value": 1},
      {
        "source": "4P09",
        "target": "5P07"
      ,"value": 1},
      {
        "source": "4P09C01",
        "target": "4P12C01"
      ,"value": 1},
      {
        "source": "4P09C01",
        "target": "4P16"
      ,"value": 1},
      {
        "source": "4P10",
        "target": "4P12C01"
      ,"value": 1},
      {
        "source": "4P11",
        "target": "5P05"
      ,"value": 1},
      {
        "source": "4P12",
        "target": "4P12C01"
      ,"value": 1},
      {
        "source": "4P12C01",
        "target": "4P17"
      ,"value": 1},
      {
        "source": "4P15",
        "target": "4P16"
      ,"value": 1},
      {
        "source": "4P15",
        "target": "4P17"
      ,"value": 1},
      {
        "source": "4P19",
        "target": "4P35"
      ,"value": 1},
      {
        "source": "4P19",
        "target": "4P37"
      ,"value": 1},
      {
        "source": "4P19",
        "target": "4P59"
      ,"value": 1},
      {
        "source": "4P21",
        "target": "4P22C01"
      ,"value": 1},
      {
        "source": "4P22",
        "target": "4P22C01"
      ,"value": 1},
      {
        "source": "4P22",
        "target": "4P25"
      ,"value": 1},
      {
        "source": "4P22C01",
        "target": "4P24"
      ,"value": 1},
      {
        "source": "4P22C01",
        "target": "4P26"
      ,"value": 1},
      {
        "source": "4P22C01",
        "target": "4P56"
      ,"value": 1},
      {
        "source": "4P22C01",
        "target": "5P41"
      ,"value": 1},
      {
        "source": "4P23",
        "target": "4P28"
      ,"value": 1},
      {
        "source": "4P24",
        "target": "4P36"
      ,"value": 1},
      {
        "source": "4P24",
        "target": "4P37"
      ,"value": 1},
      {
        "source": "4P24",
        "target": "4P56"
      ,"value": 1},
      {
        "source": "4P24",
        "target": "4P67"
      ,"value": 1},
      {
        "source": "4P24",
        "target": "4P72"
      ,"value": 1},
      {
        "source": "4P24",
        "target": "5P41"
      ,"value": 1},
      {
        "source": "4P25",
        "target": "4P26"
      ,"value": 1},
      {
        "source": "4P26",
        "target": "4P27"
      ,"value": 1},
      {
        "source": "4P26",
        "target": "4P28"
      ,"value": 1},
      {
        "source": "4P26",
        "target": "4P36"
      ,"value": 1},
      {
        "source": "4P26",
        "target": "4P37"
      ,"value": 1},
      {
        "source": "4P26",
        "target": "4P38"
      ,"value": 1},
      {
        "source": "4P26",
        "target": "4P40"
      ,"value": 1},
      {
        "source": "4P26",
        "target": "4P48"
      ,"value": 1},
      {
        "source": "4P26",
        "target": "4P53"
      ,"value": 1},
      {
        "source": "4P26",
        "target": "4P54"
      ,"value": 1},
      {
        "source": "4P26",
        "target": "5P09"
      ,"value": 1},
      {
        "source": "4P26",
        "target": "5P10"
      ,"value": 1},
      {
        "source": "4P27",
        "target": "4P28"
      ,"value": 1},
      {
        "source": "4P27",
        "target": "4P38"
      ,"value": 1},
      {
        "source": "4P27",
        "target": "4P40"
      ,"value": 1},
      {
        "source": "4P27",
        "target": "4P48"
      ,"value": 1},
      {
        "source": "4P27",
        "target": "4P50"
      ,"value": 1},
      {
        "source": "4P27",
        "target": "5P09"
      ,"value": 1},
      {
        "source": "4P27",
        "target": "5P10"
      ,"value": 1},
      {
        "source": "4P28",
        "target": "4P36"
      ,"value": 1},
      {
        "source": "4P28",
        "target": "5P20"
      ,"value": 1},
      {
        "source": "4P28",
        "target": "5P25"
      ,"value": 1},
      {
        "source": "4P28",
        "target": "5P27"
      ,"value": 1},
      {
        "source": "4P29",
        "target": "4P31C01"
      ,"value": 1},
      {
        "source": "4P30",
        "target": "4P31"
      ,"value": 1},
      {
        "source": "4P30",
        "target": "4P34"
      ,"value": 1},
      {
        "source": "4P30",
        "target": "5P10"
      ,"value": 1},
      {
        "source": "4P30",
        "target": "5P38"
      ,"value": 1},
      {
        "source": "4P30",
        "target": "5P39"
      ,"value": 1},
      {
        "source": "4P31",
        "target": "4P31C01"
      ,"value": 1},
      {
        "source": "4P31",
        "target": "4P35C01"
      ,"value": 1},
      {
        "source": "4P31C01",
        "target": "4P35"
      ,"value": 1},
      {
        "source": "4P31C01",
        "target": "4P35C01"
      ,"value": 1},
      {
        "source": "4P31C01",
        "target": "4P72"
      ,"value": 1},
      {
        "source": "4P33",
        "target": "4P35"
      ,"value": 1},
      {
        "source": "4P34",
        "target": "4P35"
      ,"value": 1},
      {
        "source": "4P35",
        "target": "4P35C01"
      ,"value": 1},
      {
        "source": "4P35",
        "target": "4P35C02"
      ,"value": 1},
      {
        "source": "4P35",
        "target": "4P40"
      ,"value": 1},
      {
        "source": "4P35",
        "target": "4P71"
      ,"value": 1},
      {
        "source": "4P35C01",
        "target": "4P35C02"
      ,"value": 1},
      {
        "source": "4P35C01",
        "target": "4P37"
      ,"value": 1},
      {
        "source": "4P35C01",
        "target": "4P71"
      ,"value": 1},
      {
        "source": "4P36",
        "target": "4P37"
      ,"value": 1},
      {
        "source": "4P36",
        "target": "5P20"
      ,"value": 1},
      {
        "source": "4P37",
        "target": "4P45"
      ,"value": 1},
      {
        "source": "4P37",
        "target": "4P45C01"
      ,"value": 1},
      {
        "source": "4P37",
        "target": "4P46"
      ,"value": 1},
      {
        "source": "4P37",
        "target": "4P50"
      ,"value": 1},
      {
        "source": "4P37",
        "target": "4P51"
      ,"value": 1},
      {
        "source": "4P37",
        "target": "4P68"
      ,"value": 1},
      {
        "source": "4P38",
        "target": "4P39"
      ,"value": 1},
      {
        "source": "4P38",
        "target": "4P41"
      ,"value": 1},
      {
        "source": "4P38",
        "target": "4P42"
      ,"value": 1},
      {
        "source": "4P38",
        "target": "4P43"
      ,"value": 1},
      {
        "source": "4P38",
        "target": "5P39"
      ,"value": 1},
      {
        "source": "4P39",
        "target": "4P42"
      ,"value": 1},
      {
        "source": "4P41",
        "target": "4P43"
      ,"value": 1},
      {
        "source": "4P41",
        "target": "4P45C02"
      ,"value": 1},
      {
        "source": "4P41",
        "target": "4P47"
      ,"value": 1},
      {
        "source": "4P41",
        "target": "4P50"
      ,"value": 1},
      {
        "source": "4P41",
        "target": "4P59"
      ,"value": 1},
      {
        "source": "4P43",
        "target": "4P44"
      ,"value": 1},
      {
        "source": "4P43",
        "target": "4P47"
      ,"value": 1},
      {
        "source": "4P43",
        "target": "4P59"
      ,"value": 1},
      {
        "source": "4P45",
        "target": "4P45C01"
      ,"value": 1},
      {
        "source": "4P45",
        "target": "4P45C02"
      ,"value": 1},
      {
        "source": "4P45C01",
        "target": "4P45C02"
      ,"value": 1},
      {
        "source": "4P45C01",
        "target": "4P46"
      ,"value": 1},
      {
        "source": "4P45C01",
        "target": "4P59"
      ,"value": 1},
      {
        "source": "4P50",
        "target": "4P50C01"
      ,"value": 1},
      {
        "source": "4P56",
        "target": "4P56C01"
      ,"value": 1},
      {
        "source": "4P62",
        "target": "4P66"
      ,"value": 1},
      {
        "source": "4P63",
        "target": "4P65"
      ,"value": 1},
      {
        "source": "4P63",
        "target": "4P67"
      ,"value": 1},
      {
        "source": "4P63",
        "target": "4P73"
      ,"value": 1},
      {
        "source": "4P65",
        "target": "4P65C01"
      ,"value": 1},
      {
        "source": "4P65",
        "target": "4P66"
      ,"value": 1},
      {
        "source": "4P66",
        "target": "4P66C01"
      ,"value": 1},
      {
        "source": "4P66",
        "target": "4P73"
      ,"value": 1},
      {
        "source": "5A01",
        "target": "5P07"
      ,"value": 1},
      {
        "source": "5P01",
        "target": "5P10"
      ,"value": 1},
      {
        "source": "5P04",
        "target": "5P14"
      ,"value": 1},
      {
        "source": "5P05",
        "target": "5P06"
      ,"value": 1},
      {
        "source": "5P08",
        "target": "5P11"
      ,"value": 1},
      {
        "source": "5P10",
        "target": "5P39"
      ,"value": 1},
      {
        "source": "5P11",
        "target": "5P12"
      ,"value": 1},
      {
        "source": "5P11",
        "target": "5P16"
      ,"value": 1},
      {
        "source": "5P14",
        "target": "5P15"
      ,"value": 1},
      {
        "source": "5P14",
        "target": "5P16"
      ,"value": 1},
      {
        "source": "5P14",
        "target": "5P39"
      ,"value": 1},
      {
        "source": "5P15",
        "target": "5P16"
      ,"value": 1},
      {
        "source": "5P15",
        "target": "5P39"
      ,"value": 1},
      {
        "source": "5P16",
        "target": "5P39"
      ,"value": 1},
      {
        "source": "5P18",
        "target": "5P18C01"
      ,"value": 1},
      {
        "source": "5P18",
        "target": "5P20"
      ,"value": 1},
      {
        "source": "5P21",
        "target": "5P29"
      ,"value": 1},
      {
        "source": "5P21",
        "target": "5P31"
      ,"value": 1},
      {
        "source": "5P21",
        "target": "5P34"
      ,"value": 1},
      {
        "source": "5P21",
        "target": "5P40C01"
      ,"value": 1},
      {
        "source": "5P22",
        "target": "5P23"
      ,"value": 1},
      {
        "source": "5P23",
        "target": "5P29"
      ,"value": 1},
      {
        "source": "5P23",
        "target": "5P31"
      ,"value": 1},
      {
        "source": "5P23",
        "target": "5P38"
      ,"value": 1},
      {
        "source": "5P23",
        "target": "5P40C01"
      ,"value": 1},
      {
        "source": "5P24",
        "target": "5P25"
      ,"value": 1},
      {
        "source": "5P24",
        "target": "5P27"
      ,"value": 1},
      {
        "source": "5P25",
        "target": "5P27"
      ,"value": 1},
      {
        "source": "5P27",
        "target": "5P32"
      ,"value": 1},
      {
        "source": "5P29",
        "target": "5P31"
      ,"value": 1},
      {
        "source": "5P29",
        "target": "5P32C01"
      ,"value": 1},
      {
        "source": "5P29",
        "target": "5P37"
      ,"value": 1},
      {
        "source": "5P29",
        "target": "5P38"
      ,"value": 1},
      {
        "source": "5P29",
        "target": "5P40C01"
      ,"value": 1},
      {
        "source": "5P30",
        "target": "5P31"
      ,"value": 1},
      {
        "source": "5P30",
        "target": "5P32"
      ,"value": 1},
      {
        "source": "5P31",
        "target": "5P33"
      ,"value": 1},
      {
        "source": "5P32",
        "target": "5P32C01"
      ,"value": 1},
      {
        "source": "5P32",
        "target": "5P35"
      ,"value": 1},
      {
        "source": "5P32",
        "target": "5P36"
      ,"value": 1},
      {
        "source": "5P32",
        "target": "5P42"
      ,"value": 1},
      {
        "source": "5P32C01",
        "target": "5P36"
      ,"value": 1},
      {
        "source": "5P32C01",
        "target": "5P42"
      ,"value": 1},
      {
        "source": "5P33",
        "target": "5P37"
      ,"value": 1},
      {
        "source": "5P33",
        "target": "5P39"
      ,"value": 1},
      {
        "source": "5P34",
        "target": "5P34C01"
      ,"value": 1},
      {
        "source": "5P35",
        "target": "5P36"
      ,"value": 1},
      {
        "source": "5P36",
        "target": "5P36C01"
      ,"value": 1},
      {
        "source": "5P36",
        "target": "5P42"
      ,"value": 1},
      {
        "source": "5P38",
        "target": "5P42"
      ,"value": 1},
      {
        "source": "5P40",
        "target": "5P40C01"
      }
	]
   };   
    
}