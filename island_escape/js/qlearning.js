class QLearning {
    constructor(actions, learningRate = 0.01, discountFactor = 0.9, epsilon=0.1) {
        this.actions = actions;
        this.lr = learningRate;
        this.gamma = discountFactor;
        this.epsilon = epsilon;
        this.qTable = {}; // Simple Q-table as a JS object: qTable[state][action]
    }

    getQValues(state) {
        if (!this.qTable[state]) {
            this.qTable[state] = {};
            for (let a of this.actions) {
                this.qTable[state][a] = 0;
            }
        }
        return this.qTable[state];
    }

    chooseAction(state) {
        const qValues = this.getQValues(state);
        if (Math.random() < this.epsilon) {
            // Exploration
            const actionKeys = Object.keys(qValues);
            return actionKeys[Math.floor(Math.random()*actionKeys.length)];
        } else {
            // Exploitation
            let bestAction = null;
            let bestValue = -Infinity;
            for (let [a, val] of Object.entries(qValues)) {
                if (val > bestValue) {
                    bestValue = val;
                    bestAction = a;
                }
            }
            return bestAction;
        }
    }

    updateQValue(state, action, reward, nextState) {
        const qValues = this.getQValues(state);
        const qNext = this.getQValues(nextState);
        const maxNext = Math.max(...Object.values(qNext));
        qValues[action] = qValues[action] + this.lr * (reward + this.gamma * maxNext - qValues[action]);
    }
}
