use Conalep_Test;

show tables;

describe asistencia;
select * from asistencia;
select * from alumnos;

select * from asistencia where fecha = "2025-09-09"

CALL consulta(2,"2025-08-08","2025-09-09");

insert into asistencia (`horaEntrada`,`horaSalida`,)