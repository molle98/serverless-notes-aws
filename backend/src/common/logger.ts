export const logInfo = (message: string, context?: unknown) => {
  console.log(
    JSON.stringify({
      level: "info",
      message,
      context,
    }),
  );
};

export const logError = (message: string, error?: unknown) => {
  console.error(
    JSON.stringify({
      level: "error",
      message,
      error,
    }),
  );
};
