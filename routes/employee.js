const express = require('express')
const serverless = require("serverless-http")
const router = express.Router()
const db = require('../db')
require('dotenv').config()
const bcrypt = require('bcryptjs')
const { inputChecks, userNumberGenerator, throwError } = require('../helper')
const insertEmployeeSQL = `INSERT INTO employee (employee_id, employee_name, employee_username, employee_password, employee_create_id, employee_create_ip, employee_update_id, employee_update_ip, employee_note, employee_status) VALUES (?,?,?,?,?,?,?,?,?,?)`
const updateEmployeeSQL = `UPDATE employee SET employee_name=?, employee_password=?, employee_update_ip=?, employee_update_date=?, employee_note=?, employee_status=? WHERE employee_id=?`
const insertEmployeePrivilegeSQL = `INSERT INTO employee_privilege (employee_privilege_id, employee_privilege_create_id, employee_privilege_create_ip, employee_privilege_update_id, employee_privilege_update_ip, employee_privilege_note, employee_privilege_status, FK_employee_id, FK_privilege_id) VALUES (?,?,?,?,?,?,?,?,?)`
const insertEmployeeLoginSQL = `INSERT INTO employee_login (employee_login_id, FK_employee_id, employee_login_ip, employee_login_status, employee_login_create_id, employee_login_update_id) VALUES (?,?,?,?,?,?)`
const updateEmployeeLoginSQL = `UPDATE employee_login SET employee_login_status=?, employee_login_update_id=?, employee_login_update_date=? WHERE FK_employee_id=? AND employee_login_status=1`

// Employee Login
router.post('/login', async (req, res, next) => {
  const retVal = {
    status: 200,
  }

  const requiredInputs = ['username', 'password']

  try {
    inputChecks(requiredInputs, req.body, true)

    const { username, password } = req.body

    const ip = req.ip

    const connection = await db

    let query = `SELECT * FROM employee WHERE employee_username = '${username}'`

    const [employeeResult] = await connection.query(query)

    const { id, createId, updateId } = await userNumberGenerator(
      connection,
      'employee_login',
      'L'
    )

    await connection.query(updateEmployeeLoginSQL, [
      0,
      updateId,
      new Date(),
      employeeResult[0].employee_id,
    ])

    if (employeeResult.length === 0) {
      return res.status(404).json({
        status: 404,
        target: 'username',
        message: 'Username tidak terdaftar',
      })
    }
    const employee = employeeResult[0]
    const isValidPass = await bcrypt.compare(
      password,
      employee.employee_password
    )
    if (!isValidPass) throwError(404, 'Password salah', 'password')

    // TODO: Update Table User Login
    await connection.query(insertEmployeeLoginSQL, [
      id,
      employee.employee_id,
      ip,
      1,
      createId,
      updateId
    ])

    retVal.data = employee
    return res.status(retVal.status).json(retVal)
  } catch (error) {
    return next(error)
  }
})

router.post('/logout/:id', async (req, res, next) => {
  const retVal = {
    status: 200,
  }

  try {
    const connection = await db

    const { updateId } = await userNumberGenerator(
      connection,
      'employee_login',
      'L'
    )

    let query = `SELECT * FROM employee_login WHERE employee_login_status=1 AND FK_employee_id = '${req.params.id}'`
    const [employeeResult] = await connection.query(query)

    if (employeeResult.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'ID invalid',
      })
    }
    const employee = employeeResult[0]

    // TODO: Update Table User Login
    await connection.query(updateEmployeeLoginSQL, [
      0,
      updateId,
      new Date(),
      employee.employee_id,
    ])

    retVal.data = employee
    return res.status(retVal.status).json(retVal)
  } catch (error) {
    return next(error)
  }
})

// Get Employee
router.get('/get/:id?', async (req, res, next) => {
  const retVal = {
    status: 200,
  }

  try {
    const connection = await db
    const query = `SELECT * FROM employee WHERE employee_status = 1${
      req.params.id ? `AND employee_id = '${req.params.id}'` : ''
    }`
    const [rows] = await connection.query(query)

    for (let i = 0; i < rows.length; i++) {
      const employee = rows[i]
      const [privileges] = await connection.query(
        `select p.* from privilege p join employee_privilege e on p.privilege_id = e.FK_privilege_id where e.FK_employee_id = '${employee.employee_id}'`
      )
      employee.employee_privileges = privileges
    }

    retVal.data = rows
    return res.status(retVal.status).json(retVal)
  } catch (error) {
    return next(error)
  }
})

// Insert Employee
router.post('/create', async (req, res, next) => {
  const retVal = {
    status: 201,
  }
  const requiredInputs = ['name', 'username', 'password']

  const connection = await db
  try {
    inputChecks(requiredInputs, req.body)

    const { name, username, password, note, privileges } = req.body
    const create_ip = req.ip

    const [employees] = await connection.query(
      `SELECT * FROM employee where employee_username = '${username}'`
    )
    if (employees.length !== 0) {
      // Jika username sudah digunakan
      // return res.status(retVal.status).json({ target: 'username', message: 'Username sudah digunakan'});
      throwError(400, 'Username sudah digunakan', 'username')
    }

    // Jika unique, create user
    await connection.beginTransaction()
    const {
      id: employeeId,
      createId: employeeCreateId,
      updateId: employeeUpdateId,
    } = await userNumberGenerator(connection, 'employee', 'E')
    await connection.query(insertEmployeeSQL, [
      employeeId,
      name,
      username,
      await bcrypt.hash(password, 10),
      employeeCreateId,
      create_ip,
      employeeUpdateId,
      create_ip,
      note ? note : null,
      true,
    ])

    const userPrivileges = []
    const isArray = Array.isArray(privileges)
    for (let i = 0; i < (isArray ? privileges.length : 1); i++) {
      const privilege = isArray ? privileges[i] : privileges
      const [rows] = await connection.query(
        `SELECT * FROM privilege WHERE privilege_id = '${privilege}'`
      )

      if (rows.length === 0) {
        throwError(400, 'Privileges tidak valid.', '', true)
      }
      userPrivileges.push(rows[0])
    }

    // Insert user_privilege
    for (let i = 0; i < (isArray ? privileges.length : 1); i++) {
      const privilege = isArray ? privileges[i] : privileges

      // Creating IDs
      const {
        id: employeePrivilegeid,
        createId: employeePrivilegeCreateId,
        updateId: employeePrivilegeUpdateId,
      } = await userNumberGenerator(connection, 'employee_privilege', 'EP')

      await connection.query(insertEmployeePrivilegeSQL, [
        employeePrivilegeid,
        employeePrivilegeCreateId,
        create_ip,
        employeePrivilegeUpdateId,
        create_ip,
        null,
        1,
        employeeId,
        privilege,
      ])
    }
    await connection.commit()

    const [selectedEmployee] = await connection.query(
      'SELECT * FROM employee WHERE employee_id = ?',
      employeeId
    )

    retVal.data = {
      ...selectedEmployee[0],
      employee_privileges: userPrivileges,
    }

    return res.status(retVal.status).json(retVal)
  } catch (error) {
    await connection.rollback()
    return next(error)
  }
})

// Update Employee
router.put('/update/:id', async (req, res, next) => {
  const retVal = {
    status: 200,
  }
  // const requiredInputs = ['name', 'status', 'privileges']

  const connection = await db
  try {
    // inputChecks(requiredInputs, req.body)

    const { name, password, note, privileges } = req.body
    const ip = req.ip

    await connection.beginTransaction()
    const [employee] = await connection.query(
      `SELECT * FROM employee where employee_id = '${req.params.id}'`
    )
    if (employee.length === 0) {
      // Jika id salah
      throwError(404, 'ID tidak ditemukan')
    }

    await connection.query(updateEmployeeSQL, [
      name,
      password
        ? await bcrypt.hash(password, 10)
        : employee[0].employee_password,
      ip,
      new Date(),
      note ? note : employee[0].employee_note,
      true,
      req.params.id,
    ])

    // get employee privileges
    const [userPrivileges] = await connection.query(
      `select e.* from privilege p join employee_privilege e on p.privilege_id = e.FK_privilege_id where e.FK_employee_id = '${req.params.id}'`
    )

    // const employeePrivileges = employeePrivilegesQuery.map((privilege) => {
    //   return {
    //     id: privilege.employee_privilege_id,
    //     privilegeId: privilege.FK_privilege_id,
    //     status: privilege.employee_privilege_status,
    //   }
    // })

    // for (let i = 0; i < employeePrivileges.length; i++) {
    //   const employeePrivilege = employeePrivileges[i]

    //   const found = privileges.find(
    //     (privilege) => privilege === employeePrivilege.privilegeId
    //   )
    //   if (!found)
    //     userPrivileges.push({
    //       id: employeePrivilege.privilegeId,
    //       type: 'delete',
    //     })
    // }

    // Check if input privileges is valid
    const isArray = Array.isArray(privileges)
    const endPrivileges = []
    for (let i = 0; i < (isArray ? privileges.length : 1); i++) {
      const privilege = isArray ? privileges[i] : privileges
      const [rows] = await connection.query(
        `SELECT * FROM privilege WHERE privilege_id = '${privilege}'`
      )

      if (rows.length === 0) {
        throwError(400, 'Privileges tidak valid.', '', true)
      }

      let actionType = 'insert'

      const found = userPrivileges.find(
        (employeePrivilege) => employeePrivilege.FK_privilege_id == privilege
      )

      if (found) {
        actionType = '-'
        if (found.employee_privilege_status === 0) {
          actionType = 'update'
        }
      }

      endPrivileges.push({
        id: privilege,
        type: actionType,
      })
    }

    for (var i = 0; i < userPrivileges.length; i++) {
      const found = privileges.find(
        (privilege) => privilege == userPrivileges[i].FK_privilege_id
      )

      if (!found) {
        endPrivileges.push({
          id: userPrivileges[i].FK_privilege_id,
          type: 'delete',
        })
      }
    }

    // Update or insert employee_privilege
    for (let i = 0; i < endPrivileges.length; i++) {
      const privilege = endPrivileges[i]
      if (privilege.type === 'insert') {
        const {
          id: employeePrivilegeid,
          createId: employeePrivilegeCreateId,
          updateId: employeePrivilegeUpdateId,
        } = await userNumberGenerator(connection, 'employee_privilege', 'EP')

        await connection.query(insertEmployeePrivilegeSQL, [
          employeePrivilegeid,
          employeePrivilegeCreateId,
          ip,
          employeePrivilegeUpdateId,
          ip,
          null,
          1,
          req.params.id,
          privilege.id,
        ])
      } else if (privilege.type === 'update') {
        await connection.query(
          `UPDATE employee_privilege SET employee_privilege_status = 1, employee_privilege_update_date=? WHERE FK_privilege_id = '${privilege.id}'`,
          new Date()
        )
      } else if (privilege.type === 'delete') {
        await connection.query(
          `UPDATE employee_privilege SET employee_privilege_status = 0, employee_privilege_update_date=? WHERE FK_privilege_id = '${privilege.id}'`,
          new Date()
        )
      }
    }

    await connection.commit()

    const [selectedEmployee] = await connection.query(
      'SELECT * FROM employee WHERE employee_id = ?',
      req.params.id
    )

    const [retPrivileges] = await connection.query(
      `select p.* from privilege p join employee_privilege e on p.privilege_id = e.FK_privilege_id where e.FK_employee_id = '${req.params.id}'`
    )

    retVal.data = {
      ...selectedEmployee[0],
      employee_privileges: retPrivileges,
    }

    return res.status(retVal.status).json(retVal)
  } catch (error) {
    await connection.rollback()
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
      `UPDATE employee SET employee_status = 0 WHERE employee_id = '${req.params.id}'`
    )

    const [deletedEmployee] = await connection.query(
      `SELECT * FROM employee WHERE employee_id = '${req.params.id}'`
    )

    retVal.data = deletedEmployee[0]

    return res.status(retVal.status).json(retVal)
  } catch (error) {
    return next(error)
  }
})

module.exports = router
module.exports.handler=serverless(router)
