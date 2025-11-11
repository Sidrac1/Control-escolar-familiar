from connection import conexionBD

def consultarAsistencia(matricula,fecha_inicio,fecha_fin):
    try:
        connection = conexionBD() #aqui se establece la conexión a la BD
        cursor = connection.cursor() #esto es el cursor que actua como proxy entre el programa y la BD
        sql = "CALL consulta(%s,%s,%s)"
        cursor.execute(sql,(matricula, fecha_inicio, fecha_fin)) #esto va a tomar los %s y los va a reemplazar con los valores obtenidos en los parámetros
        result = cursor.fetchall() #se guardan los resultados de la consulta en una variable

        return result
    except Exception as e:
        #connection.rollback() #esta línea de código solo se utilizza cuando se modifica algo en la BD
        return f"Error al hacer la consulta: {e}"
    finally:
        if connection:
            connection.close()



            