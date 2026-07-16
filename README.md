# tar1090 — Unified Air & Maritime Tracking

![tar1090 interface](docs/screenshot-main.png)

A single situational-awareness map for everything moving around you: aircraft and ships — one map, one traffic table, one set of filters that work consistently across all three.

This is a fork of [wiedehopf/tar1090](https://github.com/wiedehopf/tar1090), extended with a tightly integrated AIS Catcher layer, drone Remote ID support, cross-domain military/operational filtering, live emergency detection with visual alerting, and a set of reliability and data-handling fixes for AIS's inherently sparse, broadcast-driven data model. All credit for the original ADS-B interface and the excellent underlying architecture goes to wiedehopf — this fork extends it rather than replaces it.

Maintained at [myromeo/tar1090](https://github.com/myromeo/tar1090). Please use this repository's issues and releases for anything specific to this fork.

---

## What's different from stock tar1090

| Capability | Stock tar1090 | This fork |
|---|---|---|
| Aircraft (ADS-B / MLAT / TIS-B / UAT) | ✅ | ✅ |
| Marine vessels (AIS) | Partial | ✅ Full map, table, hover, and select integration |
| Military / operational filter | Aircraft only | Aircraft **and** vessels (military, SAR, law enforcement) |
| Emergency detection & alerting | Aircraft squawks only | Aircraft **and** vessel distress states, with visual flashing scoped to your current view |
| Single-contact isolation | Aircraft only | Aircraft **and** vessels |
| Vessel photo lookup | N/A | IMO-first with automatic MMSI fallback |

---

## Key Features

### Unified tracking, one interface
Aircraft and vessels share the same map, the same traffic table, and the same interaction model — select, hover, and filter behave identically regardless of what you're looking at. A vessel isn't a decorative overlay bolted on top; it's a first-class tracked contact.

### Independent Air and Marine controls
- **`A`** — show/hide aircraft
- **`Ma`** — show/hide marine vessels

Run either domain on its own, or both together for a combined picture.

### Cross-domain military / operational filter (`U`)
One toggle, consistent logic across both domains:
- **Air + `U`** — military aircraft only
- **Marine + `U`** — military vessels, search & rescue (surface and airborne), and law enforcement vessels
- **Air + Marine + `U`** — the full operational picture across both

### Live emergency detection and alerting (`E`)
Recognizes genuine distress states in both domains:
- Aircraft squawking `7500` / `7600` / `7700`
- Vessels reporting an AIS navigational status consistent with distress

When an emergency is detected, the **`E` button flashes**, and the corresponding **row in the traffic table flashes** too — no need to scan the whole table to find what triggered it. Alerting is scoped to your **current map view**, so as coverage grows, an emergency on the other side of the world doesn't compete for attention with what's actually happening near you.

### Single-contact isolation (`I`)
Select any aircraft or vessel and isolate it — every other contact hides on both the map and the table until you clear the selection. Works identically for both domains, and safely does nothing if nothing is currently selected.

### AIS vessel classification
Full alignment with the official AIS ship-type table (all 100 codes), with concise category tags for table display and map styling. Vessel type, navigational status, destination, and ETA are all handled with AIS's broadcast cadence in mind — static voyage data (name, destination, dimensions, ETA) is broadcast far less often than position updates, so this fork retains the last known value between broadcasts rather than letting the display flicker blank every time a message doesn't happen to include it.

### Vessel photo lookup
Looks up a vessel photo using its IMO number when available (a stable, permanent identifier), falling back automatically to MMSI-based lookup if no IMO is known or the IMO lookup doesn't return an image. Shows a clear "no image available" message rather than a broken image or a stale image from an unrelated vessel.

### A detail panel that fits what's actually there
The selected-contact detail panel sizes itself to the amount of information actually available for that specific contact — a fully-detailed vessel shows more, a sparsely-reported one shows less — rather than a fixed box that's sometimes mostly empty and sometimes cuts content off.

---

## A note on data handling

AIS and ADS-B are both open, unauthenticated broadcast protocols — anyone with inexpensive radio hardware can transmit data claiming to be any vessel or aircraft. This fork treats all broadcast-sourced text (vessel names, destinations, callsigns) and third-party API responses as untrusted before rendering them, rather than assuming the network is well-behaved. If you're evaluating whether to run this on a public-facing instance, that's a deliberate design consideration, not an afterthought.

---

## Installation

```bash
sudo bash -c "$(wget -nv -O - https://github.com/myromeo/tar1090/raw/master/install.sh)"
```

**Note:** tar1090 is a web interface layered on top of an existing `readsb` or `dump1090-fa` installation — it does not replace your decoder. `dump1090-mutability` installations work too, with more limited aircraft detail.

## Viewing the interface

Replace the IP address with your device's address:

```
http://192.168.x.yy/tar1090
```

Curious about your coverage? Add `?pTracks`:

```
http://192.168.x.yy/tar1090/?pTracks
```

## Updating

Same command as installation — configuration is preserved:

```bash
sudo bash -c "$(wget -nv -O - https://github.com/myromeo/tar1090/raw/master/install.sh)"
```

## Testing local changes

```bash
git clone <this repo>
# make your changes
./install.sh test
```

---

## Configuration

### Part 1 — History interval and track retention

```bash
sudo nano /etc/default/tar1090
```

Edit, save (`Ctrl-X`, `y`, `Enter`), then apply:

```bash
sudo systemctl restart tar1090
```

History duration in seconds = `interval × history_size`.

### Part 2 — The web interface (`config.js`)

```bash
sudo nano /usr/local/share/tar1090/html/config.js
```

Uncomment (remove the leading `//`) any setting you want to take effect, save, then hard-refresh the browser (`Ctrl-F5`).

To restore defaults entirely:

```bash
sudo rm /usr/local/share/tar1090/html/config.js
```
…then re-run the install script.

### Configuring AIS Catcher

```js
// aiscatcher_server = "http://192.168.1.113:8100"; // update with your server address
// aiscatcher_refresh = 15; // refresh interval in seconds
```

Requirements:
- The address must be reachable from the **browser** viewing the page, not just the server — `localhost`/`127.0.0.1` only works if you're viewing tar1090 from the same machine running AIS-catcher. If tar1090 and AIS-catcher run on the same host, you can use the magic token `HOSTNAME` instead of a literal IP, e.g. `http://HOSTNAME:8100`.
- AIS-catcher must be started with GeoJSON output enabled: `-N 8100 geojson on`. Confirm it's working by visiting `<aiscatcher_server>/geojson` directly in a browser — you should see raw GeoJSON.

Can also be set per-session via URL parameter, without touching `config.js`:
```
http://192.168.x.yy/tar1090/?aiscatcher_server=http://192.168.1.113:8100
```
---

## Interface Controls

| Button | Function |
|---|---|
| `A` | Show/hide aircraft |
| `Ma` | Show/hide marine vessels |
| `U` | Military/operational filter (aircraft: military only · vessels: military, SAR, law enforcement) |
| `E` | Flags and flashes when an emergency is detected within your current view |
| `I` | Isolate the selected contact; hides everything else |
| `T` | Toggle tracks on/off |
| `H` | Home / reset map view |

## Keyboard Shortcuts

- `Q` / `E` — zoom out / in
- `A` / `D` — move west / east
- `W` / `S` — move north / south
- `C` or `Esc` — clear selection
- `M` — toggle multiselect
- `T` — select all aircraft
- `B` — toggle map brightness

## Filters

Type and type-description filters use JavaScript regex.

**By type code:**
```
B737 family: B73.
A320 family: A32.
B737-900 and Max 9: B739|B39M
737 family incl. Max: B73.|B3.M
B737 / A320 families: B73.|B3.M|A32.|A2.N
Only A320 and B737: A32|B73
Exclude a type: ^(?!A320)
Exclude multiple: ^(?!(A32.|B73.))
```

**By type description:**
```
Helicopters: H..
2-engine jet landplanes: L2J
Any piston-engine landplane: L.P
Turbine helicopters: H.T
All turboprops incl. helicopters: ..T
4-engine aircraft: .4.
2, 3, or 4-engine aircraft: .2.|.3.|.4.
```

## URL Query Parameters

See [README-query.md](README-query.md) for the full reference.

Notable ones for this fork:
- `?aiscatcher_server=http://...` — override the AIS-catcher endpoint for this session
- `?pTracks` / `?pTracks=2` — show track history (all time, or last N hours)
- `?heatmap=200000` — heatmap mode, see [Heatmap](#heatmap) below

---

## Multiple Instances

Run several tar1090 instances against different data sources (e.g. separate 1090/978 feeds):

```bash
sudo nano /etc/default/tar1090_instances
```

One instance per line: `<source directory> <name>`. Use `webroot` as the name to serve at `/`.

```
/run/dump1090-fa tar1090
/run/combine1090 combo
/run/skyaware978 978
```

Re-run the install script after saving. Each instance gets its own config at `/etc/default/tar1090-<name>` and its own `config.js` under `/usr/local/share/tar1090/html-<name>/`.

**Removing an instance:** delete its line from `tar1090_instances`, then:
```bash
sudo bash /usr/local/share/tar1090/uninstall.sh tar1090-<name>
```

## UAT (978 MHz) Receivers

If running `dump978-fa`/`skyaware978`:

```
# In /etc/default/tar1090:
ENABLE_978=no    # set to yes
URL_978="http://127.0.0.1/skyaware978"
```

For a same-Pi UAT-only setup:
```bash
echo /run/skyaware978 tar1090 | sudo tee /etc/default/tar1090_instances
```
Then run the install script; disable `ENABLE_978` in this case. Note: UAT traffic will display as ADS-B — this is a known upstream limitation, not specific to this fork.

## lighttpd / nginx

- **lighttpd:** tar1090 is served at `:8504` by default. Add a `webroot`-named instance (see above) to serve at `/`.
- **nginx:** include the generated config in your server block:
```
include /usr/local/share/tar1090/nginx-tar1090.conf;
```
Restart nginx after adding it.

## Coverage Range Outline (heywhatsthat.com)

1. Generate a panorama at [heywhatsthat.com](http://www.heywhatsthat.com/) for your exact antenna location.
2. Run, substituting your panorama ID:
```bash
sudo /usr/local/share/tar1090/getupintheair.sh XXXXX
```
3. Compare against actual coverage via `?pTracks`.

Multiple altitudes, and targeting another instance:
```bash
sudo /usr/local/share/tar1090/getupintheair.sh XXXXX 3048,12192
sudo /usr/local/share/tar1090/getupintheair.sh XXXXX 3048 978
```

## Track History (`?pTracks`)

Shows recent traces to visualize your coverage. Filterable by altitude.

```
/tar1090/?pTracks         # default duration (configurable, default 8h)
/tar1090/?pTracks=2       # last 2 hours only
/tar1090/?pTracks=8&pTracksInterval=60   # fewer points, faster rendering
```

### Long-retention history (as used by public aggregators)

Requires wiedehopf's `readsb` fork with:
```
--write-globe-history /var/globe_history --heatmap 30
```
`/var/globe_history` must be writable by the `readsb` user. Also grab the aircraft database:
```bash
wget -O /usr/local/share/tar1090/aircraft.csv.gz https://github.com/wiedehopf/tar1090-db/raw/csv/aircraft.csv.gz
```
…and add `--db-file /usr/local/share/tar1090/aircraft.csv.gz` to your `readsb` options. This does write continuously to disk — be aware of storage growth over time.

**A dedicated long-retention instance**, e.g. 24h of history:
```bash
sudo nano /etc/default/tar1090_instances
```
```
/run/readsb tar1090
/run/readsb persist
```
```bash
sudo bash -c "$(wget -nv -O - https://github.com/myromeo/tar1090/raw/master/install.sh)"
sudo nano /etc/default/tar1090-persist
```
```
INTERVAL=20
HISTORY_SIZE=4300
```
```bash
sudo systemctl restart tar1090-persist
```
Visit `/persist/?pTracks`. Press `T` to toggle traces off while panning/zooming for performance.

## Heatmap

Requires `readsb` with:
```
--heatmap-dir /var/globe_history --heatmap 30
```

```
/tar1090/?heatmap=200000
```
- `&heatDuration=48` — hours shown (default 24)
- `&heatEnd=48` — end of the window, hours into the past (default 0)
- `&heatRadius=2` / `&heatAlpha=2` — dot size / opacity
- `&heatManualRedraw` — only redraw on `R`
- `&realHeat` — alternate style, with `&heatBlur=2` / `&heatWeight=4`

## Offline Map Tiles

- [openfreemap_offline](https://github.com/wiedehopf/openfreemap_offline)
- [Offline map tiles wiki](https://github.com/wiedehopf/adsb-wiki/wiki/offline-map-tiles-tar1090)

## Cloudflare

Set **Caching → Configuration → Browser Cache TTL → "Respect Existing Headers"** — otherwise CF's default 4h TTL will conflict with tar1090's own cache headers.

---

## Related Projects & Credits

Built on [wiedehopf/tar1090](https://github.com/wiedehopf/tar1090) and the [wiedehopf readsb fork](https://github.com/wiedehopf/readsb). Uses [zstddec-tar1090](https://github.com/wiedehopf/zstddec-tar1090) for zstd decompression.

Notable sites running tar1090-based interfaces:
- https://adsb.lol/
- https://globe.adsbexchange.com/
- https://globe.airplanes.live/
- https://globe.adsb.fi/

Notable ADS-B data projects:
- https://gpsjam.org/
- https://adsb.exposed/
- https://tech.marksblogg.com/global-flight-tracking-adsb.html

## Reporting Issues

Open an issue on this repository. Please check the button tooltips and try a hard browser-cache clear first.

## No Warranty

This software is provided free of charge and **as-is**, without warranty of any kind, express or implied — including, without limitation, the implied warranties of merchantability and fitness for a particular purpose. You assume the entire risk as to its quality and performance; should it prove defective, you assume the cost of all necessary servicing, repair, or correction. See `LICENSE` for full terms.
