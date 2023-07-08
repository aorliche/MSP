
import {Point, fillCircle, strokeCircle} from './util.js';
export {StrokePoint, StrokeSegment};

class StrokePoint extends Point {
    constructor(x, y, canvas) {
        super(x, y);
        this.canvas = canvas;
        this.ctx = canvas ? canvas.getContext('2d') : null;
    }

    contains(p) {
        return p.dist(this) < 10;
    }

    draw(ctx, color) {
        if (!ctx) {
            ctx = this.ctx;
        }
        color = color || 'red';
        const cp = new Point(this.x-0.5, this.y-0.5);
        fillCircle(ctx, cp, 5, color);
        strokeCircle(ctx, this, 8, color);
    }

    move(p) {
        this.x = p.x;
        this.y = p.y;
    }
}

class StrokeSegment {
    constructor(points, canvas) {
        this.points = points ?? [];
        this.ctx = canvas ? canvas.getContext('2d') : null;
    }

    addPoint(p) {
        this.points.push(p);
    }

    draw(ctx) {
        if (!ctx) {
            ctx = this.ctx;
        }
        for (let i=0; i<this.points.length; i++) {
            this.points[i].draw();
            if (this.points[i] == this.selected) {
                this.points[i].draw(null, 'orange');
            }
            if (i == 0) {
                continue;
            }
            ctx.save();
            ctx.strokeStyle = 'red';
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(this.points[i-1].x, this.points[i-1].y);
            ctx.lineTo(this.points[i].x, this.points[i].y);
            ctx.stroke();
            ctx.restore();
        }
    }

    getPoint(p) {
        for (let i=0; i<this.points.length; i++) {
            if (this.points[i].contains(p)) {
                return this.points[i];
            }
        }
        return null;
    }

    removePoint(p) {
        const idx = this.points.indexOf(p);
        if (idx < 0) {
            return;
        }
        this.points.splice(idx, 1);
    }
}

function loadLetter(file) {
    fetch(file)
    .then(r => r.json())
    .then(json => {

    })
    .catch(err => console.log(err));
}
