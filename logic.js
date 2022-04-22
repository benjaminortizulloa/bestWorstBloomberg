let bodyDim = d3.select('body').node().getBoundingClientRect();
let svgDim = bodyDim.width < bodyDim.height ? Math.floor(bodyDim.width) : Math.floor(bodyDim.height)
let r = 7
let margins = r * 2

let svg = d3.select('svg')
    .attr('width', svgDim)
    .attr('height', svgDim)
    .attr('viewBox', `0 0 ${svgDim} ${svgDim}`)

// let networkX_domain = d3.extent(bestWorst.nodes, d => d.x_network)
// let networkY_domain = d3.extent(bestWorst.nodes, d => d.y_network)

// let networkX = d3.scaleLinear()
//     .domain(networkX_domain)
//     .range([0 + margins, svgDim- margins]);

// let networkY = d3.scaleLinear()
//     .domain(networkY_domain)
//     .range([svgDim - margins, 0+margins])

// let edgeG = svg.append('g').attr('id', "edgeG"
// )
let nodeG = svg.append('g').attr('id', 'nodeG')

// let edges = edgeG
//     .selectAll('.edges')
//     .data(bestWorst.edges)
//     .enter().append('line')
//     .attr("x1", d => networkX(d.from_x))
//     .attr('y1', d => networkY(d.from_y))
//     .attr('x2', d => networkX(d.to_x))
//     .attr('y2', d => networkY(d.to_y))
//     .attr('stroke', "black")
//     .attr('stroke-opacity', .4)

let barX = d3.scaleTime().domain([new Date(2012, 0, 1), new Date (2016, 07, 1)]).range([0 + margins, svgDim - margins])
let barY = d3.scaleLinear().domain(d3.extent(bestWorst.nodes, d => d.timeStack)).range([svgDim - r, 0 + r])

let nodes = nodeG
    .selectAll(".nodes")
    .data(bestWorst.nodes)
    .enter().append('circle')
    .attr('r', r)
    .attr('cx', d => barX(new Date (d.year, d.month - 1, 1)))
    .attr('cy', d => barY(d.timeStack))
    // .attr('cx', d => networkX(d.x_network))
    // .attr('cy', d => networkY(d.y_network))

    

