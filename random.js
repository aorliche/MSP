
import {buildRhombusFromAngle, buildRhombusFromThreeVertices, makeNeighbors} from "./rhombus.js";
import {Point, intersect, shuffle} from "./util.js";
import {MSP} from "./msp.js";

export {buildRandomMSP};

// m is m-gon size
function buildRandomMSP(x, y, m, sideLength) {
    // construct the initial chain
    const initChain = buildInitialChain(new Point(0,0), m, sideLength);
    
    // expand the msp
    const rhombi = expandFromInitialChain(initChain);

    // center the msp
    const msp = new MSP(rhombi);
    msp.center = new Point(x,y);

    return msp;
}

function buildInitialChain(v, m, sideLength) {
    const angles = buildInitialAngles(m);
    const chain = [];
    for (let i=0; i<angles.length; i++) {
        const r = buildRhombusFromAngle(v, angles[i], sideLength);
        chain.push(r);
        v = r.vs[3];
    }
    // Fill in neighbors
    for (let i=0; i<chain.length; i++) {
        if (i > 0) {
            makeNeighbors(chain[i-1], chain[i]);
        }
        if (i < chain.length-1) {
            makeNeighbors(chain[i], chain[i+1]);
        }
    }
    return chain;
}

function buildInitialAngles(m) {
    let angles = [];
    for (let i=1; i<m; i++) {
        angles.push(i*180/m);
    }
    shuffle(angles);
    return angles;
}

function addRhombusSegments(r, segs) {
    for (let i=0; i<4; i++) {
        const v0 = r.vs[i];
        const v1 = r.vs[(i+1)%4];
        addSegment([v0, v1, r], segs);
    }
}

function initSegments(rhombi) {
    const segs = [];
    rhombi.forEach(r => {
        addRhombusSegments(r, segs);
    });
    return segs;
}

function addSegment(seg, segs) {
    const [v0, v1, r] = seg;
    let added = false;
    for (let i=0; i<segs.length; i++) {
        const [u0, u1, rhombi] = segs[i];
        if ((v0.nearby(u0) && v1.nearby(u1)) || (v1.nearby(u0) && v0.nearby(u1))) {
            rhombi.push(r);
            added = true;
            break;
        }
    }
    if (!added) {
        segs.push([v0, v1, [r]]);
    }
}

function uniqueVerticesRhombiFromSegments(segs) {
    const vs = [];
    const rhombi = [];
    for (let i=0; i<segs.length; i++) {
        const [v0, v1, rs] = segs[i];
        let got0 = false;
        let got1 = false;
        for (let j=0; j<vs.length; j++) {
            if (got0 && got1) {
                break;
            }
            if (vs[j].nearby(v0)) {
                got0 = true;
                rs.forEach(r => {
                    rhombi[j].add(r);
                });
            }
            if (vs[j].nearby(v1)) {
                got1 = true;
                rs.forEach(r => {
                    rhombi[j].add(r);
                });
            }
        }
        if (!got0) {
            vs.push(v0);
            rhombi.push(new Set(rs));
        }
        if (!got1) {
            vs.push(v1);
            rhombi.push(new Set(rs));
        }
    }
    return [vs, rhombi.map(st => [...st])];
}

// Check surrounding by finding lack of pairing in one-away vertices
// from central vertex
// One-away vertices found by looking at rhombi
function findHoles(vs, rs) {
    const oneaway = [];
    const roneaway = [];
    for (let i=0; i<vs.length; i++) {
        oneaway.push([]);
        roneaway.push([]);
        for (let j=0; j<rs[i].length; j++) {
            for (let k=0; k<4; k++) {
                if (rs[i][j].vs[k].nearby(vs[i])) {
                    oneaway[i].push([rs[i][j].vs[(k+3)%4], rs[i][j].vs[(k+5)%4]])
                    roneaway[i].push(rs[i][j]);
                }
            }
        }
    }
    const unpaired = [];
    const runpaired = [];
    for (let k=0; k<vs.length; k++) {
        unpaired.push([]);
        runpaired.push([]);
        for (let i=0; i<oneaway[k].length; i++) {
            const a = oneaway[k][i][0];
            const b = oneaway[k][i][1];
            let paireda = false;
            let pairedb = false;
            for (let j=0; j<oneaway[k].length; j++) {
                if (i == j) {
                    continue;
                }
                const c = oneaway[k][j][0];
                const d = oneaway[k][j][1];
                if (a.nearby(c) || a.nearby(d)) {
                    paireda = true;
                }
                if (b.nearby(c) || b.nearby(d)) {
                    pairedb = true;
                }
            }
            if (!paireda) {
                unpaired[k].push(a);
                runpaired[k].push(roneaway[k][i]);
            }
            if (!pairedb) {
                unpaired[k].push(b);
                runpaired[k].push(roneaway[k][i]);
            }
        }
    }
    // Eliminate unpaireds on same rhombus
    // Also eliminate empty unpaireds
    const vs2 = [];
    const unpaired2 = [];
    const runpaired2 = [];
    for (let i=0; i<unpaired.length; i++) {
        if (unpaired[i].length == 0) {
            continue;
        }
        if (runpaired[i][0] == runpaired[i][1]) {
            continue;
        }
        vs2.push(vs[i]);
        unpaired2.push(unpaired[i]);
        runpaired2.push(runpaired[i]);
    }
    return [vs2, unpaired2, runpaired2];
}

function lineCrossesSegments(pair, segs) {
    for (let i=0; i<segs.length; i++) {
        if (pair[0].nearby(segs[i][0]) 
            || pair[0].nearby(segs[i][1]) 
            || pair[1].nearby(segs[i][0])
            || pair[1].nearby(segs[i][1])) {
            continue;
        }
        if (intersect(pair[0], pair[1], segs[i][0], segs[i][1])) {
            return true;
        }
    }
    return false;
}

// Fill in <180 degree angles between rhombi
function expandFromInitialChain(initChain) {
    const segs = initSegments(initChain);
    let added = true;

    for (let i=0; i<50 && added; i++) {
        added = false;
        const [vs, rs] = uniqueVerticesRhombiFromSegments(segs);
        const [vs2, unpaired, runpaired] = findHoles(vs, rs);
        for (let j=0; j<unpaired.length; j++) {
            const isect = lineCrossesSegments(unpaired[j], segs); 
            if (!isect) {
                const r = buildRhombusFromThreeVertices(
                    [unpaired[j][0], vs2[j], unpaired[j][1]]);
                initChain.push(r);
                addRhombusSegments(r, segs);
                added = true;
            }
        }
    }

    return initChain;
}
