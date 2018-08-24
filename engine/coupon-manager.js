'use strict';

const Coupon = require('../models/index').Coupon;
const Op = require('../models/index').Sequelize.Op;
const HttpStatus = require('http-status-codes');
const fs = require('file-system');
const path = require('path');

exports.createCoupon = function (req, res, next) {

    const data = req.body;

    Coupon.create({
        title: data.title,
        description: data.description,
        image: data.image,
        timestamp: Number(Date.now()),
        price: data.price,
        valid_from: Number(data.valid_from),
        valid_until: Number(data.valid_until),
        state: data.state,
        constraints: data.constraints,
        owner: data.owner,
        consumer: data.consumer,
        quantity: data.quantity
    })
        .then(newCoupon => {
            return res.send({
                created: true,
                title: newCoupon.get('title'),
                description: newCoupon.get('description')
            });
        })
        .catch(err => {
            console.log("The coupon cannot be created.");
            return res.send(err);
        })

};

exports.getFromId = function (req, res, next) {

    Coupon.findById(req.params.coupon_id)
        .then(coupon => {
            if (coupon === null) {
                return res.status(HttpStatus.OK).json({
                    error: 'No coupon found with the given id',
                    coupon_id: req.params.coupon_id
                })
            }

            return res.status(HttpStatus.OK).json(coupon)
        })
        .catch(err => {
            console.log(err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
                error: err
            })
        });
};

exports.getAllByUser = function (req, res, next) {
    Coupon.findAll({
        where: {
            [Op.or]: [
                {owner: req.user.id},
                {consumer: req.user.id}
            ]
        }
    })
        .then(coupons => {
            console.log('coupons ',coupons)
            return res.status(HttpStatus.OK).json(coupons)
        })
        .catch(err => {
            console.log(JSON.stringify(err));
            // return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
            //     error: err
            // })
            return res.send(JSON.stringify(err));
        });
};

exports.getAffordables = function (req, res, next) {
    Coupon.findAll({
        where: {
            [Op.and]: [
                {
                    consumer: {
                        [Op.eq]: null    // coupon is not bought yet
                    }
                },
                {
                    valid_from: {
                        [Op.lte]: new Date()
                    }
                },
                {
                    valid_until: {
                        [Op.or]: [
                            { [Op.gte]: new Date() },
                            { [Op.eq]: null }
                        ]
                    }
                }
            ]
        }
    })
        .then(coupons => {
            return res.status(HttpStatus.OK).json(coupons)
        })
        .catch(err => {
            console.log(err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
                error: 'Cannot GET coupons affordable'
            })
        });

};

exports.update = function (req, res, next) {
    const data = req.body;

    Coupon.update({
        title: data.title,
        description: data.description,
        image: data.image,
        price: data.price,
        valid_from: Number(data.valid_from),
        valid_until: Number(data.valid_until),
        state: data.state,
        constraints: data.constraints,
        quantity: data.quantity
    }, {
        where: {
            [Op.and]: [
                {owner: req.user.id},
                {id: data.id}
            ]
        }
    })
        .then(couponUpdated => {
            return res.status(HttpStatus.OK).json({
                updated: true,
                coupon_id: data.id
            })
        })
        .catch(err => {
            console.log(err);

            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                updated: false,
                coupon_id: data.id,
                error: 'Cannot update the coupon'
            })
        });
};

exports.delete = function (req, res, next) {
    Coupon.destroy({
        where: {
            [Op.and]: [
                {id: req.body.id},
                {owner: req.user.id}
            ]
        }
    })
        .then(() => {
            return res.status(HttpStatus.OK).json({
                deleted: true,
                coupon: parseInt(req.body.id)
            })
        })
        .catch(err => {
            console.log(err);

            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                deleted: false,
                coupon: parseInt(req.body.id),
                error: 'Cannot delete the coupon'
            })
        })
};

exports.addImage = function (req, res, next) {
    console.log(req);

    fs.readFile(req.files.file.path, function (err, data) {
        // set the correct path for the file not the temporary one from the API:
        const file = req.files.file;
        file.path = path.join(__dirname, "../media/images/" + file.name);

        // copy the data from the req.files.file.path and paste it to file.path
        fs.writeFile(file.path, data, function (err) {
            if (err) {
                console.warn(err);

                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
                    name: 'Upload Image Error',
                    message: 'A problem occurred during upload of the image'
                })
            }

            return res.status(HttpStatus.CREATED).send({
                inserted: true,
                image: file.name,
                path: file.path
            });
        });
    });
};