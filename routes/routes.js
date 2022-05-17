const router = require('express').Router();
const passport = require('passport');
const BearerStrategy = require('passport-azure-ad').BearerStrategy;

const config = require('../config/authConfig.json');
const Item = require('../models/Items');

// -------------------------------------------------------
// Preparing for BearerStrategy
// -------------------------------------------------------
const options = {
    identityMetadata: `https://${config.metadata.authority}/${config.credentials.tenantID}/${config.metadata.version}/${config.metadata.discovery}`,
    issuer: `https://${config.metadata.authority}/${config.credentials.tenantID}/${config.metadata.version}`,
    clientID: config.credentials.clientID,
    audience: config.credentials.audience,
    validateIssuer: config.settings.validateIssuer,
    passReqToCallback: config.settings.passReqToCallback,
    loggingLevel: config.settings.loggingLevel,
    //   scope: config.resource.scope,
};

const bearerStrategy = new BearerStrategy(options, (token, done) => {
    done(null, {}, token);
});

// console.log(bearerStrategy);
passport.use(bearerStrategy);


router.get('/test', passport.authenticate("oauth-bearer", { session: false }), (req, res) => {
    const request = req.headers.authorization;
    // console.log(token[1]);
    let scp = req.authInfo["scp"];
    let scopeArr = scp.split(" ").filter(Boolean);
    try {
        if (scopeArr.find(el => el === "items.read")) {
            res.status(200).json({
                status: "Success",
                message: "Test Successful"
            });
        } else {
            res.status(401).json({
                status: 401,
                message: "Unauthorized",
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
});


/** Create a new Watchlist item and add it to DB. */
router.post('/addItem', passport.authenticate("oauth-bearer", { session: false }), async (req, res) => {
    let scp = req.authInfo["scp"];
    let scopeArr = scp.split(" ").filter(Boolean);
    try {
        if (scopeArr.find(el => el === "items.readwrite")) {
            const item = new Item({
                title: req.body.title,
                genre: req.body.genre,
                type: req.body.type,
                createdBy: req.authInfo.preferred_username,
                userID: req.authInfo.oid
            });
            const newItem = await item.save();
            res.status(200).json({
                status: "success",
                message: `item added to watchlist successfully`,
                watchlist_item: {
                    title: item.title,
                    genre: item.genre,
                    type: item.type,
                    status: item.status,
                    createdBy: item.createdBy
                }
            });
        } else {
            res.status(401).json({
                status: 401,
                message: "Unauthorized",
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
});

/** Fetch list of items created by a specific user */
router.get('/listItems', passport.authenticate("oauth-bearer", { session: false }), async (req, res) => {
    let scp = req.authInfo["scp"];
    let scopeArr = scp.split(" ").filter(Boolean);
    try {
        if (scopeArr.find(el => el === "items.read")) {
            let item = await Item.find({ userID: req.authInfo.oid });
            if (!item || (item.length == 0)) {
                res.status(200).json({
                    status: "failure",
                    message: "No items found for this user."
                });
            } else {
                res.status(200).json({
                    status: "success",
                    length: item.length,
                    items: item
                });
            }
        } else {
            res.status(401).json({
                status: 401,
                message: "Unauthorized",
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
});


/** Update item created by a specific user */
router.patch('/updateItem/:id', passport.authenticate("oauth-bearer", { session: false }), async (req, res) => {
    let scp = req.authInfo["scp"];
    let scopeArr = scp.split(" ").filter(Boolean);
    try {
        if (scopeArr.find(el => el === "items.readwrite")) {
            const item = await Item.findOne({ _id: req.params.id });
            // console.log(item);
            if (!item || (item.length == 0)) {
                // item not found 
                res.status(200).json({
                    status: "failure",
                    message: "No items found for this user."
                });
            } else {
                // console.log(req.authInfo.oid);
                // console.log(item["userID"]);
                // if item found then check if the user can update the item or not
                if (req.authInfo.oid != item["userID"]) {
                    res.status(200).json({
                        status: "failure",
                        message: "cannot edit this item."
                    });
                } else {
                    //If user can update the item
                    try {
                        const updatedItem = await Item.findByIdAndUpdate(
                            req.params.id,
                            {
                                $set: {
                                    title: req.body.title,
                                    genre: req.body.genre,
                                    type: req.body.type,
                                    state: req.body.state
                                }
                            }
                        );
                        res.status(200).json({
                            status: "success",
                            message: "Item updated successfully."
                        });
                    } catch (err) {
                        res.status(400).send({ status: "failure", error: err.message });
                    }
                }
            }
        } else {
            res.status(401).json({
                status: 401,
                message: "Unauthorized",
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
});

/** Delete item created by a specific user */
router.delete('/deleteItem/:id', passport.authenticate("oauth-bearer", { session: false }), async (req, res) => {
    let scp = req.authInfo["scp"];
    let scopeArr = scp.split(" ").filter(Boolean);
    try {
        if (scopeArr.find(el => el === "items.read")) {
            const item = await Item.findOne({ _id: req.params.id });
            if (!item || (item.length == 0)) {
                // item not found 
                res.status(200).json({
                    status: "failure",
                    message: "no items found for this user."
                });
            } else {
                // if item found then check if the user can delete the item or not
                if (req.authInfo.oid != item["userID"]) {
                    res.status(200).json({
                        status: "failure",
                        message: "user cannot delete this item."
                    });
                } else {
                    //If user can delete the item   
                    try {
                        const deletedItem = await Item.findByIdAndDelete(req.params.id);
                        res.status(200).json({ status: "success", message: `item deleted successfully.` });
                    } catch (err) {
                        res.status(400).send({ status: "failure", error: err.message });
                    }
                }
            }
        } else {
            res.status(401).json({
                status: 401,
                message: "Unauthorized",
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message,
        });
    }

});

/** List all the Items in the Watchlist DB for users and apps */
router.get('/listAllItems', passport.authenticate("oauth-bearer", { session: false }), async (req, res) => {
    let scopeArr = [];
    let rolesArr = [];

    if (req.authInfo["scp"]) {
        let scp = req.authInfo["scp"];
        scopeArr = scp.split(" ").filter(Boolean);
    } else if (req.authInfo["roles"]) {
        rolesArr = req.authInfo["roles"];
    }

    try {
        if ((scopeArr.find(el => el === "items.read.all")) || (rolesArr.find(el => el === "items.readAll"))) {
            let item = await Item.find();
            if (!item || (item.length == 0)) {
                res.status(200).json({
                    status: "failure",
                    message: "No items found for this user."
                });
            } else {
                res.status(200).json({
                    status: "success",
                    length: item.length,
                    items: item
                });
            }
        } else {
            res.status(401).json({
                status: 401,
                message: "Unauthorized",
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
});


module.exports = router;


