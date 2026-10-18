---
title: Elbow implant review and four-bar knee redesign
short: Elbow & knee
order: 3
year: "2026–"
period: Jun 2026 – present
where: mPragati, IIT Delhi
supervisor: Prof. Dinesh Kalyanasundaram
mentors: [Bavath D., Yogesh Sahu]
role: CAD of implant and test jig, multi-body dynamics, kinematic redesign
discipline: biomech
field: Mechanisms
tools: SolidWorks, ANSYS Mechanical (MBD)
status: Redesign in progress
state: live
summary: Multi-body dynamics found a trajectory flaw in a patented elbow implant that the original design missed. A jammed prosthetic knee linkage was redesigned and tested.
cover: ../../assets/projects/elbow-knee/cover.png
coverNote: Render of the polycentric knee. Build photos to follow.
story:
  - image: ../../assets/projects/elbow-knee/cover.png
    caption: Polycentric four-bar knee
    sub: mPragati, IIT Delhi
  - kicker: Elbow implant
    title: A flaw the original design missed
    text: Multi-body dynamics showed the ulna hinge didn't follow its intended path. I'm now leading the kinematic redesign.
  - kicker: Prosthetic knee
    title: A linkage that jammed
    text: The four-bar knee locked partway through its motion. I redesigned the linkage to remove the locking.
  - kicker: Tested
    title: Checked on real parts
    text: The new knee linkage was validated with physical motion tests.
---

## Overview

Two mechanism problems from my internship at mPragati, IIT Delhi. One is a patented elbow implant being reviewed before technology transfer. The other is a polycentric four-bar prosthetic knee. The elbow implant is still under technology transfer, so this page describes the method, not the design.

## Elbow implant: a review before technology transfer

- Modelled the implant and its test jig as SolidWorks parts and assemblies.
- Ran multi-body dynamics in ANSYS Mechanical to see how it actually moves.
- Found a flaw in the ulna-hinge trajectory that the original design had missed.
- I'm now leading the kinematic redesign.

<figure class="ph-fig"><div data-kind="Screenshot · MBD set-up (no proprietary geometry)"></div><figcaption>Simulation set-up for the review.</figcaption></figure>

## Prosthetic knee: removing a kinematic lock

The polycentric four-bar knee jammed partway through its range. I redesigned the linkage in SolidWorks to remove the locking, then validated it with physical motion tests.

<div class="fig-row">
<figure class="ph-fig"><div data-kind="CAD · original vs redesigned linkage"></div><figcaption>Original and redesigned linkage.</figcaption></figure>
<figure class="ph-fig"><div data-kind="Video · motion test of the new knee"></div><figcaption>Physical motion test.</figcaption></figure>
</div>

## What it taught me

Simulate before you trust a mechanism, even a patented one. Both problems were in the geometry, and both were visible in simulation before anything was cut.
