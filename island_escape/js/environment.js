class Environment {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.level = 1;

        // Resource arrays
        this.sticks = [];
        this.rocks = [];
        this.waterZones = [];   // E.g., edges of the island or a lagoon
        this.sandArea = {x:0, y:0, width: this.width, height: this.height};

        this.setupEnvironment();
    }

    setupEnvironment() {
        // Clear arrays
        this.sticks = [];
        this.rocks = [];
        this.waterZones = [];

        // Place resources according to level difficulty
        if(this.level === 1) {
            this.placeResources(5, 3); // fewer resources at level 1
        } else if(this.level === 2) {
            this.placeResources(10, 6);
        } else if(this.level === 3) {
            this.placeResources(15, 10);
        }

        // Define water zones (simple approach: edges represent water)
        this.waterZones.push({x: 0, y: 0, width: this.width, height: 50}); // top edge as water
        this.waterZones.push({x: 0, y: this.height-50, width: this.width, height: 50}); // bottom edge
    }

    placeResources(numSticks, numRocks) {
        for (let i = 0; i < numSticks; i++) {
            this.sticks.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height
            });
        }
        for (let i = 0; i < numRocks; i++) {
            this.rocks.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height
            });
        }
    }

    draw() {
        // Draw sand area
        this.ctx.fillStyle = "#f0e68c";
        this.ctx.fillRect(this.sandArea.x, this.sandArea.y, this.sandArea.width, this.sandArea.height);

        // Draw water zones
        this.ctx.fillStyle = "#00bfff";
        for (let wz of this.waterZones) {
            this.ctx.fillRect(wz.x, wz.y, wz.width, wz.height);
        }

        // Draw sticks
        this.ctx.strokeStyle = "#8b4513";
        for (let s of this.sticks) {
            this.ctx.beginPath();
            this.ctx.moveTo(s.x, s.y);
            this.ctx.lineTo(s.x+5, s.y+15);
            this.ctx.stroke();
        }

        // Draw rocks
        this.ctx.fillStyle = "#808080";
        for (let r of this.rocks) {
            this.ctx.beginPath();
            this.ctx.arc(r.x, r.y, 5, 0, 2*Math.PI);
            this.ctx.fill();
        }
    }

    isWater(x, y) {
        for (let wz of this.waterZones) {
            if (x >= wz.x && x <= wz.x+wz.width && y >= wz.y && y <= wz.y+wz.height) {
                return true;
            }
        }
        return false;
    }

    collectStick(x, y) {
        // Check if there's a stick at (x,y)
        let index = this.sticks.findIndex(s => Math.abs(s.x - x)<10 && Math.abs(s.y - y)<10);
        if (index !== -1) {
            this.sticks.splice(index, 1);
            return true;
        }
        return false;
    }

    collectRock(x, y) {
        let index = this.rocks.findIndex(r => Math.abs(r.x - x)<10 && Math.abs(r.y - y)<10);
        if (index !== -1) {
            this.rocks.splice(index, 1);
            return true;
        }
        return false;
    }
}
