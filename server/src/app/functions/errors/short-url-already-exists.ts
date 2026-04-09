export class ShortUrlAlreadyExists extends Error {
  constructor() {
    super('Este link encurtado já existe')
  }
}
