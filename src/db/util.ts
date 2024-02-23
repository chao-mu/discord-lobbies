export const timestampsDefaults = () => {
  const now = new Date();
  return {
    createdAt: now,
    updatedAt: now,
  };
};
