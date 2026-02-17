module.exports = {
    capabilitiesList: [
        {
            browserName: 'Chrome',
            browserVersion: 'latest',
            'bstack:options': {
                os: 'Windows',
                osVersion: '11',
                sessionName: 'Chrome - Windows',
                buildName: 'ElPais Parallel Build'
            }
        },
        {
            browserName: 'Firefox',
            browserVersion: 'latest',
            'bstack:options': {
                os: 'Windows',
                osVersion: '11',
                sessionName: 'Firefox - Windows',
                buildName: 'ElPais Parallel Build'
            }
        },
        {
            browserName: 'Safari',
            browserVersion: 'latest',
            'bstack:options': {
                os: 'OS X',
                osVersion: 'Monterey',
                sessionName: 'Safari - macOS',
                buildName: 'ElPais Parallel Build'
            }
        },
        {
            browserName: 'Chrome',
            browserVersion: 'latest',
            'bstack:options': {
                deviceName: 'Samsung Galaxy S22',
                osVersion: '12.0',
                sessionName: 'Samsung Galaxy S22',
                buildName: 'ElPais Parallel Build'
            }
        },
        {
            browserName: 'Safari',
            browserVersion: 'latest',
            'bstack:options': {
                deviceName: 'iPhone 14',
                osVersion: '16',
                sessionName: 'iPhone 14',
                buildName: 'ElPais Parallel Build'
            }
        }
    ]
};