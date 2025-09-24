DELIMITER $$
create Procedure consulta(
    IN numMatricula int,
    IN fechaInicio DATE,
    IN fechaFin DATE
    )
BEGIN
    select alumnos.matricula, 
    alumnos.nombre as "nombre del alumno", 
    alumnos.primerApellido as "Primer Apellido",
    alumnos.segundoApellido as "Segundo Apellido",
    alumnos.foto as "foto del alumno",
    asistencia.fecha,
    asistencia.horaEntrada as "Hora de entrada",
    asistencia.horaSalida as "Hora de salida",
    asistencia.estado as "Asistencia"
    from alumnos
    INNER JOIN asistencia
    ON alumnos.matricula = asistencia.alumno
    WHERE matricula = numMatricula AND fecha BETWEEN fechaInicio AND fechaFin;
END $$
DELIMITER;
