// Some global variables are defined in early.js
// early.js takes care of getting some history files while the html page and
// some javascript libraries are still loading, hopefully speeding up loading


"use strict";

g.planes        = {};
g.planesOrdered = [];
g.route_cache = [];
g.route_check_todo = {};
g.route_check_in_flight = false;
g.route_next_lookup = 0;
g.route_last_lookup = 0;

g.mapOrientation = mapOrientation;

// Define our global variables
let tabHidden = false;
let webgl = false;
let webglFeatures = new ol.source.Vector();
let webglLayer;
// Satellites get their own WebGL points layer (zIndex 490, above the aircraft
// WebGL layer at 200): a WebGLPoints layer has no per-feature z-order, so
// sharing the aircraft layer let aircraft paint over satellites.
let webglSatFeatures = new ol.source.Vector();
let webglSatLayer = null;
let OLMap = null;
let OLProj = null;
let OLProjExtent = null;
let PlaneIconFeatures = new ol.source.Vector();
// Satellites get their own layers so they always paint above aircraft: in
// WebGL mode their icons go into webglSatLayer (see above); their vector
// marker (icon when WebGL is off, label when labels are on) goes into
// SatelliteIconFeatures / satelliteIconLayer (zIndex 500).
let SatelliteIconFeatures = new ol.source.Vector();
let trailGroup = new ol.Collection();
let siteCircleLayer;
let siteCircleFeatures = new ol.source.Vector();
let locationDotLayer;
let locationDotFeatures = new ol.source.Vector();
let iconLayer;
let satelliteIconLayer;
let trailLayers;
let heatFeatures = [];
let heatFeaturesSpread = 1024;
let heatLayers = [];
let realHeatFeatures = new ol.source.Vector();
let realHeat;
let iconCache = {};
let addToIconCache = [];
let lineStyleCache = {};
let replayPlanes = {};
let PlaneFilter   = {};
let SelectedPlane = null;
let sp = null;
let SelPlanes = [];
let aisTrackMaxHours = 1;
let SelectedAllPlanes = false;
window.ShowMarine = true;
window.ShowAir = true;
window.ShowSatellites = true;
let satellitesShown = 0;
let satellitesTotal = 0;
let HighlightedPlane = null;
let FollowSelected = false;
// Settings > "Follow on select": selecting an object with its details panel
// open starts Follow (F). Off = selection leaves the map where it is.
let followOnSelect = true;
let followPos = [];
let loadStart = new Date().getTime();
let mapResizeTimeout;
let pointerMoveTimeout;
let iconSize = 1;
let debugTracks = false;
let verboseUpdateTrack = false;
let debugAll = false;
let trackLabels = false;
let multiSelect = false;
let uat_data = null;
g.enableLabels = false;
g.extendedLabels = 0;
let mapIsVisible = true;
let onlyMilitary = false;
let onlyEmergency = false;
let emergencyButtonTimer = null;
let onlySelected = false;
let debug = false;
let debugJump = false;
let jumpTo = null;
let noMLAT = false;
let noVanish = false;
let filterTracks = false; // altitude filter: don't filter planes but rather their tracks by altitude
let refreshId = 0;
let lastFetch = 0;
let actualOutline = {};
let globeIndexNow = {};
let globeIndexDist = {};
let globeIndexSpecialLookup = {};
let globeTilesViewCount = 0;
let globeTableLimitBase = 80;
let globeTableLimit = 80;
// Sidebar table row caps (non-globe mode; globeIndex keeps globeTableLimit above).
// Every row is a real <tr> with ~20 cells that is re-sorted and re-inserted on each
// refresh, so an uncapped table freezes the page once thousands of satellites /
// vessels are tracked. Selected planes are always kept, even beyond the cap.
let tableRowLimit = 100;            // map visible next to the table
let tableRowLimitExpanded = 1000;   // sidebar expanded to full width (map hidden)
let fetchCounter = 0;
let lastGlobeExtent;
let lastRenderExtent;
let pendingFetches = 0;
let firstFetch = true;
let debugCounter = 0;
let pathName = window.location.pathname.replace(/\/+/, '/') || "/";
let sourcesFilter = null;
let sources = ['adsb', ['uat', 'adsr'], 'mlat', 'tisb', 'modeS', 'other', 'adsc', 'ais', 'sat'];

// tableColors (unselected/selected color-by-source palettes) is defined in a
// stock file this session never touched, so a new source key can't be added
// to its own definition directly - inject it here instead. Picked deliberately
// far from every existing source color (adsb/uat/mlat/tisb/modeS/other/adsc/ais)
// to guarantee no accidental clash with whatever palette that file uses.
if (typeof tableColors !== 'undefined') {
    if (tableColors.unselected && !tableColors.unselected.sat) tableColors.unselected.sat = '#00bcd4';
    if (tableColors.selected && !tableColors.selected.sat) tableColors.selected.sat = '#00bcd4';
}
let flagFilter = null;
let flagFilterValues = ['military', 'pia', 'ladd'];
let showTrace = false;
let showTraceExit = false;
let showTraceWasIsolation = false;
let showTraceTimestamp = null;
let traceDate = null;
let traceDateString = null;
let traceOpts = {};
let icaoParam = null;
let newWidth = lineWidth;
let SiteOverride = (SiteLat != null && SiteLon != null);
let onJumpInput = null;
let labelFill = null;
let blackFill = null;
let labelStroke = null;
let labelStrokeNarrow = null;
let bgFill = null;
let legSel = -1;
let geoMag = null;
let solidT = false;
let lastActive = new Date().getTime();
let enableOverlays = [];
let halloween = false;
let noRegOnly = false;
let triggerRefresh = 0;
let firstDraw = true;
let darkerColors = false;
let autoselect = false;
let nogpsOnly = false;
let spritesDataURL = null;
let trace_hist_only = false;
let traces_high_res = false;
let show_rId = true;
let labels_top = false;
let lockDotCentered = false;
let overrideMapType = null;
let layerMoreContrast = false;
let layerDimFactor = 0;
let layerExtraContrast = 0;
let shareFiltersParam = false;
let lastRequestSize = 0;
let lastRequestBox = '';
let nextQuerySelected = 0;
let enableDynamicCachebusting = false;
g.lastRefreshInt = 1000;
let reapTimeout = globeIndex ? 240 : 480;

let baroCorrectQNH = 1013.25;

let limitUpdates = -1;

let infoBlockWidth = baseInfoBlockWidth;

const renderBuffer = 60;

let shareLink = '';

let CenterLat = 0;
let CenterLon = 0;
g.zoomLvl = 5;
g.zoomLvlCache;

let TrackedAircraft = 0;
let globeTrackedAircraft = 0;
let TrackedAircraftPositions = 0;
let TrackedHistorySize = 0;
let aircraftShown = 0;
let vesselsShown = 0;
let aircraftTotal = 0;
let vesselsTotal = 0;

let SitePosition = null;

// timestamps
let now = 0;
let last = 0;
let uat_now = 0;
let uat_last = 0;
let FetchPending = [];
let FetchPendingUAT = null;

let MessageCountHistory = [];
let MessageRate = 0;

let layers;
let layers_group;

const nullStyle = new ol.style.Style({});

let estimateStyle;
let estimateStyleSlim;
let badLine;
let badLineMlat;
let badDot;
let badDotMlat;

let showingReplayBar = false;

function processAircraft(ac, init, uat) {
    const isArray = Array.isArray(ac);
    let hex = isArray ? ac[0] : ac.hex;

    if (icaoFilter && !icaoFilter.includes(hex))
        return;

    if (icaoBlacklist && icaoBlacklist.includes(hex))
        return;

    if (MergeNonIcao && hex.startsWith('~')) {
        hex = hex.slice(1);
    }

    const type = isArray ? ac[7] : ac.type;
    if (g.historyKeep && !g.historyKeep[hex] && type != 'adsc') {
        return;
    }

    if (uat && uatNoTISB && ac.type && ac.type.substring(0,4) == "tisb") {
        // drop non ADS-B planes from UAT (TIS-B)
        return;
    }

    // Do we already have this plane object in g.planes?
    // If not make it.
    let plane = g.planes[hex]

    if (!plane) {
        plane = new PlaneObject(hex);
        if (uat)
            plane.uat = true;
    }


    if (showTrace)
        return;

    // Call the function update
    if (globeIndex || replay) {
        if (!onlyMilitary || onlyEmergency || plane.military || (ac.dbFlags && ac.dbFlags & 1)) {
            plane.updateData(now, last, ac, init);
        } else {
            plane.last_message_time = now - ac.seen;
        }
        return;
    }
    if (uat_now == 0) {
        plane.updateData(now, last, ac, init);
        return;
    }

    // UAT dual source stuff below

    let newPos = ac.seen_pos;
    if (newPos === undefined || isNaN(newPos)) {
        newPos = 1000;
    }
    let oldPos = plane.seen_pos;
    if (oldPos === undefined || isNaN(oldPos)) {
        oldPos = 1000;
    }
    let newSeen = ac.seen;
    if (newSeen === undefined || isNaN(newSeen)) {
        newSeen = 1000;
    }
    let oldSeen = plane.seen;
    if (oldSeen === undefined || isNaN(oldSeen)) {
        oldSeen = 1000;
    }

    if (!uat) {
        if (!plane.uat // plane isn't uat, new data isn't uat, accept immediately
            || (prefer978 < 0 && newPos < -prefer978)
            || (newPos < 2 && oldPos > 4 + prefer978)
            || (oldPos > 60 && newSeen < 2 && oldSeen > 4 + prefer978)
            || init) {
            plane.uat = false;
            plane.updateData(now, last, ac, init);
        }
    } else {
        if (plane.uat // plane is uat, new data is uat, accept immediately
            || (prefer978 > 0 && newPos < prefer978)
            || (newPos < 2 && (oldPos > 4 - prefer978 || plane.dataSource == "mlat"))
            || (oldPos > 60 && newSeen < 2 && oldSeen > 4 - prefer978)
            || init) {
            let tisb = Array.isArray(ac) ? (ac[7] == "tisb") : (ac.tisb != null && ac.tisb.indexOf("lat") >= 0);
            if (tisb && plane.dataSource == "adsb") {
                // ignore TIS-B data for current ADS-B 1090 planes
            } else {
                plane.uat = true;
                plane.updateData(uat_now, uat_last, ac, init);
            }
        }
    }
}

let notNewCounter = 0;
let backwardsCounter = 0;
function processReceiverUpdate(data, init) {
    // update now and last
    let uat = data.uat_978;
    if (uat) {
        if (data.now <= uat_now)
            return;
        uat_last = uat_now;
        uat_now = data.now;
    } else {
        if (uat_now && now - uat_now > 15) {
            uat_now = now;
        }
        if (data.now <= now && !globeIndex) {
            if (data.now < now) {
                backwardsCounter++;
                console.log('timestep backwards or the same, ignoring data: ' + now + ' -> ' + data.now);
                if (backwardsCounter >= 5) {
                    backwardsCounter = 0;
                    console.log('resetting all data now:' + now + ' -> ' + data.now);
                    now = data.now;
                    last = now - 1;
                    reaper(1);
                    enableDynamicCachebusting = true;
                }
            }
            if (++notNewCounter > 2) {
                // data.now is too old, possibly a caching issues
                enableDynamicCachebusting = true;
            }
            return;
        }
        if (data.now > now) {
            if (0 && now && data.now - now > 10) {
                console.log('now jumped: ' + localTime(new Date(now * 1000)) + ' -> ' + localTime(new Date(data.now * 1000)));
            }
            notNewCounter = 0;
            backwardsCounter = 0;
            last = now;
            now = data.now;
        }
    }
    g.now = now;

    if (globeIndex) {
        if ((showGrid || loStore['globeGrid'] == 'true')
            && globeIndexNow[data.globeIndex] == null)
            drawTileBorder(data);
        globeTrackedAircraft = data.global_ac_count_withpos;
        globeIndexNow[data.globeIndex] = data.now;
    }

    if (!(uat || init || (globeIndex && aggregator))) {
        updateMessageRate(data);
    }

    // Loop through all the planes in the data packet
    for (let j=0; j < data.aircraft.length; j++) {
        processAircraft(data.aircraft[j], init, uat);
    }
}
let lastFetchFailStatus = null;
function fetchFail(jqxhr, status, error) {
    try {
        pendingFetches--;
        if (pendingFetches <= 0 && !tabHidden) {
            triggerRefresh++;
            checkMovement();
        }
        status = jqxhr.status;
        if (jqxhr.readyState == 0) error = "Can't connect to server, check your network!";
        let errText = status + (error ? (": " + error) : "");
        // Only log a full jqxhr/error dump when the failure status actually
        // changes, not on every single retry - during a restart it can take
        // a couple of minutes for the server to start producing data, and
        // that shows up here as the exact same 404 repeated on every poll
        // (every ~1s). The #update_error banner below already communicates
        // that to the user; repeating a full object dump ~100+ times adds
        // real console overhead (particularly costly in Safari specifically
        // when devtools is attached) for a condition that's already visible
        // and expected.
        if (status !== lastFetchFailStatus) {
            console.log(jqxhr);
            console.log(error);
            lastFetchFailStatus = status;
        }
        // Before the very first successful fetch, a 404 almost always means
        // the receiver (readsb) is still starting up and hasn't written its
        // first data file yet - not a real error. Say so plainly instead of
        // showing a raw HTTP status, which reads as broken rather than
        // "wait a moment". Once we've had at least one successful fetch,
        // any later failure is a genuine, more concerning loss of contact,
        // so keep showing the real status/error text for that case.
        if (firstFetch && status == 404) {
            errText = "Waiting for the receiver to start up\u2026 this can take a few minutes after a restart.";
        }
        if (status != 429 && status != '429') {
            jQuery("#update_error_detail").text(errText);
            jQuery("#update_error").css('display','block');
            StaleReceiverCount++;
        } else {
            if (C429++ > 16) {
                globeRateUpdate();
                C429 = 0;
            }
        }
    } catch (e) {
        console.error(e);
    }
}

function fetchDone(data) {
    try {
        pendingFetches--;
        if (data == null) {
            return;
        }
        if (zstd) {
            let arr = new Uint8Array(data);
            lastRequestSize = arr.byteLength;
            let res;
            try {
                res = zstdDecode( arr, 0 );
            } catch (e) {
                let errText = e.message;
                console.log(errText);
                jQuery("#update_error_detail").text(errText);
                jQuery("#update_error").css('display','block');
                return;
            }
            let arrayBuffer = res.buffer
            // return type is Uint8Array, wqi requires the ArrayBuffer
            data = { buffer: arrayBuffer, };
            wqi(data);
        } else if (binCraft) {
            lastRequestSize = data.byteLength / 2;
            data = { buffer: data, };
            wqi(data);
        }
        data.urlIndex = this.urlIndex;

        if (!data.aircraft || !data.now) {
            let error = data.error;
            if (error) {
                jQuery("#update_error_detail").text(error);
                jQuery("#update_error").css('display','block');
                StaleReceiverCount++;
            }
            return;
        }

        if (!timersActive) {
            //console.log(localTime(new Date()) + " fetchDone: not applying data due to !timersActive");
            return;
        }

        //console.time("Process " + data.globeIndex);
        processReceiverUpdate(data);
        //console.timeEnd("Process " + data.globeIndex);
        data = null;

        if (uat_data) {
            processReceiverUpdate(uat_data);
            uat_data = null;
        }

        if (pendingFetches <= 0 && !tabHidden) {
            triggerRefresh++;
            checkMovement();
            if (firstFetch) {
                firstFetch = false;
                if (uuid) {
                    const ext = myExtent(viewportExtent(OLMap.getSize()));
                    let jump = true;
                    for (let i = 0; i < g.planesOrdered.length; ++i) {
                        const plane = g.planesOrdered[i];
                        if (plane.visible && inView(plane.position, ext)) {
                            jump = false;
                            break;
                        }
                    }
                    if (jump) {
                        followRandomPlane();
                        deselectAllPlanes();
                        OLMap.getView().setZoom(6);
                    }
                }
                checkRefresh();
            }
        }
        fetchDoneCount++;
        if (fetchDoneCount == 1) { console.timeEnd("first fetch()"); };

        if (!g.firstFetchDone) { afterFirstFetch(); };

        // Check for stale receiver data
        if (last == now && !globeIndex) {
            StaleReceiverCount++;
            if (StaleReceiverCount > 5) {
                jQuery("#update_error_detail").text("The data from the server hasn't been updated in a while.");
                jQuery("#update_error").css('display','block');
            }
        } else if (StaleReceiverCount > 0){
            StaleReceiverCount = 0;
            jQuery("#update_error").css('display','none');
        }
        // A successful fetch means we've recovered - let the next failure
        // (whatever status it is) log fresh rather than staying suppressed
        // from a prior, now-resolved outage.
        lastFetchFailStatus = null;
    } catch (e) {
        console.error(e);
    }
}

function db_load_type_cache() {
    return jQuery.getJSON(databaseFolder + "/icao_aircraft_types2.js").done(function(typeLookupData) {
        g.type_cache = typeLookupData;
        for (let i in g.planesOrdered) {
            g.planesOrdered[i].setTypeData();
        }
    });
}

g.afterLoadDone = false;
g.afterLoad = [];
function runAfterLoad(func) {
    if (g.afterLoadDone) {
        func()
    } else {
        g.afterLoad.push(func);
    }
}

function afterFirstFetch() {
    if (g.firstFetchDone) { return; }

    g.firstFetchDone = true;

    updateVisible();
    mapRefresh();

    setTimeout(() => {
        console.time('afterFirstFetch()');


        let func;
        while ((func = g.afterLoad.pop())) {
            func();
        }
        g.afterLoadDone = true;
        while ((func = g.afterLoad.pop())) {
            func();
        }


        geoMag = geoMagFactory(cof2Obj());

        db_load_type_cache().always(function() {
            refresh();
        });

        if (usp.has('screenshot')) {
            clearIntervalTimers('silent');
        }

        console.timeEnd('afterFirstFetch()');
    }, 30);
}

let debugFetch = false;
let C429 = 0;
let fetchCalls = 0;
let fetchDoneCount = 0;
function fetchData(options) {
    options = options || {};
    if (!timersActive) {
        //console.log(localTime(new Date()) + " fetchData inhibited by !timersActive");
        return;
    }
    if (heatmap || replay || showTrace || pTracks || !loadFinished || inhibitFetch) {
        return;
    }
    let currentTime = new Date().getTime();
    const refreshMs = refreshInt()
    g.lastRefreshInt = refreshMs;

    if (!options.force) {
        if (
            currentTime - lastFetch <= refreshMs
            || pendingFetches > 0
            || OLMap.getView().getInteracting()
            || OLMap.getView().getAnimating()
        ) {
            return;
        }
    }
    setTimeout(fetchData, refreshMs);
    if (debugFetch) {
        console.log('Time since last fetch: ' + (currentTime - lastFetch) + ' ms');
    }
    lastFetch = currentTime;

    FetchPending = [];
    if (FetchPendingUAT != null) {
        // don't double up on fetches, let the last one resolve
        return;
    }

    //console.timeEnd("Starting Fetch");
    //console.time("Starting Fetch");

    if (limitUpdates != -1 && fetchCalls > limitUpdates) {
        return;
    }
    fetchCalls++;

    if (fetchCalls == 1) { console.time("first fetch()"); };

    if (enable_uat) {
        FetchPendingUAT = jQuery.ajax({ url: 'chunks/978.json',
            dataType: 'json' });

        FetchPendingUAT.done(function(data) {
            uat_data = data;
            FetchPendingUAT = null;
        });
        FetchPendingUAT.fail(function(jqxhr, status, error) {
            FetchPendingUAT = null;
        });
    }

    let suffix = zstd ? '.binCraft.zst' : (binCraft ? '.binCraft' : '.json');
    if (enableDynamicCachebusting) {
        suffix += `?${currentTime}`;
    }

    let ac_url = [];
    if (uuid != null) {
        for (let i in uuid) {
            ac_url.push('uuid/?feed=' + uuid[i]);
        }
    } else if (reApi || filterUuid) {
        let url = 're-api/?' + (binCraft ? 'binCraft' : 'json');
        url += zstd ? '&zstd' : '';
        url += (onlyMilitary && !onlyEmergency) ? '&filter_mil' : '';
        lastRequestBox = requestBoxString();
        if (icaoFilter) {
            if (icaoFilter.length > 0) {
                url += '&find_hex='
                for (let k in icaoFilter) {
                    url += icaoFilter[k] + ','
                }
                url = url.slice(0, -1); // remove trailing comma
            }
        } else if (onlySelected && SelPlanes.length > 0) {
            url += '&find_hex='
            for (let k in SelPlanes) {
                url += SelPlanes[k].icao + ','
            }
            url = url.slice(0, -1); // remove trailing comma
        } else  {
            url += '&box=' + lastRequestBox;

            if (SelPlanes.length > 0) {
                url += '&find_hex='
                for (let k in SelPlanes) {
                    url += SelPlanes[k].icao + ','
                }
                url = url.slice(0, -1); // remove trailing comma
            }
        }

        if (filterUuid) {
            url += '&filter_uuid=' + filterUuid;
        }

        ac_url.push(url);
        //console.log(url);

    } else if (globeIndex) {
        let indexes = globeIndexes();
        const ancient = (currentTime - 2 * refreshMs / globeSimLoad * globeTilesViewCount) / 1000;
        for (let i in indexes) {
            const k = indexes[i];
            if (globeIndexNow[k] < ancient) {
                globeIndexNow[k] = null;
            }
        }
        indexes.sort(function(x,y) {
            if (!globeIndexNow[x] && !globeIndexNow[y]) {
                return globeIndexDist[x] - globeIndexDist[y];
            }
            if (globeIndexNow[x] == null)
                return -1;
            if (globeIndexNow[y] == null)
                return 1;
            return (globeIndexNow[x] - globeIndexNow[y]);
        });

        if (binCraft && onlyMilitary && !onlyEmergency && g.zoomLvl < 5.5) {
            ac_url.push('data/globeMil_42777' + suffix);
        } else {

            indexes = indexes.slice(0, globeSimLoad);

            let mid = (binCraft && onlyMilitary && !onlyEmergency) ? 'Mil_' : '_';
            for (let i in indexes) {
                ac_url.push('data/globe' + mid + indexes[i].toString().padStart(4, '0') + suffix);
            }
        }
    } else {
        ac_url.push('data/aircraft' + suffix);
    }

    pendingFetches += ac_url.length;
    fetchCounter += ac_url.length;

    for (let i in ac_url) {
        if (debugFetch) {
            console.log('Fetching: ' + ac_url[i]);
        }
        let req;
        if (binCraft || zstd) {
            req = jQuery.ajax({
                url: `${ac_url[i]}`, method: 'GET',
                xhr: arraybufferRequest,
                timeout: 15000,
                urlIndex: i,
            });
        } else {
            req = jQuery.ajax({ url: `${ac_url[i]}`, dataType: 'json', urlIndex: i });
        }
        FetchPending.push(req);

        req
            .done(fetchDone)
            .fail(fetchFail);
    }


    if (now - lastReap > 60) {
        reaper();
    }
}

// this function is called from index.html on body load
// kicks off the whole rabbit hole
function initialize() {
    if (usp.has('iconTest') || usp.has('iconTestLabels')) {
        jQuery('#iconTestCanvas').show();
        iconTest();
        return;
    }

    // things that can run without receiver json being known
    earlyInitPage();
    initMapEarly();

    jQuery.when(configureReceiver, heatmapDefer).done(function() {

        if (receiverJson) {
            if (receiverJson.trace_hist_only)
                trace_hist_only = true;
            if (receiverJson.json_trace_interval < 2)
                traces_high_res = true;
            if (receiverJson.lat != null && !SiteOverride) {
                //console.log("receiver.json lat: " + receiverJson.lat)
                SiteLat = receiverJson.lat;
                SiteLon = receiverJson.lon;
            }
            if (receiverJson.jaeroTimeout) {
                jaeroTimeout = receiverJson.jaeroTimeout * 60;
            }


            if (receiverJson.readsb) {
                positionFilter = false;
                altitudeFilter = false;
            }
        }

        if (SiteLat && SiteLon) {
            SitePosition = [SiteLon, SiteLat];
            DefaultCenterLat = SiteLat;
            DefaultCenterLon = SiteLon;
        }

        configureReceiver = null;

        // Initialize stuff
        initPage();
        initMap();

        processQueryToggles();

        jQuery.when(historyQueued).done(push_history);

        if (!nHistoryItems) {
            historyLoaded.resolve();
        }

        jQuery.when(historyLoaded, zstdDefer).done(startPage);
    });
}


function processQueryToggles() {
    if (!usp.has('toggles')) {
        return;
    }
    let todo;
    try {
        todo = usp.get('toggles').split(',');;
    } catch (e) {
        console.error(e);
        return;
    }
    while (todo.length >= 2) {
        let key = todo.shift();
        let value = todo.shift();
        let state = true;
        if (value == 'false' || value == '0') {
            state = false;
        }
        try {
            toggles[key].toggle(state, "init");
            console.log((state ? "Enabled" : "Disabled") + " setting: " + key);
        } catch (e) {
            console.error(e);
        }
    }
}

function replaySpeedChange(arg) {
    traceOpts.replaySpeed = arg;
    console.log(arg);
    if (traceOpts.animate)
        return;
    legShift(0);
};

function initPage() {

    if (globeIndex) {
        function setGlobeTableLimit() {
            let mult = 1 + 4 * toggles['moreTableLines1'].state + 16 * (toggles['moreTableLines2'] && toggles['moreTableLines2'].state);
            globeTableLimit = globeTableLimitBase * mult;
            if (toggles['allTableLines'] && toggles['allTableLines'].state)
                globeTableLimit = 1e9;
            if (onMobile)
                globeTableLimit /= 2;
        };
        new Toggle({
            key: "moreTableLines1",
            display: "More Table Lines",
            container: "#sidebar-table",
            init: false,
            setState: setGlobeTableLimit,
        });
        new Toggle({
            key: "moreTableLines2",
            display: "Even More Table Lines",
            container: "#sidebar-table",
            init: false,
            setState: setGlobeTableLimit,
        });
        new Toggle({
            key: "allTableLines",
            display: "All Table Lines",
            container: "#sidebar-table",
            init: false,
            setState: setGlobeTableLimit,
        });
    }


    if (!globeIndex && !haveTraces) {
        jQuery("#lastLeg_cb").parent().hide();
        jQuery('#show_trace').hide();
    }
    if (globeIndex) {
        toggleTableInView('enable');
        if (icaoFilter) {
            toggleTableInView('disable');
        }
    } else {
        jQuery('#V').show();
    }

    if (usp.has('SiteLat') && usp.has('SiteLon')) {
        let lat = parseFloat(usp.get('SiteLat'));
        let lon = parseFloat(usp.get('SiteLon'));
        if (!isNaN(lat) && !isNaN(lon)) {
            SiteLat = CenterLat = DefaultCenterLat = lat;
            SiteLon = CenterLon = DefaultCenterLon = lon;
            SiteOverride = true;
            loStore['SiteLat'] = lat;
            loStore['SiteLon'] = lon;
        }
    }
    if (loStore['SiteLat'] != null && loStore['SiteLon'] != null) {
        if (usp.has('SiteClear')) {
            loStore.removeItem('SiteLat');
            loStore.removeItem('SiteLon');
        }
    } else {
        CenterLat = DefaultCenterLat;
        CenterLon = DefaultCenterLon;
    }

}

function earlyInitPage() {
    // things that can run without receiver json being known
    if (audio_url) {
        if (!Array.isArray(audio_url)) {
            audio_url = [ audio_url ];
        }
        let html = "";
        for (const entry of audio_url) {
            let url = entry;
            let title = entry;
            if (Array.isArray(url)) {
                url = entry[0];
                title = entry[1];
            }
            if (url) {
                html += `
                    <tr><td style="text-align: center">${title}</td></tr>
                    <tr><td style="text-align: center">
                    <audio crossorigin="anonymous" preload="none" src="${url}" type="audio/mp3" controls="controls" autoplay="false"></audio>
                    </td></tr>
                `;
            }
        }
        if (html) {
            document.getElementById('mp3player').innerHTML = html;
            jQuery('#mp3player').show();
        }
    }

    let value;

    if (uk_advisory) {
        defaultOverlays.push('uka_airports');
        defaultOverlays.push('uka_airspaces');
        defaultOverlays.push('uka_runways');
        defaultOverlays.push('uka_shoreham');
        atcStyle = true;
    }

    if (atcStyle) {
        labels_top = true;
        tempTrails = true;
        tempTrailsTimeout = 45;
        SiteCirclesDistances = new Array(5, 10, 20);
        SiteCirclesLineDash = [5, 5];
        SiteCirclesColors = ['#2b3436', '#2b3436', '#2b3436'];
        MapType_tar1090 = 'carto_light_all';
        lineWidth=4;
        g.enableLabels=true;
    }

    if (usp.has('debugFetch')) {
        debugFetch = true;
    }

    if (usp.has('rangeRings')) {
        SiteCircles = Boolean(parseInt(usp.get('rangeRings')));
    }

    if (usp.has('limitUpdates')) {
        let tmp = parseInt(usp.get('limitUpdates'));
        if (!isNaN(tmp))
            limitUpdates = tmp;
    }

    if (usp.has('screenshot')) {
        limitUpdates = 0;
    }

    if (usp.has('nowebgl')) {
        loStore['webgl'] = "false";
    }

    if (usp.has('showGrid')) {
        showGrid = true;
        loStore['layer_site_pos'] = 'true';
    }

    if (usp.has('halloween'))
        halloween = true;

    if (usp.has('outlineWidth')) {
        let tmp = parseInt(usp.get('outlineWidth'));
        if (!isNaN(tmp))
            outlineWidth = tmp;
    }

    if (usp.has('kiosk')) {
        tempTrails = true;
        hideButtons = true;
        userScale = 2;
    }

    if (pTracks) {
        noVanish = true;
        buttonActive('#P', noVanish);
        filterTracks = true;
        selectAllPlanes();
    }

    if (usp.has('mobile'))
        onMobile = true;
    if (usp.has('desktop'))
        onMobile = false;

    if (usp.has('hideSidebar'))
        loStore['sidebar_visible'] = "false";
    if (usp.has('sidebarWidth')) {
        loStore['sidebar_width'] = usp.get('sidebarWidth');
        loStore['sidebar_visible'] = "true";
    }

    if (usp.has('allTracks')) {
        SelectedAllPlanes = true;
        buttonActive('#T', SelectedAllPlanes);
    }
    if (usp.has('tempTrails')) {
        tempTrails = true;
        let tmp = parseInt(usp.get('tempTrails'));
        if (tmp > 0)
            tempTrailsTimeout = tmp;
    }
    if (usp.has('squareMania')) {
        squareMania = true;
    }

    if (usp.has('darkerColors')) {
        darkerColors = true;
    }

    if (usp.has('mapDim')) {
        let dim = parseFloat(usp.get('mapDim'));
        if (!isNaN(dim))
            mapDimPercentage = dim;
    } else if (heatmap) {
        mapDimPercentage = 0.6;
        MapDim = true;
    }

    if (usp.has('noRegOnly'))
        noRegOnly = true;

    if (usp.has('nogpsOnly') || usp.has('badgps'))
        nogpsOnly = true;

    if (usp.has('mapContrast')) {
        let contrast = parseFloat(usp.get('mapContrast'));
        if (!isNaN(contrast))
            mapContrastPercentage = contrast;
    }

    if (value = usp.getFloat('labelScale')) {
        labelScale = value;
    }

    if (value = usp.getFloat('largeMode')) {
        userScale = Math.pow(1.2, value) / 1.2;
        iconScale = 1;
    }

    if (value = usp.getFloat('iconScale')) {
        iconScale = value;
    } else if (loStore['iconScale'] != null) {
        iconScale = loStore['iconScale'];
    }

    if (value = usp.getFloat('scale')) {
        userScale = value;
    } else if (loStore['userScale'] != null) {
        userScale = loStore['userScale'];
    }

    const slideBase = 0.6;
    jQuery('#iconScaleSlider').slider({
        value: Math.pow(iconScale, 1 / slideBase),
        step: 0.02,
        min: 0.1,
        max: 3,
        change: function(event, ui) {
            iconScale = Math.pow(ui.value, slideBase);
            checkScale();
            mapRefresh();
            loStore['iconScale'] = iconScale;
        },
    });

    jQuery('#userScaleSlider').slider({
        value: Math.pow(userScale, 1 / slideBase),
        step: 0.02,
        min: 0.5,
        max: 3,
        change: function(event, ui) {
            userScale = Math.pow(ui.value, slideBase);
            checkScale();
            mapRefresh();
            loStore['userScale'] = userScale;

            setGlobalScale(userScale);
        },
    });
	
	// AIS Track slider bar in settings popup
	aisTrackMaxHours = (loStore['aisTrackMaxHours'] != null) ? loStore['aisTrackMaxHours'] : 1; 

	    function formatTrackHours(h) {
	        if (h <= 0) return 'Off';
	        if (h < 1) return Math.round(h * 60) + 'm';
	        return h + 'h';
	    }

	    jQuery('#aisTrackHoursLabel').text(formatTrackHours(aisTrackMaxHours));

	    jQuery('#aisTrackHoursSlider').slider({
	        value: aisTrackMaxHours,
	        step: 0.5,
	        min: 0,
	        max: 12,
	        slide: function(event, ui) {
	            jQuery('#aisTrackHoursLabel').text(formatTrackHours(ui.value));
	        },
	        change: function(event, ui) {
	            aisTrackMaxHours = ui.value;
	            loStore['aisTrackMaxHours'] = aisTrackMaxHours;
	            jQuery('#aisTrackHoursLabel').text(formatTrackHours(aisTrackMaxHours));

	            // Re-apply immediately if a vessel is currently selected.
	            if (SelectedPlane && String(SelectedPlane.icao).startsWith('MMSI')) {
	                updateSelectedTrack(SelectedPlane, true);
	            }
	        },
	    });
	// end AIS Track slider

	// Satellite layer toggle: restore the last state (defaults to on)
	window.ShowSatellites = (loStore['ShowSatellites'] != null) ? (loStore['ShowSatellites'] == 'true') : true;
	buttonActive('#Sa', window.ShowSatellites);

    setGlobalScale(userScale, "init");

    if (usp.has('hideButtons'))
        hideButtons = true;

    if (usp.has('baseMap')) {
        overrideMapType = usp.get('baseMap');
    }

    if (usp.has('offlineMap')) {
        overrideMapType = 'osm_tiles_offline';
    }

    if (usp.has('overlays'))
        enableOverlays = usp.get('overlays').split(',');

    if (value = usp.get('icaoFilter')) {
        icaoFilter = value.toLowerCase().split(',');
    }

    if (value = usp.get('icaoBlacklist')) {
        icaoBlacklist = value.toLowerCase().split(',');
    }

    if (value = usp.getFloat('filterMaxRange')) {
        filterMaxRange = value;
    }
    filterMaxRange *= 1852; // convert from nmi to meters


    if (value = usp.getFloat('mapOrientation')) {
        g.mapOrientation = value;
    }
    g.mapOrientation *= (Math.PI/180); // adjust to radians

    if (usp.has('r') || usp.has('replay')) {
        let numbers = (usp.get('r') || usp.get('replay') || "").split(/(?:-|:)/);
        let ts = new Date();
        if (numbers.length == 5) {
            ts.setUTCFullYear(numbers[0]);
            ts.setUTCMonth(numbers[1] - 1);
            ts.setUTCDate(numbers[2]);
            ts.setUTCHours(numbers[3]);
            ts.setUTCMinutes(numbers[4]);
        }
        if (isNaN(ts)) {
            ts = new Date();
        }
        console.log(ts);
        replay = replayDefaults(ts);
    }

    //Pulling filters from params
    if (usp.has('filterAltMin')) {
        const minAlt = usp.getInt('filterAltMin');
        if (minAlt !== null)  {
            PlaneFilter.minAltitude = minAlt;
            PlaneFilter.enabled = true;
            PlaneFilter.maxAltitude = 1000000;
        }
    }
    if (usp.has('filterAltMax')) {
        const maxAlt = usp.getInt('filterAltMax');
        if (maxAlt !== null)  {
            PlaneFilter.maxAltitude = maxAlt;
            PlaneFilter.enabled = true;
            if (PlaneFilter.minAltitude === undefined) {
                PlaneFilter.minAltitude = -1000000;
            }
        }
    }

    if (usp.has('filterSources')) {
        PlaneFilter.sources = usp.get('filterSources').split(',');
        shareFiltersParam = true;
    }
    if (usp.has('filterDbFlag')) {
        PlaneFilter.flagFilter = usp.get('filterDbFlag').split(',');
        shareFiltersParam = true;
    }


    if (false && iOSVersion() <= 12 && !('PointerEvent' in window)) {
        jQuery("#generic_error_detail").text("Enable Settings - Safari - Advanced - Experimental features - Pointer Events");
        jQuery("#generic_error").css('display','block');
        setTimeout(function() {
            jQuery("#generic_error").css('display','none');
        }, 30000);
    }

    if (loStore['enableLabels'] == 'true' || usp.has('enableLabels')) {
        toggleLabels();
    }
    if (usp.has('extendedLabels')) {
        g.extendedLabels = parseInt(usp.getFloat('extendedLabels'));
        toggleExtendedLabels({ noIncrement: true });
    } else if (loStore['extendedLabels']) {
        g.extendedLabels = parseInt(loStore['extendedLabels']);
        toggleExtendedLabels({ noIncrement: true });
    }
    if (loStore['trackLabels'] == "true" || usp.has('trackLabels')) {
        toggleTrackLabels();
    }
    if (loStore['tableInView'] == "true" || usp.has('tableInView')
        || (!globeIndex && loStore['tableInView'] != "false")) {   // default: on-screen only, unless the user turned it off
        toggleTableInView('enable');
    }
    if (loStore['debug'] == "true")
        debug = true;
    if (loStore['debugPosFilter'] == "true")
        debugPosFilter = true;

    if (loStore['noVanish'] == "true" || usp.has('noVanish')) {
        noVanish = true;
        //filterTracks = noVanish;
        //loStore['noVanish'] = "false";
        buttonActive('#P', noVanish);
    }

    jQuery('#tabs').tabs({
        active: loStore['active_tab'],
        activate: function (event, ui) {
            loStore['active_tab'] = jQuery("#tabs").tabs("option", "active");
        },
        collapsible: true
    });

    // Set page basics
    document.title = PageName;

    initializeUnitsSelector();
    TAR.planeMan.init();

    if (loStore['sidebar_width'] != null)
        jQuery('#sidebar_container').width(loStore['sidebar_width']);
    else
        jQuery('#sidebar_container').width('25%');

    if (jQuery('#sidebar_container').width() > jQuery(window).innerWidth() *0.8)
        jQuery('#sidebar_container').width('30%');

    loStore['sidebar_width'] = jQuery('#sidebar_container').width();

    jQuery('#sidebar_container').on('resize', function() {
        loStore['sidebar_width'] = jQuery('#sidebar_container').width();
    });

    // Set up event handlers for buttons
    jQuery("#expand_sidebar_button").click(expandSidebar);
    jQuery("#shrink_sidebar_button").click(showMap);

    jQuery("#altimeter_form").submit(onAltimeterChange);
    jQuery("#altimeter_set_standard").click(onAltimeterSetStandard);
    jQuery("#altimeter_set_selected").click(onAltimeterSetSelected);

    // Set up altitude filter button event handlers and validation options
    jQuery("#altitude_filter_form").submit(onFilterByAltitude);
    jQuery("#source_filter_form").submit(updateSourceFilter);
    jQuery("#flag_filter_form").submit(updateFlagFilter);

    jQuery("#altitude_filter_reset_button").click(onResetAltitudeFilter);
    jQuery("#source_filter_reset_button").click(onResetSourceFilter);
    jQuery("#flag_filter_reset_button").click(onResetFlagFilter);

    // Initialize other controls
    jQuery("#search_form").submit(onSearch);
    jQuery("#search_clear_button").click(onSearchClear);
    jQuery("#jump_clear_button").click(function() {
        jQuery("#jump_input").val("");
        jQuery("#jump_input").blur();
    });
    jQuery("#jump_form").submit(onJump);

    jQuery("#show_trace").click(toggleShowTrace);
    jQuery("#trace_back_1d").click(function() {shiftTrace(-1)});
    jQuery("#trace_jump_1d").click(function() {shiftTrace(1)});

    jQuery("#histDatePicker").datepicker({
        maxDate: '+1d',
        dateFormat: "yy-mm-dd",
        onSelect: function(date){
            setTraceDate({string: date});
            shiftTrace();
            jQuery("#histDatePicker").blur();
        },
        autoSize: true,
        onClose: !onMobile ? null : function(dateText, inst){
            jQuery("#histDatePicker").attr("disabled", false);
        },
        beforeShow: !onMobile ? null : function(input, inst){
            jQuery("#histDatePicker").attr("disabled", true);
        },
    });

    jQuery("#replayPlay").click(function(){

        if (replay.playing){
            //if playing, pause.
            playReplay(false);

        } else {
            //if paused, play.
            playReplay(true);
        }
    });

    jQuery("#leg_prev").click(function() {legShift(-1)});
    jQuery("#leg_next").click(function() {legShift(1)});

    jQuery('#settingsCog').on('click', function() {
        jQuery('#settings_infoblock').toggle();
    });

    if (onMobile) {
        jQuery('#fullscreenButton').on('click', function() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        });
    } else {
        jQuery('#fullscreenButton').hide();
    }

    jQuery('#settings_close').on('click', function() {
        jQuery('#settings_infoblock').hide();
    });

    jQuery('#AB').on('click', function() {
        showAbout();
    });

    jQuery('#about_close').on('click', function() {
        document.getElementById('about_infoblock').style.display = 'none';
    });

    jQuery('#groundvehicle_filter').on('click', function() {
        filterGroundVehicles(true);
        refresh();
    });

    jQuery('#blockedmlat_filter').on('click', function() {
        filterBlockedMLAT(true);
        refresh();
    });

    new Toggle({
        key: "followOnSelect",
        display: "Follow on select",
        container: "#settingsLeft",
        init: true,
        setState: function(state) {
            followOnSelect = state;
        }
    });
    new Toggle({
        key: "lastLeg",
        display: "Last Leg only",
        container: "#settingsLeft",
        init: true,
        setState: function(state) {
            lastLeg = state;
            if (loadFinished && !showTrace) {
                for (let i in SelPlanes) {
                    SelPlanes[i].processTrace();
                }
            }
        }
    });
    new Toggle({
        key: "labelsGeom",
        display: "Labels: geom. alt. (WGS84)",
        container: "#settingsLeft",
        init: labelsGeom,
        setState: function(state) {
            labelsGeom = state;
            if (loadFinished) {
                remakeTrails();
                refreshSelected();
            }
        }
    });
    new Toggle({
        key: "geomUseEGM",
        display: "Geom. alt.: WGS84 -> EGM conversion (long load)",
        container: "#settingsLeft",
        init: geomUseEGM,
        setState: function(state) {
            geomUseEGM = state;
            if (geomUseEGM) {
jQuery('#selected_altitude_geom1')
                jQuery('#selected_altitude_geom1_title').updateText('EGM96 altitude');
                jQuery('#selected_altitude_geom2_title').updateText('Geom. EGM96');
                let egm = loadEGM();
                if (egm) {
                    egm.addEventListener('load', function() {
                        remakeTrails();
                        refreshSelected();
                    });
                    return;
                }
            } else {
                jQuery('#selected_altitude_geom1_title').updateText('WGS84 altitude');
                jQuery('#selected_altitude_geom2_title').updateText('Geom. WGS84');
            }
            if (loadFinished) {
                remakeTrails();
                refreshSelected();
            }
        }
    });

    new Toggle({
        key: "baroUseQNH",
        display: "Baro. alt.: correct for QNH",
        container: "#settingsLeft",
        init: baroUseQNH,
        setState: function(state) {
            baroUseQNH = state;
            if (baroUseQNH) {
                jQuery('#selected_altitude1_title').updateText('Corr. baro-alt');
                jQuery('#selected_altitude2_title').updateText('Corr. baro.');
                jQuery('#infoblock_altimeter').removeClass('hidden');
            } else {
                jQuery('#selected_altitude1_title').updateText('Baro. altitude');
                jQuery('#selected_altitude2_title').updateText('Barometric');
                jQuery('#infoblock_altimeter').addClass('hidden');
            }
            if (loadFinished) {
                remakeTrails();
                refreshSelected();
            }
        }
    });

    if (usp.has('labelsGeom')) {
        toggles['labelsGeom'].toggle(true, 'init');
    }

    if (usp.has('geomEGM')) {
        toggles['geomUseEGM'].toggle(true, 'init');
    }

    new Toggle({
        key: "utcTimesLive",
        display: "Live track labels: UTC",
        container: "#settingsLeft",
        init: utcTimesLive,
        setState: function(state) {
            utcTimesLive = state;
            remakeTrails();
            refreshSelected();
        }
    });

    new Toggle({
        key: "utcTimesHistoric",
        display: "Historic track labels: UTC",
        container: "#settingsLeft",
        init: utcTimesHistoric,
        setState: function(state) {
            utcTimesHistoric = state;
            remakeTrails();
            refreshSelected();
        }
    });

    new Toggle({
        key: "windLabelsSlim",
        display: "Smaller wind labels",
        container: "#settingsLeft",
        init: windLabelsSlim,
        setState: function(state) {
            windLabelsSlim = state;
            if (!loadFinished)
                return;
            for (let key in g.planesOrdered) {
                g.planesOrdered[key].updateMarker();
            }
        }
    });

    new Toggle({
        key: "showLabelUnits",
        display: "Label units",
        container: "#settingsLeft",
        init: showLabelUnits,
        setState: function(state) {
            showLabelUnits = state;
            if (!loadFinished)
                return;
            for (let key in g.planesOrdered) {
                g.planesOrdered[key].updateMarker();
            }
            remakeTrails();
            refreshSelected();
        }
    });


    jQuery('#tStop').on('click', function() { traceOpts.replaySpeed = 0; gotoTime(traceOpts.showTime); });
    jQuery('#t1x').on('click', function() { replaySpeedChange(1); });
    jQuery('#t5x').on('click', function() { replaySpeedChange(5); });
    jQuery('#t10x').on('click', function() { replaySpeedChange(10); });
    jQuery('#t20x').on('click', function() { replaySpeedChange(20); });
    jQuery('#t40x').on('click', function() { replaySpeedChange(40); });

    new Toggle({
        key: "shareFilters",
        display: "Include Filters In URLs",
        container: "#settingsRight",
        init: false,
        setState: function(state) {
            updateAddressBar();
        }
    });

    new Toggle({
        key: "debugTracks",
        display: "Debug Tracks",
        container: "#settingsRight",
        init: false,
        setState: function(state) {
            debugTracks = state;
            remakeTrails();
        }
    });

    new Toggle({
        key: "debugAll",
        display: "Debug show all",
        container: "#settingsRight",
        init: false,
        setState: function(state) {
            if (state)
                debugAll = true;
            else
                debugAll = false;
        }
    });

    /*
    new Toggle({
        key: "SiteCircles",
        display: "Distance Circles",
        container: "#settingsRight",
        init: SiteCircles,
        setState: function(state) {
            SiteCircles = state;
            if (loadFinished)
                initSitePos();
        }
    });
    */

    new Toggle({
        key: "updateLocation",
        display: "Update GPS location",
        container: "#settingsRight",
        init: updateLocation,
        setState: function(state) {
            updateLocation = state;
            runAfterLoad(watchPosition);
        }
    });

    new Toggle({
        key: "autoselect",
        display: "Auto-select plane",
        container: "#settingsRight",
        init: autoselect,
        setState: function(state) {
            autoselect = state;
            setAutoselect();
        }
    });
    if (usp.has('autoselect')) {
        autoselect = true;
        setAutoselect();
    }

    new Toggle({
        key: "ColoredPlanes",
        display: "Colored Planes",
        container: "#settingsRight",
        init: true,
        setState: function(state) {
            if (state)
                monochromeMarkers = null;
            else
                monochromeMarkers = "#EEEEEE";

            refreshFeatures();
        }
    });

    new Toggle({
        key: "ColoredTrails",
        display: "Colored Trails",
        container: "#settingsRight",
        init: true,
        setState: function(state) {
            if (state)
                monochromeTracks = null;
            else
                monochromeTracks = "#000000";

            remakeTrails();
        }
    });

    new Toggle({
        key: "sidebar_visible",
        display: "Sidebar visible",
        container: null,
        checkbox: null,
        button: '#toggle_sidebar_button',
        init: (onMobile ? false : true),
        setState: function (state) {
            if (state) {
                jQuery("#sidebar_container").show();
                jQuery("#expand_sidebar_button").show();
                jQuery("#toggle_sidebar_button").removeClass("show_sidebar");
                jQuery("#toggle_sidebar_button").addClass("hide_sidebar");
                if (!g.sidebar_initiated) {
                    g.sidebar_initiated = true;
                    // Set up map/sidebar splitter
                    jQuery("#sidebar_container").resizable({
                        handles: {
                            w: '#splitter'
                        },
                        minWidth: 150,
                        maxWidth: (jQuery(window).innerWidth() *0.8),
                    });

                    jQuery("#splitter").dblclick(function() {
                        jQuery('#legend').hide();
                        jQuery('#sidebar_container').width('auto');
                        updateMapSize();
                        loStore['sidebar_width'] = jQuery('#sidebar_container').width();
                        jQuery('#sidebar_container').width(loStore['sidebar_width']);
                        jQuery('#legend').show();
                    });

                }
                if (!hideButtons) {
                    jQuery('#splitter').show();
                }
            } else {
                if (loadFinished) {
                    jQuery("#sidebar_container").hide();
                    jQuery("#expand_sidebar_button").hide();
                    jQuery("#toggle_sidebar_button").removeClass("hide_sidebar");
                    jQuery("#toggle_sidebar_button").addClass("show_sidebar");
                }
            }
            if (loadFinished) {
                updateMapSize();
            }
        },
    });

    if (!showPictures) {
        planespottingAPI = false;
        planespottersAPI = false;
    }
    new Toggle({
        key: "planespottingAPI",
        display: "Pictures planespotting.be",
        container: "#settingsRight",
        init: planespottingAPI,
        setState: function(state) {
            planespottingAPI = state;
            if (state) {
                toggles['planespottersAPI'] && toggles['planespottersAPI'].toggle(false);
            }
            setPictureVisibility();
            refreshSelected();
        }
    });
    new Toggle({
        key: "planespottersAPI",
        display: "Pictures planespotters.net",
        container: "#settingsRight",
        init: planespottersAPI,
        setState: function(state) {
            planespottersAPI = state;
            if (state) {
                toggles['planespottingAPI'] && toggles['planespottingAPI'].toggle(false);
            }
            setPictureVisibility();
            refreshSelected();
        }
    });

    if (routeApiUrl) {
        	if (location.protocol == 'http:' && routeApiUrl == "https://adsb.im/api/0/routeset") {
            // adsb.im API provider kindly asks that tar1090 uses http for the route API if possible
            	routeApiUrl = "http://adsb.im/api/0/routeset";
			}
    		new Toggle({
            key: "useRouteAPI",
            display: "Lookup route",
            container: "#settingsRight",
            init: useRouteAPI,
            setState: function(state) {
                useRouteAPI = state;
                if (useRouteAPI) {
                    jQuery('#routeRow').show();
                    jQuery('#routeRowHighlighted').show();
                } else {
                    jQuery('#routeRow').hide();
                    jQuery('#routeRowHighlighted').hide();
                }
            }
        });
        if (useIataAirportCodes == false) {
            routeDisplay = 'icao'; // cope with deprecated useIata var
        }
        if (usp.has('routeDisplay')) {
            routeDisplay = usp.get('routeDisplay');
        }
        routeDisplay = routeDisplay.split(',');
    } else {
        useRouteAPI = false;
    }


    new Toggle({
        key: "enableInfoblock",
        display: "Enable Infoblock",
        container: "#settingsRight",
        init: true,
        setState: function(state) {
            adjustInfoBlock();
        }
    });

    new Toggle({
        key: "wideInfoblock",
        display: "Wide Infoblock",
        container: "#settingsRight",
        init: wideInfoBlock,
        setState: function(state) {
            wideInfoBlock = state;
            adjustInfoBlock();
        }
    });

    if (onMobile) {
        enableMouseover = false;
        (typeof hideById != 'undefined') && (hideById) && (hideById('tracking_leaderboard_container'));
    }

    new Toggle({
        key: "enableMouseover",
        display: "Enable mouse-over block",
        container: "#settingsRight",
        init: enableMouseover,
        setState: function(state) {
            enableMouseover = state;
            if (loadFinished) {
                checkPointermove();
            }
        }
    });



    jQuery('#selectall_checkbox').on('click', function() {
        if (jQuery('#selectall_checkbox').hasClass('settingsCheckboxChecked')) {
            deselectAllPlanes();
        } else {
            selectAllPlanes();
        }
    })

    // Force map to redraw if sidebar container is resized - use a timer to debounce
    jQuery("#sidebar_container").on("resize", function() {
        clearTimeout(mapResizeTimeout);
        mapResizeTimeout = setTimeout(updateMapSize, 20);
    });

    filterGroundVehicles(false);
    filterBlockedMLAT(false);

    TAR.altitudeChart.init();

    if (aggregator) {
        jQuery('#aggregator_header').show();
        jQuery('#credits').show();
        if (!onMobile) {
            jQuery('#creditsSelected').show();
        }
        jQuery('#selected_infoblock').addClass('aggregator-selected-bg');

        // activate to prevent iframe use
        if (inhibitIframe && window.self != window.top) {
            window.top.location.href = "https://www.aggregator.com/";
            return;
        }
    }
    if (imageConfigLink != "") {
        let host = window.location.hostname;
        let configLink = imageConfigLink.replace('HOSTNAME', host);
        jQuery('#imageConfigLink').attr('href',configLink)
        jQuery('#imageConfigLink').text(imageConfigText)
        jQuery('#imageConfigHeader').show();
    }
    if (aiscatcher_server) {
        aiscatcher_server = aiscatcher_server.replace('HOSTNAME', window.location.hostname);
    }

    if (hideButtons) {
        showHideButtons();
        runAfterLoad(showHideButtons);
    }
}

function initLegend(colors) {
    // chips with a dot in the same colour as the rows' source stripe
    const dots = (typeof tableColorsLight !== 'undefined' && tableColorsLight && tableColorsLight.selected) || colors;
    const chip = (key, label) => '<div class="legendTitle"><span class="legendDot" style="background-color:'
        + (dots[key] || colors[key]) + ';"></span>' + label + '</div>';
    let html = '';
    html += chip('adsb', 'ADS-B');
    html += chip('uat', 'UAT / ADS-R');
    html += chip('mlat', 'MLAT');
    html += chip('tisb', 'TIS-B');
    if (!globeIndex)
        html += chip('modeS', 'Mode-S');
    if (globeIndex)
        html += chip('other', 'Other');
    if (aiscatcher_server)
        html += chip('ais', 'AIS');
    html += chip('sat', 'Satellite');
    html += chip('adsc', jaeroLabel);

    document.getElementById('legend').innerHTML = html;
}

function initSourceFilter(colors) {
    const createFilter = function (color, text, key) {
        return '<li class="ui-widget-content" style="background-color:' + color + ';" id="source-filter-' + key + '">' + text + '</li>';
    };

    let html = '';
    // Tracks exactly which `sources` entry each rendered <li> corresponds to,
    // in order. Needed because AIS's entry (and now Satellite's) render
    // conditionally - a plain DOM-index lookup into the `sources` array breaks
    // the moment any earlier entry in that array is skipped, which a second
    // conditional entry made an active risk rather than a theoretical one.
    const renderedKeys = [];

    html += createFilter(colors['adsb'], 'ADS-B', sources[0]);
    renderedKeys.push(sources[0]);
    html += createFilter(colors['uat'], 'UAT / ADS-R', sources[1][0]);
    renderedKeys.push(sources[1]);
    html += createFilter(colors['mlat'], 'MLAT', sources[2]);
    renderedKeys.push(sources[2]);
    html += createFilter(colors['tisb'], 'TIS-B', sources[3]);
    renderedKeys.push(sources[3]);
    html += createFilter(colors['modeS'], 'Mode-S', sources[4]);
    renderedKeys.push(sources[4]);
    html += createFilter(colors['other'], 'Other', sources[5]);
    renderedKeys.push(sources[5]);
    html += createFilter(colors['adsc'], jaeroLabel, sources[6]);
    renderedKeys.push(sources[6]);

    if (aiscatcher_server) {
        html += createFilter(colors['ais'], 'AIS', sources[7]);
        renderedKeys.push(sources[7]);
    }

    html += createFilter(colors['sat'], 'Satellite', sources[8]);
    renderedKeys.push(sources[8]);

    document.getElementById('sourceFilter').innerHTML = html;

    jQuery("#sourceFilter").selectable({
        stop: function () {
            sourcesFilter = [];
            jQuery(".ui-selected", this).each(function () {
                const index = jQuery("#sourceFilter li").index(this);
                const key = renderedKeys[index];
                if (Array.isArray(key))
                    key.forEach(member => { sourcesFilter.push(member); });
                else
                    sourcesFilter.push(key);
            });
        }
    });

    jQuery("#sourceFilter").on("selectablestart", function (event, ui) {
        event.originalEvent.ctrlKey = true;
    });
}

function initFlagFilter(colors) {
    const createFilter = function (color, text, key) {
        return '<li class="ui-widget-content" style="background-color:' + color + ';" id="flag-filter-' + key + '">' + text + '</li>';
    };

    let html = '';
    html += createFilter(colors['tisb'], 'Military', flagFilterValues[0]);
    //html += createFilter(colors['mlat'], 'Interesting');
    html += createFilter(colors['uat'], 'PIA', flagFilterValues[1]);
    html += createFilter(colors['adsb'], 'LADD', flagFilterValues[2]);

    document.getElementById('flagFilter').innerHTML = html;

    jQuery("#flagFilter").selectable({
        stop: function () {
            flagFilter = [];
            jQuery(".ui-selected", this).each(function () {
                const index = jQuery("#flagFilter li").index(this);
                if (Array.isArray(flagFilterValues[index]))
                    flagFilterValues[index].forEach(member => { flagFilter.push(member); });
                else
                    flagFilter.push(flagFilterValues[index]);
            });
        }
    });

    jQuery("#flagFilter").on("selectablestart", function (event, ui) {
        event.originalEvent.ctrlKey = true;
    });
}

function push_history() {
    HistoryItemsReturned = 0;
    PositionHistoryBuffer = [];

    for (let i = 0; i < nHistoryItems; i++) {
        push_history_item(i);
    }
}

function push_history_item(i) {
    deferHistory[i]
        .done(function(json) {
            HistoryItemsReturned++;

            if (HistoryChunks) {
                if (json && json.files) {
                    //g.refreshHistory && console.log("itemsreturned chunk: " + HistoryItemsReturned + " chunklen: " + json.files.length);
                    for (let i in json.files) {
                        PositionHistoryBuffer.push(json.files[i]);
                        if (i == 0 || i == json.files.length - 1) {
                            //g.refreshHistory && console.log("history buffer push: " + localTime(new Date(json.files[i].now * 1000)));
                        }
                    }
                } else if (json && json.now) {
                    //g.refreshHistory && console.log("itemsreturned simple json: " + HistoryItemsReturned);
                    PositionHistoryBuffer.push(json);
                    //g.refreshHistory && console.log("history buffer push: " + localTime(new Date(json.now * 1000)));
                }
            } else {
                PositionHistoryBuffer.push(json);
            }

            if (HistoryItemsReturned == nHistoryItems) {
                parseHistory();
            }
            if (HistoryItemsReturned > nHistoryItems) {
                console.log(localTime(new Date()) + " WARNING: (HistoryItemsReturned > nHistoryItems)");
            }
        })

        .fail(function(jqxhr, status, error) {

            //Doesn't matter if it failed, we'll just be missing a data point
            //console.log(error);
            HistoryItemsReturned++;
            if (HistoryItemsReturned == nHistoryItems) {
                parseHistory();
            }
        });
}

function parseHistory() {
    console.timeEnd("Downloaded History");
    console.time("Loaded aircraft tracks from History");

    for (let i in deferHistory)
        deferHistory[i] = null;
    deferHistory = null;


    if (PositionHistoryBuffer.length > 0) {

        // Sort history by timestamp
        console.log(localTime(new Date()) + " Sorting history: " + PositionHistoryBuffer.length);
        PositionHistoryBuffer.sort(function(x,y) { return (y.now - x.now); });

        let currentTime = new Date().getTime()/1000;

        if (!pTracks && !noVanish) {
            // get all planes within the reapTimeout
            g.historyKeep = {};
            for (let i = 0; i < PositionHistoryBuffer.length; i++)  {
                let data = PositionHistoryBuffer[i];
                if (currentTime - data.now > reapTimeout) {
                    break;
                }
                for (let j=0; j < data.aircraft.length; j++) {
                    const ac = data.aircraft[j];
                    const isArray = Array.isArray(ac);
                    const hex = isArray ? ac[0] : ac.hex;
                    const seen = isArray ? ac[6] : ac.seen;
                    if (currentTime - (data.now - seen) < reapTimeout) {
                        g.historyKeep[hex] = 1;
                    }
                }
                //console.log("hist: " + localTime(new Date(data.now * 1000)));
            }
            for (let i in g.planesOrdered) {
                let hex = g.planesOrdered[i].icao;
                g.historyKeep[hex] = 1;
            }
        }

        // Process history
        let data;
        let h = 0;
        let pruneInt = 100;
        let lastTimestamp = 0;
        let counter = 0;

        while (data = PositionHistoryBuffer.pop()) {
            counter++;

            if (data.now < lastTimestamp) {
                console.log('parseHistory sorting issue');
            }

            if (lastTimestamp && data.now - lastTimestamp > 15) {
                console.log("History " + String(counter).padStart(4) + " from: "
                    + localTime(new Date(data.now * 1000)) + " GAP: " + localTime(new Date(lastTimestamp * 1000)));
            }

            lastTimestamp = data.now;

            if (pTracks && currentTime - data.now > pTracks * 3600) {
                continue;
            }

            if (g.refreshHistory && now > data.now) {
                continue;
            }

            // process new data
            if (PositionHistoryBuffer.length < 10) {
                processReceiverUpdate(data, false);
            } else {
                processReceiverUpdate(data, true);
            }

            ++h;
            if (h == 1 || h % pruneInt == 0 || PositionHistoryBuffer.length == 0) {
                console.log("Apply History " + String(counter).padStart(4) + " from: "
                    + localTime(new Date(data.now * 1000)));
            }
        }

        // only restrict aircraft process to this list while parsing history
        g.historyKeep = null;

        reaper();

        // Final pass to update all planes to their latest state
        //console.log("Final history cleanup pass");
        for (let i in g.planesOrdered) {
            let plane = g.planesOrdered[i];

            if (plane.position && SitePosition && !pTracks)
                plane.sitedist = ol.sphere.getDistance(SitePosition, plane.position);

            if (uatNoTISB && plane.uat && plane.type && plane.type.substring(0,4) == "tisb") {
                plane.last_message_time -= 999;
            }
        }
    }

    console.timeEnd("Loaded aircraft tracks from History");

    if (g.refreshHistory) {
        g.refreshHistory = false;
        noLongerHidden();
        return;
    }

    historyLoaded.resolve();
}

let replay_was_active = false;


let timers = {};
let timersActive = false;
function clearIntervalTimers(arg) {
    if (!timersActive) {
        console.trace();
        return;
    }

    if (loadFinished && arg != 'silent') {
        console.log(localTime(new Date()) + ' clear timers');
        jQuery("#timers_paused_detail").text('Timers paused (tab hidden).');
        jQuery("#timers_paused").css('display','block');
    }
    const entries = Object.entries(timers);
    for (let i in entries) {
        clearInterval(entries[i][1]);
    }

    timersActive = false;

    // in case the visibility changed while this was running
    handleVisibilityChange();
}

function setIntervalTimers() {
    if (timersActive) {
        return;
    }

    if (loadFinished) {
        jQuery("#timers_paused").css('display','none');
    }
    console.log(localTime(new Date()) + " set timers ");
    if (dynGlobeRate && !uuid) {
        timers.globeRateUpdate = setInterval(globeRateUpdate, 180000);
    }
    pollPositionInterval();
    setAutoselect();

    timers.checkMove = setInterval(checkMovement, 50);
    timers.everySecond = setInterval(everySecond, 850);

    //timers.reaper = setInterval(reaper, 40000);

    if (tempTrails) {
        timers.trailReaper = window.setInterval(trailReaper, 10000);
        trailReaper(now);
    }
    if (enable_pf_data && !pTracks && !globeIndex) {
        jQuery('#pf_info_container').removeClass('hidden');
        timers.pf_data = window.setInterval(fetchPfData, RefreshInterval*10.314);
        fetchPfData();
    }
    if (actualOutline.enabled) {
        timers.drawOutline = window.setInterval(drawOutlineJson, actualOutline.refresh);
        setTimeout(drawOutlineJson, 50);
    }

    if (aiscatcher_server) {
        timers.aiscatcher = setInterval(updateAIScatcher, aiscatcher_refresh * 1000);
        updateAIScatcher();
    }
    if (droneJson) {
        timers.droneJson = setInterval(updateDrones, droneRefresh * 1000);
        updateDrones();
    }
    if (satelliteJson) {
        timers.satelliteJson = setInterval(updateSatellites, satelliteRefresh * 1000);
        updateSatellites();
    }

    timersActive = true;

    fetchData();

    // in case the visibility changed while this was running
    handleVisibilityChange();
}

g.dronePending = {};
function updateDrones() {
    let jsons = Array.isArray(droneJson) ? droneJson : [ droneJson ];
    for (let i in jsons) {
        const url = jsons[i];
        // one request per URL at a time (see updateAIScatcher())
        if (g.dronePending[url]) continue;
        g.dronePending[url] = true;

        let req = jQuery.ajax({
            url: url,
            dataType: 'json',
            timeout: Math.max(droneRefresh * 2000, 5000),
        });

        req.done(function(data) {
            handleDrones(data);
        });
        req.always(function() {
            g.dronePending[url] = false;
        });
    }
}

function handleDrones(data) {
    g.droneLast = g.droneNow || 0;
    g.droneNow = new Date().getTime() / 1000;

    for (let i in data) {
        processDrone(data[i], g.droneNow, g.droneLast);
    }
}

function processDrone(drone, now, last) {
    const hex = drone.id;

    // Do we already have this plane object in g.planes?
    // If not make it.
    let plane = g.planes[hex]

    if (!plane) {
        plane = new PlaneObject(hex);
    }

    let ac = drone;

    ac.type = 'other';
    ac.t = 'DRON';
    ac.gs = drone.speed / 1852 * 3600; // m/s to knots
    ac.flight = drone.description;
    ac.alt_baro = drone.alt * 3.28; // m to ft
    ac.baro_rate = drone.vspeed * 3.28 * 60; // m/s to fpm

    ac.seen = now - new Date(drone.time).getTime() / 1000;

    if (drone.lat && drone.lon) {
        ac.lat = drone.lat;
        ac.lon = drone.lon
        ac.seen_pos = ac.seen;
    }
    //console.log(ac);

    plane.updateData(now, last, ac, false);
}

// A single JSON GET, same pattern as updateDrones() - satelliteJson is just a
// URL (see config.js/defaults.js), polled every satelliteRefresh seconds.
// The response already carries position AND the CelesTrak SATCAT enrichment
// (owner, launch info, RCS, ...) merged together server-side by app.js -
// there is no separate lookup of any kind on this end.
// Replay and heatmap show historical aircraft data. The satellite and AIS feeds
// are live-only (no history), so they are suspended in those modes - including
// when replay is switched on at runtime from the Replay button, not just via URL.
function liveFeedsSuspended() {
    return !!(replay || heatmap);
}

g.satelliteFetchPending = false;
function updateSatellites() {
    // Satellites switched off, or replay / heatmap: don't download the feed at all.
    if (window.ShowSatellites === false || liveFeedsSuspended()) return;

    // One request at a time, with a timeout (see updateAIScatcher()).
    const timeout = Math.max(satelliteRefresh * 2000, 10000);
    if (g.satelliteFetchPending && Date.now() - g.satelliteFetchStarted < 2 * timeout) return;
    g.satelliteFetchPending = true;
    g.satelliteFetchStarted = Date.now();

    let req = jQuery.ajax({
        url: satelliteJson,
        dataType: 'json',
        timeout: timeout,
    });

    // first, so a throwing handler below can't leave the flag stuck
    req.always(function () {
        g.satelliteFetchPending = false;
    });
    req.done(function (data) {
        try {
            handleSatellites(data);
        } catch (e) {
            console.error('handleSatellites failed', e);
        }
    });
    req.fail(function (jqXHR, textStatus) {
        console.error('updateSatellites: request to', satelliteJson, 'failed:', textStatus);
    });
}

// Catalogue details (owner, launch, object type, RCS, ...) come from the
// satellite server's /satellite-details endpoint, fetched only when the
// details_version in the positions feed changes - not repeated in every
// positions poll. An older server that still sends the details
// inline in each record is handled too (see processSatellite()).
g.satDetails = { version: null, byId: null, pendingVersion: null, retryAt: 0 };

function fetchSatelliteDetails(version) {
    if (g.satDetails.pendingVersion === version || Date.now() < g.satDetails.retryAt) return;
    let base;
    try {
        base = new URL(satelliteJson).origin;
    } catch (e) {
        return;
    }
    g.satDetails.pendingVersion = version;
    jQuery.ajax({
        url: base + '/satellite-details?v=' + encodeURIComponent(version),
        dataType: 'json',
        cache: true,        // versioned URL: safe for the browser to reuse
        timeout: 30000,
    }).done(function (data) {
        if (!data || !data.satellites) return;
        g.satDetails.version = data.version;
        g.satDetails.byId = data.satellites;
        // apply straight away rather than waiting for the next positions poll
        for (const plane of g.planesOrdered) {
            if (plane && plane.isSatellite && plane.satNoradId != null) {
                applySatelliteDetails(plane, data.satellites[plane.satNoradId], data.version);
            }
        }
    }).fail(function (jqXHR, textStatus) {
        console.error('fetchSatelliteDetails: request failed:', textStatus);
        g.satDetails.retryAt = Date.now() + 60 * 1000;   // don't retry on every poll
    }).always(function () {
        g.satDetails.pendingVersion = null;
    });
}

// Sidebar fields from a satellite's catalogue record - formatted once per
// details version, not on every poll.
function applySatelliteDetails(plane, d, version) {
    plane.satDetailsVersion = version;
    if (!d) return;
    plane.satOwner = celestrakOwnerName(d.owner);
    plane.satOwnerCode = d.owner || null;
    plane.satRcs = formatSatelliteRcs(d.rcs_m2);
    // object_id is the COSPAR/international designator ("1998-067A"), not the
    // NORAD catalog number.
    plane.satObjectType = celestrakObjectTypeName(d.object_type);
    plane.satOpsStatus = d.ops_status_code
        ? (celestrakOpsStatusName(d.ops_status_code) + ' (' + d.ops_status_code + ')')
        : null;
    plane.satLaunchDate = d.launch_date
        ? (d.launch_date + (d.decay_date ? ' (Reentered ' + d.decay_date + ')' : ''))
        : null;
    plane.satLaunchSite = d.launch_site || null;
    plane.satInternationalId = d.object_id || null;
    // Orbit shape (raw km / deg / min - formatted at display time) and the
    // element-set epoch, for the Orbit and TLE Age rows and the sheet header.
    const num = v => (typeof v === 'number' && Number.isFinite(v)) ? v : null;
    const orbit = {
        cls: d.orbit_class || null,
        apogee: num(d.apogee_km),
        perigee: num(d.perigee_km),
        inc: num(d.inclination_deg),
        period: num(d.period_min),
        docked: !!(d.docked || d.orbit_type === 'DOC'),
    };
    plane.satOrbit = (orbit.cls || orbit.apogee != null || orbit.period != null || orbit.docked) ? orbit : null;
    plane.satEpochMs = parseOmmEpoch(d.epoch);
}

function handleSatellites(data) {
    if (!data || !Array.isArray(data.satellites)) return;
    if (data.details_version != null && data.details_version !== g.satDetails.version) {
        fetchSatelliteDetails(data.details_version);
    }
    if (window.ShowSatellites === false || liveFeedsSuspended()) return;   // switched off / replay started while in flight

    g.satelliteLast = g.satelliteNow || 0;
    g.satelliteNow = new Date().getTime() / 1000;

    for (const sat of data.satellites) {
        processSatellite(sat, g.satelliteNow, g.satelliteLast, data.generated_at);
    }
}

function processSatellite(sat, now, last, generatedAt) {
    const hex = 'SAT' + sat.noradId;

    let plane = g.planes[hex];
    if (!plane) {
        plane = new PlaneObject(hex);
    }

    let ac = sat;

    ac.type = 'other';
    ac.flight = sat.name;           // full name, untruncated - see app.js's comment on this
    ac.gs = sat.speed_kn;           // already knots - no unit conversion needed, unlike processDrone()
    ac.alt_baro = sat.alt_ft;       // already feet
    ac.track = sat.track;           // degrees, or null if the future propagation point failed
    ac.baro_rate = sat.vrate_fpm;   // fpm, or null - the true value, no +/-32640 clamp any more

    // Freshness is relative to when app.js computed this BATCH of
    // positions (generatedAt), not to when our own fetch happened to land -
    // a queued/slow request shouldn't make every satellite in it look
    // artificially fresher or staler than it actually is.
    ac.seen = (generatedAt != null) ? (now - generatedAt) : 0;
    ac.lat = sat.lat;
    ac.lon = sat.lon;
    ac.seen_pos = ac.seen;

    plane.updateData(now, last, ac, false);

    applyPendingFollow(plane);

    if (plane === SelectedPlane) {
        extendSatelliteTrack(plane);   // keep the drawn track joined to the satellite
    }

    // Category / NORAD ID: plain fields straight off the positions feed, set
    // directly here (like processBoat() sets ship_type/dims) rather than
    // through the generic ac.* pipeline.
    plane.satCategory = sat.category;
    plane.military = (sat.category === 'military'); // reuses the existing U filter flag
    plane.satNoradId = sat.noradId;
    plane.satNoradIdConfirmed = String(sat.noradId);

    // Catalogue details: inline from an older server, otherwise from the
    // separately-fetched details (applied once per details version).
    if (sat.owner !== undefined || sat.object_type !== undefined) {
        applySatelliteDetails(plane, sat, 'inline');
    } else if (g.satDetails.byId && plane.satDetailsVersion !== g.satDetails.version) {
        applySatelliteDetails(plane, g.satDetails.byId[sat.noradId], g.satDetails.version);
    }
}

// AIS hull outlines (layers.js aiscatcherLayer) are only drawn at zoom >= 13,
// so the OpenLayers vector source behind them is only filled at that zoom, and
// only with vessels around the current view - not rebuilt from the whole feed
// on every poll. The parsed feed is kept so a zoom-in / pan can fill it at once.
const AIS_HULL_MIN_ZOOM = 13;
g.aisLastGeojson = null;
g.aisHullState = { data: null, extent: null, loaded: false };
g.aisGeoJsonFormat = null;

// [minX, minY, maxX, maxY]: does `outer` fully contain `inner`?
function extentContains(outer, inner) {
    return outer[0] <= inner[0] && outer[1] <= inner[1] && outer[2] >= inner[2] && outer[3] >= inner[3];
}

function clearAisHullSource() {
    if (g.aisHullState.loaded && g.aiscatcher_source) {
        g.aiscatcher_source.clear(true);
    }
    g.aisHullState.loaded = false;
    g.aisHullState.data = null;
    g.aisHullState.extent = null;
}

function refreshAisHullSource(force) {
    const src = g.aiscatcher_source;
    if (!src || !OLMap) return;

    const view = OLMap.getView();
    const zoom = view.getZoom();
    if (zoom < AIS_HULL_MIN_ZOOM || window.ShowMarine === false || !g.aisLastGeojson || liveFeedsSuspended()) {
        clearAisHullSource();
        return;
    }

    const size = OLMap.getSize();
    if (!size) return;
    const viewExtent = viewportExtent(size);

    // Already loaded for this feed snapshot and the view is still inside the
    // buffered area that was loaded: nothing to do.
    if (!force
        && g.aisHullState.loaded
        && g.aisHullState.data === g.aisLastGeojson
        && g.aisHullState.extent
        && extentContains(g.aisHullState.extent, viewExtent)) {
        return;
    }

    // Load a generous margin around the view so small pans don't reload.
    // (plain arithmetic: the custom OpenLayers build has no ol.extent module)
    const margin = Math.max(viewExtent[2] - viewExtent[0], viewExtent[3] - viewExtent[1]);
    const loadExtent = [viewExtent[0] - margin, viewExtent[1] - margin, viewExtent[2] + margin, viewExtent[3] + margin];
    const ll = ol.proj.transformExtent(loadExtent, view.getProjection(), 'EPSG:4326');

    const all = g.aisLastGeojson.features || [];
    const subset = [];
    for (let i = 0; i < all.length; i++) {
        const f = all[i];
        const c = f && f.geometry && f.geometry.coordinates;
        if (!c) continue;
        const lon = Number(c[0]);
        const lat = Number(c[1]);
        if (lon >= ll[0] && lon <= ll[2] && lat >= ll[1] && lat <= ll[3]) {
            subset.push(f);
        }
    }

    try {
        if (!g.aisGeoJsonFormat) g.aisGeoJsonFormat = new ol.format.GeoJSON();
        const features = g.aisGeoJsonFormat.readFeatures(
            { type: 'FeatureCollection', features: subset },
            { featureProjection: view.getProjection() }
        );
        src.clear(true); // "true" prevents unneeded refresh events during the swap
        src.addFeatures(features);
        g.aisHullState.loaded = true;
        g.aisHullState.data = g.aisLastGeojson;
        g.aisHullState.extent = loadExtent;
    } catch (e) {
        console.error('refreshAisHullSource: failed to load AIS features into map layer', e);
    }
}

g.aisFetchPending = false;
function updateAIScatcher() {
    // Marine switched off, or replay / heatmap: don't download or parse the feed at all.
    if (window.ShowMarine === false || liveFeedsSuspended()) return;

    // One request at a time: on a slow link, a new poll waits for the last
    // one instead of stacking up overlapping requests that land out of order.
    // The flag is cleared first thing when the request settles (below), and
    // a flag older than twice the request timeout is ignored, so one bad
    // response can never stop vessel updates for the rest of the session.
    const timeout = Math.max(aiscatcher_refresh * 2000, 10000);
    if (g.aisFetchPending && Date.now() - g.aisFetchStarted < 2 * timeout) return;
    g.aisFetchPending = true;
    g.aisFetchStarted = Date.now();

    let req = jQuery.ajax({
        url: aiscatcher_server + '/geojson',
        dataType: 'text',
        timeout: timeout,
    });

    // Registered before the data handler, so it runs first: if processing a
    // response throws, jQuery skips the callbacks after it.
    req.always(function() {
        g.aisFetchPending = false;
    });

    req.done(function(data) {
        let parsed;
        try {
            parsed = JSON.parse(data);   // parsed once, shared by the hull layer and processAIS()
        } catch (e) {
            console.error('updateAIScatcher: failed to parse AIS-catcher response', e);
            return;
        }

        g.aisLastGeojson = parsed;
        // Vessels first: a problem with the hull outlines must never stop the
        // vessels themselves from updating.
        try {
            processAIS(parsed);
        } catch (e) {
            console.error('processAIS failed', e);
        }
        try {
            refreshAisHullSource();
        } catch (e) {
            console.error('refreshAisHullSource failed', e);
        }
    });

    req.fail(function(jqXHR, textStatus, errorThrown) {
        console.error('updateAIScatcher: request to', aiscatcher_server + '/geojson', 'failed:', textStatus, errorThrown);
    });
}

function processAIS(data) {
    if (liveFeedsSuspended()) return;   // replay started while the request was in flight
    g.ais_last = g.ais_now || 0;
    g.ais_now = new Date().getTime() / 1000;

    const features = data.features;
    aisTimeout = data.time_span || aisTimeout;
    for (let i in features) {
        processBoat(features[i], g.ais_now, g.ais_last);
    }
}

function shortShiptype(typeNumber) {
    if (typeNumber == 0) return "UNKN";
    if (typeNumber <= 19) return "RESE";
    if (typeNumber <= 28) return "WING";  // WIG, all sub-categories 20-29 (was wrongly split at 28/29 into a fake "ASAR")
    if (typeNumber <= 29) return "ASAR";
    if (typeNumber <= 30) return "FISH";
    if (typeNumber <= 32) return "TOW";  // Towing (31-32) — renamed from "TUG" to stop colliding with the real Tug code below
    if (typeNumber <= 33) return "DRED";
    if (typeNumber <= 34) return "DIVE";
    if (typeNumber <= 35) return "MIL";
    if (typeNumber <= 36) return "SAIL";
    if (typeNumber <= 37) return "PLEA";  // Pleasure Craft — renamed from "YACH" to match the official term
    if (typeNumber <= 39) return "RESE";
    if (typeNumber <= 49) return "HSPD";
    if (typeNumber <= 50) return "PILO";
    if (typeNumber <= 51) return "SAR";
    if (typeNumber <= 52) return "TUG";
    if (typeNumber <= 53) return "TEND";
    if (typeNumber <= 54) return "POLL";  // Anti-pollution equipment — was wrongly "POLC"
    if (typeNumber <= 55) return "LAW";
    if (typeNumber <= 57) return "LOC";
    if (typeNumber <= 58) return "MED";
    if (typeNumber <= 59) return "NCOM";  // Noncombatant ship (Geneva Convention) — was generic "SPEC"
    if (typeNumber <= 69) return "PASS";
    if (typeNumber <= 79) return "CARG";
    if (typeNumber <= 89) return "TANK";
    if (typeNumber <= 99) return "OTHE";
    return "";
}

const shipTypeDescriptions = {
    0: "Not available",
    20: "Wing in ground",
    21: "Wing in ground (A)",
    22: "Wing in ground (B)",
    23: "Wing in ground (C)",
    24: "Wing in ground (D)",
    25: "Wing in ground (Res)",
    26: "Wing in ground (Res)",
    27: "Wing in ground (Res)",
    28: "Wing in ground (Res)",
    29: "Air Search & Rescue",
    30: "Fishing",
    31: "Towing",
    32: "Towing (Large)",
    33: "Dredging",
    34: "Diving",
    35: "Military",
    36: "Sailing",
    37: "Pleasure Craft",
    38: "Reserved",
    39: "Reserved",
    40: "High speed craft",
    41: "High speed craft (A)",
    42: "High speed craft (B)",
    43: "High speed craft (C)",
    44: "High speed craft (D)",
    45: "High speed craft (Res)",
    46: "High speed craft (Res)",
    47: "High speed craft (Res)",
    48: "High speed craft (Res)",
    49: "High speed craft (No Info)",
    50: "Pilot Vessel",
    51: "Search & Rescue",
    52: "Tug",
    53: "Port Tender",
    54: "Anti-pollution",
    55: "Law Enforcement",
    56: "Spare (Local)",
    57: "Spare (Local)",
    58: "Medical Transp",
    59: "Noncombatant",
    60: "Passenger Vessel ",
    61: "Passenger Vessel (A)",
    62: "Passenger Vessel (B)",
    63: "Passenger Vessel (C)",
    64: "Passenger Vessel (D)",
    65: "Passenger Vessel (Res)",
    66: "Passenger Vessel (Res)",
    67: "Passenger Vessel (Res)",
    68: "Passenger Vessel (Res)",
    69: "Passenger Vessel",
    70: "Cargo Vessel",
    71: "Cargo Vessel (A)",
    72: "Cargo Vessel (B)",
    73: "Cargo Vessel (C)",
    74: "Cargo Vessel (D)",
    75: "Cargo Vessel (Res)",
    76: "Cargo Vessel (Res)",
    77: "Cargo Vessel (Res)",
    78: "Cargo Vessel (Res)",
    79: "Cargo Vessel",
    80: "Tanker",
    81: "Tanker (A)",
    82: "Tanker (B)",
    83: "Tanker (C)",
    84: "Tanker (D)",
    85: "Tanker (Res)",
    86: "Tanker (Res)",
    87: "Tanker (Res)",
    88: "Tanker (Res)",
    89: "Tanker",
    90: "Other",
    91: "Other (A)",
    92: "Other (B)",
    93: "Other (C)",
    94: "Other (D)",
    95: "Other (Res)",
    96: "Other (Res)",
    97: "Other (Res)",
    98: "Other (Res)",
    99: "Other"
};

function fullShiptype(typeNumber) {
    if (shipTypeDescriptions.hasOwnProperty(typeNumber)) {
        return shipTypeDescriptions[typeNumber];
    }
    if (typeNumber >= 1 && typeNumber <= 19) return "Reserved";
    return "Not available";
}

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

const aisStatusDescriptions = {
    "0000": "Under way using engine",
    "0001": "At anchor",
    "0002": "Not under command",
    "0003": "Restricted maneuverability",
    "0004": "Constrained by her draught",
    "0005": "Moored",
    "0006": "Aground",
    "0007": "Engaged in Fishing",
    "0008": "Under way sailing",
    "0014": "AIS-SART Active (SOS)"
};

function getStatusDescription(squawk) {
    return aisStatusDescriptions[squawk] || "";
}

const aircraftStatusDescriptions = {
    "0000": "Transponder Mode C Fault Indication",
    "0001": "Height Monitoring Unit",
    "0002": "Ground Transponder Testing",
    "0003": "Air Ambulance / HEMS Operations",
    "0006": "Police Aviation Support Unit",
    "0007": "Off-shore Safety Area Conspicuity",
    "0010": "Local Aerodrome Frequency-Monitoring Conspicuity",
    "0011": "Local Aerodrome Frequency-Monitoring Conspicuity",
    "0012": "Local Aerodrome Frequency-Monitoring Conspicuity",
    "0013": "Local Aerodrome Frequency-Monitoring Conspicuity",
    "0014": "Air Ambulance / HEMS Operations",
    "0015": "Air Ambulance / HEMS Operations",
    "0016": "Air Ambulance / HEMS Operations",
    "0017": "Air Ambulance / HEMS Operations",
    "0020": "Air Ambulance / Helicopter Emergency Medevac",
    "0021": "Fixed-Wing Aircraft Receiving Service from a Ship",
    "0022": "Helicopter Receiving Service from a Ship",
    "0023": "Aircraft Engaged in Search and Rescue (SAR) Operations",
    "0024": "Radar Flight Evaluation / Calibration",
    "0026": "Special Tasks",
    "0030": "Aircraft Lost / Requesting Navigational Assistance",
    "0032": "Police Air Support Operations",
    "0033": "Aircraft Paradropping",
    "0034": "Antenna Trailing / Target Towing / Glider Towing",
    "0036": "Helicopter Pipeline / Powerline Inspection",
    "0037": "Royal Flight — Helicopters",
    "0040": "Civil Helicopter Operations (Offshore)",
    "1000": "Mode S IFR — Validated Aircraft Identification Matching Flight Plan",
    "1200": "VFR Conspicuity (USA)",
    "2000": "IFR Conspicuity — Not Receiving ATC Service",
    "7000": "VFR Conspicuity (ICAO default)",
    "7002": "Danger Area Operations (General)",
    "7004": "Aerobatics / Display Flying",
    "7005": "High-Energy Manoeuvres (Military Fast-Jet)",
    "7007": "Treaty on Open Skies — Observation Flight",
    "7010": "Operating in an Aerodrome Traffic Pattern",
    "7400": "UAV Lost Link (US/UK)",
    "7500": "Unlawful Interference (Hijack)",
    "7600": "Radio Communication Failure",
    "7601": "Radio Communication Failure (EASA/SERA)",
    "7700": "General Emergency",
};

function getAircraftStatusDescription(squawk) {
    return aircraftStatusDescriptions[squawk] || "";
}

// start ship track 
// Called via updateSelectedTrack() (below) - never directly from the per-refresh
// path. signal/key let a newer selection cancel this request and stop a late
// response for a previously selected vessel from being drawn.
function fetchVesselTrack(mmsi, signal, key) {
    if (!aiscatcher_server || !mmsi || !g.aisTrackSource) return;

    if (aisTrackMaxHours <= 0) {
        g.aisTrackSource.clear();
        return;
    }

    fetch(aiscatcher_server + '/api/path.json?' + mmsi, { signal: signal })
        .then(resp => {
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            return resp.json();
        })
        .then(data => {
            if (key && g.trackState.key !== key) return; // selection moved on

            g.aisTrackSource.clear();

            const points = data[mmsi];
            if (!points || points.length === 0) return;

            const cutoff = (Date.now() / 1000) - (aisTrackMaxHours * 3600);
            const filtered = points.filter(p => p[3] >= cutoff); // p[3] = t_to (end of each segment)

            if (filtered.length === 0) return;

            const coords = filtered
                .slice()
                .reverse()
                .map(p => ol.proj.fromLonLat([p[1], p[0]]));

            g.aisTrackSource.addFeature(new ol.Feature({
                geometry: new ol.geom.LineString(coords)
            }));
        })
        .catch(err => {
            if (err && err.name === 'AbortError') return;
            console.error('fetchVesselTrack: failed for mmsi', mmsi, err);
        });
}
// end ship track 

// start satellite track
// Unlike fetchVesselTrack, this isn't fetching recorded history - the
// server computes it fresh, by propagating the satellite's own orbital
// elements backward in time (see computeSatelliteTrack() in app.js): a
// full orbit's worth (plus a slight overlap, so the loop visibly closes on
// itself), capped at 25 hours absolute regardless of the satellite's own
// period. Nothing further to cap or filter here.
function fetchSatelliteTrack(noradId, signal, key) {
    if (!satelliteJson || !noradId || !g.satelliteTrackSource) return;

    let base;
    try {
        base = new URL(satelliteJson).origin;
    } catch (e) {
        return;
    }

    fetch(base + '/satellite-track?noradId=' + encodeURIComponent(noradId), { signal: signal })
        .then(resp => {
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            return resp.json();
        })
        .then(data => {
            if (key && g.trackState.key !== key) return; // selection moved on

            g.satelliteTrackSource.clear();

            const points = data.points;
            if (!points || points.length === 0) return;

            // Same order as the vessel track API - newest (now) first - so
            // reverse the same way before building the line(s).
            const ordered = points.slice().reverse();

            // A satellite's ground track sweeps through a wide range of
            // longitude over an orbit, and routinely crosses the +/-180
            // antimeridian - OpenLayers has no built-in notion that +179
            // and -179 are neighbours rather than opposite edges of the
            // world, so a single LineString spanning that jump draws a
            // long, wrong straight line clear across the map. Split into
            // a separate segment every time consecutive points jump by
            // more than 180 degrees of longitude, so each drawn segment
            // only ever covers a stretch of track that's genuinely
            // contiguous on the ground.
            const segments = [];
            let current = [];
            for (const p of ordered) {
                if (current.length > 0) {
                    const prevLon = current[current.length - 1][1];
                    if (Math.abs(p[1] - prevLon) > 180) {
                        segments.push(current);
                        current = [];
                    }
                }
                current.push(p);
            }
            if (current.length > 0) segments.push(current);

            let lastFeature = null;
            for (const segment of segments) {
                if (segment.length < 2) continue;   // a lone point can't form a line
                const coords = segment.map(p => ol.proj.fromLonLat([p[1], p[0]]));
                lastFeature = new ol.Feature({
                    geometry: new ol.geom.LineString(coords)
                });
                g.satelliteTrackSource.addFeature(lastFeature);
            }

            // Remember the newest end of the track, so extendSatelliteTrack()
            // can grow it with each new position until the next full refresh.
            const newest = ordered[ordered.length - 1];
            const lastSeg = segments[segments.length - 1];
            g.satTrackTail = {
                key: key,
                feature: (lastSeg && lastSeg.length >= 2) ? lastFeature : null,
                lat: newest[0],
                lon: newest[1],
            };
        })
        .catch(err => {
            if (err && err.name === 'AbortError') return;
            console.error('fetchSatelliteTrack: failed for noradId', noradId, err);
        });
}
// end satellite track

// Selected-object track manager. refreshSelected() runs after every aircraft
// fetch (~1/s) and repeatedly while panning, so it must NOT fetch a track each
// time. A track is fetched when the selection changes, then refreshed every
// TRACK_REFRESH_MS while the same object stays selected. Any in-flight request
// is aborted when the selection changes, and late responses are discarded by key.
const TRACK_REFRESH_MS = 60 * 1000;
g.trackState = { key: null, lastFetch: 0, controller: null };

// Grow the selected satellite's track to its latest position on every update,
// locally - no request. The full orbit is still re-fetched from the server every
// TRACK_REFRESH_MS (updateSelectedTrack()), which replaces this tail.
function extendSatelliteTrack(plane) {
    if (!g.satelliteTrackSource || !plane || !plane.position || !plane.satNoradId) return;
    const key = 'SAT' + plane.satNoradId;
    const tail = g.satTrackTail;
    if (!tail || tail.key !== key || g.trackState.key !== key) return;   // not loaded / not this one

    const lon = plane.position[0];
    const lat = plane.position[1];
    if (tail.lon === lon && tail.lat === lat) return;

    const proj = ol.proj.fromLonLat([lon, lat]);
    const crossed = Math.abs(lon - tail.lon) > 180;
    if (!tail.feature || crossed) {
        // Start a new segment: after an antimeridian crossing it begins at the
        // new point (joining across would streak a line over the whole map);
        // otherwise it joins on from the last known point.
        const start = crossed ? [proj] : [ol.proj.fromLonLat([tail.lon, tail.lat]), proj];
        tail.feature = new ol.Feature({ geometry: new ol.geom.LineString(start) });
        g.satelliteTrackSource.addFeature(tail.feature);
    } else {
        tail.feature.getGeometry().appendCoordinate(proj);
    }
    tail.lon = lon;
    tail.lat = lat;
}

function resetSelectedTrack() {
    if (g.trackState.controller) {
        g.trackState.controller.abort();
    }
    g.trackState.controller = null;
    g.trackState.key = null;
    g.trackState.lastFetch = 0;
    g.satTrackTail = null;
    if (g.aisTrackSource) g.aisTrackSource.clear();
    if (g.satelliteTrackSource) g.satelliteTrackSource.clear();
}

function updateSelectedTrack(selected, force) {
    let key = null;
    if (selected) {
        if (String(selected.icao).startsWith('MMSI') && g.aisTrackSource) {
            key = String(selected.icao);
        } else if (selected.isSatellite && selected.satNoradId && g.satelliteTrackSource) {
            key = 'SAT' + selected.satNoradId;
        }
    }

    if (key !== g.trackState.key) {
        resetSelectedTrack();
        g.trackState.key = key;
    }
    if (!key) return;

    const nowMs = Date.now();
    if (!force && nowMs - g.trackState.lastFetch < TRACK_REFRESH_MS) return;
    g.trackState.lastFetch = nowMs;

    if (g.trackState.controller) g.trackState.controller.abort();
    const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    g.trackState.controller = controller;
    const signal = controller ? controller.signal : undefined;

    if (key.startsWith('MMSI')) {
        fetchVesselTrack(key.replace(/^MMSI/i, ''), signal, key);
    } else {
        fetchSatelliteTrack(selected.satNoradId, signal, key);
    }
}

const interestingShipTypes = new Set(["ASAR", "MIL", "SAR", "LAW"]);
// Ship emergency tiering (status 14 = red/SART, status 2 = amber/not under
// command) now lives in getShipEmergencyLevel() in planeObject.js, derived
// directly from plane.squawk -- no separate status Set needed here.

function processBoat(feature, now, last) {
    const pr = feature.properties;
    const hex = 'MMSI' + pr.mmsi;

    // Marine off: toggleMarine() has already removed every vessel in one
    // pass, and updateAIScatcher() stops polling - this only guards a
    // response that was already in flight when Marine was switched off.
    if (!window.ShowMarine) {
        return;
    }
    // ---------------------------------------------------------------------

    // Get or create the PlaneObject
    let plane = g.planes[hex];
    if (!plane) {
        plane = new PlaneObject(hex);
        plane.baseScale = 0.2;
    }
    // Set on every update, not just on creation: a vessel opened via ?icao=MMSI...
    // already has a placeholder PlaneObject (see parseURLIcaos()) by the time its
    // first AIS message arrives, so the creation branch above never runs for it.
    plane.country = pr.country;
    plane.country_code = pr.country;

    // Build aircraft data
    let ac = {};
    ac.type = 'ais';
    ac.gs = pr.speed;
    ac.flight = pr.callsign || '';
	ac.alt_baro = 0;
	ac.altitude = 0;
    
    // Title-case the ship name
    if (pr.shipname) {
        ac.r = pr.shipname
            .toLowerCase()
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    } else {
        ac.r = '';
    }

    ac.seen = now - pr.last_signal;
    ac.messages = pr.count;
    ac.rssi = pr.level;
    ac.track = pr.cog;

	if (pr.heading !== undefined && pr.heading !== 511) {
        ac.true_heading = pr.heading;
        ac.mag_heading = pr.heading;
    } else {
        ac.true_heading = null;
        ac.mag_heading = null;
    }

	// Write AIS navstatus to plane.squark and pad to four digit
	if (pr.status !== undefined && pr.status !== 15) {
	    plane.squawk = pr.status.toString().padStart(4, '0');
	    plane.aisSquawk = plane.squawk;
	} else {
	    plane.squawk = null;
	    plane.aisSquawk = null;
	}
	// Human readable navstatus for UI
	if (plane.squawk) {
	    plane.statusDescription = getStatusDescription(plane.squawk);
	} else {
	    plane.statusDescription = "";
	}

	// Type / category
	if (pr.shiptype !== undefined && pr.shiptype !== 0) {
	    ac.t = shortShiptype(pr.shiptype);
	    ac.typeDescription = fullShiptype(pr.shiptype);
	    plane.typeDescription = ac.typeDescription;
	    plane.typeLong = "";
	} else if (pr.mmsi_type == 6) {
	    ac.t = "ANAV";
	    ac.typeDescription = "Aids to Navigation";
	    plane.typeDescription = ac.typeDescription;
	    plane.typeLong = "";
	} else if (pr.mmsi_type == 5) {
	    ac.t = "BASE";
	    ac.typeDescription = "Land Base Station";
	    plane.typeDescription = ac.typeDescription;
	    plane.typeLong = "";
	} else if (pr.mmsi_type == 3) {
	    ac.t = "COAS";
	    ac.typeDescription = "Coast Station";
	    plane.typeDescription = ac.typeDescription;
	    plane.typeLong = "";
	} else {
	    ac.t = "UNKN";
	    ac.typeDescription = "Unknown";
	    plane.typeDescription = ac.typeDescription;
	    plane.typeLong = "";
	}
	
    // Classify interesting maritime vessels for the existing U filter.
    const shipType = Number(pr.shiptype);

    plane.ship_type = Number.isFinite(shipType) ? shipType : null;
    plane.military = (
        Number.isFinite(shipType) &&
        interestingShipTypes.has(shortShiptype(shipType))
    );

	// Ship emergency tiering is now derived from plane.squawk (set below)
	// via getShipEmergencyLevel() in planeObject.js -- no separate flag
	// to maintain here.

	// Vessel dimensions
	//plane.dims = (pr.to_bow && pr.to_stern) ? (pr.to_bow + pr.to_stern) + 'm x ' + (pr.to_starboard + pr.to_port) + 'm' : null;
	//plane.draught = (pr.draught && pr.draught > 0) ? (pr.draught).toFixed(1) + 'm' : null;
	
		if (pr.to_bow && pr.to_stern && pr.to_starboard !== undefined && pr.to_port !== undefined) {
	    plane.dims = (pr.to_bow + pr.to_stern) + 'm x ' + (pr.to_starboard + pr.to_port) + 'm';
	}

	if (pr.draught && pr.draught > 0) {
	    plane.draught = pr.draught.toFixed(1) + 'm';
	}
	
	// IMO Number (Permanent Hull ID)
	if (pr.imo && pr.imo !== 0) {
	    plane.imo = pr.imo;
	}
	    
    // Rate of Turn (-128 means 'not available' in AIS)
	if (pr.rot !== undefined && pr.rot !== -128) {
        ac.track_rate = pr.rot; 
    } else {
        ac.track_rate = null;
    }
	
    // Position Accuracy (1 = High/DGPS, 0 = Low)
    plane.pac = (pr.pac !== undefined) ? pr.pac : null;

    // Coordinates
	if (feature.geometry && feature.geometry.coordinates) {
        const coords = feature.geometry.coordinates;
        // (null / '' would otherwise become 0, i.e. a fake position at 0,0)
        const lon = (coords[0] === null || coords[0] === '' || coords[0] === undefined) ? NaN : Number(coords[0]);
        const lat = (coords[1] === null || coords[1] === '' || coords[1] === undefined) ? NaN : Number(coords[1]);
        // AIS uses lon 181 / lat 91 for "position not available" (base stations, AtoNs,
        // SART/EPIRB, vessels without a fix, ...). Passing those on only made
        // PlaneObject log "Ignoring Impossible Position" for every one on every update.
        if (Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
            ac.lat = lat;
            ac.lon = lon;
            ac.seen_pos = now - pr.last_signal;
        }
    }

	// Destination: taken straight from the AIS feed and set (or cleared) on EVERY
	// update. It never goes through the aircraft route API (see
	// PlaneObject.dataChanged()), which used to overwrite it with '' - that was the
	// flicker. AIS pads / fills this field with '@', so tidy that up first.
	const destStr = (pr.destination != null)
	    ? String(pr.destination).replace(/@+/g, ' ').replace(/\s+/g, ' ').trim()
	    : '';
	plane.destination = destStr;
	plane.route = destStr;
	// keep the generic route fields in step so the route filter, the table's
	// route column/sort and the map label all see the same text
	plane.routeString = destStr;
	plane.routeVerbose = destStr;
	plane.routeColumn = destStr;
	if (destStr) ac.route = destStr;

    // ETA
    if (pr.eta_month > 0 && pr.eta_month <= 12 && pr.eta_day > 0) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const mo = months[pr.eta_month - 1]; 
        const da = String(pr.eta_day).padStart(2, '0');
        const hr = pr.eta_hour !== undefined ? String(pr.eta_hour).padStart(2, '0') : "00";
        const mi = pr.eta_minute !== undefined ? String(pr.eta_minute).padStart(2, '0') : "00";
        
        plane.eta = `${da}-${mo} ${hr}:${mi}`;
    }
	
	ac.squawk = plane.squawk;   // preserve the AIS-derived squawk through the shared updateData() pass

    // Update PlaneObject
    plane.updateData(now, last, ac, false);

    applyPendingFollow(plane);
}

// Completes a ?icao=MMSI... or ?icao=SAT... "follow" once the object's first
// position is known - a vessel or satellite selected via URL deep-link
// before its feed has delivered a position gets a placeholder PlaneObject
// with no position at all yet, so select()'s toggleFollow(true) silently
// gives up (toggleFollow forces FollowSelected back to false when there's
// nothing to centre on). This re-tries it once, the moment a real position
// actually lands - from processBoat() for vessels, processSatellite() for
// satellites, whichever ingestion path this object goes through.
function applyPendingFollow(plane) {
    if (g.pendingFollow !== plane.icao || !plane.position)
        return;
    g.pendingFollow = null;   // one-shot, whether or not it still applies
    if (SelectedPlane === plane)
        toggleFollow(true);         // recentres via SelectedPlane.setProjection('follow')
}
let djson;
let dstring;
let dresult;

function startPage() {
    if (!heatmap)
        jQuery("#loader").hide();

    changeZoom("init");
    changeCenter("init");

    processURLParams();
    if (usp.has('reg')) {
        let req = regIcaoDownload();
        req.done(function() {
            const queries = usp.get('reg').split(',');
            for (let i in queries) {
                let icao = db.regCache[queries[i].toUpperCase()];
                if (icao) {
                    icao = icao.toLowerCase();
                    urlIcaos.push(icao);
                }
            }
            processURLParams();
        });
    }

    loadFinished = true;

    setIntervalTimers();

    if (tempTrails)
        selectAllPlanes();

    if (replay) {
        showReplayBar();
        loadReplay(replay.ts);
    }

    if (heatmap) {
        drawHeatmap();
    }

    initVisibilityChange();

    if (pTracks)
        setTimeout(TAR.planeMan.refresh, 10000);

    window.addEventListener("beforeunload", clearIntervalTimers);

    setTimeout(afterFirstFetch, 50);

    console.timeEnd("Page Load");
}

//
// Utils begin
//
(function (global, jQuery, TAR) {
    let utils = TAR.utils = TAR.utils || {};

    // Make a LineString with 'points'-number points
    // that is a closed circle on the sphere such that the
    // great circle distance from 'center' to each point is
    // 'radius' meters
    utils.make_geodesic_circle = function (center, radius, points) {
        const angularDistance = radius / 6378137.0;
        const lon1 = center[0] * Math.PI / 180.0;
        const lat1 = center[1] * Math.PI / 180.0;

        let geom;
        for (let i = 0; i <= points; ++i) {
            const bearing = i * 2 * Math.PI / points;

            let lat2 = Math.asin(Math.sin(lat1) * Math.cos(angularDistance) +
                Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing));
            let lon2 = lon1 + Math.atan2(Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
                Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2));

            lat2 = lat2 * 180.0 / Math.PI;
            lon2 = lon2 * 180.0 / Math.PI;

            if (!geom)
                geom = new ol.geom.LineString([[lon2, lat2]]);
            else
                geom.appendCoordinate([lon2, lat2]);
        }
        return geom;
    }

    return TAR;
}(window, jQuery, TAR || {}));
//
// Utils end
//
//

function webglAddLayer() {
    let success = false;

    const icao = 'c0ffee';

    if (icaoFilter != null) {
        icaoFilter.push(icao);
    }

    processAircraft({hex: icao, lat: CenterLat, lon: CenterLon, type: 'tisb_other', seen: 0, seen_pos: 0,
        alt_baro: 25000, });
    let plane = g.planes[icao];

    let spriteSrc = spritesDataURL ? spritesDataURL : 'images/sprites.png';
    //console.log(spriteSrc);
    try {
        let glStyle = {
            'icon-src': spriteSrc,
            'icon-color': [
                    'color',
                    [ 'get', 'r' ],
                    [ 'get', 'g' ],
                    [ 'get', 'b' ],
                    1
            ],
            'icon-size': [ glIconSize, glIconSize ],
            'icon-offset': [
                'array',
                [ 'get', 'sx' ],
                [ 'get', 'sy' ]
            ],
            'icon-rotation': [ 'get' , 'rotation' ],
            'icon-rotate-with-view': false,
            //'icon-scale': [ 'array', ['get', 'scale'], ['get', 'scale'] ],
            'icon-scale': [ 'abs', ['get', 'scale']],
        };
        if (heatmap) {
            glStyle = {
                'circle-radius': heatmap.radius * globalScale * 1.25,
                'circle-displacement': [0, 0],
                'circle-opacity': heatmap.alpha || webglIconOpacity,
                'circle-fill-color' : [
                    'color',
                    [ 'get', 'r' ],
                    [ 'get', 'g' ],
                    [ 'get', 'b' ],
                    1
                ]
            }
        }

        webglLayer = new ol.layer.WebGLPoints({
            name: 'webglLayer',
            type: 'overlay',
            // No title: intentionally excluded from the layer switcher panel -
            // ol-layerswitcher only lists layers that have a title property
            // (there's no separate opt-out flag), and this layer's visibility
            // is controlled by the dedicated "Aircraft pos. webGL" checkbox
            // in the settings panel instead.
            source: webglFeatures,
            declutter: false,
            zIndex: 200,
            style: glStyle,
            renderBuffer: renderBuffer,
        });
        if (!webglLayer)
            return false;
        if (loStore['webglTested'] != 'true' && !webglLayer.getRenderer()) {
            return false;
        }

        layers.push(webglLayer);

        // Satellite WebGL layer - same style, own source, above aircraft.
        // Not for heatmap mode, which reuses webglFeatures for heat points.
        if (!heatmap && !webglSatLayer) {
            webglSatLayer = new ol.layer.WebGLPoints({
                name: 'webglSatLayer',
                type: 'overlay',
                source: webglSatFeatures,
                declutter: false,
                zIndex: 490,   // above aircraft (200) and the satellite track (250), below satellite labels (500)
                style: glStyle,
                renderBuffer: renderBuffer,
            });
            layers.push(webglSatLayer);
        }

        webgl = true;

        // only test webgl once in every browser
        // after that assume that it's working

        if (loStore['webglTested'] != 'true') {
            plane.visible = true;
            plane.updateMarker();
            OLMap.renderSync();
        }

        loStore['webglTested'] = 'true';
        success = true;
    } catch (error) {
        try {
            layers.remove(webglLayer);
            if (webglSatLayer) {
                layers.remove(webglSatLayer);
                webglSatLayer = null;
            }
        } catch (error) {
            console.error(error);
        }
        console.error(error);
        success = false;
    }
    delete g.planes[plane.icao];
    g.planesOrdered.splice(g.planesOrdered.indexOf(plane), 1);
    plane.destroy();

    if (icaoFilter != null) {
        icaoFilter.pop(icao);
    }

    return success;
}

function webglInit() {
    let init = true;

    new Toggle({
        key: "webgl",
        display: "WebGL",
        container: "#settingsRight",
        init: init,
        setState: function(state) {
            if (state) {
                if (webglLayer) {
                    webgl = true;
                } else {
                    webgl = webglAddLayer();
                }

                if (!webgl) {
                    console.error('Unable to initialize the webGL Layer! Falling back to non-webGL icons, performance will be reduced significantly!');
                    webglLayer = null;
                }
                if (!webgl)
                    return false;
                // returning false means the toggle will flip back as the activation of the webgl layer was unsuccessful.
            } else {
                webgl = false;
                if (loadFinished) {
                    webglFeatures && webglFeatures.clear();
                    webglSatFeatures && webglSatFeatures.clear();
                    for (let i in g.planesOrdered) {
                        const plane = g.planesOrdered[i];
                        delete plane.glMarker;
                    }
                }
            }
            if (loadFinished) {
                refreshFilter();
                checkPointermove();
            }
        },
    });
}

function ol_map_init() {

    if (0) {
        let canvas = iconTest();
        spritesDataURL = canvas.toDataURL();
        jQuery('#iconTestCanvas').remove();
        console.log(spritesDataURL);
    }

    OLMap = new ol.Map({
        target: 'map_canvas',
        layers: layers_group,
        view: new ol.View({
            center: ol.proj.fromLonLat([CenterLon, CenterLat]),
            zoom: g.zoomLvl,
            multiWorld: true,
        }),
        controls: [new ol.control.Zoom({delta: 1, duration: 0, target: 'map_canvas',}),
            new ol.control.Attribution({collapsible: false}),   // the required credits always show
            new ol.control.ScaleLine({units: DisplayUnits})
        ],
        interactions: new ol.interaction.defaults({altShiftDragRotate:false, pinchRotate:false,}),
        maxTilesLoading: 4,
    });

    initAttributionOffset();

    console.time('webglInit');
    webglInit();
    console.timeEnd('webglInit');


    let foundType = false;
    ol.control.LayerSwitcher.forEachRecursive(layers_group, function(lyr) {
        if (lyr.get('name') && lyr.get('type') == 'base') {
            if (MapType_tar1090 == lyr.get('name')) {
                foundType = true;
            }
        }
    });
    if (!foundType) {
        MapType_tar1090 = "osm";
    }

    // Stale value from when the vessel outline layer was a saved overlay (it
    // could hide hull outlines for good); see layers.js.
    try { delete loStore['layer_aiscatcher']; } catch (e) {}

    ol.control.LayerSwitcher.forEachRecursive(layers_group, function(lyr) {
        if (!lyr.get('name'))
            return;

        if (lyr.get('type') == 'base') {
            if (MapType_tar1090 == lyr.get('name')) {
                foundType = true;
                lyr.setVisible(true);

                mapTypeSettings();
                const onVisible = lyr.get('onVisible');
                onVisible && onVisible(lyr);
            } else {
                lyr.setVisible(false);
            }

            lyr.on('change:visible', function(evt) {
                if (evt.target.getVisible()) {
                    MapType_tar1090 = loStore['MapType_tar1090'] = evt.target.get('name');
                    mapTypeSettings();
                    const onVisible = lyr.get('onVisible');
                    onVisible && onVisible(lyr);
                }
            });
        } else if (lyr.get('type') === 'overlay') {
            if (
                loStore['layer_' + lyr.get('name')] == 'true'
                || enableOverlays.indexOf(lyr.get('name')) >= 0
                || (loStore['layer_' + lyr.get('name')] != 'false' && defaultOverlays.indexOf(lyr.get('name')) >= 0)
            ) {
                lyr.setVisible(true);
            }
            if (loStore['layer_' + lyr.get('name')] == 'false') {
                lyr.setVisible(false);
            }

            lyr.on('change:visible', function(evt) {
                loStore['layer_' + evt.target.get('name')] = evt.target.getVisible();
            });
        }
    })

    if (!foundType) {
        ol.control.LayerSwitcher.forEachRecursive(layers_group, function(lyr) {
            if (foundType)
                return;
            if (lyr.get('type') === 'base') {
                lyr.setVisible(true);
                foundType = true;
            }
        });
    }

    OLProj = OLMap.getView().getProjection();
    OLProjExtent = OLProj.getExtent();

    OLMap.getView().setRotation(g.mapOrientation); // adjust orientation

    OLMap.addControl(new ol.control.LayerSwitcher({
        groupSelectStyle: 'none',
        activationMode: 'click', // click sucks in the current implementation
        target: 'map_canvas',
    }));

    OLMap.on('movestart', function(event) {
        if (webgl) {
            const moveOpacity = (TrackedAircraftPositions > webglIconMapMoveOpacityCrowdedThreshold)
                ? webglIconMapMoveOpacityCrowded : webglIconMapMoveOpacity;
            webglLayer.setOpacity(moveOpacity);
            webglSatLayer && webglSatLayer.setOpacity(moveOpacity);
        }
    });

    OLMap.on('moveend', function(event) {
        checkMovement();
        webgl && webglLayer.setOpacity(webglIconOpacity );
        webgl && webglSatLayer && webglSatLayer.setOpacity(webglIconOpacity);
    });

    OLMap.on(['click', 'dblclick'], function(evt) {
        let trailHex = null;
        let trailTS = null;
        let planeHex = null;

        let evtCoords = evt.map.getCoordinateFromPixel(evt.pixel);
        let feature = getClosestPlaneFeature(evtCoords);
        if (feature) {
            let fPixel = evt.map.getPixelFromCoordinate(feature.getGeometry().getCoordinates());
            let a = fPixel[0] - evt.pixel[0];
            let b = fPixel[1] - evt.pixel[1];
            let c = globalScale * (onMobile ? 30 : 20);
            if (a**2 + b**2 < c**2) {
                planeHex = feature.hex;
            } else {
                feature = null;
            }
        }

        if (!planeHex || showTrace) {
            let features = [];
            let trailFeature = null;
            if (1) {
                for (const layer of trailGroup.getArray()) {
                    if (!layer.getVisible()) {
                        continue;
                    }
                    const source = layer.getSource();
                    trailFeature = source.getClosestFeatureToCoordinate(evtCoords);
                    if (trailFeature) {
                        features.push(trailFeature);
                    }
                }
            } else {
                // old variant, slower in most cases
                features = evt.map.getFeaturesAtPixel(
                    evt.pixel,
                    {
                        layerFilter: function(layer) { return (layer.get('isTrail') == true); },
                        hitTolerance: globalScale * (onMobile ? 16 : 20),
                    }
                );
            }
            if (features.length > 0) {
                // Trails need a deliberate tap on the line itself: 16px on touch
                // (was 30 - a fingertip-sized radius, so taps meant to deselect
                // kept landing on the selected aircraft's own trail).
                let hitTolerance = globalScale * (onMobile ? 16 : 20);
                // History (showTrace): desktop keeps tar1090's "rubber band" - a
                // click anywhere jumps to the nearest point in time. On touch
                // that turned every stray tap into a time jump, so it needs a
                // tap near the path.
                if (showTrace) { hitTolerance = onMobile ? globalScale * 40 : 10000; }
                let close2 = hitTolerance * hitTolerance;
                let closest = null;
                for (let j in features) {
                    let feature = features[j];
                    let coords;
                    if (feature.isLabel)
                        coords = [feature.getGeometry().getCoordinates()];
                    else
                        coords = feature.getGeometry().getCoordinates();

                    for (let k in coords) {
                        let fPixel = evt.map.getPixelFromCoordinate(coords[k]);
                        let a = fPixel[0] - evt.pixel[0];
                        let b = fPixel[1] - evt.pixel[1];
                        let distance2 = a**2 + b**2;
                        if (distance2 < close2) {
                            closest = feature;
                            close2 = distance2;
                        }
                    }
                }
                if (closest) {
                    if (showTrace)
                        trailTS = closest.timestamp;
                    else if (!(SelectedPlane && closest.hex === SelectedPlane.icao && !multiSelect))
                        trailHex = closest.hex;   // another aircraft's trail selects it;
                                                  // the selected one's own trail is just map (deselects)
                }
            }
        }

        const dblclick = (evt.type === 'dblclick') && !showTrace;

        if (showTrace && trailTS) {
            planeHex = null;
            gotoTime(trailTS);
        }
        //console.log(`planeHex: ${planeHex} trailHex: ${trailHex}`);
        if (planeHex) {
            // tapped on the map: the mobile sheet opens minimised (see applySheetLayout())
            g.sheet.nextSource = { src: 'map', t: Date.now() };
            selectPlaneByHex(planeHex, {noDeselect: dblclick, follow: dblclick});
        } else if (trailHex) {
            selectPlaneByHex(trailHex, {noDeselect: true});
        }

        if (!planeHex && !trailHex && !multiSelect && !showTrace) {
            if (onlySelected)
                toggleIsolation();
            deselect(SelectedPlane);
            refreshFilter();
        }
        evt.stopPropagation();
    });

    // show the hover box
    checkPointermove();
}

function initMapEarly() {

    // Load stored map settings if present
    if (overrideMapType)
        MapType_tar1090 = overrideMapType;
    else if (loStore['MapType_tar1090']) {
        MapType_tar1090 = loStore['MapType_tar1090'];
    }

    mapTypeSettings();

    // Initialize OpenLayers

    layers_group = createBaseLayers();
    layers = layers_group.getLayers();

    //add_kml_overlay('https://developers.google.com/kml/documentation/KML_Samples.kml', 'samples', 0.8);

    siteCircleLayer = new ol.layer.Vector({
        name: 'siteCircles',
        type: 'overlay',
        title: 'Range rings',
        source: siteCircleFeatures,
        visible: SiteCircles,
        zIndex: 100,
        renderOrder: null,
        renderBuffer: renderBuffer,
    });
    layers.push(siteCircleLayer);

    siteCircleLayer.on('change:visible', function(evt) {
        if (evt.target.getVisible()) {
            runAfterLoad(geoFindMe);
        }
    });
}

function showHideButtons() {
    document.documentElement.classList.toggle('kiosk', !!hideButtons);
    if (hideButtons) {
        jQuery('#splitter').hide();
        jQuery('#tabs').hide();
        jQuery('#filterButton').hide();
        jQuery('.ol-zoom').hide();
        jQuery('.layer-switcher').hide();
    } else {
        jQuery('#splitter').show();
        jQuery('#tabs').show();
        jQuery('#filterButton').show();
        jQuery('.ol-zoom').show();
        jQuery('.layer-switcher').show();
    }
}

// Initalizes the map and starts up our timers to call various functions
function initMap() {

    CenterLon = Number(lopaStore['CenterLon']) || DefaultCenterLon;
    CenterLat = Number(lopaStore['CenterLat']) || DefaultCenterLat;
    //console.log("initMap Centerlat: " + CenterLat);
    g.zoomLvl = Number(lopaStore['zoomLvl']) || DefaultZoomLvl;
    g.zoomLvlCache = g.zoomLvl;

    // always hide this, it really only shows the number of positions saved
    jQuery('#dump1090_total_history_td').hide();

    if (globeIndex && aggregator) {
        jQuery('#dump1090_message_rate_td').hide();
        jQuery('#RP').show();

    }

    locationDotLayer = new ol.layer.Vector({
        name: 'locationDot',
        type: 'overlay',
        title: (receiverJson && receiverJson.lat != null) ? 'Site position' : 'Your position',
        source: locationDotFeatures,
        visible: SiteShow,
        zIndex: 100,
        renderOrder: null,
        renderBuffer: renderBuffer,
    });
    layers.push(locationDotLayer);

    locationDotLayer.on('change:visible', function(evt) {
        if (evt.target.getVisible()) {
            runAfterLoad(geoFindMe);
        }
    });


    actualOutline.enabled = multiOutline || (receiverJson && receiverJson.outlineJson);

    if (actualOutline.enabled) {
        actualOutline.refresh = 15000;
        actualOutline.url = multiOutline ? 'data/multiOutline.json' : 'data/outline.json';

        actualOutline.features = new ol.source.Vector();
        actualOutline.style = new ol.style.Style({
            fill: null,
            stroke: new ol.style.Stroke({
                color: actual_range_outline_color,
                width: actual_range_outline_width,
                lineDash: actual_range_outline_dash,
            }),
        });
        actualOutline.layer = new ol.layer.Vector({
            name: 'actualRangeOutline',
            type: 'overlay',
            title: 'actual range outline',
            source: actualOutline.features,
            zIndex: 101,
            renderBuffer: renderBuffer,
            style: actualOutline.style,
            visible: actual_range_show,
        });
        layers.push(actualOutline.layer);
    }
    if (calcOutlineData) {
        calcOutlineLayer = new ol.layer.Vector({
            name: 'calcOutline',
            type: 'overlay',
            title: 'terrain-based range outline',
            source: calcOutlineFeatures,
            zIndex: 100,
            renderOrder: null,
            renderBuffer: renderBuffer,
        });
        layers.push(calcOutlineLayer);
        drawUpintheair();
    }


    const dummyLayer = new ol.layer.Vector({
        name: 'dummy',
        renderOrder: null,
        source: new ol.source.Vector(),
    });

    trailGroup.push(dummyLayer);

    trailLayers = new ol.layer.Group({
        name: 'ac_trail',
        title: 'Aircraft trails',
        type: 'overlay',
        layers: trailGroup,
        zIndex: 150,
    });

    layers.push(trailLayers);

    iconLayer = new ol.layer.Vector({
        name: 'iconLayer',
        type: 'overlay',
        // No title - see the webglLayer comment above; same reasoning, the
        // "Aircraft positions" checkbox in the settings panel is the real
        // control, ol-layerswitcher has no separate opt-out flag to use.
        source: PlaneIconFeatures,
        declutter: false,
        zIndex: 200,
        renderBuffer: renderBuffer,
    });
    layers.push(iconLayer);

    // Deliberately well above the aircraft layers (WebGL layer and iconLayer
    // both sit at 200) - satellites should always paint on top, unconditionally.
    satelliteIconLayer = new ol.layer.Vector({
        name: 'satelliteIconLayer',
        type: 'overlay',
        // No title - same reasoning as iconLayer above.
        source: SatelliteIconFeatures,
        declutter: false,
        zIndex: 500,
        renderBuffer: renderBuffer,
    });
    layers.push(satelliteIconLayer);


    ol_map_init();

    // handle the layer settings pane checkboxes
    //OLMap.once('postrender', function(e) {
        //toggleLayer('#nexrad_checkbox', 'nexrad');
        //toggleLayer('#sitepos_checkbox', 'site_pos');
        //toggleLayer('#actrail_checkbox', 'ac_trail');
        //toggleLayer('#acpositions_checkbox', 'webglLayer');
    //});

    jQuery('#infoblock_close').on('click', function () {
        if (showTrace)
            toggleShowTrace();
        if (onlySelected)
            toggleIsolation();

        deselect(SelectedPlane);
        refreshFilter();
    });



    new Toggle({
        key: "darkerColors",
        display: "Darker Colors",
        container: "#settingsLeft",
        init: darkerColors,
        setState: function(state) {
            darkerColors = state;
            if (loadFinished) {
                refreshFeatures();
                remakeTrails();
            }
        }
    });

    tableColorsLight = tableColors;
    tableColorsDark = JSON.parse(JSON.stringify(tableColors));
    let darkVals = Object.values(tableColorsDark);
    for (let i in ['selected', 'unselected']) {
        let obj = darkVals[i];
        let keys = Object.keys(obj)
        for (let j in keys) {
            let key = keys[j];
            let hsl = hexToHSL(obj[key]);
            hsl[1] *= 0.4;
            hsl[2] *= 0.3;
            obj[key] = hslToRgb(hsl);
        }
    }
    new Toggle({
        key: "darkMode",
        display: "Dark Mode",
        container: "#settingsLeft",
        init: darkModeDefault,
        setState: function(state) {
            let root = document.documentElement;
            // Both palettes live in style.css (:root and :root.dark), as do the
            // logo / close-icon filters - setting inline custom properties here
            // used to override the stylesheet theme in light mode too.
            root.classList.toggle('dark', !!state);
            // browser / home-screen app bar colour follows the theme
            const themeMeta = document.querySelector('meta[name="theme-color"]');
            if (themeMeta) themeMeta.setAttribute('content', state ? '#0F1720' : '#F5F7FA');
            tableColors = state ? tableColorsDark : tableColorsLight;
            if (loadFinished) {
                TAR.planeMan.redraw();
                refreshFilter();
                initLegend(tableColors.unselected);
                initSourceFilter(tableColors.unselected);
                initFlagFilter(tableColors.unselected);
            }
        }
    });

    // Follow the iPhone / Mac light-dark setting unless the user has picked
    // one themselves. The system's choice is applied with init=true, so it is
    // never saved as the user's own Dark Mode choice.
    (function initSystemAppearance() {
        const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
        const dark = toggles['darkMode'];
        if (!mq || !dark) return;
        let applying = false;
        const applySystem = function () {
            if (!toggles['darkModeAuto'] || !toggles['darkModeAuto'].state) return;
            if (!!dark.state === mq.matches) return;
            applying = true;
            try { dark.toggle(mq.matches, true); } finally { applying = false; }
        };
        // Dark Mode switched by hand (checkbox or menu): stop following the system
        const origToggle = dark.toggle;
        dark.toggle = function (override, init) {
            if (!init && !applying && toggles['darkModeAuto'] && toggles['darkModeAuto'].state) {
                toggles['darkModeAuto'].toggle(false);
            }
            return origToggle.call(this, override, init);
        };
        new Toggle({
            key: "darkModeAuto",
            display: "Match System Appearance",
            container: "#settingsLeft",
            init: true,
            setState: function (state) {
                if (state) applySystem();
            }
        });
        if (mq.addEventListener) mq.addEventListener('change', applySystem);
        else if (mq.addListener) mq.addListener(applySystem);
    })();

    initLegend(tableColors.unselected);

    initFilters();

    ol.control.LayerSwitcher.forEachRecursive(layers_group, function(lyr) {
        if (lyr.get('type') != 'base')
            return;
        lyr.dimKey = lyr.on('postrender', dim);
    });

    new Toggle({
        key: "MapDim",
        display: "Dim Map",
        container: "#settingsLeft",
        init: MapDim,
        setState: function(state) {
            /*
            if (!state) {
                ol.control.LayerSwitcher.forEachRecursive(layers_group, function(lyr) {
                    if (lyr.get('type') != 'base')
                        return;
                    ol.Observable.unByKey(lyr.dimKey);
                });
            } else {
                ol.control.LayerSwitcher.forEachRecursive(layers_group, function(lyr) {
                    if (lyr.get('type') != 'base')
                        return;
                    lyr.dimKey = lyr.on('postrender', dim);
                });
            }
            */
            if (loadFinished) {
                OLMap.render();
            }
            buttonActive('#B', state);
        }
    });

    window.addEventListener('keydown', function(e) {
        active();
        if (e.defaultPrevented ) {
            return; // Do nothing if the event was already processed
        }
        if (e.target.type == "text") {
            return;
        }
        if (e.srcElement.nodeName == 'INPUT') {
            return;
        }

        if( e.ctrlKey || e.altKey || e.metaKey) {
            return;
        }
        let oldCenter, extent, newCenter;
        switch (e.key) {
            case "c":
            case "Esc":
            case "Escape":
                deselectAllPlanes();
                break;
                // zoom and movement
            case "q":
            case "-":
            case "Subtract":
                zoomOut();
                break;
            case "e":
            case "+":
            case "Add":
                zoomIn();
                break;
            case "ArrowUp":
            case "w":
                oldCenter = OLMap.getView().getCenter();
                extent = viewportExtent(OLMap.getSize());
                newCenter = [oldCenter[0], (oldCenter[1] + extent[3])/2];
                OLMap.getView().setCenter(newCenter);
                toggleFollow(false);
                break;
            case "ArrowDown":
            case "s":
                oldCenter = OLMap.getView().getCenter();
                extent = viewportExtent(OLMap.getSize());
                newCenter = [oldCenter[0], (oldCenter[1] + extent[1])/2];
                OLMap.getView().setCenter(newCenter);
                toggleFollow(false);
                break;
            case "ArrowLeft":
            case "a":
                oldCenter = OLMap.getView().getCenter();
                extent = viewportExtent(OLMap.getSize());
                newCenter = [(oldCenter[0] + extent[0])/2, oldCenter[1]];
                OLMap.getView().setCenter(newCenter);
                toggleFollow(false);
                break;
            case "ArrowRight":
            case "d":
                oldCenter = OLMap.getView().getCenter();
                extent = viewportExtent(OLMap.getSize());
                newCenter = [(oldCenter[0] + extent[2])/2,  oldCenter[1]];
                OLMap.getView().setCenter(newCenter);
                toggleFollow(false);
                break;
                // misc
            case "b":
                toggles['MapDim'].toggle();
                break;
            case "m":
                toggleMultiSelect();
                break;
            case "/":   // search all objects
                if (typeof openSearch === 'function') { e.preventDefault(); openSearch(); }
                break;
            case "E":   // Shift+E: lower-case e is zoom in
                toggleEmergency();
                break;
            case "v":
                toggleTableInView();
                break;
            case "r":
                if (heatmap)
                    drawHeatmap();
                else
                    followRandomPlane();
                break;
            case "R":
                fetchData();
                break;
            case "t":
                selectAllPlanes();
                break;
            case "G":
                nogpsOnly = !nogpsOnly;
                refreshFilter();
                break;
            case "h":
                resetMap();
                break;
            case "H":
                hideButtons = !hideButtons;
                showHideButtons();
                break;
            case "f":
                toggleFollow();
                break;
                // filters
            case "T":
                filterTISB = !filterTISB;
                refreshFilter();
                break
            case "Y":
                showReplayBar();
                break;
            case "u":
                toggleMilitary();
                break;
            case "i":
                toggleIsolation();
                break;
                // persistence mode
            case "p":
                togglePersistence();
                break;
                // Labels
            case "l":
                toggleLabels();
                break;
            case "o":
                toggleExtendedLabels();
                break;
            case "k":
                toggleTrackLabels();
                break;
                // debug stuff
            case "L":
                toggles['lastLeg'].toggle();
                break;
            case "D":
                debug = !debug;
                loStore['debug'] = debug;
                console.log('debug = ' + debug);
                break;
            case "P":
                debugPosFilter = !debugPosFilter;
                loStore['debugPosFilter'] = debugPosFilter;
                console.log('debugPosFilter = ' + debugPosFilter);
                break;
            case "?":
                if (!SelectedPlane) {
                    console.log("No plane selected");
                    break;
                }
                console.log(SelectedPlane.icao + ": " + SelectedPlane.baseMarkerKey + "  " + SelectedPlane.shape);
                console.log(SelectedPlane);
                console.log(SelectedPlane.milRange());
                break;
            case "j":
                selectPlaneByHex(jumpTo, {follow: true});
                break;
            case "J":
                debugJump = !debugJump;
                loStore['debugJump'] = debugJump;
                console.log('debugJump = ' + debugJump);
                break;
            case "N":
                noMLAT = !noMLAT;
                loStore['noMLAT'] = noMLAT;
                console.log('noMLAT = ' + noMLAT);
                break;
        }
    }, true);


    if (!usp.has('icao')
        && !usp.has("lat") && !usp.has("lon")
        && !usp.has('airport')
    ) {
        runAfterLoad(geoFindMe);
    } else {
        runAfterLoad(initSitePos);
    }

}

// This looks for planes to reap out of the master g.planes variable
let lastReap = 0;
let reapInProgress = false;
function reaper(all) {
    //console.log("Reaping started..");

    if (reapInProgress) {
        return;
    }

    lastReap = now;

    if (noVanish && !all) {
        return;
    }

    reapInProgress = true;

    if (!all) {
        releaseMem();
    }

    // Look for planes where we have seen no messages for >300 seconds
    let plane;
    let length = g.planesOrdered.length;
    let temp = []
    for (let i in g.planesOrdered) {
        plane = g.planesOrdered[i];
        if (plane == null)
            continue;
        plane.seen = now - plane.last_message_time;
        if ( all ||
            (
                (!plane.selected)
                && plane.seen > reapTimeout
                && (plane.dataSource != 'adsc' || plane.seen > jaeroTimeout)
                && (plane.dataSource != 'ais' || plane.seen > aisTimeout)
            )
        ) {
            // Reap it.
            //console.log("Removed " + plane.icao);
            delete g.planes[plane.icao];
            plane.destroy();
            continue;
        }

        // Keep it.
        temp.push(plane);

        if (globeIndex) {
            if (plane.clearTraceAfter) {
                //console.log(now - plane.clearTraceAfter);
                if (now > plane.clearTraceAfter) {
                    plane.clearTrace();
                    //console.log("clearTrace: " + plane.icao);
                }
            } else if (!plane.linesDrawn) {
                plane.clearTraceAfter = now + 300;
            }
        }
    }
    g.planesOrdered = temp;

    reapInProgress = false;
    const removed = length - g.planesOrdered.length;
    if (removed > 0) {
        //console.log(`reaper removed ${removed} planes.`);
    }

    return removed;
}

// Page Title update function
function refreshPageTitle() {
    if (pTracks)
        return;
    if (!PlaneCountInTitle && !MessageRateInTitle) {
        return;
    }

    let subtitle = "";

    if (PlaneCountInTitle) {
        if (globeIndex) {
            subtitle += 'tracking ' + globeTrackedAircraft + ' aircraft';
        } else {
            subtitle += TrackedAircraftPositions + '/' + TrackedAircraft;
        }
    }

    if (MessageRateInTitle && MessageRate != null) {
        if (subtitle) subtitle += ' | ';
        subtitle += MessageRate.toFixed(1) + '/s';
    }

    if (PageName) {
        document.title = PageName + ' - ' + subtitle;
    } else {
        document.title = subtitle;
    }
}

// ---- Image-box placeholders (no photo found) -------------------------------
// When no photo exists, the image box shows a representative outline above the
// "No ... image available" text: the object's own map shape for aircraft and
// satellites, and a side-profile silhouette by AIS class for vessels
// (PANEL_VESSEL_PROFILES above - kept separate from `shapes`, so map icons and the
// WebGL sprite sheet are untouched).
// Side-profile vessel silhouettes for the info-panel image box ONLY (no photo found).
// Kept in script.js (not markers.js) so the whole placeholder feature ships in one file.
// Deliberately NOT part of `shapes`: shapes feed the WebGL sprite sheet by index,
// so adding entries there would shift map icons. Same object format as `shapes`,
// so svgShapeToSVG() renders them. Bow to the right, waterline at y = 80.
const PANEL_PROFILE_WATER = 'M4,88 q9,-4 18,0 t18,0 t18,0 t18,0 t18,0 t18,0 t18,0 t18,0 t18,0 t18,0 t18,0 t18,0 t18,0';
const PANEL_VESSEL_PROFILES = {
    cargo: { // container ship: aft bridge, stacked boxes
        w: 240, h: 100, viewBox: '0 0 240 100',
        path: [
            'M8,58 L16,80 L208,80 L234,50 L224,50 L216,58 Z',
            'M22,58 V22 H52 V58 Z',
            'M18,22 H56 V28 H18 Z',
            'M28,22 V12 H40 V22 Z',
            'M60,58 V38 H98 V58 Z', 'M102,58 V34 H140 V58 Z', 'M144,58 V34 H182 V58 Z', 'M186,58 V40 H212 V58 Z',
        ],
        accent: [PANEL_PROFILE_WATER, 'M60,48 H98 M102,46 H140 M144,46 H182 M186,49 H212',
                 'M73,38 V58 M86,38 V58 M115,34 V58 M128,34 V58 M157,34 V58 M170,34 V58 M199,40 V58',
                 'M26,34 H48 M26,42 H48'],
    },
    tanker: { // low hull, aft accommodation, deck pipework
        w: 240, h: 100, viewBox: '0 0 240 100',
        path: [
            'M8,60 L16,80 L210,80 L234,54 L222,54 L214,60 Z',
            'M20,60 V28 H50 V60 Z',
            'M16,28 H54 V34 H16 Z',
            'M28,28 V14 H40 V28 Z',
            'M118,60 V48 H134 V60 Z',
            'M206,54 V40 H210 V54 Z',
        ],
        accent: [PANEL_PROFILE_WATER, 'M54,55 H214', 'M58,52 H210', 'M70,52 V60 M90,52 V60 M150,52 V60 M170,52 V60 M190,52 V60', 'M24,40 H46 M24,48 H46'],
    },
    passenger: { // cruise ship / ferry: tall multi-deck superstructure
        w: 240, h: 100, viewBox: '0 0 240 100',
        path: [
            'M8,56 L16,80 L206,80 L234,48 L224,48 L216,56 Z',
            'M22,56 V22 H190 L212,40 V56 Z',
            'M44,22 V14 H170 L180,22 Z',
            'M86,14 L90,2 H112 L114,14 Z',
        ],
        accent: [PANEL_PROFILE_WATER, 'M26,30 H196', 'M26,38 H203', 'M26,46 H209', 'M50,18 H168',
                 'M30,64 H206'],
    },
    fishing: { // trawler: wheelhouse forward, mast and booms, stern gantry
        w: 240, h: 100, viewBox: '0 0 240 100',
        path: [
            'M30,60 L40,80 L182,80 L210,44 L198,44 L188,60 Z',
            'M140,60 V36 H172 L180,46 V60 Z',
            'M38,60 L48,24 H53 L44,60 Z',
            'M74,60 L63,24 H68 L79,60 Z',
            'M46,24 H70 V29 H46 Z',
        ],
        accent: [PANEL_PROFILE_WATER, 'M120,60 V12', 'M120,18 L88,50', 'M120,18 L150,30', 'M148,44 H174', 'M88,50 V60'],
    },
    tug: { // short, beamy, tall wheelhouse, bow fendering
        w: 240, h: 100, viewBox: '0 0 240 100',
        path: [
            'M46,58 L58,80 L172,80 L200,50 L188,50 L180,58 Z',
            'M86,58 V40 H156 V58 Z',
            'M100,40 V24 H150 L156,32 V40 Z',
            'M74,58 V38 H84 V58 Z',
        ],
        accent: [PANEL_PROFILE_WATER, 'M126,24 V6', 'M118,12 H134', 'M106,32 H148', 'M60,62 H178'],
    },
    sailing: { // sailing yacht: mainsail and jib
        w: 240, h: 100, viewBox: '0 0 240 100',
        path: [
            'M50,70 L64,82 L178,82 L206,66 Z',
            'M116,64 V8 L66,64 Z',
            'M124,12 L178,64 H124 Z',
            'M98,70 V62 H140 L146,70 Z',
        ],
        accent: [PANEL_PROFILE_WATER, 'M120,70 V4'],
    },
    pleasure: { // motor yacht: sleek hull, flybridge
        w: 240, h: 100, viewBox: '0 0 240 100',
        path: [
            'M26,64 L38,82 L194,82 L228,56 L214,56 L204,64 Z',
            'M62,64 V48 L150,46 L182,64 Z',
            'M84,46 V38 H138 L150,46 Z',
        ],
        accent: [PANEL_PROFILE_WATER, 'M70,55 H160', 'M110,38 V28', 'M40,72 H200'],
    },
    highspeed: { // fast ferry / HSC: low streamlined superstructure
        w: 240, h: 100, viewBox: '0 0 240 100',
        path: [
            'M14,62 L22,80 L212,80 L234,64 Z',
            'M30,62 V42 Q40,36 60,36 L168,36 Q190,38 206,62 Z',
        ],
        accent: [PANEL_PROFILE_WATER, 'M40,48 H186', 'M38,54 H196', 'M60,36 V30 H90 V36', 'M24,72 H220'],
    },
    military: { // warship: raked bow, stepped superstructure, mast, bow gun
        w: 240, h: 100, viewBox: '0 0 240 100',
        path: [
            'M8,60 L16,80 L212,80 L236,50 L226,50 L216,60 Z',
            'M38,60 V44 H70 V60 Z',
            'M70,60 V36 H132 L144,48 V60 Z',
            'M94,36 L98,12 H110 L114,36 Z',
            'M178,60 V52 H192 V60 Z',
        ],
        accent: [PANEL_PROFILE_WATER, 'M192,55 L214,50', 'M104,12 V2', 'M96,20 H116', 'M150,60 V54 H164 V60'],
    },
    patrol: { // SAR / law enforcement / pilot / medical: fast workboat
        w: 240, h: 100, viewBox: '0 0 240 100',
        path: [
            'M36,62 L46,80 L178,80 L210,52 L198,52 L188,62 Z',
            'M96,62 V40 H148 L162,52 V62 Z',
        ],
        accent: [PANEL_PROFILE_WATER, 'M126,40 V20', 'M118,26 H134', 'M104,48 H154', 'M42,68 H192'],
    },
    work: { // dredger / diving / tender / anti-pollution: workboat with crane
        w: 240, h: 100, viewBox: '0 0 240 100',
        path: [
            'M16,60 L24,80 L204,80 L228,54 L218,54 L210,60 Z',
            'M28,60 V32 H62 V60 Z',
            'M24,32 H66 V38 H24 Z',
            'M118,60 V48 H134 V60 Z',
        ],
        accent: [PANEL_PROFILE_WATER, 'M126,48 V22 L188,44', 'M188,44 V56', 'M32,44 H58'],
    },
    generic: { // general vessel / unknown: coaster outline
        w: 240, h: 100, viewBox: '0 0 240 100',
        path: [
            'M14,60 L22,80 L206,80 L230,52 L220,52 L212,60 Z',
            'M28,60 V32 H62 V60 Z',
            'M24,32 H66 V38 H24 Z',
            'M38,32 V20 H50 V32 Z',
        ],
        accent: [PANEL_PROFILE_WATER, 'M32,44 H58', 'M80,60 H200'],
    },
    station: { // AIS base / coast station: radio mast on a building
        w: 240, h: 100, viewBox: '0 0 240 100',
        path: [
            'M88,84 V60 H152 V84 Z',
            'M114,60 L118,8 H122 L126,60 Z',
        ],
        accent: ['M60,84 H180', 'M116,30 L124,30 M115,44 L125,44',
                 'M104,14 Q98,22 104,30', 'M96,10 Q86,22 96,34', 'M136,14 Q142,22 136,30', 'M144,10 Q154,22 144,34',
                 'M100,72 H112 M128,72 H140'],
    },
    aton: { // aid to navigation: buoy with top mark and light
        w: 240, h: 100, viewBox: '0 0 240 100',
        path: [
            'M100,80 L108,56 H132 L140,80 Z',
            'M114,56 V30 H126 V56 Z',
            'M112,30 L120,18 L128,30 Z',
        ],
        accent: [PANEL_PROFILE_WATER, 'M104,68 H136', 'M120,18 V12', 'M108,14 L112,18 M132,14 L128,18'],
    },
};

const VESSEL_PROFILE_BY_TYPE = {
    CARG: 'cargo', TANK: 'tanker', PASS: 'passenger', FISH: 'fishing',
    TUG: 'tug', TOW: 'tug', SAIL: 'sailing', PLEA: 'pleasure',
    HSPD: 'highspeed', WING: 'highspeed', MIL: 'military',
    LAW: 'patrol', SAR: 'patrol', PILO: 'patrol', MED: 'patrol', NCOM: 'patrol',
    DRED: 'work', DIVE: 'work', POLL: 'work', TEND: 'work',
    LOC: 'generic', RESE: 'generic', OTHE: 'generic', UNKN: 'generic',
    BASE: 'station', COAS: 'station', ANAV: 'aton',
};

// Soft tint of the object's map colour: recognisable, but calm in a photo slot.
function placeholderFill(hsl) {
    return 'hsl(' + Math.round(hsl[0]) + ',' + Math.min(70, Math.round(hsl[1])) + '%,80%)';
}

function photoPlaceholderSvg(plane) {
    try {
        if (!plane || typeof svgShapeToSVG !== 'function') return '';
        let shape = null;
        let hsl = [210, 15, 55];
        let strokeWidth = outlineWidth * 0.75;
        let maxH = 90;
        if (String(plane.icao).startsWith('MMSI')) {
            if (plane.icaoType === 'ASAR') {
                shape = shapes['ais_aircraft'];
            } else {
                shape = PANEL_VESSEL_PROFILES[VESSEL_PROFILE_BY_TYPE[plane.icaoType] || 'generic'];
                strokeWidth = 1.4;
                maxH = 70;
            }
            if (typeof getAisVesselColor === 'function') hsl = getAisVesselColor(plane);
        } else if (plane.isSatellite) {
            const def = SAT_CATEGORIES[plane.satCategory] || SAT_CATEGORIES.other;
            shape = shapes[def.shape];
            hsl = def.color;
        } else {
            shape = plane.shape;   // the shape already chosen for its map icon
            if (!shape) {
                const bm = getBaseMarker(plane.category, plane.icaoType, plane.typeDescription, plane.wtc,
                    plane.addrtype, plane.altitude, true, plane.icao, plane.speed, null);
                shape = bm ? shapes[bm[0]] : null;
            }
            hsl = altitudeColor(plane.alt_rounded);
        }
        if (!shape) return '';
        const scale = Math.min(160 / shape.w, maxH / shape.h);
        return svgShapeToSVG(shape, placeholderFill(hsl), 'currentColor', strokeWidth, scale);
    } catch (e) {
        // never let a placeholder break the panel - but say why, once
        if (!photoPlaceholderSvg.warned) {
            photoPlaceholderSvg.warned = true;
            console.warn('photoPlaceholderSvg failed:', e);
        }
        return '';
    }
}

function photoPlaceholderHtml(plane, message, vesselKey) {
    return '<div class="photoPlaceholder"' + (vesselKey ? ' data-vessel-key="' + escapeHtml(vesselKey) + '"' : '') + '>' +
        photoPlaceholderSvg(plane) +
        '<div class="noImageText">' + escapeHtml(message) + '</div></div>';
}

// The three "no image" helpers below write to #selected_photo directly, bypassing
// setPhotoHtml(). They must clear its de-dupe cache (selectedPhotoCache), otherwise
// re-selecting a target whose photo was on screen BEFORE a "no image" one was shown
// hits the "same HTML as last time" early-return and never repaints.
// The vessel one keeps data-vessel-key on the first element - vesselPhotoOnScreen()
// relies on it.
function displayVesselNoImage(vesselKey, message) {
    setPhotoHtml(photoPlaceholderHtml(SelectedPlane, message || 'No vessel image available', vesselKey));
    setCopyrightHtml('');
}

function displaySil() {
    setPhotoHtml(photoPlaceholderHtml(SelectedPlane, 'No aircraft image available'));
    setCopyrightHtml('');
}

function displaySatelliteNoImage() {
    setPhotoHtml(photoPlaceholderHtml(SelectedPlane, 'No satellite image available'));
    setCopyrightHtml('');
}

// ============================================================================
// ============================================================================
// Shared image fallback: Wikipedia infobox + Openverse
// ============================================================================
// Used as extra fallback tiers by BOTH the vessel photo lookup (further down
// this file) and the satellite photo lookup (wikidataSatellitePhoto, later in
// this file), once each one's own exact-identifier lookup (IMO -> Wikidata
// P458 / NORAD catalog number -> Wikidata P377) has found a confirmed
// Wikidata item but that item carries no P18 image. Two more tries, in order:
//   A. photoWikipediaLeadImage(qid) - the item's English Wikipedia infobox
//      image, via its own sitelink. Callers MUST only pass a QID that was
//      matched by an exact numeric identifier, never one found by searching
//      on a name - this is a different field on the SAME confirmed item, not
//      a new, weaker match.
//   B. photoOpenverseSearch(query, scorer) - a free-text keyword search across
//      Wikimedia Commons, Flickr and other CC sources via the Openverse API
//      (api.openverse.org, no key required). This is the only fallback here
//      that has no hard identifier behind it, so every caller must supply a
//      scorer that rejects anything not clearly evidenced as the right
//      subject; a wrong photo is worse than no photo.
const PHOTO_FALLBACK_TIMEOUT_MS = 4000;
const PHOTO_FALLBACK_THUMB_WIDTH = 330;                // a standard Wikimedia thumbnail step

async function photoFetchJson(url, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, timeoutMs || PHOTO_FALLBACK_TIMEOUT_MS);
    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return await response.json();
    } finally {
        clearTimeout(timer);
    }
}

// A. Wikipedia's lead/infobox image for an already-confirmed Wikidata QID.
async function photoWikipediaLeadImage(qid, via) {
    if (!qid) return null;
    const sitelinkParams = new URLSearchParams({
        action: 'wbgetentities', format: 'json', origin: '*',
        ids: qid, props: 'sitelinks', sitefilter: 'enwiki'
    });
    const sitelinkData = await photoFetchJson('https://www.wikidata.org/w/api.php?' + sitelinkParams);
    const title = ((((sitelinkData.entities || {})[qid] || {}).sitelinks || {}).enwiki || {}).title;
    if (!title) return null;

    const pageParams = new URLSearchParams({
        action: 'query', format: 'json', origin: '*',
        prop: 'pageimages', piprop: 'thumbnail', pithumbsize: String(PHOTO_FALLBACK_THUMB_WIDTH), titles: title
    });
    const pageData = await photoFetchJson('https://en.wikipedia.org/w/api.php?' + pageParams);
    const page = Object.values((pageData.query && pageData.query.pages) || {})[0];
    const src = page && page.thumbnail && page.thumbnail.source;
    if (!src) return null;
    return { url: src, attribution: 'Wikipedia (' + title + ')' + (via ? ' \u2014 via ' + via : '') };
}

// B. Openverse keyword search. `scorer(candidate) -> {ok, score}` decides
// which results are trustworthy; candidate = {title, tags, creator, license, url}.
// Only the single highest-scoring match is returned - unlike the Commons
// search elsewhere in this file, there is no second, verifying request here,
// so this is deliberately the last resort in every chain that uses it.
async function photoOpenverseSearch(query, scorer, via) {
    if (!query) return null;
    const params = new URLSearchParams({ q: query, page_size: '10', mature: 'false' });
    const data = await photoFetchJson('https://api.openverse.org/v1/images/?' + params);
    const results = (data && data.results) || [];
    let best = null;
    for (const r of results) {
        const cand = {
            title: String(r.title || ''),
            tags: (r.tags || []).map(function (t) { return String((t && t.name) || t || ''); }),
            creator: String(r.creator || ''),
            license: r.license ? (r.license + (r.license_version ? ' ' + r.license_version : '')).toUpperCase() : '',
            url: String(r.thumbnail || r.url || ''),
        };
        if (!/^https:\/\//.test(cand.url)) continue;
        const s = scorer(cand);
        if (s && s.ok && (!best || s.score > best.score)) best = { cand: cand, score: s.score };
    }
    if (!best) return null;
    const c = best.cand;
    const attribution = ((c.creator ? c.creator + ' ' : '') + (c.license ? '(' + c.license + ') ' : '') +
        '\u2014 via ' + (via || 'Openverse')).trim();
    return { url: c.url, attribution: attribution };
}

// Vessel photo lookup
// ============================================================================
// Replaces the old commonsVesselPhoto(name), which took the single top result of
// a Commons title search on the ship's name. That was unreliable in two ways:
//
//   * WRONG / NO photo: the top hit could be a flag, a logo, an SVG, or a
//     different vessel (or a non-ship) that merely shares the name. Nothing
//     was checked, and the IMO number - which identifies a hull uniquely -
//     was never used.
//   * FLAKY: any non-OK response (429 / 5xx) was cached as "no image" for the
//     rest of the page session, while network errors were retried on every
//     refresh tick (refreshSelected() runs this constantly).
//
// Strategy, in order (each tier only runs if every earlier one found nothing):
//   1. IMO -> Wikidata (P458 "IMO ship number") -> its P18 image. Exact match.
//   1b. Same IMO-confirmed Wikidata item(s), but its English Wikipedia
//      infobox image instead (see the shared helpers above), for when the
//      item exists but carries no P18.
//   2. Commons search by IMO number and by ship name (top 12 each). This first
//      request is deliberately LIGHT - titles + categories only, no image info -
//      because asking for image info + licence metadata on 12 files at once is
//      slow enough to trip the timeout. Every candidate is scored, and only
//      plausible ones survive:
//        - must be a .jpg/.png/.webp (no SVG flags/logos, PDFs, etc.)
//        - title must not look like a flag/logo/map/drawing/...
//        - must match the IMO, OR match the ship name AND show ship evidence
//          (a ship-ish word in the title or in one of its Commons categories)
//        - rejected if it names a *different* valid IMO number
//   3. Only the best <= 3 survivors get a second, small request for their
//      thumbnail URL + licence/author, and are re-checked (real mime type,
//      not tiny).
//   4. Openverse (Wikimedia Commons + Flickr + others, free-text search) -
//      last resort, using the same IMO/name evidence rules as step 2.
// A wrong photo is worse than no photo, so this is deliberately conservative.
//
// Result handling:
//   found            -> cached for the session
//   definitively none-> cached for VESSEL_PHOTO_NEGATIVE_TTL_MS
//   transient failure-> NOT cached as "none"; retried after a short cooldown
// Diagnostics: type  vesselPhotoDebug = true  in the browser console (or set
// VESSEL_PHOTO_DEBUG below) to log every request with its timing, and every
// candidate with why it was kept or rejected. vesselPhotoTest('Ship Name', imo)
// runs a lookup by hand, bypassing the cache.

const VESSEL_PHOTO_DEBUG = false;
const VESSEL_PHOTO_THUMB_WIDTH = 330;                  // a standard Wikimedia thumbnail step
const VESSEL_PHOTO_TIMEOUT_MS = 3000;
const VESSEL_PHOTO_RETRY_COOLDOWN_MS = 30 * 1000;      // after a transient lookup failure
const VESSEL_PHOTO_IMAGE_RETRY_MS = 5 * 60 * 1000;     // after every candidate <img> failed to load
const VESSEL_PHOTO_NEGATIVE_TTL_MS = 60 * 60 * 1000;   // definitive "no photo" answers
const VESSEL_PHOTO_MAX_CACHE = 500;
const VESSEL_PHOTO_MAX_RESULTS = 3;

const VESSEL_PHOTO_MIME_OK = new Set(['image/jpeg', 'image/png', 'image/webp']);
const VESSEL_PHOTO_NON_PHOTO_RE = /\b(FLAGS?|LOGO|MAPS?|ICON|DIAGRAM|PLANS?|DRAWING|STAMP|POSTCARD|EMBLEM|BADGE|SIGNATURE|PAINTING|SCREENSHOT|CHART|SCHEMATIC|BLUEPRINT|PLAQUE|COIN|MEDAL|MODEL)\b/;
const VESSEL_PHOTO_SHIP_RE = /\b(SHIPS?|VESSELS?|MV|MS|MT|SS|FERRY|FERRIES|TANKERS?|BULK|TUGS?|TUGBOATS?|YACHTS?|BOATS?|IMO|LINERS?|TRAWLERS?|FREIGHTERS?|BARGES?|DREDGERS?|LIFEBOATS?|STEAMSHIPS?|SHIPPING)\b/;

// Placeholder names people put in AIS static data - searching for these
// only ever returns unrelated pictures.
const VESSEL_PHOTO_JUNK_NAMES = new Set([
    'UNKNOWN', 'NO NAME', 'NONAME', 'NONE', 'TBN', 'TBA', 'TEST', 'NA', 'N A',
    'SHIP', 'BOAT', 'VESSEL', 'YACHT', 'FISHING', 'FISHING VESSEL', 'SAILING VESSEL',
    'PILOT', 'TUG', 'SAR', 'PLEASURE CRAFT', 'PLEASURECRAFT', 'WORKBOAT', 'WORK BOAT',
    'SPARE', 'RESERVED'
]);
// Not ships: no point looking up a "photo" for these.
const VESSEL_PHOTO_SKIP_TYPES = new Set(['Aids to Navigation', 'Land Base Station', 'Coast Station']);

const vesselPhotoResults = new Map();   // key -> { result, expires }
const vesselPhotoInflight = new Map();  // key -> Promise
const vesselPhotoCooldown = new Map();  // key -> timestamp before which we don't retry after a transient failure

function vesselPhotoLog() {
    // console.log, not console.debug: Chrome hides "debug" under the Verbose filter.
    if (VESSEL_PHOTO_DEBUG || window.vesselPhotoDebug)
        console.log.apply(console, ['[vessel-photo]'].concat(Array.prototype.slice.call(arguments)));
}

// IMO numbers carry a check digit: sum(d1..d6 * 7..2) mod 10 == d7.
// Garbage / spoofed values in the AIS IMO field are common.
function isValidImo(value) {
    const s = String(value == null ? '' : value).trim();
    if (!/^[1-9]\d{6}$/.test(s)) return false;
    let sum = 0;
    for (let i = 0; i < 6; i++) sum += Number(s[i]) * (7 - i);
    return sum % 10 === Number(s[6]);
}

// Upper-case, strip accents / punctuation / AIS '@' padding, collapse spaces.
function normaliseVesselText(raw) {
    return String(raw == null ? '' : raw)
        .replace(/@/g, ' ')
        .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, ' ')
        .trim();
}

function usableVesselName(raw) {
    const n = normaliseVesselText(raw);
    if (n.length < 3) return '';
    if (/^[0-9 ]+$/.test(n)) return '';
    if (VESSEL_PHOTO_JUNK_NAMES.has(n)) return '';
    return n;
}

// What we can actually look a vessel up by. null => nothing worth searching for.
// The key includes the name when there's no IMO, so the lookup re-runs if the
// static-data message carrying the name / IMO only arrives after selection.
function vesselPhotoIdentity(vessel) {
    if (!vessel) return null;
    if (VESSEL_PHOTO_SKIP_TYPES.has(vessel.typeDescription)) return null;
    const mmsi = String(vessel.icao || '').replace(/^MMSI/i, '');
    const imo = isValidImo(vessel.imo) ? String(vessel.imo).trim() : null;
    const name = usableVesselName(vessel.registration);
    if (!imo && !name) return null;
    return { key: imo ? 'imo:' + imo : 'mmsi:' + mmsi + ':' + name, imo: imo, mmsi: mmsi, name: name };
}

// Strip tags AND decode entities (Commons "Artist" is HTML, often with &amp; etc).
function vesselPhotoHtmlToText(html) {
    if (!html) return '';
    let text;
    try {
        text = new DOMParser().parseFromString(String(html), 'text/html').body.textContent;
    } catch (e) {
        text = String(html).replace(/<[^>]+>/g, '');
    }
    return (text || '').replace(/\s+/g, ' ').trim();
}

function vesselPhotoFromImageInfo(info, via) {
    if (!info) return null;
    const url = info.thumburl || info.url;
    // Only ever put a Wikimedia CDN URL into the page.
    if (!url || !/^https:\/\/upload\.wikimedia\.org\//.test(url)) return null;
    const meta = info.extmetadata || {};
    let artist = meta.Artist ? vesselPhotoHtmlToText(meta.Artist.value) : '';
    if (artist.length > 80) artist = artist.slice(0, 79) + '\u2026';
    const license = meta.LicenseShortName ? vesselPhotoHtmlToText(meta.LicenseShortName.value) : '';
    const attribution = artist
        ? artist + (license ? ' \u2014 ' + license : '') + ' \u2014 via ' + via
        : via;
    return { url: url, attribution: attribution };
}

// fetch + JSON with a timeout, one retry for transient failures (network error,
// timeout, HTTP 429/5xx, or a MediaWiki API-level error such as "ratelimited"),
// and a hard throw if it still fails - callers must not mistake that for "no photo".
async function vesselPhotoFetchJson(url) {
    let lastError = null;
    for (let attempt = 0; attempt < 2; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(function () { controller.abort(); }, VESSEL_PHOTO_TIMEOUT_MS);
        const started = Date.now();
        const logRequest = function (err) {
            vesselPhotoLog('request', (Date.now() - started) + 'ms', err ? 'FAILED: ' + (err.message || err.name) : 'ok',
                url.replace(/^https:\/\//, '').slice(0, 110));
        };
        let retryable = true;
        try {
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) {
                lastError = new Error('HTTP ' + response.status);
                retryable = response.status === 429 || response.status >= 500;
            } else {
                const data = await response.json();
                if (data && data.error) {
                    lastError = new Error('API ' + (data.error.code || 'error'));
                } else {
                    logRequest(null);
                    return data;
                }
            }
        } catch (error) {
            lastError = error;
        } finally {
            clearTimeout(timer);
        }
        logRequest(lastError);
        if (!retryable) break;
        if (attempt === 0) await new Promise(function (resolve) { setTimeout(resolve, 700); });
    }
    throw lastError;
}

async function vesselPhotoFromCommonsTitle(fileTitle) {
    const params = new URLSearchParams({
        action: 'query', format: 'json', origin: '*',
        titles: fileTitle,
        prop: 'imageinfo',
        iiprop: 'url|extmetadata',
        iiurlwidth: String(VESSEL_PHOTO_THUMB_WIDTH),
        iiextmetadatafilter: 'Artist|LicenseShortName'
    });
    const data = await vesselPhotoFetchJson('https://commons.wikimedia.org/w/api.php?' + params);
    const page = Object.values((data.query && data.query.pages) || {})[0];
    return vesselPhotoFromImageInfo(page && page.imageinfo && page.imageinfo[0], 'Wikimedia Commons / Wikidata');
}

// Image info (thumbnail URL, licence, author) for a few files at once.
// Returns Map(canonical file title -> imageinfo).
async function vesselPhotoImageInfos(fileTitles) {
    const params = new URLSearchParams({
        action: 'query', format: 'json', origin: '*',
        titles: fileTitles.join('|'),
        prop: 'imageinfo',
        iiprop: 'url|mime|size|extmetadata',
        iiurlwidth: String(VESSEL_PHOTO_THUMB_WIDTH),
        iiextmetadatafilter: 'Artist|LicenseShortName'
    });
    const data = await vesselPhotoFetchJson('https://commons.wikimedia.org/w/api.php?' + params);
    const byTitle = new Map();
    Object.values((data.query && data.query.pages) || {}).forEach(function (p) {
        if (p && p.title && p.imageinfo && p.imageinfo[0]) byTitle.set(p.title, p.imageinfo[0]);
    });
    return byTitle;
}

// Post-check on the real image info (the first-stage search only had file names).
function vesselPhotoInfoProblem(info) {
    if (!info) return 'no imageinfo';
    if (!VESSEL_PHOTO_MIME_OK.has(info.mime)) return 'mime ' + info.mime;
    if (info.width && info.width < 250) return 'too small';
    return null;
}

// Step 1: exact, by IMO number (Wikidata P458 -> P18). Returns every QID that
// carries this exact IMO ({photo: null} if none of them also has a usable
// P18), so a P18-less-but-IMO-confirmed item can still be tried against its
// Wikipedia infobox image in findVesselPhotos() below.
async function vesselWikidataMatch(imo) {
    const searchParams = new URLSearchParams({
        action: 'query', format: 'json', origin: '*',
        list: 'search',
        srsearch: 'haswbstatement:P458=' + imo,
        srlimit: '3'   // a few, in case of duplicate items for the same hull
    });
    const searchData = await vesselPhotoFetchJson('https://www.wikidata.org/w/api.php?' + searchParams);
    const qids = ((searchData.query && searchData.query.search) || [])
        .map(function (r) { return r.title; })
        .filter(function (t) { return /^Q\d+$/.test(t); });
    if (!qids.length) return { photo: null, qids: [] };

    const entityParams = new URLSearchParams({
        action: 'wbgetentities', format: 'json', origin: '*',
        ids: qids.join('|'),
        props: 'claims'
    });
    const entityData = await vesselPhotoFetchJson('https://www.wikidata.org/w/api.php?' + entityParams);

    for (const qid of qids) {
        const claims = (((entityData.entities || {})[qid] || {}).claims || {}).P18 || [];
        const usable = claims.filter(function (c) {
            return c.rank !== 'deprecated' && c.mainsnak && c.mainsnak.datavalue && c.mainsnak.datavalue.value;
        });
        const best = usable.find(function (c) { return c.rank === 'preferred'; }) || usable[0];
        if (!best) continue;
        const photo = await vesselPhotoFromCommonsTitle('File:' + best.mainsnak.datavalue.value);
        if (photo) return { photo: photo, qids: qids };
    }
    return { photo: null, qids: qids };
}

// Step 2: raw Commons search - LIGHT: titles + visible categories only.
// Returns candidates in search-relevance order.
async function vesselPhotoCommonsSearch(searchText) {
    const params = new URLSearchParams({
        action: 'query', format: 'json', origin: '*',
        generator: 'search',
        gsrnamespace: '6',
        gsrlimit: '12',
        gsrsearch: searchText,
        prop: 'categories',
        cllimit: 'max',
        clshow: '!hidden'
    });
    const data = await vesselPhotoFetchJson('https://commons.wikimedia.org/w/api.php?' + params);
    const pages = Object.values((data.query && data.query.pages) || {});
    pages.sort(function (a, b) { return (a.index || 0) - (b.index || 0); });
    return pages.map(function (p) {
        return {
            title: p.title || '',
            categories: (p.categories || []).map(function (c) {
                return normaliseVesselText(String(c.title || '').replace(/^Category:/i, ''));
            })
        };
    });
}

function vesselPhotoHasPhrase(haystack, needle) {
    return !!needle && (' ' + haystack + ' ').indexOf(' ' + needle + ' ') !== -1;
}

// Decide whether a Commons file is plausibly a photo of THIS vessel.
function scoreVesselPhotoCandidate(cand, id, fromImoSearch) {
    const reject = function (reason) { return { ok: false, reason: reason }; };
    if (!/\.(jpe?g|png|webp)$/i.test(cand.title)) return reject('file type');

    const title = normaliseVesselText(String(cand.title).replace(/^File:/i, '').replace(/\.[A-Za-z0-9]+$/, ''));
    if (VESSEL_PHOTO_NON_PHOTO_RE.test(title)) return reject('non-photo title');

    const cats = cand.categories || [];

    // Wrong-hull guard: the title/categories name a DIFFERENT valid IMO number
    // (only numbers introduced by "IMO", so camera file numbers can't trigger it).
    if (id.imo) {
        const others = (title + ' ' + cats.join(' ')).match(/\bIMO ?\d{7}\b/g) || [];
        if (others.some(function (m) { const n = m.replace(/\D/g, ''); return n !== id.imo && isValidImo(n); })) {
            return reject('different IMO');
        }
    }

    const imoMatch = !!id.imo && (vesselPhotoHasPhrase(title, id.imo) ||
        cats.some(function (c) { return vesselPhotoHasPhrase(c, id.imo); }));
    const nameInTitle = vesselPhotoHasPhrase(title, id.name);
    const nameMatch = nameInTitle || cats.some(function (c) { return vesselPhotoHasPhrase(c, id.name); });
    const shipEvidence = VESSEL_PHOTO_SHIP_RE.test(title) ||
        cats.some(function (c) { return VESSEL_PHOTO_SHIP_RE.test(c); });

    if (imoMatch) return { ok: true, score: 100 };
    if (fromImoSearch && shipEvidence) return { ok: true, score: 80 };
    if (nameMatch && shipEvidence) return { ok: true, score: 50 + (nameInTitle ? 10 : 0) };
    return reject(nameMatch ? 'name matches but no ship evidence' : 'no name/IMO match');
}

// Resolves to an array of up to VESSEL_PHOTO_MAX_RESULTS photos (possibly empty
// = definitively no photo). THROWS if nothing was found and any step failed, so
// the caller treats it as transient rather than caching "no image".
async function findVesselPhotos(id) {
    const photos = [];
    const seen = new Set();
    const add = function (p) {
        if (p && !seen.has(p.url) && photos.length < VESSEL_PHOTO_MAX_RESULTS) {
            seen.add(p.url);
            photos.push(p);
        }
    };
    let lastError = null;
    const attempt = async function (fn) {
        try {
            return await fn();
        } catch (e) {
            lastError = e;
            vesselPhotoLog('step failed:', e && e.message);
            return null;
        }
    };

    // 1. Exact, by IMO.
    let imoQids = [];
    if (id.imo) {
        const match = await attempt(function () { return vesselWikidataMatch(id.imo); });
        vesselPhotoLog('wikidata', id.imo, match && match.photo ? match.photo.url : 'no P18 image');
        if (match) {
            add(match.photo);
            imoQids = match.qids;
        }
    }

    // 1b. Wikipedia infobox image for an IMO-confirmed Wikidata item that has
    // no P18. Still an exact match - these qids came from the IMO search
    // above, never from a name search - just a different field on the same
    // confirmed item.
    if (!photos.length && imoQids.length) {
        for (const qid of imoQids) {
            const photo = await attempt(function () { return photoWikipediaLeadImage(qid, 'Wikipedia / Wikidata'); });
            vesselPhotoLog('wikipedia-infobox', qid, photo ? photo.url : 'no image');
            if (photo) { add(photo); break; }
        }
    }

    // 2. Commons search + scoring.
    if (!photos.length) {
        const best = new Map();   // title -> best-scoring candidate (both searches can return the same file)
        const consider = function (cands, fromImoSearch) {
            (cands || []).forEach(function (cand, i) {
                const s = scoreVesselPhotoCandidate(cand, id, fromImoSearch);
                vesselPhotoLog(s.ok ? 'KEEP  ' : 'reject', cand.title, s.ok ? s.score : '(' + s.reason + ')');
                const prev = best.get(cand.title);
                if (s.ok && (!prev || s.score > prev.score)) best.set(cand.title, { cand: cand, score: s.score, order: i });
            });
        };

        const first = [];
        if (id.imo) {
            first.push(attempt(function () { return vesselPhotoCommonsSearch(id.imo); })
                .then(function (c) { consider(c, true); }));
        }
        if (id.name) {
            first.push(attempt(function () { return vesselPhotoCommonsSearch('intitle:"' + id.name + '"'); })
                .then(function (c) { consider(c, false); }));
        }
        await Promise.all(first);

        // 3. Thumbnails + licence for the best few only.
        const shortlist = Array.from(best.values())
            .sort(function (a, b) { return (b.score - a.score) || (a.order - b.order); })
            .slice(0, VESSEL_PHOTO_MAX_RESULTS);
        if (shortlist.length) {
            const infos = await attempt(function () {
                return vesselPhotoImageInfos(shortlist.map(function (s) { return s.cand.title; }));
            });
            (infos ? shortlist : []).forEach(function (s) {
                const info = infos.get(s.cand.title);
                const problem = vesselPhotoInfoProblem(info);
                vesselPhotoLog(problem ? 'drop  ' : 'use   ', s.cand.title, problem ? '(' + problem + ')' : '');
                if (!problem) add(vesselPhotoFromImageInfo(info, 'Wikimedia Commons'));
            });
        }
    }

    // 4. Last resort: Openverse (Commons + Flickr, free-text search - see the
    // module comment above the shared helpers for why this runs last and
    // only accepts scored matches).
    //
    // IMPORTANT: Openverse failures are recorded separately from lastError,
    // NOT merged into it. lastError controls whether an empty result gets
    // reported as a confident "no photo" (cached for an hour) or as a
    // transient "error" (retried soon, never cached as none) - see
    // lookupVesselPhoto() below. Openverse is the newest, most optional tier:
    // if the authoritative steps above (Wikidata/Commons) already completed
    // cleanly and simply found nothing, an unrelated Openverse outage must
    // not retroactively turn that solid "no photo" into "error" and start
    // hammering every one of these vessels every 30 seconds.
    let openverseError = null;
    if (!photos.length) {
        const vesselOpenverseScorer = function (cand) {
            const text = normaliseVesselText(cand.title + ' ' + cand.tags.join(' '));
            if (VESSEL_PHOTO_NON_PHOTO_RE.test(text)) return { ok: false };
            const imoEvidence = !!id.imo && vesselPhotoHasPhrase(text, id.imo);
            const nameEvidence = !!id.name && vesselPhotoHasPhrase(text, id.name);
            const shipEvidence = VESSEL_PHOTO_SHIP_RE.test(text);
            if (imoEvidence) return { ok: true, score: 100 };
            if (nameEvidence && shipEvidence) return { ok: true, score: 50 };
            return { ok: false };
        };
        const attemptOpenverse = async function (query) {
            try {
                return await photoOpenverseSearch(query, vesselOpenverseScorer, 'Openverse');
            } catch (e) {
                openverseError = e;
                vesselPhotoLog('step failed:', e && e.message);
                return null;
            }
        };
        if (id.imo) {
            const photo = await attemptOpenverse(id.imo);
            vesselPhotoLog('openverse(imo)', id.imo, photo ? photo.url : 'no match');
            add(photo);
        }
        if (!photos.length && id.name) {
            const photo = await attemptOpenverse(id.name);
            vesselPhotoLog('openverse(name)', id.name, photo ? photo.url : 'no match');
            add(photo);
        }
    }

    if (!photos.length && lastError) throw lastError;   // don't let a failure masquerade as "no photo"
    return photos;
}

// Synchronous peek at a still-valid cached result (or null).
function vesselPhotoCachedResult(id) {
    const cached = vesselPhotoResults.get(id.key);
    return (cached && cached.expires > Date.now()) ? cached.result : null;
}

// Cached, de-duplicated lookup. Never rejects; resolves to one of
//   { status: 'found', photos: [...] }
//   { status: 'none' }
//   { status: 'error', retryAt: <ms timestamp> }
function lookupVesselPhoto(id) {
    const now = Date.now();

    const cached = vesselPhotoResults.get(id.key);
    if (cached && cached.expires > now) return Promise.resolve(cached.result);

    const cooldownUntil = vesselPhotoCooldown.get(id.key);
    if (cooldownUntil && cooldownUntil > now) {
        return Promise.resolve({ status: 'error', retryAt: cooldownUntil });
    }

    if (vesselPhotoInflight.has(id.key)) return vesselPhotoInflight.get(id.key);

    const promise = (async function () {
        try {
            vesselPhotoLog('lookup', id.key, 'imo=' + id.imo, 'name=' + id.name);
            const photos = await findVesselPhotos(id);
            vesselPhotoLog('lookup', id.key, '->', photos.length ? photos.length + ' photo(s)' : 'none');
            const result = photos.length ? { status: 'found', photos: photos } : { status: 'none' };
            vesselPhotoResults.delete(id.key);
            vesselPhotoResults.set(id.key, {
                result: result,
                expires: photos.length ? Infinity : Date.now() + VESSEL_PHOTO_NEGATIVE_TTL_MS
            });
            while (vesselPhotoResults.size > VESSEL_PHOTO_MAX_CACHE) {
                vesselPhotoResults.delete(vesselPhotoResults.keys().next().value);
            }
            return result;
        } catch (error) {
            const retryAt = Date.now() + VESSEL_PHOTO_RETRY_COOLDOWN_MS;
            vesselPhotoCooldown.set(id.key, retryAt);
            vesselPhotoLog('lookup failed, cooling down:', error && error.message);
            return { status: 'error', retryAt: retryAt };
        } finally {
            vesselPhotoInflight.delete(id.key);
        }
    })();

    vesselPhotoInflight.set(id.key, promise);
    return promise;
}

// ---- Panel state -----------------------------------------------------------
// refreshSelected() calls displayPhoto() on every refresh, so this must be cheap
// when nothing has changed, must never leave the previous vessel's photo up
// while a new lookup is running, and must recover if the panel was overwritten
// (e.g. an aircraft was selected in between) while our state says "photo".

let vesselPhotoShown = { key: null, state: null, retryAt: 0, photos: [], index: 0 };

function vesselPhotoOnScreen(key) {
    const container = document.getElementById('selected_photo');
    const el = container && container.firstElementChild;
    return !!(el && el.dataset && el.dataset.vesselKey === key);
}

function renderVesselPhoto(st) {
    const p = st.photos[st.index];
    setPhotoHtml(
        '<img id="airplanePhoto" data-vessel-key="' + escapeHtml(st.key) + '" src="' + escapeHtml(p.url) +
        '" style="width:171px;" onerror="vesselPhotoImageFailed();">'
    );
    setCopyrightHtml('<span>Image \u00a9 ' + escapeHtml(p.attribution) + '</span>');
}

function drawVesselPhotoState(st) {
    if (st.state === 'photo') {
        renderVesselPhoto(st);
    } else if (st.state === 'none') {
        displayVesselNoImage(st.key, st.failed ? 'Vessel image lookup failed - retrying' : null);
    } else {
        setPhotoHtml('<p data-vessel-key="' + escapeHtml(st.key) + '">Searching for image...</p>');
        setCopyrightHtml('');
    }
    adjustInfoBlock();
}

// <img onerror>: this candidate didn't load (hotlink/CDN hiccup) - try the next one.
function vesselPhotoImageFailed() {
    const st = vesselPhotoShown;
    if (st.state !== 'photo') return;
    st.index++;
    if (st.index < st.photos.length) {
        renderVesselPhoto(st);
    } else {
        st.state = 'none';
        st.failed = false;
        st.retryAt = Date.now() + VESSEL_PHOTO_IMAGE_RETRY_MS;
        displayVesselNoImage(st.key);
    }
    adjustInfoBlock();
}

function applyVesselPhotoResult(st, result) {
    st.failed = false;
    if (result.status === 'found') {
        st.state = 'photo';
        st.photos = result.photos;
        st.index = 0;
    } else {
        st.state = 'none';
        st.failed = result.status === 'error';   // the lookup itself failed (timeout / rate limit) - not the same as "no photo exists"
        st.retryAt = st.failed ? result.retryAt : Infinity;
    }
}

function displayVesselPhoto(vessel) {
    const id = vesselPhotoIdentity(vessel);
    const key = id ? id.key : 'skip:' + (vessel.icao || '');
    let st = vesselPhotoShown;
    let needsLookup = false;

    if (st.key !== key) {
        st = vesselPhotoShown = { key: key, state: 'loading', retryAt: 0, photos: [], index: 0 };
        const cached = id && vesselPhotoCachedResult(id);
        if (cached) {                       // already known: paint straight away, no "Loading..." flash
            applyVesselPhotoResult(st, cached);
            drawVesselPhotoState(st);
            return;
        }
        needsLookup = true;
        drawVesselPhotoState(st);
    } else if (!vesselPhotoOnScreen(key)) {
        drawVesselPhotoState(st);   // same vessel, panel was overwritten in between
    }

    if (!needsLookup) {
        if (st.state === 'photo' || st.state === 'loading') return;
        if (st.state === 'none' && Date.now() < st.retryAt) return;
        st.state = 'loading';       // retry is due; keep the current text on screen meanwhile
    }

    if (!id) {                      // nothing usable to search for
        st.state = 'none';
        st.retryAt = Infinity;
        drawVesselPhotoState(st);
        return;
    }

    lookupVesselPhoto(id).then(function (result) {
        if (vesselPhotoShown !== st) return;   // superseded by another vessel
        applyVesselPhotoResult(st, result);
        if (SelectedPlane === vessel) drawVesselPhotoState(st);
    });
}

// Console helper for diagnosing a lookup by hand (bypasses the cache):
//     await vesselPhotoTest('King Seaways', 8502406)      // IMO optional
// Logs every request (with timing) and every candidate (kept / rejected and why).
async function vesselPhotoTest(name, imo) {
    const id = vesselPhotoIdentity({ icao: 'MMSI000000000', registration: name, imo: imo });
    if (!id) {
        console.log('[vessel-photo] nothing to look up: name/IMO unusable (junk name, or invalid IMO check digit)');
        return null;
    }
    const before = window.vesselPhotoDebug;
    window.vesselPhotoDebug = true;
    try {
        const photos = await findVesselPhotos(id);
        console.log('[vessel-photo] result:', photos);
        return photos;
    } catch (error) {
        console.log('[vessel-photo] lookup FAILED (a real failure, not "no photo"):', error);
        return null;
    } finally {
        window.vesselPhotoDebug = before;
    }
}

const satellitePhotoCache = new Map();

// Looks up a satellite's photo by its exact NORAD Catalog Number, via Wikidata
// property P377 ("Satellite Catalog Number") - NOT by searching Commons for the
// satellite's name. The name the SBS feeder carries is stripped to 8 alphanumeric
// characters (see app.js), which is frequently ambiguous or truncated in a way
// that loses the identifying part (e.g. "INTELSAT39" -> "INTELSAT", "COSMOS2251"
// -> "COSMOS22") - a text search on that would confidently return images of the
// WRONG satellite. Matching on the catalog number instead is an exact, unambiguous
// identifier: either Wikidata has an item with that precise P377 value, or it
// doesn't, with no room for a plausible-looking wrong match in between.
//
// Chain, each tier only tried if the previous one found nothing:
//   1. Search Wikidata for the item with P377 == this exact NORAD ID.
//   2. Fetch that item's claims + English label + enwiki sitelink together (one
//      request), and read its P18 (image) statement.
//   3. If P18 resolves to an actual Commons file, use it (same
//      imageinfo/extmetadata pattern vesselPhotoFromCommonsTitle() uses).
//   4. Otherwise, the item's own Wikipedia infobox image (photoWikipediaLeadImage,
//      shared with the vessel lookup above) - still the same P377-confirmed item,
//      just a different field on it.
//   5. Last resort: Openverse, searched on the item's OWN Wikidata label - NEVER
//      on the raw feeder name, which is frequently truncated/ambiguous (see the
//      comment above this function). Only accepted if the result's own title/tags
//      repeat that exact label AND look space-related, since this is the one tier
//      with no hard identifier behind it.
async function wikidataSatellitePhoto(noradId) {
  if (noradId == null) return null;

  const key = String(noradId);
  if (satellitePhotoCache.has(key)) {
    return satellitePhotoCache.get(key);
  }

  const request = (async () => {
    // P377 is stored as a zero-padded 5-digit string ('00266', '25544', ...).
    // Only pad up to 5 digits - newer 6+ digit Alpha-5/GP catalog numbers are
    // not zero-padded in Wikidata, so padding those further would break the match.
    const catalogNumber = String(noradId).padStart(5, '0');

    const searchParams = new URLSearchParams({
      action: "query",
      format: "json",
      origin: "*",
      list: "search",
      srsearch: `haswbstatement:P377=${catalogNumber}`,
      srlimit: "1",
    });
    const searchResp = await fetch("https://www.wikidata.org/w/api.php?" + searchParams);
    if (!searchResp.ok) return null;
    const searchData = await searchResp.json();
    const qid = searchData.query?.search?.[0]?.title;
    if (!qid) return null; // no Wikidata item carries this exact catalog number

    const entityParams = new URLSearchParams({
      action: "wbgetentities",
      format: "json",
      origin: "*",
      ids: qid,
      props: "claims|labels|sitelinks",
      languages: "en",
      sitefilter: "enwiki",
    });
    const entityResp = await fetch("https://www.wikidata.org/w/api.php?" + entityParams);
    if (!entityResp.ok) return null;
    const entityData = await entityResp.json();
    const entity = entityData.entities?.[qid];
    const filename = entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;

    if (filename) {
      const imageParams = new URLSearchParams({
        action: "query",
        format: "json",
        origin: "*",
        titles: "File:" + filename,
        prop: "imageinfo",
        iiprop: "url|extmetadata",
        iiurlwidth: "342",
        iiextmetadatafilter: "Artist|LicenseShortName",
      });
      const imageResp = await fetch("https://commons.wikimedia.org/w/api.php?" + imageParams);
      if (imageResp.ok) {
        const imageData = await imageResp.json();
        const page = Object.values(imageData.query?.pages || {})[0];
        const info = page?.imageinfo?.[0];
        const url = info?.thumburl || info?.url;
        if (url) {
          const meta = info.extmetadata || {};
          const artist = meta.Artist ? meta.Artist.value.replace(/<[^>]+>/g, '').trim() : null;
          const license = meta.LicenseShortName ? meta.LicenseShortName.value : null;
          const attribution = artist
              ? `${artist}${license ? ' — ' + license : ''} — via Wikimedia Commons / Wikidata`
              : 'Wikimedia Commons / Wikidata';
          return { url, attribution };
        }
      }
      // falls through: matched, but the P18 file didn't resolve to a usable image
    }

    // 4. No usable P18: the QID is still an exact P377 match, so its own
    // English Wikipedia infobox image is a safe next try.
    if (entity?.sitelinks?.enwiki?.title) {
      const photo = await photoWikipediaLeadImage(qid, 'Wikipedia / Wikidata').catch(() => null);
      if (photo) return photo;
    }

    // 5. Openverse, searched on the CONFIRMED Wikidata label, not the feed name.
    const label = entity?.labels?.en?.value;
    if (label) {
      const scorer = (cand) => {
        const text = (cand.title + ' ' + cand.tags.join(' ')).toUpperCase();
        if (text.indexOf(label.toUpperCase()) === -1) return { ok: false };
        if (!/\b(SATELLITE|SPACECRAFT|ORBIT|ORBITER|PROBE|ROCKET|LAUNCH|SPACE STATION|ISS)\b/.test(text)) return { ok: false };
        return { ok: true, score: 100 };
      };
      const photo = await photoOpenverseSearch(label, scorer, 'Openverse').catch(() => null);
      if (photo) return photo;
    }

    return null;
  })();

  satellitePhotoCache.set(key, request);

  try {
    return await request;
  } catch (error) {
    satellitePhotoCache.delete(key);
    throw error;
  }
}

// format_altitude_*() and adjust_baro_alt() are meant for aircraft-scale
// altitude only - see the NaN risk noted where this function is called from -
// so satellites need this dedicated formatter entirely, never touching that
// pipeline. Mirrors the same three DisplayUnits conventions used elsewhere in
// this file (e.g. the site-circle distance conversion) rather than inventing
// a new unit convention for this one field.
//
// Takes the TRUE altitude in feet directly - satellites now arrive over
// their own direct JSON feed (app.js), which already reports real units;
// there is no wire-format scaling to undo any more (the old SAT_ALT_SCALE
// divide-by-5000 existed only to survive transmission disguised as an
// aircraft's SBS altitude field, which no longer happens at all).
function formatSatelliteAltitude(altitudeFt) {
    if (altitudeFt == null || !Number.isFinite(altitudeFt)) return "n/a";
    const km = altitudeFt / 3280.84;
    if (DisplayUnits === "nautical") {
        return Math.round(km / 1.852).toLocaleString() + ' nmi';
    } else if (DisplayUnits === "imperial") {
        return Math.round(km / 1.609).toLocaleString() + ' mi';
    } else {
        return Math.round(km).toLocaleString() + ' km';
    }
}

// Simple altitude-banded orbit classification, in the same spirit as the
// category system - not a substitute for real orbital mechanics (eccentric/
// highly-elliptical orbits genuinely don't fit cleanly into one band at all
// altitudes along their path), just a plain-text label matching the common
// industry shorthand for "roughly what kind of orbit is this".
//   < 2,000km             -> Low Earth Orbit
//   2,000km - 35,586km    -> Medium Earth Orbit
//   35,586km - 35,986km   -> Geostationary  (35,786km +/- 200km)
//   > 35,986km            -> High Earth Orbit
function getSatelliteOrbitClass(altitudeKm) {
    if (altitudeKm == null || !Number.isFinite(altitudeKm)) return "n/a";
    if (altitudeKm < 2000) return "Low Earth Orbit";
    if (altitudeKm < 35586) return "Medium Earth Orbit";
    if (altitudeKm < 35986) return "Geostationary";
    return "High Earth Orbit";
}

// Straight from the true altitude (feet) to the orbit label.
function formatSatelliteOrbit(altitudeFt) {
    if (altitudeFt == null || !Number.isFinite(altitudeFt)) return "n/a";
    return getSatelliteOrbitClass(altitudeFt / 3280.84);
}

// Orbit class worked out by the satellite server from the whole orbit (see
// classifyOrbit() in app.js), so an elliptical orbit keeps one label all the
// way round. Falls back to the altitude band above when it isn't available.
const SAT_ORBIT_CLASS_NAMES = {
    LEO: 'Low Earth Orbit',
    MEO: 'Medium Earth Orbit',
    GEO: 'Geostationary',
    GSO: 'Geosynchronous',
    HEO: 'Highly Elliptical',
    HIGH: 'High Earth Orbit',
};
// How old an element set can get before the plotted position may be visibly
// off. Drag makes low orbits drift quickly; above a few thousand km there is
// none, so SGP4 stays close for weeks. HEO is in between: its low perigee
// still dips into the atmosphere. Unknown orbit falls back to the middle.
const SAT_TLE_STALE_DAYS = { LEO: 3, HEO: 14, MEO: 30, GEO: 30, GSO: 30, HIGH: 30 };
const SAT_TLE_STALE_DEFAULT = 7;
function satelliteTleStaleDays(plane) {
    const cls = plane && plane.satOrbit && plane.satOrbit.cls;
    return SAT_TLE_STALE_DAYS[cls] || SAT_TLE_STALE_DEFAULT;
}

function satelliteOrbitLabel(plane) {
    const o = plane && plane.satOrbit;
    if (o && o.cls && SAT_ORBIT_CLASS_NAMES[o.cls]) return SAT_ORBIT_CLASS_NAMES[o.cls];
    return formatSatelliteOrbit(plane ? plane.altitude : null);
}

// km -> number in the current display units (no unit suffix)
function satDistanceValue(km) {
    if (DisplayUnits === "nautical") return Math.round(km / 1.852).toLocaleString();
    if (DisplayUnits === "imperial") return Math.round(km / 1.609).toLocaleString();
    return Math.round(km).toLocaleString();
}
function satDistanceUnit() {
    if (DisplayUnits === "nautical") return 'nmi';
    if (DisplayUnits === "imperial") return 'mi';
    return 'km';
}

function formatOrbitPeriod(min) {
    return (min >= 600) ? (min / 60).toFixed(1) + ' h' : min.toFixed(1) + ' min';
}

// "LEO · 413 × 420 km · 51.6° · 92.9 min" - perigee × apogee, the usual
// convention. Formatted at display time so a units change applies at once.
// withClass=false leaves the class code off (the sidebar shows it separately).
function formatSatelliteOrbitSummary(plane, withClass) {
    const o = plane && plane.satOrbit;
    if (!o) return null;
    const parts = [];
    if (o.docked) parts.push('Docked');
    if (withClass && o.cls) parts.push(o.cls === 'HIGH' ? 'High orbit' : o.cls);
    if (o.perigee != null && o.apogee != null) {
        parts.push(satDistanceValue(o.perigee) + ' × ' + satDistanceValue(o.apogee) + ' ' + satDistanceUnit());
    }
    if (o.inc != null) parts.push(o.inc.toFixed(1) + '°');
    if (o.period != null) parts.push(formatOrbitPeriod(o.period));
    return parts.length ? parts.join(' · ') : null;
}

// CelesTrak OMM EPOCH: "2026-10-10T12:34:56.123456", UTC with no zone marker.
function parseOmmEpoch(str) {
    if (!str || typeof str !== 'string') return null;
    let t = str.trim().replace(/(\.\d{3})\d+/, '$1');
    if (!/[zZ]|[+-]\d\d:?\d\d$/.test(t)) t += 'Z';
    const ms = Date.parse(t);
    return Number.isFinite(ms) ? ms : null;
}

// { text: "1.4 days", stale: false }, or null when the epoch is unknown
function satelliteTleAge(plane) {
    if (!plane || plane.satEpochMs == null) return null;
    const hours = Math.max(0, (Date.now() - plane.satEpochMs) / 3600000);
    let text;
    if (hours < 1) text = Math.max(1, Math.round(hours * 60)) + ' min';
    else if (hours < 48) text = hours.toFixed(1) + ' h';
    else text = (hours / 24).toFixed(1) + ' days';
    return { text: text, days: hours / 24, stale: hours / 24 > satelliteTleStaleDays(plane) };
}

// ============================================================================
// Satellite enrichment display (owner, launch info, RCS) - CelesTrak SATCAT
// data, already fetched and merged server-side by app.js. No lookup, cache,
// or network request of any kind happens here - every field these functions
// read arrives already sitting on the ingested JSON, so this is pure
// formatting, called once per satellite per ingest cycle by processSatellite().
// ============================================================================

// CelesTrak's SATCAT "OWNER" field is a country/organisation CODE, not a
// name (e.g. "PRC", "CIS", "ESA") - table from
// https://celestrak.org/satcat/sources.php. An unrecognised code is shown
// as-is rather than guessed at - CelesTrak does add new codes over time.
const CELESTRAK_OWNER_NAMES = {
    AB: 'Arab Satellite Communications Organization',
    ABS: 'Asia Broadcast Satellite',
    AC: 'Asia Satellite Telecommunications Company (ASIASAT)',
    ALG: 'Algeria',
    ANG: 'Angola',
    ARGN: 'Argentina',
    ARM: 'Republic of Armenia',
    ASRA: 'Austria',
    AUS: 'Australia',
    AZER: 'Azerbaijan',
    BEL: 'Belgium',
    BELA: 'Belarus',
    BERM: 'Bermuda',
    BGD: 'Peoples Republic of Bangladesh',
    BHR: 'The Kingdom of Bahrain',
    BHUT: 'The Kingdom of Bhutan',
    BOL: 'Bolivia',
    BRAZ: 'Brazil',
    BUL: 'Bulgaria',
    BWA: 'Republic of Botswana',
    CA: 'Canada',
    CHBZ: 'China/Brazil',
    CHTU: 'China/Türkiye',
    CHLE: 'Chile',
    CIS: 'Commonwealth of Independent States (former USSR)',
    COL: 'Colombia',
    CRI: 'Republic of Costa Rica',
    CZCH: 'Czech Republic (former Czechoslovakia)',
    DEN: 'Denmark',
    DJI: 'Republic of Djibouti',
    ECU: 'Ecuador',
    EGYP: 'Egypt',
    ESA: 'European Space Agency',
    ESRO: 'European Space Research Organization',
    EST: 'Estonia',
    ETH: 'Ethiopia',
    EUME: 'European Organization for the Exploitation of Meteorological Satellites (EUMETSAT)',
    EUTE: 'European Telecommunications Satellite Organization (EUTELSAT)',
    FGER: 'France/Germany',
    FIN: 'Finland',
    FR: 'France',
    FRIT: 'France/Italy',
    GER: 'Germany',
    GHA: 'Republic of Ghana',
    GLOB: 'Globalstar',
    GREC: 'Greece',
    GRSA: 'Greece/Saudi Arabia',
    GUAT: 'Guatemala',
    HRV: 'Republic of Croatia',
    HUN: 'Hungary',
    IM: 'International Mobile Satellite Organization (INMARSAT)',
    IND: 'India',
    INDO: 'Indonesia',
    IRAN: 'Iran',
    IRAQ: 'Iraq',
    IRID: 'Iridium',
    IRL: 'Ireland',
    ISRA: 'Israel',
    ISRO: 'Indian Space Research Organisation',
    ISS: 'International Space Station',
    IT: 'Italy',
    ITSO: 'International Telecommunications Satellite Organization (INTELSAT)',
    JPN: 'Japan',
    KAZ: 'Kazakhstan',
    KEN: 'Republic of Kenya',
    LAOS: 'Laos',
    LKA: 'Democratic Socialist Republic of Sri Lanka',
    LTU: 'Lithuania',
    LUXE: 'Luxembourg',
    MA: 'Morocco',
    MALA: 'Malaysia',
    MCO: 'Principality of Monaco',
    MDA: 'Republic of Moldova',
    MEX: 'Mexico',
    MMR: 'Republic of the Union of Myanmar',
    MNE: 'Montenegro',
    MNG: 'Mongolia',
    MUS: 'Mauritius',
    NATO: 'North Atlantic Treaty Organization',
    NETH: 'Netherlands',
    NICO: 'New ICO',
    NIG: 'Nigeria',
    NKOR: "Democratic People's Republic of Korea",
    NOR: 'Norway',
    NPL: 'Federal Democratic Republic of Nepal',
    NZ: 'New Zealand',
    O3B: 'O3b Networks',
    ORB: 'ORBCOMM',
    PAKI: 'Pakistan',
    PERU: 'Peru',
    POL: 'Poland',
    POR: 'Portugal',
    PRC: "People's Republic of China",
    PRY: 'Republic of Paraguay',
    PRES: "People's Republic of China/European Space Agency",
    QAT: 'State of Qatar',
    RASC: 'RascomStar-QAF',
    ROC: 'Taiwan (Republic of China)',
    ROM: 'Romania',
    RP: 'Philippines (Republic of the Philippines)',
    RWA: 'Republic of Rwanda',
    SAFR: 'South Africa',
    SAUD: 'Saudi Arabia',
    SDN: 'Republic of Sudan',
    SEAL: 'Sea Launch',
    SEN: 'Republic of Senegal',
    SES: 'SES',
    SGJP: 'Singapore/Japan',
    SING: 'Singapore',
    SKOR: 'Republic of Korea',
    SLB: 'Solomon Islands',
    SPN: 'Spain',
    STCT: 'Singapore/Taiwan',
    SVN: 'Slovenia',
    SWED: 'Sweden',
    SWTZ: 'Switzerland',
    TBD: 'To Be Determined',
    THAI: 'Thailand',
    TMMC: 'Turkmenistan/Monaco',
    TUN: 'Republic of Tunisia',
    TURK: 'Türkiye',
    UAE: 'United Arab Emirates',
    UK: 'United Kingdom',
    UKR: 'Ukraine',
    UNK: 'Unknown',
    URY: 'Uruguay',
    US: 'United States',
    USBZ: 'United States/Brazil',
    VAT: 'Vatican City State',
    VENZ: 'Venezuela',
    VTNM: 'Vietnam',
    ZWE: 'Republic of Zimbabwe',
};

function celestrakOwnerName(code) {
    if (!code) return null;
    return CELESTRAK_OWNER_NAMES[code] || code;   // unrecognised code: show it verbatim, never guess
}

// Table from https://celestrak.org/satcat/satcat-format.php.
const CELESTRAK_OBJECT_TYPE_NAMES = {
    PAY: 'Payload',
    'R/B': 'Rocket Body',
    DEB: 'Debris',
    UNK: 'Unknown',
};

function celestrakObjectTypeName(code) {
    if (!code) return null;
    return CELESTRAK_OBJECT_TYPE_NAMES[code] || code;
}

// Table from https://celestrak.org/satcat/status.php.
const CELESTRAK_OPS_STATUS_NAMES = {
    '+': 'Operational',
    '-': 'Nonoperational',
    P: 'Partially Operational',
    B: 'Backup/Standby',
    S: 'Spare',
    X: 'Extended Mission',
    D: 'Decayed',
    '?': 'Unknown',
};

function celestrakOpsStatusName(code) {
    if (!code) return null;
    return CELESTRAK_OPS_STATUS_NAMES[code] || code;
}

// Radar cross-section - a rough SIZE PROXY (how big the object looks to
// ground radar), not a physical dimension measurement; CelesTrak's own docs
// describe it exactly that way. null when CelesTrak has no data for it,
// never a fabricated 0.
function formatSatelliteRcs(rcsM2) {
    if (typeof rcsM2 !== 'number' || !Number.isFinite(rcsM2)) return null;
    return rcsM2.toFixed(2) + ' m\u00b2';
}

function displayPhoto() {
    if (!SelectedPlane)
        return;

    const photoContainer = document.getElementById("selected_photo");
    if (!photoContainer)
        return;

    const icao = SelectedPlane.icao || "";

    // --- Satellites: looked up by exact NORAD Catalog Number, not by name ---
    if (SelectedPlane.isSatellite) {
        const sat = SelectedPlane;
        const noradId = sat.satNoradId;

        wikidataSatellitePhoto(noradId)
          .then(result => {
            if (SelectedPlane !== sat) return; // discard a stale lookup

            let changed;
            if (result) {
              changed = setPhotoHtml(
                '<img id="airplanePhoto" src="' + escapeHtml(result.url) +
                '" style="width:171px;" onerror="displaySatelliteNoImage();">'
              );
              changed = setCopyrightHtml('<span>Image © ' + escapeHtml(result.attribution) + '</span>') || changed;
            } else {
              const before = selectedPhotoCache;
              displaySatelliteNoImage();
              changed = before !== selectedPhotoCache;
            }
            if (changed) adjustInfoBlock();
          })
          .catch(() => {
            if (SelectedPlane === sat) {
              displaySatelliteNoImage();
              adjustInfoBlock();
            }
          });

        return;
    }

    // --- AIS vessels (detected by IMO / MMSI prefix) ---
    if (icao.startsWith("MMSI")) {
        displayVesselPhoto(SelectedPlane);
        return;
    }

    // --- Aircraft images ---
    if (!SelectedPlane.psAPIresponse) {
        displaySil();
        return;
    }

    let photos = SelectedPlane.psAPIresponse["photos"] ||
                 SelectedPlane.psAPIresponse["images"];

    if (!photos || photos.length === 0) {
        displaySil();
        adjustInfoBlock();
        return;
    }

    let photoToPull =
        photos[0]["thumbnail"]["src"] || photos[0]["thumbnail"];

    let linkToPicture = photos[0]["link"];
    let copyright =
        photos[0]["photographer"] || photos[0]["user"];

	let new_html =
	    '<a class="link" href="' + escapeHtml(linkToPicture) +
	    '" target="_blank" rel="noopener noreferrer">' +
	    '<img id="airplanePhoto" src="' + escapeHtml(photoToPull) + '"></a>';

	let changed = setPhotoHtml(new_html);
	changed = setCopyrightHtml("<span>Image © " + escapeHtml(copyright) + "</span>") || changed;
    if (changed) adjustInfoBlock();
}

function refreshPhoto(selected) {

    const icao = selected.icao || "";

    // --- Satellites: same lookup as vessels, re-run through displayPhoto() ---
    if (selected.isSatellite) {
        displayPhoto();
        return;
    }

    // --- AIS vessels ---
    if (icao.startsWith("MMSI")) {
        displayPhoto();
        return;
    }

    // --- Aircraft logic unchanged ---
    if (!showPictures || icao[0] === '~' ||
        (!planespottingAPI && !planespottersAPI)) {
        displaySil();
        return;
    }

    if (!selected.dbinfoLoaded) {
        displaySil();
        return;
    }

    let urlTail;
    let param;

    if (selected.registration != null) {
        urlTail = '/hex/' + icao.toUpperCase() +
                  '?reg=' + selected.registration;

        const type = selected.icaoType;
        if (type) {
            urlTail += '&icaoType=' + type;
        }
        param = 'DB';
    } else {
        urlTail = 'hex/' + icao.toUpperCase();
        param = 'hex';
    }

    const ts = Date.now();

    if (param === selected.psAPIparam) {
        if (selected.psAPIresponse) {
            displayPhoto();
            return;
        }
        if (selected.psAPIresponseTS &&
            selected.psAPIresponseTS - ts < 10000) {
            return;
        }
    }

    selected.psAPIparam = param;

    setPhotoHtml("<p>Searching for image...</p>");
    setCopyrightHtml("<span></span>");
    selected.psAPIresponseTS = ts;

    if (planespottersAPI) {
        jQuery.ajax({
            url: planespottersAPIurl + urlTail,
            dataType: 'json',
            plane: selected
        }).done(function(data) {
            this.plane.psAPIresponse = data;
            if (SelectedPlane === this.plane)
                displayPhoto();
        });
    } else if (planespottingAPI) {
        jQuery.ajax({
            url: 'https://www.planespotting.be/api/objects/imagesRegistration.php?registration=' +
                 selected.registration,
            dataType: 'json',
            plane: selected
        }).done(function(data) {
            this.plane.psAPIresponse = data;
            if (SelectedPlane === this.plane)
                displayPhoto();
        }).fail(function() {
            this.plane.psAPIresponse = { photos: [] };
            if (SelectedPlane === this.plane)
                displayPhoto();
        });
    }
}

let selCall = null;
let selIcao = null;
let selReg = null;

let somethingSelected = false;
// Refresh the detail window about the plane
function refreshSelected() {
    const selected = SelectedPlane;

    if (!selected || !selected.nav_qnh) {
        jQuery('#altimeter_set_selected').prop("disabled", true);
    } else {
        jQuery('#altimeter_set_selected').prop("disabled", false);
    }

    if (!selected) {
        g.photoForIcao = null;
        if (g.trackState.key) {
            resetSelectedTrack();
        }
        if (somethingSelected) {
            adjustInfoBlock();
            buttonActive('#F', FollowSelected);
        }
        somethingSelected = false;
        return;
    }
    somethingSelected = true;
    buttonActive('#F', FollowSelected);

    selected.updateVisible();
    selected.checkForDB();

    // Photo: on a NEW selection the lookup starts only after the panel / bottom
    // sheet has been laid out and painted (two animation frames), so the popup
    // appears at once, minimised, and is never held up by the image search.
    // Later refreshes for the same object run it inline as before (cheap: the
    // result is cached).
    if (g.photoForIcao !== selected.icao) {
        g.photoForIcao = selected.icao;
        setPhotoHtml('<p>Searching for image...</p>');
        setCopyrightHtml('');
        const forPlane = selected;
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                setTimeout(function () {
                    if (SelectedPlane === forPlane) refreshPhoto(forPlane);
                }, 0);
            });
        });
    } else {
        refreshPhoto(selected);
    }

    jQuery('#selected_callsign').updateText(selected.name);

    // Domain-aware panel: CSS hides the sections that don't apply
    // (see "Domain-aware info panel" in style.css).
    setInfoblockDomain(selected);
    // Mobile bottom sheet summary strip (only visible in sheet layout).
    jQuery('#sheetName').updateText(selected.name || '');
    updateSheetFlag(selected);
    jQuery('#sheetFacts').updateText(sheetFacts(selected));
    const routeLine = sheetRouteLine(selected);
    const routeEl = document.getElementById('sheetRoute');
    if (routeEl) {
        jQuery(routeEl).updateText(routeLine);
        routeEl.hidden = !routeLine;    // the minimised height follows (sheetHeights() measures the handle)
    }
    // same summary + route lines under the name in the desktop sidebar title
    jQuery('#selected_facts').updateText(jQuery('#sheetFacts').text());
    const selRoute = document.getElementById('selected_routeLine');
    if (selRoute) {
        jQuery(selRoute).updateText(routeLine);
        if (selRoute.hidden !== !routeLine) selRoute.hidden = !routeLine;
    }

    // Vessel / satellite track: fetched on selection change and refreshed
    // every TRACK_REFRESH_MS, not on every refresh (see updateSelectedTrack()).
    updateSelectedTrack(selected);

    if (showTrace) {
        if (selected.position_time) {
            const date = new Date(selected.position_time * 1000);
            let timestamp = utcTimesHistoric ? (zuluTime(date) + NBSP + 'Z') : (lDateString(date) + ' ' + localTime(date) + NBSP + TIMEZONE);
            jQuery('#trace_time').updateText('Time:\n' + timestamp);
        } else {
            jQuery('#trace_time').updateText('Time:\n');
        }
    }

    if (flightawareLinks) {
        jQuery('#selected_flightaware_link').html(getFlightAwareModeSLink(selected.icao, selected.flight, "Visit Flight Page"));
    }

    if (selected.isNonIcao() && selected.source != 'mlat') {
        jQuery('#anon_mlat_info').addClass('hidden');
        jQuery('#reg_info').addClass('hidden');
        jQuery('#tisb_info').removeClass('hidden');
    } else if (selected.isNonIcao() && selected.source == 'mlat') {
        jQuery('#reg_info').addClass('hidden');
        jQuery('#tisb_info').addClass('hidden');
        jQuery('#anon_mlat_info').removeClass('hidden');
    } else {
        jQuery('#tisb_info').addClass('hidden');
        jQuery('#anon_mlat_info').addClass('hidden');
        jQuery('#reg_info').removeClass('hidden');
    }

    let checkReg = selected.registration + ' ' + selected.dbinfoLoaded + ' ' + selected.isSatellite + ' ' + selected.flight;
    if (checkReg != selReg) {
        selReg = checkReg;
        jQuery('#registration_label').attr('title', selected.isSatellite
            ? 'Satellite name, as carried in the TLE data set this object was fetched from'
            : 'Registration: The alphanumeric registration code assigned by the country in which the aircraft is registered.');
        if (selected.isSatellite) {
            // Satellites have no registration - show the TLE object name (the
            // callsign the SBS feeder carries it under) in the same slot instead.
            const satName = (selected.flight && selected.flight.trim()) ? selected.flight.trim() : selected.icao.toUpperCase();
            jQuery('#selected_registration').updateText(satName);
        } else if (selected.registration) {
            if (flightawareLinks) {
                jQuery('#selected_registration').html(getFlightAwareIdentLink(selected.registration, selected.registration));
            } else if (registrationLinks && registrationLink(selected)) {
			    jQuery('#selected_registration').html(`<a class="link" target="_blank" href="${escapeHtml(registrationLink(selected))}">${escapeHtml(selected.registration)}</a>`);
            } else {
                jQuery('#selected_registration').updateText(selected.registration);
            }
        } else {
            jQuery('#selected_registration').updateText("n/a");
        }
    }
    let dbFlags = "";
    if (selected.ladd)
        dbFlags += ' <a class="link" target="_blank" href="https://www.faa.gov/pilots/ladd/" rel="noreferrer">LADD</a> / ';
    if (selected.pia)
        dbFlags += '<a class="link" target="_blank" href="https://www.faa.gov/air_traffic/technology/equipadsb/privacy/" rel="noreferrer">PIA</a> / ';
    if (selected.military)
        dbFlags += 'military / ';
    if (dbFlags.length == 0) {
        jQuery('#selected_dbFlags').updateText("none");
    } else {
        jQuery('#selected_dbFlags').html(dbFlags.slice(0, -3));
    }

    const satCatDef = selected.isSatellite
        ? ((typeof SAT_CATEGORIES !== 'undefined' && (SAT_CATEGORIES[selected.satCategory] || SAT_CATEGORIES.other)) || null)
        : null;

    if (satCatDef) {
        // "Type" -> the satellite category (STATION / VISUAL / MILITARY / ...),
        // "Type Long" -> the full label for that same category.
        jQuery('#selected_icaotype').updateText(satCatDef.short);
        jQuery('#selected_typelong').updateText(satCatDef.label);
    } else if (selected.icaoType) {
        jQuery('#selected_icaotype').updateText(selected.icaoType);
    } else {
        jQuery('#selected_icaotype').updateText("n/a");
    }
    if (selected.typeDescription)
        jQuery('#selected_typedesc').updateText(selected.typeDescription);
    else
        jQuery('#selected_typedesc').updateText("n/a");

    if (!satCatDef) {
        let typeLine = "";
        if (selected.year)
            typeLine += selected.year + " "
        if (selected.typeLong)
            typeLine += selected.typeLong;
        if (!typeLine)
            typeLine = "n/a"

        jQuery('#selected_typelong').updateText(typeLine);
    }

    if (selected.ownOp)
        jQuery('#selected_ownop').updateText(selected.ownOp);
    else
        jQuery('#selected_ownop').updateText("");

    if (selected.rId && show_rId) {
        jQuery('#receiver_id').updateText(selected.rId);
        jQuery('#receiver_id_div').removeClass('hidden');
    } else {
        jQuery('#receiver_id_div').addClass('hidden');
    }


    if (selected.isSatellite) {
        const satAlt = formatSatelliteAltitude(selected.altitude);
        jQuery("#selected_altitude1").updateText(satAlt);
        jQuery("#selected_altitude2").updateText(satAlt);
    } else {
        jQuery("#selected_altitude1").updateText(format_altitude_long(adjust_baro_alt(selected.altitude), selected.vert_rate, DisplayUnits));
        jQuery("#selected_altitude2").updateText(format_altitude_long(adjust_baro_alt(selected.altitude), selected.vert_rate, DisplayUnits));
    }

    jQuery('#selected_onground').updateText(format_onground(selected.altitude));

	// Hide squawk for ais and for satellites (neither has a real Mode A/C squawk)
	if (selected.dataSource === 'ais' || selected.isSatellite) {
	    jQuery('#squawkRowContainer').hide(); 
	} else {
	    // This shows the entire table row
	    jQuery('#squawkRowContainer').show();
    
	    let squawkDisplay = (selected.squawk != null) ? selected.squawk : "n/a";
	    jQuery('#selected_squawk1').updateText(squawkDisplay);
		jQuery('#selected_squawk2').updateText(squawkDisplay);
	}

	if (selected) {
	    // #routeRow's visibility is otherwise only set once, by the "Lookup route"
	    // settings toggle - it doesn't get revisited per selection. Satellites need
	    // an explicit override here regardless of that setting, and non-satellites
	    // need to be explicitly restored to the setting's state in case a satellite
	    // was selected previously and hid it. Vessels always show it: their
	    // destination comes from the AIS feed, not from the aircraft route API.
	    const selectedIsVessel = String(selected.icao).startsWith('MMSI');
	    if (selected.isSatellite) {
	        jQuery('#routeRow').hide();
	    } else if (useRouteAPI || selectedIsVessel) {
	        jQuery('#routeRow').show();
	    } else {
	        jQuery('#routeRow').hide();
	    }

	    if (selectedIsVessel) {
	        const dest = selected.destination || '';
	        jQuery('#selected_route').updateText(dest);
	        if (dest)
	            jQuery('#selected_route').attr('title', dest);
	        else
	            jQuery('#selected_route').removeAttr('title');
	    } else if (useRouteAPI && selected.routeString) {
	        jQuery('#selected_route').updateText(selected.routeString);
	        jQuery('#selected_route').attr('title', selected.routeVerbose);
	    } else {
	        jQuery('#selected_route').updateText('');
	        jQuery('#selected_route').removeAttr('title');
	    }
	}

    let magResult = null;

    if (geoMag && selected.position != null) {
        let lon = selected.position[0];
        let lat = selected.position[1];
        let alt = selected.altitude == "ground" ? 0 : selected.altitude;
        magResult = geoMag(lat, lon, alt);
        jQuery('#selected_mag_declination').updateText(format_track_brief(magResult.dec));
    } else {
        jQuery('#selected_mag_declination').updateText('n/a');
    }

    let heading = null;
    if (selected.true_heading != null && selected.track != null) {
        heading = selected.true_heading;
    } else if (magResult && selected.mag_heading != null && selected.track != null) {
        heading = selected.mag_heading + magResult.dec;
    }
    if (heading != null && heading < 0)
        heading += 360;
    if (heading != null && heading > 360)
        heading -= 360;

    jQuery('#selected_mag_heading').updateText(format_track_brief(selected.mag_heading));

    if (selected.wd != null && selected.ws != null) {
        jQuery('#selected_wd').updateText(format_track_brief(selected.wd, true));
        jQuery('#selected_ws').updateText(format_speed_long(selected.ws, DisplayUnits));
    } else if (!globeIndex && magResult && selected.gs != null && selected.tas != null && selected.track != null && selected.mag_heading != null) {

        const trk = (Math.PI / 180) * selected.track;
        const hdg = (Math.PI / 180) * heading;
        const tas = selected.tas;
        const gs = selected.gs;
        const ws = Math.round(Math.sqrt(Math.pow(tas - gs, 2) + 4 * tas * gs * Math.pow(Math.sin((hdg - trk) / 2), 2)));
        let wd = trk + Math.atan2(tas * Math.sin(hdg - trk), tas * Math.cos(hdg - trk) - gs);
        if (wd < 0) {
            wd = wd + 2 * Math.PI;
        }
        if (wd > 2 * Math.PI) {
            wd = wd - 2 * Math.PI;
        }
        wd = Math.round((180 / Math.PI) * wd);
        jQuery('#selected_wd').updateText(format_track_brief(wd, true));
        jQuery('#selected_ws').updateText(format_speed_long(ws, DisplayUnits));
    } else {
        jQuery('#selected_wd').updateText('n/a');
        jQuery('#selected_ws').updateText('n/a');
    }


    if (!globeIndex && selected.true_heading == null && heading != null)
        jQuery('#selected_true_heading').updateText(format_track_brief(heading));
    else
        jQuery('#selected_true_heading').updateText(format_track_brief(selected.true_heading));


    let oat = null;
    let tat = null;

    if (selected.tat != null && selected.oat != null) {
        oat = selected.oat;
        tat = selected.tat;
    } else if (!globeIndex && selected.mach != null && selected.tas != null && selected.mach > 0.395) {
        oat = Math.pow((selected.tas / 661.47 / selected.mach), 2) * 288.15 - 273.15;
        tat = -273.15 + (oat + 273.15) * (1 + 0.2 * selected.mach * selected.mach);
    }


    if (oat != null)
        jQuery('#selected_temp').updateText(Math.round(tat) + ' / ' + Math.round(oat)  + ' °C');
    else
        jQuery('#selected_temp').updateText('n/a');

    jQuery('#selected_speed1').updateText(format_speed_long(selected.gs, DisplayUnits));
    jQuery('#selected_speed2').updateText(format_speed_long(selected.gs, DisplayUnits));
    jQuery('#selected_ias').updateText(format_speed_long(selected.ias, DisplayUnits));
    jQuery('#selected_tas').updateText(format_speed_long(selected.tas, DisplayUnits));
    jQuery('#selected_vert_rate').updateText(format_vert_rate_long(selected.vert_rate, DisplayUnits));
    jQuery('#selected_baro_rate').updateText(format_vert_rate_long(selected.baro_rate, DisplayUnits));
    jQuery('#selected_geom_rate').updateText(format_vert_rate_long(selected.geom_rate, DisplayUnits));

    setSelectedIcao();

    jQuery('#selected_pf_info').updateText((selected.pfRoute ? selected.pfRoute : "") );
    //+" "+ (selected.pfFlightno ? selected.pfFlightno : "")
    jQuery('#airframes_post_icao').attr('value',selected.icao);
    jQuery('#selected_track1').updateText(format_track_brief(selected.track));
    jQuery('#selected_track2').updateText(format_track_brief(selected.track));

    if (selected.seen != null && selected.seen < 1000000) {
        jQuery('#selected_seen').updateText(format_duration(selected.seen));
    } else {
        jQuery('#selected_seen').updateText('n/a');
    }
    if (selected.position_time != null) {
        jQuery('#selected_pos_epoch').updateText(Math.round(selected.position_time));
    } else {
        jQuery('#selected_pos_epoch').updateText('n/a');
    }
    if (selected.seen_pos != null && selected.seen_pos < 1000000) {
        jQuery('#selected_seen_pos').updateText(format_duration(selected.seen_pos));
    } else {
        jQuery('#selected_seen_pos').updateText('n/a');
    }

// selected country conversion
	jQuery('#selected_country').updateText(getDisplayCountry(selected));
	// Satellites fall in an unallocated ICAO block, so this always reads
	// "Unassigned" - not wrong, just useless. Hide the row entirely instead.
	if (selected.isSatellite) {
	    jQuery('#selected_country').closest('tr').hide();
	} else {
	    jQuery('#selected_country').closest('tr').show();
	}
    if (selected.position == null) {
        jQuery('#selected_position').updateText('n/a');
    } else {

        if (selected.seen_pos > -1) {
            jQuery('#selected_position').updateText(format_latlng(selected.position));
        } else {
            jQuery('#selected_position').updateText(format_latlng(selected.position));
        }
    }
    let sitedist;
    if (selected.position && SitePosition) {
        sitedist = ol.sphere.getDistance(SitePosition, selected.position);
    }
    jQuery('#selected_source').updateText(getDisplayDataSource(selected));
    if (selected.isSatellite) {
        const def = (typeof SAT_CATEGORIES !== 'undefined' && (SAT_CATEGORIES[selected.satCategory] || SAT_CATEGORIES.other));
        jQuery('#selected_category').updateText(def ? def.short : "SAT");
        jQuery('#selected_category_label').updateText(def ? def.label : "Satellite");
    } else {
        jQuery('#selected_category').updateText(selected.category ? selected.category : "n/a");
        jQuery('#selected_category_label').updateText(get_category_label(selected.category));
    }
    if (selected.isSatellite) {
        jQuery('#sitedist_label').text('Orbit Class');
        jQuery('#sitedist_label').attr('title', (selected.satOrbit && selected.satOrbit.cls)
            ? 'Orbit classification from the whole orbit (apogee, perigee, period)'
            : 'Approximate orbit classification, based on current altitude');
        const orbitClass = satelliteOrbitLabel(selected);
        jQuery('#selected_sitedist1').updateText(orbitClass);
        jQuery('#selected_sitedist2').updateText(orbitClass);
    } else {
        jQuery('#sitedist_label').text('Distance');
        jQuery('#sitedist_label').attr('title', 'Distance of the aircraft from your ADS-B site at its last known position');
        jQuery('#selected_sitedist1').updateText(format_distance_long(sitedist, DisplayUnits));
        jQuery('#selected_sitedist2').updateText(format_distance_long(sitedist, DisplayUnits));
    }
    jQuery('#selected_rssi1').updateText(selected.rssi != null ? selected.rssi.toFixed(1) : "n/a");
    if (
        ((selected.messages == undefined && selected.receiverCount) || (globeIndex && binCraft))
        && !showTrace
    ) {
        jQuery('#selected_message_count').prev().updateText('Receivers:');
        jQuery('#selected_message_count').prop('title', 'Number of receivers receiving this aircraft');
        if (selected.receiverCount >= 5 && selected.dataSource != 'mlat') {
            jQuery('#selected_message_count').updateText('> ' + selected.receiverCount);
        } else {
            jQuery('#selected_message_count').updateText(selected.receiverCount);
        }
    } else {
        jQuery('#selected_message_count').prev().updateText('Messages:');
        jQuery('#selected_message_count').prop('title', 'The total number of messages received from this aircraft');
        jQuery('#selected_message_count').updateText(selected.messages);
    }
    jQuery('#selected_message_rate').updateText((selected.messageRate != null) ? (selected.messageRate.toFixed(1)) : "n/a");
    jQuery('#selected_photo_link').html(getPhotoLink(selected));

    jQuery('#selected_altitude_geom1').updateText(format_altitude_long(adjust_geom_alt(selected.alt_geom, selected.position), selected.geom_rate, DisplayUnits));
    jQuery('#selected_altitude_geom2').updateText(format_altitude_long(adjust_geom_alt(selected.alt_geom, selected.position), selected.geom_rate, DisplayUnits));
    jQuery('#selected_ias').updateText(format_speed_long(selected.ias, DisplayUnits));
    jQuery('#selected_tas').updateText(format_speed_long(selected.tas, DisplayUnits));
    if (selected.mach == null) {
        jQuery('#selected_mach').updateText('n/a');
    } else {
        jQuery('#selected_mach').updateText(selected.mach.toFixed(3));
    }
    if (selected.roll == null) {
        jQuery('#selected_roll').updateText('n/a');
    } else {
        jQuery('#selected_roll').updateText(selected.roll.toFixed(1));
    }
    if (selected.track_rate == null) {
        jQuery('#selected_trackrate').updateText('n/a');
    } else {
        jQuery('#selected_trackrate').updateText(selected.track_rate.toFixed(2));
    }
    jQuery('#selected_geom_rate').updateText(format_vert_rate_long(selected.geom_rate, DisplayUnits));
    if (selected.nav_qnh == null) {
        jQuery('#selected_nav_qnh').updateText("n/a");
    } else {
        jQuery('#selected_nav_qnh').updateText(selected.nav_qnh.toFixed(1) + " hPa");
    }
    jQuery('#selected_nav_altitude').updateText(format_altitude_long(selected.nav_altitude, 0, DisplayUnits));
    jQuery('#selected_nav_heading').updateText(format_track_brief(selected.nav_heading));
    if (selected.nav_modes == null) {
        jQuery('#selected_nav_modes').updateText("n/a");
    } else {
        jQuery('#selected_nav_modes').updateText(selected.nav_modes.join());
    }
    if (selected.nic_baro == null) {
        jQuery('#selected_nic_baro').updateText("n/a");
    } else {
        if (selected.nic_baro == 1) {
            jQuery('#selected_nic_baro').updateText("cross-checked");
        } else {
            jQuery('#selected_nic_baro').updateText("not cross-checked");
        }
    }

    jQuery('#selected_nac_p').updateText(format_nac_p(selected.nac_p));
    jQuery('#selected_nac_v').updateText(format_nac_v(selected.nac_v));
    if (selected.rc == null) {
        jQuery('#selected_rc').updateText("n/a");
    } else if (selected.rc == 0) {
        jQuery('#selected_rc').updateText("unknown");
    } else {
        jQuery('#selected_rc').updateText(format_distance_short(selected.rc, DisplayUnits));
    }

    if (selected.sil == null || selected.sil_type == null) {
        jQuery('#selected_sil').updateText("n/a");
    } else {
        let sampleRate = "";
        let silDesc = "";
        if (selected.sil_type == "perhour") {
            sampleRate = " per flight hour";
        } else if (selected.sil_type == "persample") {
            sampleRate = " per sample";
        }

        switch (selected.sil) {
            case 0:
                silDesc = "&gt; 1e-3";
                break;
            case 1:
                silDesc = "≤ 1e-3";
                break;
            case 2:
                silDesc = "≤ 1e-5";
                break;
            case 3:
                silDesc = "≤ 1e-7";
                break;
            default:
                silDesc = "n/a";
                sampleRate = "";
                break;
        }
        jQuery('#selected_sil').html(silDesc + sampleRate);
    }

    if (selected.version == null) {
        jQuery('#selected_version').updateText('none');
    } else if (selected.version == 0) {
        jQuery('#selected_version').updateText('v0 (DO-260)');
    } else if (selected.version == 1) {
        jQuery('#selected_version').updateText('v1 (DO-260A)');
    } else if (selected.version == 2) {
        jQuery('#selected_version').updateText('v2 (DO-260B)');
    } else {
        jQuery('#selected_version').updateText('v' + selected.version);
    }

	// Extended status description
	if (selected && selected.dataSource !== 'ais' && getAircraftStatusDescription(selected.squawk)) {
	    jQuery('#selected_status_desc').text(getAircraftStatusDescription(selected.squawk));
	    jQuery('#statusRowSelected').show();
	} else if (selected && selected.dataSource === 'ais' && selected.statusDescription) {
	    jQuery('#selected_status_desc').text(selected.statusDescription);
	    jQuery('#statusRowSelected').show();
	} else {
	    jQuery('#statusRowSelected').hide();
	}

	// Emergency status description (aircraft and vessels)
	if (selected && getEmergencyLevel(selected) !== null) {
	    jQuery('#selected_emergency_desc').text(getEmergencyDescription(selected));
	    jQuery('#emergencyStatusRowSelected').show();
	} else {
	    jQuery('#emergencyStatusRowSelected').hide();
	}

	// Dimensions
	if (selected.dataSource === 'ais' && selected.dims) {
	    jQuery('#selected_dims').text(selected.dims);
	    jQuery('#dimsRowSelected').show();
	} else {
	    jQuery('#dimsRowSelected').hide();
	}

	// Draught
	if (selected.dataSource === 'ais' && selected.draught) {
	    jQuery('#selected_draught').text(selected.draught);
	    jQuery('#draughtRowSelected').show();
	} else {
	    jQuery('#draughtRowSelected').hide();
	}

	// Satellite-only: radar cross-section (a rough size proxy, not a
	// physical measurement - see formatSatelliteRcs()'s comment).
	if (selected.isSatellite && selected.satRcs) {
	    jQuery('#selected_rcs').text(selected.satRcs);
	    jQuery('#rcsRowSelected').show();
	} else {
	    jQuery('#rcsRowSelected').hide();
	}

	// Satellite-only: NORAD catalog number this owner/launch/RCS data is for.
	if (selected.isSatellite && selected.satNoradIdConfirmed) {
	    jQuery('#selected_noradid').text(selected.satNoradIdConfirmed);
	    jQuery('#noradIdRowSelected').show();
	} else {
	    jQuery('#noradIdRowSelected').hide();
	}

	// Satellite-only: Object Type / Owner / Ops Status / Launch Date /
	// Launch Site / International ID, as separate plain-text fields
	// (positioned right below Reg./Type in the HTML) rather than combined
	// into one line - each a synchronous read of a field processSatellite()
	// already set at ingest.
	if (selected.isSatellite && selected.satObjectType) {
	    jQuery('#selected_object_type').text(selected.satObjectType);
	    jQuery('#objectTypeRowSelected').show();
	} else {
	    jQuery('#objectTypeRowSelected').hide();
	}
	if (selected.isSatellite && selected.satOwner) {
	    jQuery('#selected_owner').text(selected.satOwner);
	    jQuery('#ownerRowSelected').show();
	} else {
	    jQuery('#ownerRowSelected').hide();
	}
	if (selected.isSatellite && selected.satOpsStatus) {
	    jQuery('#selected_ops_status').text(selected.satOpsStatus);
	    jQuery('#opsStatusRowSelected').show();
	} else {
	    jQuery('#opsStatusRowSelected').hide();
	}
	// Satellite-only: orbit shape and how old the elements behind it are.
	const orbitShape = selected.isSatellite ? formatSatelliteOrbitSummary(selected, false) : null;
	if (orbitShape) {
	    jQuery('#selected_orbit_shape').updateText(orbitShape);
	    jQuery('#orbitShapeRowSelected').show();
	} else {
	    jQuery('#orbitShapeRowSelected').hide();
	}
	const tleAge = selected.isSatellite ? satelliteTleAge(selected) : null;
	if (tleAge) {
	    const el = jQuery('#selected_tle_age');
	    el.updateText(tleAge.stale ? tleAge.text + ' (stale)' : tleAge.text);
	    el.toggleClass('satTleStale', tleAge.stale);
	    el.attr('title', 'Elements epoch ' + new Date(selected.satEpochMs).toISOString().replace('T', ' ').slice(0, 16) + ' UTC');
	    jQuery('#tleAgeRowSelected').show();
	} else {
	    jQuery('#tleAgeRowSelected').hide();
	}
	if (selected.isSatellite && selected.satLaunchDate) {
	    jQuery('#selected_launch_date').text(selected.satLaunchDate);
	    jQuery('#launchDateRowSelected').show();
	} else {
	    jQuery('#launchDateRowSelected').hide();
	}
	if (selected.isSatellite && selected.satLaunchSite) {
	    jQuery('#selected_launch_site').text(selected.satLaunchSite);
	    jQuery('#launchSiteRowSelected').show();
	} else {
	    jQuery('#launchSiteRowSelected').hide();
	}
	if (selected.isSatellite && selected.satInternationalId) {
	    jQuery('#selected_international_id').text(selected.satInternationalId);
	    jQuery('#internationalIdRowSelected').show();
	} else {
	    jQuery('#internationalIdRowSelected').hide();
	}

	// ETA 
	if (selected.eta) {
	    $('#selected_eta').text(selected.eta);
	    $('#etaRow').removeClass('hidden'); // Shows the row
	} else {
	    $('#selected_eta').text('');
	    $('#etaRow').addClass('hidden');    // Hides the row for planes or ships with no ETA
	}

// Smart visibility for the Type layouts
	if (selected && selected.dataSource === 'ais') {
	    // 1. Hide the short Type row and the Long Type row completely
	    jQuery('#icaoTypeRowSelected').hide();
	    jQuery('#typeLongRowSelected').hide();
	    
	    // 2. Safely find the anonymous Type Desc row and make sure it's visible
	    if (selected.typeDescription) {
	        jQuery('#selected_typedesc').updateText(selected.typeDescription);
	        jQuery('#selected_typedesc').closest('tr').show();
	    } else {
	        jQuery('#selected_typedesc').closest('tr').hide();
	    }
	} else if (selected && selected.isSatellite) {
	    // Type / Type Long carry the satellite category (set above); there's no
	    // ICAO type-description equivalent (engine count/config) for a satellite,
	    // so that row has nothing useful to show and stays hidden.
	    jQuery('#icaoTypeRowSelected').show();
	    jQuery('#typeLongRowSelected').show();
	    jQuery('#selected_typedesc').closest('tr').hide();
	} else {
	    // Restore default layout behavior for aircraft
	    jQuery('#icaoTypeRowSelected').show();
	    jQuery('#typeLongRowSelected').show();
	    jQuery('#selected_typedesc').closest('tr').show();
	}

    adjustInfoBlock();
}

let somethingHighlighted = false;
function refreshHighlighted() {
    // this is following nearly identical logic, etc, as the refreshSelected function, but doing less junk for the highlighted pane
    let highlighted = HighlightedPlane;

    if (!highlighted) {
        if (somethingHighlighted)
            jQuery('#highlighted_infoblock').hide();
        somethingHighlighted = false;
        return;
    }
    somethingHighlighted = true;

    const highlightedIsVessel = String(highlighted.icao).startsWith('MMSI');

    highlighted.checkVisible();

    jQuery('#highlighted_infoblock').show();

    let infoBox = jQuery('#highlighted_infoblock');

    let marker = highlighted.marker || highlighted.glMarker;
    let geom;
    let markerCoordinates;
    if (!marker || !(geom = marker.getGeometry()) || !(markerCoordinates = geom.getCoordinates()) ) {
        jQuery('#highlighted_infoblock').hide();
        return;
    }
    let markerPosition = OLMap.getPixelFromCoordinate(markerCoordinates);
    if (!markerPosition)
        return;

    let mapSize = OLMap.getSize();
    let infoBoxLeft = markerPosition[0];
    let infoBoxTop = markerPosition[1];
    if ((infoBoxLeft + 20 + infoBox.width()) < mapSize[0])
        infoBoxLeft += 20;
    else if ((infoBoxLeft - 20 - infoBox.width()) > 0)
        infoBoxLeft -= (20 + infoBox.width());
    else
        infoBoxLeft = 0;
    if ((infoBoxTop + 20 + infoBox.height()) < mapSize[1])
        infoBoxTop += 20;
    else if (infoBoxTop - (20 + infoBox.height()) > 0)
        infoBoxTop -= (20 + infoBox.height());
    else
        infoBoxTop = 0;
    infoBox.css("left", infoBoxLeft);
    infoBox.css("top", infoBoxTop);

    jQuery('#highlighted_callsign').updateText(highlighted.name);

    // Same header as the mobile popup: flag, one-line summary, route line.
    const hlDomain = objectDomain(highlighted);
    if (g.hlDomain !== hlDomain) {
        const box = document.getElementById('highlighted_infoblock');
        box.classList.remove('hl-air', 'hl-vessel', 'hl-sat');
        box.classList.add('hl-' + hlDomain);
        g.hlDomain = hlDomain;
    }
    updateFlagImages(highlighted, ['highlightedFlag']);
    jQuery('#highlighted_facts').updateText(sheetFacts(highlighted));
    const hlRoute = sheetRouteLine(highlighted);
    const hlRouteEl = document.getElementById('highlighted_routeLine');
    if (hlRouteEl) {
        jQuery(hlRouteEl).updateText(hlRoute);
        if (hlRouteEl.hidden !== !hlRoute) hlRouteEl.hidden = !hlRoute;
    }
    if (highlightedIsVessel) {
        jQuery('#highlighted_mmsi').updateText(String(highlighted.icao).replace(/^MMSI/i, ''));
    }

    if (highlighted.isSatellite) {
        const satCatDef = (typeof SAT_CATEGORIES !== 'undefined' && (SAT_CATEGORIES[highlighted.satCategory] || SAT_CATEGORIES.other)) || null;
        jQuery('#highlighted_icaotype').text(satCatDef ? satCatDef.label : "n/a");
    } else if (highlightedIsVessel) {
        // Vessels: full ship-type description (e.g. "Cargo (All)"), same as
        // the aircraft/satellite branches below -- Type is long-form for
        // every vehicle type now, not just aircraft/satellite.
        jQuery('#highlighted_icaotype').text(highlighted.typeDescription || "n/a");
    } else {
        // Aircraft: Type Long instead of the short type code
        let typeLine = (highlighted.year ? highlighted.year + " " : "") + (highlighted.typeLong || "");
        jQuery('#highlighted_icaotype').text(typeLine.trim() || "n/a");
    }

	if (highlighted) {
	    // the row is otherwise only toggled by the "Lookup route" setting
	    jQuery('#routeRowHighlighted').toggle(!!(useRouteAPI || highlightedIsVessel));
	    if (highlightedIsVessel) {
	        jQuery('#highlighted_route').updateText(highlighted.destination || '');
	    } else if (useRouteAPI && highlighted.routeString) {
	        jQuery('#highlighted_route').updateText(highlighted.routeString);
	    } else {
	        jQuery('#highlighted_route').updateText('');
	    }
	}

    jQuery('#highlighted_source').text(getDisplayDataSource(highlighted));

    if (highlighted.registration !== null) {
        jQuery('#highlighted_registration').text(highlighted.registration);
    } else {
        jQuery('#highlighted_registration').text("n/a");
    }

    jQuery('#highlighted_speed').text(format_speed_long(highlighted.gs, DisplayUnits));

    // Altitude doesn't apply to vessels (always sea-level) -- hide the row
    // entirely for them rather than show a meaningless "ground"/0.
    if (highlightedIsVessel) {
        jQuery('#altitudeRowHighlighted').hide();
    } else {
        jQuery('#altitudeRowHighlighted').show();
        jQuery("#highlighted_altitude").text(highlighted.isSatellite
            ? formatSatelliteAltitude(highlighted.altitude)
            : format_altitude_long(adjust_baro_alt(highlighted.altitude), highlighted.vert_rate, DisplayUnits));
    }

    jQuery('#highlighted_pf_route').updateText(highlighted.icao.toUpperCase());

    jQuery('#highlighted_rssi').text(highlighted.rssi != null ? highlighted.rssi.toFixed(1) + ' dBFS' : "n/a");

    if (highlighted.dataSource === 'ais' && highlighted.statusDescription) {
        // Assuming you want to add a row or update an existing element
        // You can reuse an existing field or inject a new one if you've added it to the HTML
        jQuery('#highlighted_status_desc').text(highlighted.statusDescription);
        jQuery('#statusRowHighlight').show();
    } else {
        jQuery('#statusRowHighlight').hide();
    }

	// ETA
	if (highlighted.eta) {
	    $('#highlighted_eta').text(highlighted.eta);
	    $('#etaRowHighlight').removeClass('hidden'); 
	} else {
	    $('#highlighted_eta').text('');
	    $('#etaRowHighlight').addClass('hidden');
	}

	// Emergency status (aircraft and vessels)
	if (getEmergencyLevel(highlighted) !== null) {
	    jQuery('#highlighted_emergency_desc').text(getEmergencyDescription(highlighted));
	    jQuery('#emergencyRowHighlighted').show();
	} else {
	    jQuery('#emergencyRowHighlighted').hide();
	}

	// Country: aircraft and vessels, full name via getDisplayCountry() --
	// same conversion the sidebar uses. Satellites sit in an unallocated
	// ICAO block and have no meaningful country, so the row stays hidden
	// for them, same as the sidebar.
	if (highlighted.isSatellite) {
	    jQuery('#countryRowHighlighted').hide();
	} else {
	    jQuery('#highlighted_country').text(getDisplayCountry(highlighted) || "n/a");
	    jQuery('#countryRowHighlighted').show();
	}

	// Vessel-only fields: dimensions, draught
	if (highlightedIsVessel) {
	    if (highlighted.dims) {
	        jQuery('#highlighted_dims').text(highlighted.dims);
	        jQuery('#dimsRowHighlighted').show();
	    } else {
	        jQuery('#dimsRowHighlighted').hide();
	    }

	    if (highlighted.draught) {
	        jQuery('#highlighted_draught').text(highlighted.draught);
	        jQuery('#draughtRowHighlighted').show();
	    } else {
	        jQuery('#draughtRowHighlighted').hide();
	    }
	} else {
	    jQuery('#dimsRowHighlighted').hide();
	    jQuery('#draughtRowHighlighted').hide();
	}

	// Satellite-only field: orbit classification (mirrors the sidebar's
	// "Distance" -> "Orbit" repurposing for satellites)
	if (highlighted.isSatellite) {
	    jQuery('#highlighted_orbit').text(satelliteOrbitLabel(highlighted));
	    jQuery('#orbitRowHighlighted').show();
	} else {
	    jQuery('#orbitRowHighlighted').hide();
	}

	// Satellite-only: owner, launch info, RCS, NORAD ID - a pure synchronous
	// read of fields processSatellite() already set at ingest, same as the
	// vessel dims/draught rows just above. No lookup happens on hover.
	if (highlighted.isSatellite && highlighted.satOwner) {
	    jQuery('#highlighted_owner').text(highlighted.satOwner);
	    jQuery('#ownerRowHighlighted').show();
	} else {
	    jQuery('#ownerRowHighlighted').hide();
	}
	if (highlighted.isSatellite && highlighted.satRcs) {
	    jQuery('#highlighted_rcs').text(highlighted.satRcs);
	    jQuery('#rcsRowHighlighted').show();
	} else {
	    jQuery('#rcsRowHighlighted').hide();
	}
	if (highlighted.isSatellite && highlighted.satNoradIdConfirmed) {
	    jQuery('#highlighted_noradid').text(highlighted.satNoradIdConfirmed);
	    jQuery('#noradIdRowHighlighted').show();
	} else {
	    jQuery('#noradIdRowHighlighted').hide();
	}

}

function removeHighlight() {
    HighlightedPlane = null;
    refreshHighlighted();
}

function mstime() {
    return new Date().getTime();
}

// recreating all OpenLayers Features for the planes every now and then releases some retained memory
// Haven't been able to create a reproducer ... regardless let's stick with this workaround
// in other words: probably not an issue with OpenLayers.

let nextCacheClear = mstime() + 300 * 1000;

function releaseMem() {
    if (!loadFinished || mstime() < nextCacheClear) {
        return;
    }

    nextCacheClear = mstime() + 300 * 1000;
    lineStyleCache = {};
    iconCache = {};

    //console.trace();
    //console.log('releaseMem()');
    for (let i in g.planesOrdered) {
        let plane = g.planesOrdered[i];
        plane.clearMarker();
        plane.destroyTR();
    }
    refreshFeatures();
    TAR.planeMan.redraw();
    refresh();
}

function refreshFeatures() {
    if (!loadFinished) {
        return;
    }
    updateVisible();
    for (let i in g.planesOrdered) {
        g.planesOrdered[i].updateFeatures(true);
    }
}

//
// g.planes table begin
//
(function (global, jQuery, TAR) {
    let planeMan = TAR.planeMan = TAR.planeMan || {};

    function compareAlpha(xa,ya) {
        if (xa === ya)
            return 0;
        if (xa < ya)
            return -1;
        return 1;
    }

    function compareBeta(xa, ya) {
        if (xa === ya)
            return 0;
        if (planeMan.sortAscending && xa < ya)
            return -1;
        if (!planeMan.sortAscending && (xa.replace(/ /g, "").split("").reverse().join("") > ya.replace(/ /g, "").split("").reverse().join("")))
            return -1;
        return 1;
    }

    function compareNumeric(xf,yf) {
        if (Math.abs(xf - yf) < 1e-9)
            return 0;

        return xf - yf;
    }

    const cols = planeMan.cols = {};

    cols.icao = {
        text: 'Hex ID',
        sort: function () { sortBy('icao', compareAlpha, function(x) { return x.icao; }); },
        value: function(plane) { return plane.icao; },
        td: '<td class="icaoCodeColumn">',
    };
    cols.country = {
        text: 'Flag',
        header: function() { return ""; },
        sort: function () { sortBy('country', compareAlpha, function(x) { return x.country; }); },
        value: function(plane) { return (plane.country_code ? ('<img width="18" height="12" style="display: block;margin: auto;" src="flags/3x2/' + plane.country_code.toUpperCase() + '.svg" title="' + plane.country + '"></img>') : ''); },
        hStyle: 'style="width: 18px; padding: 3px;"',
        html: true,
    };
    cols.flight = {
        sort: function () { sortBy('flight', compareAlpha, function(x) { return x.flight }); },
        value: function(plane) {
            if (flightawareLinks)
                return getFlightAwareModeSLink(plane.icao, plane.flight, plane.name);
            return (plane.flight || '');
        },
        html: flightawareLinks,
        text: 'Callsign' };
	if (routeApiUrl) {
		cols.route = {
		        sort: function () { 
		            sortBy('route', compareAlpha, function(x) { return x.routeColumn }); 
		        },
		        value: function(plane) {
		            // AIS vessels: destination straight from the feed, whatever the
		            // "Lookup route" (aircraft route API) setting is
		            if (String(plane.icao).startsWith('MMSI')) {
		                return plane.destination
		                    ? '<span title="' + escapeHtml(plane.destination) + '">' + escapeHtml(plane.destination) + '</span>'
		                    : '';
		            }

		            if (!useRouteAPI) return '';

		            // Aircraft route (from the route API)
		            if (plane.routeString) {
		                return '<span title="' + escapeHtml(plane.routeVerbose) + '">' + escapeHtml(plane.routeColumn) + '</span>';
		            }

		            return '';
		        },
		        html: true,
		        text: 'Route/Destination'
		    };
	}
    cols.registration = {
        sort: function () { sortBy('registration', compareAlpha, function(x) { return x.registration; }); },
        value: function(plane) { return (flightawareLinks ? getFlightAwareIdentLink(plane.registration, plane.registration) : (plane.registration ? plane.registration : "")); },
        html: flightawareLinks,
        text: 'Registration' };
    cols.type = {
        sort: function () { sortBy('type', compareAlpha, function(x) { return x.icaoType; }); },
        value: function(plane) { return (plane.icaoType != null ? plane.icaoType : ""); },
        text: 'Type' };
	cols.squawk = {
	    text: 'Squawk',
	    sort: function () { 
	        sortBy('squawk', compareAlpha, function(x) { 
	            return (x.squawk != null ? x.squawk : (x.aisSquawk != null ? x.aisSquawk : "")); 
	        }); 
	    },
	    value: function(plane) { 
	        if (plane.squawk != null) return plane.squawk;
	        if (plane.aisSquawk != null) return plane.aisSquawk;
	        return ""; 
	    },
	    align: 'right' 
	};
    cols.altitude = {
        text: 'Altitude',
        sort: function () { sortBy('altitude',compareNumeric, function(x) { return (x.altitude == "ground" ? -100000 : x.altitude); }); },
        value: function(plane) { return plane.isSatellite ? formatSatelliteAltitude(plane.altitude) : format_altitude_brief(adjust_baro_alt(plane.altitude), plane.vert_rate, DisplayUnits); },
        align: 'right',
        header: function () { return 'Alt.' + NBSP + '(' + get_unit_label("altitude", DisplayUnits) + ')';},
    };
    cols.speed = {
        text: pTracks ? 'Max. Speed' : 'Speed',
        sort: function () { sortBy('speed', compareNumeric, function(x) { return x.speed; }); },
        value: function(plane) { return format_speed_brief(plane.speed, DisplayUnits); },
        align: 'right',
        header: function () { return (pTracks ? 'Max. ' : '') + 'Spd.' + NBSP + '(' + get_unit_label("speed", DisplayUnits) + ')';},
    };
    cols.vert_rate = {
        text: 'Vertical Rate',
        sort: function () { sortBy('vert_rate', compareNumeric, function(x) { return x.vert_rate; }); },
        value: function(plane) { return format_vert_rate_brief(plane.vert_rate, DisplayUnits); },
        align: 'right',
        header: function () { return 'V. Rate(' + get_unit_label("verticalRate", DisplayUnits) + ')';},
    };
    cols.sitedist = {
        text: pTracks ? 'Max. Distance' : 'Distance',
        sort: function () { sortBy('sitedist',compareNumeric, function(x) { return x.sitedist; }); },
        value: function(plane) { return plane.isSatellite ? satelliteOrbitLabel(plane) : format_distance_brief(plane.sitedist, DisplayUnits); },
        align: 'right',
        header: function () { return (pTracks ? 'Max. ' : '') + 'Dist.' + NBSP + '(' + get_unit_label("distance", DisplayUnits) + ')';},
    };
    cols.track = {
        text: 'Track',
        sort: function () { sortBy('track', compareNumeric, function(x) { return x.track; }); },
        value: function(plane) { return format_track_brief(plane.track); },
        align: 'right' };
    cols.msgs = {
        text: 'Messages',
        sort: function () { sortBy('msgs', compareNumeric, function(x) { return x.messages; }); },
        value: function(plane) { return plane.messages; },
        align: 'right' };
    cols.seen = {
        text: 'Seen',
        sort: function () { sortBy('seen', compareNumeric, function(x) { return x.seen; }); },
        value: function(plane) { return plane.seen.toFixed(0); },
        align: 'right' };
    cols.rssi = {
        text: 'RSSI',
        sort: function () { sortBy('rssi', compareNumeric, function(x) { return x.rssi; }); },
        value: function(plane) { return (plane.rssi != null ? plane.rssi.toFixed(1) : ""); },
        align: 'right' };
    cols.lat = {
        text: 'Latitude',
        sort: function () { sortBy('lat', compareNumeric, function(x) { return (x.position !== null ? x.position[1] : null); }); },
        value: function(plane) { return (plane.position != null ? plane.position[1].toFixed(4) : ""); },
        align: 'right' };
    cols.lon = {
        text: 'Longitude',
        sort: function () { sortBy('lon', compareNumeric, function(x) { return (x.position !== null ? x.position[0] : null); }); },
        value: function(plane) { return (plane.position != null ? plane.position[0].toFixed(4) : ""); },
        align: 'right' };
    cols.data_source = {
        text: 'Source',
        sort: function () { sortBy('data_source', compareNumeric, function(x) { return x.getDataSourceNumber(); } ); },
        value: function(plane) { return getDisplayDataSource(plane); },
        align: 'right' };
    cols.military = {
        text: 'Mil.',
        sort: function () { sortBy('military', compareAlpha, function(x) { return (x.military ? 'yes' : 'no'); } ); },
        value: function(plane) { return (plane.military ? 'yes' : 'no'); },
        align: 'right' };
    cols.wd = {
        text: 'Wind D.',
        sort: function () { sortBy('wd', compareNumeric, function(x) { return x.wd; }); },
        value: function(plane) { return plane.wd != null ? (plane.wd + '°') : ''; },
        align: 'right' };
    cols.ws = {
        text: 'Wind S.',
        sort: function () { sortBy('ws', compareNumeric, function(x) { return x.ws; }); },
        value: function(plane) { return format_speed_brief(plane.ws, DisplayUnits); },
        align: 'right',
        header: function () { return 'Wind' + NBSP + '(' + get_unit_label("speed", DisplayUnits) + ')'; },
    };

    const colsEntries = Object.entries(cols);
    for (let i in colsEntries) {
        let key = colsEntries[i][0];
        let value = colsEntries[i][1];
        value.id = key;
        value.text = value.text ? value.text : "";
        value.header = value.header ? value.header : function() { return value.text; };
        value.hStyle = value.hStyle ? value.hStyle : "";
        if (!value.td)
            value.td = value.align ? ('<td style="text-align: ' + value.align + '">') : '<td>';
    }

    let columns = createOrderedColumns();
    let activeCols = null;

    let initializing = true;

    let planeRowTemplate = null;
    let htmlTable = null;
    let tbody = null;

    planeMan.init = function () {
        // initialize columns
        htmlTable = document.getElementById('planesTable');
        for (let i in columns) {
            let col = columns[i];
            col.visible = true;
            col.toggleKey = 'column_' + col.id;

            if (HideCols.includes('#' + col.id)) {
                planeMan.setColumnVis(col.id, false);
            }
        }

        createColumnToggles();

        if (!ShowFlags) {
            planeMan.setColumnVis('flag', false);
        }
    }

    planeMan.redraw = function () {
        activeCols = [];
        for (let i in columns) {
            let col = columns[i];
            if (col.visible || !mapIsVisible) {
                activeCols.push(col);
            }
        }
        for (let i = 0; i < g.planesOrdered.length; ++i) {
            g.planesOrdered[i].destroyTR();
        }
        let table = '';
        table += '<thead class="aircraft_table_header">';
        table += '  <tr>';
        for (let i in activeCols) {
            let col = activeCols[i];
            table += '<td id="' + col.id + '" onclick="TAR.planeMan.cols.' + col.id + '.sort();"' + col.hStyle + '>'+ col.header() +'</td>';
        }
        table += '  </tr>';
        table += '</thead>';
        table += '<tbody>';
        table += '</tbody>';
        htmlTable.innerHTML = table;
        tbody = htmlTable.tBodies[0];

        planeRowTemplate = document.createElement('tr');
        let template = ''
        for (let i in activeCols) {
            let col = activeCols[i];
            template += col.td;
            template += '</td>';
        }
        planeRowTemplate.innerHTML = template;
        planeRowTemplate.className = 'listRow';

        if (!initializing) {
            planeMan.refresh();
        }
    }

    planeMan.setColumnVis = function (col, visible) {
        cols[col].visible = visible;

        if (!initializing)
            planeMan.redraw();
    }

    // Refreshes the larger table of all the planes
    planeMan.refresh = function () {
        if (!loadFinished)  {
            return;
        }
        //console.trace();

        if (initializing) {
            planeMan.redraw();
            initializing = false;
        }

        const atime = false;
        atime && console.time("planeMan.refresh()");

        const ctime = false; // gets enabled for debugging table refresh speed
        // globeTableLimit = 1000; for testing performance

        ctime && console.time("planeMan.refresh()");


        TrackedAircraft = 0;
        TrackedAircraftPositions = 0;
        TrackedHistorySize = 0;

        ctime && console.time("inView");
        let pList = []; // list of planes that might go in the table and need sorting
        for (let i = 0; i < g.planesOrdered.length; ++i) {
            const plane = g.planesOrdered[i];

            TrackedHistorySize += plane.history_size;

            if (tableInView) {
                if (plane.visible)
                    TrackedAircraft++;
                if ((plane.inView && plane.visible) || plane.selected) {
                    pList.push(plane);
                    TrackedAircraftPositions++;
                }
            } else {
                if (plane.visible) {
                    TrackedAircraft++;
                    pList.push(plane);
                    if (plane.position != null)
                        TrackedAircraftPositions++;
                }
            }
        }

        ctime && console.timeEnd("inView");

        ctime && console.time("resortTable");
        resortTable(pList);
        ctime && console.timeEnd("resortTable");

        const sidebarVisible = toggles['sidebar_visible'].state;

        let inTable = []; // list of planes that will actually be displayed in the table
        let tableTruncated = 0; // planes left out by the row cap

        let rowLimit;
        if (globeIndex)
            rowLimit = mapIsVisible ? globeTableLimit + 1 : Infinity;   // unchanged globe behaviour
        else
            rowLimit = mapIsVisible ? tableRowLimit : tableRowLimitExpanded;

        ctime && console.time("modTRs");
        for (let i in pList) {
            const plane = pList[i];

            if (!sidebarVisible) {
                break;
            }
            // over the cap: leave it out, but never drop a selected plane from the table
            if (inTable.length >= rowLimit && !plane.selected) {
                tableTruncated++;
                continue;
            }
            inTable.push(plane);

            if (plane.tr == null) {
                plane.makeTR(planeRowTemplate.cloneNode(true));
                plane.tr.id = plane.icao;
                plane.refreshTR = 0;
            }

            if (now - plane.refreshTR > 5 || plane.selected != plane.selectCache) {
                plane.refreshTR = now;
                plane.selectCache = plane.selected;
                // The data source shows as a coloured stripe at the start of
                // the row (the legend's colours, always the stronger light
                // set so they read on both themes); a selected row gets the
                // accent tint (stylesheet). Special squawks keep a full colour.
                const srcColors = (typeof tableColorsLight !== 'undefined' && tableColorsLight && tableColorsLight.selected) || tableColors.selected;
                const stripe = (plane.dataSource && srcColors[plane.dataSource]) || '#bcbcbc';
                plane.tr.classList.toggle('rowSelected', !!plane.selected);

                if (plane.squawk in tableColors.special) {
                    const bgColor = tableColors.special[plane.squawk];
                    if (plane.bgColorCache != 'sq' + bgColor) {
                        plane.bgColorCache = 'sq' + bgColor;
                        plane.tr.style = "--src: " + stripe + "; background-color: " + bgColor + "; color: black;";
                    }
                } else if (plane.bgColorCache != stripe) {
                    plane.bgColorCache = stripe;
                    plane.tr.style = "--src: " + stripe + ";";
                }
				
	            // Emergency row flash — mirrors the #E button's alert logic
	            const emergencyLevel = getEmergencyLevel(plane);
	            plane.tr.classList.toggle('emergencyRow', emergencyLevel === 'squawk');
	            plane.tr.classList.toggle('emergencyRowAmber', emergencyLevel === 'field');

                for (let cell in activeCols) {
                    let col = activeCols[cell];
                    if (!col.value)
                        continue;
                    let newValue = col.value(plane);
                    if (newValue != plane.trCache[cell]) {
                        plane.trCache[cell] = newValue;
                        if (col.html) {
                            plane.tr.cells[cell].innerHTML = newValue;
                        } else {
                            plane.tr.cells[cell].textContent = newValue;
                        }
                    }
                }
            }
        }
        ctime && console.timeEnd("modTRs");

        global.refreshPageTitle();
        jQuery('#dump1090_total_history').updateText(TrackedHistorySize);
        jQuery('#dump1090_message_rate').updateText(MessageRate === null ? 'n/a' : MessageRate.toFixed(1));
        jQuery('#dump1090_total_ac_positions').updateText(TrackedAircraftPositions);

        ctime && console.time("DOM1");

        let newBody = document.createElement('tbody');
        if (tableTruncated > 0) {
            // Purely informational, so it must never be able to take the table (or the
            // whole refresh() cycle) down with it - and no inline styling, which is
            // exactly what threw here ("Cannot set properties of undefined (setting 'cssText')").
            try {
                const noteRow = document.createElement('tr');
                const noteCell = document.createElement('td');
                noteCell.colSpan = activeCols.length || 1;
                noteCell.align = 'center';
                noteCell.className = 'tableTruncatedNote';
                noteCell.textContent = 'Showing ' + inTable.length + ' of ' + (inTable.length + tableTruncated) +
                    ' - zoom in or use filters to narrow the list';
                noteRow.appendChild(noteCell);
                newBody.appendChild(noteRow);
            } catch (error) {
                console.error('table "showing N of M" note failed:', error);
            }
        }
        for (let i in inTable) {
            const plane = inTable[i];
            newBody.appendChild(plane.tr);
        }

        ctime && console.timeEnd("DOM1");
        ctime && console.time("DOM2");

        htmlTable.replaceChild(newBody, tbody);
        tbody.remove();
        tbody = newBody;

        ctime && console.timeEnd("DOM2");

        ctime && console.timeEnd("planeMan.refresh()");
        atime && console.timeEnd("planeMan.refresh()");
    }

    //
    // ---- table sorting begin ----
    //

    planeMan.sortId = '';
    planeMan.sortCompare = null;
    planeMan.sortExtract = null;
    planeMan.sortAscending = true;

    // Emergency tier for table ordering: 0 = red, 1 = amber, 2 = none.
    // Computed once per object per sort (in resortTable), not inside the
    // comparator, which runs O(n log n) times.
    function emergencySortRank(plane) {
        const level = getEmergencyLevel(plane);
        return level === 'squawk' ? 0 : (level === 'field' ? 1 : 2);
    }

    function sortFunction(x,y) {
        // Emergency tiers always float to the top (red, then amber), with the
        // active column sort preserved within each tier.
        const er = x._em_rank - y._em_rank;
        if (er !== 0) return er;

        const xv = x._sort_value;
        const yv = y._sort_value;

        // always sort missing values at the end, regardless of
        // ascending/descending sort
        if (xv == null && yv == null) return x._sort_pos - y._sort_pos;
        if (xv == null) return 1;
        if (yv == null) return -1;

        const c = planeMan.sortAscending ? planeMan.sortCompare(xv,yv) : planeMan.sortCompare(yv,xv);
        if (c !== 0) return c;

        return x._sort_pos - y._sort_pos;
    }

    function resortTable(pList) {
        if (!planeMan.sortExtract)
            return;
        if (globeIndex) {
            // don't presort for globeIndex
        }
        // presort by dataSource
        else if (planeMan.sortId == "sitedist") {
            for (let i = 0; i < pList.length; ++i) {
                pList[i]._sort_pos = i;
            }
            pList.sort(function(x,y) {
                const a = x.getDataSourceNumber();
                const b = y.getDataSourceNumber();
                if (a == b)
                    return (x._sort_pos - y._sort_pos);

                return (a-b);
            });
        }
        // or distance
        else if (planeMan.sortId == "data_source") {
            pList.sort(function(x,y) {
                return (x.sitedist - y.sitedist);
            });
        }
        // or longitude
        else {
            pList.sort(function(x,y) {
                return (x.position ? x.position[0] : 500) - (y.position ? y.position[0] : 500);
            });
        }

        // number the existing rows so we can do a stable sort
        // regardless of whether sort() is stable or not.
        // Also extract the sort comparison value.
        if (globeIndex) {
            for (let i = 0; i < pList.length; ++i) {
                pList[i]._sort_pos = pList[i].numHex;
                pList[i]._sort_value = planeMan.sortExtract(pList[i]);
                pList[i]._em_rank = emergencySortRank(pList[i]);
            }
        } else {
            for (let i = 0; i < pList.length; ++i) {
                pList[i]._sort_pos = i;
                pList[i]._sort_value = planeMan.sortExtract(pList[i]);
                pList[i]._em_rank = emergencySortRank(pList[i]);
            }
        }

        // One pass: emergency tier first, then the active column, then the
        // previous order (see sortFunction).
        pList.sort(sortFunction);

        // In multiSelect put selected planes on top, do a stable sort!
        if (multiSelect) {
            for (let i = 0; i < pList.length; ++i) {
                pList[i]._sort_pos = i;
            }
            pList.sort(function(x,y) {
                if (x.selected && y.selected) {
                    return (x._sort_pos - y._sort_pos);
                }
                if (x.selected)
                    return -1;
                if (y.selected)
                    return 1;

                return (x._sort_pos - y._sort_pos);
            });
        }
    }

    function sortBy(id, sc, se) {
        loStore['sortCol'] = id;

        if (id === planeMan.sortId) {
            planeMan.sortAscending = !planeMan.sortAscending;
            g.planesOrdered.reverse(); // this correctly flips the order of rows that compare equal
        }

        loStore['sortAscending'] = planeMan.sortAscending ? 'true' : '';

        planeMan.sortId = id;
        planeMan.sortCompare = sc;
        planeMan.sortExtract = se;

        planeMan.refresh();
    }

    //
    // ---- table sorting end ----
    //

    function createColumnToggles() {
        const prefix = 'dd_';
        const sortableColumns = jQuery('#sortableColumns').sortable({
            update: function (event, ui) {
                const order = [];
                jQuery('#sortableColumns li').each(function (e) {
                    order.push(jQuery(this).attr('id').replace(prefix, ''));
                });

                loStore['columnOrder'] = JSON.stringify(order);
                columns = createOrderedColumns();

                planeMan.redraw();
            }
        });

        for (let col of columns) {
            sortableColumns.append(`<li class="ui-state-default" id="${prefix + col.id}"></li>`);

            new Toggle({
                key: col.toggleKey,
                display: col.text,
                container: jQuery(`#${prefix + col.id}`),
                init: col.visible,
                setState: function (state) {
                    planeMan.setColumnVis(col.id, state);
                }
            });
        }
    }

    function createOrderedColumns() {
        const order = loStore['columnOrder'];
        if (order !== undefined) {
            const columns = [];
            for (let col of JSON.parse(order)) {
                const column = cols[col];
                if (column !== undefined) {
                    columns.push(column);
                }
            }
            if (columns.length > 0) {
                return columns;
            }
        }
        return Object.values(cols);
    }

    return TAR;
}(window, jQuery, TAR || {}));
//
// g.planes table end
//

let lastSelected = null;
function deselect(plane) {
    if (!plane || !plane.selected)
        return;
    plane.selected = false;
    const index = SelPlanes.indexOf(plane);
    if (index > -1) {
        SelPlanes.splice(index, 1);
    }
    lastSelected = plane;
    if (plane == SelectedPlane) {
        if (SelPlanes.length > 0) {
            sp = SelectedPlane = SelPlanes[0];
        } else {
            sp = SelectedPlane = null;
        }
        refreshSelected();
    }

    plane.updateTick('redraw');
    updateAddressBar();
}
let scount = 0;
function select(plane, options) {
    if (!plane)
        return;
    options = options || {};
    //console.log("select()", plane.icao, options);
    plane.selected = true;
    if (!SelPlanes.includes(plane))
        SelPlanes.push(plane);

    sp = SelectedPlane = plane;
    updateAddressBar();
    refreshSelected();
    plane.updateTick('redraw');

    if (options.follow) {
        toggleFollow(true);
        if (!options.zoom)
            options.zoom = 'follow';
    } else if (followOnSelect && infoblockShown() && !multiSelect && !SelectedAllPlanes) {
        // Selected-object panel showing (desktop sidebar or mobile sheet):
        // keep the selection centred in the map area the panel doesn't cover,
        // using Follow (F). Panning the map turns Follow off as usual;
        // pressing F re-centres in the uncovered area.
        if (plane.position) {
            toggleFollow(true);
        } else {
            toggleFollow(false);
            g.pendingFollow = plane.icao;   // vessels / satellites: applyPendingFollow()
        }
    } else {
        toggleFollow(false);
    }
}

function selectPlaneByHex(hex, options) {
    active();
    options = options || {};
    console.log(`SELECTING ${hex} follow: ${options.follow}`);
    //console.log("select: " + hex);
    // If SelectedPlane has something in it, clear out the selected
    if (SelectedAllPlanes) {
        deselectAllPlanes();
    }
    // already selected plane
    let oldPlane = SelectedPlane;
    // plane to be selected
    let newPlane = g.planes[hex];

	const multiDeselect = multiSelect && newPlane && newPlane.selected && !onlySelected;

	    // Drop any track for the previous selection (also resets the track
	    // manager, so the next refreshSelected() fetches the new one at once).
	    resetSelectedTrack();

		if (!options.noFetch && (globeIndex || showTrace || haveTraces) && hex) {
		        newPlane = getTrace(newPlane, hex, options);
		    }

    // If we are clicking the same plane, we are deselecting it unless noDeselect is specified
    if (oldPlane == newPlane && (options.noDeselect || showTrace)) {
        oldPlane = null;
    } else {
        if (multiSelect) {
            // multiSelect deselect
            if (multiDeselect) {
                deselect(newPlane);
                newPlane = null;
                hex = null;
            }
        } else if (oldPlane) {
            // normal deselect
            if (oldPlane != newPlane) {
                deselect(oldPlane);
                oldPlane = null;
            }
            if (oldPlane == newPlane) {
                console.log('oldplane == newplane');
                deselect(newPlane);
                oldPlane = null;
                newPlane = null;
                hex = null;
            }
        }
    }

    // Assign the new selected
    select(newPlane, options);

    if (!newPlane) {
        toggleFollow(false);
    }

    if (options.zoom == 'follow') {
        //if (OLMap.getView().getZoom() < 8)
        //    OLMap.getView().setZoom(8);
    } else if (options.zoom) {
        OLMap.getView().setZoom(options.zoom);
    }

    pTracks || TAR.planeMan.refresh();

    return newPlane !== undefined;
}

// loop through the planes and mark them as selected to show the paths for all planes
function selectAllPlanes() {
    HighlightedPlane = null;
    // if all planes are already selected, deselect them all
    if (SelectedAllPlanes) {
        deselectAllPlanes();
        return;
    }
    buttonActive('#T', true);
    // If SelectedPlane has something in it, clear out the selected
    if (SelectedPlane)
        deselect(SelectedPlane);

    toggleIsolation("off");

    SelectedAllPlanes = true;

    // Globe-history servers: give every aircraft in view a track straight away
    // from the positions already held in memory (no downloads); see
    // PlaneObject.seedTrackFromTrace(). Tracks then keep growing as usual.
    if (globeIndex) {
        for (let i in g.planesOrdered) {
            const plane = g.planesOrdered[i];
            if (plane.visible && plane.inView) {
                plane.seedTrackFromTrace();
            }
        }
    }
    refreshFeatures();

    refreshSelected();
    refreshHighlighted();
    pTracks || TAR.planeMan.refresh();
}

// deselect all the planes
function deselectAllPlanes(keepMain) {
    if (showTrace && !keepMain)
        return;
    if (!multiSelect && SelectedPlane)
        toggleIsolation("off");

    clearTimeout(getTraceTimeout);

    if (SelectedAllPlanes) {
        buttonActive('#T', false);
        jQuery('#selectall_checkbox').removeClass('settingsCheckboxChecked');
        SelectedAllPlanes = false;
        refreshFilter();
        return;
    }

    let bounce = [];
    for (let i in SelPlanes) {
        const plane = SelPlanes[i];
        if (keepMain && plane == SelectedPlane)
            continue;
        bounce.push(plane);
    }
    for (let i in bounce) {
        deselect(bounce[i]);
    }
    refreshFilter();
    updateAddressBar();
}

function toggleFollow(override) {
    if (override == true)
        FollowSelected = true;
    else if (override == false)
        FollowSelected = false;
    else
        FollowSelected = !FollowSelected;

    traceOpts.follow = FollowSelected;

    if (FollowSelected) {
        if (!SelectedPlane || !SelectedPlane.position)
            FollowSelected = false;
    }
    if (FollowSelected) {
        //if (override == undefined && OLMap.getView().getZoom() < 8)
        //    OLMap.getView().setZoom(8);
        SelectedPlane.setProjection('follow');
    }
    buttonActive('#F', FollowSelected);
}

function resetMap() {
    geoFindMe().always(function() {
        if (SitePosition) {
            CenterLon = SiteLon;
            CenterLat = SiteLat;
        } else {
            CenterLon = DefaultCenterLon;
            CenterLat = DefaultCenterLat;
        }
        // Reset loStore values and map settings
        lopaStore['CenterLat'] = CenterLat
        lopaStore['CenterLon'] = CenterLon
        //lopaStore['zoomLvl']   = g.zoomLvl = DefaultZoomLvl;

        // Set and refresh
        //OLMap.getView().setZoom(g.zoomLvl);

        //console.log('resetMap setting center ' + [CenterLat, CenterLon]);
        OLMap.getView().setCenter(ol.proj.fromLonLat([CenterLon, CenterLat]));
        OLMap.getView().setRotation(g.mapOrientation);

        //selectPlaneByHex(null,false);
        jQuery("#update_error").css('display','none');
    });
}

function updateMapSize() {
    if (OLMap)
        OLMap.updateSize();
}

function expandSidebar(e) {
    e.preventDefault();
    jQuery("#map_container").hide()
    mapIsVisible = false;
    jQuery("#toggle_sidebar_control").hide();
    jQuery("#splitter").hide();
    jQuery("#shrink_sidebar_button").show();
    jQuery("#sidebar_container").width("100%");
    TAR.planeMan.redraw();
    updateMapSize();
    adjustInfoBlock();
}

function showMap() {
    jQuery('#sidebar_container').width(loStore['sidebar_width']).css('margin-left', '0');
    jQuery("#map_container").show()
    mapIsVisible = true;
    jQuery("#toggle_sidebar_control").show();
    jQuery("#splitter").show();
    jQuery("#shrink_sidebar_button").hide();
    TAR.planeMan.redraw();
    updateMapSize();
}


let selectedPhotoCache = null;

// Photo box and credit line are only rewritten when their content actually
// changes - refreshSelected() runs about once a second, and rewriting them
// each time re-laid-out the whole panel. Both return true when they changed.
function setPhotoHtml(source) {
    if (selectedPhotoCache == source)
        return false;
    selectedPhotoCache = source;
    jQuery('#selected_photo').html(source);
    return true;
}

let selectedCopyrightCache = null;
function setCopyrightHtml(html) {
    if (selectedCopyrightCache === html)
        return false;
    selectedCopyrightCache = html;
    setCopyrightHtml(html);
    return true;
}

// ---- Domain-aware info panel + mobile bottom sheet ------------------------

function objectDomain(plane) {
    if (!plane) return null;
    if (plane.isSatellite) return 'sat';
    if (String(plane.icao).startsWith('MMSI')) return 'vessel';
    return 'air';
}

function setInfoblockDomain(plane) {
    const domain = objectDomain(plane);
    if (domain === g.panelDomain) return;
    const el = document.getElementById('selected_infoblock');
    if (!el) return;
    el.classList.remove('domain-air', 'domain-vessel', 'domain-sat');
    if (domain) el.classList.add('domain-' + domain);
    g.panelDomain = domain;
}

// One-line "key facts" for the collapsed sheet, per domain.
// CelesTrak owner code -> ISO 3166 alpha-2, for the satellite's flag. Only
// single-country owners: multinational bodies and companies (ESA, INTELSAT,
// SES, joint owners like FGER) get no flag rather than a misleading one.
// CIS (USSR and successors) shows the Russian flag, as the operator today.
const SAT_OWNER_ISO = {
    ALG: 'DZ', ANG: 'AO', ARGN: 'AR', ARM: 'AM', ASRA: 'AT', AUS: 'AU', AZER: 'AZ',
    BEL: 'BE', BELA: 'BY', BERM: 'BM', BGD: 'BD', BHR: 'BH', BHUT: 'BT', BOL: 'BO',
    BRAZ: 'BR', BUL: 'BG', BWA: 'BW', CA: 'CA', CHLE: 'CL', CIS: 'RU', COL: 'CO',
    CRI: 'CR', CZCH: 'CZ', DEN: 'DK', DJI: 'DJ', ECU: 'EC', EGYP: 'EG', EST: 'EE',
    ETH: 'ET', FIN: 'FI', FR: 'FR', GER: 'DE', GHA: 'GH', GREC: 'GR', GUAT: 'GT',
    HRV: 'HR', HUN: 'HU', IND: 'IN', INDO: 'ID', IRAN: 'IR', IRAQ: 'IQ', IRL: 'IE',
    ISRA: 'IL', ISRO: 'IN', IT: 'IT', JPN: 'JP', KAZ: 'KZ', KEN: 'KE', LAOS: 'LA',
    LKA: 'LK', LTU: 'LT', LUXE: 'LU', MA: 'MA', MALA: 'MY', MCO: 'MC', MDA: 'MD',
    MEX: 'MX', MMR: 'MM', MNE: 'ME', MNG: 'MN', MUS: 'MU', NETH: 'NL', NIG: 'NG',
    NKOR: 'KP', NOR: 'NO', NPL: 'NP', NZ: 'NZ', PAKI: 'PK', PERU: 'PE', POL: 'PL',
    POR: 'PT', PRC: 'CN', PRY: 'PY', QAT: 'QA', ROC: 'TW', ROM: 'RO', RP: 'PH',
    RWA: 'RW', SAFR: 'ZA', SAUD: 'SA', SDN: 'SD', SEN: 'SN', SING: 'SG', SKOR: 'KR',
    SLB: 'SB', SPN: 'ES', SVN: 'SI', SWED: 'SE', SWTZ: 'CH', THAI: 'TH', TUN: 'TN',
    TURK: 'TR', UAE: 'AE', UK: 'GB', UKR: 'UA', URY: 'UY', US: 'US', VAT: 'VA',
    VENZ: 'VE', VTNM: 'VN', ZWE: 'ZW',
};

// Flag for the sheet header: the same flags/3x2 set the table's flag column
// uses. The image is only swapped when the country changes (refreshSelected
// runs every second), and hidden again if a flag file is missing.
function updateSheetFlag(p) {
    updateFlagImages(p, ['sheetFlag', 'selectedFlag']);
}

// { code: 'GB', title: 'United Kingdom' } for an object's flag, or code null.
function flagInfo(p) {
    let code = null, title = '';
    if (p && p.isSatellite) {
        code = p.satOwnerCode ? (SAT_OWNER_ISO[p.satOwnerCode] || null) : null;
        title = p.satOwner || '';
    } else if (p && p.country_code) {
        code = String(p.country_code).toUpperCase();
        title = (typeof getDisplayCountry === 'function' && getDisplayCountry(p)) || p.country || '';
    }
    if (code && !/^[A-Z]{2}(-[A-Z]{2,3})?$/.test(code)) code = null;
    return { code: code, title: title };
}

function updateFlagImages(p, ids) {
    const flag = flagInfo(p);
    const code = flag.code, title = flag.title;
    for (const id of ids) {
        const img = document.getElementById(id);
        if (!img) continue;
        if (!code) {
            img.hidden = true;
            img.removeAttribute('src');
            img.dataset.code = '';
            continue;
        }
        if (img.dataset.code !== code) {
            img.dataset.code = code;
            img.onerror = function () { this.hidden = true; };
            img.onload = function () { this.hidden = false; };
            img.src = 'flags/3x2/' + code + '.svg';
        }
        if (img.title !== title) { img.title = title; img.alt = title; }
    }
}

// "NCL-CDG" for the sheet header. Uses the compact form routeCheck() builds
// when it has it; otherwise derives one from whatever route string the
// sidebar shows (route API in any routeDisplay mode, or a route that arrived
// in the feed data itself), e.g. "EGNT/NCL - LFPG/CDG" -> "NCL-CDG".
function shortRoute(p) {
    if (!p) return '';
    if (p.routeShort) return p.routeShort;
    const str = p.routeString;
    if (!str || typeof str !== 'string') return '';
    let doubtful = false;
    let body = str.trim();
    if (body.startsWith('??')) { doubtful = true; body = body.slice(2).trim(); }
    const legs = body.split(/\s*-\s*/).map(leg => {
        const codes = leg.split('/').map(c => c.trim()).filter(Boolean);
        // prefer a 3-letter IATA code, then a 4-letter ICAO code, else as given
        return codes.find(c => /^[A-Z0-9]{3}$/.test(c))
            || codes.find(c => /^[A-Z0-9]{4}$/.test(c))
            || codes[0] || '';
    }).filter(Boolean);
    if (!legs.length) return '';
    return (doubtful ? '? ' : '') + legs.join('-');
}

// Third header line: where it's going. Aircraft: city names from the route
// API ("Newcastle → Paris"), airport codes when no city is known. Vessels:
// the AIS destination. Empty (line hidden) otherwise.
function sheetRouteLine(p) {
    const domain = objectDomain(p);
    if (domain === 'vessel') return p.destination ? '→ ' + p.destination : '';
    if (domain !== 'air') return '';
    const doubtful = typeof p.routeString === 'string' && p.routeString.trim().startsWith('??');
    if (p.routeVerbose && typeof p.routeVerbose === 'string') {
        const cities = p.routeVerbose.split(/\s+-\s+/).map(c => c.trim()).filter(Boolean);
        if (cities.length > 1) return (doubtful ? '? ' : '') + cities.join(' → ');
    }
    const codes = shortRoute(p);
    return codes ? codes.replace(/-/g, ' → ') : '';
}

function sheetFacts(p) {
    const parts = [];
    const domain = objectDomain(p);
    if (domain === 'sat') {
        // "LEO · 413 × 420 km · 51.6° · 92.9 min": what kind of orbit and
        // where it goes, which the live altitude/speed alone don't say (both
        // are in the panel once the sheet is opened).
        const summary = formatSatelliteOrbitSummary(p, true);
        // (A stale element set is flagged in the TLE Age row, not here, so
        // the orbit summary isn't cut short on a narrow screen.)
        if (summary) {
            parts.push(summary);
        } else {
            const def = (typeof SAT_CATEGORIES !== 'undefined')
                ? (SAT_CATEGORIES[p.satCategory] || SAT_CATEGORIES.other) : null;
            if (def) parts.push(def.label);
            if (p.altitude != null) parts.push(formatSatelliteAltitude(p.altitude));
            if (p.speed != null) parts.push(format_speed_long(p.speed, DisplayUnits));
        }
    } else if (domain === 'vessel') {
        // an emergency leads, so a narrow screen's ellipsis can't hide it
        if (getEmergencyLevel(p)) parts.push(getEmergencyDescription(p));
        if (p.typeDescription) parts.push(p.typeDescription);
        if (p.speed != null) parts.push(format_speed_long(p.speed, DisplayUnits));
        if (!getEmergencyLevel(p) && p.statusDescription) parts.push(p.statusDescription);
    } else {
        if (getEmergencyLevel(p)) parts.push(getEmergencyDescription(p));
        // Full type name (the route has its own line now); ICAO code as fallback
        const type = p.typeLong || p.icaoType;
        if (type) parts.push(type);
        if (p.altitude != null) parts.push(format_altitude_long(p.altitude, p.vert_rate, DisplayUnits));
        if (p.speed != null) parts.push(format_speed_long(p.speed, DisplayUnits));
        if (!getEmergencyLevel(p) && p.squawk) parts.push('Sqk\u00a0' + p.squawk);
    }
    return parts.join(' · ');
}

// Sheet state: 0 = peek (summary strip), 1 = half screen, 2 = (nearly) full.
g.sheet = { active: false, state: 0, padding: 0, icao: null, y0: null, gestures: false,
            dragging: false, startH: 0, lastY: 0, lastT: 0, velocity: 0,
            preferred: null,      // height the user last chose by tap/drag (this visit only)
            nextSource: null };   // { src: 'map', t } - set just before a map-tap selection

// Same width test the old "narrow map" infoblock branch used.
// Map width, kept up to date by a ResizeObserver rather than measured on
// every call (isSheetLayout() runs on every refresh).
let mapCanvasWidth = null;
function currentMapWidth() {
    if (mapCanvasWidth != null) return mapCanvasWidth;
    const canvas = document.getElementById('map_canvas');
    if (!canvas) return null;
    mapCanvasWidth = canvas.clientWidth;
    if (typeof ResizeObserver === 'function' && !currentMapWidth.observer) {
        currentMapWidth.observer = new ResizeObserver(function (entries) {
            for (const e of entries) mapCanvasWidth = Math.round(e.contentRect.width);
        });
        currentMapWidth.observer.observe(canvas);
    } else if (!currentMapWidth.observer) {
        mapCanvasWidth = null;   // no ResizeObserver: measure each time, as before
    }
    return canvas.clientWidth;
}

function isSheetLayout() {
    if (!mapIsVisible || !toggles['enableInfoblock'] || !toggles['enableInfoblock'].state) return false;
    const w = currentMapWidth();
    return w != null && w < infoBlockWidth * globalScale * 3;
}

// Height of the iPhone home-bar area (0 elsewhere, and in Safari's normal
// browser view). The home-screen web app draws full screen (viewport-fit=cover),
// so the sheet's minimised height adds this to keep its header above the bar.
function safeAreaBottom() {
    let probe = safeAreaBottom.probe;
    if (!probe) {
        probe = safeAreaBottom.probe = document.createElement('div');
        probe.setAttribute('style', 'position:fixed;left:0;bottom:0;width:0;visibility:hidden;pointer-events:none;height:env(safe-area-inset-bottom, 0px)');
        document.body.appendChild(probe);
    }
    let h = probe.offsetHeight || 0;
    // Installed iPhone app on a Face ID iPhone (curved corners + home bar,
    // screen 812pt or taller; Home-button models like the SE are 667pt):
    // keep the standard 34pt clearance even when iOS reports no inset, which
    // it can do - otherwise the bottom lines sit in the curved corners.
    if (window.navigator.standalone === true && window.screen &&
        Math.max(window.screen.width, window.screen.height) >= 812) {
        h = Math.max(h, 34);
    }
    return h;
}


// Measured sheet geometry, cached. refreshSelected() -> adjustInfoBlock() runs
// about once a second; measuring sizes there forced the browser to recalculate
// layout every time. The cache is dropped only when something can actually
// have changed: window resize / rotation, or the map or sheet header changing
// size (ResizeObserver, e.g. the route line appearing).
let sheetGeomCache = null;
let sheetGeomObserver = null;
function invalidateSheetGeometry() {
    sheetGeomCache = null;
}
function watchSheetGeometry() {
    if (sheetGeomObserver || typeof ResizeObserver !== 'function') return;
    const targets = ['map_canvas', 'sheetHandle'].map(id => document.getElementById(id)).filter(Boolean);
    if (!targets.length) return;
    sheetGeomObserver = new ResizeObserver(function () {
        invalidateSheetGeometry();
        // re-apply straight away so the minimised height follows the header
        if (g.sheet && g.sheet.active && !g.sheet.dragging) applySheetLayout();
    });
    targets.forEach(t => sheetGeomObserver.observe(t));
    window.addEventListener('resize', invalidateSheetGeometry);
    window.addEventListener('orientationchange', invalidateSheetGeometry);
}

function sheetGeometry() {
    if (sheetGeomCache) return sheetGeomCache;
    watchSheetGeometry();
    const canvas = document.getElementById('map_canvas');
    const H = canvas ? canvas.clientHeight : window.innerHeight;
    const handle = document.getElementById('sheetHandle');
    const peek = ((handle && handle.offsetHeight) ? handle.offsetHeight : Math.round(72 * globalScale)) + safeAreaBottom();
    const half = Math.max(peek, Math.round(H * 0.5));
    // Full height stops just below the top bar (the map canvas starts there)
    const topLimit = 6;
    const full = Math.max(half, H - topLimit);
    // horizontal placement of the sheet over the map
    const el = document.getElementById('selected_infoblock');
    const mapEl = document.getElementById('map_container');
    let left = 0, width = window.innerWidth;
    if (el && mapEl) {
        const rect = mapEl.getBoundingClientRect();
        // left is relative to #layout_container (the sheet's positioned
        // parent), which in landscape on an iPhone already sits clear of the notch
        const parent = el.offsetParent || document.body;
        left = Math.round(rect.left - parent.getBoundingClientRect().left);
        width = Math.round(rect.width);
    }
    // only cache a complete measurement (the header has a real height once shown)
    const g2 = { heights: [peek, half, full], left: left, width: width };
    if (handle && handle.offsetHeight) sheetGeomCache = g2;
    return g2;
}

function sheetHeights() {
    return sheetGeometry().heights;
}

// Bottom padding on the map view = the part of the map the sheet covers
// (capped at half the map: in the full state the map is barely visible and
// re-centring into a sliver would be pointless). With view padding, OpenLayers
// centres - including Follow (F) via setProjection('follow') - in the uncovered
// area. The padding setter keeps the map visually still, so a followed object
// is re-centred explicitly; otherwise it is only moved if the sheet now covers it.
// The map view's padding combines both panels that can cover the map: the
// mobile sheet (bottom) and the desktop sidebar (left, it overlays the map).
g.viewPad = { bottom: 0, left: 0 };
function applyViewPadding() {
    if (!OLMap) return;
    const view = OLMap.getView();
    if ('padding' in view) {
        view.padding = [0, 0, g.viewPad.bottom, g.viewPad.left];
    }
}

function setSheetPadding(px) {
    px = Math.max(0, Math.round(px));
    if (g.sheet.padding === px) return;
    g.sheet.padding = px;
    document.documentElement.style.setProperty('--SHEET-OFFSET', px + 'px');
    updateViewBottom(true);
    if (!OLMap) return;
    recentreSelectedForSheet();
}

// Phones: the bottom pill always covers the foot of the map, so the map's
// centre (Home, centring, Follow) is the area above it - or above the sheet,
// when that is taller. Desktop: the sheet only (0 without one).
function dockPadding() {
    if (!document.documentElement.classList.contains('phoneUI')) return 0;
    const dock = document.getElementById('appDock');
    const canvas = document.getElementById('map_canvas');
    if (!dock || !canvas || getComputedStyle(dock).display === 'none') return 0;
    // measured from where the pill rests (a probe with the same position),
    // not the pill itself, which may be mid-animation or lifted over the sheet
    let probe = dockPadding.probe;
    if (!probe) {
        probe = dockPadding.probe = document.createElement('div');
        probe.setAttribute('style', 'position:absolute;left:0;width:0;visibility:hidden;pointer-events:none;'
            + 'bottom:var(--DOCK-B);height:var(--DOCK-H)');
        canvas.appendChild(probe);
    }
    const r = probe.getBoundingClientRect();
    const c = canvas.getBoundingClientRect();
    return Math.max(0, Math.round(c.bottom - r.top + 4));
}
function updateViewBottom(force) {
    const px = Math.max(g.sheet.padding || 0, dockPadding());
    if (g.viewPad.bottom === px && !force) return;
    g.viewPad.bottom = px;
    applyViewPadding();
}

// Desktop sidebar: left padding = its width, so Follow (and centring) use the
// part of the map the sidebar doesn't cover. The padding setter keeps the map
// visually still; a followed object then glides to the new centre.
// The credits box can wrap on narrow screens, and which credits show depends
// on the visible layers, so its height is measured rather than assumed.
function initAttributionOffset() {
    const root = document.documentElement;
    let pending = false;
    let scaleWatched = null;
    const setVar = function (name, val) {
        if (root.style.getPropertyValue(name) !== val) root.style.setProperty(name, val);
    };
    // --ATTR-H: height of the credits box. The bottom pill sits above it, so
    // credits that wrap onto two lines (phones, some base maps) lift the pill
    // rather than run underneath it.
    // --SCALE-R: right edge of the scale bar, from the left of the map. The
    // credits box is never wider than the space right of it, so the two can't
    // overlap - the scale bar changes width as the map zooms, and moves right
    // beside the desktop object panel.
    function update() {
        pending = false;
        const canvas = document.getElementById('map_canvas');
        const attr = document.querySelector('#map_canvas .ol-attribution');
        if (!canvas || !attr) return;
        setVar('--ATTR-H', Math.ceil(attr.getBoundingClientRect().height) + 'px');
        updateViewBottom();
        const scale = canvas.querySelector('.ol-scale-line');
        if (scale && scale !== scaleWatched) watchScale(scale);
        const r = scale ? scale.getBoundingClientRect() : null;
        const right = (r && r.width > 0) ? Math.ceil(r.right - canvas.getBoundingClientRect().left) : 0;
        setVar('--SCALE-R', right + 'px');
    }
    function schedule() {
        if (pending) return;
        pending = true;
        requestAnimationFrame(update);
    }
    // ResizeObserver / MutationObserver fire only when the credits or scale
    // bar actually change (layers, wrapping, zoom, panel opening) - no
    // per-frame polling, which forced a layout recalculation on every frame.
    function watchScale(scale) {
        scaleWatched = scale;
        if (typeof ResizeObserver === 'function') new ResizeObserver(schedule).observe(scale);
        if (typeof MutationObserver === 'function') {
            new MutationObserver(schedule).observe(scale, { attributes: true, attributeFilter: ['style', 'class'] });
        }
    }
    const attr = document.querySelector('#map_canvas .ol-attribution');
    if (attr && typeof ResizeObserver === 'function') new ResizeObserver(schedule).observe(attr);
    window.addEventListener('resize', schedule);   // also re-checks phone / desktop padding
    if (OLMap) OLMap.on('moveend', schedule);   // the scale bar is created with the map
    schedule();
}

function setSidebarPadding(px) {
    px = Math.max(0, Math.round(px));
    if (g.viewPad.left === px) return;
    g.viewPad.left = px;
    // the bottom pill (and the search box above it) move aside for the panel
    document.documentElement.style.setProperty('--PANEL-L', px + 'px');
    if (typeof layoutSearchBox === 'function') layoutSearchBox();
    if (!OLMap) return;
    applyViewPadding();
    if (FollowSelected && SelectedPlane && SelectedPlane.position) {
        SelectedPlane.setProjection('follow');
    }
}

// Map coordinate of `plane` if the details panel is about to close while it
// sits in the visible (unpadded) part of the map; null otherwise. Runs before
// the padding is removed, and only when there is padding to remove, so it
// costs nothing on the once-a-second refreshes with no selection.
function panelCloseTarget(plane) {
    if (!OLMap || !plane || !plane.position) return null;
    const pad = g.viewPad;
    if (!(g.sheet.padding > 0 || pad.left > 0)) return null;
    const coord = ol.proj.fromLonLat(plane.position);
    const px = OLMap.getPixelFromCoordinate(coord);
    const size = OLMap.getSize();
    if (!px || !size) return null;
    const inView = px[0] >= pad.left && px[0] <= size[0]
        && px[1] >= 0 && px[1] <= size[1] - pad.bottom;
    return inView ? coord : null;
}

// Is the selected-object panel showing (sidebar on desktop, sheet on phones)?
function infoblockShown() {
    return !!(mapIsVisible && toggles['enableInfoblock'] && toggles['enableInfoblock'].state);
}

function recentreSelectedForSheet() {
    const sel = SelectedPlane;
    if (!sel || !sel.position || !OLMap) return;
    if (FollowSelected) {
        sel.setProjection('follow');
        return;
    }
    if (!g.sheet.padding) return;
    const proj = ol.proj.fromLonLat(sel.position);
    const pixel = OLMap.getPixelFromCoordinate(proj);
    const size = OLMap.getSize();
    if (pixel && size && pixel[1] > size[1] - g.sheet.padding - 20) {
        OLMap.getView().animate({ center: proj, duration: 250 });
    }
}

function applySheetLayout() {
    const el = document.getElementById('selected_infoblock');
    const mapEl = document.getElementById('map_container');
    if (!el || !mapEl) return;
    initSheetGestures();

    const icao = SelectedPlane ? SelectedPlane.icao : null;
    if (g.sheet.icao !== icao) {
        g.sheet.icao = icao;
        // Every new selection opens at mid height (the user can swipe it down).
        // Placed without the height animation (as if mid-drag) so it never
        // sweeps in from a stale height left by the previous selection.
        g.sheet.state = 1;
        el.classList.add('sheetDragging');
        requestAnimationFrame(function () {
            requestAnimationFrame(function () { el.classList.remove('sheetDragging'); });
        });
    }
    g.sheet.nextSource = null;
    if (!g.sheet.active) {
        el.classList.add('sheet');
        document.documentElement.classList.add('sheetOpen');
        g.sheet.active = true;
        invalidateSheetGeometry();   // sheet styling changes the header's size
    }
    const geo = sheetGeometry();
    // style writes only when the value changes (this runs every refresh)
    const left = geo.left + 'px', width = geo.width + 'px';
    if (el.style.left !== left) el.style.left = left;
    if (el.style.width !== width) el.style.width = width;
    // While the finger is on the handle the drag owns the height; padding and
    // re-centring wait until it snaps (see initSheetGestures()).
    if (g.sheet.dragging) return;
    const heights = geo.heights;
    const h = heights[g.sheet.state];
    const hpx = h + 'px';
    if (el.style.height !== hpx) el.style.height = hpx;
    // Minimised: the bottom pill stays in use, floating just above the sheet
    // (html.sheetPeek in the stylesheet), and the map's padding covers it too, so
    // the selected object is never centred underneath it.
    const peek = g.sheet.state === 0;
    setSheetPeek(peek, h);
    let pad = Math.min(h, heights[1]);
    if (peek) {
        const dock = document.getElementById('appDock');
        if (dock && dock.offsetParent !== null) pad += dock.offsetHeight + 10;
    }
    setSheetPadding(pad);
}

// html.sheetPeek + --SHEET-PEEK-H: the sheet is minimised and this tall
function setSheetPeek(on, h) {
    const root = document.documentElement;
    root.classList.toggle('sheetPeek', !!on);
    if (on) {
        const v = Math.round(h) + 'px';
        if (root.style.getPropertyValue('--SHEET-PEEK-H') !== v) root.style.setProperty('--SHEET-PEEK-H', v);
    }
}

function clearSheetLayout() {
    if (g.sheet.active) {
        const el = document.getElementById('selected_infoblock');
        if (el) {
            el.classList.remove('sheet');
            el.style.left = '';
        }
        document.documentElement.classList.remove('sheetOpen');
        setSheetPeek(false);
        g.sheet.active = false;
    }
    g.sheet.icao = null;
    g.sheet.state = 0;
    setSheetPadding(0);
}

function sheetSetState(n, force) {
    n = Math.max(0, Math.min(2, n));
    // Only called from a tap or drag on the sheet, so this is the user's choice.
    // Full screen is remembered as mid: opening every later selection over the
    // whole map would hide what was just tapped.
    g.sheet.preferred = Math.min(n, 1);
    if (n === g.sheet.state && !force) return;
    g.sheet.state = n;
    adjustInfoBlock();
}

function sheetTap() {
    // peek -> half, half -> peek, full -> half
    sheetSetState(g.sheet.state === 0 ? 1 : (g.sheet.state === 1 ? 0 : 1));
}

function initSheetGestures() {
    if (g.sheet.gestures) return;
    const handle = document.getElementById('sheetHandle');
    if (!handle) return;
    g.sheet.gestures = true;
    const DRAG_START_PX = 6;      // movement before a press counts as a drag, not a tap
    const FLICK_PX_PER_MS = 0.5;  // release speed that carries on to the next state

    function endDrag(e, cancelled) {
        const wasDragging = g.sheet.dragging;
        const dy = (g.sheet.y0 == null || !e) ? 0 : e.clientY - g.sheet.y0;
        g.sheet.y0 = null;
        if (!wasDragging) {
            if (!cancelled && Math.abs(dy) < DRAG_START_PX) sheetTap();
            return;
        }
        g.sheet.dragging = false;
        const el = document.getElementById('selected_infoblock');
        el.classList.remove('sheetDragging');

        // Snap: a flick goes to the next state in its direction, otherwise to
        // the nearest state by height.
        const heights = sheetHeights();
        const h = el.getBoundingClientRect().height;
        const v = cancelled ? 0 : g.sheet.velocity;   // px/ms, negative = upwards
        let target;
        if (v < -FLICK_PX_PER_MS) {
            target = heights.findIndex(x => x > h + 1);
            if (target < 0) target = 2;
        } else if (v > FLICK_PX_PER_MS) {
            target = 0;
            for (let i = heights.length - 1; i >= 0; i--) {
                if (heights[i] < h - 1) { target = i; break; }
            }
        } else {
            target = 0;
            for (let i = 1; i < heights.length; i++) {
                if (Math.abs(heights[i] - h) < Math.abs(heights[target] - h)) target = i;
            }
        }
        sheetSetState(target, true);   // force: re-applies height, padding and re-centring
    }

    handle.addEventListener('pointerdown', function (e) {
        g.sheet.y0 = e.clientY;
        g.sheet.lastY = e.clientY;
        g.sheet.lastT = e.timeStamp;
        g.sheet.velocity = 0;
        g.sheet.startH = document.getElementById('selected_infoblock').getBoundingClientRect().height;
        // keep receiving this pointer's events even once the finger / cursor
        // has left the handle, so the drag and its pointerup land here
        try { handle.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ }
    });
    handle.addEventListener('pointermove', function (e) {
        if (g.sheet.y0 == null) return;
        const dy = e.clientY - g.sheet.y0;
        const el = document.getElementById('selected_infoblock');
        if (!g.sheet.dragging) {
            if (Math.abs(dy) < DRAG_START_PX) return;
            g.sheet.dragging = true;
            el.classList.add('sheetDragging');   // no height transition while tracking the finger
            setSheetPeek(false);                 // the pill steps aside while the sheet moves
        }
        const heights = sheetHeights();
        const h = Math.max(heights[0], Math.min(heights[2], g.sheet.startH - dy));
        el.style.height = Math.round(h) + 'px';
        // release velocity, smoothed over the last few move events
        const dt = e.timeStamp - g.sheet.lastT;
        if (dt > 0) {
            const inst = (e.clientY - g.sheet.lastY) / dt;
            g.sheet.velocity = 0.6 * inst + 0.4 * g.sheet.velocity;
        }
        g.sheet.lastY = e.clientY;
        g.sheet.lastT = e.timeStamp;
    });
    handle.addEventListener('pointerup', function (e) {
        if (g.sheet.y0 == null) return;
        // a pause before letting go is not a flick
        if (e.timeStamp - g.sheet.lastT > 120) g.sheet.velocity = 0;
        endDrag(e, false);
    });
    handle.addEventListener('pointercancel', function (e) {
        endDrag(e, true);
    });
    handle.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            sheetTap();
        }
    });
}

// Re-evaluate layout on resize / rotation (debounced).
let sheetResizeTimer = null;
window.addEventListener('resize', function () {
    clearTimeout(sheetResizeTimer);
    sheetResizeTimer = setTimeout(function () {
        if (loadFinished) adjustInfoBlock();
    }, 150);
});

function adjustInfoBlock() {
    if (wideInfoBlock ) {
        infoBlockWidth = baseInfoBlockWidth + 40;
    } else {
        infoBlockWidth = baseInfoBlockWidth;
    }
    // Desktop sizes only when the desktop panel is in use: in the mobile sheet
    // these were written here and then overwritten below on every refresh,
    // flipping the panel width / scale-bar position back and forth each second.
    const sheetMode = !!(SelectedPlane && toggles['enableInfoblock'].state && isSheetLayout());
    if (!sheetMode) {
        jQuery('#selected_infoblock').css("width", infoBlockWidth * globalScale + 'px');
        jQuery('.ol-scale-line').css('left', (infoBlockWidth * globalScale + 8) + 'px');
        jQuery('#replayBar').css('left', (infoBlockWidth * globalScale) + 'px');   // beside the details panel
    }

    if (SelectedPlane && toggles['enableInfoblock'].state) {

        if (!mapIsVisible)
            jQuery("#sidebar_container").css('margin-left', '140pt');
        //jQuery('#sidebar_canvas').css('margin-bottom', jQuery('#selected_infoblock').height() + 'px');
        //
        // Shown before laying out, so the sheet header can be measured.
        jQuery('#selected_infoblock').show();

        if (sheetMode) {
            // Narrow map (phones): bottom sheet instead of the left panel.
            jQuery('.ol-scale-line').css('left', '');   // the stylesheet keeps it clear of the screen corners
            jQuery('#replayBar').css('left', '0px');
            setSidebarPadding(0);
            applySheetLayout();
        } else {
            clearSheetLayout();
            setSidebarPadding(mapIsVisible ? Math.round(infoBlockWidth * globalScale) : 0);   // the width set above - no layout read
            jQuery('#selected_infoblock').css('height', '100%');
            jQuery('#credits').css('bottom', '');
            jQuery('#credits').css('left', '');
        }
    } else {
        if (!mapIsVisible)
            jQuery("#sidebar_container").css('margin-left', '0');
        //jQuery('#sidebar_canvas').css('margin-bottom', 0);

        jQuery('.ol-scale-line').css('left', '');   // the stylesheet keeps it clear of the screen corners
        jQuery('#replayBar').css('left', '0px');
        jQuery('#credits').css('bottom', '');
        jQuery('#credits').css('left', '');

        // Panel closing: the object it showed was centred in the smaller map
        // area beside / above it. Removing the padding keeps the map still, so
        // move that object to the centre of the full map instead - but only if
        // it's actually in view (not after the user has panned away from it).
        const recentre = panelCloseTarget(SelectedPlane || lastSelected);
        clearSheetLayout();
        setSidebarPadding(0);
        jQuery('#selected_infoblock').hide();
        if (recentre) OLMap.getView().animate({ center: recentre, duration: 300 });
    }

    // Images are one fixed 171x114 box (style.css), centred across the panel
    // in both the sidebar and the bottom sheet - so the photo box is no longer
    // pinned to the sidebar width, nor given the old photo-height.
    jQuery('#selected_photo').css("width", '');
    jQuery('#photo_container').css('height', '');
}

function initializeUnitsSelector() {
    // Get display unit preferences from local storage otherwise use value previously set defaults.js or config.js
    if (loStore.getItem('displayUnits')) {
        DisplayUnits = loStore['displayUnits'];
    }

    // Initialize drop-down
    jQuery('#units_selector')
        .val(DisplayUnits)
        .on('change', onDisplayUnitsChanged);

    jQuery(".altitudeUnit").text(get_unit_label("altitude", DisplayUnits));
    jQuery(".speedUnit").text(get_unit_label("speed", DisplayUnits));
    jQuery(".distanceUnit").text(get_unit_label("distance", DisplayUnits));
    jQuery(".verticalRateUnit").text(get_unit_label("verticalRate", DisplayUnits));
}

function onDisplayUnitsChanged(e) {
    loStore['displayUnits'] = DisplayUnits = e.target.value;

    TAR.altitudeChart.render();

    // Update filters
    updateAltFilter();

    // Refresh data
    refreshFilter();

    // Draw range rings
    drawSiteCircle();

    // Reset map scale line units
    OLMap.getControls().forEach(function(control) {
        if (control instanceof ol.control.ScaleLine) {
            control.setUnits(DisplayUnits);
        }
    });

    jQuery(".altitudeUnit").text(get_unit_label("altitude", DisplayUnits));
    jQuery(".speedUnit").text(get_unit_label("speed", DisplayUnits));
    jQuery(".distanceUnit").text(get_unit_label("distance", DisplayUnits));
    jQuery(".verticalRateUnit").text(get_unit_label("verticalRate", DisplayUnits));
    TAR.planeMan.redraw();

    remakeTrails();
    refreshSelected();
}

function onFilterByAltitude(e) {
    e.preventDefault();
    jQuery("#altitude_filter_min").blur();
    jQuery("#altitude_filter_max").blur();

    updateAltFilter();
    refreshFilter();
}

function filterGroundVehicles(switchFilter) {
    if (typeof loStore['groundVehicleFilter'] === 'undefined') {
        loStore['groundVehicleFilter'] = 'not_filtered';
    }
    let groundFilter = loStore['groundVehicleFilter'];
    if (switchFilter === true) {
        groundFilter = (groundFilter === 'not_filtered') ? 'filtered' : 'not_filtered';
    }
    if (groundFilter === 'not_filtered') {
        jQuery('#groundvehicle_filter').addClass('settingsCheckboxChecked');
    } else {
        jQuery('#groundvehicle_filter').removeClass('settingsCheckboxChecked');
    }
    loStore['groundVehicleFilter'] = groundFilter;
    PlaneFilter.groundVehicles = groundFilter;
}

function filterBlockedMLAT(switchFilter) {
    if (typeof loStore['blockedMLATFilter'] === 'undefined') {
        loStore['blockedMLATFilter'] = 'not_filtered';
    }
    let blockedMLATFilter = loStore['blockedMLATFilter'];
    if (switchFilter === true) {
        blockedMLATFilter = (blockedMLATFilter === 'not_filtered') ? 'filtered' : 'not_filtered';
    }
    if (blockedMLATFilter === 'not_filtered') {
        jQuery('#blockedmlat_filter').addClass('settingsCheckboxChecked');
    } else {
        jQuery('#blockedmlat_filter').removeClass('settingsCheckboxChecked');
    }
    loStore['blockedMLATFilter'] = blockedMLATFilter;
    PlaneFilter.blockedMLAT = blockedMLATFilter;
}

function buttonActive(id, state) {
    if (state) {
        jQuery(id).addClass('activeButton');
        jQuery(id).removeClass('inActiveButton');
    } else {
        jQuery(id).addClass('inActiveButton');
        jQuery(id).removeClass('activeButton');
    }
}

function toggleIsolation(state, noRefresh) {
    let prevState = onlySelected;
    if (showTrace && state !== "on")
        return;

    let newState = !onlySelected;
    if (state === "on")
        newState = true;
    if (state === "off")
        newState = false;

    // Don't allow turning isolation on if nothing is selected —
    // there's nothing to isolate to, so leave the button/state as-is.
    if (newState === true && !SelectedPlane) {
        return;
    }

    onlySelected = newState;

    buttonActive('#I', onlySelected);

    if (prevState != onlySelected && noRefresh != "noRefresh")
        refreshFilter();

    fetchData({force: true});
}

// Removes every object of one domain (vessels or satellites) in a single
// pass - used when that domain is switched off, since its feed then stops
// being polled. destroy() also deselects the object if it was selected.
function removeDomainObjects(test) {
    const keep = [];
    for (let i = 0; i < g.planesOrdered.length; i++) {
        const plane = g.planesOrdered[i];
        if (plane && test(plane)) {
            delete g.planes[plane.icao];
            plane.destroy();
        } else {
            keep.push(plane);
        }
    }
    g.planesOrdered = keep;
}

function toggleMarine() {
    window.ShowMarine = !window.ShowMarine;
    buttonActive('#Ma', window.ShowMarine);
    // Marine off: the AIS feed is no longer polled (see updateAIScatcher()),
    // so drop the vessels now; Marine on: fetch straight away.
    if (!window.ShowMarine) {
        removeDomainObjects(plane => String(plane.icao).startsWith('MMSI'));
    } else if (aiscatcher_server && timersActive) {
        updateAIScatcher();
    }
    // Dynamic hybrid layer toggle for OpenLayers
    if (g && g.aiscatcherLayer && typeof g.aiscatcherLayer.setVisible === 'function') {
        g.aiscatcherLayer.setVisible(window.ShowMarine);
    }
    if (typeof refreshAisHullSource === 'function') {
        refreshAisHullSource(true);   // load or drop hull outlines straight away
    }
    if (g && g.aisTrackLayer && typeof g.aisTrackLayer.setVisible === 'function') {
        g.aisTrackLayer.setVisible(window.ShowMarine);
    }
    // Force tar1090 to look at planeObject.js and filter the table rows
    if (typeof refreshFilter === 'function') refreshFilter();
    if (typeof active === 'function') active();
    if (typeof fetchData === 'function') fetchData({force: true});
}

function toggleAir() {
    window.ShowAir = !window.ShowAir;
    buttonActive('#A', window.ShowAir); // Uses the built-in helper function from your code

    if (typeof refreshFilter === 'function') refreshFilter();
    if (typeof active === 'function') active();
    if (typeof fetchData === 'function') fetchData({force: true});
}

function toggleSatellite() {
    window.ShowSatellites = !window.ShowSatellites;
    buttonActive('#Sa', window.ShowSatellites);
    loStore['ShowSatellites'] = window.ShowSatellites ? 'true' : 'false';

    // Same as Marine: no polling while off, so drop them now / fetch at once.
    if (!window.ShowSatellites) {
        removeDomainObjects(plane => plane.isSatellite);
        if (typeof resetSelectedTrack === 'function' && g.trackState && String(g.trackState.key).startsWith('SAT')) {
            resetSelectedTrack();
        }
    } else if (satelliteJson && timersActive) {
        updateSatellites();
    }

    if (typeof refreshFilter === 'function') refreshFilter();
    if (typeof active === 'function') active();
    if (typeof fetchData === 'function') fetchData({force: true});
}

// --- About box -------------------------------------------------------
// The icon key is generated straight from the same shape definitions
// markers.js uses to draw the live map (via svgShapeToSVG), rather than
// cropped from sprites.png - that keeps it pixel-identical to what's
// actually on the map and immune to sprite-sheet layout changes.
let aboutIconsRendered = false;

function renderAboutIcons() {
    const strokeColor = (typeof OutlineADSBColor !== 'undefined') ? OutlineADSBColor : '#000000';
    const strokeWidth = outlineWidth * 0.75;

    const renderIcon = function(elementId, shapeName, hslColor, scale) {
        const shape = shapes[shapeName];
        const el = document.getElementById(elementId);
        if (!shape || !el) return;
        const fillColor = 'hsl(' + hslColor[0] + ',' + hslColor[1] + '%,' + hslColor[2] + '%)';
        el.innerHTML = svgShapeToSVG(shape, fillColor, strokeColor, strokeWidth, scale || 1.6);
    };

    // Aircraft: default light-aircraft silhouette; fill is illustrative of
    // the altitude-based colouring used on the map, not a fixed colour.
    renderIcon('about_icon_aircraft', 'cessna', [60, 100, 50], 1.3);

    // Marine: ground station (base/coast/AtoN share this one shape),
    // static vessel, moving vessel - colours are just two representative
    // vessel-type examples (see getAisVesselColor), not fixed meanings.
    renderIcon('about_icon_ais_station', 'ais_station', [220, 60, 55]);
    renderIcon('about_icon_ais_vessel_static', 'ais_vessel_static', [150, 100, 50]);
    renderIcon('about_icon_ais_vessel', 'ais_vessel', [240, 100, 50]);

    // Space: satellite / station / military, using the actual SAT_CATEGORIES colours.
    renderIcon('about_icon_satellite', 'satellite', SAT_CATEGORIES.visual.color);
    renderIcon('about_icon_sat_station', 'sat_station', SAT_CATEGORIES.stations.color);
    renderIcon('about_icon_sat_military', 'sat_military', SAT_CATEGORIES.military.color);
}

function showAbout() {
    if (!aboutIconsRendered) {
        renderAboutIcons();
        aboutIconsRendered = true;
    }
    const el = document.getElementById('about_infoblock');
    el.style.display = (el.style.display === 'flex') ? 'none' : 'flex';
}

function toggleMilitary() {
    onlyMilitary = !onlyMilitary;
    buttonActive('#U', onlyMilitary);

    // Tell OpenLayers to instantly re-evaluate ship styles based on the new onlyMilitary state
    if (g && g.aiscatcherLayer && typeof g.aiscatcherLayer.changed === 'function') {
        g.aiscatcherLayer.changed();
    }

    if (typeof refreshFilter === 'function') refreshFilter();
    if (typeof active === 'function') active();
    if (typeof fetchData === 'function') fetchData({force: true});
}

function toggleEmergency() {
    onlyEmergency = !onlyEmergency;
    buttonActive('#E', onlyEmergency);

    if (g && g.aiscatcherLayer && typeof g.aiscatcherLayer.changed === 'function') {
        g.aiscatcherLayer.changed();
    }

    if (typeof refreshFilter === 'function') refreshFilter();
    if (typeof active === 'function') active();
    if (typeof fetchData === 'function') fetchData({force: true});
}

function updateEmergencyButtonAlert() {
    const button = document.getElementById('E');
    if (!button) return;

    let worstLevel = null; // priority: 'squawk' (red) > 'field' (amber) > null
    let military = false;  // military / state traffic on screen: green dot on U
    for (const plane of g.planesOrdered) {
        if (!plane.inView) continue;
        if (!military && (plane.military || (plane.dbFlags & 1))) military = true;
        if (worstLevel === 'squawk') { if (military) break; continue; }
        const level = getEmergencyLevel(plane);
        if (level === 'squawk') worstLevel = 'squawk';
        else if (level === 'field') worstLevel = 'field';
    }
    const milButton = document.getElementById('U');
    if (milButton) milButton.classList.toggle('presence', military);
    // the altitude key only matters with aircraft on screen
    let airInView = false;
    if (window.ShowAir !== false) {
        for (const plane of g.planesOrdered) {
            if (plane.inView && !plane.isSatellite && !String(plane.icao).startsWith('MMSI')) { airInView = true; break; }
        }
    }
    document.documentElement.classList.toggle('noAirInView', !airInView);

    button.classList.remove('emergencyAlert', 'emergencyAlertAmber');
    if (worstLevel === 'squawk') {
        button.classList.add('emergencyAlert');
    } else if (worstLevel === 'field') {
        button.classList.add('emergencyAlertAmber');
    }
}

function togglePersistence() {
    noVanish = !noVanish;
    //filterTracks = noVanish;

    buttonActive('#P', noVanish);

    remakeTrails();

    if (!noVanish)
        reaper();
    loStore['noVanish'] = noVanish;
    console.log('noVanish = ' + noVanish);

    refreshFilter();
}

function dim(evt) {
    try {
        let currentDimPercentage = mapDimPercentage * layerDimFactor;
        let currentContrastPercentage = mapContrastPercentage + layerExtraContrast;

        if (!toggles['MapDim'].state) {
            // slight dim even if disabled
            currentDimPercentage /= 4;
            currentContrastPercentage /= 4;
        }

        const dim = currentDimPercentage * (1 + 0.25 * toggles['darkerColors'].state);
        const contrast = currentContrastPercentage * (1 + 0.1 * toggles['darkerColors'].state);
        if (dim > 0.0001) {
            evt.context.globalCompositeOperation = 'multiply';
            evt.context.fillStyle = 'rgba(0,0,0,'+dim+')';
            evt.context.fillRect(0, 0, evt.context.canvas.width, evt.context.canvas.height);
        } else if (dim < -0.0001) {
            evt.context.globalCompositeOperation = 'screen';
            console.log(evt.context.globalCompositeOperation);
            evt.context.fillStyle = 'rgba(255, 255, 255,'+(-dim)+')';
            evt.context.fillRect(0, 0, evt.context.canvas.width, evt.context.canvas.height);
        }
        if (contrast > 0.0001) {
            evt.context.globalCompositeOperation = 'overlay';
            evt.context.fillStyle = 'rgba(0,0,0,'+contrast+')';
            evt.context.fillRect(0, 0, evt.context.canvas.width, evt.context.canvas.height);
        } else if (contrast < -0.0001) {
            evt.context.globalCompositeOperation = 'overlay';
            evt.context.fillStyle = 'rgba(255, 255, 255,'+ (-contrast)+')';
            evt.context.fillRect(0, 0, evt.context.canvas.width, evt.context.canvas.height);
        }
        evt.context.globalCompositeOperation = 'source-over';
    } catch (error) {
        console.error(error);
    }
}
function invertMap(evt){
  const ctx=evt.context;
  ctx.globalCompositeOperation='difference';
  ctx.fillStyle = "white";
  ctx.globalAlpha = alpha;  // alpha 0 = no effect 1 = full effect
  ctx.fillRect(0, 0, evt.ctx.canvas.width, ctx.canvas.height);


}
//
// Altitude Chart begin
//
(function (global, jQuery, TAR) {
    let altitudeChart = TAR.altitudeChart = TAR.altitudeChart || {};

    // Altitude key: a colour bar drawn from the same altitude colours as the
    // map icons, with real text labels (readable at any size, and centred
    // under the map by the stylesheet) instead of the old picture of a scale.
    // Positions along the bar match the icon colour scale; labels marked
    // "minor" are left out on phones so the rest have room to be legible.
    const LEGEND_STOPS = [
        // [position 0-1, feet, shown on phones]
        [0.033, 500, false], [0.066, 1000, true], [0.126, 2000, false],
        [0.19, 4000, true], [0.253, 6000, false], [0.316, 8000, false],
        [0.38, 10000, true], [0.59, 20000, true], [0.79, 30000, true], [1, 40000, true],
    ];
    const LEGEND_LABELS = [0.066, 0.126, 0.19, 0.253, 0.316, 0.38, 0.59, 0.79, 1];

    function legendLabel(feet, last) {
        if (DisplayUnits === 'metric') {
            const m = feet * 0.3048;
            if (m < 1000) return (Math.round(m / 50) * 50) + '\u00a0m';
            return (Math.round(m / 100) / 10).toString() + (last ? '+\u00a0km' : '\u00a0km');
        }
        const text = (feet / 1000) + 'k';
        return last ? text + '+\u00a0ft' : text;    // the unit once, at the end
    }

    function loadLegend() {
        const box = document.getElementById('altitude_chart_button');
        if (!box) return;
        let gradient = [];
        for (const [pos, feet] of LEGEND_STOPS) {
            const c = altitudeColor(feet);
            gradient.push('hsl(' + c[0] + ',' + c[1] + '%,' + c[2] + '%) ' + (pos * 100).toFixed(1) + '%');
        }
        const ground = altitudeColor(0);
        gradient.unshift('hsl(' + ground[0] + ',' + ground[1] + '%,' + ground[2] + '%) 0%');
        let labels = '';
        for (const pos of LEGEND_LABELS) {
            const stop = LEGEND_STOPS.find(s => s[0] === pos);
            const last = pos === 1;
            labels += '<span class="altLabel' + (stop[2] ? '' : ' altMinor') + (last ? ' altLast' : '')
                + '" style="left:' + (pos * 100).toFixed(1) + '%">' + legendLabel(stop[1], last) + '</span>';
        }
        // just the colour bar, labelled on the bar itself
        box.innerHTML = '<span class="altBar" style="background:linear-gradient(90deg,' + gradient.join(',') + ')">'
            + labels + '</span>';
        box.setAttribute('aria-label', 'Altitude colours');
        box.style.backgroundImage = 'none';
        jQuery('#altitude_chart').show();
    }

    altitudeChart.render = function () {
        if (toggles['altitudeChart'].state) {
            runAfterLoad(loadLegend);
        } else {
            jQuery('#altitude_chart').hide();
        }
    }

    altitudeChart.init = function () {
        let chartOn = (onMobile ? false : altitudeChartDefaultState);
        if (usp.has('altitudeChart')) {
            chartOn = Boolean(parseInt(usp.get('altitudeChart')));
        }
        new Toggle({
            key: "altitudeChart",
            display: "Altitude Chart",
            container: "#settingsRight",
            init: chartOn,
            setState: altitudeChart.render
        });
    }

    return TAR;
}(window, jQuery, TAR || {}));
//
// Altitude Chart end
//

function followRandomPlane() {
    if (showTrace)
        return;
    let this_one = null;
    let tired = 0;
    do {
        this_one = g.planesOrdered[Math.floor(Math.random()*g.planesOrdered.length)];
        if (!this_one || tired++ > 1000)
            break;
    } while ((this_one.isFiltered() && !onlySelected) || !this_one.position || (now - this_one.position_time > 30));
    //console.log(this_one.icao);
    if (this_one)
        selectPlaneByHex(this_one.icao, {follow: true});
}

function toggleTableInView(arg) {
    if (arg == 'enable') {
        tableInView = true;
    } else if (arg == 'disable') {
        tableInView = false;
    } else if (!globeIndex) {
        tableInView = !tableInView;
    }

    TAR.planeMan.refresh();

    if (!globeIndex) {
        loStore['tableInView'] = tableInView;
    }

    if (typeof OLMap !== 'undefined' && OLMap) {
        updateVisible();
    }

    buttonActive('#V', tableInView);
}

function toggleLabels() {
    g.enableLabels = !g.enableLabels;
    loStore['enableLabels'] = g.enableLabels;
    for (let key in g.planesOrdered) {
        g.planesOrdered[key].updateMarker();
    }
    refreshFeatures();
    buttonActive('#L', g.enableLabels);

    if (showTrace)
        remakeTrails();
}

function toggleExtendedLabels(options) {
    if (isNaN(g.extendedLabels))
        g.extendedLabels = 0;

    options = options || {};
    if (!options.noIncrement) {
        g.extendedLabels++;
    }
    g.extendedLabels %= 4;
    //console.log(extendedLabels);
    loStore['extendedLabels'] = g.extendedLabels;
    for (let key in g.planesOrdered) {
        g.planesOrdered[key].updateMarker();
    }
    buttonActive('#O', g.extendedLabels);
}

function toggleTrackLabels() {
    trackLabels = !trackLabels;
    loStore['trackLabels'] = trackLabels;

    remakeTrails();

    buttonActive('#K', trackLabels);
}

function toggleMultiSelect(newState) {
    let prevState = multiSelect;
    multiSelect = !multiSelect;

    if (newState == "on")
        multiSelect = true;
    if (newState == "off")
        multiSelect = false;

    if (!multiSelect) {
        if (!SelectedPlane)
            toggleIsolation("off");
        if (prevState != multiSelect)
            deselectAllPlanes("keepMain");
    }

    buttonActive('#M', multiSelect);
}

function onJump(e) {
    toggleFollow(false);
    if (e) {
        e.preventDefault();
        onJumpInput = jQuery("#jump_input").val();
        jQuery("#jump_input").val("");
        jQuery("#jump_input").blur();
    }
    let coords = null;
    let airport = null;
    if (onJumpInput.indexOf(",") >= 0) {
        let values = onJumpInput.split(',');
        if (!values || values.length != 2) {
            showSearchWarning('Input format decimal coordinates: LATI.TUDE, LONGI.TUDE');
        }
        coords = [parseFloat(values[0]), parseFloat(values[1])];
    } else {
        airport = onJumpInput.trim().toUpperCase();
    }
    if (airport) {
        if (!g.airport_cache) {
            jQuery.getJSON(databaseFolder + "/airport-coords.js")
                .done(function(data) {
                    g.airport_cache = data;
                    onJump();
                });
            return;
        }
        coords = g.airport_cache[airport];
    }
    if (coords) {
        console.log("jumping to: " + coords[0] + " " + coords[1]);
        OLMap.getView().setCenter(ol.proj.fromLonLat([coords[1], coords[0]]));

        if (g.zoomLvl >= 7) {
            fetchData({force: true});
        }

        refreshFilter();
        hideSearchWarning();
    } else {
        showSearchWarning('Failed to find airport ' + airport);
    }
}

function hideSearchWarning() {
    const searchWarning = jQuery('#search_warning');
    if (searchWarning.css('display') !== 'none') {
        searchWarning.hide('slow');
    }
}

function showSearchWarning(message) {
    const searchWarning = jQuery('#search_warning');
    searchWarning.text(message)
    if (searchWarning.css('display') === 'none') {
        searchWarning.show();
    }

    //auto hide after 15 seconds
    setTimeout(() => hideSearchWarning(), 15000);
}

function onSearch(e) {
    e.preventDefault();
    const searchTerm = jQuery("#search_input").val().trim();
    jQuery("#search_input").val("");
    jQuery("#search_input").blur();
    let results = [];
    if (searchTerm)
        results = findPlanes(searchTerm, "byIcao", "byCallsign", "byReg", "byType", true);
    if (results.length > 0 && haveTraces) {
        toggleIsolation("on");
        if (results.length < 100) {
            getTrace(null, null, {list: results});
        }
    }
    return false;
}
function onSearchClear(e) {
    deselectAllPlanes();
    toggleIsolation("off");
    toggleMultiSelect("off");
    jQuery("#search_input").val("");
    jQuery("#search_input").blur();
}

function onResetAltitudeFilter(e) {
    jQuery("#altitude_filter_min").val("");
    jQuery("#altitude_filter_max").val("");
    jQuery("#altitude_filter_min").blur();
    jQuery("#altitude_filter_max").blur();

    updateAltFilter();
    refreshFilter();
}

function updateAltFilter() {
    let minAltitude = parseFloat(jQuery("#altitude_filter_min").val().trim());
    let maxAltitude = parseFloat(jQuery("#altitude_filter_max").val().trim());
    let enabled = false;

    if (minAltitude < -1e6 || minAltitude > 1e6 || isNaN(minAltitude))
        minAltitude = -1e6;
    else
        enabled = true;
    if (maxAltitude < -1e6 || maxAltitude > 1e6 || isNaN(maxAltitude))
        maxAltitude = 1e6;
    else
        enabled = true;

    if (!enabled) {
        PlaneFilter.enabled = false;
        PlaneFilter.minAltitude = undefined;
        PlaneFilter.maxAltitude = undefined;
    }

    PlaneFilter.enabled = enabled;

    if (DisplayUnits == "metric") {
        PlaneFilter.minAltitude = minAltitude * 3.2808;
        PlaneFilter.maxAltitude = maxAltitude * 3.2808;
    } else {
        PlaneFilter.minAltitude = minAltitude;
        PlaneFilter.maxAltitude = maxAltitude;
    }
}

function getFlightAwareIdentLink(ident, linkText) {
    if (ident !== null && ident !== "") {
        if (!linkText) {
            linkText = ident;
        }
        return '<a class="link" target="_blank" href="https://flightaware.com/live/flight/' + escapeHtml(ident.trim()) + '" rel="noreferrer">' + escapeHtml(linkText) + '</a>';
    }
    return "";
}

function onResetSourceFilter(e) {
    jQuery('#sourceFilter .ui-selected').removeClass('ui-selected');

    sourcesFilter = null;

    updateSourceFilter();
}

function updateSourceFilter(e) {
    if (e)
        e.preventDefault();

    PlaneFilter.sources = sourcesFilter;

    refreshFilter();
}

function onResetFlagFilter(e) {
    jQuery('#flagFilter .ui-selected').removeClass('ui-selected');

    flagFilter = null;

    updateFlagFilter();
}

function updateFlagFilter(e) {
    if (e)
        e.preventDefault();

    PlaneFilter.flagFilter = flagFilter;

    refreshFilter();
}

const filters = {};
const filter_list = [];
const filters_active = [];

function Filter(arg) {
    this.key = arg.key;
    this.field = arg.field;
    this.name = arg.name;
    this.tbody = document.getElementById(arg.table).getElementsByTagName('tbody')[0];

    this.id = 'filters_' + this.key;
    this.sid = '#' + this.id;

    filters[this.key] = this;
    filter_list.push(this);

    this.init();
}

Filter.prototype.update = function(e) {
    if (e) {
        e.preventDefault();
    }

    this.input.blur();
    const val = this.input.val().trim();

    this.set(val);

    return false;
}
Filter.prototype.set = function(val) {

    this.input.val(val);
    this.pattern = val;
    this.PATTERN = this.pattern.toUpperCase();

    const list_index = filters_active.indexOf(this);
    if (val && list_index < 0) {
        filters_active.push(this);
    }
    if (!val && list_index >= 0) {
        filters_active.splice(list_index);
    }

    refreshFilter();
}

Filter.prototype.reset = function(e) {
    if (e) {
        e.preventDefault();
    }
    this.set("");
    return false;
}

Filter.prototype.init = function() {
    // don't F directly with the innerhtml of the body because it will drop event listeners / recreate dom elements
    const row = this.tbody.insertRow();
    row.innerHTML =
        `<td><form id="${this.id}">`
        + '<div class="infoBlockTitleText">Filter by '+ this.name +':</div>'
        + `<input id="${this.id}_input" name="${this.id}_name" type="text" class="searchInput" maxlength="1024">`
        + '<button class="formButton" type="submit">Filter</button>'
        + `<button class="formButton" id="${this.id}_reset">Reset</button>`
        + '</form></td>'
    ;
    this.input = jQuery(this.sid + '_input');
    this.form = document.getElementById(this.id)
    this.form.onsubmit = (e) => { return this.update(e); };
    jQuery(this.sid + '_reset').click((e) => { return this.reset(e); });
}

function initFilters() {
    initSourceFilter(tableColors.unselected);
    initFlagFilter(tableColors.unselected);
    new Filter({
        key: 'callsign',
        field: 'name',
        name: 'callsign',
        table: "filterTable",
    });
    new Filter({
        key: 'squawk',
        field: 'squawk',
        name: 'squawk',
        table: "filterTable",
    });
    new Filter({
        key: 'type',
        field: 'icaoType',
        name: 'type code',
        table: "filterTable",
    });
    new Filter({
        key: 'description',
        field: 'typeDescription',
        name: 'type description',
        table: "filterTable",
    });
    new Filter({
        key: 'icao',
        field: 'icao',
        name: 'ICAO hex id',
        table: "filterTable",
    });


    new Filter({
        key: 'registration',
        field: 'registration',
        name: 'registration',
        table: 'filterTable3'
    });
    if (routeApiUrl) {
        new Filter({
            key: 'route',
            field: 'routeString',
            name: 'route',
            table: 'filterTable3'
        });
    }
    new Filter({
        key: 'country',
        field: 'country',
        name: 'country of registration',
        table: 'filterTable3'
    });
    new Filter({
        key: 'category',
        field: 'category',
        name: 'category (A3,B0,..)',
        table: 'filterTable3'
    });

    if (PlaneFilter) {
        if (PlaneFilter.minAltitude && PlaneFilter.minAltitude > -1000000) {
            jQuery('#altitude_filter_min').val(PlaneFilter.minAltitude);
        }
        if (PlaneFilter.maxAltitude && PlaneFilter.maxAltitude < 1000000) {
            jQuery('#altitude_filter_max').val(PlaneFilter.maxAltitude);
        }

        for (const filter of filter_list) {
            if (usp.has(`filter${filter.key}`)) {
                filter.set(usp.get(`filter${filter.key}`));
            }
        }

        if (PlaneFilter.sources) {
            sourcesFilter = PlaneFilter.sources
            sourcesFilter.map((f) => jQuery('#source-filter-' + f).addClass('ui-selected'))
        }

        if (PlaneFilter.flagFilter) {
            flagFilter = PlaneFilter.flagFilter
            flagFilter.map((f) => jQuery('#flag-filter-' + f).addClass('ui-selected'))
        }
    }
}





function getFlightAwareModeSLink(code, ident, linkText) {
    if (code !== null && code.length > 0 && code[0] !== '~' && code !== "000000") {
        if (!linkText) {
            linkText = "FlightAware: " + code.toUpperCase();
        }

        let linkHtml = "<a class=\"link\" target=\"_blank\" href=\"https://flightaware.com/live/modes/" + escapeHtml(code);
        if (ident != null && ident !== "") {
            linkHtml += "/ident/" + escapeHtml(ident.trim());
        }
        linkHtml += "/redirect\" rel=\"noreferrer\">" + escapeHtml(linkText) + "</a>";
        return linkHtml;
    }
    return "";
}

function getPhotoLink(ac) {
    if (jetphotoLinks) {
        if (ac.registration == null || ac.registration == "")
            return "";
        return "<a class=\"link\" target=\"_blank\" href=\"https://www.jetphotos.com/photo/keyword/" + ac.registration.replace(/[^0-9a-z]/ig,'') + "\" rel=\"noreferrer\">Jetphotos</a>";
    } else if (flightawareLinks) {
        if (ac.registration == null || ac.registration == "")
            return "";
        return "<a class=\"link\" target=\"_blank\" href=\"https://flightaware.com/photos/aircraft/" + ac.registration.replace(/[^0-9a-z]/ig,'') + "\" rel=\"noreferrer\">FA Photos</a>";
    } else if (showPictures) {
        return "<a class=\"link\" target=\"_blank\" href=\"https://www.planespotters.net/hex/" + ac.icao.toUpperCase() + "\" rel=\"noreferrer\">View on Planespotters</a>";
    }
}

// takes in an elemnt jQuery path and the OL3 layer name and toggles the visibility based on clicking it
function toggleLayer(element, layer) {
    // set initial checked status
    ol.control.LayerSwitcher.forEachRecursive(layers_group, function(lyr) {
        if (lyr.get('name') === layer && lyr.getVisible()) {
            jQuery(element).addClass('settingsCheckboxChecked');
        }
    });
    jQuery(element).on('click', function() {
        let visible = false;
        if (jQuery(element).hasClass('settingsCheckboxChecked')) {
            visible = true;
        }
        ol.control.LayerSwitcher.forEachRecursive(layers_group, function(lyr) {
            if (lyr.get('name') === layer) {
                if (visible) {
                    lyr.setVisible(false);
                    jQuery(element).removeClass('settingsCheckboxChecked');
                } else {
                    lyr.setVisible(true);
                    jQuery(element).addClass('settingsCheckboxChecked');
                }
            }
        });
    });
}

let fetchingPf = false;
function fetchPfData() {
    if (fetchingPf)
        return;
    fetchingPf = true;
    for (let i in pf_data) {
        const req = jQuery.ajax({ url: pf_data[i],
            dataType: 'json' });
        jQuery.when(req).done(function(data) {
            for (let i in g.planesOrdered) {
                const plane = g.planesOrdered[i];
                const ac = data.aircraft[plane.icao.toUpperCase()];
                if (!ac) {
                    continue;
                }
                plane.pfRoute = ac.route;
                plane.pfMach = ac.mach;
                plane.pfFlightno = ac.flightno;
                if (!plane.registration && ac.reg && ac.reg != "????" && ac.reg != "z.NO-REG")
                    plane.registration = ac.reg;
                if (!plane.icaoType && ac.type && ac.type != "????" && ac.type != "ZVEH") {
                    plane.icaoType = ac.type;
                    plane.setTypeData();
                }
            }
            fetchingPf = false;
        });
    }
}

function solidGoldT(arg) {
    solidT = true;
    let list = [[], [], [], []];
    for (let i = 0; i < g.planesOrdered.length; i++) {
        let plane = g.planesOrdered[i];
        //console.log(plane);
        if (plane.visible) {
            list[Math.floor(4*i/g.planesOrdered.length)].push(plane);
        }
    }
    getTrace(null, null, {onlyRecent: arg == 2, onlyFull: arg == 1, list: list[0],});
    getTrace(null, null, {onlyRecent: arg == 2, onlyFull: arg == 1, list: list[1],});
    getTrace(null, null, {onlyRecent: arg == 2, onlyFull: arg == 1, list: list[2],});
    getTrace(null, null, {onlyRecent: arg == 2, onlyFull: arg == 1, list: list[3],});
}

function bearingFromLonLat(position1, position2) {
    // Positions in format [lon in deg, lat in deg]
    const lon1 = position1[0]*Math.PI/180;
    const lat1 = position1[1]*Math.PI/180;
    const lon2 = position2[0]*Math.PI/180;
    const lat2 = position2[1]*Math.PI/180;

    const y = Math.sin(lon2-lon1)*Math.cos(lat2);
    const x = Math.cos(lat1)*Math.sin(lat2)
        - Math.sin(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1);
    return (Math.atan2(y, x)* 180 / Math.PI + 360) % 360;
}

function zoomIn() {
    const zoom = OLMap.getView().getZoom();
    OLMap.getView().setZoom((zoom+1).toFixed());
    if (FollowSelected)
        toggleFollow(true);
}

function zoomOut() {
    const zoom = OLMap.getView().getZoom();
    OLMap.getView().setZoom((zoom-1).toFixed());
    if (FollowSelected)
        toggleFollow(true);
}

function changeZoom(init) {
    if (!OLMap)
        return;

    g.zoomLvl = OLMap.getView().getZoom();

    checkScale();

    // small zoomstep, no need to change aircraft scaling
    if (!init && Math.abs(g.zoomLvl-g.zoomLvlCache) < 0.4)
        return;

    lopaStore['zoomLvl'] = g.zoomLvl;
    g.zoomLvlCache = g.zoomLvl;

    if (!init && showTrace)
        updateAddressBar();

    checkPointermove();
}

function checkScale() {
    if (g.zoomLvl > markerZoomDivide) {
        iconSize = markerBig;
    } else if (g.zoomLvl > markerZoomDivide - 1) {
        iconSize = markerSmall;
    } else {
        iconSize = markerSmall;
        if ((aircraftShown + vesselsShown) > 700) {
            iconSize *= 0.9;
        }
    }

    // scale markers according to global scaling
    iconSize *= Math.pow(1.3, globalScale) * globalScale * iconScale;
    // disable, doesn't work well
    // iconSize *= 1 - 0.37 * Math.pow(TrackedAircraftPositions + 1, 0.8) / Math.pow(10000, 0.8);
}
function setGlobalScale(scale, init) {
    globalScale = scale;
    document.documentElement.style.setProperty("--SCALE", globalScale);

    labelFont = `${labelStyle} ${(12 * globalScale * labelScale)}px/${(14 * globalScale * labelScale)}px ${labelFamily}`;

    checkScale();
    setLineWidth();
    if (!init) {
        refreshFeatures();
        refreshSelected();
        refreshHighlighted();
        remakeTrails();
    }
}

function checkPointermove() {
    if ((webgl || g.zoomLvl > 5.5) && enableMouseover && !onMobile) {
        OLMap.on('pointermove', onPointermove);
    } else {
        OLMap.un('pointermove', onPointermove);
        removeHighlight();
    }
}


function changeCenter(init) {
    const rawCenter = OLMap.getView().getCenter();
    const center = ol.proj.toLonLat(rawCenter);

    const centerChanged = (Math.abs(center[1] - CenterLat) > 0.000001 || Math.abs(center[0] - CenterLon) > 0.000001);

    if (!init && !centerChanged) {
        return;
    }

    lopaStore['CenterLon'] = CenterLon = center[0];
    lopaStore['CenterLat'] = CenterLat = center[1];

    if (!init) {
        updateAddressBar();
    }

    if (rawCenter[0] < OLProjExtent[0] || rawCenter[0] > OLProjExtent[2]) {
        OLMap.getView().setCenter(ol.proj.fromLonLat(center));
        refresh();
    }
    if (CenterLat < -85)
        OLMap.getView().setCenter(ol.proj.fromLonLat([center[0], -85]));
    if (CenterLat > 85)
        OLMap.getView().setCenter(ol.proj.fromLonLat([center[0], 85]));
}

let lastMovement = 0;
let checkMoveZoom;
let checkMoveCenter = [0, 0];
let checkMoveDone = 0;

function checkMovement() {
    if (!OLMap)
        return;

    if (!g.firstFetchDone) {
        return;
    }

    let currentTime = Date.now()/1000;
    if (currentTime > g.route_next_lookup && !g.route_check_in_flight) {
        // check if it's time to send a batch of request to the API server
        g.route_next_lookup = currentTime + 1;
        routeDoLookup();
    }

    const zoom = OLMap.getView().getZoom();
    const center = ol.proj.toLonLat(OLMap.getView().getCenter());
    const ts = new Date().getTime();

    if (
        checkMoveZoom != zoom ||
        checkMoveCenter[0] != center[0] ||
        checkMoveCenter[1] != center[1]
    ) {
        checkMoveDone = 0;
        if (FollowSelected) {
            checkFollow();
        }
        active();
        lastMovement = ts;
    }

    checkMoveZoom = zoom;
    checkMoveCenter[0] = center[0];
    checkMoveCenter[1] = center[1];

    changeZoom();
    changeCenter();

    const elapsed = Math.abs(ts - lastMovement);

    if (!checkMoveDone && heatmap && elapsed > 300) {
        if (!heatmap.manualRedraw)
            drawHeatmap();
        checkMoveDone = 1;
    }
    if (elapsed > 500 || (!onMobile && elapsed > 45)) {
        checkRefresh();
    }

    fetchData();
}

function getZoom() {
    return OLMap.getView().getZoom();
}

function getCenter() {
    return ol.proj.toLonLat(OLMap.getView().getCenter());
}

let lastRefresh = 0;
let refreshZoom, refreshCenter;
function checkRefresh() {
    if (showTrace)
        return;

    if (!g.firstFetchDone) {
        return;
    }
    if (triggerRefresh) {
        refresh();
        return;
    }
    const center = getCenter();
    const zoom = getZoom();
    if (zoom != refreshZoom || !refreshCenter || center[0] != refreshCenter[0] || center[1] != refreshCenter[1]) {
        const ts = new Date().getTime();
        const elapsed = Math.abs(ts - lastRefresh);
        let num = Math.min(1500, Math.max(250, TrackedAircraftPositions / 300 * 250));
        if (elapsed > num) {
            refresh();
        }
    }
}
function refresh(redraw) {
    lastRefresh = new Date().getTime();

    refreshZoom = getZoom();
    refreshCenter = getCenter();

    if (replay) {
        for (let i in SelPlanes) {
            const plane = SelPlanes[i];
            plane.processTrace();
        }
    }

    // before planeman refresh / mapRefresh
    updateVisible();

    mapRefresh(redraw);

    //console.time("refreshTable");
    try {
        TAR.planeMan.refresh();
    } catch (error) {
        // Anything thrown here used to skip the rest of this function, including
        // "triggerRefresh = 0" below - so checkRefresh() (every 50ms) re-ran the whole
        // refresh() endlessly, and the selected-plane panel never updated.
        console.error('planeMan.refresh() failed:', error);
    }
    //console.timeEnd("refreshTable");


    refreshSelected();
    refreshHighlighted();

    triggerRefresh = 0;
}

function refreshFilter() {
    if (filterTracks)
        remakeTrails();

    refresh(true);
    drawHeatmap();

    // 1. URL/State updates (Conditional)
    if (toggles.shareFilters && toggles.shareFilters.state) {
        updateAddressBar();
    }
	
    // 2. Map Layer Updates (Always run this)
    if (g.aiscatcherLayer) {
        g.aiscatcherLayer.changed();
    }
}

function updateVisible() {
    if (mapIsVisible || !lastRenderExtent) {
        lastRenderExtent = getRenderExtent();
    }
    aircraftShown = 0;
    vesselsShown = 0;
    aircraftTotal = 0;
    vesselsTotal = 0;
    satellitesShown = 0;
    satellitesTotal = 0;

    for (let i in g.planesOrdered) {
        const plane = g.planesOrdered[i];

        const isSat = !!plane.isSatellite;
        const isShip = !isSat && (plane.dataSource === 'ais' || plane.type === 'ship' || plane.ship || (plane.desc && plane.desc.includes('Ship')));

        plane.updateVisible();

        if (!customCheckPlaneFilter(plane, isShip, isSat)) {
            plane.visible = false;
        }

        if (plane.visible) {
            if (isSat) {
                satellitesTotal++;
            } else if (isShip) {
                vesselsTotal++;
            } else {
                aircraftTotal++;
            }
        }

        const onScreen = plane.visible && plane.inView;
        if (isSat) {
            satellitesShown += onScreen;
        } else if (isShip) {
            vesselsShown += onScreen;
        } else {
            aircraftShown += onScreen;
        }
    }

    jQuery('#ac_count_label').text(tableInView ? "On Screen Aircraft:" : "Total Aircraft:");
    jQuery('#vessel_count_label').text(tableInView ? "On Screen Vessels:" : "Total Vessels:");
    jQuery('#dump1090_total_ac').updateText(tableInView ? aircraftShown : aircraftTotal);
    jQuery('#dump1090_total_vessels').updateText(tableInView ? vesselsShown : vesselsTotal);
    jQuery('#satellite_count_label').text(tableInView ? "On Screen Satellites:" : "Total Satellites:");
    jQuery('#dump1090_total_satellites').updateText(tableInView ? satellitesShown : satellitesTotal);

	updateEmergencyButtonAlert();
    checkScale();
}

function customCheckPlaneFilter(plane, isShip, isSat) {

    // A vehicle is an emergency if it has an aircraft emergency squawk/field OR an emergency ship status
    const isEmergency = getEmergencyLevel(plane) !== null;
    const isMilitary = !!plane.military;

    // E and U are independent toggles. With one active, show only that
    // category. With both active, show the union (E OR U) rather than
    // requiring an object to satisfy both simultaneously.
    if (onlyEmergency || onlyMilitary) {
        const passesEmergency = onlyEmergency && isEmergency;
        const passesMilitary = onlyMilitary && isMilitary;
        if (!passesEmergency && !passesMilitary) {
            return false;
        }
    }

    if (isSat) {
        return !!window.ShowSatellites;
    }

    if (isShip && !window.ShowMarine) {
        return false;
    }

    if (!isShip && !window.ShowAir) {
        return false;
    }

    return true;
}

function mapRefresh(redraw) {
    if (!mapIsVisible || heatmap)
        return;
    let addToMap = [];
    let nMapPlanes = 0;
    let count = 0;

    if (globeIndex && !icaoFilter) {
        for (let i in g.planesOrdered) {
            count++;
            const plane = g.planesOrdered[i];
            delete plane.glMarker;
            // disable mobile limitations when using webGL
            if (plane.selected || (plane.inView && plane.visible && (!onMobile || webgl || (nMapPlanes < 150 && (!plane.onGround || g.zoomLvl > 10))))) {
                addToMap.push(plane);
                nMapPlanes++;
            } else {
                plane.markerDrawn && plane.clearMarker();
                !SelectedAllPlanes && plane.linesDrawn && plane.clearLines();
            }
        }
    } else {
        for (let i in g.planesOrdered) {
            const plane = g.planesOrdered[i];
            delete plane.glMarker;
            addToMap.push(plane);
        }
    }

    //console.log('planes on map: ' + nMapPlanes + ' / ' + count);

    // webGL zIndex hack:
    // sort all planes by altitude
    // clear the vector source
    // delete all feature objects so they are recreated, this is important
    // draw order will be insertion / updateFeatures order

    addToMap.sort(function(x, y) { return x.zIndex - y.zIndex; });
    //console.log('maprefresh(): ' + addToMap.length);
    if (webgl) {
        webglFeatures.clear();
        webglSatFeatures.clear();
    }

    for (let i in addToMap) {
        addToMap[i].updateFeatures(redraw);
    }
}

function onPointermove(evt) {
    //clearTimeout(pointerMoveTimeout);
    //pointerMoveTimeout = setTimeout(highlight(evt), 100);
    highlight(evt);
}

// Satellites are drawn into their own sources (webglSatFeatures in WebGL mode,
// SatelliteIconFeatures for their vector marker), separate from the aircraft
// sources, so hit testing checks every source and takes the nearest hit.
function getClosestPlaneFeature(coords) {
    let best = null;
    let bestDist = Infinity;
    const sources = webgl ? [webglFeatures, webglSatFeatures, PlaneIconFeatures, SatelliteIconFeatures] : [PlaneIconFeatures, SatelliteIconFeatures];
    for (const src of sources) {
        if (!src) continue;
        const f = src.getClosestFeatureToCoordinate(coords);
        if (!f || !f.getGeometry()) continue;
        const c = f.getGeometry().getCoordinates();
        const d = (c[0] - coords[0]) ** 2 + (c[1] - coords[1]) ** 2;
        if (d < bestDist) {
            bestDist = d;
            best = f;
        }
    }
    return best;
}

function highlight(evt) {
    let evtCoords = evt.map.getCoordinateFromPixel(evt.pixel);
    let feature = getClosestPlaneFeature(evtCoords);
    if (feature) {
        let fPixel = evt.map.getPixelFromCoordinate(feature.getGeometry().getCoordinates());
        let a = fPixel[0] - evt.pixel[0];
        let b = fPixel[1] - evt.pixel[1];
        let c = globalScale * 20;
        if (a**2 + b**2 > c**2) {
            feature = null;
        }
    }
    if (!feature) {
        HighlightedPlane = null;
        refreshHighlighted();
        return;
    }
    const hex = feature.hex;

    const values = feature.values_;
    const mmsi = values ? values.mmsi : null;
    if (hex) {
        //console.log(hex);
    }
    if (mmsi) {
        //console.log(mmsi);
    }

    if (HighlightedPlane && hex == HighlightedPlane.icao)
        return;

    //clearTimeout(pointerMoveTimeout);

    if (hex) {
        HighlightedPlane = g.planes[hex];
    } else {
        HighlightedPlane = null;
    }
    //pointerMoveTimeout = setTimeout(refreshHighlighted(), 300);
    refreshHighlighted();
}
let urlIcaos = [];
function parseURLIcaos() {
    if (usp.has('icao')) {
        // Not lower-cased up front: AIS vessels are keyed 'MMSI' + digits, in upper
        // case, everywhere else (processBoat(), layers.js, updateAddressBar()), so
        // that form has to be preserved. Aircraft hexes are lower-cased exactly as
        // before. Satellites are keyed 'SAT' + NORAD id (see processSatellite() in
        // this file) - same reasoning as MMSI, and the same reason a satellite id
        // needs its own match here: digits-only or "SAT<digits>" doesn't fit the
        // 6/7-character hex-digit pattern below at all (SAT ids vary in length,
        // and S/T aren't hex digits), so without this it would simply never match.
        let inArray = usp.get('icao').split(',');
        for (let i = 0; i < inArray.length; i++) {
            // 7-9 digits: MMSIs are 9 digits, but leading zeros (coast stations,
            // e.g. 002320001) are lost when processBoat() builds the id from a number.
            const mmsiMatch = inArray[i].match(/^mmsi(\d{7,9})$/i);
            const satMatch = inArray[i].match(/^sat(\d+)$/i);
            const icao = mmsiMatch ? 'MMSI' + mmsiMatch[1] : (satMatch ? 'SAT' + satMatch[1] : inArray[i].toLowerCase());
            if (mmsiMatch || satMatch || (icao && (icao.length == 7 || icao.length == 6) && icao.match(/[a-f,0-9]{6}/))) {
                urlIcaos.push(icao);
                let newPlane = g.planes[icao] || new PlaneObject(icao);
                newPlane.last_message_time = NaN;
                newPlane.position_time = NaN;
                newPlane.selected = true;
                SelPlanes.push(newPlane);
                //console.log(newPlane);
                // preliminary adding of URL specified icaos
            }
        }
    }
}
function processURLParams(){
    if (usp.has('showTrace')) {
        let date = setTraceDate({string: usp.get('showTrace')});
        if (date && usp.has('startTime')) {
            let numbers =  usp.get('startTime').split(':');
            traceOpts.startHours = numbers[0] ? parseInt(numbers[0]) : 0;
            traceOpts.startMinutes = numbers[1] ? parseInt(numbers[1]) : 0;
            traceOpts.startSeconds = numbers[2] ? parseInt(numbers[2]) : 0;
        }
        if (date && usp.has('endTime')) {
            let numbers = usp.get('endTime').split(':');
            traceOpts.endHours = numbers[0] ? parseInt(numbers[0]) : 24;
            traceOpts.endMinutes = numbers[1] ? parseInt(numbers[1]) : 0;
            traceOpts.endSeconds = numbers[2] ? parseInt(numbers[2]) : 0;
        }
        if (date && usp.getFloat('timestamp')) {
            showTraceTimestamp = usp.getFloat('timestamp');
        }
    }

    const callsign = usp.get('callsign');
    let zoom = null;
    let follow = true;
    if (usp.get("zoom")) {
        try {
            zoom = parseFloat(usp.get("zoom"));
            if (zoom === 0)
                zoom = 8;
        } catch (error) {
            console.log("Error parsing zoom:", error);
        }
    }

    if (usp.get("lat") && usp.get("lon")) {
        try {
            const lat = parseFloat(usp.get("lat"));
            const lon = parseFloat(usp.get("lon"));
            OLMap.getView().setCenter(ol.proj.fromLonLat([lon, lat]));
            follow = false;
            traceOpts.noFollow = new Date().getTime() / 1000;
        }
        catch (error) {
            console.log("Error parsing lat/lon:", error);
        }
    }

    lastRenderExtent = getRenderExtent();

    if (urlIcaos.length > 0) {
        const icaos = urlIcaos;
        if (!usp.has('noIsolation') && !usp.has('replay'))
            toggleIsolation("on");
        if (icaos.length > 1) {
            toggleMultiSelect("on");
            //follow = false;
        }
        for (let i = 0; i < icaos.length; i++) {
            const icao = icaos[i];
            console.log('Selected ICAO id: '+ icao + ' traceDate: ' + traceDateString);
            let options = {follow: follow, noDeselect: true};
            if (traceDate != null) {
                let newPlane = g.planes[icao] || new PlaneObject(icao);
                newPlane.last_message_time = NaN;
                newPlane.position_time = NaN;
                newPlane.selected = true;
                select(newPlane, options);

                (!zoom) && (zoom = 5);
            } else {
                (!zoom) && (zoom = 7);
                selectPlaneByHex(icao, options);
            }
        }
        if (traceDate != null)
        {
            toggleShowTrace();
            toggleFollow(follow);
        }
        // A vessel or satellite is selected before its feed has delivered a
        // first position, so select()'s toggleFollow(true) is refused (no
        // position yet) - and unlike aircraft there is no trace download
        // whose completion would retry it. Remember to apply it once the
        // position arrives (see applyPendingFollow(), called from
        // processBoat() and processSatellite()).
        if (follow && SelectedPlane && !SelectedPlane.position &&
            (String(SelectedPlane.icao).startsWith('MMSI') || String(SelectedPlane.icao).startsWith('SAT'))) {
            g.pendingFollow = SelectedPlane.icao;
        }
        updateAddressBar();
    } else if (callsign != null) {
        findPlanes(callsign, false, true, false, false, false);
    }

    if (zoom) {
        OLMap.getView().setZoom(zoom);
    }

    if (usp.has('mil'))
        toggleMilitary();

    if (usp.has('airport')) {
        onJumpInput = usp.get('airport').trim().toUpperCase();
        onJump();
    }

    if (usp.has('leg')) {
        legSel = parseInt(usp.get('leg'), 10);
        if (isNaN(legSel) || legSel < -1)
            legSel = -1;
        else
            legSel--;
    }

    let tracks = usp.get('monochromeTracks');
    if (tracks != undefined) {
        if (tracks.length == 6)
            monochromeTracks = '#' + tracks;
        else
            monochromeTracks = "#000000";
    }

    let markers = usp.get('monochromeMarkers');
    if (markers != undefined) {
        if (markers.length == 6)
            monochromeMarkers = '#' + markers;
        else
            monochromeMarkers = "#FFFFFF";
    }

    let outlineColor = usp.get('outlineColor');
    if (outlineColor != undefined) {
        if (outlineColor.length == 6)
            OutlineADSBColor = '#' + outlineColor;
        else
            OutlineADSBColor = "#000000";
    }

    if (usp.has('centerReceiver')) {
        OLMap.getView().setCenter(ol.proj.fromLonLat([SiteLon, SiteLat]));
    }
    if (usp.has('lockDotCentered')) {
        lockDotCentered = true;
        OLMap.getView().setCenter(ol.proj.fromLonLat([SiteLon, SiteLat]));
    }
}

let regIcaoDownloadRunning = false;
function regIcaoDownload(opts) {
    regIcaoDownloadRunning = true;
    let req = jQuery.ajax({ url: databaseFolder + "/regIcao.js",
        cache: true,
        timeout: 60000,
        dataType : 'json',
        opts: opts,
    });
    req.done(function(data) {
        db.regCache = data;
    });
    req.always(function() {
        regIcaoDownloadRunning = false;
    });
    return req;
}
function findPlanes(queries, byIcao, byCallsign, byReg, byType, showWarnings) {
    if (queries == null)
        return;
    queries = queries.toLowerCase();
    queries = queries.split(',');
    if (queries.length > 1)
        toggleMultiSelect("on");
    let results = [];
    for (let i in queries) {
        const query = queries[i];
        if (byReg) {
            let upper = query.toUpperCase().replace("-", "");
            if (db.regCache) {
                if (db.regCache[upper]) {
                    selectPlaneByHex(db.regCache[upper].toLowerCase(), {noDeselect: true, follow: true});
                }
            } else if (!regIcaoDownloadRunning) {
                let req = regIcaoDownload({ upper: `${upper}` });
                req.done(function() {
                    if (db.regCache[this.opts.upper]) {
                        selectPlaneByHex(db.regCache[this.opts.upper].toLowerCase(), {noDeselect: true, follow: true});
                    }
                });
            }
        }
        for (let i in g.planesOrdered) {
            const plane = g.planesOrdered[i];
            if (
                (byCallsign && plane.flight != null && plane.flight.toLowerCase().match(query))
                || (byIcao && plane.icao.toLowerCase().match(query))
                || (byReg && plane.registration != null && plane.registration.toLowerCase().match(query))
                || (byType && plane.icaoType != null && plane.icaoType.toLowerCase().match(query))
            ) {
                results.push(plane);
                /* leaving this code in place just in case, not sure what this limitation to planes on screen is for when searching
                if (globeIndex) {
                    if (plane.inView)
                        results.push(plane);
                } else {
                    if (plane.checkVisible())
                        results.push(plane);
                }
                */
            }
        }
    }
    if (results.length > 1) {
        toggleMultiSelect("on");
        for (let i in results) {
            select(results[i], {});
            results[i].updateTick(true);
            sp = SelectedPlane = null;
        }
        showWarnings && hideSearchWarning();
    } else if (results.length == 1) {
        selectPlaneByHex(results[0].icao, {noDeselect: true, follow: true});
        console.log("query selected: " + queries);
        showWarnings && hideSearchWarning();
    } else {
        console.log("No match found for query: " + queries);
        let foundByHex = 0;
        if (haveTraces) {
            for (let i in queries) {
                const query = queries[i];
                if (query.toLowerCase().match(/~?[a-f,0-9]{6}/)) {
                    console.log("maybe it's an icao, let's try to fetch the history for it!");
                    selectPlaneByHex(query, {noDeselect: true, follow: true}) && foundByHex++
                }
            }
        }
        if (foundByHex === 0 && showWarnings) {
            if (globeIndex) {
                showSearchWarning("No match found in current view: " + queries);
            } else {
                showSearchWarning("No match found for query: " + queries);
            }
        }
    }
    return results;
}

function trailReaper() {
    for (let i in g.planesOrdered) {
        g.planesOrdered[i].reapTrail();
    }
}

function setIndexDistance(index, center, coords) {
    if (index >= 1000) {
        globeIndexDist[index] = ol.sphere.getDistance(center, coords);
        return;
    }
    let tile = globeIndexSpecialTiles[index];
    let min = ol.sphere.getDistance(center, [tile[1], tile[0]]);
    min = Math.min(min, ol.sphere.getDistance(center, [tile[1], tile[2]]));
    min = Math.min(min, ol.sphere.getDistance(center, [tile[3], tile[0]]));
    min = Math.min(min, ol.sphere.getDistance(center, [tile[3], tile[2]]));
    globeIndexDist[index] = min;
}

function globeIndexes() {
    const center = ol.proj.toLonLat(OLMap.getView().getCenter());
    if (mapIsVisible || lastGlobeExtent == null) {
        lastGlobeExtent = getViewOversize(1.02);
    }
    let extent = lastGlobeExtent.extent;
    const bottomLeft = ol.proj.toLonLat([extent[0], extent[1]]);
    const topRight = ol.proj.toLonLat([extent[2], extent[3]]);
    let x1 = bottomLeft[0];
    let y1 = bottomLeft[1];
    let x2 = topRight[0];
    let y2 = topRight[1];
    if (Math.abs(extent[2] - extent[0]) > 40075016) {
        // all longtitudes in view, only check latitude
        x1 = -179;
        x2 = 179;
    }
    if (y1 < -89.5)
        y1 = -89.5;
    if (y2 > 89.5)
        y2 = 89.5;
    let indexes = [];
    //console.log(x1 + ' ' + x2);
    let grid = globeIndexGrid;

    let x3 = x1 < x2 ? x2 : 199;
    let count = 0;

    //console.time('indexes');
    for (let lon = x1; lon < x3 + grid; lon += grid) {
        if (x1 > x2 && lon > 180) {
            lon -= 360;
            x3 = x2;
        }
        if (lon > x3)
            lon = x3 + 0.01;
        if (count++ > 360 / grid) {
            console.log("globeIndexes fail, lon: " + lon);
        }
        let count2 = 0;
        for (let lat = y1; lat < y2 + grid; lat += grid) {
            if (count2++ > 180 / grid) {
                console.log("globeIndexes fail, lon: " + lon + ", lat: " + lat);
                break;
            }
            if (lat > y2)
                lat = y2 + 0.01;
            if (lat > 90)
                break;
            let index = globe_index(lat, lon);
            //console.log(lat + ' ' + lon + ' ' + index);
            if (!indexes.includes(index)) {
                setIndexDistance(index, center, [lon, lat]);
                indexes.push(index);
            }
        }
    }
    //console.timeEnd('indexes');
    globeTilesViewCount = indexes.length;
    return indexes;
}

function globe_index(lat, lon) {
    let grid = globeIndexGrid;

    lat = grid * Math.floor((lat + 90) / grid) - 90;
    lon = grid * Math.floor((lon + 180) / grid) - 180;

    let i = Math.floor((lat+90) / grid);
    let j = Math.floor((lon+180) / grid);

    let lat_multiplier = Math.floor(360 / grid + 1);
    let defaultIndex = i * lat_multiplier + j + 1000;

    let index = globeIndexSpecialLookup[defaultIndex];
    if (index) {
        return index;
    }

    // not yet in lookup, check special tiles
    for (let i = 0; i < globeIndexSpecialTiles.length; i++) {
        let tile = globeIndexSpecialTiles[i];
        if ((lat >= tile[0] && lat < tile[2])
            && ((tile[1] < tile[3] && lon >= tile[1] && lon < tile[3])
                || (tile[1] > tile[3] && (lon >= tile[1] || lon < tile[3])))) {
            globeIndexSpecialLookup[defaultIndex] = index = i;
        }
    }
    if (index == null) {
        // not a special tile, set lookup to default index
        globeIndexSpecialLookup[defaultIndex] = index = defaultIndex;
    }

    return index;
}

function myExtent(extent) {
    let bottomLeft = ol.proj.toLonLat([extent[0], extent[1]]);
    let topRight = ol.proj.toLonLat([extent[2], extent[3]]);
    return {
        extent: extent,
        minLon: bottomLeft[0],
        maxLon: topRight[0],
        minLat: bottomLeft[1],
        maxLat: topRight[1],
    }
}

function inView(pos, ex) {
    if (pos == null)
        return false;

    if (solidT)
        return true;

    let extent = ex.extent;
    let lon = pos[0];
    let lat = pos[1];

    //console.log((currExtent[2]-currExtent[0])/40075016);
    //console.log([bottomLeft[0], topRight[0]]);
    //console.log([bottomLeft[1], topRight[1]]);
    //const proj = ol.proj.fromLonLat(pos);
    if (lat < ex.minLat || lat > ex.maxLat)
        return false;

    if (extent[2] - extent[0] > 40075016) {
        // all longtitudes in view, only check latitude
        return true;
    } else if (ex.minLon < ex.maxLon) {
        // no wraparound: view not crossing 179 to -180 transition line
        return (lon > ex.minLon && lon < ex.maxLon);
    } else {
        // wraparound: view crossing 179 to -180 transition line
        return (lon > ex.minLon || lon < ex.maxLon);
    }
}
let lastAddressBarUpdate = 0;
let updateAddressBarTimeout;
let updateAddressBarPushed = false;
let updateAddressBarString = "";
function updateAddressBar() {
    if (!window.history || !window.history.replaceState)
        return;
    if (heatmap || (pTracks && !haveTraces) || !CenterLat || uuid)
        return;

    let string = '';

    if (replay) {
        string += '?replay=';
        string += zDateString(replay.ts);
        string += '-' + replay.ts.getUTCHours().toString().padStart(2,'0');
        string += ':' + replay.ts.getUTCMinutes().toString().padStart(2,'0');
    }

    if (SelPlanes.length > 0) {
        string += (string ? '&' : '?');
        string += 'icao=' + SelPlanes.map((s) => encodeURIComponent(s.icao)).join(',')
    }

    if (showTrace || replay) {
        string += (string ? '&' : '?');
        string += 'lat=' + CenterLat.toFixed(3) + '&lon=' + CenterLon.toFixed(3) + '&zoom=' + g.zoomLvl.toFixed(1);
    }

    if (SelPlanes.length > 0 && (showTrace)) {
        string += (string ? '&' : '?');
        string += 'showTrace=' + traceDateString;
        if (legSel != -1)
            string += '&leg=' + (legSel + 1);
        if (traceOpts.startHours != null) {
            string += '&startTime=';
            string += traceOpts.startHours.toString().padStart(2, '0');
            string += ':' + traceOpts.startMinutes.toString().padStart(2, '0');
            if (traceOpts.startSeconds) {
                string += ':' + traceOpts.startSeconds.toString().padStart(2, '0');
            }
        }
        if (traceOpts.endHours != null) {
            string += '&endTime=';
            string += traceOpts.endHours.toString().padStart(2, '0');
            string += ':' + traceOpts.endMinutes.toString().padStart(2, '0');
            if (traceOpts.endSeconds) {
                string += ':' + traceOpts.endSeconds.toString().padStart(2, '0');
            }
        }
        if (trackLabels) {
            string += '&trackLabels';
            if (labelsGeom) {
                string += '&labelsGeom';
            }
            if (geomUseEGM) {
                string += '&geomEGM';
            }
        }
        if (traceOpts.showTime) {
            string += '&timestamp=';
            string += Math.ceil(traceOpts.showTime);
        }
    }

    let shareFilter = '';
    if (shareFiltersParam || (toggles.shareFilters  && toggles.shareFilters.state)) {
        let filterStrings = [];

        if (PlaneFilter.minAltitude > -1000000) {
            filterStrings.push('filterAltMin=' + PlaneFilter.minAltitude);
        }
        if (PlaneFilter.maxAltitude < 1000000) {
            filterStrings.push('filterAltMax=' + PlaneFilter.maxAltitude);
        }

        for (const filter of filters_active) {
            filterStrings.push(`filter${filter.key}=${encodeURIComponent(filter.pattern)}`);
        }

        if (PlaneFilter.sources) {
            filterStrings.push('filterSources=' + PlaneFilter.sources.map(f => encodeURIComponent(f)).join(','));
        }
        if (PlaneFilter.flagFilter) {
            filterStrings.push('filterDbFlag=' + PlaneFilter.flagFilter.map(f => encodeURIComponent(f)).join(','));
        }

        if (filterStrings.length > 0) {
            shareFilter = shareFilter + filterStrings.join('&');
        } else {
            shareFilter = '';
        }

        //console.log(shareFilter);

        if (shareFilter) {
            string += (string ? '&' : '?');
            string += shareFilter;
        }
    }

    if (icaoFilter && !showTrace) {
        string += (string ? '&' : '?');
        string += 'icaoFilter=' + icaoFilter.join(',')
    }

    if (shareBaseUrl) {
        shareLink = shareBaseUrl + string;
    } else {
        shareLink = window.location.origin + pathName + string;
    }
    //console.log(shareLink);

    if (!string && !usp.has('showTrace') && !usp.has('icao')) {
        string = initialURL;
    } else {
        string = pathName + string;
    }

    // Update URL bar
    /*
    let time = new Date().getTime();
    if (time < lastAddressBarUpdate + 200) {
        clearTimeout(updateAddressBarTimeout);
        updateAddressBarTimeout = setTimeout(updateAddressBar, 205);
        return;
    }

    lastAddressBarUpdate = time;
    */

    if (string == updateAddressBarString) {
        return;
    }
    updateAddressBarString = string;

    if (!updateAddressBarPushed) {
        // make sure we keep the thing we clicked on first in the browser history
        window.history.pushState("object or string", "Title", string);
        updateAddressBarPushed = true;
    } else {
        // but don't create a new history entry for every plane we click on
        window.history.replaceState("object or string", "Title", string);
    }
}

function refreshInt() {
    let refresh = RefreshInterval;

    if (uuid)
        return 5050;

    // handle non globe case
    if (!globeIndex) {
        return refresh;
    }

    // handle globe case

    if (reApi && (binCraft || zstd)) {
        refresh = RefreshInterval * lastRequestSize / 35000;
        let extent = getViewOversize(1.03);
        const latDiff = extent.maxLat - extent.minLat;
        const lonDiff = extent.maxLon - extent.minLon;
        const area = latDiff * lonDiff;
        const areaThreshold = 30 * 30;
        let min = 1;
        let max = 7;
        if (area > areaThreshold && !onlySelected) {
            const factor2 = Math.min(4, (latDiff * lonDiff) / areaThreshold);
            min *= factor2;
        }
        if (refresh < RefreshInterval * min) {
            refresh = RefreshInterval * min;
        }
        if (refresh > RefreshInterval * max) {
            refresh = RefreshInterval * max;
        }
        if (onlySelected && SelPlanes.length == 0 && reApi) {
            // no aircraft selected, none shown
            refresh = RefreshInterval * max * 2;
        }
        if (!FollowSelected && lastRequestBox != requestBoxString()) {
            refresh = Math.min(RefreshInterval, refresh / 4);
        }
    }

    if (!reApi && binCraft && globeIndex && onlyMilitary && !onlyEmergency && OLMap.getView().getZoom() < 5.5) {
        refresh = 5000;
    }

    let inactive = getInactive();

    const base = 70;

    if (inactive < base)
        inactive = base;
    if (inactive > 4 * base)
        inactive = 4 * base;


    if (globeIndex) {
        refresh *= inactive / base;
    }

    if (!mapIsVisible)
        refresh *= 2;

    if (aggregator && window.self != window.top) {
        refresh *= 1.5;
    } else if (onMobile && TrackedAircraftPositions > 800) {
        refresh *= 1.5;
    }

    if (document.visibilityState === 'hidden') { refresh *= 4; } // in case visibility change events don't work, reduce refresh rate if visibilityState works

    //console.log(refresh);

    return refresh;
}

function toggleShowTrace() {
    showTrace = !showTrace;
    if (showTrace) {
        jQuery("#selected_showTrace_hide").hide();

        toggleFollow(false);
        showTraceWasIsolation = onlySelected;
        toggleIsolation("on", "noRefresh");
        shiftTrace();
        refreshFilter();
    } else {
        jQuery("#selected_showTrace_hide").show();

        traceOpts = {};
        fetchData();
        legSel = -1;
        jQuery('#leg_sel').text('Legs: All');
        if (!showTraceWasIsolation)
            toggleIsolation("off");
        //let string = pathName + '?icao=' + SelectedPlane.icao;
        //window.history.replaceState("object or string", "Title", string);
        //shareLink = string;
        updateAddressBar();
        const hex = SelectedPlane.icao;
        sp = SelectedPlane = null;
        showTraceExit = true;
        for (let i in SelPlanes) {
            const plane = SelPlanes[i];
            plane.setNull();
        }
        selectPlaneByHex(hex, {noDeselect: true, follow: true, zoom: g.zoomLvl,});
        if (replay) {
            replayStep();
        }
    }

    jQuery('#history_collapse').toggle();
    jQuery('#show_trace').toggleClass('active');
}

function legShift(offset, plane) {
    if(!offset)
        offset = 0;
    if (!plane) {
        legSel += offset;
        for (let i in SelPlanes) {
            legShift(offset, SelPlanes[i]);
        }
        return;
    }


    if (offset != 0)
        traceOpts.showTime = null;

    if (!multiSelect && !plane.fullTrace) {
        jQuery('#leg_sel').text('No Data available for\n' + traceDateString);
        jQuery('#trace_time').text('UTC:\n');
    }
    if (!plane.fullTrace) {
        plane.processTrace();
        return;
    }

    let trace = plane.fullTrace.trace;
    let legStart = null;
    let legEnd = null;
    let count = 0;

    for (let i = 0; i < trace.length; i++) {
        let timestamp = trace[i][0];
        if (traceOpts.startStamp != null && timestamp < traceOpts.startStamp) {
            continue;
        }
        if (traceOpts.endStamp != null && timestamp > traceOpts.endStamp) {
            break;
        }
        if (legStart == null) {
            legStart = i;
            i++;
            if (i >= trace.length)
                break;
        }
        if (trace[i][6] & 2) {
            count++;
        }
    }
    if (legSel < -1)
        legSel = count;
    if (legSel > count)
        legSel = -1;

    if (legSel == -1) {
        jQuery('#leg_sel').text('Legs: All');
        traceOpts.legStart = null;
        traceOpts.legEnd = null;
        plane.processTrace();
        updateAddressBar();
        return;
    }

    count = 0;
    for (let i = legStart + 1; i < trace.length; i++) {
        let timestamp = trace[i][0];
        if (traceOpts.endStamp != null && timestamp > traceOpts.endStamp)
            break;
        if (trace[i][6] & 2) {
            if (count == legSel - 1)
                legStart = i;
            if (count == legSel)
                legEnd = i; // exclusive
            count++;
        }
    }
    jQuery('#leg_sel').text('Leg: ' + (legSel + 1));
    traceOpts.legStart = legStart;
    traceOpts.legEnd = legEnd;
    plane.processTrace();

    updateAddressBar();
}

function setTraceDate(options) {
    options = options || {};
    let numbers = options.string ? options.string.split('-') : [];
    if (numbers.length == 3) {
        traceDate = new Date();
        traceDate.setUTCFullYear(numbers[0]);
        traceDate.setUTCMonth(numbers[1] - 1, numbers[2]);
    } else if (options.ts) {
        traceDate = new Date(options.ts);
    } else {
        return null;
    }
    traceDate.setUTCHours(0);
    traceDate.setUTCMinutes(0);
    traceDate.setUTCSeconds(0);
    traceDate.setUTCMilliseconds(0);

    let tomorrow = (new Date()).getTime() + 86400e3;
    if (traceDate.getTime() > tomorrow) {
        traceDate = new Date(tomorrow);
    }

    traceDateString = zDateString(traceDate);

    return traceDate;
}

function shiftTrace(offset) {
    if (traceRate > 180) {
        jQuery('#leg_sel').text('Slow down! ...');
        return;
    }

    // reset some traceOpts stuff (important)
    traceOpts.startStamp = null;
    traceOpts.endStamp = null;
    traceOpts.showTimeEnd = null;
    traceOpts.showTime = null;

    jQuery('#leg_sel').text('Loading ...');
    if (!traceDate || offset == "today") {
        if (replay) {
            setTraceDate({ ts: replay.ts.getTime() });
        } else {
            setTraceDate({ ts: new Date().getTime() });
        }
    } else if (offset) {
        setTraceDate({ ts: traceDate.getTime() + offset * 86400 * 1000 });
    }

    //jQuery('#trace_date').text('UTC day:\n' + traceDateString);
    jQuery("#histDatePicker").datepicker('setDate', traceDateString);

    for (let i in SelPlanes) {
        selectPlaneByHex(SelPlanes[i].icao, {noDeselect: true, zoom: g.zoomLvl});
    }

    updateAddressBar();
}


function setLineWidth() {
    newWidth = lineWidth * Math.pow(2, globalScale) / 2 * globalScale

    estimateStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#808080',
            width: 1.2 * newWidth,
        })
    });
    estimateStyleSlim = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#808080',
            width: 0.4 * newWidth,
        })
    });

    badLine =  new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#FF0000',
            width: 2 * newWidth,
        })
    });
    badLineMlat =  new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#FFA500',
            width: 2 * newWidth,
        })
    });

    badDot = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 3.5 * newWidth,
            fill: new ol.style.Fill({
                color: '#FF0000',
            })
        }),
    });
    badDotMlat = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 3.5 * newWidth,
            fill: new ol.style.Fill({
                color: '#FFA500',
            })
        }),
    });

    labelFill = new ol.style.Fill({color: 'white' });
    blackFill = new ol.style.Fill({color: 'black' });
    labelStroke = new ol.style.Stroke({color: 'rgba(0,0,0,0.7', width: 4 * globalScale});
    labelStrokeNarrow = new ol.style.Stroke({color: 'rgba(0,0,0,0.7', width: 2.5 * globalScale});
    bgFill = new ol.style.Stroke({color: 'rgba(0,0,0,0.25'});
}
let lastCallLocationChange = 0;
function onLocationChange(position) {
    if (SiteOverride) {
        return;
    }
    lastCallLocationChange = new Date().getTime();
    changeCenter();
    const moveMap = (Math.abs(SiteLat - CenterLat) < 0.000001 && Math.abs(SiteLon - CenterLon) < 0.000001);
    SiteLat = DefaultCenterLat = position.coords.latitude;
    SiteLon = DefaultCenterLon = position.coords.longitude;
    SitePosition = [SiteLon, SiteLat];

    drawSiteCircle();
    createLocationDot();

    if (moveMap || lockDotCentered) {
        OLMap.getView().setCenter(ol.proj.fromLonLat([SiteLon, SiteLat]));
    }
    console.log('Changed Site Location to: '+ SiteLat +', ' + SiteLon);
    //followRandomPlane();
    //togglePersistence();
}
function logArg(error) {
    console.log(error);
}

let watchPositionId;
let pollPositionSeconds = 10;
function pollPositionInterval() {
    if (!updateLocation || !geoFindEnabled()) {
        return;
    }
    // interval position polling every half minute for browsers that are shit
    //console.trace();
    clearInterval(timers.pollPosition);
    timers.pollPosition = window.setInterval(function() {

        // if we recently got a new location via watchPosition(), don't query
        if (new Date().getTime() - lastCallLocationChange < pollPositionSeconds * 0.85 * 1000)
            return;

        if (tabHidden)
            return;

        console.log('pollPositionInterval: querying position');
        const geoposOptions = {
            enableHighAccuracy: false,
            timeout: pollPositionSeconds * 1000,
            maximumAge: pollPositionSeconds * 1000 ,
        };
        navigator.geolocation.getCurrentPosition(function(position) {
            onLocationChange(position);
        }, logArg, geoposOptions);
    }, pollPositionSeconds * 1000);
}

function watchPosition() {
    if (watchPositionId != null) {
        navigator.geolocation.clearWatch(watchPositionId);
    }
    if (!updateLocation || !geoFindEnabled()) {
        return;
    }
    const geoposOptions = {
        enableHighAccuracy: false,
        timeout: Infinity,
        maximumAge: 25 * 1000,
    };
    console.log("watching position");
    watchPositionId = navigator.geolocation.watchPosition(function(position) {
        onLocationChange(position);
        pollPositionSeconds = 60;
    }, logArg, geoposOptions);
    pollPositionInterval();
}

let geoFindInterval = null;
function geoFindMe() {
    //console.trace();

    // Captured locally so success()/error() below always settle *this*
    // call's own deferred, even if a later geoFindMe() call (e.g. clicking
    // "Home" again before this one's geolocation request has settled)
    // reassigns g.geoFindDefer to a new one in the meantime - otherwise the
    // first call's eventual callback would incorrectly resolve/reject the
    // second call's deferred instead of its own.
    const thisDefer = g.geoFindDefer = jQuery.Deferred();
    function success(position) {
        SiteLat = DefaultCenterLat = position.coords.latitude;
        SiteLon = DefaultCenterLon = position.coords.longitude;
        if (loStore['geoFindMeFirstVisit'] != 'no' && !(usp.has("lat") && usp.has("lon"))) {
            OLMap.getView().setCenter(ol.proj.fromLonLat([SiteLon, SiteLat]));
            loStore['geoFindMeFirstVisit'] = 'no';
        }

        initSitePos();
        console.log('Location from browser: '+ SiteLat +', ' + SiteLon);

        thisDefer.resolve();


        {
            // always update user location every 15 minutes
            clearInterval(geoFindInterval);
            geoFindInterval = window.setInterval(function() {
                if (tabHidden)
                    return;
                const geoposOptions = {
                    enableHighAccuracy: false,
                    timeout: 15 * 60 * 1000,
                    maximumAge: 5 * 60 * 1000 ,
                };
                console.log('geoFindInterval: querying position');
                navigator.geolocation.getCurrentPosition(onLocationChange, logArg, geoposOptions);
            }, 15 * 60 * 1000);
        }
    }

    function error() {
        console.log("Unable to query location.");
        initSitePos();
        thisDefer.reject();
    }

    if (!geoFindEnabled()) {
        //console.log('Geolocation is not enabled');
        initSitePos();
        thisDefer.reject();
    } else if (!navigator.geolocation) {
        console.log('Geolocation is not supported by your browser');
        initSitePos();
        thisDefer.reject();
    } else {
        // change SitePos on location change
        console.log('Locating…');
        const geoposOptions = {
            enableHighAccuracy: false,
            // Was Infinity: if the browser never calls back (permission
            // prompt left pending, no fix indoors, tab backgrounded, a flaky
            // location provider), neither success() nor error() ever fires,
            // g.geoFindDefer never settles, and anything waiting on it (e.g.
            // resetMap()'s "Home" button) hangs forever with no feedback and
            // no way to recover short of reloading. A real timeout means it
            // always resolves one way or the other. 10s matches what a
          // user clicking a button actually expects to wait, rather than the
            // 15-minute value used for the unrelated periodic background
            // refresh a little further down.
            timeout: 10 * 1000,
            maximumAge: 300 * 1000,
        };
        navigator.geolocation.getCurrentPosition(success, error, geoposOptions);
    }

    return thisDefer;
}

let initSitePosFirstRun = true;
function initSitePos() {
    // fall back to loStore position
    if (loStore['SiteLat'] != null && loStore['SiteLon'] != null && SiteLat == null && SiteLon == null) {
        SiteLat = CenterLat = DefaultCenterLat = parseFloat(loStore['SiteLat']);
        SiteLon = CenterLon = DefaultCenterLon = parseFloat(loStore['SiteLon']);
    }
    // Set SitePosition
    if (SiteLat != null && SiteLon != null) {
        SitePosition = [SiteLon, SiteLat];
        // Add home marker if requested
        drawSiteCircle();
        createLocationDot();
    } else {
        TAR.planeMan.setColumnVis('sitedist', false);
    }

    if (initSitePosFirstRun) {
        initSitePosFirstRun = false;
        const sortBy = usp.get('sortBy');
        if (sortBy == "nosort" ) {
            // no sorting
        } else if (sortBy) {
            TAR.planeMan.ascending = true;
            TAR.planeMan.cols[sortBy].sort();
            if (usp.has('sortByReverse')) {
                TAR.planeMan.cols[sortBy].sort();
            }
        } else if (loStore['sortCol']) {
            TAR.planeMan.sortAscending = Boolean(loStore['sortAscending']);
            TAR.planeMan.cols[loStore['sortCol']].sort();
        } else {
            if (SitePosition) {
                TAR.planeMan.cols.sitedist.sort();
            } else {
                TAR.planeMan.sortAscending = false;
                TAR.planeMan.cols.altitude.sort();
            }
        }
    }
}

/*
function drawAlt() {
    processAircraft({hex: 'c0ffee', });
    let plane = g.planes['c0ffee'];
    newWidth = 4;
    for (let i = 0; i <= 50000; i += 500) {
        plane.position = [i/10000, 0];
        plane.altitude = i;
        plane.alt_rounded = calcAltitudeRounded(plane.altitude);
        plane.updateTrack(now - i, now - i - 5000, { serverTrack: true });
    }
}
*/

function remakeTrails() {
    for (let i in g.planesOrdered) {
        const plane = g.planesOrdered[i];
        plane.removeTrail();
        plane.linesDrawn && (plane.drawLine = 1);
        plane.updateFeatures();
    }
}

function createLocationDot() {
    locationDotFeatures.clear();
    let markerStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 7,
            snapToPixel: false,
            fill: new ol.style.Fill({color: 'black'}),
            stroke: new ol.style.Stroke({
                color: 'white', width: 2
            })
        })
    });

    let feature = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(SitePosition)));
    feature.setStyle(markerStyle);
    locationDotFeatures.addFeature(feature);
}
function drawSiteCircle() {
    //console.trace();
    siteCircleFeatures.clear();

    if (!SitePosition)
        return;

    let circleColor = '#000000';

    for (let i = 0; i < SiteCirclesDistances.length; i++) {
        circleColor = i < SiteCirclesColors.length ? SiteCirclesColors[i] : circleColor;

        let conversionFactor = 1000.0;
        if (DisplayUnits === "nautical") {
            conversionFactor = 1852.0;
        } else if (DisplayUnits === "imperial") {
            conversionFactor = 1609.0;
        }

        let distance = SiteCirclesDistances[i] * conversionFactor;
        let circle = TAR.utils.make_geodesic_circle(SitePosition, distance, 180);
        circle.transform('EPSG:4326', 'EPSG:3857');
        let feature = new ol.Feature(circle);

        let circleStyle = new ol.style.Style({
            fill: null,
            stroke: new ol.style.Stroke({
                color: circleColor,
                lineDash: SiteCirclesLineDash,
                width: globalScale,
            }),
            text: new ol.style.Text({
                font: ((10 * globalScale) + 'px Helvetica Neue, Helvetica, Tahoma, Verdana, sans-serif'),
                fill: new ol.style.Fill({ color: '#000' }),
                offsetY: -8,
                text: format_distance_long(distance, DisplayUnits, 0),
            })
        });

        feature.setStyle(circleStyle);
        siteCircleFeatures.addFeature(feature);
    }
}

let calcOutlineFeatures = new ol.source.Vector();
let calcOutlineLayer;
function drawUpintheair() {
    // Add terrain-limit rings. To enable this:
    //
    //  create a panorama for your receiver location on heywhatsthat.com
    //
    //  note the "view" value from the URL at the top of the panorama
    //    i.e. the XXXX in http://www.heywhatsthat.com/?view=XXXX
    //
    // fetch a json file from the API for the altitudes you want to see:
    //
    //  wget -O /usr/local/share/tar1090/html/upintheair.json \
    //    'http://www.heywhatsthat.com/api/upintheair.json?id=XXXX&refraction=0.25&alts=3048,9144'
    //
    // NB: altitudes are in _meters_, you can specify a list of altitudes
    //
    if (!calcOutlineData)
        return;

    let data = calcOutlineData;
    for (let i = 0; i < data.rings.length; ++i) {
        let geom = null;
        let points = data.rings[i].points;
        let altitude = (3.28084 * data.rings[i].alt).toFixed(0);
        let color = range_outline_color;
        if (range_outline_colored_by_altitude) {
            let colorArr = altitudeColor(altitude);
            color = 'hsla(' + colorArr[0].toFixed(0) + ',' + colorArr[1].toFixed(0) + '%,' + colorArr[2].toFixed(0) + '%,' + range_outline_alpha + ')';
        }
        let outlineStyle = new ol.style.Style({
            fill: null,
            stroke: new ol.style.Stroke({
                color: color,
                width: range_outline_width,
                lineDash: range_outline_dash,
            })
        });
        if (points.length > 0) {
            geom = new ol.geom.LineString([[ points[0][1], points[0][0] ]]);
            for (let j = 0; j < points.length; ++j) {
                geom.appendCoordinate([ points[j][1], points[j][0] ]);
            }
            geom.appendCoordinate([ points[0][1], points[0][0] ]);
            geom.transform('EPSG:4326', 'EPSG:3857');

            let feature = new ol.Feature(geom);
            feature.setStyle(outlineStyle);
            calcOutlineFeatures.addFeature(feature);
        }
    }
}

function drawOutlineJson() {
    let request = jQuery.ajax({ url: actualOutline.url,
        cache: false,
        timeout: actualOutline.refresh,
        dataType: 'json' });
    request.done(function(data) {
        actualOutline.features.clear();
        let points = [];
        if (data.multiRange) {
            points = data.multiRange
        } else if (data.actualRange && data.actualRange.last24h) {
            points[0] = data.actualRange.last24h.points;
        } else {
            points[0] = data.points;
        }
        if (!points[0] || !points[0].length)
            return;
        for (let p = 0; p < points.length; ++p) {
            let geom = null;
            let lastLon = null;
            for (let j = 0; j < points[p].length + 1; ++j) {
                const k = j % points[p].length;
                const lat = points[p][k][0];
                const lon = points[p][k][1];
                const proj = ol.proj.fromLonLat([lon, lat]);
                if (!geom || (lastLon && Math.abs(lon - lastLon) > 270)) {
                    geom = new ol.geom.LineString([proj]);
                    actualOutline.features.addFeature(new ol.Feature(geom));
                } else {
                    geom.appendCoordinate(proj);
                }
                lastLon = lon;
            }
        }
    });

    request.fail(function() {
        // no rings available, do nothing
    });
}

function gotoTime(timestamp) {
    //console.log(`gotoTime(${timestamp}) animate: {${traceOpts.animate}}`);
    clearTimeout(traceOpts.showTimeout);
    if (timestamp) {
        traceOpts.showTime = timestamp;
        traceOpts.animate = false;
    }
    if (!traceOpts.animate) {
        legShift(0);
    } else {
        let marker = SelectedPlane.glMarker || SelectedPlane.marker;
        if (marker) {

            traceOpts.animatePos[0] += (traceOpts.animateToLon - traceOpts.animateFromLon) / traceOpts.animateSteps;
            traceOpts.animatePos[1] += (traceOpts.animateToLat - traceOpts.animateFromLat) / traceOpts.animateSteps;

            SelectedPlane.updateMarker();
        }
        if (--traceOpts.animateCounter == 1) {
            traceOpts.animate = false;
            traceOpts.showTime = traceOpts.showTimeEnd;
        }

        traceOpts.animateStepTime = traceOpts.animateRealtime / traceOpts.replaySpeed / traceOpts.animateSteps;
        clearTimeout(traceOpts.showTimeout);
        //console.log(`setTimeout(gotoTime, (${traceOpts.animateStepTime}))`);
        traceOpts.showTimeout = setTimeout(gotoTime, traceOpts.animateStepTime);
    }
}

function checkFollow() {
    if (!FollowSelected)
        return false;
    if (!SelectedPlane || !SelectedPlane.position) {
        toggleFollow(false);
        return false;
    }
    const center = OLMap.getView().getCenter();
    let proj = SelectedPlane.proj;

    if (!proj) {
        return false;
    }

    if (Math.abs(center[0] - proj[0]) > 1 ||
        Math.abs(center[1] - proj[1]) > 1)
    {
        toggleFollow(false);
        return false;
    }
    return true;
}

function everySecond() {
    if (traceRate > 0)
        traceRate = traceRate  * 0.985 - 1;
    updateIconCache();

}

let getTraceTimeout = null;
function getTrace(newPlane, hex, options) {

    if (options.list) {
        newPlane = options.list.pop()
        if (!newPlane) {
            return;
        }
        hex = newPlane.icao;
    }

    if (!newPlane) {
        newPlane = g.planes[hex] || new PlaneObject(hex);
        newPlane.last_message_time = NaN;
        newPlane.position_time = NaN;
        select(newPlane, options);
    }

    // Neither AIS vessels nor satellites ever have readsb-native trace data -
    // readsb has never seen either kind of key, since both are populated
    // entirely client-side (processBoat() / processSatellite()), never
    // through readsb's own ingestion at all. Fetching trace_recent_/
    // trace_full_ for one of these is guaranteed to 404 on every single
    // selection - skip it outright. The plane is still selected normally
    // above; this only skips readsb's own trace/history fetch, not this
    // app's own vessel-track/satellite-track mechanisms (fetchVesselTrack()/
    // fetchSatelliteTrack()), which are unrelated and unaffected.
    if (hex && (String(hex).startsWith('MMSI') || String(hex).startsWith('SAT'))) {
        return newPlane;
    }

    let time = new Date().getTime();
    let backoff = 200;
    if (!showTrace && !solidT && traceRate > 140 && time < lastTraceGet + backoff) {
        clearTimeout(getTraceTimeout);
        getTraceTimeout = setTimeout(getTrace, lastTraceGet + backoff + 20 - time, newPlane, hex, options);
        return newPlane;
    }

    lastTraceGet = time;

    let URL1;
    let URL2;
    //console.log('Requesting trace: ' + hex);

    // use non historic traces until 60 min after midnight
    let today = new Date();
    let refDate = ((replay && !showTrace) ? replay.ts : traceDate) || today;

    if ((showTrace || replay) && !(today.getTime() > refDate.getTime() && today.getTime() < refDate.getTime() + (24 * 3600 + 60 * 60) * 1000)) {
        URL1 = null;
        URL2 = 'globe_history/' + zDateString(refDate).replace(/-/g, '/') + '/traces/' + hex.slice(-2) + '/trace_full_' + hex + '.json';
        traceRate += 3;
    } else {
        URL1 = 'data/traces/'+ hex.slice(-2) + '/trace_recent_' + hex + '.json';
        URL2 = 'data/traces/'+ hex.slice(-2) + '/trace_full_' + hex + '.json';
        traceRate += 2;
    }
    if (showTrace && trace_hist_only) {
        URL2 = 'globe_history/' + zDateString(refDate).replace(/-/g, '/') + '/traces/' + hex.slice(-2) + '/trace_full_' + hex + '.json';
    }

    traceOpts.follow = (options.follow == true);

    if (showTrace) {
        //console.log(today.toUTCString() + ' ' + traceDate.toUTCString());

        if (traceOpts.startHours == null || traceOpts.startHours < 0)
            traceOpts.startStamp = traceDate.getTime() / 1000;
        else
            traceOpts.startStamp = traceDate.getTime() / 1000 + traceOpts.startHours * 3600 + traceOpts.startMinutes * 60 + traceOpts.startSeconds;

        if (traceOpts.endHours == null || traceOpts.endHours >= 24)
            traceOpts.endStamp = traceDate.getTime() / 1000 + 24 * 3600;
        else
            traceOpts.endStamp = traceDate.getTime() / 1000 + traceOpts.endHours * 3600 + traceOpts.endMinutes * 60 + traceOpts.endSeconds;
    }

    if (newPlane && (showTrace || showTraceExit)) {
        newPlane.trace = [];
        newPlane.recentTrace = null;
        newPlane.fullTrace = null;
    }

    //console.log(URL2);

    //options = JSON.parse(JSON.stringify(options));
    options.plane = `${newPlane.icao}`;
    options.defer = jQuery.Deferred();

    if (URL1 && !options.onlyFull) {
        jQuery.ajax({ url: `${URL1}`,
            dataType: 'json',
            options: options,
        })
            .done(function(data) {
                const options = this.options;
                const plane = g.planes[options.plane];
                plane.recentTrace = normalizeTraceStamps(data);
                if (!showTrace) {
                    plane.processTrace();
                    if (options.follow)
                        toggleFollow(true);
                }
                options.defer.resolve(options);
                if (options.onlyRecent && options.list) {
                    newPlane.updateLines();
                    getTrace(null, null, options);
                }
                this.options = null;
            });
    } else {
        options.defer.resolve(options);
    }

    if (options.onlyRecent)
        return newPlane;

    jQuery.ajax({ url: `${URL2}`,
        dataType: 'json',
        options: options,
    })
        .done(function(data) {
        const options = this.options;
        const plane = g.planes[options.plane];
        plane.fullTrace = normalizeTraceStamps(data);
        options.defer.done(function(options) {
            const plane = g.planes[options.plane];
            if (showTrace) {
                legShift(0, plane);
                if (!multiSelect && showTraceTimestamp) {
                    gotoTime(showTraceTimestamp);
                }
            } else {
                plane.processTrace();
                if (options.follow)
                    toggleFollow(true);
            }
        });
        if (options.list) {
            newPlane.updateLines();
            getTrace(null, null, options);
        }
        options.defer = null;
        this.options = null;
    })
        .fail(function() {
        const options = this.options;
        const plane = g.planes[options.plane];
        if (showTrace)
            legShift(0, plane);
        else
            plane.processTrace();

        if (options.list) {
            getTrace(null, null, options);
        } else {
            plane.getAircraftData();
            refreshSelected();
        }
        this.options = null;
    });

    return newPlane;
}

function initHeatmap() {
    heatmap.init = false;
    if (heatFeatures.length == 0) {
        for (let i = 0; i < heatFeaturesSpread; i++) {
            heatFeatures.push(new ol.source.Vector());
            heatLayers.push(new ol.layer.Vector({
                name: ('heatLayer' + i),
                isTrail: true,
                source: heatFeatures[i],
                declutter: (heatmap.declutter ? true : false),
                zIndex: 150,
                renderOrder: null,
                renderBuffer: 5,
            }));
            trailGroup.push(heatLayers[i]);
        }
    }
    realHeat = new ol.layer.Heatmap({
        source: realHeatFeatures,
        name: realHeat,
        isTrail: true,
        zIndex: 150,
        weight: x => heatmap.weight,
        radius: heatmap.radius,
        blur: heatmap.blur,
    });
    trailGroup.push(realHeat);
}

function setSize(set) {
    let count = 0;
    for (const i in set.values())
        count++;
    return count;
}

function drawHeatmap() {
    if (!heatmap)
        return;
    if (heatmap.init) {
        initHeatmap();
    }

    console.time("drawHeat");

    let ext = myExtent(viewportExtent(OLMap.getSize()));
    let maxLat = ext.maxLat * 1000000;
    let minLat = ext.minLat * 1000000;

    webglFeatures.clear();
    for (let i = 0; i < heatFeaturesSpread; i++)
        heatFeatures[i].clear();
    realHeatFeatures.clear();

    let pointCount = 0;
    let features = [];
    if (lineStyleCache["scale"] != globalScale) {
        lineStyleCache = {};
        lineStyleCache["scale"] = globalScale;
    }
    let done = new Set();
    let iterations = 0;
    let maxIter = 1000 * 1000;


    let tempPoints = [];
    for (let k = 0; k < heatChunks.length; k++) {
        if (heatPoints[k] != null) {
            true; // do nothing
        } else if (heatChunks[k] != null) {
            if (heatChunks[k].byteLength % 16 != 0) {
                console.log("Invalid heatmap file (byteLength): " + k);
                continue;
            }
            let points = heatPoints[k] = new Int32Array(heatChunks[k]);
            let found = 0;
            for (let i = 0; i < points.length; i += 4) {
                if (points[i] == 0xe7f7c9d) {
                    found = 1;
                    break;
                }
            }
            if (!found) {
                heatPoints[k] = heatChunks[k] = null;
                console.log("Invalid heatmap file (magic number): " + k);
            }
        } else {
            continue;
        }
        tempPoints.push(heatPoints[k]);
    }

    //console.log('tempPoints.length: ' + tempPoints.length);
    let myPoints = [];
    if (tempPoints.length <= 2) {
        myPoints = tempPoints;
    } else {
        let len = tempPoints.length;
        let arr1 = tempPoints.splice(0, Math.round(tempPoints.length / 3));
        let arr2 = tempPoints.splice(0, Math.round(tempPoints.length / 2));
        let arr3 = tempPoints;
        myPoints.push(arr2.splice(0, 1));
        myPoints.push(arr3.splice(0, 1));
        myPoints.push(arr1.splice(0, 1));
        len -= 3;
        for (let i = 0; i < Math.ceil(len / 3); i++) {
            myPoints.push(arr2.splice(0, 1));
            myPoints.push(arr3.splice(0, 1));
            myPoints.push(arr1.splice(0, 1));
        }
    }
    myPoints = myPoints.flat();

    //console.log('myPoints.length: ' + myPoints.length);

    let indexes = [];
    for (let k = 0; k < myPoints.length; k++) {
        let points = myPoints[k];
        let index = [];
        let i = 0;
        if (!points)
            continue;
        while(points[i] != 0xe7f7c9d && i < points.length) {
            index.push(points[i]);
            //console.log(points[i]);
            i += 4;
        }
        if (!heatmap.lines)
            index.sort((a, b) => (Math.random() - 0.5));
        indexes.push(index);
    }

    let offsets = Array(myPoints.length).fill(0);

    while (pointCount < heatmap.max && done.size < myPoints.length && iterations++ < maxIter) {
        for (let k = 0; k < myPoints.length && pointCount < heatmap.max; k++) {

            if (offsets[k] > indexes[k].length) {
                continue;
            }
            if (offsets[k] == indexes[k].length) {
                done.add(k);
                offsets[k]++;
                continue;
            }

            let points = myPoints[k];
            let pointsU = new Uint32Array(points.buffer);

            let i = 4 * indexes[k][offsets[k]];

            if (points[i] == 0xe7f7c9d)
                i += 4;

            if (i < 0) {
                console.log('wat ' + i);
                break;
            }
            for (; i < points.length; i += 4) {
                if (points[i] == 0xe7f7c9d)
                    break;
                let lat = points[i+1];
                if (lat > maxLat || lat < minLat)
                    continue;

                lat /= 1000000;
                let lon = points[i + 2] / 1000000;
                let pos = [lon, lat];

                if (!inView(pos, ext))
                    continue;

                let alt = points[i + 3] & 65535;
                if (alt & 32768)
                    alt |= -65536;
                if (alt == -123)
                    alt = 'ground';
                else if (alt == -124)
                    alt = null;
                else
                    alt *= 25;

                let gs = points[i + 3] >> 16;
                if (gs == -1)
                    gs = null;
                else
                    gs /= 10;

                if (PlaneFilter.enabled && altFiltered(alt))
                    continue;

                if (heatmap.filters) {
                    let type = (pointsU[i] >> 27) & 0x1F;
                    let dataSource;
                    switch (type) {
                        case  0: dataSource = 'adsb';     break;
                        case  1: dataSource = 'modeS';    break;
                        case  2: dataSource = 'adsr';     break;
                        case  3: dataSource = 'tisb';     break;
                        case  4: dataSource = 'adsc';     break;
                        case  5: dataSource = 'mlat';     break;
                        case  6: dataSource = 'other';    break;
                        case  7: dataSource = 'modeS';    break;
                        case  8: dataSource = 'adsb';     break;
                        case  9: dataSource = 'adsr';     break;
                        case 10: dataSource = 'tisb';     break;
                        case 11: dataSource = 'tisb';     break;
                        default: dataSource = 'unknown';
                    }
                    let hex = (pointsU[i] & 0xFFFFFF).toString(16).padStart(6, '0');
                    hex = (pointsU[i] & 0x1000000) ? ('~' + hex) : hex;
                    let plane = g.planes[hex] || new PlaneObject(hex);
                    plane.dataSource = dataSource;
                    if (plane.isFiltered()) {
                        continue;
                    }
                }

                pointCount++;
                //console.log(pos);

                alt = calcAltitudeRounded(alt);
                let projHere = ol.proj.fromLonLat(pos);
                let style = lineStyleCache[alt];
                let hsl = altitudeColor(alt);
                hsl[1] = hsl[1] * 0.85;
                hsl[2] = hsl[2] * 0.8;
                if (!style) {
                    let col;
                    if (heatmap.alpha == null)
                        col = hslToRgb(hsl);
                    else
                        col = hslToRgb(hsl, heatmap.alpha);

                    style = new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: heatmap.radius * globalScale,
                            fill: new ol.style.Fill({
                                color: col,
                            }),
                        }),
                        zIndex: i,
                    });
                    lineStyleCache[alt] = style;
                }
                let feat = new ol.Feature(new ol.geom.Point(projHere));
                if (webgl) {
                    let rgb = hslToRgb(hsl, 'array');
                    feat.set('r', rgb[0]);
                    feat.set('g', rgb[1]);
                    feat.set('b', rgb[2]);
                } else {
                    feat.setStyle(style);
                }
                features.push(feat);
                //console.log(alt);
            }
            offsets[k] += 1;
        }
    }
    if (iterations >= maxIter)
        console.log("drawHeatmap: MAX_ITERATIONS!");
    //console.log(setSize(done));
    console.log("files: " + myPoints.length + ", points drawn: " + pointCount);
    if (heatmap.real) {
        realHeatFeatures.addFeatures(features);
    } else {

        if (webgl) {
            webglFeatures.addFeatures(features);
        } else {
            for (let i = 0; i < heatFeaturesSpread; i++) {

                heatFeatures[i].addFeatures(features.splice(0, pointCount / heatFeaturesSpread + 1));
                //console.log(features.length);
            }
        }
    }
    console.timeEnd("drawHeat");
    jQuery("#loader").hide();
}

function currentExtent(factor) {
    let size = OLMap.getSize();
    if (factor != null)
        size = [size[0] * factor, size[1] * factor];
    return myExtent(viewportExtent(size));
}

// Replay switched on: drop live-only objects (satellites, vessels) and their
// tracks / hull outlines; their polls stay idle while liveFeedsSuspended().
function suspendLiveFeeds() {
    removeDomainObjects(plane => plane.isSatellite || String(plane.icao).startsWith('MMSI'));
    if (g.trackState && g.trackState.key) resetSelectedTrack();
    if (typeof clearAisHullSource === 'function') clearAisHullSource();
}

// Replay switched off: fetch the live feeds straight away rather than waiting
// for the next poll.
function resumeLiveFeeds() {
    if (liveFeedsSuspended() || !timersActive) return;
    if (satelliteJson) updateSatellites();
    if (aiscatcher_server) updateAIScatcher();
}

function replayResetState() {
    clearTimeout(refreshId);
    reaper(true);
    refreshFilter();
    replayPlanes = {};
}

function replayDefaults(ts) {
    jQuery("#replayPlay").html("Pause");
    let playing = true;
    let speed = 30;
    if (usp.has("replaySpeed")) {
        speed = usp.getFloat("replaySpeed");
    }
    if (speed == 0) {
        speed = 30;
        playing = false;
    }
    if (usp.has("replayPaused")) {
        playing = false;
    }
    return {
        playing: playing,
        ts: ts,
        ival: 60 * 1000,
        speed: speed,
        dateText: zDateString(ts),
        hours: ts.getUTCHours(),
        minutes: ts.getUTCMinutes(),
    };
}

function replayClear() {
    clearTimeout(refreshId);
    reaper(true);
    refreshFilter();
    replayPlanes = {};

    if (window.location.search !== "") {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.pushState({}, document.title, cleanUrl);
    }

    window.isReplay = false;

    window.location.reload();
}

function replayGetChunk(ts) {
    let time = new Date(ts);
    let sDate = sDateString(time);
    let index = 2 * time.getUTCHours() + Math.floor(time.getUTCMinutes() / 30);
    let key = `${sDate} chunk ${index}`;
    let url = "globe_history/" + sDate + "/heatmap/" + index.toString().padStart(2, '0') + ".bin.ttf";
    return { date: sDate, index: index, key: key, url: url, };
}

function loadReplay(ts) {
    if (isNaN(ts.getTime())) {
        ts = new Date();
    }
    let lastAvailable = new Date();
    lastAvailable.setUTCMinutes(Math.floor(lastAvailable.getUTCMinutes() / 30) * 30);
    lastAvailable.setUTCSeconds(0);
    lastAvailable = lastAvailable.getTime() - 10 * 1000;
    if (ts.getTime() > lastAvailable) {
        ts = new Date(lastAvailable);
        ts.setUTCMinutes(Math.floor(ts.getUTCMinutes() / 30) * 30 + 1);
        ts.setUTCSeconds(0);
        console.log('not available, using this time: ' + ts);
        replayResetState();
    }

    replay.ts = ts;
    replaySetTimeHint();

    if (!g.replayCache) {
        g.replayCache = new ItemCache(onMobile ? 12 : 24);
    }

    let chunk = replayGetChunk(ts);

    let rKey = chunk.key;
    let data = g.replayCache.get(rKey);

    if (data) {
        initReplay(chunk, data);
    } else {
        if (rKey == replay.loadingKey) {
            // console.log('if (rKey == replay.loadingKey) {');
            // download already in progress, do nothing
            return;
        }
        if (replay.abortController) {
            replay.abortController.abort();
        }

        replay.loadingKey = rKey;

        jQuery('#replayLoading').text('Loading ...');

        replay.abortController = new AbortController();

        jQuery("#update_error").css('display','none');
        clearTimeout(replay.errorTimeout);

        const ff = () => {
            //console.log(`finally ${rKey}`);
            delete replay.loadingKey;
            jQuery('#replayLoading').text('');
        };

        const errorFunc = (error) => {
            ff();
            if (error.name == 'AbortError') {
                //console.log(`aborted: ${rKey}`);
                return;
            }
            jQuery("#update_error_detail").text(error.message + ' --> No data for this timestamp!');
            jQuery("#update_error").css('display','block');
            replay.errorTimeout = setTimeout(() => { jQuery("#update_error").css('display','none'); }, 5000);
        };

        fetch(chunk.url, { signal: replay.abortController.signal })
            .then(
                (response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error, status = ${response.status}`);
                    }
                    response.arrayBuffer()
                        .then((data) => {
                            delete replay.abortController;
                            g.replayCache.add(rKey, data);
                            initReplay(chunk, data);
                            //console.log(`loaded: ${rKey}`);
                            ff();
                        })
                        .catch(errorFunc)
                    ;
                },
                errorFunc
            )
            .catch( errorFunc )
        ;

    }
}
function initReplay(chunk, data) {
    if (data.byteLength % 16 != 0) {
        console.log("Invalid heatmap file (byteLength)");
        return;
    }

    replay.loadedKey = chunk.key;

    let points = new Int32Array(data);
    let pointsU = new Uint32Array(data);
    let pointsU8 = new Uint8Array(data);
    let found = 0;
    replay.slices = [];
    for (let i = 0; i < points.length; i += 4) {
        if (points[i] == 0xe7f7c9d) {
            found = 1;
            replay.slices.push(i);
        }
    }
    if (!found) {
        console.log("Invalid heatmap file (magic number)");
        replay.points = null;
        replay.pointsU = null;
        replay.pointsU8 = null;
        return;
    }
    replay.points = points;
    replay.pointsU = pointsU;
    replay.pointsU8 = pointsU8;

    refreshFilter();

    replay.ival = (replay.pointsU[replay.slices[0] + 3] & 65535) / 1000;
    replay.halfHour = (replay.ts.getUTCMinutes() >= 30) ? 1 : 0;
    let index = Math.round (((replay.ts.getUTCMinutes() % 30) * 60 + replay.ts.getUTCSeconds()) / replay.ival);
    //console.log("init with index" + replay.index);
    if (index > 0) {
        if (false && index > 1) {
            replay.index = 0
            replayStep("fast");
        }
        replay.index = index - 1;
        replayStep("fast");
    }
    replay.index = index;
    replayStep();
}

function setReplayTimeHint(date) {
    if (true || utcTimesHistoric) {
        jQuery("#replayDateHintLocal").html(TIMEZONE + " Date: " + lDateString(date));
        jQuery("#replayDateHint").html("" + zDateString(date));
        jQuery("#replayTimeHint").html("UTC:" + NBSP + zuluTime(date) + ' / ' + TIMEZONE + ":" + NBSP + localTime(date));
    } else {
        jQuery("#replayDateHintLocal").html("");
        jQuery("#replayDateHint").html("Date: " + lDateString(date));
        jQuery("#replayTimeHint").html("Time: " + localTime(date) + NBSP + TIMEZONE);
    }
}
function replayOnSliderMove() {
    clearTimeout(refreshId);

    let date = new Date(replay.dateText);
    date.setUTCHours(Number(replay.hours));
    date.setUTCMinutes(Number(replay.minutes));
    replay.seconds = 0;
    date.setUTCSeconds(Number(replay.seconds));

    setReplayTimeHint(date);
}
let replayJumpEnabled = true;
function replayJump() {
    if (!showingReplayBar)
        return;
    if (!replayJumpEnabled)
        return;
    let date = new Date(replay.dateText);
    date.setUTCHours(Number(replay.hours));
    date.setUTCMinutes(Number(replay.minutes));
    date.setUTCSeconds(Number(replay.seconds));

    let ts = new Date(replay.ts.getTime());

    // diff less 10 seconds
    if (Math.abs(date.getTime() - ts.getTime()) < 10000) {
        return;
    }
    //console.log(replay.minutes.toString() + ' ' + ts.toString() + ' ' + (date.getTime() - ts.getTime()).toString());

    //console.trace();
    console.log('jump: ' + date.toUTCString());

    replayResetState();
    loadReplay(date);
}
function replaySetTimeHint(arg) {
    replayJumpEnabled = false;
    let dateString;
    let timeString;

    dateString = zDateString(replay.ts);
    timeString = zuluTime(replay.ts) + NBSP + 'Z';

    setReplayTimeHint(replay.ts);

    if (replay.datepickerDate != dateString) {
        replay.datepickerDate = dateString;
        jQuery("#replayDatepicker").datepicker('setDate', dateString);
    }


    let hours = replay.ts.getUTCHours();
    jQuery('#hourSelect').slider("option", "value", hours);

    let minutes = replay.ts.getUTCMinutes();
    jQuery('#minuteSelect').slider("option", "value", minutes);
    replayJumpEnabled = true;
}

function replayStep(arg) {
    if (!replay || showTrace) {
        return;
    }
    if (replay.loadedKey != replayGetChunk(replay.ts).key) {
        console.error('no data loaded for current timestamp, can\'t play!');
        return;
    }

    if (replay.playing) {
        clearTimeout(refreshId);
        refreshId = setTimeout(replayStep, replay.ival / replay.speed * 1000);
    }

    if (isNaN(replay.ts.getTime())) {
        loadReplay(new Date());
        return;
    }
    let index = replay.index;
    if (index >= replay.slices.length) {
        console.log('next half hour');
        let date = new Date(replay.ts.getTime() + 30 * 60 * 1000);
        date.setUTCMinutes(Math.floor(date.getUTCMinutes() / 30) * 30);
        date.setUTCSeconds(0);
        clearTimeout(refreshId);
        loadReplay(date);
        return;
    }

    let minutes = replay.halfHour * 30 + Math.floor(replay.ival * index / 60);
    let seconds = (replay.ival * index) % 60;
    //console.log(minutes.toString() + ' ' + seconds.toString());
    replay.ts.setUTCMinutes(minutes)
    replay.ts.setUTCSeconds(seconds)

    replay.hours = replay.ts.getUTCHours();
    replay.minutes = minutes;
    replay.seconds = seconds;

    let points = replay.points;
    let pointsU = replay.pointsU;
    let i = replay.slices[index];

    //console.log('index: ' + index + ', i: ' + i);

    last = now;
    now = replay.pointsU[i + 2] / 1000 + replay.pointsU[i + 1] * 4294967.296;
    g.now = now;

    traceOpts.endStamp = now + replay.ival;

    replay.ival = (replay.pointsU[i + 3] & 65535) / 1000;

    if (arg != 'fast') {
        replaySetTimeHint();
        if (replay.addressMinutes != replay.minutes) {
            replay.addressMinutes = replay.minutes;
            updateAddressBar();
        }
        //console.log(replay.ts.toUTCString());
        if (now - lastReap > 60) {
            reaper();
        }
    }

    i += 4;

    let ext;
    if (g.zoomLvl > 10) {
        ext = currentExtent(1.6);
    } else if (g.zoomLvl > 8) {
        ext = currentExtent(1.2);
    } else {
        ext = currentExtent(1.1);
    }
    ext.maxLat *= 1e6;
    ext.maxLon *= 1e6;
    ext.minLat *= 1e6;
    ext.minLon *= 1e6;
    for (; i < points.length && points[i] != 0xe7f7c9d; i += 4) {
        let lat = points[i + 1];
        let lon = points[i + 2];
        let pos = [lon, lat];
        if (lat >= 1073741824) {
            let hex = (points[i] & ((1<<24) - 1)).toString(16).padStart(6, '0');
            hex = (points[i] & (1<<24)) ? ('~' + hex) : hex;
            let ac = {hex:hex, seen:0, seen_pos:0,};
            if (replay.pointsU8[4 * (i + 2)] != 0) {
                ac.flight = "";
                for (let j = 0; j < 8; j++) {
                    ac.flight += String.fromCharCode(replay.pointsU8[4 * (i + 2) + j]);
                }
            }
            ac.squawk = (lat & 0xFFFF).toString(10).padStart(4, '0');
            if (!g.planes[hex]) {
                replayPlanes[hex] = ac;
                continue;
            }
            processAircraft(ac, false, false);
            continue;
        }
        if (!inView(pos, ext)) {
            continue;
        }

        lat /= 1e6;
        lon /= 1e6;
        pos = [lon, lat];

        let type = (pointsU[i] >> 27) & 0x1F;
        switch (type) {
            case  0: type = 'adsb_icao';        break;
            case  1: type = 'adsb_icao_nt';     break;
            case  2: type = 'adsr_icao';        break;
            case  3: type = 'tisb_icao';        break;
            case  4: type = 'adsc';             break;
            case  5: type = 'mlat';             break;
            case  6: type = 'other';            break;
            case  7: type = 'mode_s';           break;
            case  8: type = 'adsb_other';       break;
            case  9: type = 'adsr_other';       break;
            case 10: type = 'tisb_trackfile';   break;
            case 11: type = 'tisb_other';       break;
            case 12: type = 'mode_ac';          break;
            default: type = 'unknown';
        }
        let hex = (pointsU[i] & 0xFFFFFF).toString(16).padStart(6, '0');
        hex = (pointsU[i] & 0x1000000) ? ('~' + hex) : hex;

        if (icaoFilter && !icaoFilter.includes(hex))
            continue;

        let alt = points[i + 3] & 65535;
        if (alt & 32768)
            alt |= -65536;
        if (alt == -123)
            alt = 'ground';
        else if (alt == -124)
            alt = null;
        else
            alt *= 25;

        let gs = points[i + 3] >> 16;
        if (gs == -1)
            gs = null;
        else
            gs /= 10;

        let ac = {
            seen: 0,
            seen_pos: 0,
        };

        if (!g.planes[hex]) {
            const cached = replayPlanes[hex];
            if (cached) {
                ac = cached;
                //delete replayPlanes[hex];
            }
        }

        ac.hex = hex;
        ac.lat = lat;
        ac.lon = lon;
        ac.alt_baro = alt;
        ac.gs = gs;
        ac.type = type;

        processAircraft(ac, false, false);
    }

    if (arg != "fast") {
        triggerRefresh = 1;
        checkMovement();
        checkRefresh();
    }
    replay.index = index + 1;
}

function updateIconCache() {
    let item;
    let tryAgain = [];
    while(item = addToIconCache.pop()) {
        let svgKey = item[0];
        let element = item[1];
        if (iconCache[svgKey] != undefined) {
            continue;
        }
        if (!element) {
            element = new Image();
            element.src = item[2];
            item[1] = element;
            tryAgain.push(item);
            continue;
        }
        if (!element.complete) {
            console.log("moep");
            tryAgain.push(item);
            continue;
        }

        iconCache[svgKey] = element;
    }
    addToIconCache = tryAgain;
}

function getInactive() {
    return (new Date().getTime() - lastActive) / 1000;
}

function active() {
    lastActive = new Date().getTime();
}

function drawTileBorder(data) {
    let southWest = ol.proj.fromLonLat([data.west, data.south]);
    let south180p = ol.proj.fromLonLat([180, data.south]);
    let south180m = ol.proj.fromLonLat([-180, data.south]);
    let southEast = ol.proj.fromLonLat([data.east, data.south]);
    let northEast = ol.proj.fromLonLat([data.east, data.north]);
    let north180p = ol.proj.fromLonLat([180, data.north]);
    let north180m = ol.proj.fromLonLat([-180, data.north]);
    let northWest = ol.proj.fromLonLat([data.west, data.north]);
    const estimateStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#303030',
            width: 1.5,
        })
    });
    if (data.west < data.east) {
        let tile = new ol.geom.LineString([southWest, southEast, northEast, northWest, southWest]);
        let tileFeature = new ol.Feature(tile);
        tileFeature.setStyle(estimateStyle);
        siteCircleFeatures.addFeature(tileFeature);
    } else {
        let west = new ol.geom.LineString([south180p, southWest, northWest, north180p]);
        let east = new ol.geom.LineString([south180m, southEast, northEast, north180m]);
        let westF = new ol.Feature(west);
        let eastF = new ol.Feature(east);
        westF.setStyle(estimateStyle);
        eastF.setStyle(estimateStyle);
        siteCircleFeatures.addFeature(westF);
        siteCircleFeatures.addFeature(eastF);
    }
}

function updateMessageRate(data) {
    if (data.messageRate && data.messageRate > 0) {
        MessageRate = data.messageRate;
    } else if (data.messages && data.messages > 1) {
        // Detect stats reset
        if (MessageCountHistory.length > 0 && MessageCountHistory[MessageCountHistory.length-1].messages > data.messages) {
            MessageCountHistory = [];
        }

        // Note the message count in the history
        MessageCountHistory.push({ 'time' : data.now, 'messages' : data.messages});

        if (MessageCountHistory.length > 1) {
            // .. and clean up any old values
            while ((now - MessageCountHistory[0].time) > 10.5) {
                MessageCountHistory.shift();
            }
            let message_time_delta = MessageCountHistory[MessageCountHistory.length-1].time - MessageCountHistory[0].time;
            let message_count_delta = MessageCountHistory[MessageCountHistory.length-1].messages - MessageCountHistory[0].messages;
            if (message_time_delta > 0) {
                MessageRate = message_count_delta / message_time_delta;
            }
            //console.log(message_time_delta);
        }

    } else if (uuid != null && data.messages == 1) {
        const cache = uuidCache[data.urlIndex] || { now: 0 };
        let time_delta = now - cache.now;
        if (time_delta > 0.5) {
            let newCache = uuidCache[data.urlIndex] = { now: now };
            let message_delta = 0;
            let acs = data.aircraft;
            for (let j=0; j < acs.length; j++) {
                const hex = acs[j].hex;
                const messages = acs[j].messages
                let cachedMessages = cache[hex];
                if (cachedMessages) {
                    message_delta += (messages - cachedMessages);
                }
                newCache[hex] = messages;
            }
            newCache.rate = message_delta / time_delta;
        }
        MessageRate = 0;
        for (let i in uuidCache) {
            const c = uuidCache[i];
            MessageRate += c ? c.rate : 0;
        }
    } else {
        MessageRate = null;
    }
}
function playReplay(state){
    if (!replay){
        return;
    }
    if (state) {
        if (replay.loadedKey != replayGetChunk(replay.ts).key) {
            console.error('no data loaded for current timestamp, can\'t play!');
            return;
        }
        replay.playing = true;
        jQuery("#replayPlay").html("Pause");
        replayStep();
    } else {
        replay.playing = false;
        jQuery("#replayPlay").html("Play");
        clearTimeout(refreshId);
    }
};

// Replay on / off (Replay button and the map menu). showReplayBar() itself
// flips the bar; only switching ON loads a replay - the old button loaded one
// on every press, so pressing it to close started a hidden replay again.
function toggleReplay() {
    if (showingReplayBar) {
        showReplayBar();
    } else {
        showReplayBar();
        loadReplay(new Date());
    }
}

// html.replayOpen + --REPLAY-H (the panel's height, kept current while open)
function setReplayPanelOpen(open) {
    const root = document.documentElement;
    const bar = document.getElementById('replayBar');
    root.classList.toggle('replayOpen', !!open);
    const measure = function () {
        if (!bar || !root.classList.contains('replayOpen')) return;
        root.style.setProperty('--REPLAY-H', Math.ceil(bar.getBoundingClientRect().height) + 'px');
        if (typeof updateViewBottom === 'function') updateViewBottom();
    };
    if (open && bar && !setReplayPanelOpen.observer && typeof ResizeObserver === 'function') {
        setReplayPanelOpen.observer = new ResizeObserver(measure);
        setReplayPanelOpen.observer.observe(bar);
    }
    if (open) measure();
    else if (typeof updateViewBottom === 'function') updateViewBottom();
}

function showReplayBar(){
    console.log('showReplayBar()');
    showingReplayBar = !showingReplayBar;
    if (!showingReplayBar){
        jQuery("#replayBar").hide();
        replay = null;
        resumeLiveFeeds();
        setReplayPanelOpen(false);
        jQuery("#selected_showTrace_hide").show();
    } else {
        // The panel sits over the foot of the map (which stays full size);
        // the bottom pill, credits and map controls move up above it.
        jQuery("#replayBar").show();
        setReplayPanelOpen(true);
        if (!replay) {
            replay = replayDefaults(new Date());
            replay.playing = false;
        }
        suspendLiveFeeds();
        //ts.setUTCMinutes((parseInt((ts.getUTCMinutes() + 7.5)/15) * 15) % 60);
        let datepickerOptions = {
            maxDate: '+1d',
            dateFormat: "yy-mm-dd",
            autoSize: true,
            onSelect: function(dateText) {
                replay.dateText = dateText;
                replayJump();
            },
        };
        if (onMobile) {
            datepickerOptions.onClose = function(dateText, inst){
                jQuery("replayDatepicker").attr("disabled", false);
            };
            datepickerOptions.beforeShow = function(input, inst){
                jQuery("replayDatepicker").attr("disabled", true);
            };
        } else {
            //
        }

        jQuery("#replayDatepicker").datepicker(datepickerOptions);

        jQuery('#hourSelect').slider({
            step: 1,
            min: 0,
            max: 23,
            slide: function(event, ui) {
                replay.hours = ui.value;
                replayOnSliderMove();
            },
            change: function() {
                replayJump();
            }
        });
        jQuery('#minuteSelect').slider({
            step: 1,
            min: 0,
            max: 59,
            slide: function(event, ui) {
                replay.minutes = ui.value;
                replayOnSliderMove();
            },
            change: function() {
                replayJump();
            }
        });
        const slideBase = 3.0;
        jQuery('#replaySpeedSelect').slider({
            value: Math.pow(replay.speed, 1 / slideBase),
            step: 0.07,
            min: Math.pow(1, 1 / slideBase),
            max: Math.pow(1000, 1 / slideBase),
            slide: function(event, ui) {
                replay.speed = Math.pow(ui.value, slideBase).toFixed(1);
                jQuery('#replaySpeedHint').text('Speed ' + replay.speed + '\u00d7');
            },
            change: function(event, ui) {
                replayStep();
            },
        });
        jQuery('#replaySpeedHint').text('Speed ' + replay.speed + '\u00d7');

        jQuery("#selected_showTrace_hide").hide();
    }
};

function timeoutFetch() {
    console.log("timeoutFetch " + localTime(new Date()));
    fetchData();
    if (timers.timeoutFetch) {
        clearTimeout(timers.checkMove);
    }
    timers.timeoutFetch = setTimeout(timeoutFetch, Math.max(RefreshInterval, 10000));
    if (now - lastReap > 120) {
        reaper();
    }
}

function refreshHistory() {
    if (heatmap || replay || globeIndex || pTracks || uuid || !HistoryChunks) {
        noLongerHidden();
        return;
    }

    if (1 && (new Date().getTime() - g.hideStamp) / 1000 < 5) {
        console.log('short tab change, not loading history');
        noLongerHidden();
        return;
    }

    jQuery("#loader_progress").attr('value', 0);

    setTimeout(() => {
        if (!timersActive) {
            jQuery("#loader").show();
        }
    }, 200);

    chunksDefer().done(function(data) {
        console.log(localTime(new Date()) + ' tab change, loading history');
        g.refreshHistory = true;
        HistoryChunks = true;
        chunkNames = [];
        jQuery("#loader_progress").attr('value', 1);
        try {
            for (let i = data.chunks.length-1; i >= 0; i--) {
                let f = data.chunks[i];
                chunkNames.push(f);

                // break after we found a chunk that's older than now
                // chunk timestamp is the start of its data, not the end
                // so we need to include the first chunk that's older
                // which is done above

                let parts = f.split(".")[0].split("_");
                if (parts[0] == "chunk") {
                    if (now > parts[1]/1e3) {
                        break;
                    }
                }
            }
            //console.log(chunkNames);
            nHistoryItems = chunkNames.length;
            get_history();
            push_history();
        } catch (e) {
            console.error(e);
            noLongerHidden();
        }
    }).fail(function() {
        setTimeout(refreshHistory, 500);
    });
}


function handleVisibilityChange() {
    const prevHidden = tabHidden;
    if (document[hideName])
        tabHidden = true;
    else
        tabHidden = false;

    if (tabHidden && timersActive) {
        g.hideStamp = new Date().getTime();
        clearIntervalTimers();
        if (!globeIndex) {
            //timeoutFetch();
        }

        replay_was_active = replay.playing;
        if (replay.playing) {
            playReplay(false);
        }
    }

    // tab is no longer hidden
    if (!tabHidden && !timersActive) {
        loadFinished && jQuery("#timers_paused").css('display','none');
        globeRateUpdate();
        if (heatmap || replay || globeIndex || pTracks) {
            noLongerHidden();
        } else {
            refreshHistory();
        }
    }
}

function noLongerHidden() {
    active();
    setIntervalTimers();

    jQuery("#loader").hide();

    refresh();

    if (replay_was_active) {
        playReplay(true);
    }

    if (showTrace)
        return;
    if (heatmap)
        return;

    if (!haveTraces)
        return;

    let count = 0;
    if (multiSelect && !SelectedAllPlanes) {
        for (let i = 0; i < g.planesOrdered.length; ++i) {
            let plane = g.planesOrdered[i];
            if (plane.selected) {
                getTrace(plane, plane.icao, {});
                if (count++ > 20)
                    break;
            }
        }
    } else if (SelectedPlane) {
        getTrace(SelectedPlane, SelectedPlane.icao, {});
    }
}

let hideName;
function initVisibilityChange() {
    // Set the name of the hidden property and the change event for visibility
    let visibilityChange;
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
        hideName = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hideName = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hideName = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }
    // Warn if the browser doesn't support addEventListener or the Page Visibility API
    if (typeof document.addEventListener === "undefined" || hideName === undefined) {
        console.log("hidden tab handler requires a browser that supports the Page Visibility API.");
    } else {
        // Handle page visibility change
        document.addEventListener(visibilityChange, handleVisibilityChange, false);
    }
    handleVisibilityChange();
}
// for debugging visibilitychange:
function testHide() {
    Object.defineProperty(window.document,'hidden',{get:function(){return true;},configurable:true});
    Object.defineProperty(window.document,'visibilityState',{get:function(){return 'hidden';},configurable:true});
    window.document.dispatchEvent(new Event('visibilitychange'));
}
function testUnhide() {
    Object.defineProperty(window.document,'hidden',{get:function(){return false;},configurable:true});
    Object.defineProperty(window.document,'visibilityState',{get:function(){return 'visible';},configurable:true});
    window.document.dispatchEvent(new Event('visibilitychange'));
}

function autoSelectClosest() {
    if (!loadFinished)
        return;
    let closest = null;
    let closestDistance = null;
    checkMovement();
    for (let key in g.planesOrdered) {
        const plane = g.planesOrdered[key];
        if (!plane.visible)
            continue;
        if (!closest)
            closest = plane;
        if (plane.position == null || plane.seen_pos > 20)
            continue;
        let refLoc = [CenterLon, CenterLat];
        if (autoselectCoords && autoselectCoords.length == 2) {
            refLoc = [ autoselectCoords[1], autoselectCoords[0] ];
        }
        const dist = ol.sphere.getDistance(refLoc, plane.position);
        if (dist == null || isNaN(dist))
            continue;
        if (closestDistance == null || dist < closestDistance) {
            closestDistance = dist;
            closest = plane;
        }
    }
    if (!closest)
        return;
    selectPlaneByHex(closest.icao, {noDeselect: true, follow: FollowSelected,});
}
function setAutoselect() {
    clearInterval(timers.autoselect);
    if (!autoselect)
        return;
    timers.autoselect = window.setInterval(autoSelectClosest, 5000);
    autoSelectClosest();
}
function registrationLink(plane) {
    if (plane.country === 'Brazil') {
        return `https://sistemas.anac.gov.br/aeronaves/cons_rab_resposta_en.asp?textMarca=${encodeURIComponent(plane.registration)}`;
    } else {
        return '';
    }
}


//simple jquery plugin to only update the text when it changes
jQuery.fn.updateText = function (text) {
    this.text() !== String(text) && this.text(text);
}

function zeroPad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

// Converts "hiccup"-style structures (https://github.com/weavejester/hiccup)
// to XML.
function hiccup(node) {
    if (Array.isArray(node)) {
        const [tag, attribs, ...children] = node;
        let attribStrings = [];
        for (const prop in attribs) {
            if (!attribs.hasOwnProperty(prop) || attribs[prop] === undefined) {
                continue;
            }
            attribStrings.push(`${prop}="${attribs[prop]}"`);
        }
        let xml = `<${tag} ${attribStrings.join(' ')}>`;
        for (const child of children) {
            xml += hiccup(child);
        }
        xml += `</${tag}>\n`;
        return xml;
    } else {
        return '' + node;
    }
}

// Prompts a browser to download a data: URL.
function download(name, contentType, data) {
    var link = document.createElement("a");
    link.download = name;
    link.href = 'data:' + contentType + ',' + encodeURIComponent(data);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function baseExportFilenameForAircrafts(aircrafts) {
    return aircrafts.map((a) => (a.registration || a.icao).toUpperCase()).join('-');
}

// Returns an array of {pos, alt, ts} for an aircraft.
function coordsForExport(plane) {
    let coords = [];
    let numSegs = plane.track_linesegs.length;
    let segs = plane.track_linesegs;
    let runningAverage = 0;
    let lastTimestamp = 0;
    let delta;
    //console.log(kmlStyle);
    if (kmlStyle == 'geom_avg') {
        //console.log('averaging');
        const avgWindow = 8;
        for (let i = 0; i < numSegs; i++) {
            const seg = segs[i];
            const geom = seg.alt_geom;
            const baro = seg.alt_real;
            let geomOffset = null;
            if (!seg.ground && baro != null && geom != null) {
                seg.geomOffset = geom - baro;
                delta = (seg.geomOffset - runningAverage);
                if (delta <= 50) {
                    runningAverage += delta * Math.min(1, (seg.ts - lastTimestamp) / avgWindow);
                } else {
                    runningAverage = seg.geomOffset;
                }
                seg.geomOffAverage = runningAverage;
                lastTimestamp = seg.ts;
            }
        }
        lastTimestamp = 1e12;
        for (let i = numSegs - 1; i >= 0; i--) {
            const seg = segs[i];
            const geom = seg.alt_geom;
            const baro = seg.alt_real;
            let geomOffset = null;
            if (seg.geomOffset != null) {
                delta = (seg.geomOffset - runningAverage);
                if (delta <= 50) {
                    runningAverage += delta * Math.min(1, (lastTimestamp - seg.ts) / avgWindow);
                } else {
                    runningAverage = seg.geomOffset;
                }
                //console.log(seg.geomOffAverage + ' ' + runningAverage);
                seg.geomOffAverage = (seg.geomOffAverage + runningAverage) / 2;
                lastTimestamp = seg.ts;
            }
        }
    }
    for (let i = 0; i < numSegs; i++) {
        const seg = segs[i];
        const pos = seg.position;
        if (pos) {
            let alt = null;
            const baro = seg.alt_real;
            const geom = seg.alt_geom;
            const geomOffAverage = seg.geomOffAverage;
            let using_baro = false;
            if (kmlStyle == 'geom_avg' && geomOffAverage != null) {
                const betterGeom = baro + geomOffAverage;
                alt = Math.round(betterGeom * 0.3048); // convert ft to m
            } else if (kmlStyle != 'baro' && geom != null) {
                alt = Math.round(geom * 0.3048); // convert ft to m
            } else if (kmlStyle == 'baro' && baro != null && baro != 'ground') {
                alt = Math.round(baro * 0.3048);
                using_baro = true;
            }
            if (seg.ground) {
                alt = "ground";
            } else if (alt != null && egmLoaded && !using_baro) {
                // alt is in meters at this point
                alt = Math.round(egm96.ellipsoidToEgm96(pos[1], pos[0], alt));
            }

            const ts = new Date(seg.ts * 1000.0);
            if (alt == null) {
                console.log(`Skipping, no altitude: ${i} ${pos} ${ts}`);
                continue;
            }
            //console.log(`exporting coord: ${i} ${pos} ${alt} ${ts}`);
            coords.push({ pos: pos, alt: alt, ts: ts});
        } else {
            console.log(`Skipping ${i}`);
        }
    }
    return coords;
}

// We use this to give each aircraft a different color track in a
// multi-select export scenario. From colorbrewer, but I moved the red
// to be first.
const EXPORT_RGB_COLORS = [
    'e31a1c',
    'a6cee3',
    '1f78b4',
    'b2df8a',
    '33a02c',
    'fb9a99',
    'fdbf6f',
    'ff7f00',
    'cab2d6',
    '6a3d9a',
    'ffff99',
    'b15928'
];

// Converts "rrggbb" colors to KML format, "aabbggrr".
let RGBColorToKMLColor = function(c) {
    return 'ff' + c.substring(4, 6) + c.substring(2, 4) + c.substring(0, 2);
}

// Returns an array of selected planes, ordered by registration-or-ICAO.
function selectedPlanes() {
    const planes = [];
    for (let key in SelPlanes) {
        let plane = SelPlanes[key];
        if (plane.selected) {
            planes.push(plane);
        }
    }
    planes.sort((a, b) => {
        const keyA = (a.registration || a.icao).toUpperCase();
        const keyB = (b.registration || b.icao).toUpperCase();
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    });
    return planes;
}

// Exports currently selected aircraft as KML.

let egmScript = null;
let egmLoaded = false;
function loadEGM() {
    if (egmScript) {
        return null;
    }
    egmScript = document.createElement('script');
    egmScript.src = "libs/egm96-universal-1.1.0.min.js";
    egmScript.addEventListener('load', function() {
        egmLoaded = true;
    });
    document.body.appendChild(egmScript);
    return egmScript;
}
function adjust_geom_alt(alt, pos) {
    if (geomUseEGM && egmLoaded) {
        if (alt == null) {
            return alt;
        }
        return egm96.ellipsoidToEgm96(pos[1], pos[0], alt * 0.3048) / 0.3048;
    } else {
        return alt;
    }
}
let kmlStyle = '';
function exportKML(altStyle) {
    if (altStyle) {
        kmlStyle = altStyle;
    }
    if (!egmLoaded) {
        let egm = loadEGM();
        if (egm) {
            egm.addEventListener('load', function() {
                exportKML();
            });
        }
        return;
    }

    const planes = selectedPlanes();
    const folders = [];
    for (let planeIndex = 0; planeIndex < planes.length; planeIndex++) {
        const plane = planes[planeIndex];
        let folder = ["Folder", {},
            ["name", {}, `${(plane.registration || plane.icao).toUpperCase()} track`]
        ];
        const coords = coordsForExport(plane);
        let sections = [];
        let currentSection = null;
        let lastGround = null;
        let lastC = null;
        for (let i in coords) {
            const c = coords[i];
            const ground = (c.alt == "ground");
            if (ground !== lastGround) {
                // when changing between airborne and ground, create new section
                if (lastC && currentSection) {
                    // double up last coordinate to work around strange google earth transparency
                    currentSection.coords.push(lastC);
                }
                currentSection = { ground: ground, coords: [] };
                sections.push(currentSection);
            }
            lastGround = ground;
            if (ground) {
                c.alt = 0; // set KML altitude to zero
            }
            currentSection.coords.push(c);
            lastC = c;
        }
        if (lastC && currentSection) {
            // double up last coordinate to work around strange google earth transparency
            currentSection.coords.push(lastC);
        }
        for (let i in sections) {
            console.log("section " + i);
            const s = sections[i];
            const coords = s.coords;
            const ground = s.ground;
            const whenObjs = coords.map((c) => {
                const date = `${c.ts.getUTCFullYear()}-${zeroPad(c.ts.getUTCMonth() + 1, 2)}-${zeroPad(c.ts.getUTCDate(), 2)}`;
                const time = `T${zeroPad(c.ts.getUTCHours(), 2)}:${zeroPad(c.ts.getUTCMinutes(), 2)}:${zeroPad(c.ts.getUTCSeconds(), 2)}.${zeroPad(c.ts.getUTCMilliseconds(), 3)}Z`;
                return ["when", {}, date + time];
            });
            const coordObjs = coords.map((c) => {
                return ["gx:coord", {}, `${c.pos[0]} ${c.pos[1]} ${c.alt}`];
            });
            // splice together the xml track with / without altitude mode
            // clamptoground is google earth default while other programs error on having that option set specifically
            // so let google earth default to clamp to ground for ground track
            let xmlTrack = ["gx:Track", {}];
            if (!ground) {
                xmlTrack.push(["altitudeMode", {}, "absolute"]);
            }
            xmlTrack = xmlTrack.concat([
                ["extrude", {}, ground ? "0" : "1"],
                ...whenObjs,
                ...coordObjs
            ]);
            folder.push(
                ["Placemark", {},
                    ["name", {}, (plane.registration || plane.icao).toUpperCase()],
                    ["Style", {},
                        ["LineStyle", {},
                            ["color", {}, RGBColorToKMLColor(EXPORT_RGB_COLORS[planeIndex % EXPORT_RGB_COLORS.length])],
                            ["width", {}, 4]
                        ],
                        ["IconStyle", {},
                            ["Icon", {},
                                ["href", {}, "http://maps.google.com/mapfiles/kml/shapes/airports.png"]
                            ]
                        ]
                    ],
                    xmlTrack
                ]
            );
        }
        folders.push(folder);
    }
    const filename = baseExportFilenameForAircrafts(planes);
    const prologue = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const xmlObj = ["kml", {
        "xmlns": "http://www.opengis.net/kml/2.2",
        "xmlns:gx": "http://www.google.com/kml/ext/2.2"
    },
        ["Folder", {},
            ...folders
        ]
    ];
    const xml = prologue + hiccup(xmlObj);
    let styleName = '';
    if (kmlStyle == 'geom') { styleName = 'EGM96'; };
    if (kmlStyle == 'geom_avg') { styleName = 'EGM96_avg'; };
    if (kmlStyle == 'baro') { styleName = 'press_alt_uncorrected'; };
    //console.log(kmlStyle + ' ' + styleName);
    download(
        filename + '-track-' + styleName + '.kml',
        'application/vnd.google-earth.kml+xml',
        xml);
}

function deleteTraces() {
    for (let i in g.planesOrdered) {
        let plane = g.planesOrdered[i];
        delete plane.recentTrace;
        delete plane.fullTrace;
    }
}

function setPictureVisibility() {
    showPictures = planespottersAPI || planespottingAPI;
    if (showPictures) {
        jQuery('#photo_container').removeClass('hidden');
    } else {
        jQuery('#photo_container').addClass('hidden');
    }
    if (planespottersLinks && !showPictures) {
        jQuery('#photoLinkRow').removeClass('hidden');
    } else {
        jQuery('#photoLinkRow').addClass('hidden');
    }
}

// just an idea, unused
let infoBits = {
    type: {
        head: 'Type:',
        title: '4 character ICAO type code (i.e.: A320,B738,G550)',
        value: function(plane) { return plane.icaoType || 'n/a'; },
    },
};

function geoFindEnabled() {
    return (!disableGeoLocation && !SiteOverride && (globeIndex || uuid || askLocation) && (window && window.location && window.location.protocol == 'https:'));
}

function _printTrace(trace) {
    for (let i = 0; i < trace.length; i++) {
        const state = trace[i];
        const timestamp = state[0];
        let stale = state[6] & 1;
        const leg_marker = state[6] & 2;
        console.log(zuluTime(new Date(timestamp * 1000)) + ' ' + (state[1] + ',' + state[2]).padStart(26, ' ')  + ' ' + String(state[3]).padStart(6, ' ') + ' ' + state[6]);
    }
}

function printTrace() {
    console.log('full trace');
    _printTrace(SelectedPlane.fullTrace.trace);
    console.log('recent trace');
    _printTrace(SelectedPlane.recentTrace.trace);
}

function copyShareLink() {
    navigator.clipboard.writeText(shareLink);

    copyLinkTime = new Date().getTime();
    copiedIcao = SelectedPlane.icao;
    setSelectedIcao();
}

let copyLinkTime = 0;
let copiedIcao = null;

function setSelectedIcao() {
    const selected = SelectedPlane;
    if (selected.icao == selIcao && copiedIcao == null) {
        return;
    }
    selIcao = selected.icao;
    let hex_html = "<span style='font-family: monospace;' class=identSmall>Hex:" + NBSP + selected.icao.toUpperCase() + "</span>";
    if (globeIndex || shareBaseUrl) {
        if (copiedIcao && (copiedIcao != selected.icao || new Date().getTime() - copyLinkTime > 2000)) {
            copiedIcao = null;
        }
        let copy_link_text = (copiedIcao != null) ? "Copied" : ("Copy" + NBSP + "Link");
        let icao_link = "<span  class=identSmall><a class='link identSmall' target=\"_blank\" href=\"" + shareLink +
            "\" onclick=\"copyShareLink(); return false;\">" + copy_link_text + "</a></span>";
        hex_html = hex_html + NBSP + NBSP + NBSP + icao_link;
    }
    jQuery('#selected_icao').html(hex_html);

    jQuery('a.identSmall').prop('href',shareLink);
}

function mapTypeSettings() {
    if (MapType_tar1090.startsWith('maptiler_sat') || MapType_tar1090.startsWith('maptiler_hybrid')) {
        layerDimFactor = 0.25;
    } else if (MapType_tar1090 == 'esri') {
        layerDimFactor = 0.5;
    } else if (MapType_tar1090 == 'gibs') {
        layerDimFactor = 0.5;
    } else if (MapType_tar1090.startsWith('carto_raster')) {
        layerDimFactor = 0.70;
        layerExtraContrast = 0.6;
    } else if (MapType_tar1090.startsWith('carto_light')) {
        layerDimFactor = 0.80;
        layerExtraContrast = 0.2;
    } else if (MapType_tar1090.startsWith('carto_dark')) {
        layerDimFactor = 0.25;
        layerExtraContrast = 0.05;
    } else {
        layerDimFactor = 1;
        layerExtraContrast = 0;
    }
}

function getViewOversize(factor) {
    factor || (factor = 1);
    let mapSize = OLMap.getSize();
    let size = [mapSize[0] * factor, mapSize[1] * factor];
    return myExtent(viewportExtent(size));
}

// Extent of the WHOLE map viewport for a pixel size, regardless of view padding.
// The mobile bottom sheet sets bottom padding on the view so that centring and
// Follow use the uncovered area; with padding set, view.calculateExtent(size)
// would be built around the padded centre and come out shifted. getState()
// returns the true viewport centre (padding and rotation applied).
function viewportExtent(size) {
    const view = OLMap.getView();
    const pad = view.padding;
    if (!pad || !(pad[0] || pad[1] || pad[2] || pad[3]) || typeof view.getState !== 'function') {
        return view.calculateExtent(size);
    }
    size = size || OLMap.getSize();
    const center = view.getState().center;
    const resolution = view.getResolution();
    const rotation = view.getRotation();
    const dx = (resolution * size[0]) / 2;
    const dy = (resolution * size[1]) / 2;
    const cos = Math.cos(rotation), sin = Math.sin(rotation);
    const xCos = dx * cos, xSin = dx * sin, yCos = dy * cos, ySin = dy * sin;
    const xs = [center[0] - xCos + ySin, center[0] - xCos - ySin, center[0] + xCos - ySin, center[0] + xCos + ySin];
    const ys = [center[1] - xSin - yCos, center[1] - xSin + yCos, center[1] + xSin + yCos, center[1] + xSin - yCos];
    return [Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys)];
}

function getRenderExtent(extra) {
    extra || (extra = 0);
    const mapSize = OLMap.getSize();
    const over = renderBuffer + extra;
    const size = [mapSize[0] + over, mapSize[1] + over];
    return myExtent(viewportExtent(size));
}

function requestBoxString() {
    if (!mapIsVisible && lastRequestBox) {
        return lastRequestBox;
    }
    let extent = getRenderExtent(80);
    let minLon = extent.minLon.toFixed(6);
    let maxLon = extent.maxLon.toFixed(6);
    if (Math.abs(extent.extent[2] - extent.extent[0]) > 40075016) { // all longtitudes in view
        minLon = -180, maxLon = 180;
    }
    return `${extent.minLat.toFixed(6)},${extent.maxLat.toFixed(6)},${minLon},${maxLon}`;
}

if (aggregator && window.location.hostname.startsWith('inaccurate')) {
    jQuery('#inaccurate_warning').removeClass('hidden');
    document.getElementById('inaccurate_warning').innerHTML = `
<br>
This map includes inaccurate / very approximate positions, errors of 200 nmi or more are not unusual.
<br>
If no ADS-B / MLAT info is available but at least 1 receiver is receiving ModeS data from a hex, the aircraft is placed where the receiving station on average receives planes which do have a location.
<br>
Please add a disclaimer to any screenshots of this website or better yet just report that an aircraft was spotted in the approximate area WITHOUT using screenshots.
<br>
<br>
        `;

}

function getn(n) {
    limitUpdates=n; RefreshInterval=0; fetchCalls=0;
}

function onAltimeterSetStandard(e) {
    e.preventDefault();
    jQuery("#altimeter_input").val(1013.25);
    onAltimeterChange(e);
}
function onAltimeterSetSelected(e) {
    e.preventDefault();
    if (!SelectedPlane || !SelectedPlane.nav_qnh) {
        return;
    }
    jQuery("#altimeter_input").val(SelectedPlane.nav_qnh);
    onAltimeterChange(e);
}
function onAltimeterChange(e) {
    e.preventDefault();
    jQuery("#altimeter_input").blur();
    let altimeter = parseFloat(jQuery("#altimeter_input").val().trim());

    if (altimeter < 100) {
        // assume inHg, convert to mbar
        baroCorrectQNH = 33.8639 * altimeter;
    } else {
        // assume mbar / hPa
        baroCorrectQNH = altimeter;
    }

    remakeTrails();
    refreshSelected();
    refreshFeatures();
    TAR.planeMan.redraw();
    refresh();
}

// Using formula from: https://www.weather.gov/media/epz/wxcalc/pressureAltitude.pdf
// See also: https://en.wikipedia.org/wiki/Pressure_altitude
// Inverse equation on wikipedia seems imprecise,
// used the the weather.gov pdf and inverted the equation myself
// This uses ISA atmosphere (should be the same as altimeters in planes)
function adjust_baro_alt(alt) {
    if (!baroUseQNH || alt == null || alt == "ground") {
        return alt;
    }
    let station_pressure = Math.pow(1 - alt / 145366.45, 5.2553026) * 1013.25;

    let res = ( 1 - Math.pow(station_pressure / baroCorrectQNH, 0.190284) ) * 145366.45;
    return res;
}

function globeRateUpdate() {
    if (aggregator) {
        dynGlobeRate = true;
        if (0) {
            const cookieExp = getCookie('asdf_id').split('_')[0];
            const ts = new Date().getTime();
            if (!cookieExp || cookieExp < ts + 3600*1000)
                setCookie('adsbx_sid', ((ts + 2*86400*1000) + '_' + Math.random().toString(36).substring(2, 15)), 2);
        }
    }
    if (dynGlobeRate) {
        return jQuery.ajax({url:'/globeRates.json', cache: false, dataType: 'json', }).done(function(data) {
            if (data.simload != null)
                globeSimLoad = data.simload;
            if (data.refresh != null && globeIndex)
                RefreshInterval = data.refresh;
        });
    } else {
        return jQuery.Deferred().resolve();
    }
}
globeRateUpdate();



// ---- "Install the app" prompt ----------------------------------------------
// Offers the home-screen web app (manifest.webmanifest) once per browser
// session, on the map only:
//  - never inside an iframe (the mlat.uk website embeds the map) or an embed
//    URL (hideButtons / hideSideBar), and never when already running as the
//    installed app;
//  - Android / desktop Chrome & Edge: shown only when the browser says the app
//    is installable (beforeinstallprompt); "Install" opens the browser's own
//    install dialog, as Google's install-UI guidance recommends;
//  - iPhone / iPad: Apple has no install API, so it shows the two steps
//    (Share, then Add to Home Screen) - unobtrusive and easy to dismiss, per
//    Apple's guidance not to interrupt;
//  - "Not now" / close / Esc hides it for the rest of the session
//    (sessionStorage), so it is not repeated on every page load.
(function installPrompt() {
    const KEY = 'mlatInstallPromptDismissed';
    let deferred = null;      // beforeinstallprompt event (Android / Chromium)
    let ready = false;        // page settled; OK to show
    let shown = false;

    function isStandalone() {
        try {
            if (window.navigator.standalone === true) return true;   // iOS home-screen app
            return ['standalone', 'fullscreen', 'minimal-ui'].some(m =>
                window.matchMedia && window.matchMedia('(display-mode: ' + m + ')').matches);
        } catch (e) { return false; }
    }
    function isEmbedded() {
        try { if (window.self !== window.top) return true; } catch (e) { return true; }
        const q = new URLSearchParams(window.location.search);
        return q.has('hideButtons') || q.has('hideSideBar') || q.has('kiosk');
    }
    function dismissedThisSession() {
        try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; }
    }
    function rememberDismissed() {
        try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* private mode: just hide */ }
    }
    function isIOS() {
        const ua = navigator.userAgent || '';
        // iPadOS reports itself as a Mac; touch support gives it away
        return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    }
    function eligible() {
        return !shown && !isStandalone() && !isEmbedded() && !dismissedThisSession();
    }

    const SHARE_ICON = '<svg class="installShareIcon" viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">' +
        '<path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M8.5 10.5H6.5a1.5 1.5 0 0 0-1.5 1.5v7.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V12a1.5 1.5 0 0 0-1.5-1.5h-2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';

    function hide(remember) {
        const el = document.getElementById('installPrompt');
        if (remember) rememberDismissed();
        if (!el) return;
        el.classList.remove('installPromptIn');
        setTimeout(() => el.remove(), 220);
        document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') hide(true); }

    function show(kind) {
        if (!eligible()) return;
        shown = true;
        const el = document.createElement('div');
        el.id = 'installPrompt';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-modal', 'false');
        el.setAttribute('aria-labelledby', 'installPromptTitle');
        const body = kind === 'ios'
            ? '<p class="installText">Add it to your Home Screen: tap ' + SHARE_ICON +
              ' <b>Share</b>, then <b>Add to Home Screen</b>.</p>'
            : '<p class="installText">Install the app for full-screen tracking and quick access from your home screen.</p>';
        const actions = kind === 'ios'
            ? '<button type="button" class="installBtn installBtnPrimary" data-act="later">Got it</button>'
            : '<button type="button" class="installBtn" data-act="later">Not now</button>' +
              '<button type="button" class="installBtn installBtnPrimary" data-act="install">Install</button>';
        el.innerHTML =
            '<div class="installHead">' +
              '<img class="installIcon" src="images/app-icon-180.png" alt="" width="44" height="44">' +
              '<div class="installTitles"><div id="installPromptTitle" class="installTitle">mlat.uk</div>' +
              '<div class="installSub">Air, sea &amp; space tracking</div></div>' +
              '<button type="button" class="installClose" data-act="later" aria-label="Close">&times;</button>' +
            '</div>' + body +
            '<div class="installActions">' + actions + '</div>';
        el.addEventListener('click', function (e) {
            const btn = e.target.closest('[data-act]');
            if (!btn) return;
            if (btn.dataset.act === 'install' && deferred) {
                const ev = deferred;
                deferred = null;
                hide(false);
                ev.prompt();
                Promise.resolve(ev.userChoice).then(function (choice) {
                    // declined in the browser's own dialog: don't ask again this session
                    if (!choice || choice.outcome !== 'accepted') rememberDismissed();
                }).catch(function () {});
            } else {
                hide(true);
            }
        });
        document.body.appendChild(el);
        document.addEventListener('keydown', onKey);
        requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('installPromptIn')));
    }

    function maybeShow() {
        if (!ready || !eligible()) return;
        if (isIOS()) show('ios');
        else if (deferred) show('android');
    }

    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();          // use our prompt instead of the browser's mini-bar
        deferred = e;
        maybeShow();
    });
    window.addEventListener('appinstalled', function () {
        deferred = null;
        hide(true);
    });
    function settle() {
        // let the map draw first, so the prompt doesn't land on a blank page
        setTimeout(function () { ready = true; maybeShow(); }, 2000);
    }
    if (document.readyState === 'complete') settle();
    else window.addEventListener('load', settle);
})();


parseURLIcaos();
initialize();
// ===== App shell ===============================================================
// Top bar (menu, search, logo), the bottom pill, the main menu with its Layers
// page, and Settings / About as full-screen sheets. The menu rows and pill
// buttons drive tar1090's own functions and (hidden) buttons, so keyboard
// shortcuts and on/off states come from one place and can't drift apart.

// html.phoneUI: narrow screens, and phones held in landscape.
(function initPhoneUI() {
    const coarse = window.matchMedia ? window.matchMedia('(pointer: coarse)') : null;
    const update = function () {
        const phone = window.innerWidth <= 800 || (!!(coarse && coarse.matches) && window.innerHeight <= 500);
        document.documentElement.classList.toggle('phoneUI', phone);
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
})();

// Dynamic Type: Safari exposes the iOS Text Size setting through the
// -apple-system-body font. Its size against the default 17pt becomes --DT,
// which the menu, search and sheet text scale by (clamped so the map's
// chrome still fits on screen at the largest accessibility sizes).
(function initDynamicType() {
    if (!window.CSS || !CSS.supports || !CSS.supports('font', '-apple-system-body')) return;
    const probe = document.createElement('span');
    probe.setAttribute('style', 'font: -apple-system-body; position: absolute; visibility: hidden; pointer-events: none;');
    probe.textContent = 'x';
    const measure = function () {
        document.body.appendChild(probe);
        const px = parseFloat(getComputedStyle(probe).fontSize) || 17;
        probe.remove();
        const ratio = Math.min(1.6, Math.max(0.85, px / 17));
        document.documentElement.style.setProperty('--DT', ratio.toFixed(3));
    };
    measure();
    // the setting can change while the app is in the background
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') measure();
    });
})();

// Main menu: left-aligned, opened from the top bar. Rows click the original
// tar1090 buttons (kept in the page, hidden). "Map layers" opens a second
// page holding the layer switcher, with a back button.
(function initAppMenu() {
    const ITEMS = [
        { target: 'T', label: 'Show all tracks', toggle: true, key: 'T' },
        '-',
        { target: 'L', label: 'Labels', toggle: true, key: 'L' },
        { target: 'O', label: 'Extended labels', toggle: true, key: 'O' },
        { target: 'K', label: 'Track labels', toggle: true, key: 'K' },
        { target: 'M', label: 'Multi-select', toggle: true, key: 'M' },
        { target: 'P', label: 'Persistence', toggle: true, key: 'P' },
        { target: 'I', label: 'Isolate selected', toggle: true, key: 'I' },
        { target: 'F', label: 'Follow selected', toggle: true, key: 'F' },
        { target: 'R', label: 'Follow a random aircraft', key: 'R' },
        { target: 'RP', label: 'Replay', toggle: true, closeOnClick: true,
          isOn: () => !!showingReplayBar },
        { target: 'fullscreenButton', label: 'Full screen',
          available: () => !!(document.documentElement.requestFullscreen) },
        { target: 'AB', label: 'About' },
        { href: 'https://www.mlat.uk/contribute', label: 'Contribute' },
        '-',
        { page: 'layers', label: 'Map layers' },
        { target: 'settingsCog', label: 'Settings' },
    ];

    const button = document.getElementById('menuButton');
    const menu = document.getElementById('mapMenu');
    const pageMain = document.getElementById('menuPageMain');
    const pageLayers = document.getElementById('menuPageLayers');
    const layersHost = document.getElementById('menuLayersHost');
    const backBtn = document.getElementById('menuLayersBack');
    if (!button || !menu || !pageMain) return;

    const rows = [];
    const byId = id => document.getElementById(id);

    ITEMS.forEach(function (item) {
        if (item === '-') {
            const d = document.createElement('div');
            d.className = 'mapMenuDivider';
            d.setAttribute('role', 'separator');
            pageMain.appendChild(d);
            return;
        }
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'mapMenuItem';
        row.setAttribute('role', item.toggle ? 'menuitemcheckbox' : 'menuitem');
        row.tabIndex = -1;
        let html = '<span class="mapMenuLabel"></span>';
        if (item.key) html += '<span class="mapMenuKey"></span>';
        if (item.toggle) html += '<span class="mapMenuSwitch" aria-hidden="true"></span>';
        if (item.href) {
            // opens in a new tab: an arrow-out-of-box icon, as iOS uses
            html += '<svg class="mapMenuChevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
        }
        if (item.page) {
            row.setAttribute('aria-haspopup', 'menu');
            html += '<svg class="mapMenuChevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
        }
        row.innerHTML = html;
        row.querySelector('.mapMenuLabel').textContent = item.label;
        if (item.key) row.querySelector('.mapMenuKey').textContent = item.key;
        row.addEventListener('click', function () {
            if (item.page) { showPage('layers'); return; }
            if (item.href) {
                close(false);
                window.open(item.href, '_blank', 'noopener');
                return;
            }
            const target = byId(item.target);
            if (!target) return;
            // switches keep the menu open so several can be changed in one
            // go; actions (open a sheet, follow, replay...) close it first
            const closes = !item.toggle || item.closeOnClick;
            if (closes) close(false);
            target.click();
            if (!closes) sync();
        });
        pageMain.appendChild(row);
        rows.push({ item: item, row: row });
    });

    // rows follow the real buttons: on/off state, and items the page hides
    function sync() {
        for (const r of rows) {
            if (r.item.page || r.item.href) continue;
            const target = byId(r.item.target);
            const hidden = !target || target.style.display === 'none'
                || (r.item.available && !r.item.available());
            r.row.hidden = hidden;
            if (hidden || !r.item.toggle) continue;
            const on = r.item.isOn ? r.item.isOn(target) : target.classList.contains('activeButton');
            r.row.setAttribute('aria-checked', on ? 'true' : 'false');
        }
    }

    // The layer switcher control (created with the map) moves into the menu
    // the first time its page opens; its own button is hidden (style.css).
    function layerSwitcher() {
        if (!OLMap || !ol.control.LayerSwitcher) return null;
        return OLMap.getControls().getArray().find(c => c instanceof ol.control.LayerSwitcher) || null;
    }
    function mountLayers() {
        const ctrl = layerSwitcher();
        const el = ctrl ? ctrl.element : document.querySelector('.layer-switcher');
        if (!el) return;
        if (el.parentNode !== layersHost) layersHost.appendChild(el);
        try {
            if (ctrl && typeof ctrl.renderPanel === 'function') ctrl.renderPanel();
            else if (ctrl && typeof ctrl.showPanel === 'function') ctrl.showPanel();
        } catch (e) {
            console.error('layer switcher render failed', e);
        }
    }

    function focusables(page) {
        return Array.from(page.querySelectorAll('button, input, [tabindex]'))
            .filter(n => !n.hidden && n.offsetParent !== null);
    }
    function showPage(name, back) {
        const toLayers = name === 'layers';
        if (toLayers) mountLayers();
        pageMain.hidden = toLayers;
        pageLayers.hidden = !toLayers;
        const page = toLayers ? pageLayers : pageMain;
        page.classList.toggle('back', !!back);
        page.style.animation = 'none';
        void page.offsetWidth;          // restart the slide-in
        page.style.animation = '';
        menu.scrollTop = 0;
        const first = toLayers ? backBtn : focusables(pageMain)[0];
        if (first) first.focus({ preventScroll: true });
    }

    function open() {
        if (typeof closeSearch === 'function') closeSearch();
        sync();
        menu.hidden = false;
        pageMain.hidden = false;
        pageLayers.hidden = true;
        button.setAttribute('aria-expanded', 'true');
        const first = focusables(pageMain)[0];
        if (first) first.focus({ preventScroll: true });
    }
    function close(refocus) {
        if (menu.hidden) return;
        menu.hidden = true;
        button.setAttribute('aria-expanded', 'false');
        if (refocus) button.focus({ preventScroll: true });
    }
    window.closeAppMenu = close;

    button.addEventListener('click', function (e) {
        e.stopPropagation();
        if (menu.hidden) open(); else close(false);
    });
    if (backBtn) backBtn.addEventListener('click', function () { showPage('main', true); });

    // close on a tap / click anywhere else
    document.addEventListener('pointerdown', function (e) {
        if (!menu.hidden && !menu.contains(e.target) && !button.contains(e.target)) close(false);
    }, true);

    // keyboard: arrows move, Escape goes back a page or closes; menu keys
    // never reach the map's own shortcuts
    menu.addEventListener('keydown', function (e) {
        const page = pageLayers.hidden ? pageMain : pageLayers;
        const list = focusables(page);
        const i = list.indexOf(document.activeElement);
        if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && list.length) {
            e.preventDefault();
            const n = list.length;
            list[e.key === 'ArrowDown' ? (i + 1) % n : (i - 1 + n) % n].focus();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            if (!pageLayers.hidden) showPage('main', true);
            else close(true);
        } else if (e.key === 'ArrowLeft' && !pageLayers.hidden) {
            showPage('main', true);
        } else if (e.key === 'Tab') {
            close(false);
        }
        e.stopPropagation();
    });
})();

// Object list tab, top right of the map: "<" opens the list, ">" closes it.
// Drives tar1090's own sidebar toggle, so the choice is remembered as before.
(function initListTab() {
    const tab = document.getElementById('listTab');
    const orig = document.getElementById('toggle_sidebar_button');
    if (!tab || !orig) return;
    const isOpen = function () {
        const t = toggles['sidebar_visible'];
        return t ? !!t.state : orig.classList.contains('hide_sidebar');
    };
    const sync = function () {
        const open = isOpen();
        tab.classList.toggle('open', open);
        tab.setAttribute('aria-expanded', open ? 'true' : 'false');
        tab.setAttribute('aria-label', open ? 'Hide object list' : 'Show object list');
        tab.title = open ? 'Hide object list' : 'Show object list';
        tab.querySelector('path').setAttribute('d', open ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7');
    };
    tab.addEventListener('click', function () {
        const t = toggles['sidebar_visible'];
        if (t) t.toggle(); else orig.click();
        sync();
    });
    if (window.MutationObserver) {
        new MutationObserver(sync).observe(orig, { attributes: true, attributeFilter: ['class'] });
    }
    if (typeof hideButtons !== 'undefined' && hideButtons) tab.style.display = 'none';
    sync();
})();

// Settings and About: full-screen sheets with a title bar and a round exit
// button. Settings also rests at half height (drag the grabber, or tap it),
// with the map still visible above; dragging down from half closes it.
(function initAppSheets() {
    const sheets = [
        { id: 'settings_infoblock', close: 'settings_close', title: 'Settings', half: true },
        { id: 'about_infoblock', close: 'about_close', title: 'About mlat.uk', half: false },
    ];
    const closeSheet = function (def) {
        const el = document.getElementById(def.id);
        el.classList.remove('sheetHalf');
        const btn = document.getElementById(def.close);
        if (btn) btn.click();
    };
    const isShown = el => !!el && el.style.display !== 'none' && el.style.display !== '';
    // dimmed map behind an open sheet; a tap on it closes the sheet on top
    const backdrop = document.createElement('div');
    backdrop.className = 'sheetBackdrop';
    backdrop.hidden = true;
    document.body.appendChild(backdrop);
    const syncBackdrop = function () {
        backdrop.hidden = !sheets.some(d => isShown(document.getElementById(d.id)));
    };
    backdrop.addEventListener('click', function () {
        for (const def of sheets.slice().reverse()) {
            if (isShown(document.getElementById(def.id))) { closeSheet(def); return; }
        }
    });
    for (const def of sheets) {
        const el = document.getElementById(def.id);
        const closeBtn = document.getElementById(def.close);
        if (!el || !closeBtn) continue;

        // title bar (grabber, title, exit) + scrolling body
        const bar = document.createElement('div');
        bar.className = 'sheetBar';
        const title = document.createElement('h2');
        title.className = 'sheetBarTitle';
        title.textContent = def.title;
        const body = document.createElement('div');
        body.className = 'sheetBody';
        const inner = document.createElement('div');
        inner.className = 'sheetBodyInner';
        body.appendChild(inner);
        while (el.firstChild) inner.appendChild(el.firstChild);
        el.appendChild(bar);
        el.appendChild(body);
        bar.appendChild(title);
        closeBtn.setAttribute('role', 'button');
        closeBtn.setAttribute('tabindex', '0');
        closeBtn.setAttribute('aria-label', 'Close ' + def.title);
        closeBtn.appendChild(document.createElement('i'));
        closeBtn.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeBtn.click(); }
        });
        bar.appendChild(closeBtn);
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-label', def.title);
        el.setAttribute('tabindex', '-1');

        // every opening starts full screen, scrolled to the top
        new MutationObserver(function () {
            const shown = el.style.display !== 'none' && el.style.display !== '';
            if (shown && !el.dataset.open) {
                el.dataset.open = '1';
                el.classList.remove('sheetHalf');
                body.scrollTop = 0;
                // focus the dialog (keyboard users Tab on to its controls)
                // rather than the X, which would show a focus ring
                el.focus({ preventScroll: true });
                if (typeof closeAppMenu === 'function') closeAppMenu(false);
            } else if (!shown) {
                delete el.dataset.open;
            }
            syncBackdrop();
        }).observe(el, { attributes: true, attributeFilter: ['style'] });

        if (!def.half) continue;
        const grab = document.createElement('div');
        grab.className = 'sheetGrabber';
        grab.setAttribute('role', 'button');
        grab.setAttribute('tabindex', '0');
        grab.setAttribute('aria-label', 'Resize ' + def.title);
        bar.insertBefore(grab, title);

        let startY = null, startTop = 0, lastY = 0, lastT = 0, velocity = 0, moved = 0;
        grab.addEventListener('pointerdown', function (e) {
            startY = lastY = e.clientY;
            lastT = performance.now();
            velocity = 0; moved = 0;
            startTop = el.getBoundingClientRect().top;
            el.classList.add('sheetDragging');
            try { grab.setPointerCapture(e.pointerId); } catch (err) {}
        });
        grab.addEventListener('pointermove', function (e) {
            if (startY === null) return;
            const now = performance.now();
            if (now > lastT) velocity = (e.clientY - lastY) / (now - lastT);
            lastY = e.clientY; lastT = now;
            moved = e.clientY - startY;
            el.style.top = Math.max(0, startTop + moved) + 'px';
        });
        const end = function () {
            if (startY === null) return;
            startY = null;
            el.classList.remove('sheetDragging');
            const H = window.innerHeight;
            const top = el.getBoundingClientRect().top;
            el.style.top = '';
            if (Math.abs(moved) < 5) {                 // a tap: switch height
                el.classList.toggle('sheetHalf');
                return;
            }
            const wasHalf = el.classList.contains('sheetHalf');
            if (top > H * 0.72 || (wasHalf && velocity > 0.5)) {
                closeSheet(def);
            } else if (velocity < -0.5 || top < H * 0.25) {
                el.classList.remove('sheetHalf');
            } else {
                el.classList.add('sheetHalf');
            }
        };
        grab.addEventListener('pointerup', end);
        grab.addEventListener('pointercancel', end);
        grab.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.classList.toggle('sheetHalf'); }
        });
    }

    // Escape closes the sheet on top
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        for (const def of sheets.slice().reverse()) {
            const el = document.getElementById(def.id);
            if (el && el.style.display !== 'none' && el.style.display !== '') {
                e.preventDefault();
                e.stopImmediatePropagation();
                closeSheet(def);
                return;
            }
        }
    }, true);

    // Settings rows: the label toggles too (Toggle only listens on the box)
    jQuery(document).on('click', '.settingsOptionContainer > .settingsText', function () {
        const box = jQuery(this).siblings('.settingsCheckbox');
        if (box.length) box.trigger('click');
    });
})();

// Search: free text across every field shown for aircraft, vessels and
// satellites, from the second character typed. Up to 100 ranked results as
// you type, about five in view and the rest by scrolling (no "show more"
// control to jump about above the iOS keyboard).
// Choosing one selects it exactly as a tap on the map would.
(function initSearch() {
    const bar = document.getElementById('appBar');
    const input = document.getElementById('searchInput');
    const dropdown = document.getElementById('searchDropdown');
    const list = document.getElementById('searchResults');
    const clearBtn = document.getElementById('searchClear');
    const cancelBtn = document.getElementById('searchCancel');
    const box = document.getElementById('appSearch');
    if (!bar || !input || !dropdown || !list) return;

    const MAX = 100;         // listed results (scrolling); "Show all" covers every match
    const MIN_CHARS = 2;     // a single character matches too much to be useful
    const DOMAIN_MASK = { air: 'dockMaskAir', vessel: 'dockMaskSea', sat: 'dockMaskSpace' };
    let all = [];            // ranked matches (up to MAX)
    let active = -1;
    let lastQuery = '';
    let timer = null, refreshTimer = null;

    const norm = v => (v == null) ? '' : String(v).trim().toUpperCase();
    const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    // highlights the first of the search words found in the text
    const markMatch = function (text, words) {
        const T = text.toUpperCase();
        for (const w of words) {
            const i = w ? T.indexOf(w) : -1;
            if (i < 0) continue;
            return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + w.length)) + '</mark>' + esc(text.slice(i + w.length));
        }
        return esc(text);
    };
    // "tyne, gb ncl": commas separate alternatives (a result matches any of
    // them); within one, spaces separate words that must all match. Each
    // alternative needs MIN_CHARS characters to count.
    function parseTerms(q) {
        return q.split(',').map(t => t.trim().split(/\s+/).filter(Boolean))
            .filter(t => t.join('').length >= MIN_CHARS);
    }
    const termWords = terms => [].concat(...terms);

    function titleOf(p, d) {
        if (d === 'vessel') return p.registration || p.flight || String(p.icao).replace(/^MMSI/, 'MMSI ');
        if (d === 'sat') return p.flight || ('NORAD ' + (p.satNoradId || ''));
        return (p.flight && p.flight.trim()) || p.registration || String(p.icao).toUpperCase();
    }
    // Airports on an aircraft's route, from the route lookup cache - read
    // directly, so aircraft off screen (whose route fields aren't filled in)
    // still match an airport code or city. null when not looked up yet.
    function routeAirports(p) {
        if (!p.name || !g.route_cache || typeof normalized_callsign !== 'function') return null;
        let r = null;
        try { r = g.route_cache[normalized_callsign(String(p.name))]; } catch (e) { return null; }
        return (r && r._airports && r._airports.length) ? r._airports : null;
    }
    // "NCL-LHR", and "Newcastle → London", from the cache
    function routeCodes(p) {
        const a = routeAirports(p);
        return a ? a.map(x => x.iata || x.icao || '?').join('-') : '';
    }
    function routeCities(p) {
        const a = routeAirports(p);
        return a ? a.map(x => x.location || x.iata || x.icao).join(' \u2192 ') : '';
    }

    // [value, weight]: identifiers rank above descriptions
    function fieldsOf(p, d) {
        if (d === 'vessel') {
            return [[p.registration, 3], [p.flight, 3], [String(p.icao).replace(/^MMSI/, ''), 3],
                    [p.typeDescription, 1], [p.destination, 1], [p.country, 1], [p.country_code, 1]];
        }
        if (d === 'sat') {
            return [[p.flight, 3], [p.satNoradId, 3], [p.satOwner, 1], [p.satOwnerCode, 1]];
        }
        const fields = [[p.flight, 3], [p.registration, 3], [p.icao, 3], [p.squawk, 2], [p.icaoType, 2],
                [p.typeLong, 1], [p.ownOp, 1], [p.routeString, 1], [p.routeVerbose, 1], [p.country, 1],
                [p.country_code, 1]];
        // airport codes (LHR, EGLL) rank like identifiers; cities like descriptions
        const airports = routeAirports(p);
        if (airports) {
            for (const a of airports) fields.push([a.iata, 2], [a.icao, 2], [a.location, 1]);
        }
        return fields;
    }

    // An airport code typed in: look up the routes of every loaded aircraft
    // (the route lookup normally only runs for aircraft on screen), so the
    // results and the map filter cover them all. Queued through the normal
    // route lookup, in its usual batches; each callsign once per visit.
    const routeAsked = new Set();
    function lookUpRoutesFor(q) {
        if (typeof useRouteAPI === 'undefined' || !useRouteAPI || !/^[A-Z]{3,4}$/.test(q)) return;
        if (!g.route_check_todo || !g.route_cache || typeof normalized_callsign !== 'function') return;
        const objs = ((g && g.planesOrdered) || []).filter(p => objectDomain(p) === 'air' && p.position && p.flight && p.name
            && p.name !== p.registration);
        objs.sort((a, b) => (b.inView ? 1 : 0) - (a.inView ? 1 : 0));   // on screen first
        let queued = 0;
        for (const p of objs) {
            if (queued >= 500) break;
            let cs;
            try { cs = normalized_callsign(String(p.name)); } catch (e) { continue; }
            if (!cs || routeAsked.has(cs) || g.route_cache[cs] || g.route_check_todo[cs]) continue;
            routeAsked.add(cs);
            g.route_check_todo[cs] = { callsign: cs, icao: p.icao, lat: p.position[1], lng: p.position[0] };
            queued++;
        }
    }
    function filteredOut(p) {
        try { return typeof p.isFiltered === 'function' && !!p.isFiltered(); } catch (e) { return false; }
    }
    // how well p matches q (0 = not at all), from its fields alone
    function matchScore(p, q) {
        let best = 0;
        for (const [raw, weight] of fieldsOf(p, objectDomain(p))) {
            const v = norm(raw);
            if (!v) continue;
            let s = 0;
            if (v === q) s = 100;
            else if (v.startsWith(q)) s = 60;
            else if (v.split(/[\s\-\/,()]+/).some(w => w.startsWith(q))) s = 40;
            else if (q.length >= 2 && v.includes(q)) s = 20;
            if (s) best = Math.max(best, s * weight);
        }
        return best;
    }
    // the whole query: best of the alternatives; an alternative scores its
    // weakest word (0 unless every word matches)
    function queryScore(p, terms) {
        let best = 0;
        for (const words of terms) {
            let s = Infinity;
            for (const w of words) {
                const m = matchScore(p, w);
                if (!m) { s = 0; break; }
                s = Math.min(s, m);
            }
            if (s !== Infinity && s > best) best = s;
        }
        return best;
    }
    // ranking for the results list: what's on screen first
    function score(p, terms) {
        let best = queryScore(p, terms);
        if (!best) return 0;
        if (p.inView) best += 15;            // on screen first
        if (filteredOut(p)) best -= 5;
        return best;
    }
    let matchCount = 0;      // every match, not just the listed ones
    function search(terms) {
        const out = [];
        const objs = (g && g.planesOrdered) || [];
        for (let i = 0; i < objs.length; i++) {
            const p = objs[i];
            if (!p || !p.position) continue;
            const s = score(p, terms);
            if (s > 0) out.push({ p: p, s: s, t: titleOf(p, objectDomain(p)) });
        }
        matchCount = out.length;
        out.sort((a, b) => b.s - a.s || a.t.localeCompare(b.t));
        return out.slice(0, MAX).map(r => r.p);
    }
    function isHidden(p) {
        const d = objectDomain(p);
        if (d === 'air' && window.ShowAir === false) return true;
        if (d === 'vessel' && window.ShowMarine === false) return true;
        if (d === 'sat' && window.ShowSatellites === false) return true;
        return filteredOut(p);
    }

    function showDropdown(show) {
        dropdown.hidden = !show;
        input.setAttribute('aria-expanded', show ? 'true' : 'false');
        clearInterval(refreshTimer);
        refreshTimer = show ? setInterval(render, 2000) : null;   // positions and facts move
    }

    function render() {
        const raw = input.value;
        const q = norm(raw);
        clearBtn.hidden = !raw;
        const terms = parseTerms(q);
        const words = termWords(terms);
        if (q !== lastQuery) {
            active = -1; lastQuery = q; list.scrollTop = 0;
            words.forEach(lookUpRoutesFor);   // airport codes among the words
        }
        if (!q) { list.innerHTML = ''; showDropdown(false); return; }
        if (!terms.length) {
            all = [];
            list.innerHTML = '<div class="searchEmpty" role="status">Keep typing\u2026</div>';
            if (document.activeElement === input || box.contains(document.activeElement)) showDropdown(true);
            return;
        }
        const keep = (active >= 0 && all[active]) ? all[active].icao : null;
        all = search(terms);
        const shown = all;
        active = keep ? shown.findIndex(p => p.icao === keep) : -1;
        if (!all.length) {
            list.innerHTML = '<div class="searchEmpty" role="status">No results for “' + esc(raw.trim()) + '”</div>';
        } else {
            const filtering = !!(g.searchFilter && g.searchFilter.q === q);
            const showAll = '<button type="button" class="searchAll" id="searchShowAll">'
                + '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/></svg>'
                + '<span>' + (filtering ? 'Showing ' : 'Show ') + (matchCount === 1 ? '1 result' : 'all ' + matchCount) + ' on the map</span></button>';
            list.innerHTML = showAll + shown.map(function (p, i) {
                const d = objectDomain(p);
                const flag = flagInfo(p);
                // the same three lines as the hover box and the selected
                // header: flag + name, the one-line summary, the route
                let facts = '', route = '';
                try { facts = sheetFacts(p) || ''; } catch (e) {}
                try { route = sheetRouteLine(p) || ''; } catch (e) {}
                if (!route && d === 'air') route = routeCities(p);
                const t = (p.name && String(p.name).trim()) || titleOf(p, d);
                // what was matched, when it isn't already in the title
                // (a registration, MMSI or NORAD number, say)
                let also = '';
                if (!words.some(w => t.toUpperCase().includes(w))) {
                    const ids = d === 'vessel' ? [p.registration, p.flight, String(p.icao).replace(/^MMSI/, 'MMSI ')]
                        : d === 'sat' ? [p.flight, p.satNoradId != null ? 'NORAD ' + p.satNoradId : null]
                        : [p.flight, p.registration, p.icao ? String(p.icao).toUpperCase() : null, p.icaoType, routeCodes(p)];
                    also = ids.map(v => (v == null ? '' : String(v).trim()))
                        .find(v => v && words.some(w => v.toUpperCase().includes(w))) || '';
                }
                return '<button type="button" class="searchResult" role="option" tabindex="-1" id="searchOpt' + i + '"'
                    + ' data-index="' + i + '" aria-selected="' + (i === active) + '">'
                    + '<span class="searchIcon" aria-hidden="true"><span class="dockMask ' + DOMAIN_MASK[d] + '"></span></span>'
                    + '<span class="searchText"><span class="searchTitle">'
                    + (flag.code ? '<img src="flags/3x2/' + flag.code + '.svg" alt="" onerror="this.remove()">' : '')
                    + '<span>' + markMatch(t, words) + '</span>'
                    + (also ? '<span class="searchAlso">' + markMatch(also, words) + '</span>' : '')
                    + '</span>'
                    + (facts ? '<span class="searchSub">' + esc(facts) + '</span>' : '')
                    + (route ? '<span class="searchRoute">' + esc(route) + '</span>' : '')
                    + '</span>'
                    + (isHidden(p) ? '<span class="searchHidden">Hidden</span>' : '')
                    + '</button>';
            }).join('');
        }
        if (active >= 0) input.setAttribute('aria-activedescendant', 'searchOpt' + active);
        else input.removeAttribute('aria-activedescendant');
        if (document.activeElement === input || box.contains(document.activeElement)) showDropdown(true);
    }

    function setActive(i) {
        const n = all.length;
        if (!n) return;
        active = (i + n) % n;
        list.querySelectorAll('.searchResult').forEach(function (row, k) {
            row.setAttribute('aria-selected', String(k === active));
            if (k === active) row.scrollIntoView({ block: 'nearest' });
        });
        input.setAttribute('aria-activedescendant', 'searchOpt' + active);
    }

    // keep the list above the on-screen keyboard
    function fitViewport() {
        const vv = window.visualViewport;
        document.documentElement.style.setProperty('--VVH', (vv ? vv.height : window.innerHeight) + 'px');
    }

    // "Show all on map": only objects matching the term stay on the map (and
    // in the object list) until the search is cleared - the X, Cancel,
    // Escape, or typing something else.
    const filterTag = document.getElementById('searchFilterTag');
    function refreshMapFilter() {
        if (g && g.aiscatcherLayer && typeof g.aiscatcherLayer.changed === 'function') g.aiscatcherLayer.changed();
        if (typeof refreshFilter === 'function') refreshFilter();
        if (typeof active === 'function') active();
        if (typeof fetchData === 'function') fetchData({ force: true });
    }
    function setFilterUI() {
        const on = !!g.searchFilter;
        box.classList.toggle('filtering', on);
        if (filterTag) filterTag.hidden = !on;
    }
    function applyMapFilter() {
        const q = norm(input.value);
        const terms = parseTerms(q);
        if (!terms.length) return;
        g.searchFilter = { q: q, match: p => queryScore(p, terms) > 0 };
        setFilterUI();
        refreshMapFilter();
        endSearch(false);
    }
    function clearMapFilter() {
        if (!g.searchFilter) return;
        g.searchFilter = null;
        setFilterUI();
        refreshMapFilter();
    }
    window.clearSearchFilter = clearMapFilter;

    function endSearch(clear) {
        clearTimeout(timer);
        showDropdown(false);
        bar.classList.remove('searching');
        if (clear) { input.value = ''; clearMapFilter(); render(); }
        input.blur();
    }
    window.closeSearch = function () { showDropdown(false); bar.classList.remove('searching'); };
    window.openSearch = function () {
        if (typeof closeAppMenu === 'function') closeAppMenu(false);
        input.focus();
        input.select();
    };

    function choose(p) {
        if (!p) return;
        const d = objectDomain(p);
        // switch its layer back on, and drop a filter that hides it
        if (d === 'air' && window.ShowAir === false) toggleAir();
        if (d === 'vessel' && window.ShowMarine === false) toggleMarine();
        if (d === 'sat' && window.ShowSatellites === false) toggleSatellite();
        if (onlyMilitary && !(p.military || (p.dbFlags & 1))) toggleMilitary();
        if (onlyEmergency && !getEmergencyLevel(p)) toggleEmergency();
        endSearch(false);
        if (g.sheet) g.sheet.nextSource = { src: 'search', t: Date.now() };
        selectPlaneByHex(p.icao, { noDeselect: true });
        // bring it into view when Follow isn't already doing that
        const view = OLMap && OLMap.getView();
        if (view && p.position && !FollowSelected) {
            try { view.animate({ center: ol.proj.fromLonLat(p.position), duration: 400 }); } catch (e) {}
        }
    }

    input.addEventListener('focus', function () {
        if (typeof closeAppMenu === 'function') closeAppMenu(false);
        bar.classList.add('searching');
        fitViewport();
        if (input.value.trim()) render();
    });
    input.addEventListener('input', function () {
        // a different term: the map shows everything again until it's applied
        if (g.searchFilter && norm(input.value) !== g.searchFilter.q) clearMapFilter();
        clearTimeout(timer);
        timer = setTimeout(render, 110);
    });
    input.addEventListener('keydown', function (e) {
        e.stopPropagation();   // typing never triggers the map's shortcuts
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
        else if (e.key === 'Enter') {
            // a highlighted result: select it; otherwise show them all on the map
            e.preventDefault();
            clearTimeout(timer);
            if (active >= 0 && all[active]) choose(all[active]);
            else { render(); if (all.length) applyMapFilter(); }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            if (input.value) { input.value = ''; clearMapFilter(); render(); }
            else endSearch(false);
        }
    });
    clearBtn.addEventListener('click', function () { input.value = ''; clearMapFilter(); render(); input.focus(); });
    cancelBtn.addEventListener('click', function () { endSearch(true); });
    // tap / click on a result (mousedown kept from blurring the field first)
    list.addEventListener('mousedown', function (e) { e.preventDefault(); });
    list.addEventListener('click', function (e) {
        if (e.target.closest('.searchAll')) { applyMapFilter(); return; }
        const row = e.target.closest('.searchResult');
        if (row) choose(all[Number(row.dataset.index)]);
    });
    // scrolling the results on a phone puts the keyboard away, as in iOS
    list.addEventListener('touchmove', function () { if (document.activeElement === input) input.blur(); }, { passive: true });
    // a tap anywhere else closes the results (the text stays)
    document.addEventListener('pointerdown', function (e) {
        if (box.contains(e.target)) return;
        if (!dropdown.hidden || bar.classList.contains('searching')) {
            showDropdown(false);
            bar.classList.remove('searching');
        }
    }, true);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', fitViewport);
    window.addEventListener('resize', fitViewport);

    // Wider screens: centre the box over the map - the same centre line as
    // the bottom pill - as wide as fits between the menu button and the logo
    // (at most 560px). The map's width changes with the object list and the
    // desktop panel, so it's re-measured whenever those move.
    const menuBtn = document.getElementById('menuButton');
    const logo = bar.querySelector('.appLogo');
    const mapEl = document.getElementById('map_container');
    window.layoutSearchBox = function () {
        if (!mapEl || !menuBtn || !logo) return;
        const root = document.documentElement;
        const m = mapEl.getBoundingClientRect();
        if (!m.width) return;
        const panel = parseFloat(getComputedStyle(root).getPropertyValue('--PANEL-L')) || 0;
        const cx = m.left + panel + (m.width - panel) / 2;
        const leftLimit = menuBtn.getBoundingClientRect().right + 12;
        const rightLimit = logo.getBoundingClientRect().left - 12;
        const half = Math.max(80, Math.min(280, cx - leftLimit, rightLimit - cx));
        root.style.setProperty('--SEARCH-CX', Math.round(cx) + 'px');
        root.style.setProperty('--SEARCH-W', Math.round(half * 2) + 'px');
    };
    if (mapEl && typeof ResizeObserver === 'function') new ResizeObserver(layoutSearchBox).observe(mapEl);
    window.addEventListener('resize', layoutSearchBox);
    const logoImg = logo && logo.querySelector('img');
    if (logoImg && !logoImg.complete) logoImg.addEventListener('load', layoutSearchBox);   // logo width known
    layoutSearchBox();
})();
