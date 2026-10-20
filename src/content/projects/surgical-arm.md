---
title: 6‑DOF surgical assistance arm
short: Surgical arm
inRings: true
order: 1
year: "2026–"
period: Jun 2026 – present
where: mPragati, IIT Delhi
supervisor: Prof. Dinesh Kalyanasundaram
mentors: [Bavath D., Yogesh Sahu]
role: Mechanical prototype, vision tracking, ROS 2 and MuJoCo simulation
discipline: robotics
field: Robotics
tools: Python, OpenCV, ROS 2, MuJoCo, MATLAB
status: In progress
state: live
summary: A 6-DOF arm for surgical assistance and endoscope stabilisation, built on open-loop servos. I'm closing the position loop with vision.
cover: ../../assets/projects/surgical-arm/arm-camera.jpg
coverNote: The prototype on the bench at mPragati, with a webcam mounted at the end of the arm.
story:
  - image: ../../assets/projects/surgical-arm/arm-camera.jpg
    caption: The prototype, with a webcam at the end of the arm
    sub: mPragati, IIT Delhi
  - image: ../../assets/projects/surgical-arm/base-bearing.jpg
    caption: The printed base and its ring gear
    sub: FDM printed
  - kicker: Problem
    title: Servos that can't say where they are
    text: Digital hobby servos take a position command but never report back. An arm that holds an endoscope has to know where it is.
  - kicker: Approach
    title: Let the camera be the sensor
    text: Python and OpenCV track a fingertip or the instrument tip, and that measurement closes the loop the servos leave open.
  - image: ../../assets/projects/surgical-arm/weighing.jpg
    caption: The whole arm weighs 1.233 kg
    sub: Weighed on the lab scale
  - kicker: Simulation
    title: ROS 2 and MuJoCo first
    text: Motions are tried in simulation before they run on hardware.
  - kicker: Next
    title: Depth, models, policies
    text: Stereo depth estimation, a mathematical model of the arm, and policy training in MATLAB.
---

## Overview

A 6-DOF surgical-assistance arm and endoscope stabiliser, built at mPragati, IIT Delhi. The long-term aim is an arm that holds an endoscope steady and follows the surgeon's instrument.

## The problem

The prototype runs on digital servos. They're cheap and easy to replace, but they're open-loop: you command an angle and get no confirmation back. Under load or with backlash the arm drifts, and nothing in the hardware notices. For anything near a patient, that isn't acceptable.

## What I've built

- **The mechanical prototype.** Six servo-driven joints on aluminium brackets, standing on a 3D-printed base that turns on a servo-driven gear. With its servos and wiring, the arm weighs 1.233 kg.
- **Vision tracking.** Python and OpenCV code that follows a fingertip or the instrument tip, so the arm's position is measured by a camera instead of assumed.
- **A simulation setup.** The arm in ROS 2 and MuJoCo, so motions can be tried and broken in simulation before they run on hardware.

<div class="fig-row">
<figure>

![The arm extended on the lab bench](../../assets/projects/surgical-arm/arm-bench.jpg)

<figcaption>Extended, on the bench at mPragati.</figcaption>
</figure>
<figure>

![The arm on a weighing scale reading 1.233 kg](../../assets/projects/surgical-arm/weighing.jpg)

<figcaption>The complete arm on the scale: 1.233 kg.</figcaption>
</figure>
</div>

### The base

<div class="fig-row">
<figure>

![Base housing with a servo-driven spur gear](../../assets/projects/surgical-arm/base-gear-top.jpg)

<figcaption>The base from above: a servo-driven pinion sits beside the turntable.</figcaption>
</figure>
<figure>

![Underside of the base showing the internal ring gear](../../assets/projects/surgical-arm/base-bearing.jpg)

<figcaption>Turned over: the printed ring gear inside the base.</figcaption>
</figure>
</div>

<figure>

![A printed base part on the printer bed](../../assets/projects/surgical-arm/base-print.jpg)

<figcaption>A base part coming off the printer.</figcaption>
</figure>

<figure>
<video controls muted playsinline preload="none" poster="../../media/surgical-arm/arm-tracking-test.jpg"><source src="../../media/surgical-arm/arm-tracking-test.mp4" type="video/mp4"></video>
<figcaption>A test run of the arm with vision tracking at mPragati.</figcaption>
</figure>

<figure class="ph-fig"><div data-kind="Screenshot · the arm in MuJoCo"></div><figcaption>The same arm in simulation.</figcaption></figure>

## How I'm testing it

Command a position, measure where the tool actually is with the camera, and close the gap. Simulation comes first, so a motion that fails can fail cheaply.

## What's next

- Stereo depth estimation, so tracking works in 3D instead of in the image plane. This builds directly on my [depth estimation work at QuEST Lab](../depth-estimation/).
- A mathematical model of the arm, then policy training in MATLAB.
