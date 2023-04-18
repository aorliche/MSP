
import {Point} from './util.js';
export {MSP};

class MSP {
    constructor(rhombi) {
        this.rhombi = rhombi;
        this.center_ = null;
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

    draw(ctx) {
        this.rhombi.forEach(r => r.draw(ctx));
    }
}
