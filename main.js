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

    function bar_curve_decider(d) {
        if (d.Method == "Earphones") {
            return 10;
        } else if (d.Method == "Outloud")  {
            return 4;
        } else {
            return 0;
        }
    }
        

})
