module.exports = {
    development: {
        database: 'mongodb://localhost/xoomean',
        port: process.env.PORT || 3030
    },
    production: {
        database: 'mongodb://bogdandorca:instagram1@ds031632.mongolab.com:31632/xoomean',
        port: process.env.PORT || 3030
    }
};