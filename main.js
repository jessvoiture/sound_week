const margin = { top: 20, bottom: 40, left: 80, right: 20 };

const width = 700 - margin.left - margin.right;
const height = 700 - margin.top - margin.bottom;

const barSize = 50;

const colScale = d3.scaleOrdinal()
    .range(["#FF0000","#0D68FF","#8B0CE8", "#12c748"])
    .domain(["Youtube", "TV/Film", "Podcast", "Music"]);

const svg = d3.select('.viz')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

const div = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

d3.csv("https://raw.githubusercontent.com/jessvoiture/sound_week/main/datasets/sound_patterns_swimlanes.csv?version=123", d3.autotype).then(function(data){

    /* FORMAT DATA TYPES */
    // format time as 24 hour clock
    var parseTime = d3.timeParse("%H:%M");
    var formatTime = d3.timeFormat("%H:%M")

    // correct data types
    data.forEach(function(d) {
        d.Start = parseTime(d.Start);
        d.Stop = parseTime(d.Stop);
        d.Vol = +d.Vol;
    });
    
    /* SCALES */
    // x
    var x = d3.scaleTime()		
        .domain([0, 24]) // hours
        .range([0, width]);
    
    // y    
    var y = d3.scaleBand()
        .domain(["Mon", "Tues", "Wed", "Thur", "Fri", "Sat", "Sun"])
        .range([0, height]);

    // bind y axis to svg    
    svg.append("g")
        .call( d3.axisLeft(y) );

    // twenty four hour scale    
    var tfh = d3.scaleTime()
        .domain([parseTime('00:00'), parseTime('23:45')])
        .range([0, width]);

    // append x axis to svg
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(tfh)
             .ticks(d3.timeMinute.every(180))
             .tickFormat(d3.timeFormat("%H")))

    svg.append("text")
        .attr("class", "leg_text")
        .attr("x", width/2)
        .attr("y", height + margin.top + 20)
        .text("hour");
    
    /* add bars to chart */
    svg
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("class","sound_bar")
        .attr("x", function(d){
            return tfh(d.Start) 
        })
        .attr("y",function(d) { 
            return y(d.Day_abbr) + 21}
        )
        .attr("width",function(d){
            var hstart = d.Start,
                hstop = d.Stop;
                return x((hstop-hstart)/3600000);	//date operations return a timestamp in miliseconds, divide to convert to hours
        })
        .attr("height", barSize)
        .attr("rx", bar_curve_decider)
        .attr("ry", bar_curve_decider)
        .style("fill", function(d) { return colScale(d.Medium) })
        .style("opacity", function(d) { return d.Vol / 10})
        .on("mouseover", function(event, d) {

            div.transition()
                .duration(200)
                .style("opacity", 1);
  
            var element = d3.select(this);
            element.style("stroke", "#fbf7ff");
  
            div.html("<span class = tooltip_text>" + "I was listening to " + '<a href= "' + d.Source + '" target="_blank" >this</a>' + "</span>")
                .style("left", (event.pageX ) + "px")
                .style("top", (event.pageY) + "px");
            })
            
        .on("mouseout", function(d) {
            var element = d3.select(this)
            element.style("stroke", "none")
            });

    div
        .on('mouseover', function(d) {
            div
                .transition()
                .style("opacity", "1");
        })
        .on('mouseout', function(d) {
            div
                .transition()
                .duration(200)
                .style("opacity", "0");
        });

    function bar_curve_decider(d) {
        if (d.Method == "Earphones") {
            return 30;
        } else {
            return 0;
        }
    }
        

})


/* LEGEND */
const leg_data = [
    { Type: 'Youtube',  Color: "#FF0000", Opacity: 1,   Volume: 'Loud', rx: 20,     Method: "Earphones"},
    { Type: 'TV/Film',  Color: "#0D68FF", Opacity: 0.65,                rx: 0,      Method: "Speaker"},
    { Type: 'Podcast',  Color: "#8B0CE8", Opacity: 0.1, Volume: 'Quiet',rx: -1},
    { Type: 'Music',    Color: "#12c748",                               rx: -4}
  ];

const circ_size = 20
const sq_size = 40
const circ_padding = 100
const circ_x_slide = 20
const circ_y_slide = 40

const color_leg = d3.select('.color_leg')
    .append('svg')
    .attr('width', 500)
    .attr('height', circ_y_slide + circ_size + 40)
    .append('g')

const opac_leg = d3.select('.opacity_leg')
    .append('svg')
    .attr('width', 500)
    .attr('height', circ_y_slide + circ_size + 40)
    .append('g')

const shape_leg = d3.select('.shape_leg')
    .append('svg')
    .attr('width', 500)
    .attr('height', circ_y_slide + circ_size + 40)
    .append('g')

color_leg
    .selectAll(null)
    .data(leg_data)
    .enter()
    .append("circle")
    .attr("class", 'legend')
    .attr("r", circ_size)
    // .attr("height", size)
    .attr("cx", function(d, i) {
        return (i * circ_padding) + circ_x_slide
    })
    .attr("cy", circ_y_slide)
    .style("fill", function(d) { 
        return d.Color })

color_leg
    .selectAll(null)
    .data(leg_data)
    .enter()    
    .append("text")
    .attr("class", "legend_desc")
    .attr("x", function(d, i) {
        return (i * circ_padding) + circ_x_slide
    })
    .attr("y", circ_y_slide + circ_size)
    .text(function(d) { return d.Type});

opac_leg
    .selectAll(null)
    .data(leg_data)
    .enter()
    .append("circle")
    .filter(function(d) { return d.rx >= -1})
    .attr("class", 'legend')
    .attr("r", circ_size)
    .attr("cx", function(d, i) {
        return (i * circ_padding) + circ_x_slide
    })
    .attr("cy", circ_y_slide)
    .style("fill", "#FF0000")
    .style("opacity", function(d){ return d.Opacity})

opac_leg
    .selectAll(null)
    .data(leg_data)
    .enter()    
    .append("text")
    .attr("class", "legend_desc")
    .attr("x", function(d, i) {
        return (i * circ_padding) + circ_x_slide
    })
    .attr("y", circ_y_slide + circ_size)
    .text(function(d) { return d.Volume});

shape_leg
    .selectAll(null)
    .data(leg_data)
    .enter()
    .append("rect")
    .filter(function(d) { return d.rx > -1})
    .attr("class", 'legend')
    .attr("width", sq_size)
    .attr("height", sq_size)
    .attr("x", function(d, i) {
        return (i * circ_padding * 1.1)
    })
    .attr("y", 20)
    .style("fill", "#FF0000")
    .attr("rx", function(d){return d.rx})
    .attr("ry", function(d){return d.rx})

shape_leg
    .selectAll(null)
    .data(leg_data)
    .enter()    
    .append("text")
    .attr("class", "legend_desc")
    .attr("x", function(d, i) {
        return (i * circ_padding * 1.1) + circ_x_slide
    })
    .attr("y", circ_y_slide + circ_size)
    .text(function(d) { return d.Method});
