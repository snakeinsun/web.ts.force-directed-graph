let graph: Graph<string>;
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let draggableNode: GraphNode<string> = null;
let radius = 15;


function init() {
    graph = new Graph<string>();
    canvas = <HTMLCanvasElement>document.getElementById("cnv");
    ctx = canvas.getContext("2d");

    //#region ranges

    //@ts-ignore
    document.getElementById("rngRepulsion").value = env.repulsionForce;
    //@ts-ignore
    document.getElementById("rngRepulsion").onchange = () => { env.repulsionForce = document.getElementById("rngRepulsion").value; };

    //@ts-ignore
    document.getElementById("rngAttraction").value = env.attractionForce * 1000;
    //@ts-ignore
    document.getElementById("rngAttraction").onchange = () => { env.attractionForce = document.getElementById("rngAttraction").value / 1000; };

    //#endregion

    //#region  mouse dragging
    canvas.onmousedown = mouseDownHandler;
    canvas.onmouseup = mouseUpHandler;
    canvas.onmouseleave = mouseLeaveHandler;
    canvas.onmousemove = mouseMoveHandler;

    canvas.addEventListener("touchstart", touchStartHandler, false);
    canvas.addEventListener("touchend", touchEndHandler, false);
    canvas.addEventListener("touchcancel", touchCancelHandler, false);
    canvas.addEventListener("touchmove", touchMoveHandler, false);
    //#endregion

    reset();

    window.onresize = () => {
        reset();
    };

    moveNodes();

    window.requestAnimationFrame(draw);
}

function mouseDownHandler(e: MouseEvent) {
    let n = graph.nodes.find((nx) => Math.sqrt((nx.x - e.offsetX) * (nx.x - e.offsetX) + (nx.y - e.offsetY) * (nx.y - e.offsetY)) < radius);
    if (n)
        draggableNode = n;
}

function mouseUpHandler(e: MouseEvent) {
    draggableNode = null;
}

function mouseLeaveHandler(e: MouseEvent) {
    draggableNode = null;
}

function mouseMoveHandler(e: MouseEvent) {
    if (draggableNode != null) {
        draggableNode.x = e.offsetX;
        draggableNode.y = e.offsetY;
    }
}

function touchStartHandler(e: TouchEvent) {
    var touches = e.changedTouches;
    if (touches.length > 0) {
        let t = touches[0];
        let n = graph.nodes.find((nx) => Math.sqrt((nx.x - t.pageX) * (nx.x - t.pageX) + (nx.y - t.pageY) * (nx.y - t.pageY)) < radius);
        if (n)
            draggableNode = n;
    }
}

function touchEndHandler(e: TouchEvent) {
    draggableNode = null;
}

function touchCancelHandler(e: TouchEvent) {
    draggableNode = null;
}

function touchMoveHandler(e: TouchEvent) {
    if (draggableNode != null) {
        var touches = e.changedTouches;
        if (touches.length > 0) {
            let t = touches[0];
            draggableNode.x = t.pageX;
            draggableNode.y = t.pageY;
        }
    }
}



function reset() {
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    graph.nodes = [];

    let cnt = Math.floor(w * h / (170 * 170));

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