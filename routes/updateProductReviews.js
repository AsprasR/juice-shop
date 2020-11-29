/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const db = require('../data/mongodb')
const insecurity = require('../lib/insecurity')
const sanitize = require('mongo-sanitize')

module.exports = function productReviews () {
  return (req, res, next) => {
    const user = insecurity.authenticatedUsers.from(req)
    var id = sanitize(req.body.id);
    var message = sanitize(req.body.message);
    db.reviews.update(
      { _id: id },
      { $set: { message: message } },
      { multi: true }
    ).then(
      result => {
        utils.solveIf(challenges.noSqlReviewsChallenge, () => { return result.modified > 1 })
        utils.solveIf(challenges.forgedReviewChallenge, () => { return user && user.data && result.original.length != 0 && result.original[0].author !== user.data.email && result.modified === 1 })
        res.json(result)
      }, err => {
        res.status(500).json(err)
      })
  }
}
