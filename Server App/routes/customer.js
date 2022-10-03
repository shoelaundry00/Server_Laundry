const express = require('express')
const router = express.Router()
const db = require('../db')
const { inputChecks, userNumberGenerator, throwError } = require('../helper')

const insertCustomerSQL = `INSERT INTO customer
(customer_id, customer_name, customer_phone_number, customer_email,
  customer_address, customer_create_id, customer_create_ip,
  customer_update_id, customer_update_ip, customer_note,
  customer_status) VALUES (?,?,?,?,?,?,?,?,?,?,?)
`

const updateCustomerSQL = `UPDATE customer SET customer_name=?, customer_phone_number=?, customer_email=?, customer_address=?, customer_update_ip=?, customer_update_date=?, customer_note=?,customer_status=? WHERE customer_id=?`

router.get('/get/:id?', async (req, res, next) => {
  const retVal = {
    status: 200,
  }

  try {
    const connection = await db
    const query = `SELECT * FROM customer WHERE customer_status = 1 ${
      req.params.id ? `AND customer_id = '${req.params.id}'` : ''
    }`
    const [rows] = await connection.query(query)

    retVal.data = rows
    return res.status(retVal.status).json(retVal)
  } catch (error) {
    return next(error)
  }
})

router.post('/create', async (req, res, next) => {
  const retVal = {
    status: 201,
  }
  const requiredInputs = ['name', 'phone_number', 'email', 'address', 'status']

  try {
    inputChecks(requiredInputs, req.body)

    const { name, phone_number, email, address, note, status } = req.body
    const create_ip = req.ip

    const connection = await db

    // Check unique email or phone number

    const [samePhoneNumber] = await connection.query(
      'SELECT * FROM customer WHERE customer_phone_number = ?',
      phone_number
    )

    const [sameEmail] = await connection.query(
      'SELECT * FROM customer WHERE customer_email = ?',
      email
    )

    const errorObject = {
      status: 400,
      messages: [],
      target: [],
    }

    if (samePhoneNumber.length > 0) {
      errorObject.messages.push('Nomor telepon sudah digunakan')
      errorObject.target.push('phoneNumber')
    }

    if (sameEmail.length > 0) {
      errorObject.messages.push('Email sudah digunakan')
      errorObject.target.push('email')
    }

    if (errorObject.messages.length === 0)
      throwError(errorObject.status, errorObject.messages, errorObject.target)

    const { id, createId, updateId } = await userNumberGenerator(
      connection,
      'customer',
      'C'
    )

    // Inserting
    await connection.query(insertCustomerSQL, [
      id,
      name,
      phone_number,
      email,
      address,
      createId,
      create_ip,
      updateId,
      create_ip,
      note ? note : null,
      status,
    ])

    // Select created customer for return value
    const [createdCustomer] = await connection.query(
      `select * from customer where customer_id='${id}'`
    )

    retVal.data = createdCustomer[0]

    return res.status(retVal.status).json(retVal)
  } catch (error) {
    return next(error)
  }
})

router.put('/update/:id', async (req, res, next) => {
  const retVal = {
    status: 200,
  }
  const requiredInputs = ['name', 'phone_number', 'email', 'address', 'status']

  try {
    inputChecks(requiredInputs, req.body)

    const { name, phone_number, email, address, notes, status } = req.body
    const ip = req.ip

    const connection = await db

    const [oldCustomer] = await connection.query(
      `SELECT * FROM customer WHERE customer_id=?`,
      req.params.id
    )

    // updating
    await connection.query(updateCustomerSQL, [
      name,
      phone_number,
      email,
      address,
      ip,
      new Date(),
      notes ? notes : oldCustomer.customer_note,
      status,
      req.params.id,
    ])

    // Select created customer for return value
    const [customer] = await connection.query(
      `select * from customer where customer_id='${req.params.id}'`
    )

    retVal.data = customer[0]

    return res.status(retVal.status).json(retVal)
  } catch (error) {
    return next(error)
  }
})

router.delete('/delete/:id', async (req, res, next) => {
  const retVal = {
    status: 200,
  }

  try {
    const connection = await db

    await connection.query(
      `UPDATE customer SET customer_status = 0 WHERE customer_id = '${req.params.id}'`
    )

    const [deletedcustomer] = await connection.query(
      `SELECT * FROM customer WHERE customer_id = '${req.params.id}'`
    )

    retVal.data = deletedcustomer[0]

    return res.status(retVal.status).json(retVal)
  } catch (error) {
    return next(error)
  }
})
module.exports = router
