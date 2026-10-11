## Changelog
All notable changes to this project will be documented here. 

## 11-10-2026
### Major update
**Install as an app**
- mlat.uk can now be installed to your phone's home screen as a full-screen web app, with its own mlat.uk icon. On Android and desktop Chrome/Edge it's a one-tap install; on iPhone it's Share > Add to Home Screen. A small prompt offers this once per visit (map only, never inside the main site)
- iPhone layout tuned for the installed app: the map runs edge to edge, the top buttons sit clear of the iOS status bar fade, and the bottom panel, credits and scale bar clear the home bar and curved screen corners
- A simple "You're offline" page if the app is opened without a connection

**Mobile and desktop interface**
- New 2026 colour scheme across the map and main site, balanced to the logo and the OpenFreeMap basemap. Dark mode now properly inverts, logo included
- New mobile layout: selecting an object opens a swipe-up details panel instead of the sidebar. It always opens minimised, with the country flag, ID, full type name, altitude and speed, and a route line in plain English (e.g. Newcastle → Paris) or the vessel's destination
- The selected object stays centred in the part of the map you can actually see, on both mobile (above the panel) and desktop (beside the sidebar)
- Country flags added to the sidebar and mobile panel, including satellite owners
- Photos now fill a consistent, centred frame. Where no image exists, an outline of the aircraft, vessel class or satellite is shown instead
- Mobile tidy-up: zoom buttons retired on touch screens (pinch to zoom), the altitude bar fits the screen, map credits no longer overlap the controls, and About / Settings open neatly below the top menu

**Satellites**
- Satellite data split: catalogue details are fetched once and cached instead of being repeated in every position update. Position updates are around 75% smaller, and compressed on top
- New orbit info: orbit class, perigee × apogee, inclination and period (e.g. LEO · 413 × 420 km · 51.6° · 92.9 min), plus TLE age with a stale warning after 7 days, and docked objects flagged
- Satellite tracks now update with every position change instead of lagging behind
- The satellite engine now recovers on its own after a CelesTrak error (pauses for 24 hours, then retries once) instead of stopping until manually reset

**Performance**
- Much faster page load and smoother panning on high object counts: satellites on their own WebGL layer, vessel hull outlines only load when zoomed in, feeds no longer overlap or hang, switched-off layers stop polling, and live vessel and satellite feeds pause during replay and heat map

**Main site and data**
- Main site restyled to match the map, with updated feature pages, credits and privacy policy. The Telemetry page reads the new satellite data format
- AISHub credit added to the map

**Bug fixes**
- Tapping the map to deselect no longer re-selects the aircraft when the tap lands near its trail
- In History mode on touch screens, stray taps no longer jump the aircraft to random points along its path
- The mobile panel no longer briefly opens full screen or stalls while an image is found
- Various other fixes

## 25-09-2026
- Busy week optimising satellite integration:
- Changed satellite inject method from spoof readsb messages to standalone json (similar mechanism as used for vessels)
- Updated the backend satellite engine to fetch satellite catalog data, and updated UI to display additional info
- Introduced cache to reduce calls to CelesTrak
- Updated image fetch lookup method to increase chances of an image match
- Added satellite tracks via SGP4 reverse calculation and GET on select
- Updated main site Telemetry page to directly poll the new json endpoint for satellite data
- Fixed double click on Telemetry page to follow a satellite
- Docker container tweaks to optimise performance for higher object counts
- Various bug fixes

## 17-09-2026
- Moved UI object rendering to WebGL
- Added military satellites to 'U' filter
- Added 'last 30 days' satellite group dataset from celestrak, with recent satellites showing as green.
- Updated site logo to reflect multi-domain interface, plus it looks cool.
- Updated main site wording to include satellite references
- various bug fixes and UI tweaks

## 16-09-2026
### Major update
- Added new satellite  option with dataset from celestrak visual, stations, and military groups. this feature is experimental, and I expect some glitches whilst I commission.
- various minor bug fixes

## 07-09-2026
- Temporarily changed vessel image lookup to use Wikimedia - this WILL result in missing or incorrect images loading, sometimes with quite amusing results! I'm still working on a solution with MarineTraffic and will implement as soon as something better becomes available. 

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
