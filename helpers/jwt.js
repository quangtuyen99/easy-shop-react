const expressJwt = require('express-jwt');

function authJwt() {
    const secret = process.env.secret;
    const api = process.env.API_URL;
    // Kiểm tra xem token có dựa trên secret được tạo không
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            // Tất cả các url. vd: api/vi/products/get/feature/3
            {url: /\api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS']},
            {url: /\api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS']},
            {url: /\public\/uploads(.*)/, methods: ['GET', 'OPTIONS']},
            `${api}/users/login`,
            `${api}/users/register`
        ]
    })
}

async function isRevoked(req, payload, done) {
    if(!payload.isAdmin) {
        return done(null, true)
    }

    done();
}


module.exports = authJwt;