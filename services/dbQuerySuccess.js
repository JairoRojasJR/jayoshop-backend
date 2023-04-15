const verifyAcknowledged = (data, action) => {
  const { acknowledged } = data.dbRes
  const { target, _id } = data
  const error = `BBDD: Error inesperado al ${action} ${target} con id: ${_id}`
  if (!acknowledged) throw new Error(error)
}

const verifyRecordsModified = (data, count) => {
  const { target, _id } = data
  if (count > 0) return
  throw new Error(`BBDD: Operación sin efectos en ${target} con id: ${_id}`)
}

// Functions to export
const queryUpdateSuccess = data => {
  const { modifiedCount } = data.dbRes
  verifyAcknowledged(data, 'actualizar')
  verifyRecordsModified(data, modifiedCount)
}

const queryDeleteSuccess = data => {
  const { deletedCount } = data.dbRes
  verifyAcknowledged(data, 'eliminar')
  verifyRecordsModified(data, deletedCount)
}

module.exports = { queryUpdateSuccess, queryDeleteSuccess }
