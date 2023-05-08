"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.add = void 0;
async function add(_db) {
    const user_1 = await _db.user.create({
        email: "user1@email.com",
        password: "password"
    });
    const user_2 = await _db.user.create({
        email: "user2@email.com",
        password: "password"
    });
    const artwork_1 = await _db.artwork.create({
        id: 22736,
        userId: user_1.getDataValue("id")
    });
}
exports.add = add;
;
