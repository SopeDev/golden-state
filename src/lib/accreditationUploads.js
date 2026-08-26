export const MAX_ACCREDITATION_FILE_BYTES = 4 * 1024 * 1024
export const MAX_ACCREDITATION_UPLOAD_BYTES = 4 * 1024 * 1024
export const MAX_ACCREDITATION_UPLOAD_MB = 4

export function getAccreditationUploadSize(files) {
  return files.reduce((total, file) => total + (file?.size || 0), 0)
}
