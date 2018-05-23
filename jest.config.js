module.exports = {
    testRegex: "\\/test\\/.+spec\\.js",
    collectCoverage: true,
    transform: {
        "^.+\\.jsx?$": "babel-jest",
    },
};
