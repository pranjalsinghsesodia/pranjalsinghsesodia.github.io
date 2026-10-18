---
# Copy this portfolio/ folder into a project repo, fill it in, and add the
# repo to projects.sources.json in the portfolio. Images sit next to this file.
title: Project title as it appears in the index
short: Ring label        # under the story ring, keep it to ~12 characters
order: 20               # lower comes first in the rings and the index
year: "2026"            # shown as written: "2026", "2026–", "2021–25"
discipline: robotics    # robotics | biomech | fluids | hardware | research (the filter)
field: Robotics         # label in the Discipline column
tools: Python, SolidWorks
status: In progress
state: live             # live (blue ring + pulsing pill) | done | win (outlined pill)
summary: One or two sentences. Shown on the case study and in the hover preview.
cover: ./cover.jpg      # optional. Without it, the ring shows `ring:` text instead
# ring: Paper
# repo: pranjalsinghsesodia/this-repo
# links:
#   - label: Read the paper
#     href: https://doi.org/...
story:                  # the 30-second tour; image slides and text cards, in order
  - image: ./cover.jpg
    caption: What's in the picture
    sub: Where it was taken
  - kicker: Problem
    title: The problem in one line
    text: A sentence or two of context.
  - kicker: Result
    title: What came out of it
    text: Numbers if you have them.
---

## Overview

The case study. Write it like a build log: the problem, the constraints, what you tried, what broke, what worked.

Heavy files (CAD, STL, video) stay elsewhere in this repo. Link to them from here and they load only when someone clicks.
