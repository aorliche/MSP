
export {Point, $, $$, dataURItoAB, download, drawText, fillCircle, getCursorPosition, getFlips, intersect, nearby, randomColor, shuffle, strokeCircle};

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

    negate(p) {
        return new Point(-this.x, -this.y);
    }

    str() {
        return `(${this.x},${this.y})`
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

function getCursorPosition(e) {
    const r = e.target.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    return new Point(x, y);
}
    
function getFlips(sel, howmany) {
    const flips = [];
    for (let i=0; i<sel.length; i++) {
        for (let j=i; j<sel.length; j++) {
            for (let k=j; k<sel.length; k++) {
                if (sel[i].isNeighbor(sel[j]) 
                        && sel[j].isNeighbor(sel[k]) 
                        && sel[i].isNeighbor(sel[k])) {
                    flips.push([sel[i], sel[j], sel[k]]);
                    if (howmany && flips.length == howmany) {
                        return flips;
                    }
                }
            }
        }
    }
    return flips;
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

function nearby(a, b) {
    // For infinity
    if (a == b) return true;
    return Math.abs(a-b) < 1e-3;
}

function randomColor() {
    const r = Math.ceil(Math.random()*5+10).toString(16);
    const g = Math.ceil(Math.random()*5+10).toString(16);
    const b = Math.ceil(Math.random()*5+10).toString(16);
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

function fillCircle(ctx, c, r, color) {
    ctx.save();
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(c.x, c.y, r, 0, 2*Math.PI);
	ctx.closePath();
	ctx.fill();
    ctx.restore();
}

function strokeCircle(ctx, c, r, color) {
    ctx.save();
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.arc(c.x, c.y, r, 0, 2*Math.PI);
	ctx.closePath();
	ctx.stroke();
    ctx.restore();
}

// https://stackoverflow.com/questions/34156282/how-do-i-save-json-to-local-text-file
function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

// https://stackoverflow.com/questions/12168909/blob-from-dataurl 
function dataURItoAB(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);

    // create a view into the buffer
    var ia = new Uint8Array(ab);

    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return ab;
}

