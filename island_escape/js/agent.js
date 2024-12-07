class Agent {
    constructor(env) {
        this.env = env;
        this.x = env.width / 2;
        this.y = env.height / 2;
        this.inventory = {sticks:0, rocks:0};
        this.size = 10;

        // Possible actions: move up, down, left, right, pick stick, pick rock, try build
        this.actions = [
            "move_up", "move_down", "move_left", "move_right",
            "pick_stick", "pick_rock", "build"
        ];
    }

    draw(ctx) {
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        // Simple stick figure: head, body, arms, legs
        ctx.arc(this.x, this.y, 5, 0, 2*Math.PI); // head
        ctx.moveTo(this.x, this.y+5);
        ctx.lineTo(this.x, this.y+15); // body
        ctx.moveTo(this.x, this.y+10);
        ctx.lineTo(this.x-5, this.y+5); // left arm
        ctx.moveTo(this.x, this.y+10);
        ctx.lineTo(this.x+5, this.y+5); // right arm
        ctx.moveTo(this.x, this.y+15);
        ctx.lineTo(this.x-5, this.y+25); // left leg
        ctx.moveTo(this.x, this.y+15);
        ctx.lineTo(this.x+5, this.y+25); // right leg
        ctx.stroke();
    }

    getState() {
        // A simple state encoding: [x_position, y_position, sticks_in_inventory, rocks_in_inventory, level]
        // You might want a more abstract state for RL.
        return [
            Math.floor(this.x/10),
            Math.floor(this.y/10),
            this.inventory.sticks,
            this.inventory.rocks,
            this.env.level
        ].join("_");
    }

    takeAction(action) {
        let reward = 0;

        switch(action) {
            case "move_up":
                this.y = Math.max(this.y - 10, 0);
                break;
            case "move_down":
                this.y = Math.min(this.y + 10, this.env.height);
                break;
            case "move_left":
                this.x = Math.max(this.x - 10, 0);
                break;
            case "move_right":
                this.x = Math.min(this.x + 10, this.env.width);
                break;
            case "pick_stick":
                if (this.env.collectStick(this.x, this.y)) {
                    this.inventory.sticks += 1;
                    reward = 0.1;
                }
                break;
            case "pick_rock":
                if (this.env.collectRock(this.x, this.y)) {
                    this.inventory.rocks += 1;
                    reward = 0.1;
                }
                break;
            case "build":
                // Attempt to build a raft if conditions are met (e.g., certain amount of resources)
                if (this.inventory.sticks >= 5 && this.inventory.rocks >= 3) {
                    // Successfully build raft and "escape"
                    reward = 10;
                    // Move to next level or end simulation
                    this.env.level = Math.min(this.env.level + 1, 3);
                    this.env.setupEnvironment();
                    this.inventory = {sticks:0, rocks:0};
                    this.x = this.env.width/2;
                    this.y = this.env.height/2;
                } else {
                    // Not enough resources, small negative reward
                    reward = -0.01;
                }
                break;
        }

        // Water penalty (if standing in water?)
        if (this.env.isWater(this.x, this.y)) {
            reward -= 0.05;
        }

        return reward;
    }
}
