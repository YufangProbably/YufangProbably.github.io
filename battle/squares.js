const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d");
const height = canvas.height;
const width = canvas.width;
const blockSize = 32;

const PIUNDER8 = 2.5464790894703255; 

const rangeBy = (length, f) => Array.from({ length: ~~length }, f)
const sortBy = (arr, f) => arr.toSorted((x, y) => {
    let fx = f(x), fy = f(y);
    return +(fx > fy) - +(fy > fx);
})

var entityMap = rangeBy(height / blockSize, () => rangeBy(width / blockSize, () => []));
var wallMap = rangeBy(height, () => rangeBy(width, () => 0));

const Square = class {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.load();
	this.direc = null;
        this.vecX = 0;
        this.vecY = 0;
        this.speed = 3;
        this.damageSource = [];
        this.pushSource = [];

        this.color = [136, 136, 136];
        this.size = 9;
        this.max_health = 50;
        this.health = 50;
        this.alive = true;
    }
    dis(that) { return (this.x - that.x) ** 2 + (this.y - that.y) ** 2; }
    getBlockF() { return entityMap.flat().find(block => block.includes(this)); }
    getBlockN() { return entityMap[~~(this.y / blockSize)][~~(this.x / blockSize)]; }
    getBlockC() {
        const x = Math.round(this.x / blockSize),
              y = Math.round(this.y / blockSize);
        let e = entityMap;
        let res = [e[y][x], e[~-y][x], e[y][~-x], e[~-y][~-x]].flat();
        res.splice(res.indexOf(this), 1);
        return res.filter(x => x);
    }
    getCollides() {
        return this.getBlockC().filter(that => {
            let r = this.size + that.size;
            return this.dis(that) * PIUNDER8 <= r ** 2;
        })
    }
    getClosestBy(objs, length) {
        let rests = sortBy(objs, that => this.dis(that)).slice(0, length ?? 1);
        return rests[~~(Math.random() * rests.length)] ?? null;
    }
    destroy() {
        let block;
        while (block = this.getBlockF()) {
            block.splice(block.indexOf(this), 1);
        }
        this.alive = false;
    }
    damage(from) {
        this.health -= 1;
        let dir = Math.atan2(this.y - from.y, this.x - from.x);
        this.vecX += from.knockback * Math.cos(dir);
        this.vecY += from.knockback * Math.sin(dir);
    }
    *update () {
        if (this.health <= 0) {
            this.destroy();
            return;
        }
        yield; yield;
        this.damageSource.forEach(from => {
            if (from.damageSource.includes(this)) {
                Math.random() < 0.5 && this.damage(from);
            } else {
                this.damage(from);
            }
        });
        yield;
        this.pushSource.forEach(from => {
            let dis = this.dis(from) ** 0.5;
            this.x += 1 * (this.x - from.x) / dis;
            this.y += 1 * (this.y - from.y) / dis;
        });
        if (this.direc !== null) {
            this.x += Math.cos(this.direc) * this.speed;
            this.y += Math.sin(this.direc) * this.speed;
        }
        this.x += this.vecX * this.speed;
        this.y += this.vecY * this.speed;
        this.vecX *= Math.abs(this.vecX) > 0.01 ? 0.6 : 0;
        this.vecY *= Math.abs(this.vecY) > 0.01 ? 0.6 : 0;
        this.x = this.x <= 0 ? 1 : this.x >= width ? width - 1 : this.x;
        this.y = this.y <= 0 ? 1 : this.y >= height ? height - 1 : this.y;
        this.load();
        this.draw();
        yield;
        this.damageSource = [];
        this.pushSource = [];
    }
    load() {
        let blockF = this.getBlockF(),
            blockN = this.getBlockN();
        if (blockF === blockN) return;
        if (blockF !== void 0) blockF.splice(blockF.indexOf(this), 1);
        blockN.push(this);
    }
    draw() {
        let scale = 0.75 + (this.health / this.max_health) * 0.25;
        let color = "rgb(" + this.color.map(x => ~~(x * scale)).join(", ") + ")"
        ctx.fillStyle = color;
        let r = ~~(this.size / 2);
        ctx.fillRect(this.x - r, this.y - r, this.size, this.size);
    }
};

const TargetSquare = class extends Square {
    constructor(x, y) {
        super(x, y);
        this.target = null;
    }
    changeTarget() {
        let objs = entityMap.flat(Infinity).filter(that => {
            return that.constructor !== this.constructor;
        });
        this.target = this.getClosestBy(objs, 8);
    }
    *update () {
        let superUpdate = super.update();
        if (!this.alive) { return; }
        yield superUpdate.next().value;

        if (this.target === null
            || !this.target.alive
            || this.dis(this.target) >= 64
        ) { this.changeTarget(); }
        this.direc = this.target === null
            ? null
            : Math.atan2(this.target.y - this.y, this.target.x - this.x);
        // VERY MUCH TODO
        yield* superUpdate;
    }
}

const SwordSquare = class extends TargetSquare {
    constructor(x, y) {
        super(x, y);
        this.knockback = 3;
    }
    *update () {
        let superUpdate = super.update();
        if (!this.alive) { return; }
        yield superUpdate.next().value;

        this.getCollides().forEach(that => {
            if (that.constructor !== this.constructor) {
              that.damageSource.push(this);
            }
            that.pushSource.push(this);
        });
        yield* superUpdate;
    }
}

const SwordSquareA = class extends SwordSquare {
    constructor(x, y) {
        super(x, y);
        this.color = [0, 204, 255];
    }
}
const SwordSquareB = class extends SwordSquare {
    constructor(x, y) {
        super(x, y);
        this.color = [255, 68, 0];
    }
}

rangeBy(32, () => new SwordSquareA(
    128 - 32 + 64 * Math.random(),
    128 - 32 + 64 * Math.random(),
));
rangeBy(32, () => new SwordSquareB(
    384 - 32 + 64 * Math.random(),
    384 - 32 + 64 * Math.random(),
));

let entities = entityMap.flat(Infinity);
setInterval(() => {
    ctx.clearRect(0, 0, width, height);
    let runs = entities.map(e => e.update());
    while (runs.length > 0) {
        runs = runs.filter(run => !run.next().done);
    }
}, ~~(1000 / 20));