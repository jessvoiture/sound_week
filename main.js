const margin = { top: 20, bottom: 40, left: 80, right: 20 };

const width = 1300 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const padding = 0.05

const svg = d3.select('.viz')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

d3.csv("https://raw.githubusercontent.com/jessvoiture/sound_week/main/datasets/sound_patterns_real.csv?version=123", d3.autotype).then(function(data){

    // FORMAT THE DATES
    // format time as 24 hour clock
    var parseTime = d3.timeParse("%H:%M");
    var formatTime = d3.timeFormat("%H:%M")

    // parse time column
    data.forEach(function(d) {
        d.Time = parseTime(d.Time);
        d.Vol = +d.Vol;
    });

    // VERIFYING DATA TYPES
    // var variables = data.columns;
    // variables.forEach(function(d) { console.log("typeof " + d + ": " + typeof(data[1][d]))})

    // SET UP X SCALE
    var x = d3.scaleTime()
        .domain([parseTime('00:00'), parseTime('23:45')])
        .range([0, width]);

    // append x axis to svg
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
             .ticks(d3.timeMinute.every(60))
             .tickFormat(d3.timeFormat("%H")))

    // SET UP Y SCALE
    var y = d3.scaleBand()
        .range([ 0, height ])
        .domain(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
        .padding(padding);     // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum.
 
    // append y axis to svg
    svg.append("g")
        .call( d3.axisLeft(y) );

    var histogram = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(48)) // 24 hr x (2 * 30 min) / hr = 48
        .value(d => d.Vol);

    const maxNum = d3.max(data, function(d) { return d.Vol; });

    var yNum = d3.scaleLinear()
        .range([0, y.bandwidth()])
        .domain([-maxNum,maxNum]);

    const day_data = d3.group(data, d => d['Day of Week']);
    var keys = Array.from(day_data.keys())
    var values = Array.from(day_data.values())
    svg
        .selectAll("myViolin")
        .data(values)
        .enter()
        .append("g")
        .attr("transform", function(d, i){ 
            return("translate(" + 0 + "," + (y(d[i]['Day of Week'])) + ")") 
        })
        .append("path")
        // .datum(d => d[1])    // So now we are working bin per bin
        .style("stroke", "none")
        .style("fill","#69b3a2")
        .attr("d", d3.area()
            .y0(function(d, i){
                return(yNum(-d.Vol))} )
            .y1(function(d){ 
                return(yNum(d.Vol)) } )
            .x(function(d){ 
                return(x(d.Time)) } )
            .curve( d3.curveMonotoneY) // d3.curveCatmullRom.alpha(1)   // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
            )

})
