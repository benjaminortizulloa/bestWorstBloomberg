let bodyDim = d3.select('body').node().getBoundingClientRect();
let svgDim = bodyDim.width < bodyDim.height ? Math.floor(bodyDim.width) : Math.floor(bodyDim.height)
let r = 7
let margins = r * 2

let svg = d3.select('svg')
    .attr('width', svgDim)
    .attr('height', svgDim)
    .attr('viewBox', `0 0 ${svgDim} ${svgDim}`)

let networkX_domain = d3.extent(bestWorst.nodes, d => d.x_network)
let networkY_domain = d3.extent(bestWorst.nodes, d => d.y_network)

let networkX = d3.scaleLinear()
    .domain(networkX_domain)
    .range([0 + margins, svgDim- margins]);

let networkY = d3.scaleLinear()
    .domain(networkY_domain)
    .range([svgDim - margins, 0+margins])

let nodeG = svg.append('g').attr('id', 'nodeG')
let edgeG = svg.append('g').attr('id', 'edgeG')

let barX = d3.scaleTime().domain([new Date(2012, 0, 1), new Date (2016, 07, 1)]).range([0 + margins, svgDim - margins])
let barY = d3.scaleLinear().domain(d3.extent(bestWorst.nodes, d => d.timeStack)).range([svgDim - r, 0 + r])

let nodes = nodeG
    .selectAll(".nodes")
    .data(bestWorst.nodes)
    .enter().append('circle')
    .attr('r', r)
    .attr('cx', d => barX(new Date (d.year, d.month - 1, 1)))
    .attr('cy', d => barY(d.timeStack))
    .attr('fill', 'white')
    .attr('stroke-width', 2)
    .attr('stroke', 'black')
    .attr('class', d => 'group_' + d.class +"_"+d.walktrap_group+ " nodes")
    .on('mousemove', function(d) {
        console.log(d)
        let dta = d3.select(this).data()[0]
        console.log(dta)
        d3.select('#title').html(dta.title)
        d3.select('#subheader').html(dta.subhead)
        d3.select('#methodology').html(dta.methodology)
        d3.select('#sources').html(dta.sources)
        d3.selectAll('.group_'+dta.class+"_"+dta.walktrap_group)
            .attr('fill', 'black')
            .raise()
        d3.select('#info')
            .style('left', d.pageX < bodyDim.width/2 ? d.pageX : d.pageX - d3.select('#info').node().getBoundingClientRect().width )
            .style('top', d.pageY < bodyDim.height/2 ? d.pageY : d.pageY - d3.select('#info').node().getBoundingClientRect().height)
            .style('opacity', 1)
    })
    .on('mouseout', function(d){
        let dta = d3.select(this).data()[0]
        d3.select('#info')
            .style('opacity', 0)

        d3.selectAll('.group_'+dta.class+"_"+dta.walktrap_group)
            .attr('fill', 'white')
            .lower()
        d3.select(this).lower()
    })

let edges = edgeG
    .selectAll('.edges')
    .data(bestWorst.edges)
    .enter().append('line')
    .attr("x1", d => networkX(d.from_x))
    .attr('y1', d => networkY(d.from_y))
    .attr('x2', d => networkX(d.to_x))
    .attr('y2', d => networkY(d.to_y))
    .attr('stroke', "black")
    .attr('stroke-opacity', .4)
    .attr('class', 'edges')

let networkLocation = bestWorst.nodes.map(function(d){return({cx: networkX(d.x_network), cy: networkY(d.y_network) })})

const tl = gsap.to(".nodes", {
    attr: {
        cx: (i, target, targets) => networkLocation[i].cx,
        cy: (i, target, targets) => networkLocation[i].cy,
    },
    duration: 2,
    ease: 'power.3.out',
    // stagger: { amount: 2 }

})

// const t2 = gsap.from('.edges', {
//     duration: 1,
//     opacity: 0
// })





    

