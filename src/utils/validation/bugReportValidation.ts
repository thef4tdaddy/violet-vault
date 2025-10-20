/**
 * Validates bug report form data
 */
export const validateBugReportForm = (
  title: string,
  description: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!title.trim() && !description.trim()) {
    errors.push("Either title or description is required");
  }

  if (title.length > 200) {
    errors.push("Title is too long (max 200 characters)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
