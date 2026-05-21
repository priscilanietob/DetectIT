-- DetectIT — SQL Server Schema
-- Ejecutar en SQL Server Management Studio

USE DetectIT;
GO

-- TABLAS

CREATE TABLE Doctores (
    IdDoctor          INT           IDENTITY(1,1) PRIMARY KEY,
    Nombre            NVARCHAR(100) NOT NULL,
    Especialidad      NVARCHAR(100),
    Cedula            NVARCHAR(50)  UNIQUE,
    Email             NVARCHAR(100) UNIQUE,
    Telefono          NVARCHAR(20),
    Ubicacion         NVARCHAR(200),
    Hospital          NVARCHAR(200),
    Experiencia       NVARCHAR(50),
    Bio               NVARCHAR(MAX),
    FechaCreacion     DATETIME      DEFAULT GETDATE(),
    FechaActualizacion DATETIME     DEFAULT GETDATE()
);
GO

CREATE TABLE EducacionDoctor (
    IdEducacion INT           IDENTITY(1,1) PRIMARY KEY,
    IdDoctor    INT           NOT NULL,
    Titulo      NVARCHAR(200),
    Escuela     NVARCHAR(200),
    Anio        NVARCHAR(10),
    CONSTRAINT FK_EducacionDoctor_Doctores
        FOREIGN KEY (IdDoctor) REFERENCES Doctores(IdDoctor) ON DELETE CASCADE
);
GO

CREATE TABLE CertificacionesDoctor (
    IdCertificacion INT           IDENTITY(1,1) PRIMARY KEY,
    IdDoctor        INT           NOT NULL,
    Nombre          NVARCHAR(200) NOT NULL,
    CONSTRAINT FK_CertificacionesDoctor_Doctores
        FOREIGN KEY (IdDoctor) REFERENCES Doctores(IdDoctor) ON DELETE CASCADE
);
GO

CREATE TABLE ActividadDoctor (
    IdActividad INT           IDENTITY(1,1) PRIMARY KEY,
    IdDoctor    INT           NOT NULL,
    Paciente    NVARCHAR(100),
    Estudio     NVARCHAR(100),
    Tiempo      NVARCHAR(50),
    Estado      NVARCHAR(50),
    FechaRegistro DATETIME   DEFAULT GETDATE(),
    CONSTRAINT FK_ActividadDoctor_Doctores
        FOREIGN KEY (IdDoctor) REFERENCES Doctores(IdDoctor) ON DELETE CASCADE
);
GO

CREATE TABLE Pacientes (
    IdPaciente         INT           IDENTITY(1,1) PRIMARY KEY,
    Nombre             NVARCHAR(100) NOT NULL,
    Edad               INT,
    Sexo               NVARCHAR(10),
    FechaNacimiento    DATE,
    TipoSangre         NVARCHAR(5),
    Email              NVARCHAR(100),
    Telefono           NVARCHAR(20),
    Ubicacion          NVARCHAR(200),
    Seguro             NVARCHAR(100),
    ContactoEmergencia NVARCHAR(100),
    IdDoctor           INT,
    FechaCreacion      DATETIME      DEFAULT GETDATE(),
    FechaActualizacion DATETIME      DEFAULT GETDATE(),
    CONSTRAINT FK_Pacientes_Doctores
        FOREIGN KEY (IdDoctor) REFERENCES Doctores(IdDoctor)
);
GO

CREATE TABLE Alergias (
    IdAlergia  INT           IDENTITY(1,1) PRIMARY KEY,
    IdPaciente INT           NOT NULL,
    Nombre     NVARCHAR(100) NOT NULL,
    CONSTRAINT FK_Alergias_Pacientes
        FOREIGN KEY (IdPaciente) REFERENCES Pacientes(IdPaciente) ON DELETE CASCADE
);
GO

CREATE TABLE Medicamentos (
    IdMedicamento INT           IDENTITY(1,1) PRIMARY KEY,
    IdPaciente    INT           NOT NULL,
    Nombre        NVARCHAR(200) NOT NULL,
    Frecuencia    NVARCHAR(100),
    Desde         NVARCHAR(20),
    CONSTRAINT FK_Medicamentos_Pacientes
        FOREIGN KEY (IdPaciente) REFERENCES Pacientes(IdPaciente) ON DELETE CASCADE
);
GO

CREATE TABLE Condiciones (
    IdCondicion INT           IDENTITY(1,1) PRIMARY KEY,
    IdPaciente  INT           NOT NULL,
    Nombre      NVARCHAR(200) NOT NULL,
    CONSTRAINT FK_Condiciones_Pacientes
        FOREIGN KEY (IdPaciente) REFERENCES Pacientes(IdPaciente) ON DELETE CASCADE
);
GO

CREATE TABLE SignosVitales (
    IdSignosVitales    INT          IDENTITY(1,1) PRIMARY KEY,
    IdPaciente         INT          NOT NULL UNIQUE,
    PresionArterial    NVARCHAR(20),
    FrecuenciaCardiaca NVARCHAR(20),
    Temperatura        NVARCHAR(20),
    Peso               NVARCHAR(20),
    Talla              NVARCHAR(20),
    IMC                NVARCHAR(10),
    FechaActualizacion DATETIME     DEFAULT GETDATE(),
    CONSTRAINT FK_SignosVitales_Pacientes
        FOREIGN KEY (IdPaciente) REFERENCES Pacientes(IdPaciente) ON DELETE CASCADE
);
GO

CREATE TABLE Estudios (
    IdEstudio     INT           IDENTITY(1,1) PRIMARY KEY,
    IdPaciente    INT           NOT NULL,
    Tipo          NVARCHAR(100),
    Fecha         NVARCHAR(20),
    Doctor        NVARCHAR(100),
    Resultado     NVARCHAR(200),
    Estado        NVARCHAR(50),
    FechaCreacion DATETIME      DEFAULT GETDATE(),
    CONSTRAINT FK_Estudios_Pacientes
        FOREIGN KEY (IdPaciente) REFERENCES Pacientes(IdPaciente) ON DELETE CASCADE
);
GO

CREATE TABLE Expediente (
    IdEntrada        INT           IDENTITY(1,1) PRIMARY KEY,
    IdPaciente       INT           NOT NULL,
    Fecha            NVARCHAR(20),
    Tipo             NVARCHAR(100),
    Doctor           NVARCHAR(100),
    Titulo           NVARCHAR(200),
    Resumen          NVARCHAR(MAX),
    Hallazgos        NVARCHAR(MAX),
    Diagnostico      NVARCHAR(MAX),
    Recomendaciones  NVARCHAR(MAX),
    TieneImagen      BIT           DEFAULT 0,
    NotaIA           NVARCHAR(MAX),
    FechaCreacion    DATETIME      DEFAULT GETDATE(),
    CONSTRAINT FK_Expediente_Pacientes
        FOREIGN KEY (IdPaciente) REFERENCES Pacientes(IdPaciente) ON DELETE CASCADE
);
GO
