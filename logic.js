let bodyDim = d3.select('#svgContainer').node().getBoundingClientRect();
let svgDim = bodyDim.width < bodyDim.height ? Math.floor(bodyDim.width) : Math.floor(bodyDim.height)
let r = bodyDim.width < bodyDim.height ? Math.ceil(bodyDim.width/150) : Math.ceil(bodyDim.height/150)
let margins = r * 10

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

let legendG = svg.append('g').attr('id', 'legendG')
let edgeG = svg.append('g').attr('id', 'edgeG')
let nodeG = svg.append('g').attr('id', 'nodeG')

let barX = d3.scaleTime().domain([new Date(2012, 0, 1), new Date (2016, 07, 1)]).range([0 + margins, svgDim - margins/10 - 1])
let barY = d3.scaleLinear().domain(d3.extent(bestWorst.nodes, d => d.timeStack)).range([svgDim - margins*1.5, 0 + margins])

let axisBottom = d3.axisBottom(barX).ticks(5)
let axisLeft = d3.axisLeft(barY)

legendG.append('g')
    .attr('id', 'barXAxis')
    .attr('transform', `translate(0, ${svgDim - margins})`)
    .call(axisBottom)

legendG.append('g')
    .attr('id', 'barYAxis')
    .attr('transform', `translate(${margins}, 0)`)
    .call(axisLeft)

legendG.append('text')
    .attr('id', 'chartTitle')
    .text('Rankings over Time')
    .attr('transform', `translate(${svgDim/2}, ${svgDim - margins/3})`)

let nodes = nodeG
    .selectAll(".nodes")
    .data(bestWorst.nodes)
    .enter().append('g')
    .attr('class', d => 'group_' + d.class +"_"+d.walktrap_group+ " nodes")


nodes.append('circle')
    .attr('r', r)
    .attr('cx', d => barX(new Date (d.year, d.month - 1, 1)))
    .attr('cy', d => barY(d.timeStack))
    .attr('fill', 'white')
    .attr('class', 'nodeBacks')
nodes.append('circle')
    .attr('r', r)
    .attr('cx', d => barX(new Date (d.year, d.month - 1, 1)))
    .attr('cy', d => barY(d.timeStack))
    .attr('fill', 'white')
    .attr('stroke-width', 2)
    .attr('stroke', 'black')
    .attr('class', 'nodeTops')

nodes.on('mousemove', function(d) {
        console.log(d)
        let dta = d3.select(this).data()[0]
        console.log(dta)
        d3.select('#title').html(dta.title)
        d3.select('#subheader').html(dta.subhead)
        d3.select('#methodology').html(dta.methodology)
        d3.select('#sources').html(dta.sources)
        d3.select('#updated').html(dta.updated)
        d3.selectAll('.group_'+dta.class+"_"+dta.walktrap_group + "> circle")
            .attr('fill', 'black')
            .raise()
        d3.select(this).select('.nodeTops').attr('stroke', 'red')
        d3.select('#info')
            .style('left', d.clientX < bodyDim.width/2 ? d.clientX : d.clientX - d3.select('#info').node().getBoundingClientRect().width )
            .style('top', d.clientY < bodyDim.height/2 ? d.clientY : d.clientY - d3.select('#info').node().getBoundingClientRect().height)
            .style('opacity', 1)
    })
    .on('mouseout', function(d){
        let dta = d3.select(this).data()[0]
        d3.select('#info')
            .style('opacity', 0)

        d3.selectAll('.group_'+dta.class+"_"+dta.walktrap_group + "> circle")
            .attr('fill', 'white')

        d3.select(this).lower()
        d3.select(this).select('.nodeTops').attr('stroke', 'black')
            
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

const t_pin = gsap.timeline({
    scrollTrigger: {
        trigger: "#svgContainer",
        start: "top top",
        end: "top -1000%",
        scrub: true,
        pin: 'svg'
    }
})
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: "#section1",
        start: 'top bottom',
        end: "top top",
        scrub: true
    },
    onComplete: function(){
        d3.select('#titleCard').style('pointer-events', 'none')
    },
    onReverseComplete: function(){
        d3.select('#titleCard').style('pointer-events', 'auto')
    }
})
.add('start')
.from(".nodes", {
    opacity: 0, 
    stagger: {amount: 2}
}, 'start')
.to('#youShouldScroll', {duration: 2, opacity: 0}, 'start')
.to('#titleCard', {duration: 2, opacity: 0}, 'start')
.from('#legendG', {duration: 2, opacity: 0}, 'start')

const t2 = gsap.timeline({
    scrollTrigger: {
        trigger: "#section2",
        start: 'top bottom',
        end: "top top",
        scrub: true
    }
})
.add('start')
.to(".nodeTops", {
    attr: {
        cx: (i, target, targets) => networkLocation[i].cx,
        cy: (i, target, targets) => networkLocation[i].cy,
    },
    duration: 2,
    ease: 'power.3.out',
    // stagger: { amount: 2 }
}, 'start')
.to(".nodeBacks", {
    attr: {
        cx: (i, target, targets) => networkLocation[i].cx,
        cy: (i, target, targets) => networkLocation[i].cy,
    },
    duration: 2,
    ease: 'power.3.out',
    // stagger: { amount: 2 }
}, 'start')
.to('#legendG', {duration: 2, opacity: 0}, 'start')
.from('.edges', {
    duration: 1,
    opacity: 0
})





    

