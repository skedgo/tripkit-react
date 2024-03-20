import React, { useContext, useEffect, useRef } from 'react';
import { MapboxGlLayer } from '@mongodb-js/react-mapbox-gl-leaflet/lib/react-mapbox-gl-leaflet';
import { RoutingResultsContext } from '../trip-planner/RoutingResultsProvider';
import Features from '../env/Features';
import Color from '../model/trip/Color';
import { TKI18nContext } from '../i18n/TKI18nProvider';
import { useTheme } from 'react-jss';
import { TKUITheme } from '../jss/TKUITheme';
import Util from '../util/Util';

const TKMapboxGLLayer: React.FunctionComponent<any> = props => {
    const mapboxGlMap = useRef<MapboxGlLayer>();
    const { coverageGeoJson, mapAsync, selectedTrip, selectedTripSegment } = useContext(RoutingResultsContext);
    const { locale } = useContext(TKI18nContext);
    const theme = useTheme<TKUITheme>();
    const { style } = props;

    useEffect(() => {
        mapAsync.then(map => {
            map.registerLayer({ type: "mapboxGL", ref: undefined });    // Cannot send reference to function component. TODO: find alternative.
        });
        return () => {
            mapAsync.then(map => map.unregisterLayer({ type: "mapboxGL", ref: undefined }))
        };
    }, []);

    useEffect(() => {
        refreshCoverage();
    }, [coverageGeoJson]);

    useEffect(() => {
        // Highlight walk paths for walking only trips.
        refreshModeSpecificTiles();
    }, [selectedTrip, selectedTripSegment]);

    useEffect(() => {
        refreshMapLocale();
    }, [locale]);

    function refreshCoverage() {
        if (!mapboxGlMap.current ||
            // Commented since it sometimes always returns false, even after 'load' was triggered, as pointed out here: https://github.com/mapbox/mapbox-gl-js/issues/2268#issuecomment-401979967
            // !mapboxGlMap.current.isStyleLoaded() ||
            !coverageGeoJson) {
            return;
        }
        try {
            if (!mapboxGlMap.current.getSource('coverage')) {
                mapboxGlMap.current.addSource('coverage', {
                    'type': 'geojson',
                    'data': {
                        'type': 'Feature',
                        'geometry': coverageGeoJson
                    }
                });
                // Add a new layer to visualize the polygon.
                mapboxGlMap.current.addLayer({
                    'id': 'coverageLayer',
                    'type': 'fill',
                    'source': 'coverage',
                    'layout': {},
                    'paint': {
                        'fill-color': theme.isDark ? '#f5faff' : '#212A33',
                        'fill-opacity': 0.4
                    }
                });
            }
            mapboxGlMap.current.getSource("coverage")
                .setData({
                    'type': 'Feature',
                    'geometry': coverageGeoJson
                });
        } catch (e) {
            // Catch exception inside getSource call probably caused by
            // using mode specific tiles.
            console.log(e);
        }
    }

    function refreshModeSpecificTiles() {
        if (!mapboxGlMap.current || !Features.instance.modeSpecificMapTilesEnabled) {
            return
        }
        try {
            if (!mapboxGlMap.current.getLayer(ROAD_PEDESTRIAN_HIGHLIGHT.id)) {
                mapboxGlMap.current.addLayer(ROAD_PEDESTRIAN_HIGHLIGHT);
                mapboxGlMap.current.addLayer(ROAD_PATH_HIGHLIGHT);
            }
            const isWalkTrip = selectedTrip && selectedTrip.isWalkTrip() || selectedTripSegment && selectedTripSegment.isWalking();
            mapboxGlMap.current.setLayoutProperty(ROAD_PEDESTRIAN_HIGHLIGHT.id, 'visibility',
                isWalkTrip ? 'visible' : 'none');
            mapboxGlMap.current.setLayoutProperty(ROAD_PATH_HIGHLIGHT.id, 'visibility',
                isWalkTrip ? 'visible' : 'none');
        } catch (e) {
            // To avoid break due to Error: Style is not done loading
        }
        // Other ways to change style dynamically:
        // this.mapboxGlMap.setLayoutProperty('road-path', 'visibility', 'none');
        // this.mapboxGlMap.setPaintProperty('road-path', 'line-color', '#ff0000');
        // this.mapboxGlMap.setPaintProperty('road-pedestrian', 'line-color', 'rgba(255,0,0,.5)');
    }

    function refreshMapLocale() {
        if (!mapboxGlMap.current || !mapboxGlMap.current.isStyleLoaded()) {
            return
        }
        try {
            if (locale && locale !== 'en')
                mapboxGlMap.current.getStyle().layers.forEach(thisLayer => {
                    if (thisLayer.type == 'symbol') {
                        mapboxGlMap.current.setLayoutProperty(thisLayer.id, 'text-field', [
                            "coalesce",
                            ['get', 'name_' + locale],
                            ['get', 'name_en'],
                            ['get', 'name'] // default country language if not found. Original value: [['get', 'name_en'], ['get', 'name']]
                            // confirmed by looking at this.mapboxGlMap.getLayoutProperty(thisLayer.id, 'text-field').
                        ]);
                    }
                });
        } catch (e) {
            console.log(e);
        }
    }

    function refresh() {
        refreshCoverage();
        // On init, or on style change (switch dark / light appearance).
        refreshModeSpecificTiles();
        refreshMapLocale();
    }

    const { attribution, ...restProps } = props;
    return (
        <MapboxGlLayer
            {...restProps}
            attribution={Util.addSkedGoTermsToMapAttribution(attribution)}
            key={style}   // Do this to re-create the component on style change to force refresh.
            ref={(ref: any) => {
                if (ref && ref.leafletElement && ref.leafletElement.getMapboxMap) {
                    mapboxGlMap.current = ref.leafletElement.getMapboxMap();
                    mapAsync.then(map => {
                        map.mapboxGlMap = mapboxGlMap.current;
                        map.resolveMapboxGlMap(mapboxGlMap.current);
                    });
                    mapboxGlMap.current.on('load', () => {
                        refresh();
                    });
                    // Workaround on https://github.com/mapbox/mapbox-gl-js/issues/2268#issuecomment-401979967
                    // Even if the that event is triggered, your map could be not full ready.
                    // It's an issue in MapBox, I needed to do this to solve my problem.
                    // It seems it's not necessary for now.
                    // mapboxGlMap.current.on('style.load', () => {
                    //     const waiting = () => {
                    //         if (!mapboxGlMap.current.isStyleLoaded()) {
                    //             setTimeout(waiting, 200);
                    //         } else {
                    //             refresh();
                    //         }
                    //     };
                    //     waiting();
                    // });                    
                }
            }}
        />
    );
}

export default TKMapboxGLLayer;

const WALK_PATH_COLOR = "rgb(0, 220, 0)";

const ROAD_PEDESTRIAN_HIGHLIGHT =
{
    "id": "road-pedestrian-highlight",
    "type": "line",
    "source": "composite",
    "source-layer": "road",
    "minzoom": 12,
    "filter": [
        "all",
        [
            "==",
            [
                "get",
                "class"
            ],
            "pedestrian"
        ],
        [
            "match",
            [
                "get",
                "structure"
            ],
            [
                "none",
                "ford"
            ],
            true,
            false
        ],
        [
            "==",
            [
                "geometry-type"
            ],
            "LineString"
        ]
    ],
    "layout": {
        "line-join": [
            "step",
            [
                "zoom"
            ],
            "miter",
            14,
            "round"
        ],
        "visibility": "none"
    },
    "paint": {
        "line-width": [
            "interpolate",
            [
                "exponential",
                1.5
            ],
            [
                "zoom"
            ],
            14,
            0.5,
            18,
            12
        ],
        "line-color": Color.createFromRGB(WALK_PATH_COLOR).toRGBA(.5),
        "line-dasharray": [
            "step",
            [
                "zoom"
            ],
            [
                "literal",
                [
                    1,
                    0
                ]
            ],
            15,
            [
                "literal",
                [
                    1.5,
                    0.4
                ]
            ],
            16,
            [
                "literal",
                [
                    1,
                    0.2
                ]
            ]
        ]
    },
    "metadata": {
        "mapbox:featureComponent": "walking-cycling",
        "mapbox:group": "Walking, cycling, etc., surface"
    }
};

const ROAD_PATH_HIGHLIGHT =
{
    "id": "road-path-highlight",
    "type": "line",
    "source": "composite",
    "source-layer": "road",
    "minzoom": 12,
    "filter": [
        "all",
        [
            "==",
            [
                "get",
                "class"
            ],
            "path"
        ],
        [
            "step",
            [
                "zoom"
            ],
            [
                "!",
                [
                    "match",
                    [
                        "get",
                        "type"
                    ],
                    [
                        "steps",
                        "sidewalk",
                        "crossing"
                    ],
                    true,
                    false
                ]
            ],
            16,
            [
                "!=",
                [
                    "get",
                    "type"
                ],
                "steps"
            ]
        ],
        [
            "match",
            [
                "get",
                "structure"
            ],
            [
                "none",
                "ford"
            ],
            true,
            false
        ],
        [
            "==",
            [
                "geometry-type"
            ],
            "LineString"
        ]
    ],
    "layout": {
        "line-join": [
            "step",
            [
                "zoom"
            ],
            "miter",
            14,
            "round"
        ],
        "visibility": "none"
    },
    "paint": {
        "line-width": [
            "interpolate",
            [
                "exponential",
                1.5
            ],
            [
                "zoom"
            ],
            13,
            0.5,
            14,
            1,
            15,
            1,
            18,
            4
        ],
        "line-color": Color.createFromRGB(WALK_PATH_COLOR).toRGBA(1),
        "line-dasharray": [
            "step",
            [
                "zoom"
            ],
            [
                "literal",
                [
                    1,
                    0
                ]
            ],
            15,
            [
                "literal",
                [
                    1.75,
                    1
                ]
            ],
            16,
            [
                "literal",
                [
                    1,
                    0.75
                ]
            ],
            17,
            [
                "literal",
                [
                    1,
                    0.5
                ]
            ]
        ]
    },
    "metadata": {
        "mapbox:featureComponent": "walking-cycling",
        "mapbox:group": "Walking, cycling, etc., surface"
    }
};