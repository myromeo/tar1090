## Changelog
All notable changes to this project will be documented here. 

## 07-09-2016
- Temporarily changed vessel image lookup to use Wikimedia - this WILL result in incorrect images loading! I'm still working on a solution with MarineTraffic and will implement as soon as something better becomes available.

## 17-08-2026
- Added select Aircraft Squawk code descriptions as 'status' (Thanks Soti for the info)
- Added squawk 7400, UAV Link Lost, to emergency filter
- Note, I'm aware that vessel image lookups are failing. The MarineTraffic service I relied upon has been deprecated. I'm waiting on further information for an alternative method. 

## 29-07-2026
- Backend change to AIS-Catcher v0.70

## 21-07-2026
- Add ship track duration slider to settings (off-24h, default 1h)
  
## 20-07-2026
- Recall ship track on select from ais api (/api/path.json?<mmsi>)

## 16-07-2026
- Only flash #E button if emergency on screen

## 13-07-2026
- Emergency filtering for AIS vessels
- Flash #E button on emergency present anywhere

## 10-07-2026
- Add Marine and Aircraft toggle buttons
- Add AIS military, law enforcement and search and rescue to U button
  
