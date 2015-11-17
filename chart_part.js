function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function wordwrap( str, width, brk, cut ) {
 
    brk = brk || 'n';
    width = width || 75;
    cut = cut || false;
 
    if (!str) { return str; }
 
    var regex = '.{1,' +width+ '}(\s|$)' + (cut ? '|.{' +width+ '}|.+$' : '|\S+?(\s|$)');
 
    return str.match( RegExp(regex, 'g') ).join( brk );
 
}


var width = 1600,
    height = 1800;

var node_radius = 35;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
    .size([width, height]);
	
var tier_width = 90,
    tier_height = 120;

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
    .offset([-25, 0])
    .html(function (d) {
    return  d.DisplayName  + "";
})

var explanation = d3.tip()
.attr('class', 'd3-explanation')
.offset([75,285])
.style("font", "16px helvetica")
.style("padding", "10px")
.style("color", "#000")
.style("line-height", "1")
.style("font-weight", "bold")
.style("text-align", "left")
.style("background", "rgba(200, 200, 200, 0.75)")
.style("max-width", "500px")
//.attr("x", 200)
//.attr("y", 300)
.html(function (d) {
if (d.contents) {return "<span>" + d.contents + "</span>";} else {return;} });

svg.call(tip);
svg.call(explanation);


// var explanation_box = d3.select("body")
//   .append("div")
//   .style("position", "absolute")
//   .style("z-index", "10")
//   .style("visibility", "hidden")
//   .text("a simple tooltip");

function show_things(d)
{

  tip.show(d);
  explanation.show(d);
 // explanation_box.style("visibility", "visible");
}

function hide_things(d)
{
 
  tip.hide(d);
  explanation.hide(d);
//    explanation_box.style("visibility", "hidden");
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
         "tier_x": 1,
         "contents": "I. By that which is self-caused, I mean that of which the essence involves existence, or that of which the nature is only conceivable as existent."

      },
      {
         "name": "1D02",
         "DisplayName": "I Definition 2",
         "ShortText": "Definition: Finite in its kind",
         "group": 1, "InDegree": "0",
         "OutDegree": "2",
         "tier_y": 1,
         "tier_x": 2,
         "contents": "II. A thing is called finite after its kind, when it can be limited by another thing of the same nature; for instance, a body is called finite because we always conceive another greater body. So, also, a thought is limited by another thought, but a body is not limited by thought, nor a thought by body."

      },
      {
         "name": "1D03",
         "DisplayName": "I Definition 3",
         "ShortText": "Definition: Substance",
         "group": 1, "InDegree": "0",
         "OutDegree": "10",
         "tier_y": 1,
         "tier_x": 3,
         "contents": "III. By substance, I mean that which is in itself, and is conceived through itself: in other words, that of which a conception can be formed independently of any other conception." 
      },
      {
         "name": "1D04",
         "DisplayName": "I Definition 4",
         "ShortText": "Definition: Attribute",
         "group": 1, "InDegree": "0",
         "OutDegree": "6",
         "tier_y": 1,
         "tier_x": 4,
         "contents": "IV. By attribute, I mean that which the intellect perceives as constituting the essence of substance."

      },
      {
         "name": "1D05",
         "DisplayName": "I Definition 5",
         "ShortText": "Definition: Mode",
         "group": 1, "InDegree": "0",
         "OutDegree": "10",
         "tier_y": 1,
         "tier_x": 5,
         "contents": "V. By mode, I mean the modifications of substance, or that which exists in, and is conceived through, something other than itself."

      },
      {
         "name": "1D06",
         "DisplayName": "I Definition 6",
         "ShortText": "Definition: God",
         "group": 1, "InDegree": "0",
         "OutDegree": "11",
         "tier_y": 1,
         "tier_x": 6,
         "contents": "VI. By God, I mean a being absolutely infinite--that is, a substance consisting in infinite attributes, of which each expresses eternal and infinite essentiality.   Explanation--I say absolutely infinite, not infinite after its kind: for, of a thing infinite only after its kind, infinite attributes may be denied; but that which is absolutely infinite, contains in its essence whatever expresses reality, and involves no negation."

      },
      {
         "name": "1D07",
         "DisplayName": "I Definition 7",
         "ShortText": "Definition: Free",
         "group": 1, "InDegree": "0",
         "OutDegree": "3",
         "tier_y": 1,
         "tier_x": 7,
         "contents": "VII. That thing is called free, which exists solely by the necessity of its own nature, and of which the action is determined by itself alone. On the other hand, that thing is necessary, or rather constrained, which is determined by something external to itself to a fixed and definite method of existence or action."       },
      {
         "name": "1D08",
         "DisplayName": "I Definition 8",
         "ShortText": "Definition: Eternity",
         "group": 1, "InDegree": "0",
         "OutDegree": "5",
         "tier_y": 1,
         "tier_x": 7,
         "contents": "VIII. By eternity, I mean existence itself, in so far as it is conceived necessarily to follow solely from the definition of that which is eternal.   Explanation--Existence of this kind is conceived as an eternal truth, like the essence of a thing, and, therefore, cannot be explained by means of continuance or time, though continuance may be conceived without a beginning or end."

      },
      {
         "name": "1A01",
         "DisplayName": "I Axiom 1",
         "ShortText": "Axiom: In itself or in another",
         "group": 0, "InDegree": "0",
         "OutDegree": "8",
         "tier_y": 1,
         "tier_x": 10,
         "contents": "I. Everything which exists, exists either in itself or in something else."
      },
      {
         "name": "1A02",
         "DisplayName": "I Axiom 2",
         "ShortText": "Axiom: Not conceived through another, through itself",
         "group": 0, "InDegree": "0",
         "OutDegree": "11",
         "tier_y": 1,
         "tier_x": 11,
         "contents": "II. That which cannot be conceived through anything else must be conceived through itself."
      },
      {
         "name": "1A03",
         "DisplayName": "I Axiom 3",
         "ShortText": "Axiom: Effect from cause",
         "group": 0, "InDegree": "0",
         "OutDegree": "2",
         "tier_y": 1,
         "tier_x": 12,
         "contents":"III. From a given definite cause an effect necessarily follows; and, on the other hand, if no definite cause be granted, it is impossible that an effect can follow."
         },
      {
         "name": "1A04",
         "DisplayName": "I Axiom 4",
         "ShortText": "Axiom: Knowledge of effect from knowledge of cause",
         "group": 0, "InDegree": "0",
         "OutDegree": "9",
         "tier_y": 1,
         "tier_x": 13,
         "contents":"IV. The knowledge of an effect depends on and involves the knowledge of a cause."
      },
      {
         "name": "1A05",
         "DisplayName": "I Axiom 5",
         "ShortText": "Axiom: Nothing in common, no knowledge in common",
         "group": 0, "InDegree": "0",
         "OutDegree": "1",
         "tier_y": 1,
         "tier_x": 14,
         "contents": "V. Things which have nothing in common cannot be understood, the one by means of the other; the conception of one does not involve the conception of the other."
      },
      {
         "name": "1A06",
         "DisplayName": "I Axiom 6",
         "ShortText": "Axiom: True idea agrees with ideato",
         "group": 0, "InDegree": "0",
         "OutDegree": "6",
         "tier_y": 1,
         "tier_x": 15,
         "contents": "VI. A true idea must correspond with its ideate or object."
      },
      {
         "name": "1A07",
         "DisplayName": "I Axiom 7",
         "ShortText": "Axiom: If conceived not existing, then essence not requires existence",
         "group": 0, "InDegree": "0",
         "OutDegree": "1",
         "tier_y": 1,
         "tier_x": 16,
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
         "tier_x": 5
      },
      {
         "name": "1P17C02",
         "DisplayName": "I Proposition 17 Corollary 2",
         "ShortText": "God alone is a free cause",
         "group": 4, "InDegree": "6",
         "OutDegree": "1",
         "tier_y": 10,
         "tier_x": 5
      },
      {
         "name": "1P18",
         "DisplayName": "I Proposition 18",
         "ShortText": "God is the immanent cause of all things",
         "group": 3, "InDegree": "4",
         "OutDegree": "0",
         "tier_y": 9,
         "tier_x": 3
      },
      {
         "name": "1P19",
         "DisplayName": "I Proposition 19",
         "ShortText": "God is eternal; all His attributes are eternal",
         "group": 3, "InDegree": "5",
         "OutDegree": "2",
         "tier_y": 7,
         "tier_x": 2
      },
      {
         "name": "1P20",
         "DisplayName": "I Proposition 20",
         "ShortText": "The existence and essence or God are one and the same",
         "group": 3, "InDegree": "3",
         "OutDegree": "2",
         "tier_y": 8,
         "tier_x": 1
      },
      {
         "name": "1P20C02",
         "DisplayName": "I Proposition 20 Corollary 2",
         "ShortText": "God is immutable",
         "group": 4, "InDegree": "1",
         "OutDegree": "2",
         "tier_y": 9,
         "tier_x": 2
      },
      {
         "name": "1P21",
         "DisplayName": "I Proposition 21",
         "ShortText": "What follows from God's nature is infinite and exists forever",
         "group": 3, "InDegree": "3",
         "OutDegree": "6",
         "tier_y": 10,
         "tier_x": 2
      },
      {
         "name": "1P22",
         "DisplayName": "I Proposition 22",
         "ShortText": "What follows from an attribute as modified, exists forever and is infinite",
         "group": 3, "InDegree": "1",
         "OutDegree": "2",
         "tier_y": 10,
         "tier_x": 1
      },
      {
         "name": "1P23",
         "DisplayName": "I Proposition 23",
         "ShortText": "Every mode which exists infinitely follows from an attribute or an infinite mode",
         "group": 3, "InDegree": "5",
         "OutDegree": "1",
         "tier_y": 11,
         "tier_x": 1
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
         "tier_x": 4
      },
      {
         "name": "1P25C01",
         "DisplayName": "I Proposition 25 Corollary",
         "ShortText": "Individual things are modifications or modes of God's attributes",
         "group": 4, "InDegree": "3",
         "OutDegree": "9",
         "tier_y": 10,
         "tier_x": 3
      },
      {
         "name": "1P26",
         "DisplayName": "I Proposition 26",
         "ShortText": "God and only God can determine a thing to action",
         "group": 3, "InDegree": "2",
         "OutDegree": "2",
         "tier_y": 11,
         "tier_x": 2
      },
      {
         "name": "1P27",
         "DisplayName": "I Proposition 27",
         "ShortText": "A thing determined to an action by God cannot become indeterminate",
         "group": 3, "InDegree": "1",
         "OutDegree": "1",
         "tier_y": 2,
         "tier_x": 8,
         "contents":"The idea of each modification of the human body does not involve an adequate knowledge of the human body itself. Proof.--Every idea of a modification of the human body involves the nature of the human body, in so far as the human body is regarded as affected in a given manner (II. xvi.).  But, inasmuch as the human body is an individual which may be affected in many other ways, the idea of the said modification, &c. Q.E.D."
      },
      {
         "name": "1P28",
         "DisplayName": "I Proposition 28",
         "ShortText": "Finite things determined to actions by other finite things",
         "group": 3, "InDegree": "8",
         "OutDegree": "7",
         "tier_y": 12,
         "tier_x": 2
      },
      {
         "name": "1P29",
         "DisplayName": "I Proposition 29",
         "ShortText": "In Nature is nothing contingent",
         "group": 3, "InDegree": "6",
         "OutDegree": "6",
         "tier_y": 12,
         "tier_x": 4
      },

      {
         "name": "1P30",
         "DisplayName": "I Proposition 30",
         "ShortText": "Actual intellect comprehends attributes of God",
         "group": 3, "InDegree": "3",
         "OutDegree": "1",
         "tier_y": 9,
         "tier_x": 6
      },
      {
         "name": "1P31",
         "DisplayName": "I Proposition 31",
         "ShortText": "The actual intellect must be referred to natura naturata",
         "group": 3, "InDegree": "4",
         "OutDegree": "0",
         "tier_y": 9,
         "tier_x": 7
      },
      {
         "name": "1P32",
         "DisplayName": "I Proposition 32",
         "ShortText": "The will cannnot be a free cause",
         "group": 3, "InDegree": "3",
         "OutDegree": "2",
         "tier_y": 13,
         "tier_x": 2
      },
      {
         "name": "1P32C02",
         "DisplayName": "I Proposition 32 Corollary 2",
         "ShortText": "Will and intellect related as motion and rest",
         "group": 4, "InDegree": "2",
         "OutDegree": "0",
         "tier_y": 14,
         "tier_x": 3
      },
      {
         "name": "1P33",
         "DisplayName": "I Proposition 33",
         "ShortText": "Things are produced by God in the only possible order.",
         "group": 3, "InDegree": "4",
         "OutDegree": "2",
         "tier_y": 13,
         "tier_x": 3
      },
      {
         "name": "1P34",
         "DisplayName": "I Proposition 34",
         "ShortText": "The power of God is His essence itself",
         "group": 3, "InDegree": "3",
         "OutDegree": "4",
         "tier_y": 7,
         "tier_x": 5
      },
      {
         "name": "1P35",
         "DisplayName": "I Proposition 35",
         "ShortText": "Whatever we conceive to be in God's power necessarily exists",
         "group": 3, "InDegree": "1",
         "OutDegree": "1",
         "tier_y": 9,
         "tier_x": 6
      },
      {
         "name": "1P36",
         "DisplayName": "I Proposition 36",
         "ShortText": "Nothing exists from whose nature an effect does not follow",
         "group": 3, "InDegree": "3",
         "OutDegree": "2",
         "tier_y": 11,
         "tier_x": 3
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
         "tier_x": 4
      },
      {
         "name": "1P14C02",
         "DisplayName": "I Proposition 14 Corollary 2",
         "ShortText": "Thinking things and extended things are attributes or modifications of God",
         "group": 4, "InDegree": "2",
         "OutDegree": "0",
         "tier_y": 8,
         "tier_x": 5
      },
      {
         "name": "1P16C01",
         "DisplayName": "I Proposition 16 Corollary 1",
         "ShortText": "God is cause of  himself, not through anything contingent",
         "group": 4, "InDegree": "1",
         "OutDegree": "2",
         "tier_y": 3,
         "tier_x": 3
      },
      {
         "name": "1P16C02",
         "DisplayName": "I Proposition 16 Corollary 2",
         "ShortText": "God is cause through Himself, and not through that which is contingent",
         "group": 4, "InDegree": "1",
         "OutDegree": "0",
         "tier_y": 3,
         "tier_x": 4
      },
      {
         "name": "1P16C03",
         "DisplayName": "I Proposition 16 Corollary 3",
         "ShortText": "God is absolutely the first cause",
         "group": 4, "InDegree": "1",
         "OutDegree": "0",
         "tier_y": 3,
         "tier_x": 5
      },
      {
         "name": "1P17C01",
         "DisplayName": "I Proposition 17 Corollary 1",
         "ShortText": "God acts only through the perfection of His nature",
         "group": 4, "InDegree": "1",
         "OutDegree": "0",
         "tier_y": 10,
         "tier_x": 4
      },
      {
         "name": "1P20C01",
         "DisplayName": "I Proposition 20 Corollary 1",
         "ShortText": "The existence of God is an eternal truth",
         "group": 4, "InDegree": "1",
         "OutDegree": "0",
         "tier_y": 9,
         "tier_x": 1
      },
      {
         "name": "1P24C01",
         "DisplayName": "I Proposition 24 Corollary 1",
         "ShortText": "God the cause of continued existence of things",
         "group": 4, "InDegree": "2",
         "OutDegree": "2",
         "tier_y": 3,
         "tier_x": 1
      },
      {
         "name": "1P32C01",
         "DisplayName": "I Proposition 32 Corollary 1",
         "ShortText": "God does not act from freedom of will",
         "group": 4, "InDegree": "1",
         "OutDegree": "0",
         "tier_y": 14,
         "tier_x": 1
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