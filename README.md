# Vintage Story Mapper

A small prototype tool to manually map translocators and landmarks in Vintage Story. For use when a server doesn't have webmap installed, or in singleplayer.

## Features

- Show POIs (Landmarks and Translocator)
- Step-by-step directions between two points
- Search POIs

## Configuration

```yaml
# landmarks.yaml
- name: My Landmark
  location:
    x: -3700
    y: 100
    z: 3275
```

```yaml
# translocators.yaml
- name: My Translocator
  desc: "It's underground!"
  origin:
    x: -3132
    y: 140
    z: 4405
  destination:
    x: -2542
    y: 126
    z: 5320
  color: blue # point & line colour
```
