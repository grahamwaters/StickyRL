# Project Overview
Long before the city rose from the empty plains, there was only a dusty crossroads and a handful of dreamers. They arrived as a caravan: a Mayor whose vision was as grand as the sky, and a quiet entourage of workers and thinkers, each with an unspoken purpose. They were drawn by the promise of creating something remarkable: a thriving metropolis of roads, towers, and bustling markets. But nothing was certain. There were no walls yet, no roofs to shelter them, no ordered streets. Only a plan, whispered from one traveler to the next, taking shape beneath the wide, wind-swept skies.

In the early days, the Mayor surveyed the land from a makeshift headquarters—a wooden platform perched atop stacked crates of supplies. From this vantage point, the Mayor could see it all: the routes where trade wagons might one day roll in, the patches of ground ripe for planting orchards and gardens, and the distant hills that would need defending from roving bands of raiders lurking just beyond the horizon. The Mayor’s mind swirled with possibilities: roads to be laid, towering spires to be erected, and proud avenues of commerce to be established.

To realize this vision, the Mayor relied on a cadre of specialized agents. First, there were the **builder agents**, tireless and precise workers who ventured forth from the headquarters each dawn. From the moment the Mayor tapped their shoulders, they accepted their tasks without complaint. They traveled along freshly drawn roads, charts clutched in mechanical hands, scanning the environment for the perfect spot to raise a watchtower or a granary. Sometimes they would find nothing but dust and have to clear debris, or set foundations in stubborn soil. Other times, their mission was to repair a roof torn by last night’s storm winds or reinforce a hastily erected palisade. They worked, day after day, watching the city grow around them, brick by brick, beam by beam.

But the city, still young and vulnerable, was never left in peace. Where prosperity beckoned, so too did potential exploiters. There was the **critic**, a figure rumored to lurk behind the Mayor’s own council rooms, always analyzing, always judging. The critic seemed to understand the city’s bones and muscles intimately, knowing exactly where they might buckle under stress. These insights were never used for healing or strengthening. Instead, the critic quietly instructed a secretive band of **raider agents**, mischievous infiltrators who crept through the night to test the city’s weaknesses. The raiders took note of thin walls and creaking hinges and returned with tools of sabotage. If a watchtower’s frame was poorly braced, they would shake it. If a warehouse door was left unguarded, they would slip inside to pilfer supplies. In this silent, hidden conflict, the critic fueled the raiders’ cunning as the Mayor rallied the builders’ perseverance.

The Mayor was not without countermeasures. Whenever concerns seeped through the council chamber’s thick timber walls—whispers of chipped masonry, rumors of unguarded alleyways—the Mayor would dispatch an **inspector agent**. Swift and meticulous, the inspector roamed the city’s busy lanes, pausing to examine suspicious cracks in the pavement or leaning close to listen for the telltale groan of a stressed beam. The inspector’s keen senses helped produce reports for the Mayor, who would then call forth more builders to improve weak points, rebuild shattered structures, or set clever traps for would-be intruders.

Through all this, the builder agents labored relentlessly. They were not born as ordinary carpenters or masons; each was a careful blend of skill and purpose. When tasked with expansion, they fanned out from the city’s heart, extending roads out to new districts and erecting defensive watchtowers at the perimeter. When told to improve a building, they might tear down a sagging beam and replace it with a stronger support, or add clever reinforcements where the raiders had tried their luck. And if the Mayor demanded it, they could construct entirely new structures—garrison halls for the city’s watchmen, marketplaces that hummed with commerce, and massive gates to keep the distant marauders at bay.

The raiders were the flip side of this coin. They were opportunists, prowling the outskirts of civilization. Guided by the critic’s reports—thin scrolls detailing every small vulnerability—they emerged under the cover of darkness and tested the city’s defenses. A loose latch here, a gap in a defensive wall there, they explored and exploited, attempting to unravel the city’s unity and challenge the Mayor’s grand plans. Yet even as the raiders struck, the Mayor’s resolve hardened. The inspectors would return with their findings, and soon builders rushed to the scene, implementing clever countermeasures.

This world—part blueprint, part battlefield—took shape day by day. The Mayor’s commands echoed through narrow lanes and across scaffolding. The builder agents’ hammers rang out like bells, announcing each new milestone. The critic’s quiet whispers poured forth in secret reports, instructing raiders to press weak points and reveal hidden faults. Behind the scenes, this delicate interplay of creation and destruction formed a living narrative. Each board nailed into place, each stone laid in a foundation, each hinge polished and tested, contributed to the story of the city’s becoming.

In time, what began as a barren crossroad would grow into a shining metropolis. But its splendor would be measured not only by the height of its towers or the breadth of its streets, but by its resilience against the ceaseless cycle of inspection, sabotage, and renewal. And at the center of it all, the Mayor would stand watch, determined to build something lasting—and to ensure that all who threatened it would face skilled builders, vigilant inspectors, and an unwavering will.

# Capital - A Simulation

User designed agents perform the following tasks.
One agent is the world builder and the Mayor in an actor-critic schema. This agent is named `Mayor`.
It spawns `builder` agents which travel from the `headquarters` to places along the cities roads to build structures and defenses.

## builder agent actions
- expand on the potential actions for builder agents here.
## raider agent actions
- expand on the potential actions for raider agents here.
## inspector agent actions
- expand on the potential actions for inspector agents here.
- inspect a building for damages
- report findings back to the Mayor.

## Mayor actions
- spawn `builder` agents to create structures, improve the city, or take actions.
- task builder to perform an action.
  - build something
  - fix a building.
  - improve a building.
- spawn an `inspector` agent to go out and check for damages.
  - inspectors may perform the following actions
    - inspect a building for damages
    - report findings back to the Mayor.

## critic actions
- study buildings for exploitation areas.
- task `raider` agents to exploit the structures.
- formulate reports to send to the Mayor.
- expand on the potential actions for critic agents here.

# Agent Physiology and Form
All of our agents in this simulation are humanoid creatures that walk upright and are bipedal. They are of varying heights, weights, colors, and they move at differing speeds. The mayor sits in his headquarters and watches the world, sometimes walking about on the rooftop. From his perch he orders other agents to go out and do things.

All agents are to learn via deep reinforcement learning. I would prefer that they use SAC and Policy Gradients to take their actions within the environment. Their learning percentage should be visible above their heads while they are on the screen if the user has this toggle activated.

Agents are not robots, they sometimes exhibit actual randomness. Use a data source such as tidal wave heights, random natural phenomena such as temperature at various locations, or another sufficiently unrelated data point to simulate randomness.

# What is the point of this project?
1. The mayor is learning how to build a city that will survive.
2. The Critic is learning how to destroy a city.
3. the builders are learning how to build walls, small dwellings, defence structures such as catapults.
4. The raiders are learning to take down those same structures and destroy the city.