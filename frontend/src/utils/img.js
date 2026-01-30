export const buildImgUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `http://127.0.0.1:8000${path}`;
};
