
import {Point, drawText} from './util.js';

export {buildRhombusFromAngle, buildRhombusFromThreeVertices, makeNeighbors};

let rIdx = 0;

class Rhombus {
    constructor(vs, idx) {
        this.vs = vs;
        this.idx = idx ?? rIdx++;
        this.neighbors = [];
    }

    get center() {
        return new Point(
            (this.vs[0].x+this.vs[2].x)/2,
            (this.vs[0].y+this.vs[2].y)/2);
    }

    set center(p) {
        const diff = p.sub(this.center);
        for (let i=0; i<this.vs.length; i++) {
            this.vs[i] = this.vs[i].add(diff);
        }
    }

    angleVertices(neigh, r, ro, n, no) {
        const i = this.vs.indexOf(r);
        const j = neigh.vs.indexOf(n);
        let rv, nv;
        if (this.vs[(i-1+4)%4] == ro) {
            rv = this.vs[(i+1+4)%4];
        } else {
            rv = this.vs[(i-1+4)%4];
        }
        if (neigh.vs[(j-1+4)%4] == ro) {
            nv = neigh.vs[(j+1+4)%4];
        } else {
            nv = neigh.vs[(j-1+4)%4];
        }
        return [rv, nv];
    }

    commonNeighbor(n) {
        for (let i=0; i<n.neighbors.length; i++) {
            const nn = n.neighbors[i];
            if (this.neighbors.includes(nn)) {
                return nn;
            }
        }
        return null;
    }

    commonVertices(n) {
        const rcomm = [];
        const ncomm = [];
        this.vs.forEach(v => {
            n.vs.forEach(w => {
                if (v.nearby(w)) {
                    rcomm.push(v);
                    ncomm.push(w);
                }
            });
        });
        return [rcomm, ncomm];
    }

    contains(vs, p) {
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

        const x = p.x, y = p.y;

        let inside = false;
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            const xi = vs[i].x, yi = vs[i].y;
            const xj = vs[j].x, yj = vs[j].y;

            let intersect = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.vs[0].x, this.vs[0].y);
        for (let i=0; i<=this.vs.length; i++) {
            const v = this.vs[(i+1)%this.vs.length];
            ctx.lineTo(v.x, v.y);
        }
        if (this.color) {
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }
        ctx.stroke();
        if (this.text) {
            drawText(ctx, this.text, this.center);
        }
    }

    innerAngleVerticesWith(n) {
        const [[rv1, rv2], [nv1, nv2]] = this.commonVertices(n);
        const [rrv1, nnv1] = this.angleVertices(n, rv1, rv2, nv1, nv2);
        const [rrv2, nnv2] = this.angleVertices(n, rv2, rv1, nv2, nv1);
        const d1 = rv1.dist(rrv1) + rv1.dist(nnv1);
        const d2 = rv2.dist(rrv2) + rv2.dist(nnv2);
        console.log(d1,d2)
        if (d1 < d2) {
            return [rrv1, rv1, nnv1];
        } else {
            return [rrv2, rv2, nnv2];
        }
    }

    vertexNeighbors(v) {
        const ns = [];
        this.neighbors.forEach(n => {
            for (let i=0; i<n.vs.length; i++) {
                if (v.nearby(n.vs[i])) {
                    ns.push(n);
                }
            }
        });
        return ns;
    }
}

// For building rhombi in a random chain
// Note one edge is always horizontal
function buildRhombusFromAngle(v, angle, sideLength) {
    const vs = [];
    
    vs[0] = v.clone();
    vs[1] = new Point(v.x+sideLength, v.y);
    
    const x = v.x + sideLength*Math.cos(angle*Math.PI/180);
    const y = v.y - sideLength*Math.sin(angle*Math.PI/180);
    
    vs[3] = new Point(x, y);
    vs[2] = new Point(x+sideLength, y);
    
    return new Rhombus(vs);
}

function buildRhombusFromThreeVertices(cvs) {
    const vs = cvs.map(v => v.clone());

    const cx = (cvs[0].x + cvs[2].x)/2;
    const cy = (cvs[0].y + cvs[2].y)/2;

    const x = (2*cx - cvs[1].x);
    const y = (2*cy - cvs[1].y);

    vs.push(new Point(x, y));

    return new Rhombus(vs);
}

function makeNeighbors(r1, r2) {
    if (!r1.neighbors.includes(r2)) r1.neighbors.push(r2);
    if (!r2.neighbors.includes(r1)) r2.neighbors.push(r1);
}
