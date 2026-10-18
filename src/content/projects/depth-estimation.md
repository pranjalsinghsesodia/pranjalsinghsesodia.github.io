---
title: Multi-camera depth estimation of surgical movement
short: Depth vision
order: 2
year: "2025–26"
period: Dec 2025 – May 2026
where: QuEST Lab, IIT Delhi
supervisor: Prof. Jay Dhariwal
mentors: [Bavath D.]
role: Camera calibration, pose-based triangulation and object depth estimation
discipline: robotics
field: Perception
tools: Python, OpenCV, OpenPose, AlphaPose
status: Complete
state: done
summary: Measuring how surgeons move using ordinary 1080p webcams. Checkerboard calibration, 2D keypoints from OpenPose and AlphaPose, then triangulation into 3D.
cover: ../../assets/projects/depth-estimation/diagram.png
coverNote: Diagram. Two calibrated cameras triangulate a keypoint; depth comes from the disparity d.
story:
  - kicker: Question
    title: How do surgeons move?
    text: Measuring hand and arm movement during surgery without markers, motion-capture rooms or special sensors.
  - image: ../../assets/projects/depth-estimation/diagram.png
    caption: Two calibrated cameras, one keypoint
    sub: Stereo triangulation
  - kicker: Pipeline
    title: Calibrate, detect, triangulate
    text: Checkerboard calibration of each 1080p webcam, 2D keypoints from OpenPose and AlphaPose, then triangulation into 3D.
  - kicker: Also
    title: The depth of a chosen object
    text: Object recognition picks a target in the scene, and the same geometry estimates how far away it is.
  - kicker: What it led to
    title: Vision as feedback
    text: The same calibration and tracking now closes the position loop on the 6-DOF arm at mPragati.
---

## Overview

At QuEST Lab, IIT Delhi, I built a pipeline that estimates 3D movement from ordinary 1080p webcams and applied it to recordings of surgical procedures. The aim was to understand how surgeons move without putting markers or sensors on them.

## The problem

Movement says a lot about technique and fatigue, but measuring it usually needs a motion-capture room or markers on the body. Neither works in an operating theatre. The question was how far cheap cameras and open-source pose estimation could go instead.

## What I built

1. **Calibration.** Checkerboard calibration for each webcam to recover its intrinsics and lens distortion, and for the camera pair to recover their relative position.
2. **2D keypoints.** OpenPose and AlphaPose on each camera view to locate wrists, hands and arms frame by frame.
3. **Triangulation.** Matching each keypoint across views and triangulating it into 3D with the calibrated camera matrices.
4. **Object depth.** Object recognition to select a target in the scene, then estimating its distance from the cameras with the same geometry.

<div class="fig-row">
<figure class="ph-fig"><div data-kind="Video · checkerboard calibration"></div><figcaption>Calibrating the webcams with a checkerboard.</figcaption></figure>
<figure class="ph-fig"><div data-kind="GIF · keypoints and depth on a test video"></div><figcaption>2D keypoints in each view and the triangulated depth.</figcaption></figure>
</div>

## How accurate can two webcams be?

For a rectified camera pair, depth is Z = f·B/d, where f is the focal length in pixels, B the distance between the cameras and d the disparity. An error of δd pixels in locating a keypoint becomes a depth error of roughly

δZ ≈ Z² · δd / (f · B)

so the error grows with the square of the distance. That makes camera placement matter more than resolution: moving the cameras closer or further apart changes accuracy far more than a sharper sensor would.

<figure>
<svg class="chart" viewBox="0 0 640 310" role="img" aria-labelledby="dz-t dz-d">
<title id="dz-t">Theoretical depth uncertainty against distance</title>
<desc id="dz-d">Depth uncertainty grows with the square of distance. With 1 pixel of keypoint error it is about 2.4 mm at 1 m and 15 mm at 2.5 m. With 3 pixels it is about 7.3 mm at 1 m and 46 mm at 2.5 m.</desc>
<g class="grid">
<line x1="60" y1="206" x2="600" y2="206"/><line x1="60" y1="162" x2="600" y2="162"/><line x1="60" y1="118" x2="600" y2="118"/><line x1="60" y1="74" x2="600" y2="74"/><line x1="60" y1="30" x2="600" y2="30"/>
</g>
<line class="axis" x1="60" y1="250" x2="600" y2="250"/>
<g text-anchor="end">
<text x="52" y="254">0</text><text x="52" y="210">10</text><text x="52" y="166">20</text><text x="52" y="122">30</text><text x="52" y="78">40</text><text x="52" y="34">50 mm</text>
</g>
<g text-anchor="middle">
<text x="60" y="270">0.5</text><text x="195" y="270">1.0</text><text x="330" y="270">1.5</text><text x="465" y="270">2.0</text><text x="600" y="270">2.5 m</text>
<text x="330" y="296">Distance from the cameras, Z</text>
</g>
<polyline class="s2" points="60,242 127.5,231.9 195,217.9 262.5,199.8 330,177.8 397.5,151.7 465,121.5 532.5,87.4 600,49.3"/>
<polyline class="s1" points="60,247.3 127.5,244 195,239.3 262.5,233.3 330,225.9 397.5,217.2 465,207.2 532.5,195.8 600,183.1"/>
<g>
<circle class="d2" cx="195" cy="217.9" r="5"><title>3 px error at 1.0 m: 7.3 mm</title></circle>
<circle class="d2" cx="330" cy="177.8" r="5"><title>3 px error at 1.5 m: 16.4 mm</title></circle>
<circle class="d2" cx="465" cy="121.5" r="5"><title>3 px error at 2.0 m: 29.2 mm</title></circle>
<circle class="d2" cx="600" cy="49.3" r="5"><title>3 px error at 2.5 m: 45.6 mm</title></circle>
<circle class="d1" cx="195" cy="239.3" r="5"><title>1 px error at 1.0 m: 2.4 mm</title></circle>
<circle class="d1" cx="330" cy="225.9" r="5"><title>1 px error at 1.5 m: 5.5 mm</title></circle>
<circle class="d1" cx="465" cy="207.2" r="5"><title>1 px error at 2.0 m: 9.7 mm</title></circle>
<circle class="d1" cx="600" cy="183.1" r="5"><title>1 px error at 2.5 m: 15.2 mm</title></circle>
</g>
<text class="lab" x="588" y="38" text-anchor="end">3 px keypoint error</text>
<text class="lab" x="588" y="172" text-anchor="end">1 px</text>
<g transform="translate(76 24)">
<line class="s1 key" x1="0" y1="0" x2="18" y2="0"/><text x="24" y="4">1 px</text>
<line class="s2 key" x1="62" y1="0" x2="80" y2="0"/><text x="86" y="4">3 px</text>
</g>
</svg>
<figcaption>Theory, not measurement. Assumes a rectified pair of 1080p webcams with f ≈ 1370 px (about 70° horizontal field of view) and B = 0.30 m. Pose estimators are usually off by a few pixels, so the 3 px line is the more realistic one.</figcaption>
</figure>

<details>
<summary>Show the values</summary>

| Z (m) | δZ at 1 px (mm) | δZ at 3 px (mm) |
| --- | --- | --- |
| 0.5 | 0.6 | 1.8 |
| 1.0 | 2.4 | 7.3 |
| 1.5 | 5.5 | 16.4 |
| 2.0 | 9.7 | 29.2 |
| 2.5 | 15.2 | 45.6 |

</details>

I'm re-running the pipeline on test videos to measure the real error against these curves. Those measurements will replace the theory here.

## Also at QuEST Lab

- A literature review on contactless, gamified ways to assess physical and cognitive fatigue in clinicians, and on optical depth sensing.
- In a four-person team, exploring and developing a pump and lining system for arthroscopic fluid management.

## What it led to

At mPragati the 6-DOF arm has the same problem in another form: its servos can't report where they are. The calibration and tracking I learned here is how I'm now giving it feedback.

Full surgical recordings aren't published here. Clips on this page come from test recordings.
