function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

var width = 1600,
    height = 1900;

var chart_mode = 1;

var node_radius = 37;
//var color = d3.scale.category20b();
var color = d3.scale.ordinal()
            .domain([1,2,3,4,5])
            .range(["#E4B04A","#B9E3EF", "#EFC5B9", "#EFE0B9" ]);

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
    .size([width, height]);
	
var tier_width = 90,
    tier_height = 125;

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
        d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
        force.resume();
    }
	
function node_action(d)
{
	if(d3.event.shiftKey)
	{
		console.log("shift double click");
		connectedNodes(d);
        //  d.fix = false;
	} else 
	{
    connectedNodes(d);
		function releasenode(d) {
			d.fixed = false;
      d.fix = false;
       // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
			//force.resume();
		}
	}	
}

var svg = d3.select("#main_vis").append("svg")
    .attr("width", width)
    .attr("height", height);

var graph = getData();

var nodeMap = {};

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .style("font", "22px helvetica")
    .style("text-align", "left")
    .offset([-25, 50])
    .html(function (d) {
    return  d.DisplayName  + "";
})

var explanation = d3.tip()
.attr('class', 'd3-explanation')
.offset(function(d) { 
    if(d.tier_x < 7) {return [85,300];} else {return [85, -300];}})
.style("font", "16px helvetica")
.style("padding", "14px")
.style("color", "#000")
.style("line-height", "1")
.style("font-weight", "bold")
.style("text-align", "left")
.style("background", "rgba(200, 200, 200, 0.85)")
.style("max-width", "500px")
.html(function (d) {
if (d.contents) {return "<span>" + d.DisplayName + "</span><br><br>" + "<span>" + d.contents + "</span>";} else {return;} });

svg.call(tip);
svg.call(explanation);

function show_things(d)
{
  explanation.show(d);
}

function hide_things(d)
{
  explanation.hide(d);
}

graph.nodes.forEach(function(d) { nodeMap[d.name] = d; d.fix = true; }); // set all nodes to fixed at the start

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
	.style("marker-end",  "url(#suit)") // for Arrows
    .style("stroke-width", function(d) {
        return Math.sqrt(d.value)+1;
    });

// create nodes
var gnodes = svg.selectAll("g.gnode")
    .data(graph.nodes)
    .enter()
    .append("g")
    .classed("gnode", true);

var node = gnodes.append("circle")
    .attr("class", "node")
    .attr("r", node_radius)
    .style("fill", function(d) { return color(d.group); })
	  .on('dblclick', node_action)
    .on('mouseover', show_things)
    .on('mouseout', hide_things)
    .call(node_drag);

d3.selection.prototype.dblTap = function (callback) {
    var last = 0;
    return this.each(function () {
        d3.select(this).on("touchstart", function (e) {
            if ((d3.event.timeStamp - last) < 500) {
                console.log(this);
                return callback(e);
            }
            last = d3.event.timeStamp;
        });
    });
}

d3.select("div").dblTap(function () {
    alert("Double tap!");
});
    //.on('dblclick', node_drag); //Added code

//var titles = gnodes.append("title")
//    .text(function(d) { return d.DisplayName; });

// Labels in nodes
var labels = gnodes.append("text")
      //.attr("dx", "10")
    //  .attr("dy", "10em")
      .text(function(d) { return d.name;})
      .style("opacity", 1);
 //     .style("stroke", "black");

force.on("tick", function() {

// Attach the lines
// Do it based on tier data in the nodes

if(chart_mode == 1)
{
    link.attr("x1", function(d) { if(d.source.tier_x) { return d.source.tier_x * tier_width;} else {return d.source.x; }})
        .attr("y1", function(d) { if(d.source.tier_y) { return d.source.tier_y * tier_height;} else {return d.source.y; }})
        .attr("x2", function(d) { if(d.target.tier_x) { return d.target.tier_x * tier_width;} else {return d.target.x; }})
        .attr("y2", function(d) { if(d.target.tier_y) { return d.target.tier_y * tier_height;} else {return d.target.y; }});

    // Set node position
    // Also based on data in the nodes
    node.attr("cx", function(d) { if(d.fix && d.tier_x) { return d.tier_x * tier_width;} else {return d.x; }})
        .attr("cy", function(d) { if(d.fix && d.tier_y) { return d.tier_y * tier_height;} else {return d.y; }});

    labels.attr("x", function(d) { if(d.fix && d.tier_x) { return d.tier_x * tier_width;} else {return d.x; }})
          .attr("y", function(d) { if(d.fix && d.tier_y) { return d.tier_y * tier_height + 5;} else {return d.y + 5; }});

} else if (chart_mode == 2)
{

    link.attr("x1", function(d) { if(d.source.tier_x_2) { return d.source.tier_x_2 * tier_width;} else {return d.source.x; }})
        .attr("y1", function(d) { if(d.source.tier_y_2) { return d.source.tier_y_2 * tier_height;} else {return d.source.y; }})
        .attr("x2", function(d) { if(d.target.tier_x_2) { return d.target.tier_x_2 * tier_width;} else {return d.target.x; }})
        .attr("y2", function(d) { if(d.target.tier_y_2) { return d.target.tier_y_2 * tier_height;} else {return d.target.y; }});

    // Set node position
    // Also based on data in the nodes
    node.attr("cx", function(d) { if(d.fix && d.tier_x_2) { return d.tier_x_2 * tier_width;} else {return d.x; }})
        .attr("cy", function(d) { if(d.fix && d.tier_y_2) { return d.tier_y_2 * tier_height;} else {return d.y; }});

    labels.attr("x", function(d) { if(d.fix && d.tier_x_2) { return d.tier_x_2 * tier_width;} else {return d.x; }})
          .attr("y", function(d) { if(d.fix && d.tier_y_2) { return d.tier_y_2 * tier_height + 5;} else {return d.y + 5; }});

}

// ARROWS
gnodes.append("defs").selectAll("marker")
    .data(["suit", "licensing", "resolved"])
  .enter().append("marker")
    .attr("id", function(d) { return d; })
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", node_radius + 5)
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
         "tier_y": 0.5,
         "tier_x": 1,
         "tier_y_2": 1,
         "tier_x_2": 1,
         "contents": "I. By that which is self-caused, I mean that of which the essence involves existence, or that of which the nature is only conceivable as existent."

      },
      {
         "name": "1D02",
         "DisplayName": "I Definition 2",
         "ShortText": "Definition: Finite in its kind",
         "group": 1, "InDegree": "0",
         "OutDegree": "2",
         "tier_y": 0.5,
         "tier_x": 2,
         "tier_y_2": 1,
         "tier_x_2": 2,
         "contents": "II. A thing is called finite after its kind, when it can be limited by another thing of the same nature; for instance, a body is called finite because we always conceive another greater body. So, also, a thought is limited by another thought, but a body is not limited by thought, nor a thought by body."

      },
      {
         "name": "1D03",
         "DisplayName": "I Definition 3",
         "ShortText": "Definition: Substance",
         "group": 1, "InDegree": "0",
         "OutDegree": "10",
         "tier_y": 0.5,
         "tier_x": 3,
         "tier_y_2": 1,
         "tier_x_2": 3,
         "contents": "III. By substance, I mean that which is in itself, and is conceived through itself: in other words, that of which a conception can be formed independently of any other conception." 
      },
      {
         "name": "1D04",
         "DisplayName": "I Definition 4",
         "ShortText": "Definition: Attribute",
         "group": 1, "InDegree": "0",
         "OutDegree": "6",
         "tier_y": 0.5,
         "tier_x": 4,
         "tier_y_2": 1,
         "tier_x_2": 4,
         "contents": "IV. By attribute, I mean that which the intellect perceives as constituting the essence of substance."

      },
      {
         "name": "1D05",
         "DisplayName": "I Definition 5",
         "ShortText": "Definition: Mode",
         "group": 1, "InDegree": "0",
         "OutDegree": "10",
         "tier_y": 0.5,
         "tier_x": 5,
         "tier_y_2": 1,
         "tier_x_2": 5,
         "contents": "V. By mode, I mean the modifications of substance, or that which exists in, and is conceived through, something other than itself."

      },
      {
         "name": "1D06",
         "DisplayName": "I Definition 6",
         "ShortText": "Definition: God",
         "group": 1, "InDegree": "0",
         "OutDegree": "11",
         "tier_y": 0.5,
         "tier_x": 6,
         "tier_y_2": 1,
         "tier_x_2": 6,
         "contents": "VI. By God, I mean a being absolutely infinite--that is, a substance consisting in infinite attributes, of which each expresses eternal and infinite essentiality.   Explanation--I say absolutely infinite, not infinite after its kind: for, of a thing infinite only after its kind, infinite attributes may be denied; but that which is absolutely infinite, contains in its essence whatever expresses reality, and involves no negation."

      },
      {
         "name": "1D07",
         "DisplayName": "I Definition 7",
         "ShortText": "Definition: Free",
         "group": 1, "InDegree": "0",
         "OutDegree": "3",
         "tier_y": 0.5,
         "tier_x": 7,
         "tier_y_2": 1,
         "tier_x_2": 7,
         "contents": "VII. That thing is called free, which exists solely by the necessity of its own nature, and of which the action is determined by itself alone. On the other hand, that thing is necessary, or rather constrained, which is determined by something external to itself to a fixed and definite method of existence or action."       },
      {
         "name": "1D08",
         "DisplayName": "I Definition 8",
         "ShortText": "Definition: Eternity",
         "group": 1, "InDegree": "0",
         "OutDegree": "5",
         "tier_y": 0.5,
         "tier_x": 8,
         "tier_y_2": 1,
         "tier_x_2": 8,
         "contents": "VIII. By eternity, I mean existence itself, in so far as it is conceived necessarily to follow solely from the definition of that which is eternal.   Explanation--Existence of this kind is conceived as an eternal truth, like the essence of a thing, and, therefore, cannot be explained by means of continuance or time, though continuance may be conceived without a beginning or end."

      },
      {
         "name": "1A01",
         "DisplayName": "I Axiom 1",
         "ShortText": "Axiom: In itself or in another",
         "group": 0, "InDegree": "0",
         "OutDegree": "8",
         "tier_y": 1,
         "tier_x": 1.5,
         "contents": "I. Everything which exists, exists either in itself or in something else."
      },
      {
         "name": "1A02",
         "DisplayName": "I Axiom 2",
         "ShortText": "Axiom: Not conceived through another, through itself",
         "group": 0, "InDegree": "0",
         "OutDegree": "11",
         "tier_y": 1,
         "tier_x": 2.5,
         "contents": "II. That which cannot be conceived through anything else must be conceived through itself."
      },
      {
         "name": "1A03",
         "DisplayName": "I Axiom 3",
         "ShortText": "Axiom: Effect from cause",
         "group": 0, "InDegree": "0",
         "OutDegree": "2",
         "tier_y": 1,
         "tier_x": 3.5,
         "contents":"III. From a given definite cause an effect necessarily follows; and, on the other hand, if no definite cause be granted, it is impossible that an effect can follow."
         },
      {
         "name": "1A04",
         "DisplayName": "I Axiom 4",
         "ShortText": "Axiom: Knowledge of effect from knowledge of cause",
         "group": 0, "InDegree": "0",
         "OutDegree": "9",
         "tier_y": 1,
         "tier_x": 4.5,
         "contents":"IV. The knowledge of an effect depends on and involves the knowledge of a cause."
      },
      {
         "name": "1A05",
         "DisplayName": "I Axiom 5",
         "ShortText": "Axiom: Nothing in common, no knowledge in common",
         "group": 0, "InDegree": "0",
         "OutDegree": "1",
         "tier_y": 1,
         "tier_x": 5.5,
         "contents": "V. Things which have nothing in common cannot be understood, the one by means of the other; the conception of one does not involve the conception of the other."
      },
      {
         "name": "1A06",
         "DisplayName": "I Axiom 6",
         "ShortText": "Axiom: True idea agrees with ideato",
         "group": 0, "InDegree": "0",
         "OutDegree": "6",
         "tier_y": 1,
         "tier_x": 6.5,
         "contents": "VI. A true idea must correspond with its ideate or object."
      },
      {
         "name": "1A07",
         "DisplayName": "I Axiom 7",
         "ShortText": "Axiom: If conceived not existing, then essence not requires existence",
         "group": 0, "InDegree": "0",
         "OutDegree": "1",
         "tier_y": 1,
         "tier_x": 7.5,
         "contents": "VII. If a thing can be conceived as non-existing, its essence does not involve existence."
      },
      {
         "name": "1P01",
         "DisplayName": "I Proposition 1",
         "ShortText": "Substance prior to modifications",
         "group": 3, "InDegree": "2",
         "OutDegree": "1",
         "tier_y": 2,
         "tier_x": 3,
         "contents":"Substance is by nature prior to its modifications. Proof.--This is clear from Deff. iii. and v."
      },
      {
         "name": "1P02",
         "DisplayName": "I Proposition 2",
         "ShortText": "Substances with different attributes have nothing in common",
         "group": 3, "InDegree": "1",
         "OutDegree": "3",
         "tier_y": 2,
         "tier_x": 4,
         "contents": "Two substances, whose attributes are different, have nothing in common. Proof.--Also evident from Def. iii. For each must exist in itself, and be conceived through itself; in other words, the conception of one does not imply the conception of the other."
      },
      {
         "name": "1P03",
         "DisplayName": "I Proposition 3",
         "ShortText": "Two things with nothing in common are not cause of each other",
         "group": 3, "InDegree": "2",
         "OutDegree": "1",
         "tier_y": 2,
         "tier_x": 9,
         "contents": "Things which have nothing in common cannot be one the cause of the other. Proof.--If they have nothing in common, it follows that one cannot be apprehended by means of the other (Ax. v.), and, therefore, one cannot be the cause of the other (Ax. iv.). Q.E.D."

         },
      {
         "name": "1P04",
         "DisplayName": "I Proposition 4",
         "ShortText": "Two distinct things must have a difference of attribute or of mode",
         "group": 3, "InDegree": "4",
         "OutDegree": "1",
         "tier_y": 2,
         "tier_x": 7,
         "contents": "Two or more distinct things are distinguished one from the other, either by the difference of the attributes of the substances, or by the difference of their modifications.Proof.--Everything which exists, exists either in itself or in something else (Ax. i.),--that is (by Deff. iii. and v.), nothing is granted in addition to the understanding, except substance and its modifications. Nothing is, therefore, given besides the understanding, by which several things may be distinguished one from the other, except the substances, or, in other words (see Ax. iv.), their attributes and modifications. Q.E.D."  
       },
      {
         "name": "1P05",
         "DisplayName": "I Proposition 5",
         "ShortText": "Not two substances with same nature or attribute",
         "group": 3, "InDegree": "4",
         "OutDegree": "5",
         "tier_y": 3,
         "tier_x": 2,
         "contents": "There cannot exist in the universe two or more substances having the same nature or attribute. Proof.--If several distinct substances be granted, they must be distinguished one from the other, either by the difference of their attributes, or by the difference of their modifications (Prop. iv.). If only by the difference of their attributes, it will be granted that there cannot be more than one with an identical attribute. If by the difference of their modifications--as substance is naturally prior to its modifications (Prop. i.),--it follows that setting the modifications aside, and considering substance in itself, that is truly, (Deff. iii. and vi.), there cannot be conceived one substance different from another,--that is (by Prop. iv.), there cannot be granted several substances, but one substance only. Q.E.D."      },
      {
         "name": "1P06",
         "DisplayName": "I Proposition 6",
         "ShortText": "One substance cannot produce another",
         "group": 3, "InDegree": "5",
         "OutDegree": "3",
         "tier_y": 4,
         "tier_x": 3,
         "contents": "One substance cannot be produced by another substance. Proof.--It is impossible that there should be in the universe two substances with an identical attribute, i.e. which have anything common to them both (Prop. ii.), and, therefore (Prop. iii.), one cannot be the cause of the other, neither can one be produced by the other. Q.E.D."
      },
      {
         "name": "1P07",
         "DisplayName": "I Proposition 7",
         "ShortText": "Nature of a substance is to exist.",
         "group": 3, "InDegree": "2",
         "OutDegree": "7",
         "tier_y": 5,
         "tier_x": 2,
         "contents": "Existence belongs to the nature of substances. Proof.--Substance cannot be produced by anything external (Corollary, Prop vi.), it must, therefore, be its own cause--thatis, its essence necessarily involves existence, or existence belongs to its nature."       
       },
      {
         "name": "1P08",
         "DisplayName": "I Proposition 8",
         "ShortText": "Every substance is necessarily infinite",
         "group": 3, "InDegree": "3",
         "OutDegree": "1",
         "tier_y": 6,
         "tier_x": 2,
         // NOTE TWO MISSING
         "contents": "Every substance is necessarily infinite. Proof.--There can only be one substance with an identical attribute, and existence follows from its nature (Prop. vii.); its nature, therefore, involves existence, either as finite or infinite. It does not exist as finite, for (by Def. ii.) it would then be limited by something else of the same kind, which would also necessarily exist (Prop. vii.); and there would be two substances with an identical attribute, which is absurd (Prop. v.). It therefore exists as infinite. Q.E.D. NOTE I.--As finite existence involves a partial negation, and infinite existence is the absolute affirmation of the given nature, it follows (solely from Prop. vii.) that every substance is necessarily infinite."       },
      {
         "name": "1P09",
         "DisplayName": "I Proposition 9",
         "ShortText": "The more reality, the more attributes",
         "group": 3, "InDegree": "1",
         "OutDegree": "0",
         "tier_y": 2,
         "tier_x": 5,
         "contents":"The more reality or being a thing has, the greater the number of its attributes (Def. iv.)."
      },
      {
         "name": "1P10",
         "DisplayName": "I Proposition 10",
         "ShortText": "Each attribute of a substance, conceived through itself",
         "group": 3, "InDegree": "2",
         "OutDegree": "4",
         "tier_y": 2,
         "tier_x": 2,
         "contents": "Each particular attribute of the one substance must be conceived through itself. Proof.--An attribute is that which the intellect perceives of substance, as constituting its essence (Def. iv.), and, therefore, must be conceived through itself (Def. iii.).  Q.E.D."
      },

      {
         "name": "1P11",
         "DisplayName": "I Proposition 11",
         "ShortText": "God, a substance, necessarily exists",
         "group": 3, "InDegree": "7",
         "OutDegree": "8",
         "tier_y": 6,
         "tier_x": 4,
         "contents": "God, or substance, consisting of infinite attributes, of which each expresses eternal and infinite essentiality, necessarily exists."
      },
      {
         "name": "1P12",
         "DisplayName": "I Proposition 12",
         "ShortText": "No attribute of substance implies substance is divisible",
         "group": 3, "InDegree": "7",
         "OutDegree": "0",
         "tier_y": 7,
         "tier_x": 1,
         "contents": "No attribute of substance can be conceived from which it would follow that substance can be divided. Proof.--The parts into which substance as thus conceived wouldbe divided either will retain the nature of substance, or they will not.  If the former, then (by Prop. viii.) each part will necessarily be infinite, and (by Prop. vi.) self--caused, and (by Prop. v.) will perforce consist of a different attribute, so that, in that case, several substances could be formed out of one substance, which (by Prop. vi.) is absurd.  Moreover, the parts (by Prop. ii.) would have nothing in common with their whole, and the whole (by Def. iv. and Prop. x.) could both exist and be conceived without its parts, which everyone will admit to be absurd.  If we adopt the second alternative--namely, that the parts will not retain the nature of substance--then, if the whole substance were divided into equal parts, it would lose the nature of substance, and would cease to exist, which (by Prop. vii.) is absurd." 
      },
      {
         "name": "1P13",
         "DisplayName": "I Proposition 13",
         "ShortText": "Substance absolutely infinite is indivisible",
         "group": 3, "InDegree": "2",
         "OutDegree": "0",
         "tier_y": 7,
         "tier_x": 3,
         "contents": "Substance absolutely infinite is indivisible. Proof.--If it could be divided, the parts into which it was divided would either retain the nature of absolutely infinite substance, or they would not.  If the former, we should have several substances of the same nature, which (by Prop. v.) is absurd.  If the latter, then (by Prop. vii.) substance absolutely infinite could cease to exist, which (by Prop. xi.) is also absurd."     


          },     
          {
         
         "name": "1P14",
         "DisplayName": "I Proposition 14",
         "ShortText": "Besides God, no substance can be nor be conceived",
         "group": 3, "InDegree": "3",
         "OutDegree": "4",
         "tier_y": 7,
         "tier_x": 4,
         "contents": "Besides God no substance can be granted or conceived.  Proof.--As God is a being absolutely infinite, of whom no attribute that expresses the essence of substance can be denied (by Def. vi.), and he necessarily exists (by Prop. xi.); if any substance besides God were granted, it would have to be explained by some attribute of God, and thus two substances with the same attribute would exist, which (by Prop. v.) is absurd; therefore,besides God no substance can be granted, or, consequently, be conceived.  If it could be conceived, it would necessarily have to be conceived as existent; but this (by the first part of this proof) is absurd.  Therefore, besides God no substance can be granted or conceived." 

      },
      {
         "name": "1P15",
         "DisplayName": "I Proposition 15",
         "ShortText": "Whatever is, is in God",
         "group": 3, "InDegree": "4",
         "OutDegree": "17",
         "tier_y": 8,
         "tier_x": 3,
         "contents": "Whatsoever is, is in God, and without God nothing can be, or be conceived. Proof.--Besides God, no substance is granted or can be conceived (by Prop. xiv.), that is (by Def. iii.) nothing which is in itself and is conceived through itself.  But modes (by Def. v.) can neither be, nor be conceived without substance; wherefore they can only be in the divine nature, and can onlythrough it be conceived.  But substances and modes form the sum total of existence (by Ax. i.), therefore, without God nothing can be, or be conceived.  Q.E.D."
      },
      {
         "name": "1P16",
         "DisplayName": "I Proposition 16",
         "ShortText": "Everything conceived by infinite intellect follows from God's nature",
         "group": 3, "InDegree": "1",
         "OutDegree": "14",
         "tier_y": 2,
         "tier_x": 6,
         "contents": "From the necessity of the divine nature must follow an infinite number of things in infinite ways--that is, all things which can fall within the sphere of infinite intellect.Proof.--This proposition will be clear to everyone, who remembers that from the given definition of any thing the intellect infers several properties, which really necessarily follow therefrom (that is, from the actual essence of the thing defined); and it infers more properties in proportion as the definition of the thing expresses more reality, that is, in proportion as the essence of the thing defined involves more reality.  Now, as the divine nature has absolutely infinite attributes (by Def. vi.), of which each expresses infinite essence after its kind, it follows that from the necessity of its nature an infinite number of things (that is, everything which can fall within the sphere of an infinite intellect) must necessarily follow.  Q.E.D."      
       },
      {
         "name": "1P17",
         "DisplayName": "I Proposition 17",
         "ShortText": "God acts from the laws of his own nature and is not compelled",
         "group": 3, "InDegree": "2",
         "OutDegree": "2",
         "tier_y": 9,
         "tier_x": 5,
         "contents": "God acts solely by the laws of his own nature, and is not constrained by anyone. Proof.--We have just shown (in Prop. xvi.), that solely from the necessity of the divine nature, or, what is the same thing, solely from the laws of his nature, an infinite number of things absolutely follow in an infinite number of ways; and we proved (in Prop. xv.), that without God nothing can be nor be conceived but that all things are in God. Wherefore nothing can exist; outside himself, whereby he can be conditioned or constrained to act. Wherefore God acts solely by the laws of his own nature, and is not constrained by anyone. Q.E.D." 
       },
      {
         "name": "1P17C02",
         "DisplayName": "I Proposition 17 Corollary 2",
         "ShortText": "God alone is a free cause",
         "group": 4, "InDegree": "6",
         "OutDegree": "1",
         "tier_y": 10,
         "tier_x": 5,
         "contents": "--It follows: 2. That God is the sole free cause. For God alone exists by the sole necessity of his nature (by Prop. xi. and Prop. xiv., Coroll. i.), and acts by the sole necessity of his own nature, wherefore God is (by Def. vii.) the sole free cause. Q.E.D."
       },
      {
         "name": "1P18",
         "DisplayName": "I Proposition 18",
         "ShortText": "God is the immanent cause of all things",
         "group": 3, "InDegree": "4",
         "OutDegree": "0",
         "tier_y": 9,
         "tier_x": 3,
         "contents": "God is the indwelling and not the transient cause of all things. Proof.—All things which are, are in God, and must be conceived through God (by Prop. xv.), therefore (by Prop. xvi., Coroll. i.) God is the cause of those things which are in him. This is our first point. Further, besides God there can be no substance (by Prop. xiv.), that is nothing in itself external to God. This is our second point. God, therefore, is the indwelling and not the transient cause of all things. Q.E.D."
      },
      {
         "name": "1P19",
         "DisplayName": "I Proposition 19",
         "ShortText": "God is eternal; all His attributes are eternal",
         "group": 3, "InDegree": "5",
         "OutDegree": "2",
         "tier_y": 7,
         "tier_x": 2,
         "contents": "God, and all the attributes of God, are eternal. Proof.—God (by Def. vi.) is substance, which (by Prop. xi.) necessarily exists, that is (by Prop. vii.) existence appertains to its nature, or (what is the same thing) follows from its definition; therefore, God is eternal (by Def. viii.). Further, by the attributes of God we must understand that which (by Def. iv.) expresses the essence of the divine substance—in other words, that which appertains to substance: that, I say, should be involved in the attributes of substance. Now eternity appertains to the nature of substance (as I have already shown in Prop. vii.); therefore, eternity must appertain to each of the attributes, and thus all are eternal. Q.E.D."
      },
      {
         "name": "1P20",
         "DisplayName": "I Proposition 20",
         "ShortText": "The existence and essence or God are one and the same",
         "group": 3, "InDegree": "3",
         "OutDegree": "2",
         "tier_y": 8,
         "tier_x": 1,
         "contents":  "The existence of God and his essence are one and the same. Proof.—God (by the last Prop.) and all his attributes are eternal, that is (by Def. viii.) each of his attributes expresses existence. Therefore the same attributes of God which explain his eternal essence, explain at the same time his eternal existence—in other words, that which constitutes God's essence constitutes at the same time his existence. Wherefore God's existence and God's essence are one and the same. Q.E.D."
      },
      {
         "name": "1P20C02",
         "DisplayName": "I Proposition 20 Corollary 2",
         "ShortText": "God is immutable",
         "group": 4, "InDegree": "1",
         "OutDegree": "2",
         "tier_y": 9,
         "tier_x": 2,
         "contents": "Secondly, it follows that God, and all the attributes of God, are unchangeable. For if they could be changed in respect to existence, they must also be able to be changed in respect to essence—that is, obviously, be changed from true to false, which is absurd."
      },
      {
         "name": "1P21",
         "DisplayName": "I Proposition 21",
         "ShortText": "What follows from God's nature is infinite and exists forever",
         "group": 3, "InDegree": "3",
         "OutDegree": "6",
         "tier_y": 10,
         "tier_x": 2,
         "contents": "All things which follow from the absolute nature of any attribute of God must always exist and be infinite, or, in other words, are eternal and infinite through the said attribute.\n\nProof.—Conceive, if it be possible (supposing the proposition to be denied), that something in some attribute of God can follow from the absolute nature of the said attribute, and that at the same time it is finite, and has a conditioned existence or duration; for instance, the idea of God expressed in the attribute thought. Now thought, in so far as it is supposed to be an attribute of God, is necessarily (by Prop. xi.) in its nature infinite. But, in so far as it possesses the idea of God, it is supposed finite. It cannot, however, be conceived as finite, unless it be limited by thought (by Def. ii.); but it is not limited by thought itself, in so far as it has constituted the idea of God (for so far it is supposed to be finite); therefore, it is limited by thought, in so far as it has not constituted the idea of God, which nevertheless (by Prop. xi.) must necessarily exist. We have now granted, therefore, thought not constituting the idea of God, and, accordingly, the idea of God does not naturally follow from its nature in so far as it is absolute thought (for it is conceived as constituting, and also as not constituting, the idea of God), which is against our hypothesis. Wherefore, if the idea of God expressed in the attribute thought, or, indeed, anything else in any attribute of God (for we may take any example, as the proof is of universal application) follows from the necessity of the absolute nature of the said attribute, the said thing must necessarily be infinite, which was our first point. Furthermore, a thing which thus follows from the necessity of the nature of any attribute cannot have a limited duration. For if it can, suppose a thing, which follows from the necessity of the nature of some attribute, to exist in some attribute of God, for instance, the idea of God expressed in the attribute thought, and let it be supposed at some time not to have existed, or to be about not to exist. Now thought being an attribute of God, must necessarily exist unchanged (by Prop. xi., and Prop. xx., Coroll. ii.); and beyond the limits of the duration of the idea of God (supposing the latter at some time not to have existed, or not to be going to exist) thought would perforce have existed without the idea of God, which is contrary to our hypothesis, for we supposed that, thought being given, the idea of God necessarily flowed therefrom. Therefore the idea of God expressed in thought, or anything which necessarily follows from the absolute nature of some attribute of God, cannot have a limited duration, but through the said attribute is eternal, which is our second point. Bear in mind that the same proposition may be affirmed of anything, which in any attribute necessarily follows from God's absolute nature."
      },

      {
         "name": "1P22",
         "DisplayName": "I Proposition 22",
         "ShortText": "What follows from an attribute as modified, exists forever and is infinite",
         "group": 3, "InDegree": "1",
         "OutDegree": "2",
         "tier_y": 10,
         "tier_x": 1,
         "contents": "Whatsoever follows from any attribute of God, in so far as it is modified by a modification, which exists necessarily and as infinite, through the said attribute, must also exist necessarily and as infinite. Proof.—The proof of this proposition is similar to that of the preceding one."
      },
      {
         "name": "1P23",
         "DisplayName": "I Proposition 23",
         "ShortText": "Every mode which exists infinitely follows from an attribute or an infinite mode",
         "group": 3, "InDegree": "5",
         "OutDegree": "1",
         "tier_y": 11,
         "tier_x": 1,
         "contents": "Every mode, which exists both necessarily and as infinite, must necessarily follow either from the absolute nature of some attribute of God, or from an attribute modified by a modification which exists necessarily, and as infinite. \nProof.—A mode exists in something else, through which it must be conceived (Def. v.), that is (Prop. xv.), it exists solely in God, and solely through God can be conceived. If therefore a mode is conceived as necessarily existing and infinite, it must necessarily be inferred or perceived through some attribute of God, in so far as such attribute is conceived as expressing the infinity and necessity of existence, in other words (Def. viii.) eternity; that is, in so far as it is considered absolutely. A mode, therefore, which necessarily exists as infinite, must follow from the absolute nature of some attribute of God, either immediately (Prop. xxi.) or through the means of some modification, which follows from the absolute nature of the said attribute; that is (by Prop. xxii.), which exists necessarily and as infinite."
      },
      {
         "name": "1P24",
         "DisplayName": "I Proposition 24",
         "ShortText": "The essence of things produced by God does not involve existence",
         "group": 3, "InDegree": "1",
         "OutDegree": "1",
         "tier_y": 2,
         "tier_x": 1,
         "contents": "The human mind does not involve an adequate knowledge of the parts composing the human body. Proof.--The parts composing the human body do not belong to the essence of that body, except in so far as they communicate their motions to one another in a certain fixed relation (Def. after Lemma iii.), not in so far as they can be regarded as individuals without relation to the human body.  The parts of the human body are highly complex individuals  (Post. i.), whose parts (Lemma iv.) can be separated from the human body without in any way destroying the nature and distinctive quality of the latter, and they can communicate their motions (Ax. i., after Lemma iii.) to other bodies in another relation; therefore (II. iii.)  the idea or knowledge of each part will be in God, inasmuch (II. ix.) as he is regarded as affected by another idea of a particular thing, which particular thing is prior in the order of nature to the aforesaid part (II. vii.).  We may affirm the same thing of each part of each individual composing the human body; therefore, the knowledge of each part composing the human body is in God, in so far as he is affected by very many ideas of things, and not in so far as he has the idea of the human body only, in other words, the idea which constitutes the nature of the human mind (II. xiii); therefore (II. xi. Coroll.), the human mind does not involve an adequate knowledge of the human body.  Q.E.D."
      },
      {
         "name": "1P25",
         "DisplayName": "I Proposition 25",
         "ShortText": "God is the efficient cause of the existence and essence of things",
         "group": 3, "InDegree": "2",
         "OutDegree": "3",
         "tier_y": 9,
         "tier_x": 4, 
         "contents": "God is the efficient cause not only of the existence of things, but also of their essence. Proof.—If this be denied, then God is not the cause of the essence of things; and therefore the essence of things can (by Ax. iv.) be conceived without God. This (by Prop. xv.) is absurd. Therefore, God is the cause of the essence of things. Q.E.D. Note.—This proposition follows more clearly from Prop. xvi. For it is evident thereby that, given the divine nature, the essence of things must be inferred from it, no less than their existence—in a word, God must be called the cause of all things, in the same sense as he is called the cause of himself. This will be made still clearer by the following corollary."
      },
      {
         "name": "1P25C01",
         "DisplayName": "I Proposition 25 Corollary",
         "ShortText": "Individual things are modifications or modes of God's attributes",
         "group": 4, "InDegree": "3",
         "OutDegree": "9",
         "tier_y": 10,
         "tier_x": 3,
         "contents": "Individual things are nothing but modifications of the attributes of God, or modes by which the attributes of God are expressed in a fixed and definite manner. The proof appears from Prop. xv. and Def. v."
      },
      {
         "name": "1P26",
         "DisplayName": "I Proposition 26",
         "ShortText": "God and only God can determine a thing to action",
         "group": 3, "InDegree": "2",
         "OutDegree": "2",
         "tier_y": 11,
         "tier_x": 2,
         "contents": "A thing which is conditioned to act in a particular manner, has necessarily been thus conditioned by God; and that which has not been conditioned by God cannot condition itself to act. Proof.—That by which things are said to be conditioned to act in a particular manner is necessarily something positive (this is obvious); therefore both of its essence and of its existence God by the necessity of his nature is the efficient cause (Props. xxv. and xvi.); this is our first point. Our second point is plainly to be inferred therefrom. For if a thing, which has not been conditioned by God, could condition itself, the first part of our proof would be false, and this, as we have shown is absurd."
      },
      {
         "name": "1P27",
         "DisplayName": "I Proposition 27",
         "ShortText": "A thing determined to an action by God cannot become indeterminate",
         "group": 3, "InDegree": "1",
         "OutDegree": "1",
         "tier_y": 2,
         "tier_x": 8,
         "contents": "The idea of each modification of the human body does not involve an adequate knowledge of the human body itself. Proof.--Every idea of a modification of the human body involves the nature of the human body, in so far as the human body is regarded as affected in a given manner (II. xvi.).  But, inasmuch as the human body is an individual which may be affected in many other ways, the idea of the said modification, &c. Q.E.D."
      },
      {
         "name": "1P28",
         "DisplayName": "I Proposition 28",
         "ShortText": "Finite things determined to actions by other finite things",
         "group": 3, "InDegree": "8",
         "OutDegree": "7",
         "tier_y": 12,
         "tier_x": 2,
         "contents": "Every individual thing, or everything which is finite and has a conditioned existence, cannot exist or be conditioned to act, unless it be conditioned for existence and action by a cause other than itself, which also is finite, and has a conditioned existence; and likewise this cause cannot in its turn exist, or be conditioned to act, unless it be conditioned for existence and action by another cause, which also is finite, and has a conditioned existence, and so on to infinity. Proof.—Whatsoever is conditioned to exist and act, has been thus conditioned by God (by Prop. xxvi. and Prop. xxiv., Coroll.). But that which is finite, and has a conditioned existence, cannot be produced by the absolute nature of any attribute of God; for whatsoever follows from the absolute nature of any attribute of God is infinite and eternal (by Prop. xxi.). It must, therefore, follow from some attribute of God, in so far as the said attribute is considered as in some way modified; for substance and modes make up the sum total of existence (by Ax. i. and Def. iii., v.), while modes are merely modifications of the attributes of God. But from God, or from any of his attributes, in so far as the latter is modified by a modification infinite and eternal, a conditioned thing cannot follow. Wherefore it must follow from, or be conditioned for, existence and action by God or one of his attributes, in so far as the latter are modified by some modification which is finite, and has a conditioned existence. This is our first point. Again, this cause or this modification (for the reason by which we established the first part of this proof) must in its turn be conditioned by another cause, which also is finite, and has a conditioned existence, and, again, this last by another (for the same reason); and so on (for the same reason) to infinity. Q.E.D"
      },
      {
         "name": "1P29",
         "DisplayName": "I Proposition 29",
         "ShortText": "In Nature is nothing contingent",
         "group": 3, "InDegree": "6",
         "OutDegree": "6",
         "tier_y": 12,
         "tier_x": 4,
         "contents": "Nothing in the universe is contingent, but all things are conditioned to exist and operate in a particular manner by the necessity of the divine nature. Proof.—Whatsoever is, is in God (Prop. xv.). But God cannot be called a thing contingent. For (by Prop. xi.) he exists necessarily, and not contingently. Further, the modes of the divine nature follow therefrom necessarily, and not contingently (Prop. xvi.); and they thus follow, whether we consider the divine nature absolutely, or whether we consider it as in any way conditioned to act (Prop. xxvii.). Further, God is not only the cause of these modes, in so far as they simply exist (by Prop. xxiv, Coroll.), but also in so far as they are considered as conditioned for operating in a particular manner (Prop. xxvi.). If they be not conditioned by God (Prop. xxvi.), it is impossible, and not contingent, that they should condition themselves; contrariwise, if they be conditioned by God, it is impossible, and not contingent, that they should render themselves unconditioned. Wherefore all things are conditioned by the necessity of the divine nature, not only to exist, but also to exist and operate in a particular manner, and there is nothing that is contingent. Q.E.D."
      },

      {
         "name": "1P30",
         "DisplayName": "I Proposition 30",
         "ShortText": "Actual intellect comprehends attributes of God",
         "group": 3, "InDegree": "3",
         "OutDegree": "1",
         "tier_y": 9,
         "tier_x": 6,
         "contents": "Intellect, in function (actu) finite, or in function infinite, must comprehend the attributes of God and the modifications of God, and nothing else. Proof.—A true idea must agree with its object (Ax. vi.); in other words (obviously), that which is contained in the intellect in representation must necessarily be granted in nature. But in nature (by Prop. xiv., Coroll. i.) there is no substance save God, nor any modifications save those (Prop. xv.) which are in God, and cannot without God either be or be conceived. Therefore the intellect, in function finite, or in function infinite, must comprehend the attributes of God and the modifications of God, and nothing else. Q.E.D."
      },
      {
         "name": "1P31",
         "DisplayName": "I Proposition 31",
         "ShortText": "The actual intellect must be referred to natura naturata",
         "group": 3, "InDegree": "4",
         "OutDegree": "0",
         "tier_y": 9,
         "tier_x": 7,
         "contents": "The intellect in function, whether finite or infinite, as will, desire, love, &c., should be referred to passive nature and not to active nature. Proof.—By the intellect we do not (obviously) mean absolute thought, but only a certain mode of thinking, differing from other modes, such as love, desire, &c., and therefore (Def. v.) requiring to be conceived through absolute thought. It must (by Prop. xv. and Def. vi.), through some attribute of God which expresses the eternal and infinite essence of thought, be so conceived, that without such attribute it could neither be nor be conceived. It must therefore be referred to nature passive rather than to nature active, as must also the other modes of thinking. Q.E.D."
      },
      {
         "name": "1P32",
         "DisplayName": "I Proposition 32",
         "ShortText": "The will cannnot be a free cause",
         "group": 3, "InDegree": "3",
         "OutDegree": "2",
         "tier_y": 13,
         "tier_x": 2,
         "contents": "Will cannot be called a free cause, but only a necessary cause. Proof.—Will is only a particular mode of thinking, like intellect; therefore (by Prop. xxviii.) no volition can exist, nor be conditioned to act, unless it be conditioned by some cause other than itself, which cause is conditioned by a third cause, and so on to infinity. But if will be supposed infinite, it must also be conditioned to exist and act by God, not by virtue of his being substance absolutely infinite, but by virtue of his possessing an attribute which expresses the infinite and eternal essence of thought (by Prop. xxiii.). Thus, however it be conceived, whether as finite or infinite, it requires a cause by which it should be conditioned to exist and act. Thus (Def. vii.) it cannot be called a free cause, but only a necessary or constrained cause. Q.E.D."
      },
      {
         "name": "1P32C02",
         "DisplayName": "I Proposition 32 Corollary 2",
         "ShortText": "Will and intellect related as motion and rest",
         "group": 4, "InDegree": "2",
         "OutDegree": "0",
         "tier_y": 14,
         "tier_x": 3,
         "contents":"It follows, secondly, that will and intellect stand in the same relation to the nature of God as do motion, and rest, and absolutely all natural phenomena, which must be conditioned by God (Prop. xxix.) to exist and act in a particular manner. For will, like the rest, stands in need of a cause, by which it is conditioned to exist and act in a particular manner. And although, when will or intellect be granted, an infinite number of results may follow, yet God cannot on that account be said to act from freedom of the will, any more than the infinite number of results from motion and rest would justify us in saying that motion and rest act by free will. Wherefore will no more appertains to God than does anything else in nature, but stands in the same relation to him as motion, rest, and the like, which we have shown to follow from the necessity of the divine nature, and to be conditioned by it to exist and act in a particular manner."
      },
      {
         "name": "1P33",
         "DisplayName": "I Proposition 33",
         "ShortText": "Things are produced by God in the only possible order.",
         "group": 3, "InDegree": "4",
         "OutDegree": "2",
         "tier_y": 13,
         "tier_x": 3,
         "contents":"Things could not have been brought into being by God in any manner or in any order different from that which has in fact obtained. Proof—All things necessarily follow from the nature of God (Prop. xvi.), and by the nature of God are conditioned to exist and act in a particular way (Prop. xxix.). If things, therefore, could have been of a different nature, or have been conditioned to act in a different way, so that the order of nature would have been different, God's nature would also have been able to be different from what it now is; and therefore (by Prop. xi.) that different nature also would have perforce existed, and consequently there would have been able to be two or more Gods. This (by Prop. xiv., Coroll. i.) is absurd. Therefore things could not have been brought into being by God in any other manner, &c. Q.E.D."
      },
      {
         "name": "1P34",
         "DisplayName": "I Proposition 34",
         "ShortText": "The power of God is His essence itself",
         "group": 3, "InDegree": "3",
         "OutDegree": "4",
         "tier_y": 7,
         "tier_x": 5,
         "contents": "God's power is identical with his essence. Proof.—From the sole necessity of the essence of God it follows that God is the cause of himself (Prop. xi.) and of all things (Prop. xvi. and Coroll.). Wherefore the power of God, by which he and all things are and act, is identical with his essence. Q.E.D."
      },
      {
         "name": "1P35",
         "DisplayName": "I Proposition 35",
         "ShortText": "Whatever we conceive to be in God's power necessarily exists",
         "group": 3, "InDegree": "1",
         "OutDegree": "1",
         "tier_y": 9,
         "tier_x": 6,
         "contents": "Whatsoever we conceive to be in the power of God, necessarily exists. Proof.—Whatsoever is in God's power, must (by the last Prop.) be comprehended in his essence in such a manner, that it necessarily follows therefrom, and therefore necessarily exists. Q.E.D."
      },
      {
         "name": "1P36",
         "DisplayName": "I Proposition 36",
         "ShortText": "Nothing exists from whose nature an effect does not follow",
         "group": 3, "InDegree": "3",
         "OutDegree": "2",
         "tier_y": 11,
         "tier_x": 3,
         "contents": "There is no cause from whose nature some effect does not follow. Proof.—Whatsoever exists expresses God's nature or essence in a given conditioned manner (by Prop. xxv., Coroll.); that is, (by Prop. xxxiv.), whatsoever exists, expresses in a given conditioned manner God's power, which is the cause of all things, therefore an effect must (by Prop. xvi.) necessarily follow. Q.E.D."
      },
      {
         "name": "1P06C01",
         "DisplayName": "I Proposition 6 Corollary 1",
         "ShortText": "There is nothing by which substance can be produced",
         "group": 4, "InDegree": "4",
         "OutDegree": "1",
         "tier_y": 5,
         "tier_x": 4,
         "contents": "Hence it follows that a substance cannot be produced by anything external to itself. For in the universe nothing is granted, save substances and their modifications (as appears from Ax. i. and Deff. iii. and v.). Now (by the last Prop.) substance cannot be produced by another substance, therefore it cannot be produced by anything external to itself. Q.E.D. This is shown still more readily by the absurdity of thecontradictory. For, if substance be produced by an external cause, the knowledge of it would depend on the knowledge of its cause (Ax. iv.), and (by Def. iii.) it would itself not be substance." 
      },
      {
         "name": "1P14C01",
         "DisplayName": "I Proposition 14 Corollary 1",
         "ShortText": "No substance is divisible",
         "group": 4, "InDegree": "2",
         "OutDegree": "5",
         "tier_y": 8,
         "tier_x": 4,
         "contents": "Clearly, therefore: 1. God is one, that is (by Def. vi.) only one substance can be granted in the universe, and that substance is absolutely infinite, as we have already indicated (in the note to Prop. x.)."
      },
      {
         "name": "1P14C02",
         "DisplayName": "I Proposition 14 Corollary 2",
         "ShortText": "Thinking things and extended things are attributes or modifications of God",
         "group": 4, "InDegree": "2",
         "OutDegree": "0",
         "tier_y": 8,
         "tier_x": 5,
         "contents": "It follows: 2. That extension and thought are either attributes of God or (by Ax. i.) accidents (affectiones) of the attributes of God."
      },
      {
         "name": "1P16C01",
         "DisplayName": "I Proposition 16 Corollary 1",
         "ShortText": "God is cause of himself, not through anything contingent",
         "group": 4, "InDegree": "1",
         "OutDegree": "2",
         "tier_y": 3,
         "tier_x": 3,
         "contents":"Hence it follows, that God is the efficient cause of all that can fall within the sphere of an infinite intellect. "
      },
      {
         "name": "1P16C02",
         "DisplayName": "I Proposition 16 Corollary 2",
         "ShortText": "God is cause through Himself, and not through that which is contingent",
         "group": 4, "InDegree": "1",
         "OutDegree": "0",
         "tier_y": 3,
         "tier_x": 4,
         "contents":"It also follows that God is a cause in himself, and not through an accident of his nature."
      },
      {
         "name": "1P16C03",
         "DisplayName": "I Proposition 16 Corollary 3",
         "ShortText": "God is absolutely the first cause",
         "group": 4, "InDegree": "1",
         "OutDegree": "0",
         "tier_y": 3,
         "tier_x": 5,
         "contents": "It follows, thirdly, that God is the absolutely first cause."
      },
      {
         "name": "1P17C01",
         "DisplayName": "I Proposition 17 Corollary 1",
         "ShortText": "God acts only through the perfection of His nature",
         "group": 4, "InDegree": "1",
         "OutDegree": "0",
         "tier_y": 10,
         "tier_x": 4,
         "contents": "--It follows: 1. That there can be no cause which, either extrinsically or intrinsically, besides the perfection of his own nature, moves God to act."
      },
      {
         "name": "1P20C01",
         "DisplayName": "I Proposition 20 Corollary 1",
         "ShortText": "The existence of God is an eternal truth",
         "group": 4, "InDegree": "1",
         "OutDegree": "0",
         "tier_y": 9,
         "tier_x": 1,
         "contents": "Hence it follows that God's existence, like his essence, is an eternal truth."
      },
      {
         "name": "1P24C01",
         "DisplayName": "I Proposition 24 Corollary 1",
         "ShortText": "God the cause of continued existence of things",
         "group": 4, "InDegree": "2",
         "OutDegree": "2",
         "tier_y": 3,
         "tier_x": 1,
         "contents": "Hence it follows that God is not only the cause of things coming into existence, but also of their continuing in existence, that is, in scholastic phraseology, God is cause of the being of things (essendi rerum). For whether things exist, or do not exist, whenever we contemplate their essence, we see that it involves neither existence nor duration; consequently, it cannot be the cause of either the one or the other. God must be the sole cause, inasmuch as to him alone does existence appertain. (Prop. xiv. Coroll. i.) Q.E.D."
      },
      {
         "name": "1P32C01",
         "DisplayName": "I Proposition 32 Corollary 1",
         "ShortText": "God does not act from freedom of will",
         "group": 4, "InDegree": "1",
         "OutDegree": "0",
         "tier_y": 14,
         "tier_x": 1,
         "contents": "Hence it follows, first, that God does not act according to freedom of the will."
      },
     
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
      ,"value": 1
      }, 
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
        "source": "1A03", 
        "target": "1P27"  
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
        "source": "1D07", 
        "target": "1P17C02" 
      ,"value": 1}, 
      { 
        "source": "1D07", 
        "target": "1P32"  
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
        "source": "1P22", 
        "target": "1P28"  
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
        "source": "1P25", 
        "target": "1P25C01" 
      ,"value": 1}, 
      { 
        "source": "1P25", 
        "target": "1P26"  
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
        "source": "1P32", 
        "target": "1P32C01" 
      ,"value": 1}, 
      { 
        "source": "1P32", 
        "target": "1P32C02" 
      ,"value": 1}, 
      { 
        "source": "1P34", 
        "target": "1P35"  
      ,"value": 1}, 
      { 
        "source": "1P34", 
        "target": "1P36"  
      ,"value": 1
     }

	]
   };   
    
}