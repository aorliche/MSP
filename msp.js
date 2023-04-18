
import {Point, randomColor} from './util.js';
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

    colorize() {
        this.rhombi.forEach(r => {
            r.color = randomColor(); //'pink';
        });
    }

    draw(ctx) {
        this.rhombi.forEach(r => r.draw(ctx));
        if (this.loading) {
            this.savContext = ctx;
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
                this.draw(this.savContext);
            }
        })
        .catch(err => {
            this.loading = false;
            console.log(err)
        });
    }
}
