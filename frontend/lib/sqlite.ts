/**
 * lib/sqlite.ts
 * Módulo central de persistencia SQLite (better-sqlite3).
 * - Crea las tablas al arrancar si no existen.
 * - Siembra los datos mock la primera vez que la BD está vacía.
 * - Exporta getDb() como singleton para toda la app.
 */

import Database from "better-sqlite3"
import fs from "fs"
import path from "path"
import { MOCK_DOCTORS, MOCK_PATIENTS, MOCK_RECORDS } from "./mock-data"

const DATA_DIR = path.join(process.cwd(), ".data")
const DB_PATH  = path.join(DATA_DIR, "detectit.db")

// En desarrollo, guardamos la instancia en global para sobrevivir hot-reloads.
// En producción, basta con el módulo singleton normal.
declare global { var __detectit_db: Database.Database | undefined }

function openDb(): Database.Database {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  const db = new Database(DB_PATH)
  db.pragma("journal_mode = WAL")
  db.pragma("foreign_keys = ON")
  initSchema(db)
  seedIfEmpty(db)
  return db
}

export function getDb(): Database.Database {
  if (process.env.NODE_ENV === "production") {
    // En producción el módulo se carga una sola vez
    if (!global.__detectit_db) global.__detectit_db = openDb()
    return global.__detectit_db
  }
  // En desarrollo usamos global para sobrevivir hot-reloads
  if (!global.__detectit_db) global.__detectit_db = openDb()
  return global.__detectit_db
}

// ─── Schema ──────────────────────────────────────────────────────────────────

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Doctores (
      IdDoctor           INTEGER PRIMARY KEY,
      Nombre             TEXT    NOT NULL,
      Especialidad       TEXT    NOT NULL DEFAULT '',
      Cedula             TEXT    NOT NULL DEFAULT '',
      Email              TEXT    NOT NULL DEFAULT '',
      Telefono           TEXT,
      Ubicacion          TEXT,
      Hospital           TEXT,
      Experiencia        TEXT,
      Bio                TEXT,
      FechaCreacion      TEXT    DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
      FechaActualizacion TEXT    DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    );

    CREATE TABLE IF NOT EXISTS EducacionDoctor (
      IdEducacion INTEGER PRIMARY KEY,
      IdDoctor    INTEGER NOT NULL REFERENCES Doctores(IdDoctor) ON DELETE CASCADE,
      Titulo      TEXT    NOT NULL,
      Escuela     TEXT    NOT NULL DEFAULT '',
      Anio        TEXT
    );

    CREATE TABLE IF NOT EXISTS CertificacionesDoctor (
      IdCertificacion INTEGER PRIMARY KEY,
      IdDoctor        INTEGER NOT NULL REFERENCES Doctores(IdDoctor) ON DELETE CASCADE,
      Nombre          TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ActividadDoctor (
      IdActividad INTEGER PRIMARY KEY,
      IdDoctor    INTEGER NOT NULL REFERENCES Doctores(IdDoctor) ON DELETE CASCADE,
      Paciente    TEXT    NOT NULL DEFAULT '',
      Estudio     TEXT    NOT NULL DEFAULT '',
      Tiempo      TEXT,
      Estado      TEXT
    );

    CREATE TABLE IF NOT EXISTS Pacientes (
      IdPaciente         INTEGER PRIMARY KEY,
      Nombre             TEXT    NOT NULL,
      Edad               INTEGER NOT NULL DEFAULT 0,
      Sexo               TEXT    NOT NULL DEFAULT '',
      FechaNacimiento    TEXT    NOT NULL DEFAULT '',
      TipoSangre         TEXT,
      Email              TEXT,
      Telefono           TEXT,
      Ubicacion          TEXT,
      Seguro             TEXT,
      ContactoEmergencia TEXT,
      IdDoctor           INTEGER REFERENCES Doctores(IdDoctor),
      FechaCreacion      TEXT    DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
      FechaActualizacion TEXT    DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    );

    CREATE TABLE IF NOT EXISTS Alergias (
      IdAlergia  INTEGER PRIMARY KEY,
      IdPaciente INTEGER NOT NULL REFERENCES Pacientes(IdPaciente) ON DELETE CASCADE,
      Nombre     TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Medicamentos (
      IdMedicamento INTEGER PRIMARY KEY,
      IdPaciente    INTEGER NOT NULL REFERENCES Pacientes(IdPaciente) ON DELETE CASCADE,
      Nombre        TEXT    NOT NULL,
      Frecuencia    TEXT,
      Desde         TEXT
    );

    CREATE TABLE IF NOT EXISTS Condiciones (
      IdCondicion INTEGER PRIMARY KEY,
      IdPaciente  INTEGER NOT NULL REFERENCES Pacientes(IdPaciente) ON DELETE CASCADE,
      Nombre      TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS SignosVitales (
      IdSignosVitales    INTEGER PRIMARY KEY,
      IdPaciente         INTEGER NOT NULL UNIQUE REFERENCES Pacientes(IdPaciente) ON DELETE CASCADE,
      PresionArterial    TEXT,
      FrecuenciaCardiaca TEXT,
      Temperatura        TEXT,
      Peso               TEXT,
      Talla              TEXT,
      IMC                TEXT
    );

    CREATE TABLE IF NOT EXISTS Estudios (
      IdEstudio  INTEGER PRIMARY KEY,
      IdPaciente INTEGER NOT NULL REFERENCES Pacientes(IdPaciente) ON DELETE CASCADE,
      Tipo       TEXT    NOT NULL DEFAULT '',
      Fecha      TEXT,
      Doctor     TEXT,
      Resultado  TEXT,
      Estado     TEXT    DEFAULT 'En revisión'
    );

    CREATE TABLE IF NOT EXISTS Expediente (
      IdEntrada       INTEGER PRIMARY KEY,
      IdPaciente      INTEGER NOT NULL REFERENCES Pacientes(IdPaciente) ON DELETE CASCADE,
      Fecha           TEXT,
      Tipo            TEXT,
      Doctor          TEXT,
      Titulo          TEXT,
      Resumen         TEXT,
      Hallazgos       TEXT,
      Diagnostico     TEXT,
      Recomendaciones TEXT,
      TieneImagen     INTEGER DEFAULT 0,
      NotaIA          TEXT,
      FechaCreacion   TEXT    DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    );
  `)
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

function seedIfEmpty(db: Database.Database): void {
  const { n } = db.prepare("SELECT COUNT(*) as n FROM Doctores").get() as { n: number }
  if (n > 0) return

  const insertDoctor = db.prepare(`
    INSERT INTO Doctores (IdDoctor, Nombre, Especialidad, Cedula, Email, Telefono, Ubicacion, Hospital, Experiencia, Bio, FechaCreacion, FechaActualizacion)
    VALUES (@IdDoctor, @Nombre, @Especialidad, @Cedula, @Email, @Telefono, @Ubicacion, @Hospital, @Experiencia, @Bio, @FechaCreacion, @FechaActualizacion)
  `)
  const insertEdu = db.prepare(`
    INSERT INTO EducacionDoctor (IdEducacion, IdDoctor, Titulo, Escuela, Anio)
    VALUES (@IdEducacion, @IdDoctor, @Titulo, @Escuela, @Anio)
  `)
  const insertCert = db.prepare(`
    INSERT INTO CertificacionesDoctor (IdCertificacion, IdDoctor, Nombre)
    VALUES (@IdCertificacion, @IdDoctor, @Nombre)
  `)
  const insertAct = db.prepare(`
    INSERT INTO ActividadDoctor (IdActividad, IdDoctor, Paciente, Estudio, Tiempo, Estado)
    VALUES (@IdActividad, @IdDoctor, @Paciente, @Estudio, @Tiempo, @Estado)
  `)
  const insertPatient = db.prepare(`
    INSERT INTO Pacientes (IdPaciente, Nombre, Edad, Sexo, FechaNacimiento, TipoSangre, Email, Telefono, Ubicacion, Seguro, ContactoEmergencia, IdDoctor, FechaCreacion, FechaActualizacion)
    VALUES (@IdPaciente, @Nombre, @Edad, @Sexo, @FechaNacimiento, @TipoSangre, @Email, @Telefono, @Ubicacion, @Seguro, @ContactoEmergencia, @IdDoctor, @FechaCreacion, @FechaActualizacion)
  `)
  const insertAlergia = db.prepare(`
    INSERT INTO Alergias (IdAlergia, IdPaciente, Nombre) VALUES (@IdAlergia, @IdPaciente, @Nombre)
  `)
  const insertMed = db.prepare(`
    INSERT INTO Medicamentos (IdMedicamento, IdPaciente, Nombre, Frecuencia, Desde)
    VALUES (@IdMedicamento, @IdPaciente, @Nombre, @Frecuencia, @Desde)
  `)
  const insertCond = db.prepare(`
    INSERT INTO Condiciones (IdCondicion, IdPaciente, Nombre) VALUES (@IdCondicion, @IdPaciente, @Nombre)
  `)
  const insertVitals = db.prepare(`
    INSERT INTO SignosVitales (IdPaciente, PresionArterial, FrecuenciaCardiaca, Temperatura, Peso, Talla, IMC)
    VALUES (@IdPaciente, @PresionArterial, @FrecuenciaCardiaca, @Temperatura, @Peso, @Talla, @IMC)
  `)
  const insertEstudio = db.prepare(`
    INSERT INTO Estudios (IdEstudio, IdPaciente, Tipo, Fecha, Doctor, Resultado, Estado)
    VALUES (@IdEstudio, @IdPaciente, @Tipo, @Fecha, @Doctor, @Resultado, @Estado)
  `)
  const insertExpediente = db.prepare(`
    INSERT INTO Expediente (IdEntrada, IdPaciente, Fecha, Tipo, Doctor, Titulo, Resumen, Hallazgos, Diagnostico, Recomendaciones, TieneImagen, NotaIA, FechaCreacion)
    VALUES (@IdEntrada, @IdPaciente, @Fecha, @Tipo, @Doctor, @Titulo, @Resumen, @Hallazgos, @Diagnostico, @Recomendaciones, @TieneImagen, @NotaIA, @FechaCreacion)
  `)

  db.transaction(() => {
    // Doctores + sub-tablas
    for (const doc of MOCK_DOCTORS) {
      insertDoctor.run({
        IdDoctor: doc.IdDoctor, Nombre: doc.Nombre, Especialidad: doc.Especialidad,
        Cedula: doc.Cedula, Email: doc.Email,
        Telefono: doc.Telefono ?? null, Ubicacion: doc.Ubicacion ?? null,
        Hospital: (doc as any).Hospital ?? null, Experiencia: (doc as any).Experiencia ?? null,
        Bio: doc.Bio ?? null,
        FechaCreacion: doc.FechaCreacion, FechaActualizacion: doc.FechaActualizacion,
      })
      for (const e of doc.education)      insertEdu.run({ ...e, IdDoctor: doc.IdDoctor })
      for (const c of doc.certifications) insertCert.run({ ...c, IdDoctor: doc.IdDoctor })
      for (const a of doc.activity)       insertAct.run({ ...a, IdDoctor: doc.IdDoctor })
    }

    // Pacientes + sub-tablas
    for (const pat of MOCK_PATIENTS) {
      insertPatient.run({
        IdPaciente: pat.IdPaciente, Nombre: pat.Nombre, Edad: pat.Edad,
        Sexo: pat.Sexo, FechaNacimiento: pat.FechaNacimiento,
        TipoSangre: pat.TipoSangre ?? null, Email: pat.Email ?? null,
        Telefono: pat.Telefono ?? null, Ubicacion: pat.Ubicacion ?? null,
        Seguro: pat.Seguro ?? null, ContactoEmergencia: pat.ContactoEmergencia ?? null,
        IdDoctor: pat.IdDoctor ?? null,
        FechaCreacion: pat.FechaCreacion, FechaActualizacion: pat.FechaActualizacion,
      })
      for (const a of pat.allergies)   insertAlergia.run({ ...a, IdPaciente: pat.IdPaciente })
      for (const m of pat.medications) insertMed.run({ ...m, IdPaciente: pat.IdPaciente })
      for (const c of pat.conditions)  insertCond.run({ ...c, IdPaciente: pat.IdPaciente })
      if (pat.vitals) insertVitals.run({ IdPaciente: pat.IdPaciente, ...pat.vitals })
      for (const s of pat.studies)     insertEstudio.run({ ...s, IdPaciente: pat.IdPaciente })
    }

    // Expedientes
    for (const [patIdStr, record] of Object.entries(MOCK_RECORDS)) {
      const patId = parseInt(patIdStr)
      for (const entry of record.entries as any[]) {
        insertExpediente.run({
          IdEntrada: entry.IdEntrada, IdPaciente: patId,
          Fecha: entry.Fecha, Tipo: entry.Tipo, Doctor: entry.Doctor,
          Titulo: entry.Titulo, Resumen: entry.Resumen ?? null,
          Hallazgos: entry.Hallazgos ?? null, Diagnostico: entry.Diagnostico ?? null,
          Recomendaciones: entry.Recomendaciones ?? null,
          TieneImagen: entry.TieneImagen ? 1 : 0,
          NotaIA: entry.NotaIA ?? null, FechaCreacion: entry.FechaCreacion,
        })
      }
    }
  })()
}
