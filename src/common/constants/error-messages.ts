export const ErrorMessages = {
  auth: {
    INVALID_CREDENTIALS: 'Invalid credentials',
    EMAIL_OR_USERNAME_TAKEN: 'Email or username already in use',
  },
  users: {
    NOT_FOUND: 'User not found',
    FORBIDDEN_PROFILE: 'You can only modify your own profile',
    FORBIDDEN_ROLE: 'Only admins can change roles',
  },
  lists: {
    NOT_FOUND: 'List not found',
    FORBIDDEN: 'You can only modify your own lists',
  },
  cards: {
    NOT_FOUND: 'Card not found',
    FORBIDDEN: 'You can only modify cards in your own lists',
  },
} as const;