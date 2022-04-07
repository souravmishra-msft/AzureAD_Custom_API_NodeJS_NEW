const router = require('express').Router();
const passport = require('passport');
const BearerStrategy = require('passport-azure-ad').BearerStrategy;

const config = require('../config/authConfig.json');

const options = {
  identityMetadata: `https://${config.authority}/${config.tenantID}/${config.version}/${config.discovery}`,
  issuer: `https://${config.authority}/${config.tenantID}/${config.version}`,
  clientID: config.clientID,
  audience: config.audience,
  validateIssuer: config.validateIssuer,
  passReqToCallback: config.passReqToCallback,
  loggingLevel: config.loggingLevel,
  scope: config.scope,
};


const bearerStrategy = new BearerStrategy(options, (token, done) => {
    done(null, {}, token);
});

passport.use(bearerStrategy);


router.get('/test', passport.authenticate("oauth-bearer", {session: false}) ,(req, res) => {
    const request = req.headers.authorization;
    const token = request.split(' ');
    console.log(token[1]);
    console.log(req);
    res.status(200).json({
        status: "Success",
        message: "Test Successful"
    });
});


module.exports = router;


