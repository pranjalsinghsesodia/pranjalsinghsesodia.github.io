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
tools: SolidWorks, ANSYS Mechanical (MBD, static structural)
status: Redesign in progress
state: live
summary: Multi-body dynamics found a trajectory flaw in a patented elbow implant that the original design missed. A jammed prosthetic knee linkage was redesigned and tested.
cover: ../../assets/projects/elbow-knee/knee-printed-1.jpg
coverNote: The printed polycentric knee.
story:
  - image: ../../assets/projects/elbow-knee/knee-leg-assembly.png
    caption: The prosthetic leg assembly
    sub: SolidWorks
  - kicker: Elbow implant
    title: A flaw the original design missed
    text: Multi-body dynamics showed the ulna hinge didn't follow its intended path. I'm now leading the kinematic redesign.
  - kicker: Prosthetic knee
    title: A linkage that jammed
    text: The four-bar knee locked partway through its motion. I redesigned the linkage to remove the locking.
  - image: ../../assets/projects/elbow-knee/knee-print-vs-cad.jpg
    caption: The printed knee next to its CAD
    sub: mPragati, IIT Delhi
  - kicker: Tested
    title: Checked on real parts
    text: The new knee linkage was validated with physical motion tests.
---

## Overview

Two mechanism problems from my internship at mPragati, IIT Delhi. One is a patented elbow implant being reviewed before technology transfer. The other is a polycentric four-bar prosthetic knee.

## Elbow implant: a review before technology transfer

- Modelled the implant and its test jig as SolidWorks parts and assemblies.
- Ran multi-body dynamics in ANSYS Mechanical to see how it actually moves.
- Found a flaw in the ulna-hinge trajectory that the original design had missed.
- I'm now leading the kinematic redesign.

<div class="fig-row">
<figure>

![Meshing the elbow implant in ANSYS](../../assets/projects/elbow-knee/elbow-mesh.png)

<figcaption>Setting up the mesh on the implant's hinge in ANSYS Mechanical.</figcaption>
</figure>
<figure>

![Mesh of an implant component in ANSYS](../../assets/projects/elbow-knee/elbow-setup.png)

<figcaption>Meshed component, ready to solve.</figcaption>
</figure>
</div>

<figure>

![Equivalent stress plot on the ulna component](../../assets/projects/elbow-knee/elbow-stress.png)

<figcaption>Static structural: equivalent (von Mises) stress along the ulna component.</figcaption>
</figure>

<figure>

![Total deformation of the implant assembly](../../assets/projects/elbow-knee/elbow-deformation.png)

<figcaption>Total deformation of the assembly.</figcaption>
</figure>

<div class="fig-row">
<figure>

![Aluminium stand-in for the ulna component](../../assets/projects/elbow-knee/ulna-part-1.jpg)

<figcaption>An aluminium stand-in for the ulna component.</figcaption>
</figure>
<figure>

![The aluminium ulna part from another angle](../../assets/projects/elbow-knee/ulna-part-3.jpg)

<figcaption>The hinge end of the same part.</figcaption>
</figure>
</div>

<figure>

![CAD of the test jig](../../assets/projects/elbow-knee/test-jig.png)

<figcaption>The test jig, modelled in SolidWorks.</figcaption>
</figure>

## Prosthetic knee: removing a kinematic lock

The polycentric four-bar knee jammed partway through its range. I redesigned the linkage in SolidWorks, as parts and as an assembly, to remove the locking. Then I printed it and validated it with physical motion tests.

<div class="fig-row">
<figure>

![CAD of the knee unit](../../assets/projects/elbow-knee/knee-cad-front.png)

<figcaption>The knee unit in SolidWorks.</figcaption>
</figure>
<figure>

![CAD of the four-bar linkage from the side](../../assets/projects/elbow-knee/knee-cad-side.png)

<figcaption>The four-bar linkage from the side.</figcaption>
</figure>
</div>

<div class="fig-row">
<figure>

![The full prosthetic leg assembly in CAD](../../assets/projects/elbow-knee/knee-leg-assembly.png)

<figcaption>The knee in the full prosthetic leg assembly.</figcaption>
</figure>
<figure>

![The knee assembly open in SolidWorks on a laptop](../../assets/projects/elbow-knee/knee-solidworks.jpg)

<figcaption>Working on the assembly.</figcaption>
</figure>
</div>

### From CAD to a printed part

<div class="fig-row">
<figure>

![The printed knee held next to the CAD model on screen](../../assets/projects/elbow-knee/knee-print-vs-cad.jpg)

<figcaption>The printed knee next to its CAD model.</figcaption>
</figure>
<figure>

![The printed knee, flexed](../../assets/projects/elbow-knee/knee-printed-2.jpg)

<figcaption>The printed linkage, flexed.</figcaption>
</figure>
</div>

<figure class="ph-fig"><div data-kind="Video · motion test of the new knee"></div><figcaption>Physical motion test.</figcaption></figure>

## What it taught me

Simulate before you trust a mechanism, even a patented one. Both problems were in the geometry, and both were visible in simulation before anything was cut.
