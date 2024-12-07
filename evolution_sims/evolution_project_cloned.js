// https://editor.p5js.org/Kubi/sketches/bbFDw2L0g is the source for this.


class Creature {
    constructor(id, species, generation, type, brain, traits, loc) {
      this.id = id
      this.species = species
      this.generation = generation

      this.brain = brain

      if(type == "pioneer" || type == "random"){
        if(random() < 0.2){
          game.creatureManager.neat.mutationController.addNodeMutation(this.brain)
        }
      }

      this.alive = true

      this.cage = game.cage

      if (loc) this.loc = loc
      else {
        this.loc = createVector(random(-this.cage.w / 2, this.cage.w / 2), random(-this.cage.h / 2, this.cage.h / 2))
      }
      this.ang = random() * TWO_PI


      if (traits) {
        this.traits = traits
      } else {
        this.traits = this.generateRandomTraits()
      }

      this.stats = {
        foodEaten: 0,
        offspring: 0,
        successfulAttacks: 0
      }

      this.maxEnergy = 3500
      this.variableLoad = 0

      this.reproductionCost = this.maxEnergy * 0.4
      this.maxAttackCost = this.maxEnergy * 0.25
      this.maxAttackForce = map(this.traits.size, settings.creature.size.minTotal, settings.creature.size.maxTotal, settings.creature.attack.force.minTotal, settings.creature.attack.force.maxTotal)

      this.baseLoad = this.calcBaseLoad()

      this.energy = new Counter("descending", this.maxEnergy, this.baseLoad, 0)

      if(type != "random") this.energy.setValueTo(this.maxEnergy * 0.6)

      this.age = new Counter("ascending", 0, settings.general.timePerFrame, settings.creature.general.maxAge)
      if(type == "pioneer") this.age.value = random(settings.creature.general.maxAge)

      this.fertility = new Counter("ascending", 0, 1, settings.creature.reproduction.breedingTime)
      if(type == "pioneer") this.fertility.value = random(settings.creature.reproduction.breedingTime)

      this.attackCharge = new Counter("ascending", 0, 1, settings.creature.attack.chargeTime)
      if(type == "pioneer") this.attackCharge.value = random(settings.creature.attack.chargeTime)

      this.attackTimer = new Counter("descending", settings.creature.attack.displayTime, 1, 0)

      this.injuryTimer = new Counter("descending", 40, 1, 0)
      this.injuryTimer.value = 0

      this.lTounge = this.traits.size * 3.5
      this.wTounge = this.lTounge * 0.05 //map(this.traits.size, settings.creature.size.minTotal, settings.creature.size.maxTotal, 2, 12)

      this.input = {
        angCreatureLeft: 0,
        angCreatureRight: 0,
        distCreature: 0,
        inToungeRange: 0,
        dissimilarity: 0,
        angFoodLeft: 0,
        angFoodRight: 0,
        distFood: 0,
        energy: 0,
        fertility: 0,
        attackCharge: 0,
        temperatureDiff: 0
      }

      this.focused = false
      this.hovered = false

      this.cell = {
        id: undefined,
        gridX: undefined,
        gridY: undefined
      }

      this.updateGrid()

      if(game.speciesManager.species.has(this.species)) {
        let speciesPopulation = game.speciesManager.species.get(this.species)
        speciesPopulation.push(this)
        game.speciesManager.species.set(this.species, speciesPopulation)
        if(speciesPopulation.length == 1) game.speciesManager.nSpeciesAlive ++
      }
      else {
        game.speciesManager.species.set(this.species, [this])
        game.speciesManager.nSpeciesAlive ++
      }
    }

    generateRandomTraits(){
      let traits = {
          color: {
            red: random() * 255,
            green: random() * 255,
            blue: random() * 255
          },

          comfortTemperature: random(),

          size: random(settings.creature.size.minInitial, settings.creature.size.maxInitial),

          maxSpeed: random(settings.creature.speed.minInitial, settings.creature.speed.maxInitial),

          agility: random(settings.creature.agility.minInitial, settings.creature.agility.maxInitial),

          visionRange: random(settings.creature.vision.range.minInitial, settings.creature.vision.range.maxInitial),

          visionAngle: random(settings.creature.vision.angle.minInitial, settings.creature.vision.angle.maxInitial),

          hearingRange: random(settings.creature.hearing.range.minInitial, settings.creature.hearing.range.maxInitial)
        }
      return traits
    }

    calcBaseLoad() {
      let sizeCost = this.traits.size * settings.creature.energy.cost.baseLoad.sizeFactor
      let visionRangeCost = this.traits.visionRange * settings.creature.energy.cost.baseLoad.visionRangeFactor
      let visionAngleCost = this.traits.visionAngle * settings.creature.energy.cost.baseLoad.visionAngleFactor
      let hearingRangeCost = this.traits.hearingRange * settings.creature.energy.cost.baseLoad.hearingRangeFactor

      let baseLoad = sizeCost + visionRangeCost + visionAngleCost

      return baseLoad
    }

    calcTemperatureLoad() {
      let temperature = game.cage.getTemperatureFromYLoc(this.loc.y)
      let temperatureDiff = abs(temperature - this.traits.comfortTemperature)

       let cost = temperatureDiff * settings.creature.energy.cost.baseLoad.temperatureFactor

       this.temperatureLoad = cost
       this.energy.changeValueBy(-cost)
    }

    updateMin() {
      this.hovered = false
    }

    update() {
      this.hovered = false
      this.variableLoad = 0

      let neighborObjects = game.grid.query(this.cell.id, 1, "both")

      this.perceive(neighborObjects)
      this.process()

      this.checkCreatureCollision()
      this.checkWallCollision()

      this.calcTemperatureLoad()

      this.energy.update()
      this.age.update()
      this.fertility.update()
      this.attackCharge.update()
      this.attackTimer.update()
      this.injuryTimer.update()

      if (this.energy.finished() || this.age.finished()) this.alive = false
      if (this.attackTimer.finished()) this.attacking = false

      this.updateGrid()
    }

    updateGrid() {
      let info = game.grid.getCellInfoFromLoc(this.loc.copy())

      if (info.cellId != this.cell.id) {
        if (this.cell.id != undefined) {
          game.grid.removeFrom(this, this.cell.id)
        }

        game.grid.insertInto(this, info.cellId)
        this.cell.id = info.cellId
        this.cell.gridX = info.gridX
        this.cell.gridY = info.gridY
      }
    }

    die() {
      game.grid.removeFrom(this, this.cell.id)

      let speciesPopulation = game.speciesManager.species.get(this.species)
      let ind = speciesPopulation.indexOf(this)
      speciesPopulation.splice(ind, 1)
      game.speciesManager.species.set(this.species, speciesPopulation)
      if(speciesPopulation.length <= 0) game.speciesManager.nSpeciesAlive --
    }

    checkWallCollision() {
      //if(this.cell.gridX <= 0 || this.cell.gridX >= gameManager.grid.nCellsX - 1 || this.cell.gridY <= 0 || this.cell.gridY >= gameManager.grid.nCellsY - 1){
        let overlapLeft = -this.cage.w / 2 - (this.loc.x - this.traits.size / 2)
        if (overlapLeft > 0) this.loc.x += overlapLeft

        let overlapRight = (this.loc.x + this.traits.size / 2) - this.cage.w / 2
        if (overlapRight > 0) this.loc.x -= overlapRight

        let overlapTop = -this.cage.h / 2 - (this.loc.y - this.traits.size / 2)
        if (overlapTop > 0) this.loc.y += overlapTop

        let overlapBottom = (this.loc.y + this.traits.size / 2) - this.cage.h / 2
        if (overlapBottom > 0) this.loc.y -= overlapBottom
     // }
    }

    checkCreatureCollision() {
      for (let c of this.closestNeighbors) {
        if (c != this) {
          let connection = p5.Vector.sub(this.loc, c.loc)
          let dist = connection.mag()

          if (dist < this.traits.size / 2 + c.traits.size / 2) {
            let overlap = dist - (this.traits.size / 2 + c.traits.size / 2)


            let ratio
            // larger then other creature
            if(this.traits.size > c.traits.size) {
              ratio = c.traits.size / this.traits.size

            }
            // smaller or same size than other creature
            else {
              ratio = this.traits.size / c.traits.size
            }
            this.loc.add(connection.copy().mult(-1).setMag(overlap * ratio))
            c.loc.add(connection.setMag(overlap * (1 - ratio)))
          }
        }
      }
    }

    isHovered() {
      let worldPos = cam.calcWorldPos(mouseX, mouseY)
      let dist = p5.Vector.sub(worldPos, this.loc).mag()

      if (dist <= (this.traits.size / 2) * 1.5) {
        return true
      }
      return false
    }

    perceive(neighborObjects) {
      this.scanFood(neighborObjects.foods)
      this.scanCreatures(neighborObjects.creatures)
      this.checkEnergy()
      this.checkFertility()
      this.checkAttackCharge()
      this.checkTemperature()
    }

    checkTemperature() {
      let temperature = game.cage.getTemperatureFromYLoc(this.loc.y)
      let temperatureDiff = abs(temperature - this.traits.comfortTemperature)
      this.input.temperatureDiff = temperatureDiff
    }

    checkFertility() {
      let inputFertility = map(this.fertility.value, this.fertility.defaultValue, this.fertility.threshold, 0, 1)
      if (inputFertility > 1) inputFertility = 1
      this.input.fertility = inputFertility
    }

    checkAttackCharge() {
      let inputAttackCharge = map(this.attackCharge.value, this.attackCharge.defaultValue, this.attackCharge.threshold, 0, 1)
      inputAttackCharge = clamp(inputAttackCharge, 0, 1)
      this.input.attackCharge = inputAttackCharge
    }

    checkEnergy() {
      let inputEnergy = map(this.energy.value, this.energy.defaultValue, this.energy.threshold, 1, 0)
      if (inputEnergy < 0) inputEnergy = 0
      this.input.energy = inputEnergy
    }

    process() {
      let input = Object.values(this.input)
      let output = this.brain.process(input)

      if (this.focused) this.output = output

      // move
      this.move(output[0])

      // rotate
      this.turn(output[1] - output[2])

      // reproduce
      if (output[3] > 0.8 && this.energy.value >= this.reproductionCost && this.fertility.finished()) this.reproduce()

      // attack
      if (output[4] > 0.8 && this.attackCharge.finished()) {
        let commitment = map(output[4] - 0.8, 0, 0.2, 0, 1)
        this.attack(commitment)
      }

    }

    attack(commitment){

      let attackCost = this.maxAttackCost * commitment

      // scale down if not enough energy for intended attack
      if (attackCost > this.energy.value) {
        attackCost = this.energy.value
        commitment = attackCost / this.maxAttackCost
      }

      this.variableLoad += attackCost
      this.energy.changeValueBy(-attackCost)
      this.attackCharge.reset()
      this.attacking = true
      this.attackTimer.reset()

      push()
      translate(this.loc.x, this.loc.y)
      rotate(this.ang)

      for(let c of this.closestNeighbors){
        if(c != this){
          //let tounge = this.loc.copy().add(createVector(this.lTounge, 0).rotate(this.ang))

          // represents relative position of other creature in this creature's coordinate system
          let con = p5.Vector.sub(c.loc, this.loc)
          con.rotate(-this.ang)


          //if(Intersection.lineCircle(this.loc.x, this.loc.y, tounge.x, tounge.y, c.loc.x, c.loc.y, c.traits.size / 2)){
          if(Intersection.circleRect(con.x, con.y, c.traits.size / 2, 0, -this.wTounge / 2, this.lTounge, this.wTounge)){

            let damage = this.maxAttackForce * commitment + attackCost

            c.energy.changeValueBy(-damage)

            //let nutritionRatio = (this.energy.defaultValue - this.energy.value) / this.energy.defaultValue

            let gain = attackCost + damage //* nutritionRatio
            this.energy.changeValueBy(gain)
            if(this.energy.value > this.energy.defaultValue) this.energy.value = this.energy.defaultValue
            c.injuryTimer.reset()

            this.stats.successfulAttacks ++
            //print("commitment: " + round(commitment * 100) / 100 + ", cost: " + round(attackCost) + ", gain: " + round(gain) + ", delta: " + round(gain - attackCost) + ", damage: " + round(damage) + ", maxForce: " + round(this.maxAttackForce))
          }
        }
      }
      pop()
    }

    reproduce() {
      this.variableLoad += this.reproductionCost
      this.energy.changeValueBy(-this.reproductionCost)
      this.stats.offspring++
      this.fertility.reset()

      let speciesId, generation, brain, traits, type
      let genes = {}

      let speciesSize = game.speciesManager.species.get(this.species).length

      let probMiscarriage = speciesSize / 250
      probMiscarriage = clamp(probMiscarriage, 0, 0.5)

      if(random() >= probMiscarriage) {
        //let probRandOffspring = map(speciesSize, 1, 50, 0, 0.5)
        let probRandOffspring = speciesSize / 200
        probRandOffspring = clamp(probRandOffspring, 0, 0.3)

        let newID = game.creatureManager.nextCreatureID
        game.creatureManager.nextCreatureID++

        // random offspring
        if(random() < probRandOffspring) {
          speciesId = game.creatureManager.nextSpeciesID
          game.creatureManager.nextSpeciesID ++

          generation = 1

          // if random offspring: comfort temperature is current temperature to increase survival
          genes.traits = this.generateRandomTraits()
          genes.traits.comfortTemperature = game.cage.getTemperatureFromYLoc(this.loc.y)

          genes.brain = game.creatureManager.neat.createGenome(newID)

          type = "random"
        }
        // mutated offspring
        else {
          // species ID
          speciesId = this.species

          // generation
          generation = this.generation + 1

          // brain
          brain = this.brain.copy()
          brain.id = newID
          game.creatureManager.neat.mutationController.mutate(brain)
          genes.brain = brain

          // traits
          traits = Object.assign({}, this.traits)
          traits.color = Object.assign({}, this.traits.color)
          traits = this.mutateTraits(traits)
          genes.traits = traits

          type = "regular"
        }

        let egg = new Egg(newID, speciesId, generation, type, this.loc.copy(), genes)
        game.eggManager.eggs.push(egg)
      }
    }

    mutateTraits(traits) {
      traits.color.red += random(-settings.creature.color.maxMutation, settings.creature.color.maxMutation)
      traits.color.red = clamp(traits.color.red, 0, 255)

      traits.color.green += random(-settings.creature.color.maxMutation, settings.creature.color.maxMutation)
      traits.color.green = clamp(traits.color.green, 0, 255)

      traits.color.blue += random(-settings.creature.color.maxMutation, settings.creature.color.maxMutation)
      traits.color.blue = clamp(traits.color.blue, 0, 255)

      traits.comfortTemperature += random(-settings.creature.comfortTemperature.maxMutation, settings.creature.comfortTemperature.maxMutation)
      traits.comfortTemperature = clamp(traits.comfortTemperature, settings.creature.comfortTemperature.minTotal, settings.creature.comfortTemperature.maxTotal)

      traits.size += random(-settings.creature.size.maxMutation, settings.creature.size.maxMutation)
      traits.size = clamp(traits.size, settings.creature.size.minTotal, settings.creature.size.maxTotal)

      traits.maxSpeed += random(-settings.creature.speed.maxMutation, settings.creature.speed.maxMutation)
      traits.maxSpeed = clamp(traits.maxSpeed, settings.creature.speed.minTotal, settings.creature.speed.maxTotal)

      traits.agility += random(-settings.creature.agility.maxMutation, settings.creature.agility.maxMutation)
      traits.agility = clamp(traits.agility, settings.creature.agility.minTotal, settings.creature.agility.maxTotal)

      traits.visionRange += random(-settings.creature.vision.range.maxMutation, settings.creature.vision.range.maxMutation)
      traits.visionRange = clamp(traits.visionRange, settings.creature.vision.range.minTotal, settings.creature.vision.range.maxTotal)

      traits.visionAngle += random(-settings.creature.vision.angle.maxMutation, settings.creature.vision.angle.maxMutation)
      traits.visionAngle = clamp(traits.visionAngle, settings.creature.vision.angle.minTotal, settings.creature.vision.angle.maxTotal)

      traits.hearingRange += random(-settings.creature.hearing.range.maxMutation, settings.creature.hearing.range.maxMutation)
      traits.hearingRange = clamp(traits.hearingRange, settings.creature.hearing.range.minTotal, settings.creature.hearing.range.maxTotal)

      return traits
    }

    move(impulse) {
      let move = impulse * this.traits.maxSpeed
      let cost = settings.creature.energy.cost.variable.speedFactor * abs(move)
      this.energy.changeValueBy(-cost)

      this.variableLoad += cost

      let movement = createVector(move, 0).rotate(this.ang)
      this.loc.add(movement)
    }

    turn(impulse) {
      let turn = impulse * this.traits.agility
      let cost = settings.creature.energy.cost.variable.agilityFactor * abs(turn)
      this.energy.changeValueBy(-cost)

      this.variableLoad += cost

      this.ang += turn;
    }

    scanFood(foods) {
      let closest
      let minDist = this.traits.visionRange
      let angClosest
      this.closestFoodInView = undefined

      let orientation = createVector(1, 0).rotate(this.ang)

      // go through foods
      for (let f of foods) {
        let dist = p5.Vector.sub(f.loc, this.loc).mag()

        // check if in vision range
        if (dist <= this.traits.visionRange && !f.eaten) {

          // check if close enough to eat
          if (dist <= this.traits.size / 2 - f.dia / 2) {
            this.eat(f)
            continue
          }

          let connection = p5.Vector.sub(this.loc, f.loc)
          let ang = connection.angleBetween(orientation.copy().rotate(-PI));

          // check if in view
          if (ang >= -this.traits.visionAngle / 2 && ang <= this.traits.visionAngle / 2) {
            // check if closest
            if (dist < minDist) {
              minDist = dist
              closest = f
              angClosest = ang
              if(this.focused) this.closestFoodInView = f
            }
          }
        }
      }

      if (closest != undefined) {
        let inputAngFoodLeft = map(angClosest, this.traits.visionAngle / 2, 0, 0, 1)
        if (inputAngFoodLeft > 1) inputAngFoodLeft = 0
        this.input.angFoodLeft = sq(inputAngFoodLeft)

        let inputAngFoodRight = map(angClosest, -this.traits.visionAngle / 2, 0, 0, 1)
        if (inputAngFoodRight > 1) inputAngFoodRight = 0
        this.input.angFoodRight = sq(inputAngFoodRight)

        let inputDistFood = map(minDist, this.traits.visionRange, this.traits.size / 2 - closest.dia / 2, 0, 1)
        if (inputDistFood > 1) inputDistFood = 0
        this.input.distFood = sq(inputDistFood)

        //let inputValueFood = map(closest.value, settings.food.value.min, settings.food.value.max, 0, 1)
        //this.input.valueFood = inputValueFood
      }
        else {
        this.input.angFoodLeft = 0
        this.input.angFoodRight = 0
        this.input.distFood = 0
        //this.input.valueFood = 0
      }
    }

    scanCreatures(neighbors) {
      this.closestCreatureInView = undefined

      let closestInView
      let minDistInView = this.traits.visionRange
      let angClosestInView

      let orientation = createVector(1, 0).rotate(this.ang)

      this.closestNeighbors = []

      // go through creatures
      for (let c of neighbors) {
        if (c != this) {
          let dist = p5.Vector.sub(c.loc, this.loc).mag()

          // check if close enough for attack (will also be used for collision detection)
          if (dist <= this.lTounge + c.traits.size / 2){
            this.closestNeighbors.push(c)
          }

          // check if in vision range
          if (dist <= this.traits.visionRange && c.alive) {

            let connection = p5.Vector.sub(this.loc, c.loc)
            let ang = connection.angleBetween(orientation.copy().rotate(-PI));

            // check if in view
            if (ang >= -this.traits.visionAngle / 2 && ang <= this.traits.visionAngle / 2) {
              // check if closest
              if (dist < minDistInView) {
                minDistInView = dist
                closestInView = c
                angClosestInView = ang
                if(this.focused) this.closestCreatureInView = c
              }
            }
          }
        }
      }

      if (closestInView != undefined) {
        let inputAngCreatureLeft = map(angClosestInView, this.traits.visionAngle / 2, 0, 0, 1)
        if (inputAngCreatureLeft > 1) inputAngCreatureLeft = 0
        this.input.angCreatureLeft = sq(inputAngCreatureLeft)

        let inputAngCreatureRight = map(angClosestInView, -this.traits.visionAngle / 2, 0, 0, 1)
        if (inputAngCreatureRight > 1) inputAngCreatureRight = 0
        this.input.angCreatureRight = sq(inputAngCreatureRight)

        let inputDistCreature = map(minDistInView, this.traits.visionRange, this.traits.size / 2 + closestInView.traits.size / 2, 0, 1)
        if (inputDistCreature > 1) inputDistCreature = 0
        this.input.distCreature = sq(inputDistCreature)

        if(minDistInView <= this.lTounge + closestInView.traits.size / 2) this.input.inToungeRange = 1
        else this.input.inToungeRange = 0

        //let inputSizeCreature = map(closestInView.traits.size, settings.creature.size.minTotal, settings.creature.size.maxTotal, 0, 1)
        //inputSizeCreature = clamp(inputSizeCreature, 0, 1)
        //this.input.sizeCreature = sq(inputSizeCreature)

        let geneticDistance = game.creatureManager.neat.calcDistance(this.brain, closestInView.brain)
        let inputDissimilarity = map(geneticDistance, 0, 7, 0, 1)
        inputDissimilarity = clamp(inputDissimilarity, 0, 1)
        this.input.dissimilarity = sq(inputDissimilarity)
      } else {
        this.input.angCreatureLeft = 0
        this.input.angCreatureRight = 0
        this.input.distCreature = 0
        //this.input.sizeCreature = 0
        this.input.dissimilarity = 0
        this.input.inToungeRange = 0
      }
    }

    eat(food) {
      food.eaten = true

      let nutritionRatio = (this.energy.defaultValue - this.energy.value) / this.energy.defaultValue

      this.energy.changeValueBy(food.value * nutritionRatio)
      if (this.energy.value > this.energy.defaultValue) this.energy.setValueTo(this.energy.defaultValue)

      this.stats.foodEaten++
    }

    render() {
      if (this.focused) {
        //this.displayInput()
        //this.displayOutput()
        this.renderVision()
        this.renderClosestFoodInView()
        this.renderClosestCreatureInView()
        //this.renderHearing()
        //this.renderEnergyBar()
        //this.renderVariableLoadBar()
        //this.renderLoadBar()
      }

      if(this.attacking) this.renderAttack()
      this.renderBody()
      this.renderEyes()
    }
    renderClosestFoodInView(){

      if(this.closestFoodInView) {
        stroke(255)
        strokeWeight(3)
        noFill()
        circle(this.closestFoodInView.loc.x, this.closestFoodInView.loc.y, this.closestFoodInView.dia * 1.1)
      }
    }

    renderClosestCreatureInView(){

      if(this.closestCreatureInView) {
        stroke(255)
        strokeWeight(3)
        noFill()
        circle(this.closestCreatureInView.loc.x, this.closestCreatureInView.loc.y, this.closestCreatureInView.traits.size * 1.1)
      }
    }

    renderAttack() {
      push()

      translate(this.loc.x, this.loc.y)
      rotate(this.ang)

      let l = map(this.attackTimer.value, this.attackTimer.defaultValue, 0, this.lTounge, 0)


        stroke(255, 120, 120)
        strokeWeight(this.wTounge)
        line(0, 0, l, 0)
      pop()
    }

    renderBody() {
      push()

      translate(this.loc.x, this.loc.y)
      rotate(this.ang)


      strokeWeight(1)
      if(showClimate) {
        stroke(255)
        let r, g, b

        let min = 25
        let max = 100
        r = map(this.traits.comfortTemperature, 0, 1, min, max)
        g = min
        b = map(this.traits.comfortTemperature, 0, 1, max, min)
        fill(r, g, b)


      }
      else {
        stroke(0)
        if(this.injuryTimer.value > 0){
          let r = map(this.injuryTimer.value, this.injuryTimer.defaultValue, this.injuryTimer.threshold, 255, this.traits.color.red)
          let g = map(this.injuryTimer.value, this.injuryTimer.defaultValue, this.injuryTimer.threshold, 100, this.traits.color.green)
          let b = map(this.injuryTimer.value, this.injuryTimer.defaultValue, this.injuryTimer.threshold, 100, this.traits.color.blue)
          fill(r, g, b)
        }
        else fill(this.traits.color.red, this.traits.color.green, this.traits.color.blue)
      }
      circle(0, 0, this.traits.size)

      pop()
    }

      renderHoverRing(){
        push()

      translate(this.loc.x, this.loc.y)
        stroke(settings.color.blue3.r, settings.color.blue3.g, settings.color.blue3.b)
        strokeWeight(3)
        noFill()
        circle(0, 0, this.traits.size * 1.5)
      pop()
      }

    renderEyes() {
      push()

      translate(this.loc.x, this.loc.y)
      rotate(this.ang)
      translate(this.traits.size * 0.25, 0)

      stroke(0)
      strokeWeight(this.traits.size * 0.1)
      point(0, -this.traits.size * 0.1)
      point(0, this.traits.size * 0.1)

      pop()
    }

    renderVision() {
      push()

      translate(this.loc.x, this.loc.y)
      rotate(this.ang)

      noStroke()
      //fill(255, 0, 0, 40)
      fill(settings.color.blue3.r, settings.color.blue3.g, settings.color.blue3.b, 35)
      arc(0, 0, this.traits.visionRange * 2, this.traits.visionRange * 2, -this.traits.visionAngle / 2, this.traits.visionAngle / 2)

      pop()
    }

    renderHearing() {
      push()

      translate(this.loc.x, this.loc.y)
      rotate(this.ang)

      stroke(255, 30)
      noFill()
      circle(0, 0, this.traits.hearingRange * 2)

      pop()
    }

    renderEnergyBar() {
      push()

      translate(this.loc.x, this.loc.y)

      noStroke();
      if (this.energy.value >= this.energy.defaultValue * 0.5) fill(30, 200, 0)
      else if (this.energy.value < this.energy.defaultValue * 0.5 && this.energy.value >= this.energy.defaultValue * 0.2) fill(200, 200, 0)
      else fill(255, 0, 0)

      let maxW = 50;
      let w = map(this.energy.value, this.energy.defaultValue, this.energy.threshold, maxW, 0)
      if (w < 0) w = 0
      rect(-maxW / 2, this.traits.size / 2 + 5, w, 10)

      stroke(255);
      strokeWeight(1);
      noFill();
      rect(-maxW / 2, this.traits.size / 2 + 5, maxW, 10)

      pop()
    }

      renderVariableLoadBar(){
        push()

        translate(this.loc.x, this.loc.y)

        noStroke();
        fill(50, 50, 255)

        let maxW = 30;
        let w = map(this.variableLoad, 0, 0.5, 0, maxW)
        w = clamp(w, 0, maxW)
        rect(-maxW / 2, this.traits.size / 2 + 13, w, 5)

        stroke(255);
        strokeWeight(1);
        noFill();
        rect(-maxW / 2, this.traits.size / 2 + 13, maxW, 5)

        pop()
      }

      renderLoadBar(){
        push()

        translate(this.loc.x, this.loc.y)

        noStroke();


        let factor = 10
        let wTotal = 30;
        //let w = map(this.variableLoad, 0, 0.5, 0, maxW)
        //w = clamp(w, 0, maxW)
        let y = this.traits.size / 2 + 13
        let x1 = -wTotal / 2
        let w1 = this.baseLoad * factor
        fill(50, 50, 255)
        rect(x1, y, w1, 5)

        let x2 = x1 + w1
        let w2 = this.temperatureLoad * factor
        fill(255, 255, 80)
        rect(x2, y, w2, 5)

        let x3 = x2 + w2
        let w3 = this.variableLoad * factor
        fill(70, 255, 200)
        rect(x3, y, w3, 5)

        stroke(255);
        strokeWeight(1);
        noFill();
        rect(x1,y, wTotal, 5)

        pop()
      }

    displayInput() {
      push()

      translate(this.loc.x, this.loc.y)

      textAlign(RIGHT, TOP)
      fill(255);
      noStroke();
      textSize(11);
      let x = -this.traits.size / 2 - 7;
      let y = -13 * Object.keys(this.input).length / 2;
      let str;

      for (let i of Object.values(this.input)) {

        str = round(i * 100) / 100
        text(str, x, y);
        y += 13
      }

      pop()
    }

    displayOutput() {
      if (this.output) {
        push()

        translate(this.cam.screen.x + this.loc.x, this.cam.screen.y + this.loc.y)

        textAlign(LEFT, TOP)
        fill(255);
        noStroke();
        textSize(11);
        let x = this.traits.size / 2 + 7;
        let y = -13 * this.output.length / 2;
        let str;
        for (let i of this.output) {
          str = round(i * 100) / 100
          text(str, x, y);
          y += 13
        }

        pop()
      }
    }
  }