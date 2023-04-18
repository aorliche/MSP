
export {Point, $, $$, drawText, intersect, shuffle, randomColor};

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(p) {
        return new Point(this.x+p.x, this.y+p.y);
    }

    clone() {
        return new Point(this.x, this.y);
    }

    dist(p) {
        return Math.sqrt(Math.pow(this.x-p.x,2) + Math.pow(this.y-p.y,2));
    }

    nearby(p) {
        return this.dist(p) < 1e-3;
    }

    sub(p) {
        return new Point(this.x-p.x, this.y-p.y);
    }
}

const $ = q => document.querySelector(q);
const $$ = q => [...document.querySelectorAll(q)]

// x0 and x1 may be unordered
function between(x, x0, x1) {
    const a = Math.min(x0, x1);
    const b = Math.max(x0, x1);
    return x > a && x < b;
}

function drawText(ctx, text, p, color, font, stroke) {
    ctx.save();
    if (font) ctx.font = font;
    const tm = ctx.measureText(text);
    if (color) ctx.fillStyle = color;
    if (p.ljust)
        ctx.fillText(text, p.x, p.y);
    else if (p.rjust)
        ctx.fillText(text, p.x-tm.width, p.y);
    else
        ctx.fillText(text, p.x-tm.width/2, p.y);
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1;
        ctx.strokeText(text, p.x-tm.width/2, p.y);
    }
    ctx.restore();
    return tm;
}

// This hopefully takes care of vertical line slopes
function intersect(p0, p1, q0, q1) {
    const [m0p,b0p] = slopeIntercept(p0.x, p0.y, p1.x, p1.y);
    const [m0q,b0q] = slopeIntercept(q0.x, q0.y, q1.x, q1.y);
    const x0 = (b0q-b0p)/(m0p-m0q);
    if (between(x0, p0.x, p1.x) && between(x0, q0.x, q1.x)) {
        return true;
    }
    const [m1p,b1p] = slopeIntercept(p0.y, p0.x, p1.y, p1.x);
    const [m1q,b1q] = slopeIntercept(q0.y, q0.x, q1.y, q1.x);
    const y0 = (b1q-b1p)/(m1p-m1q);
    if (between(y0, p0.y, p1.y) && between(y0, q0.y, q1.y)) {
        return true;
    }
    // A horizontal and vertical line
    if (between(p0.x, q0.x, q1.x) && between(p1.x, q0.x, q1.x) 
        && between(q0.y, p0.y, p1.y) && between(q1.y, p0.y, p1.y)) {
        return true;
    } 
    if (between(p0.y, q0.y, q1.y) && between(p1.y, q0.y, q1.y) 
        && between(q0.x, p0.x, p1.x) && between(q1.x, p0.x, p1.x)) {
        return true;
    } 
    return false;
}

function randomColor() {
    const r = Math.ceil(Math.random()*3+12).toString(16);
    const g = Math.ceil(Math.random()*3+12).toString(16);
    const b = Math.ceil(Math.random()*3+12).toString(16);
    return '#'+r+g+b;
}

function slopeIntercept(x0, y0, x1, y1) {
    let m = (y1-y0)/(x1-x0);
    let b = y0-m*x0;
    return [m,b]; 
}

// I think I read somewhere this algorithm is biased
function shuffle(arr) {
    arr.forEach((item, i) => {
        const j = Math.floor(Math.random()*arr.length);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    });
}
