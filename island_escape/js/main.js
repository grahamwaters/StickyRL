window.onload = () => {
    const canvas = document.getElementById('simulationCanvas');
    const ctx = canvas.getContext('2d');

    const env = new Environment(ctx, canvas.width, canvas.height);
    const agent = new Agent(env);

    let learningRateInput = document.getElementById('learningRate');
    let discountFactorInput = document.getElementById('discountFactor');

    let currentStateEl = document.getElementById('currentState');
    let lastActionEl = document.getElementById('lastAction');
    let lastRewardEl = document.getElementById('lastReward');
    let episodeCountEl = document.getElementById('episodeCount');
    let stepCountEl = document.getElementById('stepCount');

    const qlearn = new QLearning(agent.actions);

    let running = false;
    let episode = 0;
    let step = 0;

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        env.draw();
        agent.draw(ctx);
    }

    async function runEpisode() {
        let prevState = agent.getState();
        let action = qlearn.chooseAction(prevState);
        let reward = agent.takeAction(action);
        let nextState = agent.getState();

        qlearn.updateQValue(prevState, action, reward, nextState);

        step++;
        updateUI(prevState, action, reward, episode, step);

        render();

        if (episode > 100) {
            // Just a condition to stop after a certain number of episodes
            running = false;
        }

        if (running) {
            requestAnimationFrame(runEpisode);
        }
    }

    function updateUI(state, action, reward, episode, step) {
        currentStateEl.textContent = state;
        lastActionEl.textContent = action;
        lastRewardEl.textContent = reward.toFixed(2);
        episodeCountEl.textContent = episode;
        stepCountEl.textContent = step;
    }

    document.getElementById('startBtn').addEventListener('click', () => {
        qlearn.lr = parseFloat(learningRateInput.value);
        qlearn.gamma = parseFloat(discountFactorInput.value);
        running = true;
        step = 0;
        episode++;
        runEpisode();
    });

    document.getElementById('stopBtn').addEventListener('click', () => {
        running = false;
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        running = false;
        episode = 0;
        step = 0;
        agent.x = env.width/2;
        agent.y = env.height/2;
        agent.inventory = {sticks:0, rocks:0};
        env.level = 1;
        env.setupEnvironment();
        render();
        updateUI("N/A","N/A",0,0,0);
    });

    // Initial render
    render();
};
