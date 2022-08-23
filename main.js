// set up

const margin = { top: 20, bottom: 20, left: 20, right: 20 };

const width = 675 - margin.left - margin.right;
const height = 200 - margin.top - margin.bottom;

const svg = d3.select('.viz')
  .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);


// create different groups for the top and bottom chart

const paddingBetweenCharts = 20;
const chartHeight = (height / 2) - paddingBetweenCharts;

const topChart = svg.append('g');
const bottomChart = svg.append('g')
    .attr('transform', `translate(0,${(height / 2) + paddingBetweenCharts})`);

// data

const data = [
  { x: 'TC11', y: 2, },
  { x: 'TC10', y: 3, },
  { x: 'TC9', y: 2, },
  { x: 'TC8', y: 1.5, },
  { x: 'TC7', y: 2, },
  { x: 'TC6', y: 2, },
  { x: 'TC5', y: 3, },
  { x: 'TC4', y: 1, },
  { x: 'TC3', y: 2, },
  { x: 'TC2', y: 1.5, },
  { x: 'TC1', y: 2, },
];

// scales

const x = d3.scalePoint()
    .domain(["TC11", "TC10", "TC9", "TC8", "TC7", "TC6", "TC5", "TC4", "TC3", "TC2", "TC1"])
    .range([0, width]);

const y = d3.scaleLinear()
    .domain([0, d3.max(data, d =>  d.y)])
    .range([chartHeight, 0]);

// mirror y scale by flipping range
const yMirrored = y.copy().range([0, chartHeight]);


// axis generators

const xAxis = d3.axisBottom(x);
const xAxisMirrored = d3.axisTop(x);


// area generators

const area = d3.area()
    .x(d => x(d.x))
    .y0(y(0))
    .y1(d => y(d.y));

const areaMirrored = d3.area()
    .x(d => x(d.x))
    .y0(d => yMirrored(d.y))
    .y1(yMirrored(0));


// top chart

topChart.append("path")
    .datum(data)
    .style("fill", "#D04242")
    .attr("d", areaMirrored);

topChart.append("g")
    .attr("class", "x axis")
    .call(xAxisMirrored);


// bottom chart

bottomChart.append("path")
    .datum(data)
    .style("fill", "#D04242")
    .attr("d", area);

bottomChart.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(xAxis);