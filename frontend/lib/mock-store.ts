import { promises as fs } from "fs"
import path from "path"
import { MOCK_DOCTORS, MOCK_PATIENTS, MOCK_RECORDS } from "@/lib/mock-data"

type MockPatient = (typeof MOCK_PATIENTS)[number]

const DATA_DIR = path.join(process.cwd(), ".data")
const PATIENTS_FILE = path.join(DATA_DIR, "mock-patients.json")

async function readSavedPatients(): Promise<MockPatient[]> {
  try {
    const content = await fs.readFile(PATIENTS_FILE, "utf8")
    return JSON.parse(content) as MockPatient[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return []
    throw error
  }
}

async function writeSavedPatients(patients: MockPatient[]) {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(PATIENTS_FILE, JSON.stringify(patients, null, 2), "utf8")
}

export async function getMockPatients() {
  const savedPatients = await readSavedPatients()

  return MOCK_PATIENTS.map(patient => {
    const savedPatient = savedPatients.find(p => p.IdPaciente === patient.IdPaciente)
    return savedPatient ? { ...patient, ...savedPatient } : patient
  })
}

export async function getMockPatient(id: number) {
  const patients = await getMockPatients()
  return patients.find(patient => patient.IdPaciente === id) ?? patients[0]
}

export async function updateMockPatient(
  id: number,
  data: {
    nombre: string
    edad: number
    sexo: string
    fechaNacimiento: string
    tipoSangre?: string | null
    email?: string | null
    telefono?: string | null
    ubicacion?: string | null
    seguro?: string | null
    contactoEmergencia?: string | null
    idDoctor?: number | null
  },
) {
  const patients = await getMockPatients()
  const patient = patients.find(p => p.IdPaciente === id)

  if (!patient) return null

  const idDoctor = data.idDoctor ?? patient.IdDoctor ?? null
  const doctor = MOCK_DOCTORS.find(d => d.IdDoctor === idDoctor)
  const updatedPatient = {
    ...patient,
    Nombre: data.nombre,
    Edad: data.edad,
    Sexo: data.sexo,
    FechaNacimiento: data.fechaNacimiento,
    TipoSangre: data.tipoSangre ?? "",
    Email: data.email ?? "",
    Telefono: data.telefono ?? "",
    Ubicacion: data.ubicacion ?? "",
    Seguro: data.seguro ?? "",
    ContactoEmergencia: data.contactoEmergencia ?? "",
    IdDoctor: idDoctor,
    NombreDoctor: doctor?.Nombre ?? patient.NombreDoctor,
    FechaActualizacion: new Date().toISOString(),
  }

  const savedPatients = patients.map(p => p.IdPaciente === id ? updatedPatient : p)
  await writeSavedPatients(savedPatients)

  const record = MOCK_RECORDS[id]
  if (record) record.patient = updatedPatient

  return updatedPatient
}
