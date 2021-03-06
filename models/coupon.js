'use strict';

module.exports = (sequelize, DataType) => {
    let Coupon = sequelize.define('Coupon', {
        id: {
            type: DataType.INTEGER(11),
            autoIncrement: true,
            primaryKey: true
        },
        title:        DataType.STRING(255),
        short_description: DataType.STRING(255),
        description:  DataType.STRING(55000),
        image:        DataType.STRING(100),
        timestamp:    DataType.DATE,
        price:        DataType.INTEGER(10),
        visible_from: DataType.DATE,
        valid_from:   DataType.DATE,
        valid_until:  DataType.DATE,
        purchasable:  DataType.INTEGER(11),
        constraints:  DataType.STRING(255),
        type:         DataType.INTEGER(1),
        owner:        DataType.INTEGER(11),
        is_broker:    DataType.INTEGER(1)
    }, {
        freezeTableName: true,
        timestamps: false,
        tableName: 'coupons'
    });

    Coupon.associate = function (models) {
        Coupon.hasMany(models.User, {foreignKey: 'id', sourceKey: 'owner'});
        Coupon.hasMany(models.CouponToken, {foreignKey: 'coupon_id', sourceKey: 'id'});
    };

    return Coupon;
};
