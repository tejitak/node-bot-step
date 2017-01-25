'use strict'

class BotStep {

  /**
   * @param {Object} Model
   * @param {Object} handler
   * @param {String} dbSessionIdProp
   * @param {String} clientSessionIdProp
   */

  constructor (options) {
    this._options = options || {}
    // id for user session. it maybe room id
    this._dbSessionIdProp = this.options.dbSessionIdProp || 'botstep_db_session_id'
    this._clientSessionIdProp = this.options.clientSessionIdProp || 'botstep_client_session_id'
  }

  route (req, res, next) {
    // find related room from DB
    const context = new Context(this._options)
    return context
      .load({
        [this._dbSessionIdProp]: req.body[this._clientSessionIdProp]
      })
      .then((context) => {
        if (context && context.isEnabled()) {
          // call corresponding handler
          return context.execute({
            content: req.body
          })
        } else {
          // context not found
          return Promise.resolve({
            status: 'context_not_found'
          })
        }
      })
  }

  getModel () {
    return this._Model
  }

}

module.exports = BotStep