const dayjs = require('dayjs')

require('dotenv').config()

/**
 * Check for inputs inside req.body.
 *
 * This function fails if one of the inputs is missing or null
 * @param {Array} inputs - List of inputs to check
 * @param {Object} body - req.body
 * @param {Boolean} [isStrict = false] - (False by default) if true, will return false if there are other property in body
 * @param {Object} customError - Custom Error object to throw if function fails
 *
 * NB: This function also fails if body doesn't have anything
 */

function inputChecks(
  inputs,
  body,
  isStrict = false,
  customError = {
    status: 400,
    customMessage: `Input ada yang kurang`,
  }
) {
  if (Object.keys(body).length === 0) throw customError

  const missingInputs = []
  const isAllInputsExist = inputs.every((value) => {
    if (value in body) {
      return true
    }

    missingInputs.push(value)
    return false
  })
  if (!isAllInputsExist)
    throwError(
      customError.status,
      `${customError.customMessage}: [${missingInputs.join(',')}].`,
      '',
      true
    )

  for (const key in body) {
    if (!body[key] && body[key] !== false) missingInputs.push(key)
  }

  if (missingInputs.length > 0) {
    throwError(
      customError.status,
      `${customError.customMessage}: [${missingInputs.join(',')}].`,
      '',
      true
    )
  }

  if (isStrict && Object.keys(body).length != inputs.length)
    throwError(customError.status, `Banyak input tidak sesuai.`, '', true)

  return true
}

/**
 * Generate id, createId, and updateId
 * @param {Connection} connection - DB Connection
 * @param {String} tableName - Name of the table
 * @param {String} prefixId - String at the start of the id
 * @returns {String} id, createId, and updateId
 */

async function userNumberGenerator(connection, tableName, prefixId) {
  let dateString = dayjs().format('DDMMYY')
  let query = `SELECT * FROM ${tableName} WHERE ${tableName}_id like '${prefixId}${dateString}%'`
  const [rows] = await connection.query(query)

  // Creating IDs
  const userNumber = `${dateString}${`${rows.length + 1}`.padStart(
    4 - prefixId.length + 1,
    '0'
  )}`
  return {
    id: `${prefixId}${userNumber}`,
    createId: `${prefixId}C${userNumber}`,
    updateId: `${prefixId}U${userNumber}`,
  }
}

/**
 * Helper to throw error.
 *
 * Error thrown will get caught by the express error handler
 *
 * Example:
 *
 *     throwError(404, 'user not found');
 *
 * @param {Number} statusCode - HTTP response status code, refer to https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 * @param {String} message - Error message
 * @param {Boolean} addDocumentation - Add Documentation URL to message
 *
 */

function throwError(
  statusCode,
  message,
  target = '',
  addDocumentation = false
) {
  throw {
    status: statusCode,
    customTarget: target,
    customMessage: `${message} ${
      addDocumentation
        ? `Tolong baca ${process.env.DOCUMENTATION_URL} untuk informasi lebih lanjut.`
        : ''
    }`,
  }
}

module.exports = {
  inputChecks,
  userNumberGenerator,
  throwError,
}
