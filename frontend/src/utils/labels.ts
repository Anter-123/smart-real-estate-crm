export const getRoleLabel = (role: string, t: (key: string) => string) => {
  if (role === "ADMIN") return t("admin");
  if (role === "MANAGER") return t("manager");
  if (role === "AGENT") return t("agent");
  return role;
};

export const getFinishingLabel = (f: string, t: (key: string) => string) => {
  if (f === "SUPER_LUX") return t("superLux");
  if (f === "ULTRA_LUX") return t("ultraLux");
  if (f === "SEMI_FINISHED") return t("semiFinished");
  if (f === "UNFINISHED") return t("unfinished");
  return f;
};
