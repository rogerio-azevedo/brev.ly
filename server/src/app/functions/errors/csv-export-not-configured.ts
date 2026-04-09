export class CsvExportNotConfigured extends Error {
  constructor() {
    super(
      'Exportação CSV não configurada. Defina as variáveis de ambiente CLOUDFLARE_*.'
    )
  }
}
