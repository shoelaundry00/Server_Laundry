// Customer
const dropCustomerTableSQL = 'DROP TABLE IF EXISTS customer'
const createCustomerTableSQL = `CREATE TABLE customer (
  customer_id VARCHAR(11) NOT NULL,
  PRIMARY KEY (customer_id),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone_number VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_address TEXT NOT NULL,
  customer_create_id VARCHAR(12) NOT NULL,
  customer_create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  customer_create_ip VARCHAR(15) NOT NULL,
  customer_update_id VARCHAR(12) DEFAULT NULL,
  customer_update_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  customer_update_ip VARCHAR(15) DEFAULT NULL,
  customer_note TEXT DEFAULT NULL,
  customer_status BOOLEAN NOT NULL
)`
const initialCustomerSQL = `INSERT INTO customer (customer_id, customer_name, customer_phone_number, customer_email, customer_address, customer_create_id, customer_create_date, customer_create_ip, customer_update_id, customer_update_date, customer_update_ip, customer_note, customer_status) VALUES
('C3107220001', 'Christian Zamorano Setiawan', '081235250435', 'zamoranochristian7@gmail.com', 'Rungkut Mapan Tengah III CC/11a', 'CC3107220001', '2022-07-31', '192.168.18.36', NULL, NULL, NULL, NULL, 1)`

// DTrans
const dropDTransTableSQL = 'DROP TABLE IF EXISTS d_trans'
const createDTransTableSQL = `CREATE TABLE d_trans (
  d_trans_id VARCHAR(11) NOT NULL,
  PRIMARY KEY (d_trans_id),
  d_trans_create_id VARCHAR(12) NOT NULL,
  d_trans_create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  d_trans_create_ip VARCHAR(15) NOT NULL,
  d_trans_update_id VARCHAR(12) DEFAULT NULL,
  d_trans_update_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  d_trans_update_ip VARCHAR(15) DEFAULT NULL,
  d_trans_note TEXT DEFAULT NULL,
  d_trans_done BOOLEAN NOT NULL,
  d_trans_quantity INT NOT NULL,
  d_trans_subtotal BIGINT(20) NOT NULL,
  d_trans_status BOOLEAN NOT NULL,
  FK_h_product_id VARCHAR(11) NOT NULL,
  FK_employee_id VARCHAR(11) DEFAULT NULL,
  FK_h_trans_id VARCHAR(11) NOT NULL
)`
const insertDTransSQL = `INSERT INTO d_trans (d_trans_id, d_trans_create_id, d_trans_create_date, d_trans_create_ip, d_trans_update_id, d_trans_update_date, d_trans_update_ip, d_trans_note, d_trans_done, d_trans_quantity, d_trans_subtotal, d_trans_status, FK_h_product_id, FK_employee_id, FK_h_trans_id) VALUES ?`
const initialDTransSQL = `INSERT INTO d_trans (d_trans_id, d_trans_create_id, d_trans_create_date, d_trans_create_ip, d_trans_update_id, d_trans_update_date, d_trans_update_ip, d_trans_note, d_trans_done, d_trans_quantity, d_trans_subtotal, d_trans_status, FK_h_product_id, FK_employee_id, FK_h_trans_id) VALUES
('DT100922001', 'DTC100922001', '2022-09-10', '::1', NULL, '2022-09-10', NULL, 'data dummy', 0, 1, 15000, 1, 'HP310722001', NULL, 'T1009220001'),
('DT310722001', 'DTC310722001', '2022-07-31', '192.168.18.36', NULL, NULL, NULL, NULL, 0, 1, 15000, 1, 'HP310722001', NULL, 'T3107220001'),
('DT310722002', 'DTC310722002', '2022-07-31', '192.168.18.36', NULL, NULL, NULL, NULL, 0, 1, 15000, 1, 'HP310722002', NULL, 'T3107220001')`

// HTrans
const dropHTransTableSQL = 'DROP TABLE IF EXISTS h_trans'
const createHTransTableSQL = `CREATE TABLE h_trans (
  h_trans_id VARCHAR(11) NOT NULL,
  PRIMARY KEY (h_trans_id),
  h_trans_main_photo VARCHAR(255) DEFAULT NULL,
  h_trans_main_note TEXT DEFAULT NULL,
  h_trans_top_photo VARCHAR(255) DEFAULT NULL,
  h_trans_top_note TEXT DEFAULT NULL,
  h_trans_left_photo VARCHAR(255) DEFAULT NULL,
  h_trans_left_note TEXT DEFAULT NULL,
  h_trans_right_photo VARCHAR(255) DEFAULT NULL,
  h_trans_right_note TEXT DEFAULT NULL,
  h_trans_below_photo VARCHAR(255) DEFAULT NULL,
  h_trans_below_note TEXT DEFAULT NULL,
  h_trans_total BIGINT(20) NOT NULL,
  h_trans_create_id VARCHAR(12) NOT NULL,
  h_trans_create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  h_trans_create_ip VARCHAR(15) NOT NULL,
  h_trans_update_id VARCHAR(12) DEFAULT NULL,
  h_trans_update_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  h_trans_update_ip VARCHAR(15) DEFAULT NULL,
  h_trans_note TEXT DEFAULT NULL,
  h_trans_progress TINYINT(1) DEFAULT 0,
  h_trans_status BOOLEAN NOT NULL,
  FK_customer_id VARCHAR(11) NOT NULL,
  FK_promo_id VARCHAR(11) DEFAULT NULL
)`
const initialHTransSQL = `INSERT INTO h_trans (h_trans_id, h_trans_main_photo, h_trans_main_note, h_trans_top_photo, h_trans_top_note, h_trans_left_photo, h_trans_left_note, h_trans_right_photo, h_trans_right_note, h_trans_below_photo, h_trans_below_note,h_trans_total, h_trans_create_id, h_trans_create_date, h_trans_create_ip, h_trans_update_id, h_trans_update_date, h_trans_update_ip, h_trans_note, h_trans_status, FK_customer_id, FK_promo_id) VALUES
('T3107220001', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100000, 'TC3107220001', '2022-07-31', '192.168.18.36', NULL, NULL, NULL, NULL, 1, 'C3107220001',NULL),
('T1009220001', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 250000, 'TC1009220001', '2022-09-10', '::1', NULL, '2022-09-10', NULL, 'data dummy coba api', 1, 'C3107220001',NULL)`

// Promo
const dropPromoTableSQL = 'DROP TABLE IF EXISTS promo'
const createPromoTableSQL = `CREATE TABLE promo (
  promo_id VARCHAR(11) NOT NULL,
  PRIMARY KEY (promo_id),
  promo_name VARCHAR(255) NOT NULL,
  promo_description TEXT NOT NULL,
  promo_value BIGINT(20) NOT NULL,
  promo_is_percentage BOOLEAN DEFAULT 1,
  promo_min_total BIGINT(20) DEFAULT NULL,
  promo_max_discount BIGINT(20) DEFAULT NULL,
  promo_create_id VARCHAR(12) NOT NULL,
  promo_create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  promo_create_ip VARCHAR(15) NOT NULL,
  promo_update_id VARCHAR(12) DEFAULT NULL,
  promo_update_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  promo_update_ip VARCHAR(15) DEFAULT NULL,
  promo_note TEXT DEFAULT NULL,
  promo_status BOOLEAN NOT NULL
)`
const initialPromoSQL = `
  INSERT INTO promo (promo_id, promo_name, promo_description, promo_value, promo_is_percentage, promo_min_total, promo_max_discount, promo_create_id, promo_create_ip, promo_update_id, promo_update_ip, promo_note, promo_status) VALUES
  ('PR170922001', 'Promo Natal', 'Promo khusus hari natal', 15, 1, 100000, 15000, 'PRC170922001', '::1', 'PRU170922001', '::1', NULL, 1),
  ('PR170922002', 'Promo Mingguan', 'Promo sekali per minggu', 5, 1, NULL, 35000, 'PRC170922002', '::1', 'PRU170922002', '::1', NULL, 1),
  ('PR170922003', 'Promo Harian', 'Promo sekali per hari', 5000, 0, NULL, NULL, 'PRC170922003', '::1', 'PRU170922003', '::1', NULL, 1)
`

// HProduct
const dropHProductTableSQL = 'DROP TABLE IF EXISTS h_product'
const createHProductTableSQL = `CREATE TABLE h_product (
  h_product_id VARCHAR(11) NOT NULL,
  PRIMARY KEY (h_product_id),
  h_product_price BIGINT(20) NOT NULL,
  h_product_create_id VARCHAR(12) NOT NULL,
  h_product_create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  h_product_create_ip VARCHAR(15) NOT NULL,
  h_product_update_id VARCHAR(12) DEFAULT NULL,
  h_product_update_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  h_product_update_ip VARCHAR(15) DEFAULT NULL,
  h_product_note TEXT DEFAULT NULL,
  h_product_status BOOLEAN NOT NULL,
  FK_product_id VARCHAR(11) NOT NULL
)`
const insertHProductSQL = `INSERT INTO h_product (h_product_id, h_product_price, h_product_create_id, h_product_create_date, h_product_create_ip, h_product_update_id, h_product_update_date, h_product_update_ip, h_product_note, h_product_status, FK_product_id) VALUES ?`
const initialHProductSQL = `INSERT INTO h_product (h_product_id, h_product_price, h_product_create_id, h_product_create_date, h_product_create_ip, h_product_update_id, h_product_update_date, h_product_update_ip, h_product_note, h_product_status, FK_product_id) VALUES
('HP310722001', 25000, 'HPC310722001', '2022-07-31', '192.168.18.36', NULL, NULL, NULL, NULL, 1, 'P3107220001'),
('HP310722002', 75000, 'HPC310722002', '2022-07-31', '192.168.18.36', NULL, NULL, NULL, NULL, 1, 'P3107220002')`

// Privilege
const dropPrivilegeTableSQL = 'DROP TABLE IF EXISTS privilege'
const createPrivilegeTableSQL = `CREATE TABLE privilege (
  privilege_id VARCHAR(11) NOT NULL,
  PRIMARY KEY (privilege_id),
  privilege_name TEXT NOT NULL,
  privilege_create_id VARCHAR(12) NOT NULL,
  privilege_create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  privilege_create_ip VARCHAR(15) NOT NULL,
  privilege_update_id VARCHAR(12) DEFAULT NULL,
  privilege_update_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  privilege_update_ip VARCHAR(15) DEFAULT NULL,
  privilege_note TEXT DEFAULT NULL,
  privilege_status BOOLEAN NOT NULL
)`
const initialPrivilegeSQL = `INSERT INTO privilege (privilege_id, privilege_name, privilege_create_id, privilege_create_date, privilege_create_ip, privilege_update_id, privilege_update_date, privilege_update_ip, privilege_note, privilege_status) VALUES
('PR310722001', 'Administrator', 'PRC310722001', '2022-07-31', '192.168.18.36', NULL, NULL, NULL, NULL, 1),
('PR310722002', 'View Customer', 'PRC310722002', '2022-07-31', '192.168.18.36', NULL, NULL, NULL, NULL, 1),
('PR310722003', 'Create Customer', 'PRC310722003', '2022-07-31', '192.168.18.36', NULL, NULL, NULL, NULL, 1),
('PR310722004', 'Update Customer', 'PRC310722004', '2022-07-31', '192.168.18.36', NULL, NULL, NULL, NULL, 1),
('PR310722005', 'Delete Customer', 'PRC310722005', '2022-07-31', '192.168.18.36', NULL, NULL, NULL, NULL, 1),
('PR310722006', 'View Produk', 'PRC310722006', '2022-07-31', '192.168.18.36', NULL, NULL, NULL, NULL, 1),
('PR310722007', 'Create Produk', 'PRC310722007', '2022-07-31', '192.168.18.36', NULL, NULL, NULL, NULL, 1),
('PR310722008', 'Update Produk', 'PRC310722008', '2022-07-31', '192.168.18.36', NULL, NULL, NULL, NULL, 1),
('PR310722009', 'Delete Produk', 'PRC310722009', '2022-07-31', '192.168.18.36', NULL, NULL, NULL, NULL, 1),
('PR310722010', 'View Jasa', 'PRC310722010', '2022-07-31', '192.168.18.36', NULL, NULL, NULL, NULL, 1),
('PR310722011', 'Create Jasa', 'PRC310722011', '2022-07-31', '192.168.18.36', NULL, NULL, NULL, NULL, 1),
('PR310722012', 'Update Jasa', 'PRC310722012', '2022-07-31', '192.168.18.36', NULL, NULL, NULL, NULL, 1),
('PR310722013', 'Delete Jasa', 'PRC310722013', '2022-07-31', '192.168.18.36', NULL, NULL, NULL, NULL, 1)`

// Product
const dropProductTableSQL = 'DROP TABLE IF EXISTS product'
const createProductTableSQL = `CREATE TABLE product (
  product_id VARCHAR(11) NOT NULL,
  PRIMARY KEY (product_id),
  product_name VARCHAR(255) NOT NULL,
  product_type VARCHAR(255) NOT NULL,
  product_price BIGINT(20) NOT NULL,
  product_brand VARCHAR(255) DEFAULT NULL,
  product_stock int(11) NOT NULL,
  product_category TEXT NOT NULL,
  product_create_id VARCHAR(12) NOT NULL,
  product_create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  product_create_ip VARCHAR(15) NOT NULL,
  product_update_id VARCHAR(12) DEFAULT NULL,
  product_update_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  product_update_ip VARCHAR(15) DEFAULT NULL,
  product_note TEXT DEFAULT NULL,
  product_status BOOLEAN NOT NULL
)`
const insertProductSQL = `INSERT INTO product (product_id, product_name, product_type, product_price, product_brand, product_stock, product_category, product_create_id, product_create_date, product_create_ip, product_update_id, product_update_date, product_update_ip, product_note, product_status) VALUES ?`
const initialProductSQL = `INSERT INTO product (product_id, product_name, product_type, product_price, product_brand, product_stock, product_category, product_create_id, product_create_date, product_create_ip, product_update_id, product_update_date, product_update_ip, product_note, product_status) VALUES
('P1209220001', 'Tali Sepatu', 'produk', 150000, 'nike', 50, 'aksesoris', 'PC120922001', '2022-09-12', '::1', NULL, '2022-09-12', NULL, 'data dummy', 1),
('P1209220002', 'Steam Dry', 'jasa', 60000, NULL, 5, 'drying', 'PC120922002', '2022-09-12', '::1', NULL, '2022-09-12', NULL, 'data dummy', 1),
('P3107220001', 'Wax', 'produk', 25000, 'kiwi', 50, 'habis pakai', 'PC310722001', '2022-07-31', '192.168.18.36', NULL, NULL, NULL, NULL, 1),
('P3107220002', 'Deep Wash', 'jasa', 75000, NULL, 10, 'washing', 'PC310722002', '2022-07-31', '192.168.18.36', NULL, NULL, NULL, NULL, 1)`

// Employee
const dropEmployeeTableSQL = 'DROP TABLE IF EXISTS employee'
const createEmployeeTableSQL = `CREATE TABLE employee (
  employee_id VARCHAR(11) NOT NULL,
  PRIMARY KEY (employee_id),
  employee_name VARCHAR(255) NOT NULL,
  employee_username VARCHAR(255) NOT NULL,
  employee_password VARCHAR(255) NOT NULL,
  employee_create_id VARCHAR(12) NOT NULL,
  employee_create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  employee_create_ip VARCHAR(15) NOT NULL,
  employee_update_id VARCHAR(12) DEFAULT NULL,
  employee_update_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  employee_update_ip VARCHAR(15) DEFAULT NULL,
  employee_note TEXT DEFAULT NULL,
  employee_status BOOLEAN NOT NULL
)`

// Employee Login
const dropEmployeeLoginTableSQL = 'DROP TABLE IF EXISTS employee_login'
const createEmployeeLoginTableSQL = `CREATE TABLE employee_login (
  employee_login_id VARCHAR(11) NOT NULL,
  PRIMARY KEY (employee_login_id),
  FK_employee_id VARCHAR(11) NOT NULL,
  employee_login_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  employee_login_ip VARCHAR(15) NOT NULL,
  employee_login_status BOOLEAN NOT NULL,
  employee_login_create_id VARCHAR(12) NOT NULL,
  employee_login_create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  employee_login_update_id VARCHAR(12) DEFAULT NULL,
  employee_login_update_date DATETIME DEFAULT CURRENT_TIMESTAMP
)`
const insertEmployeeLoginSQL = `INSERT INTO employee_login(employee_login_id, FK_employee_id, employee_login_date, employee_login_ip, employee_login_status, employee_login_create_id, employee_login_create_date, employee_login_update_id, employee_login_update_date) VALUES ?`
const initialEmployeeLoginSQL = `INSERT INTO employee_login(employee_login_id, FK_employee_id, employee_login_date, employee_login_ip, employee_login_status, employee_login_create_id, employee_login_create_date, employee_login_update_id, employee_login_update_date) VALUES
('L1209220001', 'E1209220001', '2022-09-12', '::1', 0, 'LC120922001', '2022-09-12', 'LU120922001', '2022-09-12'),
('L1209220002', 'E1209220001', '2022-09-12', '::1', 0, 'LC120922002', '2022-09-12', 'LU120922001', '2022-09-12')`

// Employee Privilege
const dropEmployeePrivilegeTableSQL = 'DROP TABLE IF EXISTS employee_privilege'
const createEmployeePrivilegeTableSQL = `CREATE TABLE employee_privilege (
  employee_privilege_id VARCHAR(11) NOT NULL,
  PRIMARY KEY (employee_privilege_id),
  employee_privilege_create_id VARCHAR(12) NOT NULL,
  employee_privilege_create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  employee_privilege_create_ip VARCHAR(15) NOT NULL,
  employee_privilege_update_id VARCHAR(12) DEFAULT NULL,
  employee_privilege_update_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  employee_privilege_update_ip VARCHAR(15) DEFAULT NULL,
  employee_privilege_note TEXT DEFAULT NULL,
  employee_privilege_status BOOLEAN NOT NULL,
  FK_employee_id VARCHAR(11) NOT NULL,
  FK_privilege_id VARCHAR(11) NOT NULL
)`
const initialEmployeePrivilegeSQL = `INSERT INTO employee_privilege (employee_privilege_id, employee_privilege_create_id, employee_privilege_create_date, employee_privilege_create_ip, employee_privilege_update_id, employee_privilege_update_date, employee_privilege_update_ip, employee_privilege_note, employee_privilege_status, FK_employee_id, FK_privilege_id) VALUES
('EP310722001', 'EPC310722001', '2022-09-12', '192.168.18.36', NULL, '2022-09-12', NULL, NULL, 1, 'E1209220001', 'PR310722001'),
('EP310722002', 'EPC310722002', '2022-09-12', '192.168.18.36', NULL, '2022-09-12', NULL, NULL, 1, 'E1209220002', 'PR310722002'),
('EP310722003', 'EPC310722003', '2022-09-12', '192.168.18.36', NULL, '2022-09-12', NULL, NULL, 1, 'E1209220002', 'PR310722003'),
('EP310722004', 'EPC310722004', '2022-09-12', '192.168.18.36', NULL, '2022-09-12', NULL, NULL, 1, 'E1209220002', 'PR310722004'),
('EP310722005', 'EPC310722005', '2022-09-12', '192.168.18.36', NULL, '2022-09-12', NULL, NULL, 1, 'E1209220002', 'PR310722005'),
('EP310722006', 'EPC310722006', '2022-09-12', '192.168.18.36', NULL, '2022-09-12', NULL, NULL, 1, 'E1209220002', 'PR310722006'),
('EP310722007', 'EPC310722007', '2022-09-12', '192.168.18.36', NULL, '2022-09-12', NULL, NULL, 1, 'E1209220002', 'PR310722007'),
('EP310722008', 'EPC310722008', '2022-09-12', '192.168.18.36', NULL, '2022-09-12', NULL, NULL, 1, 'E1209220002', 'PR310722008'),
('EP310722009', 'EPC310722009', '2022-09-12', '192.168.18.36', NULL, '2022-09-12', NULL, NULL, 1, 'E1209220002', 'PR310722009')`

export const dropTables = {
  dropCustomerTableSQL,
  dropDTransTableSQL,
  dropHProductTableSQL,
  dropHTransTableSQL,
  dropPromoTableSQL,
  dropPrivilegeTableSQL,
  dropProductTableSQL,
  dropEmployeeLoginTableSQL,
  dropEmployeePrivilegeTableSQL,
  dropEmployeeTableSQL,
}

export const createTables = {
  createCustomerTableSQL,
  createDTransTableSQL,
  createHProductTableSQL,
  createHTransTableSQL,
  createPrivilegeTableSQL,
  createProductTableSQL,
  createEmployeeLoginTableSQL,
  createEmployeePrivilegeTableSQL,
  createEmployeeTableSQL,
  createPromoTableSQL,
}

export const insertSQL = {
  insertDTransSQL,
  insertHProductSQL,
  insertProductSQL,
  insertEmployeeLoginSQL,
}

export const initialRecords = {
  initialCustomerSQL,
  initialDTransSQL,
  initialHProductSQL,
  initialHTransSQL,
  initialPrivilegeSQL,
  initialProductSQL,
  initialPromoSQL,
  initialEmployeeLoginSQL,
  initialEmployeePrivilegeSQL,
}
