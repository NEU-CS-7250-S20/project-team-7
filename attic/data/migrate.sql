--
-- types table
--

CREATE TABLE types(
  package_being_analyzed TEXT,
  package TEXT,
  fun_name TEXT,
  fun_id TEXT,
  dispatch TEXT,
  arg_t_r TEXT,
  arg_c_r TEXT,
  arg_a_r TEXT,
  arg_t0 TEXT,
  arg_c0 TEXT,
  arg_a0 TEXT,
  arg_t1 TEXT,
  arg_c1 TEXT,
  arg_a1 TEXT,
  arg_t2 TEXT,
  arg_c2 TEXT,
  arg_a2 TEXT,
  arg_t3 TEXT,
  arg_c3 TEXT,
  arg_a3 TEXT,
  arg_t4 TEXT,
  arg_c4 TEXT,
  arg_a4 TEXT,
  arg_t5 TEXT,
  arg_c5 TEXT,
  arg_a5 TEXT,
  arg_t6 TEXT,
  arg_c6 TEXT,
  arg_a6 TEXT,
  arg_t7 TEXT,
  arg_c7 TEXT,
  arg_a7 TEXT,
  arg_t8 TEXT,
  arg_c8 TEXT,
  arg_a8 TEXT,
  arg_t9 TEXT,
  arg_c9 TEXT,
  arg_a9 TEXT,
  arg_t10 TEXT,
  arg_c10 TEXT,
  arg_a10 TEXT,
  arg_t11 TEXT,
  arg_c11 TEXT,
  arg_a11 TEXT,
  arg_t12 TEXT,
  arg_c12 TEXT,
  arg_a12 TEXT,
  arg_t13 TEXT,
  arg_c13 TEXT,
  arg_a13 TEXT,
  arg_t14 TEXT,
  arg_c14 TEXT,
  arg_a14 TEXT,
  arg_t15 TEXT,
  arg_c15 TEXT,
  arg_a15 TEXT,
  arg_t16 TEXT,
  arg_c16 TEXT,
  arg_a16 TEXT,
  arg_t17 TEXT,
  arg_c17 TEXT,
  arg_a17 TEXT,
  arg_t18 TEXT,
  arg_c18 TEXT,
  arg_a18 TEXT,
  arg_t19 TEXT,
  arg_c19 TEXT,
  arg_a19 TEXT,
  count BIGINT);

CREATE INDEX types_index ON types(
  count,
  package_being_analyzed,
  package,
  fun_name);

--
-- import from CSV (dropping header)
--

.mode csv
.import "/home/camoy/tmp/2020_04_13_all_very_simpl.csv" types
DELETE FROM types WHERE rowid = 1;

--
-- initial data cache tables
--

CREATE TABLE init_definednums AS
SELECT COUNT(DISTINCT package) AS packages,
       COUNT(DISTINCT fun_name) AS functions FROM types;

CREATE TABLE init_packages AS
SELECT package, SUM(count) as count FROM types GROUP BY package ORDER BY count DESC;

CREATE TABLE init_function_names AS
SELECT fun_name, SUM(count) as count FROM types  GROUP BY package, fun_name ORDER BY count DESC;
