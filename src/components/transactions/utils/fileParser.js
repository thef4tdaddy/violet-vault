export const parseCSV = (csvText) => {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

  return lines.slice(1).map((line, index) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    const row = {};
    headers.forEach((header, i) => {
      row[header] = values[i] || "";
    });
    row._index = index;
    return row;
  });
};

export const parseOFX = (ofxText) => {
  const transactions = [];
  const stmtTrnRegex = /<STMTTRN>(.*?)<\/STMTTRN>/gs;
  const matches = ofxText.match(stmtTrnRegex);

  if (matches) {
    matches.forEach((match, index) => {
      const transaction = { _index: index };

      const fields = {
        TRNTYPE: "type",
        DTPOSTED: "date",
        TRNAMT: "amount",
        FITID: "id",
        NAME: "description",
        MEMO: "notes",
      };

      Object.entries(fields).forEach(([ofxField, ourField]) => {
        const regex = new RegExp(`<${ofxField}>(.*?)</${ofxField}>`, "i");
        const fieldMatch = match.match(regex);
        if (fieldMatch) {
          transaction[ourField] = fieldMatch[1].trim();
        }
      });

      if (transaction.date && transaction.date.length >= 8) {
        const dateStr = transaction.date;
        transaction.date = `${dateStr.slice(0, 4)}-${dateStr.slice(
          4,
          6
        )}-${dateStr.slice(6, 8)}`;
      }

      transactions.push(transaction);
    });
  }

  return transactions;
};

export const autoDetectFieldMapping = (data) => {
  const headers = Object.keys(data[0] || {});
  const mapping = {};

  headers.forEach((header) => {
    const lower = header.toLowerCase();
    if (lower.includes("date")) mapping.date = header;
    if (
      lower.includes("description") ||
      lower.includes("name") ||
      lower.includes("memo")
    )
      mapping.description = header;
    if (
      lower.includes("amount") ||
      lower.includes("debit") ||
      lower.includes("credit")
    )
      mapping.amount = header;
    if (lower.includes("category")) mapping.category = header;
  });

  return mapping;
};