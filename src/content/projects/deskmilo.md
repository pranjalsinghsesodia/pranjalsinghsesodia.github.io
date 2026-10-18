---
title: DeskMilo, a 2‑DOF desk assistant
short: DeskMilo
order: 6
year: "2026"
period: "2026"
role: Concept, mechanism design, CAD and build
discipline: hardware
field: Hardware
tools: Raspberry Pi, Python, SolidWorks
status: Prototype
state: done
summary: An AI desk assistant with a head that turns to look at you. It journals, reminds, plays music and sends voice messages.
cover: ../../assets/projects/deskmilo/cover.png
# repo: pranjalsinghsesodia/DeskMilo   (uncomment once DeskMilo is transferred into the pranjalsinghsesodia org)
story:
  - image: ../../assets/projects/deskmilo/sketch.jpeg
    caption: Three possible designs
    sub: Notebook sketch
  - kicker: Constraint
    title: Only two motors
    text: The simplest mechanism that still lets Milo look around. Two degrees of freedom for the head.
  - image: ../../assets/projects/deskmilo/cad-exploded.png
    caption: Exploded CAD
    sub: SolidWorks
  - image: ../../assets/projects/deskmilo/cover.png
    caption: DeskMilo
    sub: Raspberry Pi · Python
---

## Overview

Milo is an AI-powered desk assistant. It can journal a thought, send a voice message, set a reminder, play music, or just be a desk pet.

## Design

It started as a page of sketches. I kept the version that needed only two motors, the easiest mechanism that still gives the head two degrees of freedom so it can turn and look at you.

## Features

- A 2-DOF head.
- A speaker so it can answer questions.
- Cooling, so it doesn't overheat on the desk.
- Connects to GPT-style assistants.
