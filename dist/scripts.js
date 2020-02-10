"use strict";
let env = {
    repulsionForce: 15,
    attractionForce: 0.001
};
class Vector {
    constructor() {
        this.x = 0;
        this.y = 0;
    }
    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    set length(value) {
        let l = this.length;
        if (l != 0) {
            l = value / l;
            this.x = this.x * l;
            this.y = this.y * l;
        }
    }
}
class GraphNode {
    constructor(parentGraph, x, y, data) {
        this.data = data;
        this._x = x;
        this._y = y;
        this._parent = parentGraph;
        parentGraph.addNode(this);
        this._id = String(Math.random()) + String(Math.random()) + String(Math.random()) + String(Math.random()) + String(Math.random());
        this._edges = [];
    }
    isEqualTo(other) {
        return this._id == other._id;
    }
    connectTo(other) {
        let n = new GraphEdge(this, other);
        if (!(this._edges.find((e) => e.isEqualTo(n)))) {
            this._edges.push(n);
            other._edges.push(n);
        }
    }
    getRepulsionForceVector() {
        let res = new Vector();
        this._parent.nodes.forEach((n) => {
            if (!n.isEqualTo(this)) {
                let v = new Vector();
                v.x = -(n.x - this.x);
                v.y = -(n.y - this.y);
                v.length = 1 / v.length;
                v.length = v.length * env.repulsionForce;
                res.x = res.x + v.x;
                res.y = res.y + v.y;
            }
        });
        return res;
    }
    getAttractionForceVector() {
        let res = new Vector();
        this._edges.forEach((e) => {
            let otherNode = (e.nodes[0].isEqualTo(this) ? e.nodes[1] : e.nodes[0]);
            let v = new Vector();
            v.x = otherNode.x - this.x;
            v.y = otherNode.y - this.y;
            v.length = v.length * env.attractionForce;
            res.x = res.x + v.x;
            res.y = res.y + v.y;
        });
        return res;
    }
    get edges() {
        return [...this._edges];
    }
    set data(value) {
        this._data = value;
    }
    get data() {
        return this._data;
    }
    set x(value) {
        this._x = value;
    }
    get x() {
        return this._x;
    }
    set y(value) {
        this._y = value;
    }
    get y() {
        return this._y;
    }
}
class GraphEdge {
    constructor(a, b) {
        this._nodes = [a, b];
    }
    isEqualTo(other) {
        return (this._nodes[0].isEqualTo(other._nodes[0]) && this._nodes[1].isEqualTo(other._nodes[1]))
            ||
                (this._nodes[0].isEqualTo(other._nodes[1]) && this._nodes[1].isEqualTo(other._nodes[0]));
    }
    get nodes() {
        return [...this._nodes];
    }
}
class Graph {
    constructor() {
        this.nodes = [];
    }
    addNode(n) {
        if (!(this.nodes.find((nx) => nx.isEqualTo(n))))
            this.nodes.push(n);
    }
}
let graph;
let canvas;
let ctx;
let draggableNode = null;
let radius = 15;
function init() {
    graph = new Graph();
    canvas = document.getElementById("cnv");
    ctx = canvas.getContext("2d");
    document.getElementById("rngRepulsion").value = env.repulsionForce;
    document.getElementById("rngRepulsion").onchange = () => { env.repulsionForce = document.getElementById("rngRepulsion").value; };
    document.getElementById("rngAttraction").value = env.attractionForce * 1000;
    document.getElementById("rngAttraction").onchange = () => { env.attractionForce = document.getElementById("rngAttraction").value / 1000; };
    canvas.onmousedown = mouseDownHandler;
    canvas.onmouseup = mouseUpHandler;
    canvas.onmouseleave = mouseLeaveHandler;
    canvas.onmousemove = mouseMoveHandler;
    reset();
    window.onresize = () => {
        reset();
    };
    moveNodes();
    window.requestAnimationFrame(draw);
}
function mouseDownHandler(e) {
    let n = graph.nodes.find((nx) => Math.sqrt((nx.x - e.offsetX) * (nx.x - e.offsetX) + (nx.y - e.offsetY) * (nx.y - e.offsetY)) < radius);
    if (n)
        draggableNode = n;
}
function mouseUpHandler(e) {
    draggableNode = null;
}
function mouseLeaveHandler(e) {
    draggableNode = null;
}
function mouseMoveHandler(e) {
    if (draggableNode != null) {
        draggableNode.x = e.offsetX;
        draggableNode.y = e.offsetY;
    }
}
function reset() {
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    graph.nodes = [];
    for (let i = 0; i < 80; i++) {
        new GraphNode(graph, Math.random() * w, Math.random() * h, String(Math.floor(Math.random() * 100)));
    }
    for (let i = 0; i < 80; i++) {
        graph.nodes[Math.floor(Math.random() * graph.nodes.length)].connectTo(graph.nodes[Math.floor(Math.random() * graph.nodes.length)]);
    }
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    graph.nodes.forEach((n) => {
        ctx.strokeStyle = "#876544";
        n.edges.forEach((e) => {
            let nodes = e.nodes;
            ctx.moveTo(nodes[0].x, nodes[0].y);
            ctx.lineTo(nodes[1].x, nodes[1].y);
        });
    });
    ctx.stroke();
    graph.nodes.forEach((n) => {
        ctx.beginPath();
        ctx.fillStyle = "#d8d8d8";
        if (draggableNode != null)
            if (n.isEqualTo(draggableNode))
                ctx.fillStyle = "#00ff00";
        ctx.arc(n.x, n.y, radius, 0, 11);
        ctx.fill();
        ctx.fillStyle = "#090909";
        ctx.fillText(n.data, n.x - radius / 2, n.y);
    });
    window.requestAnimationFrame(draw);
}
function moveNodes() {
    graph.nodes.forEach((n) => {
        if (draggableNode != null)
            if (draggableNode.isEqualTo(n))
                return;
        let v1 = n.getAttractionForceVector();
        let v2 = n.getRepulsionForceVector();
        let v = new Vector();
        v.x = v1.x + v2.x;
        v.y = v1.y + v2.y;
        n.x = n.x + v.x;
        n.y = n.y + v.y;
    });
    setTimeout(() => {
        moveNodes();
    }, 4);
}
//# sourceMappingURL=scripts.js.map