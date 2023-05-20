
function enumerate(chains, rhombi) {
    
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
