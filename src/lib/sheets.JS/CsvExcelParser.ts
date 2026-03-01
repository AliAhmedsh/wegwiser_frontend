import * as XLSX from 'xlsx';

export async function csvExcelParser(
  file: File
): Promise<Record<string, string | number | boolean | null>[]> {
  const arrayBuffer = await file.arrayBuffer();

  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const jsonData = XLSX.utils.sheet_to_json<
    Record<string, string | number | boolean | null>
  >(sheet, {
    defval: null,
  });

  return jsonData;
}
