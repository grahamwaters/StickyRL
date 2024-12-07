# Project Overview

User designed agents perform the following tasks.
One agent is the world builder and the Actor in an actor critic schema. This agent is named `Actor`.
It spawns `builder` agents which travel from the `headquarters` to places along the cities roads to build structures and defenses.

## builder actions
- expand on the potential actions for builder agents here.

## actor actions
- spawn builder
- task builder to perform an action.
  - build something
  - fix a building.
  - improve a building.
- spawn an `inspector` agent to go out and check for damages.

## critic actions
- study buildings for exploitation areas.
- task `raider` agents to exploit the structures.
- formulate reports to send to the builder.
