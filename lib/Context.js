'use strict'

/**
 *
 * context will be created and discarded per request
 * this is a wrapper for DB entry that manages steps
 * - botstep_current_topic_id: String eg. 'questions_1'
 * - botstep_topic_result: Object eg. {'<topic_id>': {completed :true}, ...}
 * - botstep_enabled: Boolean
 */

class Context {

  constructor (options) {
    options = options || {}
    this._Model = options.Model
    this._handler = options.handler
  }

  load (query) {
    return this._Model
      .findOne(query)
      .exec()
      .then((entry) => {
        if (!entry) {
          return Promise.resolve(null)
        } else {
          this._entry = entry
          return Promise.resolve(this)
        }
      })
  }

  execute (options) {
    const content = options.content
    const currentTopicId = this.getCurrentTopicId()
    // invoke the current topic method
    return this._handler[currentTopicId](content)
      .then((result) => {
        result = result || {completed: true, completed_at: Date.now()}
        this._entry.botstep_topic_result[currentTopicId] = result
        return this._entry.save()
      })
  }

  getCurrentTopicId () {
    return this._entry && this._entry.botstep_current_topic_id
  }

  getCurrentTopicResult () {
    const currentTopic = this.getCurrentTopicId()
    return this._entry && this._entry.botstep_topic_result[currentTopic]
  }

  enable () {
    this._entry.botstep_enabled = true
    return this._entry.save()
  }

  disable () {
    this._entry.botstep_enabled = false
    return this._entry.save()
  }

  isEnabled () {
    return this._entry && this._entry.botstep_enabled
  }
}

module.exports = Context
