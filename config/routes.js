const expressJoi = require('express-joi-validator');
const multiparty = require('connect-multiparty');
const multipartyMiddleware = multiparty();

const Schemas = require('../schemas/coupons-schema');
const AccessManager = require('../engine/access-manager');
const CouponManager = require('../engine/coupon-manager');
const OrderManager = require('../engine/orders-manager');


module.exports = function (app, passport) {

    /* PATHs */
    const indexPath = "/";
    const amPath    = indexPath + 'users/';
    const cmPath    = indexPath + 'coupons/';
    const ordPath   = indexPath + 'orders/';

    /* AUTH */
    const requireAuth = passport.authenticate('jwt', {session: false});
    const admin = '0';
    const producer = '1';
    const consumer = '2';
    const verifier = '3';
    const broker = '4';
    const all = [admin, producer, consumer, broker, verifier];

    /****************** ACCESS MANAGER ********************/
    app.post('/login', AccessManager.basicLogin);

    /****************** CRUD USERS ************************/
    app.post(amPath   + 'create/', AccessManager.createUser);        // Create
    app.get(amPath    + 'getFromToken/', requireAuth, AccessManager.roleAuthorization(all), AccessManager.getUserFromToken);  // Read by ID
    app.put(amPath    + 'update/', requireAuth, AccessManager.roleAuthorization(all), AccessManager.updateUser);        // Update
    app.delete(amPath + 'delete/', requireAuth, AccessManager.roleAuthorization([admin]), AccessManager.deleteUser);    // Delete
    app.get(amPath    + 'getProducerFromId/:producer_id', requireAuth, AccessManager.roleAuthorization(all), AccessManager.getProducerFromId);     // Read by ID
    app.get(amPath    + 'getBrokers/', requireAuth, AccessManager.roleAuthorization(all), AccessManager.getBrokers);  // Read all Broker

    /****************** CRUD COUPONS **********************/
    app.post(cmPath + 'create/', expressJoi(Schemas.createCouponSchema), requireAuth, AccessManager.roleAuthorization([producer, admin]), CouponManager.createCoupon); // Create
    app.get(cmPath + 'getById/:coupon_id', requireAuth, AccessManager.roleAuthorization([consumer, producer, admin]), CouponManager.getFromId); // Get a coupon by his ID
    app.get(cmPath + 'getPurchasedCoupons', requireAuth, AccessManager.roleAuthorization([consumer, admin]), CouponManager.getPurchasedCoupons);
    app.get(cmPath + 'getPurchasedCouponsById/:coupon_id', requireAuth, AccessManager.roleAuthorization([consumer, admin]), CouponManager.getPurchasedCouponsById);
    app.get(cmPath + 'getProducerCoupons/', requireAuth, AccessManager.roleAuthorization([producer, admin]), CouponManager.getProducerCoupons);
    app.get(cmPath + 'getAvailableCoupons/', requireAuth, AccessManager.roleAuthorization([consumer, admin, verifier]), CouponManager.getAvailableCoupons);
    app.put(cmPath + 'editCoupon/', expressJoi(Schemas.updateCouponSchema), requireAuth, AccessManager.roleAuthorization([producer, admin]), CouponManager.editCoupon);
    app.delete(cmPath + 'deleteCoupon/', requireAuth, AccessManager.roleAuthorization([producer, admin]), CouponManager.deleteCoupon);
    app.post(cmPath + 'addImage/', multipartyMiddleware, requireAuth, AccessManager.roleAuthorization([producer, admin]), CouponManager.addImage);
    app.put(cmPath + 'buyCoupons/', requireAuth, AccessManager.roleAuthorization([consumer]), CouponManager.buyCoupons);
    app.put(cmPath + 'importOfflineCoupon/', expressJoi(Schemas.validateCouponSchema), requireAuth, AccessManager.roleAuthorization([consumer]), CouponManager.importOfflineCoupon);
    app.put(cmPath + 'redeemCoupon/', requireAuth, AccessManager.roleAuthorization([verifier, producer, admin]), CouponManager.redeemCoupon);

    /****************** CRUD ORDERS *****************/
    app.get(ordPath + 'getOrdersByConsumer/', requireAuth, AccessManager.roleAuthorization([consumer, producer, admin]), OrderManager.getOrdersByConsumer);

    /****************** ERROR HANDLER *********************/
    // app.use(ErrorHandler.validationError);
    // app.use(ErrorHandler.fun404);


    app.use(function (err, req, res, next) {
        if (err.isBoom) {

            return res.status(err.output.statusCode).json(
                {
                    "Status Code": err.output.payload.statusCode,
                    "Type error": err.output.payload.error,
                    "message": err.data[0].context.label
                }
            );
        }
    });
};