import nunjucks from "nunjucks";
import path from "path";

const templateDir = path.join(__dirname, "../../templates");
nunjucks.configure(templateDir, { autoescape: true });

export function renderTemplate(name: string, variables: Record<string, any>) {
  return nunjucks.render(`${name}.njk`, variables);
}