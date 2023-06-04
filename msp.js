
import {Point, $, nearby, randomColor} from './util.js';
import {Rhombus} from './rhombus.js';
export {MSP};

class MSP {
    constructor(rhombi, canvas) {
        this.rhombi = rhombi;
        this.canvas = canvas ?? null;
        this.center_ = null;
        //this.makeChains();
    }

    get center() {
        if (!this.center_) {
            let p = new Point(0,0);
            const n = this.rhombi.length;
            this.rhombi.forEach(r => {
                p = p.add(r.center);
            });
            this.center_ = new Point(p.x/n, p.y/n);
        }
        return this.center_;
    }

    set center(p) {
        const diff = p.sub(this.center);
        this.rhombi.forEach(r => {
            r.center = r.center.add(diff);
        });
        this.center_ = p;
    }

    get click() {
        return this.clickFn;
    }

    set click(fn) {
        if (!this.canvas) {
            return;
        }
        this.clickFn = fn;
        this.click_ = this.canvas.addEventListener('click', fn);
    }

    colorize() {
        this.rhombi.forEach(r => {
            r.color = randomColor(); //'pink';
        });
    }

    contains(p) {
        for (let i=0; i<this.rhombi.length; i++) {
            if (this.rhombi[i].contains(p)) {
                return true;
            }
        }
        return false;
    }

    clone() {
        const newRhombi = JSON.parse(JSON.stringify(this.rhombi)).map(r => {
            r = Object.create(Rhombus.prototype, Object.getOwnPropertyDescriptors(r));
            r.vs = r.vs.map(v => {
                return Object.create(Point.prototype, Object.getOwnPropertyDescriptors(v));  
            });
            return r;
        });
        return new MSP(newRhombi, this.canvas);
    }

    draw(ctx, showidx) {
        if (!ctx) {
            if (this.canvas) {
                ctx = this.canvas.getContext('2d');
            } else {
                throw new Error('No context');
            }
        }
        this.rhombi.forEach(r => r.draw(ctx, showidx));
        if (this.loading) {
            this.savContext = ctx;
            this.showIdx = showidx;
        }
    }

    // store rhombus index, not rhombus reference
    expandChain(dydx, r0, r1) {
        let found = false;
        let added = false;
        for (let i=0; i<this.chains.length; i++) {
            const c = this.chains[i];
            // in same chain
            if (nearby(c.dydx, dydx)) {
                found = true;
                const idx = c.rhombi.indexOf(r0.idx);
                if (idx != -1) {
                    if (c.rhombi.includes(r1.idx)) {
                        break;
                    }
                    if (idx == 0) {
                        c.rhombi = [r1.idx, ...c.rhombi];
                        added = true;
                    } else if (idx == c.rhombi.length-1) {
                        c.rhombi.push(r1.idx);
                        added = true;
                    }
                } 
                break;
            }
        }
        if (!found) {
            const c = {dydx: dydx, rhombi: [r0.idx, r1.idx]};
            this.chains.push(c);
            added = true;
        }
        if (added) {
            this.neighbors(r1).forEach(r => {
                if (r != r0) {
                    const [r1vs, rvs] = r1.commonVertices(r);
                    const dx = rvs[0].x - rvs[1].x;
                    const dy = rvs[0].y - rvs[1].y;
                    const dydx = Math.abs(dy/dx) > 1000 ? Infinity : dy/dx;
                    this.expandChain(dydx, r1, r);
                }
            });
        }
    }

    flip(r0, r1, r2) {
        let cent;
        for (let i=0; i<4; i++) {
            for (let j=0; j<4; j++) {
                for (let k=0; k<4; k++) {
                    if (r0.vs[i].nearby(r1.vs[j]) 
                        && r0.vs[i].nearby(r2.vs[k])) {
                        cent = r0.vs[i].clone();
                        break;
                    }
                }
            }
        }
        if (!cent) {
            return;
        }
        this.updateChains(r0, r1, r2);
        // These are not deep copies
        const [r0r1a, r0r1b] = r0.commonVertices(r1);
        const [r0r2a, r0r2b] = r0.commonVertices(r2);
        const [r1r2a, r1r2b] = r1.commonVertices(r2);
        const d2 = r0r1a[0].nearby(cent) ? r0r1a[1].sub(cent) : r0r1a[0].sub(cent);
        const d1 = r0r2a[0].nearby(cent) ? r0r2a[1].sub(cent) : r0r2a[0].sub(cent);
        const d0 = r1r2a[0].nearby(cent) ? r1r2a[1].sub(cent) : r1r2a[0].sub(cent);
        r0.translate(d0);
        r1.translate(d1);
        r2.translate(d2);
    }

    load(jsonStr) {
        const json = JSON.parse(jsonStr);
        this.rhombi = json.rhombi;
        this.center_ = json.center;
        this.chains = json.chains;
    }

    loadText(text) {
        const words = text.split(/\s/);
        for (let i=0; i<this.rhombi.length && i<words.length; i++) {
            this.rhombi[i].text = words[i];
        }
    }

    loadTextFromFile(file) {
        this.loading = true;
        fetch(file)
        .then(resp => resp.text())
        .then(text => {
            const words = text.split(/\s/);
            for (let i=0; i<this.rhombi.length && i<words.length; i++) {
                this.rhombi[i].text = words[i];
            }
            this.loading = false;
            if (this.savContext) {
                this.draw(this.savContext, this.showIdx);
                this.savContext = null;
                this.showIdx = null;
            }
        })
        .catch(err => {
            this.loading = false;
            console.log(err)
        });
    }

    makeChains() {
        let r0 = this.rhombi[0];
        this.chains = [];
        this.rhombi.forEach(r => {
            if (r == r0) return;
            if (r0.isNeighbor(r)) {
                const [r0vs, rvs] = r0.commonVertices(r);
                const dx = rvs[0].x - rvs[1].x;
                const dy = rvs[0].y - rvs[1].y;
                const dydx = Math.abs(dy/dx) > 1000 ? Infinity : dy/dx;
                this.expandChain(dydx, r0, r);
            }
        });
    }

    neighbors(r0) {
        const ns = [];
        this.rhombi.forEach(r => {
            if (r0.isNeighbor(r)) {
                ns.push(r)
            }
        });
        return ns;
    }

    save() {
        const sav = {rhombi: this.rhombi, center: this.center_, chains: this.chains}
        return JSON.stringify(sav);
    }

    sig() {
        if (!this.chains) {
            this.makeChains();
        }
        return JSON.stringify(this.chains);
    }

    updateChains(r0, r1, r2) {
        function swap(chains, i0, i1) {
            chains.forEach(c => {
                const cr = c.rhombi;
                for (let i=0; i<cr.length-1; i++) {
                    if (cr[i] == i0 && cr[i+1] == i1) {
                        [cr[i], cr[i+1]] = [i1, i0];
                        break;
                    }
                    if (cr[i] == i1 && cr[i+1] == i0) {
                        [cr[i], cr[i+1]] = [i0, i1];
                        break;
                    }
                }
            });
        }
        if (!this.chains) {
            this.makeChains();
        }
        const i0 = r0.idx;
        const i1 = r1.idx;
        const i2 = r2.idx;
        swap(this.chains, i0, i1);
        swap(this.chains, i1, i2);
        swap(this.chains, i0, i2);
    }
}
