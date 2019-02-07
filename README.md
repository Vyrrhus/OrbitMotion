# OrbitMotion

https://vyrrhus.github.io/OrbitMotion is a tool to visualize celestial bodies trajectories.
Currently in development.
You'll find there all the information you need on the simulation itself or how you can interact with it.


## SIMULATION
### KEPLERIAN ORBITS
A keplerian orbit is an orbit that follows Kepler's equation of motion, according to Newton's universal law of attraction. Within this model, every body has a conic trajectory (ellipse - parabola - hyperbola) whose one of the foci is another body.
The influence of this "primary" body outweigh all the other ones, although they still exist : those are called "perturbations". 
In a Keplerian model, each body's influence is bound to a so called "Sphere of Influence" (SOI). An object put inside a SOI is then orbiting around the body at the center of the SOI. If it reaches its boundaries, it leaves the SOI and enters another one, following a new conic trajectory.

### SOLAR SYSTEM MODEL
All the celestial bodies are set to their current position and velocity states on 2019 Jan 1st 00:00, according to JPL's HORIZONS system tool (:: data/data.js file)
Position and velocity vectors are given from the barycenter of the Solar system.
Current bodies in the model:
Sun, Mercury, Earth (Moon), Venus, Mars, Jupiter (Io), Pluto

###  CELESTIAL BODY MODEL
Each celestial body is bound to a Body class which contains a Sketch class used to draw on a canvas, converting "true" position to "sketch" position.
With the Keplerian model, each celestial body but the main one has a unique Orbit class wich remains the same as long as the celestial body stays in the same SOI. Main object (ie most massive) has an infinite SOI and doesn't orbit around another object, thus he has no orbit. 
This orbit class contains all the Keplerian elements that describe a conic trajectory : 
Inclination, Eccentricty, Semi-major axis, Longitude of the Ascending Node, Argument of Periapsis, True anomaly.

At each frame (given a steptime), the true anomaly is updated computing mean & eccentric anomalies.
Then, the Keplerian orbitals are converted back into state vectors (position & velocity).
If the new position computed is outside the SOI or inside a smaller one, then a new orbit is set.

### N BODY PROBLEM
A more accurate simulation would take account of the influence of every body rather than a single one.
With the n-body model, there's no SOI anymore and trajectories are not conics.
Position vector is computed for each body using a Verlet's Integration. Velocity vector is then estimated although it's not as accurate as position.
Such a simulation is very sensitive to the steptime size and has to be run carrefuly to avoid mistakes.

==> DEPRECATED ?
Not implemented yet as accuracy is not good enough. 
There's no point to use the model to compute planet's positions as those are well known and described by JPL's HORIZONS.
Might be useful for satellites if and only if accuracy is good enough.

## CONTROLS
### Rotation
An inertial referential is set at the original barycenter of the system.
The model can be rotated:
- X-axis using `Z` and `S`
- Y-axis using `Q` and `D`
- Z-axis using `A` and `E`
Quaternions are used to rotate the projection's plane (X,Y) on which the position vectors are projected.

### Show orbit
Celestial bodies are drawn with a circle. Using `o`, their trajectories are shawn with a dot at each previous positions.
Take care of the amount of points drawn when you rotate or zoom as all these points will have to be translated and thus cause lag issues.

### Show SOI
Pressing `p` shows a red circle around every body. This circle represents their respective SOI (apart from the most massive body).
If the SOI is not visible, it's probably because it is too small with the current scale.

### Zoom
Zooming changes the scale of the simulation. Every body is on scale, with a lower limit of 5px for radius. Zoom in to get the true scale.

### Focus
Using `(` and `)` set the next body as the center of the simulation, each body and trajectory being drawn from the focus perspective.
The order of the focus is set by mass, from the most massive to the least.

### Steptime
Using `+` and `-` increases or decreases by 5% the velocity of the simulation.
Although there's no problem of accuracy with Keplerian model for most cases, it can raises issues when a body cross the boundary of two SOIs. Time should be decreased so that each transition is as smooth as possible to compute more precisely the corresponding orbits.

### Pause
Pressing `SPACEBAR` pauses the simulation.

### FPS
`$` to show FPS


## WIP
- add mobile devices

- improve HUD : buttons, show velocity vectors, show planet data, etc.
- tool to add new bodies within the simulation at given time.
- add presets scenarios to choose (different sets of elements & time)

- reduce steptime when a body is about to cross a SOI boundary
- add a tool to solve Lambert's problem and compute trajectories
- add maneuvers to change orbits
- add perturbations models to Keplerian orbits

## ISSUES
- crossing a SOI boundary causes a "jump" in the trajectory although the absolute positions remain unchanged
- System barycenter isn't updated
