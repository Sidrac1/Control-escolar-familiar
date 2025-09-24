DELIMITER $$ /*Trigger para asignar foto default a las faltas*/
    CREATE Trigger noFoto
    BEFORE INSERT ON asistencia
    for EACH ROW
    BEGIN
        IF NEW.foto_llegada IS NULL THEN
            SET NEW.foto_llegada = "../static\Images\nophoto.jpg";
        END IF;
    END $$
DELIMITER;

DELIMITER $$ /*Trigger para asignar el estado Falta en caso de no registrar hora de entrada*/
drop trigger if EXISTS faltas;
    CREATE Trigger faltas
    before INSERT on asistencia
    for EACH ROW
    BEGIN
        IF NEW.horaEntrada IS NULL THEN
            SET NEW.estado = "falta";
        END IF;
    END $$
    
DELIMITER;