import pymysql

def conexionBD():
    return pymysql.connect(
        host = 'localhost',
        user = 'root',
        password = '',
        database = 'conalep_test',
        cursorclass= pymysql.cursors.DictCursor
    )