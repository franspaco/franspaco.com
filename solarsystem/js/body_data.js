

var basic_body_list = [
    "mercury",
    "venus",
    "earth",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
    "pluto",
    "moon",
    "europa",
    "io"
];

var body_scale_ratio = 5;

var body_orbit_inclination = {
    mercury:  0,
    venus:    0.5,
    earth:    1,
    mars:     0,
    jupiter:  0.5,
    saturn:   1,
    uranus:   0,
    neptune:  0.5,
    pluto:    15,
    moon:     5,
    europa:   30,
    io:       -5
};

var body_scale = {
    sun:      1.0000,
    mercury:  0.0034,
    venus:    0.0086,
    earth:    0.0091,
    mars:     0.0041,
    jupiter:  0.1027,
    saturn:   0.0836,
    uranus:   0.0337,
    neptune:  0.0326,
    pluto:    0.0016,
    moon:     0.0024,
    europa:   0.0023,
    io:       0.0026
};

var orbit_scale = 2;

var orbit_size = {
    mercury:  10.6,
    venus:    13.39,
    earth:    15.22,
    mars:     18.094,
    jupiter:  30.094,
    saturn:   40.77,
    uranus:   56.57,
    neptune:  70.08,
    pluto:    79.896,
    moon:     1,
    europa:   4,
    io:       2.5
};

var orbit_period = {
    mercury:  87,
    venus:    224,
    earth:    365,
    mars:     687,
    jupiter:  4328,
    saturn:   10767,
    uranus:   30660,
    neptune:  59860,
    pluto:    90520,
    moon:     28,
    europa:   3.54,
    io:       2
};

var rotation_period = {
    sun:      120,
    mercury:  10,
    venus:    60,
    earth:    24,
    mars:     40,
    jupiter:  50,
    saturn:   60,
    uranus:   70,
    neptune:  80,
    pluto:    100,
    moon:     28,
    europa:   10,
    io:       10
};