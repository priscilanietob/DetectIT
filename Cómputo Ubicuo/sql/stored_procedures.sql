-- ============================================================
-- DetectIT — Stored Procedures
-- Ejecutar en SQL Server Management Studio después de schema.sql
-- ============================================================

USE DetectIT;
GO

-- ============================================================
-- DOCTORES
-- ============================================================

CREATE PROCEDURE InsertarDoctor
    @Nombre       NVARCHAR(100),
    @Especialidad NVARCHAR(100),
    @Cedula       NVARCHAR(50),
    @Email        NVARCHAR(100),
    @Telefono     NVARCHAR(20)   = NULL,
    @Ubicacion    NVARCHAR(200)  = NULL,
    @Hospital     NVARCHAR(200)  = NULL,
    @Experiencia  NVARCHAR(50)   = NULL,
    @Bio          NVARCHAR(MAX)  = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Doctores (Nombre, Especialidad, Cedula, Email, Telefono, Ubicacion, Hospital, Experiencia, Bio)
    VALUES (@Nombre, @Especialidad, @Cedula, @Email, @Telefono, @Ubicacion, @Hospital, @Experiencia, @Bio);
    SELECT SCOPE_IDENTITY() AS IdDoctor;
END;
GO

CREATE PROCEDURE ObtenerDoctores
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdDoctor, Nombre, Especialidad, Cedula, Email, Telefono, Ubicacion, Hospital, Experiencia, Bio,
           FechaCreacion, FechaActualizacion
    FROM Doctores
    ORDER BY Nombre;
END;
GO

CREATE PROCEDURE ObtenerDoctorPorId
    @IdDoctor INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdDoctor, Nombre, Especialidad, Cedula, Email, Telefono, Ubicacion, Hospital, Experiencia, Bio,
           FechaCreacion, FechaActualizacion
    FROM Doctores
    WHERE IdDoctor = @IdDoctor;

    SELECT IdEducacion, Titulo, Escuela, Anio
    FROM EducacionDoctor
    WHERE IdDoctor = @IdDoctor;

    SELECT IdCertificacion, Nombre
    FROM CertificacionesDoctor
    WHERE IdDoctor = @IdDoctor;

    SELECT TOP 10 IdActividad, Paciente, Estudio, Tiempo, Estado, FechaRegistro
    FROM ActividadDoctor
    WHERE IdDoctor = @IdDoctor
    ORDER BY FechaRegistro DESC;
END;
GO

CREATE PROCEDURE ActualizarDoctor
    @IdDoctor     INT,
    @Nombre       NVARCHAR(100),
    @Especialidad NVARCHAR(100),
    @Cedula       NVARCHAR(50),
    @Email        NVARCHAR(100),
    @Telefono     NVARCHAR(20)   = NULL,
    @Ubicacion    NVARCHAR(200)  = NULL,
    @Hospital     NVARCHAR(200)  = NULL,
    @Experiencia  NVARCHAR(50)   = NULL,
    @Bio          NVARCHAR(MAX)  = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Doctores
    SET Nombre = @Nombre,
        Especialidad = @Especialidad,
        Cedula = @Cedula,
        Email = @Email,
        Telefono = @Telefono,
        Ubicacion = @Ubicacion,
        Hospital = @Hospital,
        Experiencia = @Experiencia,
        Bio = @Bio,
        FechaActualizacion = GETDATE()
    WHERE IdDoctor = @IdDoctor;
END;
GO

-- ============================================================
-- PACIENTES
-- ============================================================

CREATE PROCEDURE InsertarPaciente
    @Nombre             NVARCHAR(100),
    @Edad               INT,
    @Sexo               NVARCHAR(10),
    @FechaNacimiento    DATE,
    @TipoSangre         NVARCHAR(5)   = NULL,
    @Email              NVARCHAR(100) = NULL,
    @Telefono           NVARCHAR(20)  = NULL,
    @Ubicacion          NVARCHAR(200) = NULL,
    @Seguro             NVARCHAR(100) = NULL,
    @ContactoEmergencia NVARCHAR(100) = NULL,
    @IdDoctor           INT           = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Pacientes
        (Nombre, Edad, Sexo, FechaNacimiento, TipoSangre, Email, Telefono, Ubicacion, Seguro, ContactoEmergencia, IdDoctor)
    VALUES
        (@Nombre, @Edad, @Sexo, @FechaNacimiento, @TipoSangre, @Email, @Telefono, @Ubicacion, @Seguro, @ContactoEmergencia, @IdDoctor);
    SELECT SCOPE_IDENTITY() AS IdPaciente;
END;
GO

CREATE PROCEDURE ObtenerPacientes
AS
BEGIN
    SET NOCOUNT ON;
    SELECT p.IdPaciente, p.Nombre, p.Edad, p.Sexo, p.FechaNacimiento, p.TipoSangre,
           p.Email, p.Telefono, p.Ubicacion, p.Seguro, p.ContactoEmergencia,
           p.IdDoctor, d.Nombre AS NombreDoctor,
           p.FechaCreacion, p.FechaActualizacion
    FROM Pacientes p
    LEFT JOIN Doctores d ON p.IdDoctor = d.IdDoctor
    ORDER BY p.Nombre;
END;
GO

CREATE PROCEDURE ObtenerPacientePorId
    @IdPaciente INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT p.IdPaciente, p.Nombre, p.Edad, p.Sexo, p.FechaNacimiento, p.TipoSangre,
           p.Email, p.Telefono, p.Ubicacion, p.Seguro, p.ContactoEmergencia,
           p.IdDoctor, d.Nombre AS NombreDoctor,
           p.FechaCreacion, p.FechaActualizacion
    FROM Pacientes p
    LEFT JOIN Doctores d ON p.IdDoctor = d.IdDoctor
    WHERE p.IdPaciente = @IdPaciente;

    SELECT IdAlergia, Nombre FROM Alergias WHERE IdPaciente = @IdPaciente;

    SELECT IdMedicamento, Nombre, Frecuencia, Desde FROM Medicamentos WHERE IdPaciente = @IdPaciente;

    SELECT IdCondicion, Nombre FROM Condiciones WHERE IdPaciente = @IdPaciente;

    SELECT IdSignosVitales, PresionArterial, FrecuenciaCardiaca, Temperatura, Peso, Talla, IMC, FechaActualizacion
    FROM SignosVitales WHERE IdPaciente = @IdPaciente;
END;
GO

CREATE PROCEDURE ActualizarPaciente
    @IdPaciente         INT,
    @Nombre             NVARCHAR(100),
    @Edad               INT,
    @Sexo               NVARCHAR(10),
    @FechaNacimiento    DATE,
    @TipoSangre         NVARCHAR(5)   = NULL,
    @Email              NVARCHAR(100) = NULL,
    @Telefono           NVARCHAR(20)  = NULL,
    @Ubicacion          NVARCHAR(200) = NULL,
    @Seguro             NVARCHAR(100) = NULL,
    @ContactoEmergencia NVARCHAR(100) = NULL,
    @IdDoctor           INT           = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Pacientes
    SET Nombre = @Nombre,
        Edad = @Edad,
        Sexo = @Sexo,
        FechaNacimiento = @FechaNacimiento,
        TipoSangre = @TipoSangre,
        Email = @Email,
        Telefono = @Telefono,
        Ubicacion = @Ubicacion,
        Seguro = @Seguro,
        ContactoEmergencia = @ContactoEmergencia,
        IdDoctor = @IdDoctor,
        FechaActualizacion = GETDATE()
    WHERE IdPaciente = @IdPaciente;
END;
GO

CREATE PROCEDURE EliminarPaciente
    @IdPaciente INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM Pacientes WHERE IdPaciente = @IdPaciente;
END;
GO

-- ALERGIAS

CREATE PROCEDURE InsertarAlergia
    @IdPaciente INT,
    @Nombre     NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Alergias (IdPaciente, Nombre) VALUES (@IdPaciente, @Nombre);
    SELECT SCOPE_IDENTITY() AS IdAlergia;
END;
GO

CREATE PROCEDURE ObtenerAlergiasPorPaciente
    @IdPaciente INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdAlergia, Nombre FROM Alergias WHERE IdPaciente = @IdPaciente;
END;
GO

CREATE PROCEDURE EliminarAlergia
    @IdAlergia INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM Alergias WHERE IdAlergia = @IdAlergia;
END;
GO

-- MEDICAMENTOS

CREATE PROCEDURE InsertarMedicamento
    @IdPaciente INT,
    @Nombre     NVARCHAR(200),
    @Frecuencia NVARCHAR(100) = NULL,
    @Desde      NVARCHAR(20)  = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Medicamentos (IdPaciente, Nombre, Frecuencia, Desde)
    VALUES (@IdPaciente, @Nombre, @Frecuencia, @Desde);
    SELECT SCOPE_IDENTITY() AS IdMedicamento;
END;
GO

CREATE PROCEDURE ObtenerMedicamentosPorPaciente
    @IdPaciente INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdMedicamento, Nombre, Frecuencia, Desde
    FROM Medicamentos
    WHERE IdPaciente = @IdPaciente;
END;
GO

CREATE PROCEDURE ActualizarMedicamento
    @IdMedicamento INT,
    @Nombre        NVARCHAR(200),
    @Frecuencia    NVARCHAR(100) = NULL,
    @Desde         NVARCHAR(20)  = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Medicamentos
    SET Nombre = @Nombre, Frecuencia = @Frecuencia, Desde = @Desde
    WHERE IdMedicamento = @IdMedicamento;
END;
GO

CREATE PROCEDURE EliminarMedicamento
    @IdMedicamento INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM Medicamentos WHERE IdMedicamento = @IdMedicamento;
END;
GO

-- CONDICIONES

CREATE PROCEDURE InsertarCondicion
    @IdPaciente INT,
    @Nombre     NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Condiciones (IdPaciente, Nombre) VALUES (@IdPaciente, @Nombre);
    SELECT SCOPE_IDENTITY() AS IdCondicion;
END;
GO

CREATE PROCEDURE ObtenerCondicionesPorPaciente
    @IdPaciente INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdCondicion, Nombre FROM Condiciones WHERE IdPaciente = @IdPaciente;
END;
GO

CREATE PROCEDURE EliminarCondicion
    @IdCondicion INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM Condiciones WHERE IdCondicion = @IdCondicion;
END;
GO

-- SIGNOS VITALES

CREATE PROCEDURE InsertarOActualizarSignosVitales
    @IdPaciente         INT,
    @PresionArterial    NVARCHAR(20)  = NULL,
    @FrecuenciaCardiaca NVARCHAR(20)  = NULL,
    @Temperatura        NVARCHAR(20)  = NULL,
    @Peso               NVARCHAR(20)  = NULL,
    @Talla              NVARCHAR(20)  = NULL,
    @IMC                NVARCHAR(10)  = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM SignosVitales WHERE IdPaciente = @IdPaciente)
    BEGIN
        UPDATE SignosVitales
        SET PresionArterial    = @PresionArterial,
            FrecuenciaCardiaca = @FrecuenciaCardiaca,
            Temperatura        = @Temperatura,
            Peso               = @Peso,
            Talla              = @Talla,
            IMC                = @IMC,
            FechaActualizacion = GETDATE()
        WHERE IdPaciente = @IdPaciente;
    END
    ELSE
    BEGIN
        INSERT INTO SignosVitales (IdPaciente, PresionArterial, FrecuenciaCardiaca, Temperatura, Peso, Talla, IMC)
        VALUES (@IdPaciente, @PresionArterial, @FrecuenciaCardiaca, @Temperatura, @Peso, @Talla, @IMC);
    END
    SELECT IdSignosVitales, PresionArterial, FrecuenciaCardiaca, Temperatura, Peso, Talla, IMC, FechaActualizacion
    FROM SignosVitales WHERE IdPaciente = @IdPaciente;
END;
GO

CREATE PROCEDURE ObtenerSignosVitalesPorPaciente
    @IdPaciente INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdSignosVitales, PresionArterial, FrecuenciaCardiaca, Temperatura, Peso, Talla, IMC, FechaActualizacion
    FROM SignosVitales
    WHERE IdPaciente = @IdPaciente;
END;
GO

-- ESTUDIOS

CREATE PROCEDURE InsertarEstudio
    @IdPaciente INT,
    @Tipo       NVARCHAR(100),
    @Fecha      NVARCHAR(20),
    @Doctor     NVARCHAR(100),
    @Resultado  NVARCHAR(200) = NULL,
    @Estado     NVARCHAR(50)  = 'En revisión'
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Estudios (IdPaciente, Tipo, Fecha, Doctor, Resultado, Estado)
    VALUES (@IdPaciente, @Tipo, @Fecha, @Doctor, @Resultado, @Estado);
    SELECT SCOPE_IDENTITY() AS IdEstudio;
END;
GO

CREATE PROCEDURE ObtenerEstudiosPorPaciente
    @IdPaciente INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdEstudio, Tipo, Fecha, Doctor, Resultado, Estado, FechaCreacion
    FROM Estudios
    WHERE IdPaciente = @IdPaciente
    ORDER BY FechaCreacion DESC;
END;
GO

CREATE PROCEDURE ActualizarEstado
    @IdEstudio INT,
    @Estado    NVARCHAR(50),
    @Resultado NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Estudios
    SET Estado = @Estado, Resultado = ISNULL(@Resultado, Resultado)
    WHERE IdEstudio = @IdEstudio;
END;
GO

-- EXPEDIENTE CLÍNICO

CREATE PROCEDURE InsertarEntradaExpediente
    @IdPaciente     INT,
    @Fecha          NVARCHAR(20),
    @Tipo           NVARCHAR(100),
    @Doctor         NVARCHAR(100),
    @Titulo         NVARCHAR(200),
    @Resumen        NVARCHAR(MAX)  = NULL,
    @Hallazgos      NVARCHAR(MAX)  = NULL,
    @Diagnostico    NVARCHAR(MAX)  = NULL,
    @Recomendaciones NVARCHAR(MAX) = NULL,
    @TieneImagen    BIT            = 0,
    @NotaIA         NVARCHAR(MAX)  = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Expediente
        (IdPaciente, Fecha, Tipo, Doctor, Titulo, Resumen, Hallazgos, Diagnostico, Recomendaciones, TieneImagen, NotaIA)
    VALUES
        (@IdPaciente, @Fecha, @Tipo, @Doctor, @Titulo, @Resumen, @Hallazgos, @Diagnostico, @Recomendaciones, @TieneImagen, @NotaIA);
    SELECT SCOPE_IDENTITY() AS IdEntrada;
END;
GO

CREATE PROCEDURE ObtenerExpedientePorPaciente
    @IdPaciente INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT p.IdPaciente, p.Nombre, p.Edad, p.Sexo, p.TipoSangre, d.Nombre AS NombreDoctor,
           p.FechaCreacion, p.FechaActualizacion
    FROM Pacientes p
    LEFT JOIN Doctores d ON p.IdDoctor = d.IdDoctor
    WHERE p.IdPaciente = @IdPaciente;

    SELECT IdEntrada, Fecha, Tipo, Doctor, Titulo, Resumen, Hallazgos,
           Diagnostico, Recomendaciones, TieneImagen, NotaIA, FechaCreacion
    FROM Expediente
    WHERE IdPaciente = @IdPaciente
    ORDER BY FechaCreacion DESC;
END;
GO

CREATE PROCEDURE EliminarEntradaExpediente
    @IdEntrada INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM Expediente WHERE IdEntrada = @IdEntrada;
END;
GO

-- ACTIVIDAD DEL DOCTOR

CREATE PROCEDURE InsertarActividadDoctor
    @IdDoctor INT,
    @Paciente NVARCHAR(100),
    @Estudio  NVARCHAR(100),
    @Tiempo   NVARCHAR(50),
    @Estado   NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO ActividadDoctor (IdDoctor, Paciente, Estudio, Tiempo, Estado)
    VALUES (@IdDoctor, @Paciente, @Estudio, @Tiempo, @Estado);
    SELECT SCOPE_IDENTITY() AS IdActividad;
END;
GO

-- DATOS INICIALES (seed para desarrollo)
-- ============================================================

EXEC InsertarDoctor
    @Nombre       = N'Dra. Claudia Ramírez',
    @Especialidad = N'Radiología Diagnóstica',
    @Cedula       = N'MX-RAD-2018-04821',
    @Email        = N'claudia.ramirez@detectit.mx',
    @Telefono     = N'+52 664 210 3847',
    @Ubicacion    = N'Tijuana, Baja California',
    @Hospital     = N'Hospital Ángeles Tijuana',
    @Experiencia  = N'8 años',
    @Bio          = N'Especialista en radiodiagnóstico con enfoque en detección temprana de enfermedades pulmonares y musculoesqueléticas.';

DECLARE @IdDoc INT = SCOPE_IDENTITY();

INSERT INTO EducacionDoctor (IdDoctor, Titulo, Escuela, Anio) VALUES
    (@IdDoc, N'Especialidad en Radiología', N'IMSS CDMX', N'2018'),
    (@IdDoc, N'Médico Cirujano', N'UABC Tijuana', N'2014');

INSERT INTO CertificacionesDoctor (IdDoctor, Nombre) VALUES
    (@IdDoc, N'FMRI'), (@IdDoc, N'ACR Member'), (@IdDoc, N'RSNA 2023');

EXEC InsertarPaciente
    @Nombre             = N'Carlos Mendoza',
    @Edad               = 54,
    @Sexo               = N'Masculino',
    @FechaNacimiento    = '1970-03-12',
    @TipoSangre         = N'O+',
    @Email              = N'carlos.mendoza@email.com',
    @Telefono           = N'+52 664 588 2910',
    @Ubicacion          = N'Tijuana, Baja California',
    @Seguro             = N'IMSS — Afiliado #482-91-7034',
    @ContactoEmergencia = N'María Mendoza · +52 664 991 3322',
    @IdDoctor           = @IdDoc;

DECLARE @IdPac INT = SCOPE_IDENTITY();

EXEC InsertarAlergia @IdPaciente = @IdPac, @Nombre = N'Penicilina';
EXEC InsertarAlergia @IdPaciente = @IdPac, @Nombre = N'Aspirina';

EXEC InsertarCondicion @IdPaciente = @IdPac, @Nombre = N'Hipertensión arterial';
EXEC InsertarCondicion @IdPaciente = @IdPac, @Nombre = N'Diabetes tipo 2';

EXEC InsertarMedicamento @IdPaciente = @IdPac, @Nombre = N'Metformina 850mg', @Frecuencia = N'2 veces al día', @Desde = N'2020';
EXEC InsertarMedicamento @IdPaciente = @IdPac, @Nombre = N'Losartán 50mg',    @Frecuencia = N'1 vez al día',   @Desde = N'2019';

EXEC InsertarOActualizarSignosVitales
    @IdPaciente         = @IdPac,
    @PresionArterial    = N'138/88 mmHg',
    @FrecuenciaCardiaca = N'74 bpm',
    @Temperatura        = N'36.4 °C',
    @Peso               = N'82 kg',
    @Talla              = N'1.72 m',
    @IMC                = N'27.7';

EXEC InsertarEstudio @IdPaciente = @IdPac, @Tipo = N'Rx Tórax PA',      @Fecha = N'09/04/2026', @Doctor = N'Dra. Ramírez', @Resultado = N'Normal',             @Estado = N'Completado';
EXEC InsertarEstudio @IdPaciente = @IdPac, @Tipo = N'Rx Columna L-S',   @Fecha = N'14/02/2026', @Doctor = N'Dra. Ramírez', @Resultado = N'Espondilosis leve',  @Estado = N'Completado';
EXEC InsertarEstudio @IdPaciente = @IdPac, @Tipo = N'Rx Abdomen',       @Fecha = N'05/11/2025', @Doctor = N'Dr. Torres',   @Resultado = N'Sin hallazgos',       @Estado = N'Completado';

EXEC InsertarEntradaExpediente
    @IdPaciente      = @IdPac, @Fecha = N'09/04/2026', @Tipo = N'Estudio radiológico',
    @Doctor          = N'Dra. Claudia Ramírez',        @Titulo = N'Rx Tórax PA — Seguimiento',
    @Resumen         = N'Campos pulmonares sin condensaciones. Silueta cardíaca en límites normales.',
    @Hallazgos       = N'No se observan infiltrados ni masas. Costillas simétricas. Tráquea centrada.',
    @Diagnostico     = N'Rx de tórax dentro de parámetros normales.',
    @Recomendaciones = N'Continuar seguimiento anual. Mantener control de presión arterial.',
    @TieneImagen     = 1,
    @NotaIA          = N'IA detectó índice cardiotorácico: 0.48 (normal). Sin opacidades sugestivas de patología aguda.';

EXEC InsertarEntradaExpediente
    @IdPaciente      = @IdPac, @Fecha = N'14/02/2026', @Tipo = N'Estudio radiológico',
    @Doctor          = N'Dra. Claudia Ramírez',        @Titulo = N'Rx Columna Lumbosacra',
    @Resumen         = N'Disminución de espacios intervertebrales en L4-L5 y L5-S1.',
    @Hallazgos       = N'Pérdida de altura discal L4-L5. Esclerosis subcondral. Lordosis conservada.',
    @Diagnostico     = N'Espondilosis lumbar grado leve-moderado.',
    @Recomendaciones = N'Fisioterapia lumbar. Control con ortopedia.',
    @TieneImagen     = 1,
    @NotaIA          = N'IA identificó reducción del espacio discal L4-L5 con probabilidad 87%.';

EXEC InsertarEntradaExpediente
    @IdPaciente      = @IdPac, @Fecha = N'10/01/2026', @Tipo = N'Consulta',
    @Doctor          = N'Dra. Claudia Ramírez',        @Titulo = N'Consulta de control — Diabetes e HTA',
    @Resumen         = N'Paciente refiere adherencia al tratamiento. TA: 138/88, glucosa en ayuno 118 mg/dL.',
    @Hallazgos       = N'Exploración física sin alteraciones. Pulsos periféricos conservados.',
    @Diagnostico     = N'DM2 en control. HTA moderada.',
    @Recomendaciones = N'Continuar Metformina y Losartán. Dieta baja en sodio.',
    @TieneImagen     = 0,
    @NotaIA          = NULL;
GO
