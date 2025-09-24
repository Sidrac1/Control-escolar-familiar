CREATE DATABASE Conalep_Test
    DEFAULT CHARACTER SET = 'utf8mb4';

use  Conalep_Test;

create table alumnos (
    matricula int PRIMARY key AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    primerApellido VARCHAR(255) NOT NULL,
    segundoApellido VARCHAR(255)
);

create table Padres(
    id int PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    primerApellido VARCHAR(255) NOT NULL,
    segundoApellido VARCHAR(255),
    matriculaAlumno int,
    Foreign Key (matriculaAlumno) REFERENCES alumnos(matricula)
)

create table asistencia(
    id int PRIMARY KEY AUTO_INCREMENT,
    fecha DATE DEFAULT CURRENT_DATE, 
    horaEntrada TIME DEFAULT NULL,
    horaSalida TIME DEFAULT NULL,
    estado VARCHAR (255) DEFAULT 'presente', 
    observaciones TEXT,
    alumno int,
    Foreign Key (alumno) REFERENCES alumnos(matricula)
);--use this format to insert: (yyyy-mm-dd) example: (2025-09-15)
--los valores deben ser 'asistencia' o 'falta'

ALTER TABLE alumnos
add COLUMN foto varchar (255);

