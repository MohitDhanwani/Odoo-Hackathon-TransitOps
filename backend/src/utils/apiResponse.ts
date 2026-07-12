export const successResponse = (data: any = null) => {
  return {
    success: true,
    data,
  };
};

export const errorResponse = (message: string, code?: string) => {
  const res: any = {
    success: false,
    message,
  };
  if (code) {
    res.code = code;
  }
  return res;
};
