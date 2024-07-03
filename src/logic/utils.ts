const PUBLIC_URL = process.env.PUBLIC_URL + "/";

export const getPublicUrl = (path: string) => {
  return `${PUBLIC_URL}${path}`;
};
