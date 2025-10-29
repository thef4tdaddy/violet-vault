# Hook-level Validation Patterns

**Part of Issue #987 - Comprehensive Zod Schema Implementation (Phase 3)**

This directory contains standardized validation utilities for form hooks, providing a consistent pattern for form state management, validation, and error handling across the application.

## Overview

The validation pattern provides:

- ✅ Consistent form state management
- ✅ Automatic Zod schema validation
- ✅ Type-safe form data with TypeScript
- ✅ Built-in error handling and display
- ✅ Dirty state tracking
- ✅ Submission state management
- ✅ Reusable validation utilities

## Core Components

### `useValidatedForm` Hook

The main hook for creating validated forms. Handles all form state, validation, and submission logic.

```typescript
import { useValidatedForm } from "@/hooks/common/validation";
import { z } from "zod";

// Define your schema
const MyFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().min(0, "Age must be positive"),
});

// Use in your hook
function useMyForm() {
  const form = useValidatedForm({
    schema: MyFormSchema,
    initialData: { name: "", email: "", age: 0 },
    onSubmit: async (data) => {
      // Handle submission
      await saveData(data);
    },
    validateOnChange: true, // Optional: validate as user types
  });

  return form;
}
```

### Validation Helper Functions

#### `validateWithSchema<T>`

Validates data against a Zod schema and returns structured errors.

```typescript
import { validateWithSchema } from "@/hooks/common/validation";

const result = validateWithSchema(MySchema, formData);
if (!result.success) {
  console.log(result.errors); // { name: 'Name is required', ... }
}
```

#### `mergeErrors<T>`

Merges validation errors.

```typescript
import { mergeErrors } from "@/hooks/common/validation";

const allErrors = mergeErrors(existingErrors, newErrors);
```

#### `removeErrors<T>`

Removes specific field errors.

```typescript
import { removeErrors } from "@/hooks/common/validation";

const updatedErrors = removeErrors(errors, ["email", "age"]);
```

#### `hasErrors<T>`

Checks if any errors exist.

```typescript
import { hasErrors } from "@/hooks/common/validation";

if (hasErrors(errors)) {
  console.log("Form has errors");
}
```

#### `getErrorMessages<T>`

Gets all error messages as an array.

```typescript
import { getErrorMessages } from "@/hooks/common/validation";

const messages = getErrorMessages(errors);
// ['Name is required', 'Invalid email', ...]
```

### TypeScript Types

All validation types are exported from `validationTypes.ts`:

```typescript
import type {
  ValidationErrors,
  ValidationResult,
  ValidatedFormState,
  UseValidatedFormOptions,
  UseValidatedFormReturn,
} from "@/hooks/common/validation";
```

## Usage Example

### Basic Form Hook

```typescript
import { useValidatedForm } from "@/hooks/common/validation";
import { z } from "zod";

const UserFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18 or older"),
});

export function useUserForm(user?: User) {
  const form = useValidatedForm({
    schema: UserFormSchema,
    initialData: {
      name: user?.name || "",
      email: user?.email || "",
      age: user?.age || 18,
    },
    onSubmit: async (data) => {
      if (user) {
        await updateUser(user.id, data);
      } else {
        await createUser(data);
      }
    },
    validateOnChange: false, // Validate only on submit
  });

  return {
    ...form,
    isEditMode: !!user,
  };
}
```

### Using in a Component

```typescript
function UserForm({ user, onClose }) {
  const form = useUserForm(user);

  return (
    <form onSubmit={form.handleSubmit}>
      <div>
        <input
          value={form.data.name}
          onChange={(e) => form.updateField('name', e.target.value)}
        />
        {form.hasError('name') && (
          <span className="error">{form.getFieldError('name')}</span>
        )}
      </div>

      <div>
        <input
          type="email"
          value={form.data.email}
          onChange={(e) => form.updateField('email', e.target.value)}
        />
        {form.hasError('email') && (
          <span className="error">{form.getFieldError('email')}</span>
        )}
      </div>

      <button type="submit" disabled={!form.isValid || form.isSubmitting}>
        {form.isSubmitting ? 'Saving...' : 'Save'}
      </button>

      {form.isDirty && (
        <button type="button" onClick={form.resetForm}>
          Reset
        </button>
      )}
    </form>
  );
}
```

## API Reference

### `useValidatedForm` Return Values

| Property         | Type                             | Description                         |
| ---------------- | -------------------------------- | ----------------------------------- |
| `data`           | `T`                              | Current form data                   |
| `errors`         | `ValidationErrors<T>`            | Current validation errors           |
| `isDirty`        | `boolean`                        | Has form changed from initial state |
| `isSubmitting`   | `boolean`                        | Is form currently submitting        |
| `isValid`        | `boolean`                        | Are there any validation errors     |
| `updateField`    | `(field, value) => void`         | Update a single field               |
| `updateFormData` | `(updates) => void`              | Update multiple fields              |
| `setErrors`      | `(errors) => void`               | Set validation errors               |
| `clearErrors`    | `() => void`                     | Clear all errors                    |
| `clearError`     | `(field) => void`                | Clear a specific field error        |
| `validate`       | `() => ValidationResult<T>`      | Manually validate form              |
| `resetForm`      | `() => void`                     | Reset to initial state              |
| `handleSubmit`   | `(e?) => Promise<void>`          | Submit with validation              |
| `setFieldError`  | `(field, error) => void`         | Set a field error                   |
| `getFieldError`  | `(field) => string \| undefined` | Get a field error                   |
| `hasError`       | `(field) => boolean`             | Check if field has error            |

## Migration Guide

### Before (Old Pattern)

```typescript
export function useOldForm() {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email.includes("@")) newErrors.email = "Invalid email";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await saveData(formData);
    } catch (error) {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return { formData, setFormData, errors, isSubmitting, handleSubmit };
}
```

### After (New Pattern)

```typescript
const FormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

export function useNewForm() {
  return useValidatedForm({
    schema: FormSchema,
    initialData,
    onSubmit: async (data) => {
      await saveData(data);
    },
  });
}
```

## Benefits

1. **Consistency**: All forms use the same validation pattern
2. **Less Code**: Reduced boilerplate for form state management
3. **Type Safety**: Full TypeScript support with Zod inference
4. **Better DX**: Easier to understand and maintain
5. **Reusability**: Common validation logic in one place
6. **Testing**: Easier to test with standardized API

## Testing

The validation utilities include comprehensive test coverage:

```bash
npm run test:run -- src/hooks/common/validation/__tests__/
```

## Examples

See `/src/hooks/bills/useBillFormValidated.ts` for a complete example of migrating an existing form hook to use the validation pattern.

## Best Practices

1. **Define schemas in `/src/domain/schemas/`** - Keep schemas centralized
2. **Use `validateOnChange` sparingly** - Only for critical fields
3. **Handle submission errors** - Wrap `onSubmit` in try-catch
4. **Clear errors on field update** - Errors are automatically cleared
5. **Validate before complex operations** - Use `form.validate()` manually when needed

## Future Enhancements

- [ ] Add support for async validation
- [ ] Add field-level validation on blur
- [ ] Add validation debouncing for expensive checks
- [ ] Add form submission retry logic
- [ ] Add integration with React Hook Form (if needed)

## Support

For questions or issues, please refer to:

- Issue #987: Comprehensive Zod Schema Implementation
- `/src/domain/schemas/` - For schema examples
- `/src/hooks/common/validation/__tests__/` - For usage examples
