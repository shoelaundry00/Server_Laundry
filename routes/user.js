const express = require('express')
const router = express.Router()
const db = require('../db')
require('dotenv').config()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { inputChecks, generateUserID, throwError } = require('../helper')

const insertEmployeeLoginSQL = `INSERT INTO employee_login(employee_login_id, FK_employee_id, employee_login_ip, employee_login_status, employee_login_create_id, employee_login_create_ip, employee_login_update_id, employee_login_update_ip) VALUES (?,?,?,?,?,?,?,?)`
const updateEmployeeLoginSQL = `UPDATE employee_login SET employee_login_status=?, employee_login_update_id=?, employee_login_update_date=?, employee_login_update_ip=? WHERE FK_employee_id=? AND employee_login_status=1`

// Employee Login
router.post('/login', async (req, res, next) => {
  const retVal = {
    status: 200,
  }

  const requiredInputs = ['username', 'password']

  const connection = await db.getConnection()
  try {
    inputChecks(requiredInputs, req.body, true)

    const { username, password } = req.body

    const ip = req.ip

    let query = `SELECT * FROM employee WHERE employee_username = '${username}' AND employee_status = 1`

    const [employeeResult] = await connection.query(query)

    if (employeeResult.length === 0) {
      throwError(404, 'Username tidak terdaftar', 'username')
    }
    const employee = employeeResult[0]

    const isValidPass = await bcrypt.compare(
      password,
      employee.employee_password
    )
    if (!isValidPass) throwError(404, 'Password salah', 'password')

    const id = await generateUserID(connection, 'employee_login', 'L')

    await connection.query(updateEmployeeLoginSQL, [
      0,
      employee.employee_id,
      new Date(),
      ip,
      employee.employee_id,
    ])

    await connection.query(insertEmployeeLoginSQL, [
      id,
      employee.employee_id,
      ip,
      1,
      employee.employee_id,
      ip,
      employee.employee_id,
      ip,
    ])

    const token = jwt.sign(
      { employee_id: employee.employee_id },
      process.env.APP_SECRET
    )

    employee.employee_token = token

    retVal.data = employee

    connection.destroy()
    return res.status(retVal.status).json(retVal)
  } catch (error) {
    connection.destroy()
    return next(error)
  }
})

router.post('/logout/:id', async (req, res, next) => {
  const retVal = {
    status: 200,
  }

  const connection = await db.getConnection()
  try {
    const ip = req.ip

    let query = `SELECT * FROM employee WHERE employee_id = '${req.params.id}' AND employee_status = 1`
    const [employeeResult] = await connection.query(query)

    if (employeeResult.length === 0) {
      throwError(400, 'Invalid ID')
    }
    const employee = employeeResult[0]

    // TODO: Update Table User Login
    await connection.query(updateEmployeeLoginSQL, [
      0,
      employee.employee_id,
      new Date(),
      ip,
      employee.employee_id,
    ])

    retVal.data = employee
    connection.destroy()
    return res.status(retVal.status).json(retVal)
  } catch (error) {
    connection.destroy()
    return next(error)
  }
})

module.exports = router
