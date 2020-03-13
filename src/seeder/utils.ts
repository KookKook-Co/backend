import { Pool } from 'pg';

export const poolQuery = async (pool: Pool, query_list: string) => {
    return new Promise((resolve, reject) => {
        pool.query(query_list, (err, res) => {
            if (err) {
                console.log(err.stack);
            } else {
                //console.log(res);
                resolve(res);
            }
        });
    });
};

export const createDatabase = (db_name: string) =>
    `CREATE DATABASE ${db_name};`;

export const dropDatabase = (db_name: string) => `DROP DATABASE ${db_name};`;

export const createEmptyTable = (table_name: string) =>
    `CREATE TABLE ${table_name};`;

export const createTable = (table_name: string, column_data: string) =>
    `CREATE TABLE "${table_name}"(${column_data});`;

export const dropTable = table_name => {
    return `DROP TABLE ${table_name};`;
};
export const addOneColumn = (
    table_name,
    column_name,
    datatype,
    option = null,
) => {
    if (option == null) {
        option = '';
    }
    return `ALTER TABLE ${table_name} \
    ADD ${column_name} ${datatype} ${option};`;
};

export const dropOneColumn = (table_name, column_name) => {
    return `ALTER TABLE ${table_name} \
    DROP ${column_name};`;
};
export const addConstraint = (
    table_name,
    own_column,
    parent_table,
    parent_table_column,
    constraint_name,
    option = '',
) => {
    return `ALTER TABLE "${table_name}" \
    ADD CONSTRAINT "${constraint_name}" FOREIGN KEY ("${own_column}") REFERENCES "${parent_table}" (${parent_table_column}) ${option};`;
};
export const addMultiConstraint = (
    table_name,
    own_column,
    parent_table,
    parent_table_column,
    constraint_name,
    option = '',
) => {
    return `ALTER TABLE "${table_name}" \
    ADD CONSTRAINT "${constraint_name}" FOREIGN KEY (${own_column}) REFERENCES "${parent_table}" (${parent_table_column} ${option});`;
};
export const dropConstraint = table_name => {};
