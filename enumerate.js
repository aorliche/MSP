
export {triplets, getFlips, enumerate, cullTriplets, mspChainsToRaw};

function chainsEq(c1, c2) {
    if (c1.length != c2.length) return false;
    for (let i=0; i<c1.length; i++) {
        if (c1[i].length != c2[i].length) return false;
        for (let j=0; j<c1[i].length; j++) {
            if (c1[i][j] != c2[i][j]) return false;
        }
    }
    return true;
}

function hasVisited(db, chains) {
    for (let i=0; i<db.length; i++) {
        if (chainsEq(db[i], chains)) return true;
    }
    return false;
}

function cullTriplets(chains, trips) {
    return trips.filter(trip => {
        let [ab, ac, bc] = [false, false, false];
        chains.forEach(c => {
            if (c.includes(trip[0]) && c.includes(trip[1])) ab = true;
            if (c.includes(trip[0]) && c.includes(trip[2])) ac = true;
            if (c.includes(trip[1]) && c.includes(trip[2])) bc = true;
        });
        return ab && ac && bc;
    });
}

function enumerate(chains, rhombi) {
    const trips = cullTriplets(chains, triplets(rhombi));
    const db = [chains];
    let edge = [chains];
    let iter = 0;
    while (edge.length > 0) {
        const newEdge = [];
        edge.forEach(cs => {
            const flips = getFlips(cs, trips);
            flips.forEach(trip => {
                const cloneCs = cloneChains(cs);
                flip(cloneCs, trip)
                if (!hasVisited(db, cloneCs)) {
                    db.push(cloneCs);
                    newEdge.push(cloneCs);
                }
            });
        });
        edge = newEdge;
        if (iter++ > 50) throw 'Exceeded iters';
    }
    return db;
}

function mspChainsToRaw(chains) {
    const newChains = [];
    chains.forEach(c => {
        newChains.push(c.rhombi.map(ridx => ridx));
    });
    return newChains;
}

function cloneChains(chains) {
    const newChains = [];
    chains.forEach(c => {
        newChains.push(c.map(r => r));
    });
    return newChains;
}

function triplets(rhombi) {
    const trips = [];
    for (let i=0; i<rhombi.length; i++) {
        for (let j=i+1; j<rhombi.length; j++) {
            for (let k=j+1; k<rhombi.length; k++) {
                trips.push([rhombi[i], rhombi[j], rhombi[k]]);
            }
        }
    }
    return trips;
}

function inTrip(ch, i, a, b, c) {
    if (ch[i] == a && ch[i+1] == b) return 1;
    if (ch[i] == b && ch[i+1] == a) return 1;
    if (ch[i] == a && ch[i+1] == c) return 2;
    if (ch[i] == c && ch[i+1] == a) return 2;
    if (ch[i] == b && ch[i+1] == c) return 3;
    if (ch[i] == c && ch[i+1] == b) return 3;
    return 0;
}

function getFlips(chains, trips) {
    const flips = [];
    trips.forEach(trip => {
        let [ab, ac, bc] = [false, false, false];
        chains.forEach(c => {
            for (let i=0; i<c.length-1; i++) {
                const pair = inTrip(c, i, trip[0], trip[1], trip[2]);
                switch (pair) {
                    case 1: ab = true; break;
                    case 2: ac = true; break;
                    case 3: bc = true; break;
                }
            }
        });
        if (ab && ac && bc) flips.push(trip);
    });
    return flips;
}

function flip(chains, trip) {
    chains.forEach(c => {
        for (let i=0; i<c.length-1; i++) {
            if (inTrip(c, i, trip[0], trip[1], trip[2]) != 0) {
                [c[i], c[i+1]] = [c[i+1], c[i]];
            }
        }
    });
}
